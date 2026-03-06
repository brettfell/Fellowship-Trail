// The Fellowship Trail - Game State v1.0

const defaultState = {
    day: 1,
    distanceTraveled: 0,
    totalDistance: 1800, // Miles to Mount Doom
    ringCorruption: 0,   // If this hits 100, Game Over
    pace: 'Steady',      // Options: Cautious, Steady, Grueling
    rations: 'Filling',  // Options: Bare Bones, Meager, Filling
    
    // Inventory
    inventory: {
        lembasBread: 200,  // Daily food supply
        athelas: 5,        // Healing herb (Kingsfoil)
        silverPennies: 150 // Currency for trading at safe havens
    },

    // The Party
    party: [
        { name: "Frodo", isAlive: true, isRingbearer: true },
        { name: "Sam", isAlive: true, isRingbearer: false },
        { name: "Aragorn", isAlive: true, isRingbearer: false },
        { name: "Legolas", isAlive: true, isRingbearer: false },
        { name: "Gimli", isAlive: true, isRingbearer: false },
        { name: "Gandalf", isAlive: true, isRingbearer: false },
        { name: "Boromir", isAlive: true, isRingbearer: false },
        { name: "Merry", isAlive: true, isRingbearer: false },
        { name: "Pippin", isAlive: true, isRingbearer: false }
    ],
    
    // Tracking overall party health (0-100)
    partyHealth: 100,
    currentLocation: 'Rivendell'
};

// Deep clone the default state so we can reset easily later
let state = JSON.parse(JSON.stringify(defaultState));

console.log("Game State Initialized:", state);

const startBtn = document.getElementById('start-btn');
const statusMessage = document.getElementById('status-message');

startBtn.addEventListener('click', () => {
    statusMessage.innerText = "The Ring goes south. Your journey begins!";
    statusMessage.style.color = "#fff";
    startBtn.style.display = "none";
    console.log("Journey started. Next stop: The Mines of Moria.");
});
