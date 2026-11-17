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
let concertBuffer;
let currentSource;

/* -------------------------
   PREPARE MUSIC FOR MOBILE
------------------------- */

async function prepareConcertAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        await audioContext.resume();
    }

    if (!concertBuffer) {
        const response = await fetch("./concert-intro.mp3");
        const arrayBuffer = await response.arrayBuffer();
        concertBuffer = await audioContext.decodeAudioData(arrayBuffer);
    }
}

/* -------------------------
   PLAY MUSIC
------------------------- */

function playConcertMusic() {
    if (!audioContext || !concertBuffer) {
        console.log("Concert audio is not ready.");
        return;
    }

    if (currentSource) {
        try {
            currentSource.stop();
        } catch (error) {}
    }

    currentSource = audioContext.createBufferSource();
    currentSource.buffer = concertBuffer;
    currentSource.connect(audioContext.destination);
    currentSource.start(0);
}

/* -------------------------
   STOP MUSIC
------------------------- */

function stopConcertMusic() {
    if (currentSource) {
        try {
            currentSource.stop();
        } catch (error) {}

        currentSource = null;
    }
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

    for (let i = 0; i < 150; i++) {
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
   EVENT STARTED
------------------------- */

function showEventCelebration() {

    if (eventOverlay) {
        eventOverlay.classList.add("show");
    }

    createConfetti();

    playConcertMusic();
}

/* -------------------------
   CLOSE FINAL SCREEN
------------------------- */

if (closeOverlay) {
    closeOverlay.addEventListener("click", function () {

        eventOverlay.classList.remove("show");

        stopConcertMusic();

        if (confettiContainer) {
            confettiContainer.innerHTML = "";
        }
    });
}

/* -------------------------
   START COUNTDOWN
------------------------- */

startButton.addEventListener("click", async function () {

    const eventName = eventNameInput.value.trim();
    const eventDateValue = eventDateInput.value;

    if (eventName === "" || eventDateValue === "") {
        message.textContent =
            "Please enter an event name and date.";
        return;
    }

    /*
       Prepare audio because this click is a real
       user action. Music will NOT play yet.
    */
    try {
        await prepareConcertAudio();
    } catch (error) {
        console.log("Audio preparation error:", error);
    }

    const eventDate = new Date(eventDateValue).getTime();

    eventTitle.textContent = eventName;
    message.textContent = "";

    if (eventOverlay) {
        eventOverlay.classList.remove("show");
    }

    stopConcertMusic();

    clearInterval(countdownInterval);

    updateCountdown();

    countdownInterval =
        setInterval(updateCountdown, 1000);

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

            showEventCelebration();

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
