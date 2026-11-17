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

let countdownInterval;
let audioContext;

/* Prepare sound after the user clicks the button */
function prepareAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}

/* Celebration alarm */
function playCelebrationSound() {
    if (!audioContext) return;

    const notes = [
        { frequency: 523.25, delay: 0 },
        { frequency: 659.25, delay: 0.25 },
        { frequency: 783.99, delay: 0.50 },
        { frequency: 1046.50, delay: 0.75 }
    ];

    notes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.value = note.frequency;

        const startTime = audioContext.currentTime + note.delay;

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(
            0.01,
            startTime + 0.35
        );

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.35);
    });
}

/* Show celebration screen */
function showEventCelebration() {
    playCelebrationSound();

    if (eventOverlay) {
        eventOverlay.classList.add("show");
    }
}

/* Close celebration screen */
if (closeOverlay) {
    closeOverlay.addEventListener("click", function () {
        eventOverlay.classList.remove("show");
    });
}

startButton.addEventListener("click", function () {

    prepareAudio();

    const eventName = eventNameInput.value.trim();
    const eventDateValue = eventDateInput.value;

    if (eventName === "" || eventDateValue === "") {
        message.textContent = "Please enter an event name and date.";
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

            message.textContent = "The event has started!";

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
