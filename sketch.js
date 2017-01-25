var boids = [];
var boidSize = 20;
var canvas;

function setup() {
  canvas = createCanvas(720, 400);
  noStroke();

  for (var i = 0; i < 13; i++) {
    var x = random(width);
    var y = random(height);
    var direction = getDirection(random(width*2)-width, random(height*2)-height);
    boids[i] = new Boid(x, y, direction);
  }
}

function draw() {
  background('darkslategrey');

  for (var i = 0; i < boids.length; i++) {
    boids[i].draw();
    boids[i].move();
  }
}

function getDirection(x, y) {
  var vector = createVector(x, y);
  vector.setMag(1);

  return vector;
}

function Boid(x, y, direction) {
  this.location = createVector(x, y);
  this.direction = direction;
}

Boid.prototype.draw = function() {
  var coords = getTriangleAlignMentFromDirection(this.direction);
  var c1 = p5.Vector.add(this.location, coords[0]);
  var c2 = p5.Vector.add(this.location, coords[1]);
  var c3 = p5.Vector.add(this.location, coords[2]);

  fill('white');
  triangle(c1.x, c1.y, c2.x, c2.y, c3.x, c3.y);
}

Boid.prototype.move = function() {
  this.location.add(p5.Vector.mult(this.direction, 2));
}

function getTriangleAlignMentFromDirection(direction) {
  var vector0 = createVector(0, 0);
  var backEndOfBoid = p5.Vector.add(vector0, p5.Vector.mult(direction, -boidSize));
  var side = p5.Vector.mult(direction.copy().rotate(HALF_PI), boidSize/3);
  var vector1 = p5.Vector.add(backEndOfBoid, side);
  var vector2 = p5.Vector.add(backEndOfBoid, p5.Vector.mult(side, -1));

  return [vector0, vector1, vector2];
}
