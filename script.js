const eventNameInput = document.getElementById("eventName");
const eventDateInput = document.getElementById("eventDate");
const startButton = document.getElementById("startButton");

const eventTitle = document.getElementById("eventTitle");
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const message = document.getElementById("message");

let countdownInterval;

startButton.addEventListener("click", function () {

    const eventName = eventNameInput.value.trim();
    const eventDateValue = eventDateInput.value;

    if (eventName === "" || eventDateValue === "") {
        message.textContent = "Please enter an event name and date.";
        return;
    }

    const eventDate = new Date(eventDateValue).getTime();

    eventTitle.textContent = eventName;
    message.textContent = "";

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

            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));

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