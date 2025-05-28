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
		outer = [];
		const inner = [];
		for ( const point of points ) {

			outer.push( point.x, point.y );

		}

		// Repeat start-end point
		outer.push( points[ 0 ].x, points[ 0 ].y );
		polygon.push( outer );
		multipolygon.push( polygon );
		const result = SkeletonBuilder.buildFromGeoJSON( multipolygon );

		// Check if the skeleton was successfully constructed
		if ( result !== null ) {

			const vertices = [];

			for ( const edgeOutput of result.edges ) {

				const polygon = ShapeUtils.triangulateShape( edgeOutput.polygon );
				const polygonVertices = [];
				for ( const point of polygon ) {

					const distance = sk.distances[ point ];
					polygonVertices.push( point.x, point.y, distance * depth
					);

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
