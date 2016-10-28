/**
* Constructor
* https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation
*/
var Gravity = function() {
  this.constant = 6.67384 * Math.pow(10, -11);
};

/**
* Calculates the acceleration produced by an object based on its mass and the distance
*
* @param mass         Int mass of the object
* @param distance     Int distance of the object
* @return             Int resulting acceleration
*/
Gravity.prototype.calculateAcceleration = function(mass, distance) {
  return (this.constant * mass) / Math.pow(distance, 2);
};