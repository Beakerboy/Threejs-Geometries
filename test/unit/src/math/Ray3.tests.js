/* global QUnit */

import { Ray3 } from '../../../../src/math/Ray3.js';
import {
	zero2,
} from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Ray', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			let a = new Ray();
			assert.ok( a.origin.equals( zero3 ), 'Passed!' );
			assert.ok( a.direction.equals( new Vector3( 0, 0, - 1 ) ), 'Passed!' );

			a = new Ray( two3.clone(), one3.clone() );
			assert.ok( a.origin.equals( two3 ), 'Passed!' );
			assert.ok( a.direction.equals( one3 ), 'Passed!' );

		} );
    
	} );

} );
