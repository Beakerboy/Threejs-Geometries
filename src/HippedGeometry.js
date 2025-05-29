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
		// {number[]} Flat array of x, y, z tuples
		const polygonVertices = [];
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
		// {[number, number][]} An array of x, y points
		const border = [];
		// {border[]} An array of borders. Element 0 is an outer, and additional borders are inner.
		const polygon = [];
		// {polygon[]} all polygons in the multipolygon.
		const multipolygon = [];
		
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
			if ( result.Edges.length !== 4 ) {

				throw new Error( "length is not 4" );

			}

			// Create an array of Vector2 for each face
			for ( const edgeOutput of result.Edges ) {

				const newPolygon = [];
				const heights = [];
				// convert List of Vector2d to array of Vector2
				for ( const point of edgeOutput.Polygon ) {

					newPolygon.push( new Vector2( point.X, point.Y ) );
					heights.push( result.Distances.get( point ) );

				}

				if ( newPolygon.length !== 3 ) {

					throw new Error( "length is " + newPolygon.length );

				}

				// [number, number, number][]
				const triangles = ShapeUtils.triangulateShape( newPolygon, [[]] );

				for ( const triangle of triangles ) {

					polygonVertices.push( newPolygon[ triangle[ 0 ] ].x, newPolygon[ triangle[ 0 ] ].y, heights[ triangle[ 0 ] ] );
					polygonVertices.push( newPolygon[ triangle[ 1 ] ].x, newPolygon[ triangle[ 1 ] ].y, heights[ triangle[ 1 ] ] );
					polygonVertices.push( newPolygon[ triangle[ 2 ] ].x, newPolygon[ triangle[ 2 ] ].y, heights[ triangle[ 2 ] ] );

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
