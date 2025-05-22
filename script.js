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
  const text = messageInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');

  if (currentCommand === 'weather') {
    fetchWeather(text);
  } else if (currentCommand === 'calc') {
    calculateExpression(text);
  } else if (currentCommand === 'define') {
    defineWord(text);
  } else {
    addMessage("Let me think...", 'bot');
    try {
      const reply = await getHuggingFaceResponse(text);
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
  addMessage("👋 Hi User! I'm Shubham, your assistant.", 'bot');
  setTimeout(showMenu, 1000);
}

function showMenu() {
  currentCommand = '';
  buttonContainer.innerHTML = '';
  clearTimeouts();

  const options = [
    { label: "🌦️ Weather", command: 'weather' },
    { label: "🧮 Calculator", command: 'calc' },
    { label: "📖 Dictionary", command: 'define' }
  ];

  options.forEach((opt, i) => {
    const timeout = setTimeout(() => {
      const btn = document.createElement('button');
      btn.innerText = opt.label;
      btn.onclick = () => handleButton(opt.command);
      buttonContainer.appendChild(btn);
    }, i * 1000);
    buttonTimeouts.push(timeout);
  });
}

function showBackButton() {
  buttonContainer.innerHTML = '';
  clearTimeouts();

  const backBtn = document.createElement('button');
  backBtn.innerText = 'Back';
  backBtn.onclick = () => {
    addMessage("Going back to main menu...", 'bot');
    showMenu();
  };
  buttonContainer.appendChild(backBtn);
}

function clearTimeouts() {
  buttonTimeouts.forEach(t => clearTimeout(t));
  buttonTimeouts = [];
}

function handleButton(command) {
  currentCommand = command;
  buttonContainer.innerHTML = '';
  showBackButton();

  if (command === 'weather') {
    addMessage("Enter a city name to get the weather 🌦️:", 'bot');
  } else if (command === 'calc') {
    addMessage("Enter a math expression to calculate:", 'bot');
  } else if (command === 'define') {
    addMessage("Enter a word to get its definition 📖:", 'bot');
  }
}

// APIs for Weather, Calculator, and Dictionary

function fetchWeather(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=1d6ccf7eb2278bacb32e999aa2404167&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod === 200) {
        addMessage(`${data.name}: ${data.main.temp}°C, ${data.weather[0].description}`, 'bot');
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
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    .then(res => res.json())
    .then(data => {
      if (data.title === "No Definitions Found") {
        addMessage("Word not found. Try again.", 'bot');
      } else {
        const defs = data[0].meanings[0].definitions.map(d => `- ${d.definition}`).join("<br>");
        addMessage(`<b>${word}</b>:<br>${defs}`, 'bot');
      }
    })
    .catch(() => {
      addMessage("Failed to fetch definition. Try again.", 'bot');
    });
}