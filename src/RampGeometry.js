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

		this.points = RampGeometry.cleanInputs( shape );
		// Get the cleaned outer shape and holes.
		var shapePoints = this.points.shape;
		var shapeHoles = this.points.holes;

		const rampDepths = [];

	        // Calculate intermediate depths.
		// The highest and lowest points will be along the outside
		for ( const point of shapePoints ) {

			const depth = point.x * Math.sin( angle ) - point.y * Math.cos( angle );
			rampDepths.push( depth );

		}

		const maxDepth = Math.max( ...rampDepths );
		const minDepth = Math.min( ...rampDepths );

		// Calculate the scaling factor to get the correct height.
		if ( ! depth ) {

			depth = ( maxDepth - minDepth ) * Math.tan( pitch );

		}

		const scale = depth / ( maxDepth - minDepth );

		const positions = [];
		for ( let i = 0; i < shapePoints.length - 1; i ++ ) {

			const pointDepth = ( rampDepths[ i ] - minDepth ) * scale;
			if ( pointDepth > 0 ) {

				const prevPoint = shapePoints[ ( shapePoints.length + i - 1 ) % shapePoints.length ];
				const prevDepth = ( rampDepths[ ( shapePoints.length + i - 1 ) % shapePoints.length ] - minDepth ) * scale;
				const point = shapePoints[ i ];
				const nextPoint = shapePoints[ ( i + 1 ) % shapePoints.length ];

				positions.push( prevPoint.x, prevPoint.y, prevDepth );
				positions.push( point.x, point.y, pointDepth );
				positions.push( point.x, point.y, 0 );
				positions.push( nextPoint.x, nextPoint.y, 0 );
				positions.push( point.x, point.y, 0 );
				positions.push( point.x, point.y, pointDepth );

			}

		}

		// Add the sides of any holes
		for ( const hole of shapeHoles ) {

			for ( let i = 0; i < hole.length - 1; i ++ ) {

				const point = hole[ i ];
				const pointDepth = ( point.x * Math.sin( angle ) - point.y * Math.cos( angle ) - minDepth ) * scale;
				if ( pointDepth > 0 ) {

					const prevPoint = hole[ ( hole.length + i - 1 ) % hole.length ];
					const nextPoint = hole[ i + 1 ];
					const prevDepth = ( prevPoint.x * Math.sin( angle ) - prevPoint.y * Math.cos( angle ) - minDepth ) * scale;

					positions.push( prevPoint.x, prevPoint.y, prevDepth );
					positions.push( point.x, point.y, pointDepth );
					positions.push( point.x, point.y, 0 );
					positions.push( nextPoint.x, nextPoint.y, 0 );
					positions.push( point.x, point.y, 0 );
					positions.push( point.x, point.y, pointDepth );

				}

			}

		}

		// Add top of roof
		const faces = ShapeUtils.triangulateShape( points, holes );
		const vertices = points.concat( ...holes );
		for ( const face of faces ) {

			for ( const pointIndex of face ) {

				const point = vertices[ pointIndex ];
				const x = point.x;
				const y = point.y;
				const z = ( x * Math.sin( angle ) - y * Math.cos( angle ) - minDepth ) * scale;
				positions.push( x, y, z );

			}

		}

		// Add floor.
		// Reverse face directions to reverse normals.
		for ( const face of faces ) {

			for ( let j = 2; j > - 1; j -- ) {

				const point = vertices[ face[ j ] ];
				positions.push( point.x, point.y, 0 );

			}

		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
		// this.computeVertexNormals();

	}

	/**
         * Ensure start end duplicates are removed fron shape and holes, and that the shares are oriented correctly.
	 * modifies this.parameters.shape.
         * Since this modifies the parameters, the return is unnecessary.
         * @returns {Vector2[], Vector2[][]}
         */
	static cleanInputs( shape ) {

		// Get the outer shape and holes.
		const points = shape.extractPoints().shape;

		if ( points[ 0 ].equals( points[ points.length - 1 ] ) ) {

			points.pop();

		}

		var holes = shape.extractPoints().holes;

		// Ensuse all paths are in the correct direction for the normals
		const reverse = ! ShapeUtils.isClockWise( points );
		if ( reverse ) {

			points.reverse();

		}

		// Check that any holes are correct direction.
		for ( const hole of holes ) {

			if ( hole[ 0 ].equals( hole[ hole.length - 1 ] ) ) {

				hole.pop();

			}

			if ( ShapeUtils.isClockWise( hole ) ) {

				hole.reverse();

			}

		}

		return { shape: points, holes: holes };

	}

	static fromJSON( data, shape ) {

		return new RampGeometry( shape, data.options );

	}

}
export { RampGeometry };
