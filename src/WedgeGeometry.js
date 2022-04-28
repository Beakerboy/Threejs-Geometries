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
    const center = options.center;

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
    const vertices = [];
    var shapeNum = -1;
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
    const firstShape = [];
    for (let i = 0; i < newPoints.length - 1; i++) {
      point = newPoints[i];
      nextPoint = newPoints[i + 1];
      // If there is a crossi.g event
      if (point[1] === 0 || (point[1] > 0 !== nextPoint[1] > 0)) {
        if (point[1] === 0) {
          crossingPoint = point;
        } else {
          var m = (nextPoint[1] - point[1]) / (nextPoint[0] - point[0]);
          var root = point[0] - point[1] / m;
          // If the edge crosses the x axis between this and the next vertex.
          crossingPoint = [root, 0];
        }
        if (activeShape) {
          activeShape.lineTo(crossingPoint[0], crossingPoint[1]);
          activeShape.lineTo(openingPoint[0], openingPoint[1]);
          newShapes.push(activeShape);
        } else {
          firstShape.push(crossingPoint);
        }
        activeShape = new Shape();
        // add point to new shape
        activeShape.moveTo(crossingPoint[0], crossingPoint[1]);
        shapeNum++;
        vertices[shapeNum] = [];
        vertices[shapeNum].push(crossingPoint[0], crossingPoint[1]);
        
        openingPoint = crossingPoint;
      }
      if (activeShape) {
        activeShape.lineTo(point[0], point[1]);
        vertices[shapeNum].push(point[0], point[1]);
      } else {
        // place the opening points in an array to fininsh the final piece.
        firstShape.push(point);
      } 
    }
    // add any opening points to the final shape.
    for (let i = 0; i < firstShape.length; i++) {
      point = firstShape[i];
      if (!activeShape) {
        activeShape = new Shape();
        activeShape.moveTo(point[0], point[1]);
        shapeNum++;
        vertices[shapeNum] = [];
        vertices[shapeNum].push(point[0], point[1]);
      } else {
        activeShape.lineTo(point[0], point[1]);
        vertices[shapeNum].push(point[0], point[1]);
      }
    }
    newShapes.push(activeShape);
    const positions = [];
    for (let k = 0; k < newShapes.length; k++) {
      points = newShapes[k];
      // Add top of roof
      const faces = ShapeUtils.triangulateShape(points, holes);
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
    console.log(positions);
    this.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    this.computeVertexNormals();
  }
}
export { WedgeGeometry };
