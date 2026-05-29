let API_KEY;

function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
  if(config.API_KEY){
    API_KEY = config.API_KEY;
  } else {
    API_KEY = prompt("API 키를 입력해주세요.");
  }
}

function draw() {
  background(220);
  fill(random(0, 255), random(0, 255), random(0, 255));
  rect(width/2, height/2, 30, 30);
}
