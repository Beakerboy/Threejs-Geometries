/* global QUnit */

import { RampGeometry } from '../../../../src/RampGeometry.js';

import { BufferGeometry, Shape } from 'three';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'RampGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const rectangle = new Shape();
			rectangle.moveTo( - 2, - 1 );
			rectangle.lineTo( 2, - 1 );
			rectangle.lineTo( 2, 1 );
			rectangle.lineTo( - 2, 1 );

			const options = {
				angle: 0,
				depth: 5,
			};

			const options1 = {
				angle: Math.PI / 4,
				depth: 5,
			};

			const doughnut = rectagle.clone();
			// Clockwise square
			const square = new Shape();
			square.moveTo( - .5, .5 );
			square.lineTo( .5, .5 );
			square.lineTo( .5, - .5 );
			square.lineTo( - .5, - .5 );

			doughnut.holes.push( square );

			geometries = [
				new RampGeometry(),
				new RampGeometry( doughnut, options ),
				new RampGeometry( rectangle, options ),
				new RampGeometry( rectangle, options1 ),
			];

		} );

		// Data
		QUnit.test( 'Data', ( assert ) => {

			const facePoints0 = geometries[ 1 ].getAttribute( "position" );
			assert.equal( facePoints0.count / 3, 20, "RampGeometry face Count:" );

			const facePoints = geometries[ 2 ].getAttribute( "position" );
			assert.equal( facePoints.count / 3, 8, "RampGeometry face Count:" );

			const facePoints1 = geometries[ 3 ].getAttribute( "position" );
			assert.equal( facePoints1.count / 3, 10, "RampGeometry face Count:" );

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
			assert.ok( object, 'Can instantiate a RampGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new RampGeometry();
			assert.ok(
				object.type === 'RampGeometry',
				'RampGeometry.type should be RampGeometry'
			);

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
