import {
	BufferGeometry,
	Vector2,
	Shape,
} from 'three';

import SkeletonBuilder from 'straight-skeleton';

class HippedGeometry extends BufferGeometry {

	constructor( shape = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {} ) {

		super();
		this.type = 'HippedGeometry';
		this.parameters = {
			shape: shape,
			options: options,
		};

	}

}
