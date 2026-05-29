let API_KEY;

function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
  if(config && config.API_KEY){
    API_KEY = config.API_KEY;
  } else {
    API_KEY = prompt("API 키를 입력해주세요.");
  }
}

function draw() {
  background(220);
}
