let apiKey = "";
let SYSTEM_PROMPT = `당신은 텍스트 RPG 게임의 게임 마스터(GM)입니다. 
플레이어는 파트너 몬스터와 함께 미지의 세계를 탐험하는 테이머입니다.

[진행 규칙]
1. 항상 메시지 상단에 [플레이어 HP: 100/100] 처럼 현재 체력을 표시하세요. 전투나 이벤트로 체력이 깎이면 이를 반영해야 합니다.
2. 현재 상황이나 나타난 몬스터의 모습을 2~3문장으로 짧고 흥미롭게 묘사하세요.
3. 묘사 후, 플레이어가 선택할 수 있는 행동 번호를 2~3가지 제시하세요.
4. 플레이어가 번호나 행동을 입력하면, 그에 따른 결과와 다음 상황을 이어가세요. 만약 주어진 선택지를 고르는 것 외의 다른 행동을 하면 그것에 맞춰 다음 상황을 이어가세요. 
5. 플레이어의 행동을 이해하지 못하면 그냥 게임오버 시키세요. 
6. 끝없이 이어지는 게임이 아닌 적절한 상황에 게임의 엔딩을 만드세요. (해피엔딩 새드엔등 등)

처음 시작은 숲의 입구에서 야생 몬스터와 마주친 상황으로 바로 시작해 주세요!
마지막 행동 선택지 입력시 반드시 번호 앞에 줄바꿈 문자를 넣어주세요. (예: \n1. 공격한다 \n2. 아이템을 사용한다)`;
let chats = [];
let myInput;
let receiving = false;
let startPrompt = {
  role: 'user',
  parts: [{
    text: `[게임 규칙]
1. 현재 게임 상황을 AI가 설명해줍니다.
2. 설명에 맞춰 주어진 선택지를 고르거나 원하는 행동을 입력하십시오.
3. 선택지를 고를 시에는 "1" 혹은 "1번" 이렇게 대답하십시오.
4. 선택지에 없는 원하는 행동을 할 때는 행동을 명확하게 상황에 맞춰서 입력하십시오.
5. 즐겁게 탐험하십시오!`
  }]
};
let scrollOffset = 0;

function setup() {
  createCanvas(640, windowHeight - 50);
  myInput = createInput()
  myInput.position(0, windowHeight - 50);
  myInput.style('width', '618px');
  myInput.style('height', '20px');
  myInput.style('font-size', '15px');
  myInput.style('padding', '10px');
  myInput.style('border', '1px solid #ccc');
  myInput.style('border-radius', '5px');
  myInput.style('outline', 'none');
  console.log(typeof setAPIKey)

  if (typeof setAPIKey === "function") {
    setAPIKey();
  } else {
    apiKey = prompt("API Key를 입력하세요:");
  }

  console.log(apiKey)
  chats.push(startPrompt);
  displayChats();
  generateContent(chats);
}

function draw() {

}

function keyPressed() {
  if (key === 'Enter' && !receiving) {
    let userInput = myInput.value().trim()
    if (userInput === "") {
      return;
    }
    myInput.value("")
    myInput.attribute("disabled", 'true')
    console.log(userInput)
    chats.push({
      role: 'user',
      parts: [
        {
          text: userInput,
        }
      ]
    });
    displayChats();
    generateContent(chats)
  }
}


async function generateContent(chats) {
  receiving = true;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';
  fetch(url, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: SYSTEM_PROMPT,
          },
        ],
      },
      contents: chats,
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      myInput.removeAttribute('disabled');
      return response.json();
    })
    .then(data => {
      console.log(data);
      receiving = false;
      modelMessage = data.candidates[0].content.parts[0].text;
      chats.push({
        role: 'model',
        parts: [
          {
            text: modelMessage,
          }
        ]
      });
      console.log(modelMessage);
      displayChats();
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function formatText(text, limit) {
  let lines = text.split('\n');
  let result = '';

  for (let i = 0; i < lines.length; i++) {
    let currentLine = lines[i];
    let index = 0;

    if (currentLine === "") {
      result += '\n';
      continue;
    }

    while (index < currentLine.length) {
      if (currentLine.length - index <= limit) {
        result += currentLine.substring(index) + '\n';
        break;
      }

      let chunk = currentLine.substring(index, index + limit + 1);
      let lastSpaceIndex = chunk.lastIndexOf(' ');

      if (lastSpaceIndex === -1 || lastSpaceIndex === 0) {
        result += currentLine.substring(index, index + limit) + '\n';
        index += limit;
      } else {
        result += currentLine.substring(index, index + lastSpaceIndex) + '\n';
        index += lastSpaceIndex + 1;
      }
    }
  }
  return result.trimEnd();
}

function displayChats() {
  background(220);
  let chatLength = chats.length;
  let chatBoxSize = [];
  let chatBoxHeight = [];
  
  let formattedTexts = []; 

  textSize(13); 
  textLeading(18);
  
  let padX = 10;
  let padY = 10;

  for (let i = 0; i < chatLength; i++) {
    let originalText = chats[i].parts[0].text;
    let wrappedText = formatText(originalText, 30); 
    formattedTexts.push(wrappedText);

    let lines = wrappedText.split('\n');
    let lineCount = lines.length;
    
    let maxLineLength = 0;
    for (let j = 0; j < lines.length; j++) {
        if (lines[j].length > maxLineLength) {
            maxLineLength = lines[j].length;
        }
    }

    let calcWidth = (maxLineLength * 12) + (padX * 2);
    let calcHeight = (lineCount * 18) + (padY * 2);

    chatBoxSize.push({
      x: min(calcWidth, 450), 
      y: max(35, calcHeight)
    });
    chatBoxHeight.push(0);
  }
  
  let currentY = height - 30;
  for (let i = chatLength - 1; i >= 0; i--) {
    currentY -= chatBoxSize[i].y;
    chatBoxHeight[i] = currentY;
    currentY -= 10;
  }

  let maxScroll = 0;
  if (chatLength > 0 && chatBoxHeight[0] < 60) {
    maxScroll = 60 - chatBoxHeight[0];
  }
  scrollOffset = constrain(scrollOffset, 0, maxScroll);
  
  for (let i = chatLength - 1; i >= 0; i--) {
    let boxX = chatBoxSize[i].x;
    let boxY = chatBoxSize[i].y;
    let xPos = (chats[i].role == 'user') ? 630 - boxX : 10;
    
    let finalY = chatBoxHeight[i] + scrollOffset;
    
    if (finalY + boxY > 0) { 
      fill(255);
      rect(xPos, finalY, boxX, boxY, 8);
      fill(0);
      
      textAlign(CENTER, TOP);
      let boxCenterX = xPos + boxX / 2;
      text(formattedTexts[i], boxCenterX, finalY + padY); 
    }
  }

  fill(0);
  rect(0, 0, width, 50);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("텍스트 RPG", width/2, 25);
}

function mouseWheel(event) {
  scrollOffset -= event.delta;
  displayChats();
  return false;
}