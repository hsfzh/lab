function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
}

function draw() {
  background(220);
  fill(random(0, 255), random(0, 255), random(0, 255));
  rect(width/2, height/2, 30, 30);
}
