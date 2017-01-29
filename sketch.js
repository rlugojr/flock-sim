/**
 * Global storage
 */

var canvas;
var boids = [];

/**
 * General settings
 */

// Length of a Boid from tip to back
var boidSize = 20;
// Canvas size
var canvasX = 720;
var canvasY = 400;
// Number of Boids in play
var numBoids = 13;

var boidSpeed = 2;

// Hacky estimated overflow for a Boid to have escaped the canvas completely... TODO: fix.
var hiddenBorderWidth = 20;

/**
 * Flocking settings
 */

var changeLimit = 0.2; // To prevent movement that appears too sudden

// If Boids get closer to each other than this, they begin to steer away
var desiredSeparation = 60;
// Relative importance of the separation behaviour
var separationWeight = 1;

var neighbourhoodRadius = 200;

// Relative importance of alignment behaviour
var alignmentWeight = 1;


function setup() {
  canvas = createCanvas(canvasX, canvasY);
  noStroke();

  for (var i = 0; i < numBoids; i++) {
    var x = random(width);
    var y = random(height);
    var location = createVector(x, y);
    var direction = p5.Vector.random2D();
    direction.normalize(); // Set length to 1
    boids[i] = new Boid(location, direction);
  }
}

function draw() {
  background('darkslategrey');

  for (var i = 0; i < boids.length; i++) {
    boids[i].flock(boids);
    boids[i].draw();
    boids[i].move();
    boids[i].wrapAround();
  }
}

/**
 * Class Boid
 */

function Boid(location, direction) {
  this.location = location;
  this.direction = direction;
}

/**
 * Boid.prototype.flock - Apply flocking rules
 *
 * 1. Separation
 * 2. Alignment
 * 3. TODO: Cohesion
 *
 * FIXME: No clever data structures here, so the asymptotic complexity
 * for checking this for all Boids is O(n^2) (for each Boid we need to
 * check each other Boid to see if it needs to interact with that one).
 * This is OK with the default number of Boids being low.
 *
 * @param  {type} boids Array of all Boids
 */
Boid.prototype.flock = function(boids) {

  var alignmentChange = this.getAlignmentChange(boids);
  var separationChange = this.getSeparationChange(boids);

  var totalChange = p5.Vector.add(alignmentChange, separationChange); // Add them all up
  totalChange.limit(changeLimit);

  this.direction.add(totalChange);
  this.direction.normalize();
}

/**
 * Boid.prototype.getAlignmentChange
 *
 * @param  {Array} boids Array of all Boids
 * @return {p5.Vector} Scaled change vector for Boid to attempt to
 * move in the same direction with its neighbours.
 */
Boid.prototype.getAlignmentChange = function(boids) {
  var change = createVector(0, 0);
  var numChanges = 0;
  for (var i = 0; i < boids.length; i++) {
    if (boids[i] == this) {
      continue;
    }
    var diff = p5.Vector.sub(this.location, boids[i].location);
    var distance = diff.mag();
    if (distance < neighbourhoodRadius) {
      var diffInDirection = p5.Vector.sub(this.direction, boids[i].direction);
      change.add(diffInDirection);
      numChanges++;
    }

  }
  if (numChanges > 0) {
    change.div(numChanges);
  }
  return change.mult(alignmentWeight);
}

/**
 * Boid.prototype.getSeparationChange
 *
 * FIXME: This doesn't consider the wraparound.
 *
 * @param  {Array} boids Array of all Boids
 * @return {p5.Vector} Scaled change vector for Boid to attempt to avoid
 * collisions with its neighbours.
 */
Boid.prototype.getSeparationChange = function(boids) {
  var change = createVector(0, 0);
  var numChanges = 0;
  for (var i = 0; i < boids.length; i++) {
    var diff = p5.Vector.sub(this.location, boids[i].location);
    var distance = diff.mag();
    if (distance != 0 && distance < desiredSeparation) {
      // Steer away from the neighbour
      diff.normalize();
      // Make a sharper turn the closer you are
      diff.div(distance);
      change.add(diff);
      numChanges++;
    }
  }
  if (numChanges > 0) {
    change.div(numChanges);
  }
  return change.mult(separationWeight);
}

/**
 * Boid.prototype.draw - Draw a Boid
 *
 * The Boid is a triangle with the narrow end pointing towards its
 * current direction.
 *
 * TODO: Make them look more like paper planes
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
  this.location.add(p5.Vector.mult(this.direction, boidSpeed));
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
