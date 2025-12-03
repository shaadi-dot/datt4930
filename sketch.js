//Flocking code from: https://p5js.org/examples/classes-and-objects-flocking/
//Photo by Logan Voss on Unsplash: https://unsplash.com/photos/the-image-shows-static-noise-on-a-blue-screen-dI8klOtC5Og
//Trail code from: https://www.youtube.com/watch?v=vqE8DMfOajk
      
let flock;
let bg;
let colorAmount = 0;
let blurAmount = 0;
let separateAmount = 35;
let birdImg;

function preload(){
  //the background image
  bg = loadImage("static.jpg");
  
  // the bird image
  birdImg = loadImage("bird_image.png");
}

function setup() {
  //createCanvas(1920, 1080);
  createCanvas(1280, 720);

  flock = new Flock();

  // Add an initial set of boids into the system (50)
  for (let i = 0; i < 20; i++) {
    let b = new Boid(width / 2, height / 2);
    flock.addBoid(b);
  }
  
}

function draw() {
  background(0);
  image(bg, 0, 0, width, height);
  
  colorMode(HSB, 255)
  tint(colorAmount, 100, 255);
  filter(BLUR, blurAmount/10)
  print(colorAmount);
  
  flock.run();
  
  //changes hue with up and down
  if (keyIsDown(UP_ARROW) === true && colorAmount <= 255) {
    colorAmount += 1;
  }
  
  if (keyIsDown(DOWN_ARROW) === true && colorAmount >= 0) {
    colorAmount -= 1;
  }
  
  //adds and removes blur with left and right
  if (keyIsDown(RIGHT_ARROW) === true && blurAmount <= 255) {
    blurAmount += 1;
  }
  
  if (keyIsDown(LEFT_ARROW) === true && blurAmount >= 0) {
    blurAmount -= 1;
  }
  
  //changes distance between boids with shift and control
  if (keyIsDown(SHIFT) === true && separateAmount <= 300) {
    separateAmount += 2;
  }
  
  if (keyIsDown(CONTROL) === true && separateAmount >= 25) {
    separateAmount -= 2;
  }
  
}


function keyPressed(){
  //save screenshot
  if (key === 's') {
    save("art_screenshot.png");
  }
  
  //add and remove boids with q and e
  if (key === 'q') {
    flock.addBoid(new Boid(width / 2, height / 2));
  }
  
  if (key === 'w') {
    flock.deleteBoid();
  }
}

// Flock class to manage the array of all the boids
class Flock {
  constructor() {
    // Initialize the array of boids
    this.boids = [];
  }

  run() {
    for (let boid of this.boids) {
      // Pass the entire list of boids to each boid individually
      boid.run(this.boids);
    }
  }
  
  //adds and removes boids
  addBoid(b) {
    this.boids.push(b);
  }
  
  deleteBoid(b) {
    this.boids.pop();
  }
}

class Boid {
  constructor(x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.size = 5.0;
    this.history = [];
    // Maximum speed
    this.maxSpeed = 3;

    // Maximum steering force
    this.maxForce = 0.05;
    colorMode(HSB);
    this.color = color(255);
    
  }

  run(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
  }

  applyForce(force) {
    // We could add mass here if we want: A = F / M
    this.acceleration.add(force);
  }

  // We accumulate a new acceleration each time based on three rules
  flock(boids) {
    let separation = this.separate(boids);
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);

    // Arbitrarily weight these forces
    separation.mult(1.5);
    alignment.mult(1.0);
    cohesion.mult(1.0);

    // Add the force vectors to acceleration
    this.applyForce(separation);
    this.applyForce(alignment);
    this.applyForce(cohesion);
  }

  // Method to update location
  update() {
    // Update velocity
    this.velocity.add(this.acceleration);

    // Limit speed
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
    
    //creating the dot trail
    
    var v = createVector(this.position.x, this.position.y)
    if (this.position.x % 10 <= 1 && this.position.y % 10 <= 1){
    this.history.push(v)
    }
    noStroke();
    fill(255);
    for (var i=0; i < this.history.length; i++){
      var pos = this.history[i];
      push();
      translate(pos.x, pos.y);
      //options
      //drawStar(0, 0, 1, 3, 5); // x, y, innerRadius, outerRadius, points
      drawStar(0, 0, 0.5, 2, 5); // x, y, innerRadius, outerRadius, points
      
      pop();
    }
    function drawStar(x, y, radius1, radius2, npoints) {
      let angle = TWO_PI / npoints;
      let halfAngle = angle / 2.0;
      beginShape();
      for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
      }
      endShape(CLOSE);
    }
  }
  
  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) {
    // A vector pointing from the location to the target
    let desired = p5.Vector.sub(target, this.position);

    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxSpeed);

    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.velocity);

    // Limit to maximum steering force
    steer.limit(this.maxForce);
    return steer;
  }

  render() {
    // Draw a triangle rotated in the direction of velocity
    
    //this is the cursor shape
    let theta = this.velocity.heading() + radians(90);
    //fill(this.color);
    //stroke(0);
    //push();
    //translate(this.position.x, this.position.y);
    //rotate(theta);
    //beginShape();
    //vertex(0, -this.size * 2);
    //vertex(-this.size, this.size * 2);
    //vertex(this.size, this.size * 2);
    //endShape(CLOSE);
    //pop();
    
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    // Draw the image centered on the boid
    imageMode(CENTER);
    image(birdImg, 0, 0, this.size * 9, this.size * 9); // adjust size multiplier as needed
    pop();
  }

  // Wraparound
  borders() {
    if (this.position.x < -this.size) {
      this.velocity = createVector(random(0,1), random(-1, 1));
    }

    if (this.position.y < -this.size) {
      this.velocity = createVector(random(-1, 1), random(0, 1));
    }

    if (this.position.x > width + this.size) {
      this.velocity = createVector(random(-1, 0), random(-1, 1));
    }

    if (this.position.y > height + this.size) {
      this.velocity = createVector(random(-1, 1), random(-1, 0));
    }
  }

  // Separation
  // Method checks for nearby boids and steers away
  separate(boids) {
    let desiredSeparation = separateAmount;
    let steer = createVector(0, 0);
    let count = 0;

    // For every boid in the system, check if it's too close
    for (let boid of boids) {
      let distanceToNeighbor = p5.Vector.dist(this.position, boid.position);

      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if (distanceToNeighbor > 0 && distanceToNeighbor < desiredSeparation) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.position, boid.position);
        diff.normalize();

        // Scale by distance
        diff.div(distanceToNeighbor);
        steer.add(diff);

        // Keep track of how many
        count++;
      }
    }

    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  align(boids) {
    let neighborDistance = 200;
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  // Cohesion
  // For the average location (i.e., center) of all nearby boids, calculate steering vector towards that location
  cohesion(boids) {
    let neighborDistance = 200;
    let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum); // Steer towards the location
    } else {
      return createVector(0, 0);
    }
  }
} // class Boid

