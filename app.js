// The Book's Burden - Game Engine v1.1

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

    // Your 9-Person Party
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
    
    currentLocation: 'Starting Town'
};

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

// --- CORE TRAVEL LOGIC ---
travelBtn.addEventListener('click', () => {
    state.day++;
    let dailyMessage = "";

    // 1. Calculate how many people need to eat
    const livingCount = state.party.filter(m => m.isAlive).length;
    
    // 2. Consume Food based on Rations
    let foodNeeded = 0;
    let healthChange = 0;

    if (state.rations === 'Meager') {
        foodNeeded = livingCount * 1;
        healthChange = -5; // Starving slightly
    } else if (state.rations === 'Normal') {
        foodNeeded = livingCount * 2;
        healthChange = 0; 
    } else if (state.rations === 'Filling') {
        foodNeeded = livingCount * 3;
        healthChange = 5; // Healing slightly
    }

    if (state.inventory.food >= foodNeeded) {
        state.inventory.food -= foodNeeded;
    } else {
        state.inventory.food = 0;
        healthChange -= 15; // Starving heavily if out of food!
        dailyMessage += "You are out of food! The party is starving. \n";
    }

    // 3. Calculate Distance and Pace Penalties
    let milesCovered = 0;
    if (state.pace === 'Slow') {
        milesCovered = Math.floor(Math.random() * 10) + 10; // 10-19 miles
        state.curseLevel += 2; // Moving too slow lets the curse catch up
    } else if (state.pace === 'Steady') {
        milesCovered = Math.floor(Math.random() * 10) + 20; // 20-29 miles
        state.curseLevel += 1;
    } else if (state.pace === 'Fast') {
        milesCovered = Math.floor(Math.random() * 10) + 30; // 30-39 miles
        healthChange -= 10; // Exhausting the party
    }

    state.distanceTraveled += milesCovered;
    dailyMessage += `You traveled ${milesCovered} miles today. \n`;

    // 4. Apply Health Changes to living members
    state.party.forEach(member => {
        if (member.isAlive) {
            member.health += healthChange;
            if (member.health > 100) member.health = 100;
            
            // Check for death
            if (member.health <= 0) {
                member.health = 0;
                member.isAlive = false;
                dailyMessage += `${member.name} has succumbed to the journey... \n`;
            }
        }
    });

    // 5. Check Game Over Conditions
    const mainCharacter = state.party.find(m => m.isMain);
    if (!mainCharacter.isAlive) {
        showModal("Game Over", "You have fallen. The cursed book will consume the world.", [{text: "Try Again", action: () => location.reload()}]);
        return;
    }

    if (state.curseLevel >= 100) {
        showModal("Game Over", "The curse has fully overtaken you. Your mind is gone.", [{text: "Try Again", action: () => location.reload()}]);
        return;
    }

    if (state.distanceTraveled >= state.totalDistance) {
        showModal("Victory!", "You reached the destination and destroyed the cursed book!", [{text: "Play Again", action: () => location.reload()}]);
        return;
    }

    updateUI();
    showModal(`Day ${state.day}`, dailyMessage);
});

restBtn.addEventListener('click', () => {
    // Basic rest logic: lose a day, consume normal food, heal 15 HP, curse creeps up
    const livingCount = state.party.filter(m => m.isAlive).length;
    let foodNeeded = livingCount * 2;
    
    if (state.inventory.food >= foodNeeded) {
        state.inventory.food -= foodNeeded;
        state.party.forEach(m => { if (m.isAlive) { m.health = Math.min(100, m.health + 15); } });
        state.day++;
        state.curseLevel += 2; // The curse grows while you sit still
        updateUI();
        showModal("Camped", "The party rested and healed 15 HP, but the curse grows stronger.");
    } else {
        showModal("Cannot Rest", "You do not have enough food to make camp safely!");
    }
});
