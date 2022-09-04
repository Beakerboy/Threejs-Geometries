import {
  BufferGeometry,
  Vector2,
  Shape,
  ShapeGeometry,
  ShapeUtils,
  BufferAttribute,
} from 'three';

/**
 * Modify ExtrudeGeometry such that z varies with x and y
 */
class RoundedGeometry extends BufferGeometry {
  constructor(shape = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {}) {
    super();

    this.type = 'WedgeGeometry';

    this.parameters = {
      shape: shape,
      options: options,
    };

    // The max depth of the geometry
    var depth = options.depth;

    // The number of dividing segments to split the shape into.
    const segments = options.segments;

    // The direction that the downward slope faces.
    const angle = options.angle;

    // Get the outer shape and holes.
    var points = shape.extractPoints().shape;
    var holes = shape.extractPoints().holes;

    // The outer shape is the original shape plus any crossing points.
    const outerShape = new Shape();

    // A straight array of vertices for the outer shape
    const outerVertices = [];

    // Ensuse all paths are in the correct direction for the normals
    const reverse = ! ShapeUtils.isClockWise( points );
    if ( reverse ) {
      points = points.reverse();
      // Check that any holes are correct direction.
      for (let h = 0; h < holes.length; h++) {
        const hole = holes[h];
        if (THREE.ShapeUtils.isClockWise(hole)) {
          holes[h] = hole.reverse();
        }
      }
    }
    // The original shape's points, but rotated and centered.
    const newPoints = [];

    var point;
    var minY;
    var maxY;
    for (let i = 0; i < points.length; i++) {
      point = points[i];
      const moved = this.move(point);
      if (i === 0) {
        minY = moved[1];
        maxY = moved[1];
      } else {
        minY = Math.min(minY, moved[1]);
        maxY = Math.max(maxY, moved[1]);
      }
      newPoints.push(moved);
    }
    const extents = this.extents(newPoints);
    const diff = (extents[3] - extents[1]) / (segments + 1);
    for (let i = 0; i < segments; i++) {
      crossing = extents[1] + diff * (i + 1);
      newShapes = this.splitShape(newPoints, crossing);
    }

    const positions = [];
    // If the line does not intersect, display the outline.
    // otherwise just the parts.
    const startK = newShapes.length > 1 ? 1 : 0;
    for (let k = startK; k < newShapes.length; k++) {
      points = newShapes[k].extractPoints().shape;
      // Add top of roof
      const faces = ShapeUtils.triangulateShape(points, holes);
      for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        for (let j = 0; j < 3; j++) {
          const unmoved = this.unMove([points[face[j]].x, points[face[j]].y]);
          const x = unmoved[0];
          const y = unmoved[1];
          var z;
          if (points[face[j]].y >= 0) {
            z = depth - depth / maxY * points[face[j]].y;
          } else {
            z = depth - depth / minY * points[face[j]].y;
          }
          //const z = (x * Math.sin(angle) - y * Math.cos(angle) - minDepth) * scale;
          positions.push(x, y, z);
        }
      }
    }
    // Build the floor
    points = newShapes[0].extractPoints().shape;
    const faces = ShapeUtils.triangulateShape(points, holes);
    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      for (let j = 0; j < 3; j++) {
        const unmoved = this.unMove([points[face[j]].x, points[face[j]].y]);
        const x = unmoved[0];
        const y = unmoved[1];
        positions.push(x, y, 0);
      }
    }

    // make walls by iterating the outline.
    points = newShapes[0].extractPoints().shape;
    for (let i = 0; i < points.length; i++) {
      var point = points[i];
      var pointZ;
      if (point.y >= 0) {
        pointZ = depth - depth / maxY * point.y;
      } else {
        pointZ = depth - depth / minY * point.y;
      }
      var nextPoint;
      if (i === points.length - 1) {
        nextPoint = points[0];
      } else {
        nextPoint = points[i + 1];
      }
      var nextPointZ;
      if (nextPoint.y >= 0) {
        nextPointZ = depth - depth / maxY * nextPoint.y;
      } else {
        nextPointZ = depth - depth / minY * nextPoint.y;
      }
      positions.push(...this.unMove([point.x, point.y]), 0);
      positions.push(...this.unMove([point.x, point.y]), pointZ);
      positions.push(...this.unMove([nextPoint.x, nextPoint.y]), 0);
      positions.push(...this.unMove([point.x, point.y]), pointZ);
      positions.push(...this.unMove([nextPoint.x, nextPoint.y]), nextPointZ);
      positions.push(...this.unMove([nextPoint.x, nextPoint.y]), 0);
    }
    this.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    this.computeVertexNormals();
  }

  /**
   * Split a shape using a specified y-value as the split line. Shape is clockwise.
   * Not tested on self-intersecting shapes.
   *
   * @param {[Shape]} shapes - an array of THREE.Shape. Element 0 is an outline to which crossing points are to be added. The remainder are to be split into separate shapes.
   * @param {number} yValue - Horizontal crossing line to use to divide he shape.
   * @return {[Shape]} an array of shapes. Element 0 is the original shape with
   *                   the addition of new vertices for the crossing points.
   */
  splitShape(shapes, yValue = 0) {
    const outline = shapes.shift();
    // An associative array of all the values where the shape crosses the y-value keyed by segment number.
    const crossings = [];

    // The new outline with the addition of any crossing points.
    const newOutline = new Shape();

    // Walk the shape and find all crossings.
    var point = [];
    var nextPoint = [];
    var prevPoint = points[points.length - 1];
    for (let i = 0; i < points.length - 1; i++) {
      point = points[i];
      if (i === 0) {
        newOutline.moveTo(point[0], point[1]);
      } else {
        newOutline.lineTo(point[0], point[1]);
      }
      nextPoint = points[i + 1];
      const pointOnLine = (point[1] === yValue);
      const sameSides = ((prevPoint[1] > yValue) === (nextPoint[1] > yValue));
      const switchesSides = ((point[1] > yValue) !== (nextPoint[1] > yValue));
      if ((pointOnLine && !sameSides) || switchesSides) {
        var crossing;
        if (pointOnLine) {
          crossing = point[0];
        } else {
          var m = (nextPoint[1] - point[1]) / (nextPoint[0] - point[0]);
          var crossing = point[0] - point[1] / m;
        }
        crossings[i] = crossing;
        if (!pointOnLine) {
          newOutline.lineTo(crossing, yValue);
        }
      }
      prevPoint = point;
    }
    newOutline.lineTo(nextPoint[0], nextPoint[1]);
    if (Object.keys(crossings).length === 0) {
      return [newOutline];
    }

    // Sort crossings and save the crossing number.
    var sortedCrossings = [];
    for (const key in crossings) {
      sortedCrossings.push(crossings[key]);
    }
    // Sort numerically.
    sortedCrossings.sort(function(a, b){
      return a-b;
    });
    for (var key in crossings) {
      const value = crossings[key];
      crossings[key] = {
        value: value,
        number: sortedCrossings.indexOf(value),
      };
    }
    // Walk the shape and assemble pieces from matched crossings.
    const newShapes = [];
    // A list of crossing numbers that will close each shape in activeShapes.
    const pendingCrossbacks = [];
    const activeShapes = [];
    // The crossing number that will close the current shape.
    var activeCrossing = -1;
    var currentShape = new Shape();
    for (let i = 0; i < points.length; i++) {
      point = points[i];
      if (i === 0) {
        currentShape.moveTo(point[0], point[1]);
      } else {
        currentShape.lineTo(point[0], point[1]);
      }
      if (i in crossings) {
        crossing = crossings[i];
        if (crossing.value !== point[0]) {
          currentShape.lineTo(crossing.value, yValue);
        }
        // If we can finalize the current shape.
        if (crossing.number === activeCrossing) {
          newShapes.push(currentShape);
          currentShape = activeShapes.pop();
          activeCrossing = pendingCrossbacks.pop();
          currentShape.lineTo(crossing.value, yValue);
        } else {
          activeShapes.push(currentShape);
          pendingCrossbacks.push(activeCrossing);
          currentShape = new Shape();
          // crossing number is zero indexed.
          // If it is even, it closes at the next nuber, odd closes at the previous value.
          // 0=>1, 1=>0, 5=>4
          activeCrossing = crossing.number + 2 * ((crossing.number + 1) % 2) - 1;
          currentShape.moveTo(crossing.value, yValue);
        }
      }
    }
    newShapes.push(currentShape);
    return newShapes;
  }

  /**
   *
   */
  move(point) {
    const angle = this.parameters.options.angle;
    const pointX = point.x * Math.cos(angle) - point.y * Math.sin(angle);
    const pointY = point.x * Math.sin(angle) + point.y * Math.cos(angle);
    return [pointX, pointY];
  }

  /**
   *
   */
  unMove(point) {
    const angle = this.parameters.options.angle;
    const pointX = point[0] * Math.cos(angle) + point[1] * Math.sin(angle);
    const pointY = -1 * point[0] * Math.sin(angle) + point[1] * Math.cos(angle);
    return [pointX, pointY];
  }
}
export { RoundedGeometry };