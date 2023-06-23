class Point {
}

class Vector {
}

class Line2 {
  constructor( start = new Vector2(), end = new Vector2() ) {

		this.start = start;
		this.end = end;

	}
}

class Ray2 {
  // point: x-y point in space
  // vector: 
  constructor( origin = new Vector2(), direction = new Vector2( 0, 0, - 1 ) ) {

		this.origin = origin;
		this.direction = direction;

	}

  set( origin, direction ) {

		this.origin.copy( origin );
		this.direction.copy( direction );

		return this;

	}

	copy( ray ) {

		this.origin.copy( ray.origin );
		this.direction.copy( ray.direction );

		return this;

	}

  equals( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

class LineSegment extends Line {

}
