/* global QUnit */

import { WedgeGeometry } from '../../../../src/WedgeGeometry.js';

import { BufferGeometry, Shape } from 'three';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'WedgeGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const x = 0, y = 0;

			const heartShape = new Shape();

			heartShape.moveTo( x + 5, y + 5 );
			heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
			heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7, x - 6, y + 7 );
			heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
			heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
			heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
			heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

			const rectangle = new Shape();
			rectangle.moveTo( - 2, - 1 );
			rectangle.lineTo( 2, - 1 );
			rectangle.lineTo( 2, 1 );
			rectangle.lineTo( - 2, 1 );
			rectangle.lineTo( - 2, - 1 );

			// Clockwise square
			const square = new Shape();
			square.moveTo( - .5, .5 );
			square.lineTo( .5, .5 );
			square.lineTo( .5, - .5 );
			square.lineTo( - .5, - .5 );
			square.lineTo( - .5, .5 );
			// rectangle.holes.push( square );

			const goodRectangle = new Shape();
			goodRectangle.moveTo( - 2, - 1 );
			goodRectangle.lineTo( - 2, 1 );
			goodRectangle.lineTo( 2, 1 );
			goodRectangle.lineTo( 2, - 1 );

			const options = {
				angle: 0,
				depth: 5,
				center: [ 0, 0 ],
			};

			geometries = [
				new WedgeGeometry(),
				new WedgeGeometry( heartShape ),
				new WedgeGeometry( goodRectangle, options ),
				// Outer shape in wrong direction, with hole in wrong direction.
				new WedgeGeometry( rectangle, options ),
			];

		} );

		// Data
		QUnit.test( 'Data', ( assert ) => {

			assert.equal( geometries[ 3 ].getAttribute( "position" ).count, 36, "WedgeGeometry Point Count:" );
			// assert.equal( geometries[ 3 ].getAttribute( "position" ).array.length, 108, "WedgeGeometry Coordinate Count:" );
			// uncomment below to peek at contents
			// assert.equal( facePoints, [], "Contents of position array" );
			assert.equal( Math.max( ...geometries[ 3 ].getAttribute( "position" ).array.filter( ( element, index ) => ( index + 1 ) % 3 === 0 ) ), 5, "Height should be 5" );

			assert.equal( geometries[ 2 ].getAttribute( "position" ).count, 36, "WedgeGeometry correct Point Count" );
			assert.equal( geometries[ 2 ].parameters.shape.extractPoints().shape.length, 4, "WedgeGeometry shape points should be unchanged" );
			assert.equal( geometries[ 2 ].newShapes.length, 3, "number of shapes" );
			assert.equal( geometries[ 2 ].newShapes[ 0 ].extractPoints().shape.length, 6, "number points in new outline should be 6" );
			assert.equal( geometries[ 2 ].newShapes[ 0 ].extractPoints().shape, [], "outer shape Points" );
			assert.equal( geometries[ 2 ].newShapes[ 1 ].extractPoints().shape.length, 4, "number points in inner shape 1 should be 4" );
			assert.equal( geometries[ 2 ].newShapes[ 2 ].extractPoints().shape.length, 4, "number points in inner shape 2 should be 4" );

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new WedgeGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'WedgeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new WedgeGeometry();
			assert.ok( object, 'Can instantiate a WedgeGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new WedgeGeometry();
			assert.ok(
				object.type === 'WedgeGeometry',
				'WedgeGeometry.type should be WedgeGeometry'
			);

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );
			const geo = geometries[ 2 ];
			geo.computeBoundingSphere();
			assert.ok( geo.boundingSphere.radius );

		} );

	} );

} );
