var boids = [];
var boidSize = 20;
var canvas;
var canvasX = 720;
var canvasY = 400;
var hiddenBorderWidth = 20;

function setup() {
  canvas = createCanvas(canvasX, canvasY);
  noStroke();

  for (var i = 0; i < 13; i++) {
    var x = random(width);
    var y = random(height);
    var direction = createVector(random(width*2)-width, random(height*2)-height);
    direction.setMag(1); // Normalize
    boids[i] = new Boid(x, y, direction);
  }
}

function draw() {
  background('darkslategrey');

  for (var i = 0; i < boids.length; i++) {
    boids[i].draw();
    boids[i].move();
    boids[i].wrapAround();
  }
}

function Boid(x, y, direction) {
  this.location = createVector(x, y);
  this.direction = direction;
}

/**
 * Boid.prototype.draw - Draw a Boid
 *
 * The Boid is a triangle with the narrow end pointing towards its
 * current direction.
 */
Boid.prototype.draw = function() {
  var coords = getTriangleAlignMentFromDirection(this.direction);
  var c1 = p5.Vector.add(this.location, coords[0]);
  var c2 = p5.Vector.add(this.location, coords[1]);
  var c3 = p5.Vector.add(this.location, coords[2]);

  fill('white');
  triangle(c1.x, c1.y, c2.x, c2.y, c3.x, c3.y);
}

/**
 * Boid.prototype.move - Move a Boid
 */
Boid.prototype.move = function() {
  this.location.add(p5.Vector.mult(this.direction, 2));
}

/**
 * Boid.prototype.wrapAround - Bring escaped Boid back to the canvas
 *
 * If a Boid has left the canvas area (we could check for when all
 * corners of the Boid triangle are outside of the visible canvas, but
 * here we are just approximating that using 'hiddenBorderWidth' which
 * is in the same range), we make it reappear at the other end.
 */
Boid.prototype.wrapAround = function() {
  if (this.location.x > canvasX + hiddenBorderWidth) {
    this.location.add(createVector(-canvasX, 0));
  }
  if (this.location.x < 0 - hiddenBorderWidth) {
    this.location.add(createVector(canvasX, 0));
  }
  if (this.location.y > canvasY + hiddenBorderWidth) {
    this.location.add(createVector(0, -canvasY));
  }
  if (this.location.y < 0 - hiddenBorderWidth) {
    this.location.add(createVector(0, canvasY));
  }
}

/**
 * getTriangleAlignMentFromDirection - Get coordinates for triangle representation
 *
 * @param  {p5.Vector} direction The direction of the Boid
 * @return {Array containing three p5.Vectors} The corners of the triangle
 */
function getTriangleAlignMentFromDirection(direction) {
  var vector0 = createVector(0, 0);
  var backEndOfBoid = p5.Vector.add(vector0, p5.Vector.mult(direction, -boidSize));
  var side = p5.Vector.mult(direction.copy().rotate(HALF_PI), boidSize/3);
  var vector1 = p5.Vector.add(backEndOfBoid, side);
  var vector2 = p5.Vector.add(backEndOfBoid, p5.Vector.mult(side, -1));

  return [vector0, vector1, vector2];
}
