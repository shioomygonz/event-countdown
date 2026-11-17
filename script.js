const eventNameInput = document.getElementById("eventName");
const eventDateInput = document.getElementById("eventDate");
const startButton = document.getElementById("startButton");

const eventTitle = document.getElementById("eventTitle");
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const message = document.getElementById("message");

const confettiContainer = document.getElementById("confettiContainer");

let countdownInterval;

let audioContext;
let musicBuffer;
let scheduledMusic;
let keepAudioAlive;

/* Preload the music file */
const musicFilePromise = fetch("./concert-intro.mp3")
    .then(response => {
        if (!response.ok) {
            throw new Error("Music file could not be loaded.");
        }

        return response.arrayBuffer();
    });

/* -------------------------
   PREPARE AND SCHEDULE MUSIC
------------------------- */

async function scheduleConcertMusic(eventTimestamp) {

    if (!audioContext) {
        audioContext =
            new (window.AudioContext || window.webkitAudioContext)();
    }

    /*
       The user physically pressed Start Countdown,
       so we unlock the audio system here.
    */
    if (audioContext.state === "suspended") {
        await audioContext.resume();
    }

    /*
       Keep the mobile audio system active,
       but completely silent.
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

    /* Load/decode music only once */
    if (!musicBuffer) {

        const arrayBuffer = await musicFilePromise;

        musicBuffer =
            await audioContext.decodeAudioData(
                arrayBuffer.slice(0)
            );
    }

    /* Cancel previous scheduled song */
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
       THIS is the important part:
       the song is scheduled now,
       but it will not be heard until
       the countdown reaches zero.
    */
    scheduledMusic.start(
        audioContext.currentTime +
        secondsUntilEvent
    );
}

/* -------------------------
   STOP MUSIC
------------------------- */

function stopConcertMusic() {

    if (scheduledMusic) {

        try {
            scheduledMusic.stop();
        } catch (error) {}

        scheduledMusic = null;
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

/* -------------------------
   EVENT STARTED
------------------------- */
function showEventCelebration() {

    if (eventOverlay) {
        eventOverlay.classList.add("show");
    }

    createConfetti();

    concertAudio.pause();
    concertAudio.currentTime = 0;
    concertAudio.volume = 1;

    concertAudio.play().catch(error => {
        console.log("Music playback error:", error);
    });
}


/* -------------------------
   CLOSE FINAL SCREEN
------------------------- */

if (closeOverlay) {


            eventOverlay.classList.remove("show");

            stopConcertMusic();

            if (confettiContainer) {
                confettiContainer.innerHTML = "";
            }
        }
    );
}

/* -------------------------
   START COUNTDOWN
------------------------- */

startButton.addEventListener(
    "click",
    async function () {

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

        /* Schedule music from this user click */
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
