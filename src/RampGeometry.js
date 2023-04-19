import {
	BufferGeometry,
	Vector2,
	Shape,
	ShapeUtils,
	BufferAttribute,
} from 'three';

/**
 * Modify ExtrudeGeometry such that z varies with x and y
 */
class RampGeometry extends BufferGeometry {

	constructor( shape = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {} ) {

		super();
		this.type = 'RampGeometry';

		this.parameters = {

			shape: shape,
			options: options,

		};

		// The max depth of the geometry
		var depth = options.depth;

		// If depth is not specified, the angle of the ramp.
		const pitch = options.pitch;

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
			for ( let h = 0; h < holes.length; h ++ ) {

				const hole = holes[ h ];
				if ( ShapeUtils.isClockWise( hole ) ) {

					holes[ h ] = hole.reverse();

				}

			}

		}

		var rampDepth;
		var nextRampDepth;
		var minDepth;
		var maxDepth;
		var positions = [];
		var point;
		var nextPoint;
		const vertices = [];
		// Add the outer wall.
		for ( let i = 0; i < points.length - 1; i ++ ) {

			point = points[ i ];
			vertices.push( point.x, point.y );
			nextPoint = points[ i + 1 ];
			positions.push( point.x, point.y, 0 );
			rampDepth = point.x * Math.sin( angle ) - point.y * Math.cos( angle );
			nextRampDepth = nextPoint.x * Math.sin( angle ) - nextPoint.y * Math.cos( angle );
			if ( i === 0 ) {

				minDepth = rampDepth;
				maxDepth = rampDepth;

			} else {

				minDepth = Math.min( rampDepth, minDepth );
				maxDepth = Math.max( rampDepth, maxDepth );

			}

			positions.push( point.x, point.y, rampDepth );
			positions.push( nextPoint.x, nextPoint.y, 0 );
			positions.push( point.x, point.y, rampDepth );
			positions.push( nextPoint.x, nextPoint.y, nextRampDepth );
			positions.push( nextPoint.x, nextPoint.y, 0 );

		}

		// The highest and lowest points will be along the outside
		// Calculate the scaling factor to get he correct height.
		if ( ! depth ) {

			depth = ( maxDepth - minDepth ) * Math.tan( pitch );

		}

		const scale = depth / ( maxDepth - minDepth );
		for ( let i = 0; i < points.length - 1; i ++ ) {

			positions[ 18 * i + 5 ] = ( positions[ 18 * i + 5 ] - minDepth ) * scale;
			positions[ 18 * i + 11 ] = ( positions[ 18 * i + 11 ] - minDepth ) * scale;
			positions[ 18 * i + 14 ] = ( positions[ 18 * i + 14 ] - minDepth ) * scale;

		}

		// Add the sides of any holes
		for ( let h = 0; h < holes.length; h ++ ) {

			const hole = holes[ h ];
			for ( let i = 0; i < hole.length - 1; i ++ ) {

				point = hole[ i ];
				vertices.push( point.x, point.y );
				nextPoint = hole[ i + 1 ];
				positions.push( point.x, point.y, 0 );
				rampDepth = ( point.x * Math.sin( angle ) - point.y * Math.cos( angle ) - minDepth ) * scale;
				nextRampDepth = ( nextPoint.x * Math.sin( angle ) - nextPoint.y * Math.cos( angle ) - minDepth ) * scale;
				positions.push( point.x, point.y, rampDepth );
				positions.push( nextPoint.x, nextPoint.y, 0 );
				positions.push( point.x, point.y, rampDepth );
				positions.push( nextPoint.x, nextPoint.y, nextRampDepth );
				positions.push( nextPoint.x, nextPoint.y, 0 );

			}

		}

		// Add top of roof
		const faces = ShapeUtils.triangulateShape( points, holes );
		for ( let i = 0; i < faces.length; i ++ ) {

			const face = faces[ i ];
			for ( let j = 0; j < 3; j ++ ) {

				const x = vertices[ 2 * face[ j ] ];
				const y = vertices[ 2 * face[ j ] + 1 ];
				const z = ( x * Math.sin( angle ) - y * Math.cos( angle ) - minDepth ) * scale;
				positions.push( x, y, z );

			}

		}
		// Add floor.
		// Reverse face directions to reverse normals.

		for ( let i = 0; i < faces.length; i ++ ) {

			const face = faces[ i ];
			for ( let j = 2; j > - 1; j -- ) {

				const x = vertices[ 2 * face[ j ] ];
				const y = vertices[ 2 * face[ j ] + 1 ];
				positions.push( x, y, 0 );

			}

		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
		this.computeVertexNormals();

	}

}
export { RampGeometry };
