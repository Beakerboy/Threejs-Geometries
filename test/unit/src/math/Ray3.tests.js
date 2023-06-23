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
			assert.ok( a.origin.equals( zero2 ), 'Passed!' );
			assert.ok( a.direction.equals( new Vector2( 0, - 1 ) ), 'Passed!' );

			a = new Ray( two2.clone(), one2.clone() );
			assert.ok( a.origin.equals( two2 ), 'Passed!' );
			assert.ok( a.direction.equals( one2 ), 'Passed!' );

		} );
    
	} );

} );
