/* global QUnit */

import { HippedGeometry } from '../../../../src/HippedGeometry.js';

import { BufferGeometry, Shape, Vector2 } from 'three';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';
import { SkeletonBuilder, Vector2d } from 'straight-skeleton';

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

			const points = [
				[ - 26.544995859742947, - 13.287698137967746 ],
				[ 9.913632585162611, - 3.7917336660976004 ],
				[ 20.559427587754445, - 1.0229359802622613 ],
				[ 29.651770143672465, 1.3455778947287382 ],
				[ 26.53923658090192, 13.287889287788659 ],
				[ - 29.651791704140486, - 1.334219836371914 ],
				[ - 26.951441512330682, - 11.708727230072542 ]
			];
			const vecPoints = points.map( ( point ) => new Vector2d( point[ 0 ], point[ 1 ] ) );
			const result = SkeletonBuilder.Build( vecPoints );
			const polygon = [ points ];

			const multipolygon = [ polygon ];
			const result1 = SkeletonBuilder.BuildFromGeoJSON( multipolygon );

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
