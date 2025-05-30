import {
	BufferGeometry,
	Vector2,
	Shape,
	ShapeUtils,
	BufferAttribute,
} from 'three';

class PyramidGeometry extends BufferGeometry {

	constructor( shape = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {} ) {

		super();

		this.type = 'PyramidGeometry';

		this.parameters = {
			shape: shape,
			options: options,
		};
		const depth = options.depth !== undefined ? options.depth : 0;
		const center = options.center !== undefined ? options.center : [ 0, 0 ];
		var positions = [];
		var point;
		var nextPoint;
		var points = shape.extractPoints().shape;
		const reverse = ! ShapeUtils.isClockWise( points );
		if ( reverse ) {

			points = points.reverse();

		}

		if ( points.length > 1 && points[ 0 ].equals( point[ points.length - 1 ] ) ) {

			points.pop();

		}

		for ( let i = 0; i < points.length; i ++ ) {

			point = points[ i ];
			nextPoint = points[ i + 1 ];
			positions.push( point.x, point.y, 0 );
			positions.push( center[ 0 ], center[ 1 ], depth );
			positions.push( nextPoint.x, nextPoint.y, 0 );

		}

		// Add the floor
		const faces = ShapeUtils.triangulateShape( points, [] );

		for ( let i = 0; i < faces.length; i ++ ) {

			const face = faces[ i ];

			for ( let j = 2; j > - 1; j -- ) {

				const x = points[ face[ j ] ].x;
				const y = points[ face[ j ] ].y;
				const z = 0;
				positions.push( x, y, z );

			}

		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
		// ToDo - add points correctly so only one face needs to be rendered.
		this.computeVertexNormals();

	}

	static fromJSON( data, shape ) {

		return new PyramidGeometry( shape, data.options );

	}

}
export { PyramidGeometry };
