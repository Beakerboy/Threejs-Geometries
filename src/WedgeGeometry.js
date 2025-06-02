import {
	BufferGeometry,
	Vector2,
	Shape,
	ShapeUtils,
	BufferAttribute,
} from 'three';

/**
 * Modify ExtrudeGeometry such that z varies with x and y
 */
class WedgeGeometry extends BufferGeometry {

	constructor( shape = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {} ) {

		super();
		this.type = 'WedgeGeometry';
		this.parameters = {
			shape: shape,
			options: options,
		};

		// The max depth of the geometry
		var depth = options.depth;

		// a point on which the peak will pass through
		const center = options.center !== undefined ? options.center : [ 0, 0 ];
		this.parameters.options.center = center;

		// The direction that the downward slope faces,
		const angle = options.angle;

		// The outer shape is the original shape plus any crossing points.
		const outerShape = new Shape();

		// A straight array of vertices for the outer shape
		const outerVertices = [];

		this.points = WedgeGeometry.cleanInputs( shape );
		// Get the cleaned outer shape and holes.
		var shapePoints = this.points.shape;
		var shapeHoles = this.points.holes;
		this.parameters.shape = new Shape( shapePoints );
		this.parameters.shape.holes.push( ...shapeHoles );

		// The original shape's point, but rotated and centered.
		/** @type {[number, number][]} */
		const newPoints = shapePoints.map( ( point ) => this.move( point ) );

		var minY = Math.min( ...newPoints.map( ( point ) => point[ 1 ] ) );
		var maxY = Math.max( ...newPoints.map( ( point ) => point[ 1 ] ) );

		this.newShapes = this.splitShape( newPoints );

		const positions = [];
		// positions.push( ...this.buildRoof() );
		// positions.push( ...this.buildWalls() );
		// positions.push( ...this.buildFloor() );
		// If the line does not intersect, display the outline.
		// otherwise just the parts.
		const startK = this.newShapes.length > 1 ? 1 : 0;
		for ( let k = startK; k < this.newShapes.length; k ++ ) {

			const points = this.newShapes[ k ].extractPoints().shape;
			// Add top of roof
			const faces = ShapeUtils.triangulateShape( points, shapeHoles );
			for ( let i = 0; i < faces.length; i ++ ) {

				const face = faces[ i ];
				for ( let j = 0; j < 3; j ++ ) {

					const unmoved = this.unMove( [ points[ face[ j ] ].x, points[ face[ j ] ].y ] );
					const x = unmoved[ 0 ];
					const y = unmoved[ 1 ];
					var z;
					if ( points[ face[ j ] ].y >= 0 ) {

						z = depth - depth / maxY * points[ face[ j ] ].y;

					} else {

						z = depth - depth / minY * points[ face[ j ] ].y;

					}

					//const z = ( x * Math.sin( angle ) - y * Math.cos( angle ) - minDepth ) * scale;
					positions.push( x, y, z );

				}

			}

		}

		// Build the floor
		const floorPoints = this.newShapes[ 0 ].extractPoints().shape;
		const floorHoles = this.newShapes[ 0 ].extractPoints().holes;
		const faces = ShapeUtils.triangulateShape( floorPoints, floorHoles );
		for ( let i = 0; i < faces.length; i ++ ) {

			const face = faces[ i ];
			for ( let j = 0; j < 3; j ++ ) {

				const unmoved = this.unMove( [ floorPoints[ face[ j ] ].x, floorPoints[ face[ j ] ].y ] );
				const x = unmoved[ 0 ];
				const y = unmoved[ 1 ];
				positions.push( x, y, 0 );

			}

		}

		// Make walls by iterating the outline.
		for ( let i = 0; i < floorPoints.length; i ++ ) {

			var point = floorPoints[ i ];
			var pointZ = depth * ( 1 - point.y / ( point.y >= 0 ? maxY : minY ) );

			var nextPoint = floorPoints[ ( i + 1 ) % floorPoints.length ];
			var nextPointZ = depth * ( 1 - nextPoint.y / ( nextPoint.y >= 0 ? maxY : minY ) );

			if ( pointZ !== 0 ) {

				positions.push( ...this.unMove( [ point.x, point.y ] ), 0 );
				positions.push( ...this.unMove( [ point.x, point.y ] ), pointZ );
				positions.push( ...this.unMove( [ nextPoint.x, nextPoint.y ] ), 0 );

			}

			if ( nextPointZ !== 0 ) {

				positions.push( ...this.unMove( [ point.x, point.y ] ), pointZ );
				positions.push( ...this.unMove( [ nextPoint.x, nextPoint.y ] ), nextPointZ );
				positions.push( ...this.unMove( [ nextPoint.x, nextPoint.y ] ), 0 );

			}

		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
		this.computeVertexNormals();

	}

	/**
	* Split a shape using the x-axis as the line. Shape is clockwise.
	* Not tested on self-intersecting shapes.
	*
	* @param {[[number, number]]} points - an array of x, y pairs.
	* @return {Three.Shape[]} an array of shapes. Element 0 is the original shape with
	*                   the addition of new vertices for the crossing points.
	*/
	splitShape( points ) {

		const crossingResults = WedgeGeometry.getCrossings( points );
		const crossings = crossingResults.crossings;
		const newOutline = crossingResults.newOutline;

		if ( Object.keys( crossings ).length === 0 ) {

			return [ newOutline ];

		}

		// Sort crossings and save the crossing number.
		var sortedCrossings = [];
		for ( const key in crossings ) {

			sortedCrossings.push( crossings[ key ] );

		}

		// Sort numerically.
		sortedCrossings.sort( function ( a, b ) {

			return a - b;

		} );
		for ( var key in crossings ) {

			const value = crossings[ key ];
			crossings[ key ] = {
				value: value,
				number: sortedCrossings.indexOf( value ),
			};

		}

		// Walk the shape and assemble pieces from matched crossings.
		const shapes = [];
		// A list of crossing numbers that will close each shape in activeShapes.
		const pendingCrossbacks = [];
		const activeShapes = [];
		// The crossing number that will close the current shape.
		var activeCrossing = - 1;
		var currentShape = new Shape();
		for ( let i = 0; i < points.length; i ++ ) {

			const point = points[ i ];
			if ( i === 0 ) {

				currentShape.moveTo( point[ 0 ], point[ 1 ] );

			} else {

				currentShape.lineTo( point[ 0 ], point[ 1 ] );

			}

			if ( i in crossings ) {

				const crossing = crossings[ i ];
				if ( crossing.value !== point[ 0 ] ) {

					currentShape.lineTo( crossing.value, 0 );

				}

				// If we can finalize the current shape.
				if ( crossing.number === activeCrossing ) {

					shapes.push( currentShape );
					currentShape = activeShapes.pop();
					activeCrossing = pendingCrossbacks.pop();
					currentShape.lineTo( crossing.value, 0 );

				} else {

					activeShapes.push( currentShape );
					pendingCrossbacks.push( activeCrossing );
					currentShape = new Shape();
					// crossing number is zero indexed.
					// If it is even, it closes at the next nuber, odd closes at the previous value.
					// 0=>1, 1=>0, 5=>4
					activeCrossing = crossing.number + 2 * ( ( crossing.number + 1 ) % 2 ) - 1;
					currentShape.moveTo( crossing.value, 0 );

				}

			}

		}

		shapes.push( currentShape );
		shapes.unshift( newOutline );

		for ( const i in shapes ) {

			shapes[ i ] = new Shape( WedgeGeometry.cleanInputs( shapes[ i ] ).shape );

		}

		return shapes;

	}

	/**
         * Given a set of points, add points for each time it crosses the x axis
	 * and return the new shape along with a list of crossing indicies
         * @param {} points - The points
	 * @returns {}
         */
	static getCrossings( points ) {

		// An associative array of all the values where the shape crosses the x axis, keyed by segment number.
		const crossings = [];

		// The new outline point, original with the addition of any crossing points.
		const newOutline = [];

		// Walk the shape and find all crossings.
		for ( let i = 0; i < points.length; i ++ ) {

			const point = points[ i ];
			newOutline.push( point );

			const prevPoint = points[ ( i - 1 + points.length ) % points.length ];
			const nextPoint = points[ ( i + 1 ) % points.length ];
			const pointOnLine = point[ 1 ] === 0;
			const sameSides = ( prevPoint[ 1 ] > 0 ) === ( nextPoint[ 1 ] > 0 );
			const switchesSides = ( point[ 1 ] > 0 ) !== ( nextPoint[ 1 ] > 0 );
			// if this point is the crossing point between the previous and next points
			// or the line is crossed between this point and the next
			if ( ( pointOnLine && ! sameSides ) || switchesSides ) {

				var crossing;
				if ( pointOnLine || nextPoint[ 0 ] === point[ 0 ] ) {

					crossing = point[ 0 ];

				} else {

					const m = ( nextPoint[ 1 ] - point[ 1 ] ) / ( nextPoint[ 0 ] - point[ 0 ] );
					crossing = point[ 0 ] - point[ 1 ] / m;

				}

				crossings[ i ] = crossing;
				if ( ! pointOnLine ) {

					newOutline.push( [ crossing, 0 ] );

				}

			}

		}

		return { crossings: crossings, newOutline: new Shape( newOutline ) };

	}

	/**
	*
	*/
	move( point ) {

		const angle = this.parameters.options.angle;
		const center = this.parameters.options.center;
		const pointX = ( point.x - center[ 0 ] ) * Math.cos( angle ) - ( point.y - center[ 1 ] ) * Math.sin( angle );
		const pointY = ( point.x - center[ 0 ] ) * Math.sin( angle ) + ( point.y - center[ 1 ] ) * Math.cos( angle );
		return [ pointX, pointY ];

	}

	/**
	*
	*/
	unMove( point ) {

		const angle = this.parameters.options.angle;
		const center = this.parameters.options.center;
		const pointX = point[ 0 ] * Math.cos( angle ) + point[ 1 ] * Math.sin( angle ) + center[ 0 ];
		const pointY = - 1 * point[ 0 ] * Math.sin( angle ) + point[ 1 ] * Math.cos( angle ) + center[ 1 ];
		return [ pointX, pointY ];

	}

	/**
         * Ensure start end duplicates are removed fron shape and holes, and that the shares are oriented correctly.
	 * modifies this.parameters.shape
         */
	static cleanInputs( shape ) {

		// Get the outer shape and holes.
		var points = shape.extractPoints().shape;

		if ( points[ 0 ].equals( points[ points.length - 1 ] ) ) {

			points.pop();

		}

		var holes = shape.extractPoints().holes;

		// The outer shape is the original shape plus any crossing points.
		const outerShape = new Shape();

		// A straight array of vertices for the outer shape
		const outerVertices = [];

		// Ensuse all paths are in the correct direction for the normals
		const reverse = ! ShapeUtils.isClockWise( points );
		if ( reverse ) {

			points.reverse();
			// Check that any holes are correct direction.
			for ( const hole of holes ) {

				if ( hole[ 0 ].equals( hole[ hole.length - 1 ] ) ) {

					hole.pop();

				}

				if ( ShapeUtils.isClockWise( hole ) ) {

					hole.reverse();

				}

			}

		}

		return { shape: points, holes: holes };

	}

	static fromJSON( data, shape ) {

		return new WedgeGeometry( shape, data.options );

	}

}
export { WedgeGeometry };
