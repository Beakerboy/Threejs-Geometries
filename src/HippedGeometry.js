import {
	BufferGeometry,
	BufferAttribute,
	Vector2,
	Shape,
} from 'three';
import { SkeletonBuilder } from 'straight-skeleton';

class HippedGeometry extends BufferGeometry {

	constructor( shape = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {} ) {

		super();
		this.type = 'HippedGeometry';
		this.parameters = {
			shape: shape,
			options: options,
		};
		var points = shape.extractPoints().shape;
		var holes = shape.extractPoints().holes;
		// straight-skeleton expects counter-clockwise outer polygon
		if ( ShapeUtils.isClockWise( points ) ) {

			points.reverse();

		}
		for ( hole of holes ) {
			// straight-skeleton expects clockwise inner polygon
			if ( ! ShapeUtils.isClockWise( hole ) ) {

				hole.reverse();

			}

		}
		const polygon = []
		const inner = []
		for ( const point of points ) {
			inner.push( point.x, point.y )
		}
		// Repeat start-end point
		inner.push( points[ 0 ].x, points[ 0 ].y )
		polygon.push(inner)

		const result = SkeletonBuilder.buildFromGeoJSON( polygon );

		// Check if the skeleton was successfully constructed
		if ( result !== null ) {

			const vertices = [];

			for ( const polygon of result.polygons ) {

				const polygonVertices = [];
				for ( let i = 0; i < polygon.length; i ++ ) {

					const vertex = activeSkeleton.vertices[ polygon[ i ] ];
					polygonVertices.push(
						( vertex[ 0 ] + offset.x ) * scale,
						( vertex[ 1 ] + offset.y ) * scale,
						( vertex[ 2 ] + offset.z ) * scale
					);

				}

				const triangles = earcut( polygonVertices, null, 3 );

				for ( let i = 0; i < triangles.length / 3; i ++ ) {

					for ( let j = 0; j < 3; j ++ ) {

						const index = triangles[ i * 3 + j ];
						vertices.push( polygonVertices[ index * 3 ], polygonVertices[ index * 3 + 1 ], polygonVertices[ index * 3 + 2 ] );

					}

				}

			}

			this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
			this.computeVertexNormals();

		}

	}

	static fromJSON( data, shape ) {

		return new HippedGeometry( shape, data.options );

	}

}
export { HippedGeometry };
