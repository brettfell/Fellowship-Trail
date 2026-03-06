// The Book's Burden - Game Engine v1.2 (Landmarks)

const defaultState = {
    day: 1,
    distanceTraveled: 0,
    totalDistance: 2000, 
    curseLevel: 0,      
    pace: 'Steady',      
    rations: 'Normal',  
    
    inventory: {
        food: 300,      
        medicine: 5,     
        currency: 150    
    },

    party: [
        { name: "You (Main Character)", isAlive: true, health: 100, isMain: true },
        { name: "Friend 1", isAlive: true, health: 100 },
        { name: "Friend 2", isAlive: true, health: 100 },
        { name: "Friend 3", isAlive: true, health: 100 },
        { name: "Swordsman Guard", isAlive: true, health: 100 },
        { name: "Archer Guard", isAlive: true, health: 100 },
        { name: "Mage", isAlive: true, health: 100 },
        { name: "Axeman", isAlive: true, health: 100 },
        { name: "Henchman", isAlive: true, health: 100 }
    ],
    
    currentLocation: 'Rivendell',
    nextLandmarkIndex: 0
};

// The Route Map
const landmarks = [
    { name: "The Dark Mines", distance: 400, type: "hazard" },
    { name: "Elven Stronghold", distance: 800, type: "town" },
    { name: "The Great River", distance: 1300, type: "hazard" },
    { name: "City of Men", distance: 1700, type: "town" },
    { name: "Mount Doom", distance: 2000, type: "finish" }
];

let state = JSON.parse(JSON.stringify(defaultState));

const travelBtn = document.getElementById('travel-btn');
const restBtn = document.getElementById('rest-btn');
const modal = document.getElementById('custom-modal');

updateUI();

function changeSetting(type, value) {
    if (type === 'pace') state.pace = value;
    else if (type === 'rations') state.rations = value;
    updateUI();
}

function updateUI() {
    document.getElementById('current-location').innerText = state.currentLocation;
    document.getElementById('day').innerText = state.day;
    document.getElementById('distance').innerText = state.distanceTraveled;
    document.getElementById('total-distance').innerText = state.totalDistance;
    document.getElementById('curse-level').innerText = state.curseLevel;
    
    document.getElementById('food-supply').innerText = state.inventory.food;
    document.getElementById('medicine-supply').innerText = state.inventory.medicine;
    document.getElementById('currency-supply').innerText = state.inventory.currency;

    document.getElementById('current-pace').innerText = state.pace;
    document.getElementById('current-rations').innerText = state.rations;

    const partyListEl = document.getElementById('party-list');
    partyListEl.innerHTML = ''; 
    
    let livingMembers = 0;
    let totalHealth = 0;

    state.party.forEach(member => {
        if (member.isAlive) {
            livingMembers++;
            totalHealth += member.health;
            partyListEl.innerHTML += `<p><strong>${member.name}</strong>: ${member.health} HP</p>`;
        } else {
            partyListEl.innerHTML += `<p style="color: red; text-decoration: line-through;">${member.name} (Deceased)</p>`;
        }
    });

    const healthDisplay = document.getElementById('health-status');
    if (livingMembers === 0) {
        healthDisplay.innerText = "Perished";
        healthDisplay.style.color = "red";
    } else {
        const avgHealth = totalHealth / livingMembers;
        if (avgHealth > 80) healthDisplay.innerText = "Good";
        else if (avgHealth > 40) healthDisplay.innerText = "Fair";
        else {
            healthDisplay.innerText = "Poor";
            healthDisplay.style.color = "orange";
        }
    }
}

function showModal(title, message, buttons = [{text: 'Continue', action: null}]) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    const modalButtons = document.getElementById('modal-buttons');
    modalButtons.innerHTML = ''; 

    buttons.forEach(btn => {
        const buttonEl = document.createElement('button');
        buttonEl.innerText = btn.text;
        buttonEl.onclick = () => {
            modal.style.display = 'none'; 
            if (btn.action) btn.action(); 
        };
        modalButtons.appendChild(buttonEl);
    });

    modal.style.display = 'block';
}

