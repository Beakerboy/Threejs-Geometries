import {
	BufferGeometry,
	BufferAttribute,
	Vector2,
	Shape,
	ShapeUtils,
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
		// The max depth of the geometry
		var depth = options.depth;
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
		/**
                 * A multipolygon is an array of polygons. Each polygon is an array of one or more
                 * closed shapes. The first shape is the outer perimeter. Subsequent shapes are
                 * holes.
		 */

		const multipolygon = [];
		const polygon = [];
		const border = [];
		const inner = [];
		for ( const point of points ) {

			border.push( [ point.x, point.y ] );

		}

		// Repeat start-end point the livrary does not like the repeated point.
		// border.push( [ points[ 0 ].x, points[ 0 ].y ] );
		polygon.push( border );
		// for ( const hole of holes ) {
		//   border.length = 0;
		//   for ( const point of hole ) {
		//     border.push( [ point.x, point.y ] );
		//   }
		//   border.push( [ hole[ 0 ].x, hole[ 0 ].y ] );
		//   polygon.push( border )
		// }
		multipolygon.push( polygon );
		const result = SkeletonBuilder.BuildFromGeoJSON( multipolygon );

		// Check if the skeleton was successfully constructed
		if ( result !== null ) {

			const vertices = [];

			// Create an array of Vector2 for each face
			for ( const edgeOutput of result.edges ) {

				const newPolygon = [];
				// convert List of Vector2d to array of Vector2
				for ( const point of edgeOutput.polygon ) {

					newPolygon.push( new Vector2( point.x, point.y ) );

				}

				// [number, number, number][]
				const triangles = ShapeUtils.triangulateShape( newPolygon, [[]] );
				const polygonVertices = [];
				for ( const point of polygon ) {

					//const distance = sk.distances[ point ];
					polygonVertices.push( point.x, point.y, 0 );

				}

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
