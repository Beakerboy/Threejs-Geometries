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
		/** {number} The max depth of the geometry */
		var depth = options.depth;

		/** {number} The roof angle in radians */
		const pitch = options.pitch;

		var points = shape.extractPoints().shape;
		var holes = shape.extractPoints().holes;

		// {number[]} Flat array of x, y, z tuples
		const polygonVertices = [];

		// straight-skeleton expects counter-clockwise outer polygon
		if ( ShapeUtils.isClockWise( points ) ) {

			points.reverse();

		}

		for ( const hole of holes ) {

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

		for ( const point of points ) {

			border.push( [ point.x, point.y ] );

		}

		// despite GeoJSON requiring repeated start and end points,
		// the library does not like the repeated point.
		polygon.push( border );
		for ( const hole of holes ) {

			border.length = 0;
			for ( const point of hole ) {

				border.push( [ point.x, point.y ] );

			}

			polygon.push( border );

		}

		multipolygon.push( polygon );
		const result = SkeletonBuilder.BuildFromGeoJSON( multipolygon );

		// Check if the skeleton was successfully constructed
		if ( result !== null ) {

			const maxDepth = Math.max( ...result.Distances.values() );
			const scalingFactor = pitch === undefined ? ( depth === undefined ? 1 : depth / maxDepth ) : Math.tan( pitch );

			// Create an array of Vector2 for each face
			for ( const edgeOutput of result.Edges ) {

				const newPolygon = [];
				const heights = [];
				// convert List of Vector2d to array of Vector2
				for ( const point of edgeOutput.Polygon ) {

					newPolygon.push( new Vector2( point.X, point.Y ) );
					heights.push( result.Distances.get( point ) * scalingFactor );

				}

				// Triangulate the upper surface
				// {[number, number, number][]}
				const upperTriangles = ShapeUtils.triangulateShape( newPolygon, [] );

				for ( const triangle of upperTriangles ) {

					polygonVertices.push( newPolygon[ triangle[ 0 ] ].x, newPolygon[ triangle[ 0 ] ].y, heights[ triangle[ 0 ] ] );
					polygonVertices.push( newPolygon[ triangle[ 1 ] ].x, newPolygon[ triangle[ 1 ] ].y, heights[ triangle[ 1 ] ] );
					polygonVertices.push( newPolygon[ triangle[ 2 ] ].x, newPolygon[ triangle[ 2 ] ].y, heights[ triangle[ 2 ] ] );

				}

			}

			// Triangulate the bottome
			const bottomTriangles = ShapeUtils.triangulateShape( points, holes );

			for ( const triangle of bottomTriangles ) {

				polygonVertices.push( points[ triangle[ 0 ] ].x, points[ triangle[ 0 ] ].y, 0 );
				polygonVertices.push( points[ triangle[ 1 ] ].x, points[ triangle[ 1 ] ].y, 0 );
				polygonVertices.push( points[ triangle[ 2 ] ].x, points[ triangle[ 2 ] ].y, 0 );

			}

			this.setAttribute( 'position', new BufferAttribute( new Float32Array( polygonVertices ), 3 ) );
			this.computeVertexNormals();

		}

	}

	static fromJSON( data, shape ) {

		return new HippedGeometry( shape, data.options );

	}

}
export { HippedGeometry };
