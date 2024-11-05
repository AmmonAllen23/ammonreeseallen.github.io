function openGameModal() {
    document.getElementById("gameModal").style.display = "flex";
    startGame(); // Start the game here
}

function closeGameModal() {
    document.getElementById("gameModal").style.display = "none";
    gameOver = true; // Stop the game when the modal closes
}