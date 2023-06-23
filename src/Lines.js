class Line {
  // We have to allow vertical line
  constructor(point, angle) {
    this.point = point
    this.angle = angle
  }
}

class Ray extends Line {
// point: x-y point in space
// angle: value between 0 and τ
  constructor(point, angle) {
    this.point = point
    this.angle = angle
  }
}

class LineSegment extends Line {
// Two Points
}
