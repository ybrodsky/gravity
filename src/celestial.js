/**
* Constructor
*
* @param x                Int X coordinate where the Celestial will be created
* @param y                Int Y coordinate where the Celestial will be created
* @param radius           Int radius of the Celestial
* @param fill             String color of the Celestial
* @param acceleration     Vector acceleration to create a moving Celestial
*
*/
var Celestial = function(x, y, radius, fill, acceleration) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.mass = Math.pow(radius, 2) * 100000000000;
  this.fill = fill || '#'+(Math.random()*0xFFFFFF<<0).toString(16);
  this.speed = {x: 0, y: 0};
  this.acceleration = acceleration ? {x: acceleration.x / 4, y: acceleration.y / 4 } : {x: 0, y: 0};
};

/**
* Calculates the distance between the Celestial and some coordinate
*
* @param x                Int X coordinate to calculate the distance to
* @param y                Int Y coordinate to calculate the distance to
*
*/
Celestial.prototype.distanceTo = function(x, y) {
  return Math.sqrt((Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2)));
};

/**
* Calculates the direction in X, Y in relation to the Celestial position
*
* @param x                Int X coordinate to calculate the direction to
* @param y                Int Y coordinate to calculate the direction to
* @return                 Object with x and y property with value either positive or negative
*
*/
Celestial.prototype.directionTo = function(x, y) {
  var directionX = (this.x - x < 0) ? 1 : -1;
  var directionY = (this.y - y < 0) ? 1 : -1;

  return {x: directionX, y: directionY};
};

/**
* Applies a force to a Celestial which translates in acceleration
*
* @param vector     Vector
*
*/
Celestial.prototype.applyForce = function(vector) {
  this.acceleration.x = vector.x;
  this.acceleration.y = vector.y;
};

/**
* Moves a Celestial to a new position based in the current acceleration
*
*/
Celestial.prototype.move = function() {
  this.x +=  this.acceleration.x;
  this.y += this.acceleration.y;
};

/**
* Calculates the resulting forces out of an array of forces being applied to a Celestial
*
* @param forces         Array of forces
*/
Celestial.prototype.resolveForces = function(forces) {
  var vector = new Vector(0, 0);
  forces.forEach(function(force) {
    vector.x += force.x;
    vector.y += force.y;
  });
  vector.x += this.acceleration.x;
  vector.y += this.acceleration.y;

  this.applyForce(vector);
};