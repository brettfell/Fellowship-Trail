console.log("Hello Middle-earth: The Fellowship Trail engine is initialized.");

const startBtn = document.getElementById('start-btn');
const statusMessage = document.getElementById('status-message');

startBtn.addEventListener('click', () => {
    statusMessage.innerText = "The Ring goes south. Your journey begins!";
    statusMessage.style.color = "#fff";
    startBtn.style.display = "none";
    console.log("Journey started.");
});
