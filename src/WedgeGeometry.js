import {
	BufferGeometry,
	Vector2,
	Shape,
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
    const center

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
    // Divide that distance in half and find all outer and inner lines which cross
    // a line perpendicular to the given angle.
    // Create new shapes that are divided by the line, triangularize.
  }
}
export { WedgeGeometry };
