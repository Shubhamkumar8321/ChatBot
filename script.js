document.addEventListener('DOMContentLoaded', () => {
  showWelcome();
});
const buttonContainer = document.getElementById('button-options');
const chatWindow = document.getElementById('chat-window');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let currentCommand = '';
let buttonTimeouts = [];

messageForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const usIn = messageInput.value.trim();
  if (!usIn) return;

  addMessage(usIn, 'user');

  switch (currentCommand) {
    case 'weather':
      fetchWeather(usIn);
      break;
    case 'calc':
      calculateExpression(usIn);
      break;
    case 'define':
      defineWord(usIn);
      break;
    default:
      addMessage("Let me think...", 'bot');
      try {
        const reply = await getHuggingFaceResponse(usIn);
        addMessage(reply, 'bot');
      } catch (err) {
        console.error(err);
        addMessage("Sorry, I couldn't get a response from the assistant.", 'bot');
      }
  }
  messageInput.value = '';
});
function addMessage(text, type) {
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  msg.innerHTML = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
function showWelcome() {
  addMessage("Hi User! I'm Shubham, your assistant.", 'bot');
  setTimeout(showMenu, 1000);
}
function showMenu() {
  currentCommand = '';
  buttonContainer.innerHTML = '';
  clearAllTimeouts();

  const options = [
    { label: "Weather", command: 'weather' },
    { label: "Calculator", command: 'calc' },
    { label: "Dictionary", command: 'define' }
  ];

  options.forEach((option, index) => {
    const timeout = setTimeout(() => {
      const btn = document.createElement('button');
      btn.innerText = option.label;
      btn.onclick = () => handleCommand(option.command);
      buttonContainer.appendChild(btn);
    }, index * 1000);
    buttonTimeouts.push(timeout);
  });
}
function showBackButton() {
  buttonContainer.innerHTML = '';
  clearAllTimeouts();

  const backButton = document.createElement('button');
  backButton.innerText = 'Back';
  backButton.onclick = () => {
    addMessage("Going back to main menu...", 'bot');
    showMenu();
  };
  buttonContainer.appendChild(backButton);
}
function clearAllTimeouts() {
  buttonTimeouts.forEach(timeout => clearTimeout(timeout));
  buttonTimeouts = [];
}
function handleCommand(command) {
  currentCommand = command;
  buttonContainer.innerHTML = '';
  showBackButton();

  switch (command) {
    case 'weather':
      addMessage("Enter a city name to get the weather:", 'bot');
      break;
    case 'calc':
      addMessage("Enter a math expression to calculate:", 'bot');
      break;
    case 'define':
      addMessage("Enter a word to get its definition:", 'bot');
      break;
  }
}
function fetchWeather(city) {
  const apiKey = '1d6ccf7eb2278bacb32e999aa2404167';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.cod === 200) {
        const weatherInfo = `${data.name}: ${data.main.temp}°C, ${data.weather[0].description}`;
        addMessage(weatherInfo, 'bot');
      } else {
        addMessage("City not found. Try again.", 'bot');
      }
    })
    .catch(() => {
      addMessage("Failed to fetch weather. Try again.", 'bot');
    });
}
function calculateExpression(expression) {
  try {
    const result = Function(`"use strict"; return (${expression})`)();
    addMessage(`${expression} = ${result}`, 'bot');
  } catch {
    addMessage("Invalid expression. Try again.", 'bot');
  }
}
function defineWord(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.title === "No Definitions Found") {
        addMessage("Word not found. Try again.", 'bot');
      } else {
        const definitions = data[0].meanings[0].definitions
          .map(def => `- ${def.definition}`)
          .join("<br>");
        addMessage(`<b>${word}</b>:<br>${definitions}`, 'bot');
      }
    })
    .catch(() => {
      addMessage("Failed to fetch definition. Try again.", 'bot');
    });
}
