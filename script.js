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
const confettiContainer = document.getElementById("confettiContainer");

let countdownInterval;

let audioContext;
let musicBuffer;
let scheduledMusic;
let keepAudioAlive;

/* --------------------------------
   PRELOAD MUSIC
-------------------------------- */

const musicFilePromise = fetch("./concert-intro.mp3")
    .then(response => {
        if (!response.ok) {
            throw new Error("Music file could not be loaded.");
        }

        return response.arrayBuffer();
    });

/* --------------------------------
   PREPARE AND SCHEDULE MUSIC
-------------------------------- */

async function scheduleConcertMusic(eventTimestamp) {

    if (!audioContext) {
        audioContext =
            new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        await audioContext.resume();
    }

    /*
       Keep the mobile audio system active silently.
       Nothing should be heard here.
    */
    if (!keepAudioAlive) {

        const oscillator = audioContext.createOscillator();
        const silentGain = audioContext.createGain();

        silentGain.gain.value = 0.00001;

        oscillator.connect(silentGain);
        silentGain.connect(audioContext.destination);

        oscillator.start();

        keepAudioAlive = oscillator;
    }

    /*
       Load the MP3 only once.
    */
    if (!musicBuffer) {

        const arrayBuffer = await musicFilePromise;

        musicBuffer =
            await audioContext.decodeAudioData(
                arrayBuffer.slice(0)
            );
    }

    stopConcertMusic();

    const secondsUntilEvent =
        Math.max(
            0,
            (eventTimestamp - Date.now()) / 1000
        );

    scheduledMusic =
        audioContext.createBufferSource();

    scheduledMusic.buffer = musicBuffer;

    scheduledMusic.connect(
        audioContext.destination
    );

    /*
       The music is scheduled now,
       but should begin when the timer reaches zero.
    */
    scheduledMusic.start(
        audioContext.currentTime +
        secondsUntilEvent
    );
}

/* --------------------------------
   STOP MUSIC
-------------------------------- */

function stopConcertMusic() {

    if (scheduledMusic) {

        try {
            scheduledMusic.stop();
        } catch (error) {
            // Already stopped
        }

        scheduledMusic = null;
    }
}

/* --------------------------------
   CONFETTI
-------------------------------- */

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

        const piece =
            document.createElement("div");

        piece.classList.add(
            "confetti-piece"
        );

        piece.style.left =
            Math.random() * 100 + "%";

        piece.style.background =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

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

/* --------------------------------
   EVENT START CELEBRATION
-------------------------------- */

function showEventCelebration() {

    if (eventOverlay) {
        eventOverlay.classList.add("show");
    }

    createConfetti();
}

/* --------------------------------
   START COUNTDOWN
-------------------------------- */

startButton.addEventListener(
    "click",
    function () {

        const eventName =
            eventNameInput.value;

        const eventDateValue =
            eventDateInput.value;

        if (
            eventName === "" ||
            eventDateValue === ""
        ) {

            message.textContent =
                "Please select an event and date.";

            return;
        }

        const eventDate =
            new Date(
                eventDateValue
            ).getTime();

        /*
           IMPORTANT:
           Prepare the music in the background.
           We DO NOT wait for it before starting
           the countdown.
        */
        scheduleConcertMusic(eventDate)
            .catch(error => {
                console.log(
                    "Audio preparation error:",
                    error
                );
            });

        eventTitle.textContent =
            eventName;

        message.textContent = "";

        if (eventOverlay) {
            eventOverlay.classList.remove("show");
        }

        clearInterval(
            countdownInterval
        );

        /*
           Start immediately.
        */
        updateCountdown();

        countdownInterval =
            setInterval(
                updateCountdown,
                1000
            );

        function updateCountdown() {

            const now =
                Date.now();

            const distance =
                eventDate - now;

            if (distance <= 0) {

                clearInterval(
                    countdownInterval
                );

                daysElement.textContent = "0";
                hoursElement.textContent = "0";
                minutesElement.textContent = "0";
                secondsElement.textContent = "0";

                message.textContent =
                    "The event has started!";

                showEventCelebration();

                return;
            }

            const days =
                Math.floor(
                    distance /
                    (1000 * 60 * 60 * 24)
                );

            const hours =
                Math.floor(
                    (
                        distance %
                        (1000 * 60 * 60 * 24)
                    ) /
                    (1000 * 60 * 60)
                );

            const minutes =
                Math.floor(
                    (
                        distance %
                        (1000 * 60 * 60)
                    ) /
                    (1000 * 60)
                );

            const seconds =
                Math.floor(
                    (
                        distance %
                        (1000 * 60)
                    ) /
                    1000
                );

            daysElement.textContent =
                days;

            hoursElement.textContent =
                hours;

            minutesElement.textContent =
                minutes;

            secondsElement.textContent =
                seconds;
        }
    }
);
