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
class HippedGeometry extends BufferGeometry {
  constructor(shape = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {}) {
    super();

    this.type = 'HippedGeometry';

    this.parameters = {
      shape: shape,
      options: options,
    };

    // The max depth of the geometry
    var depth = options.depth;

    // The max depth of the geometry
    var pitch = options.pitch;

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

    const newShapes = this.splitShape(newPoints);

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
    // Todo make wal1s by iterating the outline.
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
   * Given a shape and two points, calculate the point where the bisectors of
   * the two corners intersect.
   *
   * @param {[[number, number]]} points - an array of x, y pairs.
   * @param {integer} point1 - the index in points of the first corner.
   * @param {integer} point1 - the index in points of the first corner.
   * @return {[number, number]} the coordinates of the intersecting point.
   */
  findIntersectingBisectors(points, point1, point2) {
    var P1 = points[point1];
    var point1_plus = getNextPoint(points, point1);
    var A1 = calculateAngle(points, point1);
    var m1 = Math.tan(A1 / 2 - calculateAngle(points, point1, point1_plus));
    var b1 = P1.y - m1 * P1.x;

    var P2 = points[point2];
    var point2_plus = getNextPoint(points, point2);
    var A2 = calculateAngle(points, point2);
    var m2 = Math.tan(A2 / 2 - calculateAngle(points, point2, point2_plus));
    var b2 = P2.y - m2 * P2.x;

    var x = (b1 - b2) / (m2 - m1);
    var y = m1 * x + b1;
    return [x, y];
  }

  getNextPoint(points, point) {
    if (point == points.length - 1) {
      return 0;
    } else {
      return point + 1;
    }
  }

  getPreviousPoint(points, point) {
    if (point == 0) {
      return points.length - 1;
    } else {
      return point - 1;
    }
  }

  /**
   * Calculate the angle between two points
   */
  calculateAngle(points, point1, point2) {
    var P1 = points[point1];
    var P2 = points[point2];
    return Math.atan2(P2.y - P1.y, P2.x - P1.x);
  }
  
  /**
   * Calculate the angle formed between two edges of a shape at a given point.
   */
  calculateVertexAngle(points, vertex) {
    return calculateAngle(points, vertex, getPreviousPoint(points, vertex)) - calculateAngle(points, vertex, getNextPoint(points, vertex));
  }
}
export { HippedGeometry };
