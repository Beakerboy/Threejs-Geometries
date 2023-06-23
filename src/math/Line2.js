class Line2 {
	constructor( start = new Vector2(), end = new Vector2() ) {

		this.start = start;
		this.end = end;

	}

	equals( line ) {

		return line.start.equals( this.start ) && line.end.equals( this.end );

	}

	clone() {

		return new this.constructor().copy( this );

	}

}
