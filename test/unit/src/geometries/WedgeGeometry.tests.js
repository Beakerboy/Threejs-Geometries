/* global QUnit */

import { WedgeGeometry } from '../../../../src/WedgeGeometry.js';

import { BufferGeometry, Shape, Vector2 } from 'three';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'WedgeGeometry', ( hooks ) => {

		// Data
		QUnit.test( 'Data', ( assert ) => {

			const vectorMap = point => new Vector2( ...point );
			const options = {
				angle: 0,
				depth: 5,
				center: [ 0, 0 ],
			};
			const points = [[ - 2, - 1 ], [ - 2, 1 ], [ 2, 1 ], [ 2, - 1 ]];
			const geometry = new WedgeGeometry( new Shape( points.map( vectorMap ) ), options );

			// assert.equal( geometries[ 3 ].getAttribute( "position" ).count, 36, "WedgeGeometry Point Count:" );
			// assert.equal( geometries[ 3 ].getAttribute( "position" ).array.length, 108, "WedgeGeometry Coordinate Count:" );
			// uncomment below to peek at contents
			// assert.equal( facePoints, [], "Contents of position array" );
			// assert.equal( Math.max( ...geometries[ 3 ].getAttribute( "position" ).array.filter( ( element, index ) => ( index + 1 ) % 3 === 0 ) ), 5, "Height should be 5" );

			assert.equal( geometry.getAttribute( "position" ).count, 36, "WedgeGeometry correct Point Count" );
			assert.equal( geometry.parameters.shape.extractPoints().shape.length, 4, "WedgeGeometry shape points should be unchanged" );
			assert.equal( geometry.newShapes.length, 3, "number of shapes" );
			assert.equal( geometry.newShapes[ 0 ].extractPoints().shape.length, 6, "number points in new outline should be 6" );
			// assert.equal( geometries[ 2 ].newShapes[ 0 ].extractPoints().shape, [], "outer shape Points" );
			assert.equal( geometry.newShapes[ 1 ].extractPoints().shape.length, 4, "number points in inner shape 1 should be 4" );
			assert.equal( geometry.newShapes[ 1 ].extractPoints().shape, [], "peek at inner 1 points" );
			assert.equal( geometry.newShapes[ 2 ].extractPoints().shape.length, 4, "number points in inner shape 2 should be 4" );
			assert.equal( geometry.newShapes[ 2 ].extractPoints().shape, [], "peek at inner 2 points" );

		} );

		// Static Functions
		QUnit.test( 'getCrossings noncrossings', ( assert ) => {

			const points = [[ - 2, 1 ], [ - 2, 2 ], [ 2, 2 ], [ 2, 1 ]];
			const result = WedgeGeometry.getCrossings( points );
			assert.equal( result.newOutline.extractPoints().shape.length, 4, "New Outline has 4 points" );
			assert.equal( Object.keys( result.crossings ).length, 0, "There should be only two crossings" );

		} );

		QUnit.test( 'getCrossings one crossing', ( assert ) => {

			const points = [[ - 2, - 1 ], [ - 2, 1 ], [ 2, 1 ], [ 2, - 1 ]];
			const result = WedgeGeometry.getCrossings( points );
			assert.equal( result.newOutline.extractPoints().shape.length, 6, "New Outline has 6 points" );
			assert.equal( result.crossings[ 0 ], - 2, "First Crossing" );
			assert.equal( result.crossings[ 2 ], 2, "Second Crossing" );
			assert.equal( Object.keys( result.crossings ).length, 2, "There should be only two crossings" );

		} );

		QUnit.test( 'cleanInputs', ( assert ) => {

			const vectorMap = point => new Vector2( ...point );
			const cleanPoints = [[ - 2, - 1 ], [ - 2, 1 ], [ 2, 1 ], [ 2, - 1 ]];
			const cleanShape = new Shape( cleanPoints.map( vectorMap ) );
			const result = WedgeGeometry.cleanInputs( cleanShape );
			assert.equal( result.shape.length, 4, "cleaned has 4 points" );

			const extraPoint = [[ - 2, - 1 ], [ - 2, 1 ], [ 2, 1 ], [ 2, - 1 ], [ - 2, - 1 ]];
			const extraShape = new Shape( extraPoint.map( vectorMap ) );
			const extraresult = WedgeGeometry.cleanInputs( extraShape );
			assert.equal( extraresult.shape.length, 4, "extraShape has 4 points when cleaned" );

		} );

		QUnit.test( 'splitShape no crossings', ( assert ) => {

			const cleanPoints = [[ - 2, 1 ], [ - 2, 2 ], [ 2, 2 ], [ 2, 1 ]];
			const result = WedgeGeometry.splitShape( cleanPoints );
			assert.equal( result.length, 1, "Should have 1 shapes" );

		} );

		QUnit.test( 'splitShape one crossing', ( assert ) => {

			const cleanPoints = [[ - 2, - 1 ], [ - 2, 1 ], [ 2, 1 ], [ 2, - 1 ]];
			const result = WedgeGeometry.splitShape( cleanPoints );
			assert.equal( result.length, 3, "Should have 1 shapes" );

		} );

		QUnit.test( 'diagnose issue', ( assert ) => {

			const points = [[ - 2, - 1 ], [ - 2, 1 ], [ 2, 1 ], [ 2, - 1 ]];
			const crossingResults = WedgeGeometry.getCrossings( points );
			const crossings = crossingResults.crossings;
			assert.equal( Object.keys( crossings ).length, 2, "There should be only two crossings" );
			const newOutline = crossingResults.newOutline;
			assert.equal( newOutline.extractPoints().shape.length, 6, "New Outline has 6 points" );

			const newPoints = newOutline.extractPoints().shape;
			const topShapePoints = [];
			const bottomShapePoints = [];
			for ( const point of newPoints ) {

				if ( point.y >= 0 ) topShapePoints.push( point );
				if ( point.y <= 0 ) bottomShapePoints.push( point );

			}

			assert.equal( topShapePoints.length, 4, "upper shape has 4 points" );

			const topShape = new Shape( topShapePoints );

		} );

	} );

} );
