class Line {
  // We have to allow vertical line
  constructor(point, vector) {
    this.point = point
    this.vector = vector
  }
}

class Ray extends Line {
  // point: x-y point in space
  // vector: 
  constructor(point, vector) {
    this.point = point
    this.vector = vector
  }
}

class LineSegment extends Line {
// Two Points
}
