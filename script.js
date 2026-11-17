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

/* MUSIC */
const concertAudio = new Audio("./concert-intro.mp3");
concertAudio.preload = "auto";

/* CONFETTI */
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

/* FINAL CONCERT SCREEN */
function showEventCelebration() {

    if (eventOverlay) {
        eventOverlay.classList.add("show");
    }

    createConfetti();

    /* Music has already been activated by Start Countdown */
    concertAudio.loop = false;
    concertAudio.currentTime = 0;
    concertAudio.volume = 1;
}

/* CLOSE CONCERT SCREEN */
if (closeOverlay) {
    closeOverlay.addEventListener("click", function () {

        eventOverlay.classList.remove("show");

        concertAudio.pause();
        concertAudio.currentTime = 0;

        if (confettiContainer) {
            confettiContainer.innerHTML = "";
        }
    });
}

/* START COUNTDOWN */
startButton.addEventListener("click", function () {

    const eventName = eventNameInput.value.trim();
    const eventDateValue = eventDateInput.value;

    if (eventName === "" || eventDateValue === "") {
        message.textContent =
            "Please enter an event name and date.";
        return;
    }

    /*
       Start the music silently while the user is
       physically clicking the button.
       This avoids Chrome autoplay blocking it later.
    */
    concertAudio.pause();
    concertAudio.currentTime = 0;
    concertAudio.volume = 0;
    concertAudio.loop = true;

    concertAudio.play().catch(error => {
        console.log("Audio activation error:", error);
    });

    const eventDate = new Date(eventDateValue).getTime();

    eventTitle.textContent = eventName;
    message.textContent = "";

    if (eventOverlay) {
        eventOverlay.classList.remove("show");
    }

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
