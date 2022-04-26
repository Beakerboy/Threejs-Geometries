import {
	BufferGeometry,
	Vector2,
	Shape,
        ShapeGeometry,
	ShapeUtils,
	BufferAttribute
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
    var centerr;

    // The direction that the downward slope faces,
    const angle = options.angle;

    // Get the outer shape and holes.
    var points = shape.extractPoints().shape;
    var holes = shape.extractPoints().holes;

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
    const newPoints = [];
    var point;
    var newX;
    var newY;
    for (let i = 0; i < points.length; i++) {
      point = points[i];
      newX = (point.x - center[0]) * Math.cos(angle) - (point.y - center[1]) * Math.sin(angle);
      newY = (point.x - center[0]) * Math.sin(angle) + (point.y - center[1]) * Math.cos(angle);
      newPoints.push([newX, newY]);
    }

    // iterate along newPoints to find where it crosses the x-axis.
    var nextPoint;
    var crossingPoint;
    var activeShape = false;
    var openingPoint;
    const newShapes = [];
    for (let i = 0; i < newPoints.length - 1; i++) {
      point = newPoints[i];
      nextPoint = newPoints[i + 1];
      var m;
      var root;
      if (point[1] === 0) {
        crossingPoint = point;
      } else if (point[1] > 0 !== nextPoint[1] > 0) {
        // if the edge crosses the x axis between this and
        // the next vertex.
        m = (nextPoint[1] - point[1]) / (nextPoint[0] - point[0]);
        root = point[0] - point[1] / m;
        crossingPoint = [root, 0];
      }
      // add point to existing shape
      // and close existing shape
      if (activeShape) {
        activeShape.push(crossingPoint);
        activeShape.push(openingPoint);
        newShapes.push(activeShape);
        activeShape = false;
      }
      // add point to new shape
      activeShape.push(crossingPoint);
      openingPoint = crossingPoint;
    }
    for (let k = 0; k < newShapes.length; k++) {
      const holes = [];
      points = newShapes[k];
      // Add top of roof
      const faces = ShapeUtils.triangulateShape(points, holes);
      for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        for (let j = 0; j < 3; j++) {
          const x = vertices[2 * face[j]];
          const y = vertices[2 * face[j] + 1];
          const z = 0;
          //const z = (x * Math.sin(angle) - y * Math.cos(angle) - minDepth) * scale;
          positions.push(x, y, z);
        }
      }
    }
    const shapeGeo = new ShapeGeometry(newShapes);
    this.setAttribute('position', shapeGeo.getAttribute('position'));
    //this.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    // ToDo - add points correctly so only one face needs to be rendered.
    this.computeVertexNormals();

    // Divide that distance in half and find all outer and inner lines which cross
    // a line perpendicular to the given angle.
    // Create new shapes that are divided by the line, triangularize.
  }
}
export { WedgeGeometry };
