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
class WedgeGeometry extends BufferGeometry {
  constructor(shape = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {}) {
    super();

    this.type = 'WedgeGeometry';

    this.parameters = {
      shape: shape,
      options: options,
    };

    // The max depth of the geometry
    var depth = options.depth;

    // a point on which the peak will pass through
    const center = options.center;

    // The direction that the downward slope faces,
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
    // The original shape's point, but roated and centered.
    const newPoints = [];

    // An array of arrays. Each array contaions the vertices of the coresponding shape.
    const vertices = [];
    var shapeNum = -1;

    var point;
    for (let i = 0; i < points.length; i++) {
      point = points[i];
      newPoints.push(...this.move(point));
    }

    const newShapes = this.splitShape(newPoints);

    const positions = [];
    for (let k = 0; k < newShapes.length; k++) {
      points = newShapes[k];
      // Add top of roof
      const faces = ShapeUtils.triangulateShape(points.extractPoints().shape, holes);
      for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        for (let j = 0; j < 3; j++) {
          const x = vertices[k][2 * face[j]];
          const y = vertices[k][2 * face[j] + 1];
          const z = 0;
          //const z = (x * Math.sin(angle) - y * Math.cos(angle) - minDepth) * scale;
          positions.push(x, y, z);
        }
      }
    }
    this.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    this.computeVertexNormals();
  }

  /**
   * Split a shape using the x-axis as the line. Shape is clockwise.
   * Not tested on self-intersecting shapes.
   *
   * @param {[[number, number]]} points - an array of x, y pairs.
   * @return {[Shape]} an array of shapes. Element 0 is the original shape with
   *                   the addition of new vertices for the crossing points.
   */
  splitShape(points) {
    // An associative array of all the values where the shape crosses the x axis, keys by segment number.
    const crossings = [];

    // A list of any times the intersection is a tangent.
    const tangents = [];

    // The new outline with the addition of any crossing points.
    const newOutline = Shape();

    // Remove duplicated beginning and end point?
    if (points[0][0] === points[points.length - 1][0] && points[0][1] === points[points.length][1]) {
      points.pop();
    }
    // Walk the shape and find all crossings.
    var point = [];
    var nextPoint = [];
    var prevPoint = points[points.length - 1];
    for (let i = 0; i < points.length - 1; i++) {
      point = points[i];
      if (i === 0) {
        newOutline.moveTo();
      } else {
        newOutline.lineTo();
      }
      nextPoint = points[i + 1];
      const pointOnLine = point[1] === 0;
      const sameSides = prevPoint[1] > 0 === nextPoint[1] > 0;
      const switchesSides = point[1] > 0 !== nextPoint[1] > 0;
      if (pointOnLine && !sameSides || switchesSides) {
        var crossing;
        if (pointOnLine) {
          crossing = point[0];
        } else {
          var m = (nextPoint[1] - point[1]) / (nextPoint[0] - point[0]);
          var crossing = point[0] - point[1] / m;
        }
        crossings[i] = crossing;
        if (!pointOnLine) {
          newOutline.lineTo(crossing, 0);
        }
      }
    }
    if (Object.keys(crossings).length === 0) {
      return [points];
    }

    // Sort crossings and save the crossing number.
    var sortedCrossings = [];
    for (const key in crossings) {
      sortedCrossings.push(crossings[key]);
    }
    sortedCrossings.sort();
    for (let i = 0; i < crossings.length; i++) {
      const value = crossings[i];
      crossings[i] = {
        value: value,
        number: sortedCrossings.indexOf(value),
      };
    }

    // Walk the shape and assemble pieces from matched crossings.
    const shapes = [];
    const pendingCrossbacks = [];
    const activeShapes = [];
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
          currentShape.lineTo(crossing.value, 0);
        }
        // If we can finalize the current shape.
        if (crossing.number === activeCrossing) {
          shapes.push(currentShape);
        } else {
          activeShapes.push(currentShape);
          pendingCrossbacks.push(currentCrossback);
          currentShape = new Shape();
          activeCrossing = crossing.number - 2 * (crossing.number % 2);
          currentShape.moveTo(crossing.value, 0);
        }
      }
    }
    return shapes;
  }

  /**
   *
   */
  move(point) {
    const angle = this.parameters.options.angle;
    const center = this.parameters.options.center;
    const pointX = (point[0] - center[0]) * Math.cos(angle) - (point[1] - center[1]) * Math.sin(angle);
    const pointY = (point[0] - center[0]) * Math.sin(angle) + (point[1] - center[1]) * Math.cos(angle);
    return [pointX, pointY];
  }

  /**
   *
   */
  unMove(point) {
    const angle = this.parameters.options.angle;
    const center = this.parameters.options.center;
    const pointX = point[0] * Math.cos(angle) + point[1] * Math.sin(angle) + center[0];
    const pointY = -1 * point[0] * Math.sin(angle) + point[1] * Math.cos(angle) + center[1];
    return [pointX, pointY];
  }
}
export { WedgeGeometry };
