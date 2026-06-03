let apiKey = ""
let SYSTEM_PROMPT = "고양이 처럼 응답해줘. 이모지를 항상 붙이기."
let chats = []
let myInput;
let receiving = false;

function setup() {
  createCanvas(640, 480);
  myInput = createInput()
  myInput.position(0, 480);
  myInput.style('width', '618px');
  myInput.style('height', '40px');
  myInput.style('font-size', '20px');
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
}

function draw() {
  background(220);
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
      modelMessage = data.candidates[0].content.parts[0].text.replace(/[\n\r]/g, ' ');
      chats.push({
        role: 'model',
        parts: [
          {
            text: modelMessage,
          }
        ]
      });
      console.log(modelMessage);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}