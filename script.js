const recognition = new webkitSpeechRecognition();
recognition.lang = "pl-PL";
recognition.continuous = true;

let speaking = false;
let awaitingConfirmation = false;

const button = document.querySelector("#microphon");
const list = document.querySelector("#shopping-list");
const dot = document.querySelector("#dot");
const echo = document.querySelector("#echo");

button.addEventListener("click", toggleRecognition);

// DZIAŁAJĄCE pulsowanie tylko kiedy mówisz
recognition.onspeechstart = () => {
  dot.classList.add("pulse");
};

recognition.onspeechend = () => {
  dot.classList.remove("pulse");
};

recognition.onresult = (event) => {
  clearEcho();
  const current = event.resultIndex;

  for (let i = current; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      const transcript = event.results[i][0].transcript.trim().toLowerCase();
      console.log("Rozpoznano:", transcript);

      if (awaitingConfirmation) {
        handleConfirmation(transcript);
      } else if (transcript.startsWith("usuń")) {
        handleRemoveCommand(transcript);
      } else {
        addItem(transcript);
        setEcho(`Dodano: "${transcript}"`);
      }
    }
  }
};

function toggleRecognition() {
  if (speaking) {
    recognition.stop();
  } else {
    recognition.start();
  }

  speaking = !speaking;
  button.textContent = speaking ? "Click to Stop" : "Say product name";
}

function addItem(name) {
  const li = document.createElement("li");
  li.textContent = name;
  list.appendChild(li);
}

function setEcho(msg) {
  echo.textContent = msg;
}

function clearEcho() {
  echo.textContent = "";
}

function handleRemoveCommand(command) {
  const items = Array.from(list.querySelectorAll("li"));

  if (command.includes("usuń wszystko") || command.includes("usuń wszystkie")) {
    awaitingConfirmation = "clearAll";
    setEcho("Czy na pewno chcesz usunąć wszystkie elementy? Powiedz tak lub nie.");
    return;
  }

  if (command.includes("usuń ostatni")) {
    if (items.length > 0) {
      items[items.length - 1].remove();
      setEcho("Usunięto ostatni element.");
    } else {
      setEcho("Lista jest pusta.");
    }
    return;
  }

  const orderWords = {
    "pierwszy": 0,
    "drugi": 1,
    "trzeci": 2,
    "czwarty": 3,
    "piąty": 4,
    "szósty": 5,
    "siódmy": 6,
    "ósmy": 7,
    "dziewiąty": 8,
    "dziesiąty": 9
  };

  for (const [word, index] of Object.entries(orderWords)) {
    if (command.includes(word)) {
      if (items[index]) {
        items[index].remove();
        setEcho(`Usunięto element nr ${index + 1}`);
      } else {
        setEcho("Nie ma tyle elementów na liście.");
      }
      return;
    }
  }

  const numberMatch = command.match(/usuń\s+(\d+)/);
  if (numberMatch) {
    const index = parseInt(numberMatch[1], 10) - 1;
    if (!isNaN(index) && items[index]) {
      items[index].remove();
      setEcho(`Usunięto element nr ${index + 1}`);
    } else {
      setEcho("Nie ma tyle elementów na liście.");
    }
    return;
  }

  const productName = command.replace("usuń", "").trim();
  const itemToRemove = items.find(item =>
    item.textContent.toLowerCase().includes(productName)
  );
  if (itemToRemove) {
    itemToRemove.remove();
    setEcho(`Usunięto "${productName}"`);
  } else {
    setEcho(`Nie znaleziono "${productName}"`);
  }
}

function handleConfirmation(response) {
  if (awaitingConfirmation === "clearAll") {
    if (response.includes("tak")) {
      list.innerHTML = "";
      setEcho("Usunięto wszystkie elementy.");
    } else if (response.includes("nie")) {
      setEcho("Anulowano usuwanie.");
    } else {
      setEcho("Nie zrozumiałem. Powiedz tak lub nie.");
      return;
    }
  }
  awaitingConfirmation = false;
}
