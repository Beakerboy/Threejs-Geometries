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
			rectangle.holes.push( square );

			const options = {
				angle: 0,
				depth: 5,
				center: [ 0, 0 ],
			};

			geometries = [
				new WedgeGeometry(),
				new WedgeGeometry( heartShape ),
				new WedgeGeometry( heartShape, options ),
				// Outer shape in wrong direction, with hole in wrong direction.
				new WedgeGeometry( rectangle, {
					angle: 0,
					depth: 5,
					center: [ 4, 4 ],
				} ),
			];

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
			const geo = geometries[ 2 ];
			geo.computeBoundingSphere();
			assert.ok( geo.boundingSphere.radius );

		} );

	} );

} );
