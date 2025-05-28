/* global QUnit */

import { HippedGeometry } from '../../../../src/HippedGeometry.js';

import { BufferGeometry, Shape } from 'three';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'HippedGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const x = 0, y = 0;

			const square = new Shape();

			square.moveTo( - 25, - 25 );
			square.lineTo( 25, - 25 );
			square.lineTo( 25, 25 );
			square.lineTo( - 25, 25 );

			const options = {
				center: [ 0, 0 ],
				depth: 5,
			};

			geometries = [
				new HippedGeometry(),
				new HippedGeometry( square ),
				new HippedGeometry( square, options ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new HippedGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'HippedGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new HippedGeometry();
			assert.ok( object, 'Can instantiate a HippedGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new HippedGeometry();
			assert.ok(
				object.type === 'HippedGeometry',
				'HippedGeometry.type should be HippedGeometry'
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
