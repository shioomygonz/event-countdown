const eventNameInput = document.getElementById("eventName");
const eventDateInput = document.getElementById("eventDate");
const startButton = document.getElementById("startButton");

const eventTitle = document.getElementById("eventTitle");
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const message = document.getElementById("message");

const eventOverlay = document.getElementById("eventStartedOverlay");
const closeOverlay = document.getElementById("closeOverlay");
const confettiContainer = document.getElementById("confettiContainer");

let countdownInterval;
let audioContext;

/* -------------------------
   AUDIO SETUP
------------------------- */

function prepareAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}

/* Short original electronic concert intro */
function playConcertBeat() {
    if (!audioContext) return;

    const now = audioContext.currentTime;

    // Bass hits
    const bassNotes = [110, 110, 146.83, 164.81, 220];

    bassNotes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sawtooth";
        oscillator.frequency.value = frequency;

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        const start = now + index * 0.28;

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);

        oscillator.start(start);
        oscillator.stop(start + 0.27);
    });

    // Bright synth notes
    const synthNotes = [
        { frequency: 523.25, delay: 1.45 },
        { frequency: 659.25, delay: 1.65 },
        { frequency: 783.99, delay: 1.85 },
        { frequency: 1046.50, delay: 2.05 }
    ];

    synthNotes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "square";
        oscillator.frequency.value = note.frequency;

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        const start = now + note.delay;

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

        oscillator.start(start);
        oscillator.stop(start + 0.25);
    });
}

/* -------------------------
   DJ VOICE
------------------------- */

function speakDJIntro(eventName) {
    if (!("speechSynthesis" in window)) {
        playConcertBeat();
        createConfetti();
        return;
    }

    speechSynthesis.cancel();

    const text =
        "ShioGonz Live presents. " +
        eventName +
        ". Get ready. The event starts now!";

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 0.9;
    speech.pitch = 0.75;
    speech.volume = 1;

    const voices = speechSynthesis.getVoices();

    const englishVoice =
        voices.find(
            voice =>
                voice.lang.startsWith("en") &&
                voice.name.toLowerCase().includes("male")
        ) ||
        voices.find(voice => voice.lang.startsWith("en")) ||
        voices[0];

    if (englishVoice) {
        speech.voice = englishVoice;
    }

    speech.onend = function () {
        playConcertBeat();
        createConfetti();
    };

    speechSynthesis.speak(speech);
}

/* -------------------------
   CONFETTI
------------------------- */

function createConfetti() {
    if (!confettiContainer) return;

    confettiContainer.innerHTML = "";

    const colors = [
        "#ff2ec4",
        "#8f5cff",
        "#00d9ff",
        "#ffd700",
        "#ff4d6d",
        "#ffffff"
    ];

    for (let i = 0; i < 120; i++) {
        const piece = document.createElement("div");

        piece.classList.add("confetti-piece");

        piece.style.left = Math.random() * 100 + "%";
        piece.style.background =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.animationDuration =
            2.5 + Math.random() * 3 + "s";

        piece.style.animationDelay =
            Math.random() * 1.5 + "s";

        piece.style.width =
            6 + Math.random() * 8 + "px";

        piece.style.height =
            10 + Math.random() * 14 + "px";

        confettiContainer.appendChild(piece);
    }

    setTimeout(() => {
        confettiContainer.innerHTML = "";
    }, 7000);
}

/* -------------------------
   FINAL CELEBRATION
------------------------- */

function showEventCelebration(eventName) {

    if (eventOverlay) {
        eventOverlay.classList.add("show");
    }

    /* Confetti starts immediately */
    createConfetti();

    /* DJ voice */
    setTimeout(() => {
        speakDJIntro(eventName);
    }, 500);
}

/* Close final screen */
if (closeOverlay) {
    closeOverlay.addEventListener("click", function () {

        eventOverlay.classList.remove("show");

        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
        }

        if (confettiContainer) {
            confettiContainer.innerHTML = "";
        }
    });
}

/* -------------------------
   COUNTDOWN
------------------------- */

startButton.addEventListener("click", function () {

    prepareAudio();

    const eventName = eventNameInput.value.trim();
    const eventDateValue = eventDateInput.value;

    if (eventName === "" || eventDateValue === "") {
        message.textContent =
            "Please enter an event name and date.";
        return;
    }

    const eventDate = new Date(eventDateValue).getTime();

    eventTitle.textContent = eventName;
    message.textContent = "";

    if (eventOverlay) {
        eventOverlay.classList.remove("show");
    }

    clearInterval(countdownInterval);

    updateCountdown();

    countdownInterval = setInterval(updateCountdown, 1000);

    function updateCountdown() {

        const now = new Date().getTime();
        const distance = eventDate - now;

        if (distance <= 0) {

            clearInterval(countdownInterval);

            daysElement.textContent = "0";
            hoursElement.textContent = "0";
            minutesElement.textContent = "0";
            secondsElement.textContent = "0";

            message.textContent =
                "The event has started!";

            showEventCelebration(eventName);

            return;
        }

        const days = Math.floor(
            distance / (1000 * 60 * 60 * 24)
        );

        const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        );

        const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) /
            (1000 * 60)
        );

        const seconds = Math.floor(
            (distance % (1000 * 60)) /
            1000
        );

        daysElement.textContent = days;
        hoursElement.textContent = hours;
        minutesElement.textContent = minutes;
        secondsElement.textContent = seconds;
    }
});
