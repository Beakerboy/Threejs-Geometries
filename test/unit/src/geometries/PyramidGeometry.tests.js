/* global QUnit */

import { PyramidGeometry } from '../../../../src/PyramidGeometry.js';

import { BufferGeometry, Shape } from 'three';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'PyramidGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const badSquare = new Shape();
			badSquare.moveTo( - 5, - 5 );
			badSquare.lineTo( 5, - 5 );
			badSquare.lineTo( 5, 5 );
			badSquare.lineTo( - 5, 5 );
			badSquare.lineTo( - 5, - 5 );

			const square = new Shape();
			square.moveTo( - 5, - 5 );
			square.lineTo( 5, - 5 );
			square.lineTo( 5, 5 );
			square.lineTo( - 5, 5 );

			const options = {
				center: [ 0, 0 ],
				depth: 5,
			};

			geometries = [
				new PyramidGeometry(),
				new PyramidGeometry( square, options ),
				new PyramidGeometry( badSquare, options ),
			];

		} );
		// Data
		QUnit.test( 'Data', ( assert ) => {

			assert.equal( geometries[ 2 ].getAttribute( "position" ).count, 18, "PyramidGeometry Point Count:" );
			assert.equal( geometries[ 2 ].getAttribute( "position" ).array.length, 54, "PyramidGeometry Coordinate Count:" );
			// uncomment below to peek at contents
			// assert.equal( facePoints, [], "Contents of position array" );
			assert.equal( Math.max( ...geometries[ 2 ].getAttribute( "position" ).array.filter( ( element, index ) => ( index + 1 ) % 3 === 0 ) ), 5, "Height should be 5" );

			assert.equal( geometries[ 1 ].getAttribute( "position" ).count, 18, "PyramidGeometry Correct Point Count:" );
			assert.equal( geometries[ 1 ].getAttribute( "position" ).array.length, 54, "PyramidGeometry Correct Coordinate Count:" );

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new PyramidGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'PyramidGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new PyramidGeometry();
			assert.ok( object, 'Can instantiate a PyramidGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new PyramidGeometry();
			assert.ok(
				object.type === 'PyramidGeometry',
				'PyramidGeometry.type should be PyramidGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'fromJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
