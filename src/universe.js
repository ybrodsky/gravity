/**
* Constructor
*
* @param gravityObj       Gravity Object
* @param canvas           HTML5 canvas
*
*/
var Universe = function(gravityObj, canvas) {
  this.width = canvas.width;
  this.height = canvas.height;
  this.objects = [];
  this.ctx = canvas.getContext("2d");
  this.Gravity = gravityObj;
  this.radiusIndex = 1;

  //line drawing
  this.drawing = false;
  this.drawingStart = {x: 0, y: 0};
  this.mousePosition = {x: 0, y: 0};

  var me = this;

  /**
  * On mousedown we set the starting coordinates in case the user is drawing a
  * line to launch the celestial before creation in a slingshot fashion
  */
  canvas.addEventListener('mousedown', function(evt) {
    me.drawingStart = {
      x: evt.pageX - canvas.offsetLeft,
      y: evt.pageY - canvas.offsetTop
    };
    me.drawing = true;
  });

  /**
  * On mouse up we create the celestial. If there was drag and the celestial will be launched
  * we will have to set of coordinates. We use this coordinates to calculate the drag in each
  * direction and apply a force in that way. The speed is influenced by the distance between the two points,
  * i.e the lenght of the drag
  *
  */
  canvas.addEventListener('mouseup', function(evt) {
    me.drawing = false;
    var celestial = new Celestial(me.mousePosition.x, me.mousePosition.y, 2 * me.radiusIndex, '#ffffff');
    var direction = celestial.directionTo(me.drawingStart.x, me.drawingStart.y);
    var distance = celestial.distanceTo(me.drawingStart.x, me.drawingStart.y);

    var dragX = Math.abs(me.mousePosition.x - me.drawingStart.x) * Math.cbrt(distance) / 2;
    var dragY = Math.abs(me.mousePosition.y - me.drawingStart.y) * Math.cbrt(distance) / 2;

    celestial.applyForce({x: direction.x * dragX / 150, y: direction.y * dragY / 150});
    me.addObject(celestial);
  });

  /**
  * As the mouse moves we keep updating the coordinates. This is where the celestial will spawn if there's a click
  */
  canvas.addEventListener('mousemove', function(evt) {
    me.mousePosition = {
      x: evt.pageX - canvas.offsetLeft,
      y: evt.pageY - canvas.offsetTop
    };
  });

  /**
  * When the user moves the mouse wheel we increse or decrease the radiusIndex in order to alter
  * the size of the created Celestials
  */
  canvas.addEventListener('mousewheel', function(evt) {
    if(evt.wheelDelta < 0) {
      if(me.radiusIndex > 1) {
        me.radiusIndex --;
      }
    }else {
      if(me.radiusIndex < 10) {
        me.radiusIndex ++;
      }
    }
  });
};

/**
* Draws all the celestials in the universe
* In addition if the user is clicking and dragging it draws the reference line for this drag
*
* @param objectsArray         Array of celestial objects
*
*/
Universe.prototype.drawAll = function(objectsArray) {
  var me = this;
  me.clear();

  if(!objectsArray)
    objectsArray = me.objects;

  objectsArray.forEach(function(object) {
    me.draw(object);
  });

  if(me.drawing) {
    me.ctx.strokeStyle = '#F5D0A9';
    me.ctx.lineWidth = 1;
    me.ctx.beginPath();

    me.ctx.moveTo(me.drawingStart.x, me.drawingStart.y);
    me.ctx.lineTo(me.mousePosition.x, me.mousePosition.y);
    me.ctx.stroke();
  }

  var mI = document.getElementById('massIndex');
  if(mI)
    mI.innerHTML = me.radiusIndex;
};

/**
* Draws an individual celestial in the universe
*
* @param object         Celestial object
*
*/
Universe.prototype.draw = function(object) {
  this.ctx.fillStyle = object.fill;
  this.ctx.beginPath();
  this.ctx.arc(object.x, object.y, object.radius, 0, 2 * Math.PI);
  this.ctx.closePath();
  this.ctx.fill();
};

/**
* Clears the canvas
*
*/
Universe.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
};

/**
* Adds a Celestial object to the universe
*
*/
Universe.prototype.addObject = function(object) {
  this.objects.push(object);
  this.drawAll();
};

/**
* Start up function.
* calculateInterval calculates the forces that are being applied to each object.
* Each object is applying a force in the rest. This forces are all calculated and then
* resolved by calling the Celestial function resolveForces
*
* moveInterval moves the Universe's Celestials to their new position
*
*/
Universe.prototype.start = function() {
  var me = this;
  var calculateInterval = setInterval(function() {
    me.objects.forEach(function(object, index) {
      object.forces = [];
      me.objects.forEach(function(object2, index2) {
        if(index == index2) return false;
        
        var d = object.distanceTo(object2.x, object2.y);
        var a = me.Gravity.calculateAcceleration(object2.mass, d);
        var direction = object.directionTo(object2.x, object2.y);        
        object.forces.push( new Vector(a * direction.x, a * direction.y) );
      });

     
    });
     me.objects.forEach(function(object) {
      object.resolveForces(object.forces);
     });
    
  }, 200);

  var moveInterval = setInterval(function() {
    me.objects.forEach(function(object) {
      object.move();
    });
    me.detectCollision();
    me.drawAll();
  }, 10);
};

/**
* Detects if there's a collision between two Celestials
* Collision is detected by calculating the distance between two Celestials.
* If the distance is minor or equal the combined radius of the two Celestials then there's a collision
*
*/
Universe.prototype.detectCollision = function() {
  for(var i = 0; i < this.objects.length - 1; i++) {
    for(var j = i + 1; j < this.objects.length; j++) {
      var distance = this.objects[i].distanceTo(this.objects[j].x, this.objects[j].y);

      if(distance <= (this.objects[j].radius + this.objects[i].radius)) {
        this.mergeObjects(this.objects[i], this.objects[j]);
        continue;
      }
    }
  }
};

/**
* Merges two Celestials into one.
* The new Celestial position in X, Y, acceleration and radius is defined by the biggest size Celestial
*
*/
Universe.prototype.mergeObjects = function(object, object2) {
  var x = object.radius >= object2.radius ? object.x : object2.x;
  var y = object.radius >= object2.radius ? object.y : object2.y;
  var a = object.radius >= object2.radius ? object.acceleration : object2.acceleration;
  var r = object.radius >= object2.radius ? object.radius + object2.radius / 4 : object.radius / 4 + object2.radius;

  var newObject = new Celestial(x, y, r, '#ffffff', a);
  this.objects.push(newObject);
  this.deleteObject(object);
  this.deleteObject(object2);
};

/**
* Deletes a Celestial from the Universe
*
*/
Universe.prototype.deleteObject = function(object) {
  this.objects.splice(_.findIndex(this.objects, object), 1);
  delete object;
};
