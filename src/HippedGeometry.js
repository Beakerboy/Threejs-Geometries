import {
	BufferGeometry,
	Vector2,
	Shape,
} from 'three';
import earcut from "earcut";
import { SkeletonBuilder } from 'straight-skeleton';

class HippedGeometry extends BufferGeometry {

	constructor( shape = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {} ) {

		super();
		this.type = 'HippedGeometry';
		this.parameters = {
			shape: shape,
			options: options,
		};

		const polygon = [
			[
				[ -1, -1 ], [ 0, - 12 ], [ 1, - 1 ], [ 12, 0 ], [ 1, 1 ], [ 0, 12 ], [ - 1, 1 ], [ - 12, 0 ], [ - 1, - 1 ]
			],
			[
				[ - 1, 0 ],  [ 0, 1 ], [ 0, - 1 ], [ - 1, 0 ]
			]
		];

		// Initialize the Wasm module by calling init() once.
		SkeletonBuilder.init().then(() => {
			const result = SkeletonBuilder.buildFromPolygon(polygon);
	
			// Check if the skeleton was successfully constructed
			if (result !== null) {
				const geometry = new THREE.BufferGeometry();
				const vertices = [];

				for (const polygon of result.polygons) {
					const polygonVertices = [];
					for (let i = 0; i < polygon.length; i++) {
						const vertex = activeSkeleton.vertices[polygon[i]];
						polygonVertices.push(
							(vertex[0] + offset.x) * scale,
							(vertex[1] + offset.y) * scale,
							(vertex[2] + offset.z) * scale
						);
					}
					const triangles = earcut(polygonVertices, null, 3);
					for (let i = 0; i < triangles.length / 3; i++) {
						for (let j = 0; j < 3; j++) {
							const index = triangles[i * 3 + j];
							vertices.push(polygonVertices[index * 3], polygonVertices[index * 3 + 1], polygonVertices[index * 3 + 2]);
						}
					}
				}
			}
			this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
			this.computeVertexNormals();
		});
	}

	static fromJSON( data, shape ) {

		return new HippedGeometry( shape, data.options );

	}

}
export { HippedGeometry };
