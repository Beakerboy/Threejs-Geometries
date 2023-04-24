/* global QUnit */

import { RampGeometry } from '../../../../src/RampGeometry.js';

import { BufferGeometry, Shape } from 'three';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'RampGeometry', ( hooks ) => {

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

			const options = {
				angle: 0,
				depth: 5,
			};

			geometries = [
				new RampGeometry(),
				new RampGeometry( heartShape ),
				new RampGeometry( heartShape, options ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new RampGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'RampGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new RampGeometry();
			assert.ok( object, 'Can instantiate a SphereGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new RampGeometry();
			assert.ok(
				object.type === 'RampGeometry',
				'RampGeometry.type should be RampGeometry'
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
