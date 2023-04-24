import { ObjectLoader } from 'three';
import * as CustomGeometries from './Geometries.js';

class CustomObjectLoader extends ObjectLoader {
	constructor( manager ) {

		super( manager );
		Geometries = Geometries + CustomGeometries;
		
	}
}

export { CustomObjectLoader };
