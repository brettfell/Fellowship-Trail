// Generic Survival Trail - Game Engine v1.0

const defaultState = {
    day: 1,
    distanceTraveled: 0,
    totalDistance: 2000, 
    hazardLevel: 0,      
    pace: 'Steady',      
    rations: 'Normal',  
    
    inventory: {
        food: 200,      
        medicine: 5,     
        currency: 150    
    },

    // Generic Party Members
    party: [
        { name: "Leader", isAlive: true, health: 100 },
        { name: "Scout", isAlive: true, health: 100 },
        { name: "Doctor", isAlive: true, health: 100 },
        { name: "Guard", isAlive: true, health: 100 }
    ],
    
    currentLocation: 'Starting Town'
};

let state = JSON.parse(JSON.stringify(defaultState));

// UI Elements
const travelBtn = document.getElementById('travel-btn');
const restBtn = document.getElementById('rest-btn');
const modal = document.getElementById('custom-modal');

// Initialize the screen on load
updateUI();

function changeSetting(type, value) {
    if (type === 'pace') {
        state.pace = value;
    } else if (type === 'rations') {
        state.rations = value;
    }
    updateUI();
}

function updateUI() {
    // Top Stats
    document.getElementById('current-location').innerText = state.currentLocation;
    document.getElementById('day').innerText = state.day;
    document.getElementById('distance').innerText = state.distanceTraveled;
    document.getElementById('total-distance').innerText = state.totalDistance;
    document.getElementById('hazard-level').innerText = state.hazardLevel;
    
    // Inventory
    document.getElementById('food-supply').innerText = state.inventory.food;
    document.getElementById('medicine-supply').innerText = state.inventory.medicine;
    document.getElementById('currency-supply').innerText = state.inventory.currency;

    // Settings Display
    document.getElementById('current-pace').innerText = state.pace;
    document.getElementById('current-rations').innerText = state.rations;

    // Render Party List
    const partyListEl = document.getElementById('party-list');
    partyListEl.innerHTML = ''; // Clear existing
    
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

    // Calculate overall party health status
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

// Placeholder listeners for the main action buttons
travelBtn.addEventListener('click', () => {
    showModal("End of Day", "The daily travel logic will go here.");
});

restBtn.addEventListener('click', () => {
    showModal("Camp", "The resting and healing logic will go here.");
});