// --- LANDMARK & TRAVEL LOGIC ---
travelBtn.addEventListener('click', () => {
    state.day++;
    let dailyMessage = "";
    let arrivedAtLandmark = false;

    // 1. Determine base travel distance
    let milesCovered = 0;
    if (state.pace === 'Slow') {
        milesCovered = Math.floor(Math.random() * 10) + 10; 
        state.curseLevel += 2; 
    } else if (state.pace === 'Steady') {
        milesCovered = Math.floor(Math.random() * 10) + 20; 
        state.curseLevel += 1;
    } else if (state.pace === 'Fast') {
        milesCovered = Math.floor(Math.random() * 10) + 30; 
    }

    // 2. Check if we hit a landmark today
    const nextLandmark = landmarks[state.nextLandmarkIndex];
    if (nextLandmark && (state.distanceTraveled + milesCovered) >= nextLandmark.distance) {
        // Snap to the landmark's exact distance
        milesCovered = nextLandmark.distance - state.distanceTraveled;
        state.currentLocation = nextLandmark.name;
        state.nextLandmarkIndex++;
        arrivedAtLandmark = true;
    } else {
        state.currentLocation = "On the Road";
    }

    state.distanceTraveled += milesCovered;
    dailyMessage += `You traveled ${milesCovered} miles today. \n`;

    // 3. Consume Food & Calculate Health Changes
    const livingCount = state.party.filter(m => m.isAlive).length;
    let foodNeeded = 0;
    let healthChange = 0;

    if (state.rations === 'Meager') {
        foodNeeded = livingCount * 1;
        healthChange = -5; 
    } else if (state.rations === 'Normal') {
        foodNeeded = livingCount * 2;
        healthChange = 0; 
    } else if (state.rations === 'Filling') {
        foodNeeded = livingCount * 3;
        healthChange = 5; 
    }

    if (state.pace === 'Fast') healthChange -= 10; 

    if (state.inventory.food >= foodNeeded) {
        state.inventory.food -= foodNeeded;
    } else {
        state.inventory.food = 0;
        healthChange -= 15; 
        dailyMessage += "You are out of food! The party is starving. \n";
    }

    // 4. Apply Health Changes
    state.party.forEach(member => {
        if (member.isAlive) {
            member.health += healthChange;
            if (member.health > 100) member.health = 100;
            if (member.health <= 0) {
                member.health = 0;
                member.isAlive = false;
                dailyMessage += `${member.name} has succumbed to the journey... \n`;
            }
        }
    });

    // 5. Game Over Checks
    const mainCharacter = state.party.find(m => m.isMain);
    if (!mainCharacter.isAlive) {
        showModal("Game Over", "You have fallen. The cursed book will consume the world.", [{text: "Try Again", action: () => location.reload()}]);
        return;
    }
    if (state.curseLevel >= 100) {
        showModal("Game Over", "The curse has fully overtaken you. Your mind is gone.", [{text: "Try Again", action: () => location.reload()}]);
        return;
    }

    // 6. Output the daily result
    updateUI();
    
    if (arrivedAtLandmark) {
        if (nextLandmark.type === 'finish') {
            showModal("Victory!", `You have reached ${nextLandmark.name} and destroyed the book!`, [{text: "Play Again", action: () => location.reload()}]);
        } else {
            showModal("Landmark Reached!", `${dailyMessage}\n\nYou have arrived at: ${nextLandmark.name}.`);
        }
    } else {
        showModal(`Day ${state.day}`, dailyMessage);
    }
});

restBtn.addEventListener('click', () => {
    const livingCount = state.party.filter(m => m.isAlive).length;
    let foodNeeded = livingCount * 2;
    
    if (state.inventory.food >= foodNeeded) {
        state.inventory.food -= foodNeeded;
        state.party.forEach(m => { if (m.isAlive) { m.health = Math.min(100, m.health + 15); } });
        state.day++;
        state.curseLevel += 2; 
        updateUI();
        showModal("Camped", "The party rested and healed 15 HP, but the curse grows stronger.");
    } else {
        showModal("Cannot Rest", "You do not have enough food to make camp safely!");
    }
});
