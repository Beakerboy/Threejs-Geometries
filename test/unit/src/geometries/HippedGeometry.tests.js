/* global QUnit */

import { HippedGeometry } from '../../../../src/HippedGeometry.js';

import { BufferGeometry, Shape, Vector2 } from 'three';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'HippedGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const x = 0, y = 0;

			const square = new Shape();
			square.moveTo( - 25, - 25 );
			square.lineTo( 75, - 25 );
			square.lineTo( 75, 25 );
			square.lineTo( - 25, 25 );

			const doughnut = new Shape();
			doughnut.moveTo( - 25, - 25 );
			doughnut.lineTo( - 25, 25 );
			doughnut.lineTo( 25, 25 );
			doughnut.lineTo( 25, - 25 );

			const innerShape = new Shape();
			innerShape.moveTo( - 5, - 5 );
			innerShape.lineTo( 5, - 5 );
			innerShape.lineTo( 5, 5 );
			innerShape.lineTo( - 5, 5 );

			doughnut.holes.push( innerShape );
			const options = {
				depth: 6,
			};

			const options2 = {
				pitch: 26.57 / 180 * Math.PI,
			};

			geometries = [
				new HippedGeometry( square, options2 ),
				new HippedGeometry( square ),
				new HippedGeometry( square, options ),
				new HippedGeometry( doughnut )
			];

		} );

		// Data
		QUnit.test( 'Data', ( assert ) => {

			const facePoints = geometries[ 1 ].getAttribute( "position" );
			assert.equal( facePoints.count, 24, "HippedGeometry Point Count:" );
			assert.equal( facePoints.array.length, 72, "HippedGeometry Coordinate Count:" );
			// uncomment below to peek at contents
			// assert.equal( facePoints, [], "Contents of position array" );
			assert.equal( Math.max( ...facePoints.array.filter( ( element, index ) => ( index + 1 ) % 3 === 0 ) ), 25, "Height should be 25" );

			assert.equal( Math.max( ...geometries[ 2 ].getAttribute( "position" ).array.filter( ( element, index ) => ( index + 1 ) % 3 === 0 ) ), 6, "Height should be 6" );
			assert.equal( Math.max( ...geometries[ 0 ].getAttribute( "position" ).array.filter( ( element, index ) => ( index + 1 ) % 3 === 0 ) ), 12.50269889831543, "Height should be about 12.5" );
			assert.equal( geometries[ 3 ].getAttribute( "position" ).count, 72, "HippedGeometry Point Count with hole" );

		} );

		// Data
		QUnit.test( 'Bug', ( assert ) => {

			const points = [ [ - 2, - 1 ], [ - 2, 0 ], [ - 2, 2 ], [ 3, 2 ], [ 3, - 1 ], [ 2, - 1 ], [0, - 1 ] ];
			const shape = new Shape( points.map( point => new Vector2( ...point ) ) );
			const geometry = new HippedGeometry( shape, options );

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

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
