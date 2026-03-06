 // The Fellowship Trail - Game Engine v1.8

const defaultState = {
    day: 1,
    distanceTraveled: 0,
    totalDistance: 2000, 
    ringCorruption: 0,      
    pace: 'Steady',      
    rations: 'Normal',  
    
    inventory: {
        food: 300,      
        medicine: 5,    
        currency: 150,
        cloaks: 4,      
        arrows: 30,
        whetstones: 3,
        axeHandles: 2
    },

    party: [
        { name: "Frodo", isAlive: true, health: 100, isRingbearer: true },
        { name: "Sam", isAlive: true, health: 100 },
        { name: "Aragorn", isAlive: true, health: 100 },
        { name: "Legolas", isAlive: true, health: 100 },
        { name: "Gimli", isAlive: true, health: 100 },
        { name: "Gandalf", isAlive: true, health: 100 },
        { name: "Merry", isAlive: true, health: 100 },
        { name: "Pippin", isAlive: true, health: 100 }
    ],
    
    currentLocation: 'Rivendell',
    nextLandmarkIndex: 0
};

const landmarks = [
    { name: "The Pass of Caradhras", distance: 150, type: "hazard" },
    { name: "The Mines of Moria", distance: 400, type: "hazard" },
    { name: "Lothlórien", distance: 800, type: "town" },
    { name: "The Argonath", distance: 1300, type: "hazard" },
    { name: "Minas Tirith", distance: 1700, type: "town" },
    { name: "Mount Doom", distance: 2000, type: "finish" }
];

const shopInventory = [
    { id: 'food', name: "Lembas Bread (20 portions)", cost: 5, qty: 20 },
    { id: 'medicine', name: "Athelas (1 leaf)", cost: 10, qty: 1 },
    { id: 'cloaks', name: "Elven Cloak (1 cloak)", cost: 25, qty: 1 },
    { id: 'arrows', name: "Bundle of Arrows (10)", cost: 5, qty: 10 },
    { id: 'whetstones', name: "Ranger's Whetstone", cost: 8, qty: 1 },
    { id: 'axeHandles', name: "Sturdy Axe Handle", cost: 12, qty: 1 }
];

const safeTowns = ['Rivendell', 'Lothlórien', 'Minas Tirith'];

let state = JSON.parse(JSON.stringify(defaultState));

const travelBtn = document.getElementById('travel-btn');
const restBtn = document.getElementById('rest-btn');
const tradeBtn = document.getElementById('trade-btn');
const modal = document.getElementById('custom-modal');
const shopModal = document.getElementById('shop-modal');

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
    document.getElementById('corruption-level').innerText = state.ringCorruption;
    
    document.getElementById('food-supply').innerText = state.inventory.food;
    document.getElementById('medicine-supply').innerText = state.inventory.medicine;
    document.getElementById('currency-supply').innerText = state.inventory.currency;
    document.getElementById('cloak-supply').innerText = state.inventory.cloaks;
    document.getElementById('arrow-supply').innerText = state.inventory.arrows;
    document.getElementById('whetstone-supply').innerText = state.inventory.whetstones;
    document.getElementById('axe-supply').innerText = state.inventory.axeHandles;

    document.getElementById('current-pace').innerText = state.pace;
    document.getElementById('current-rations').innerText = state.rations;

    if (safeTowns.includes(state.currentLocation)) {
        tradeBtn.style.display = 'block';
    } else {
        tradeBtn.style.display = 'none';
    }

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
            partyListEl.innerHTML += `<p style="color: red; text-decoration: line-through;">${member.name} (Fallen)</p>`;
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

// --- SHOP LOGIC ---
tradeBtn.addEventListener('click', () => {
    document.getElementById('shop-currency').innerText = state.inventory.currency;
    const shopItemsEl = document.getElementById('shop-items');
    shopItemsEl.innerHTML = '';

    shopInventory.forEach(item => {
        shopItemsEl.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #4a5d23; padding: 10px 0;">
                <span>${item.name} <br><small style="color: #888;">${item.cost} Silver Pennies</small></span>
                <button onclick="buyItem('${item.id}', ${item.cost}, ${item.qty})" style="padding: 5px 10px; margin: 0;">Buy</button>
            </div>
        `;
    });
    shopModal.style.display = 'block';
});

function buyItem(itemId, cost, qty) {
    if (state.inventory.currency >= cost) {
        state.inventory.currency -= cost;
        state.inventory[itemId] += qty;
        document.getElementById('shop-currency').innerText = state.inventory.currency;
        updateUI();
    } else {
        alert("Not enough Silver Pennies!");
    }
}

function closeShop() { shopModal.style.display = 'none'; }

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

// --- HAZARD / BATTLE ENCOUNTER ENGINE ---
function triggerHazardEncounter(hazardName, dailyMessage) {
    let enemyDesc = "";
    if (hazardName === "The Pass of Caradhras") enemyDesc = "A pack of Wargs and Saruman's Orc scouts block the mountain pass!";
    if (hazardName === "The Mines of Moria") enemyDesc = "A massive swarm of Moria Goblins block the great bridge!";
    if (hazardName === "The Argonath") enemyDesc = "A deadly band of Uruk-hai ambush you from the woods!";

    const message = `${dailyMessage}\n\n**HAZARD ENCOUNTERED!**\n${enemyDesc}\nHow will the Fellowship proceed?`;

    showModal(`Arrived at ${hazardName}`, message, [
        { text: "Charge into Battle", action: () => resolveHazard('fight', hazardName) },
        { text: "Take a Detour (3 Days)", action: () => resolveHazard('detour', hazardName) },
        { text: "Hire Mercenaries (35 Coins)", action: () => resolveHazard('pay', hazardName) }
    ]);
}

function resolveHazard(choice, hazardName) {
    let resultMessage = "";
    const livingCount = state.party.filter(m => m.isAlive).length;

    if (choice === 'fight') {
        // RNG Battle Logic
        let hasGear = (state.inventory.arrows >= 5 && state.inventory.whetstones >= 1 && state.inventory.axeHandles >= 1);
        
        // Randomly determine consumable breakage
        let arrowsLost = Math.min(state.inventory.arrows, Math.floor(Math.random() * 6)); // 0 to 5
        let whetstonesLost = Math.min(state.inventory.whetstones, Math.floor(Math.random() * 3)); // 0 to 2
        let axeHandlesLost = Math.min(state.inventory.axeHandles, Math.floor(Math.random() * 3)); // 0 to 2

        state.inventory.arrows -= arrowsLost;
        state.inventory.whetstones -= whetstonesLost;
        state.inventory.axeHandles -= axeHandlesLost;

        resultMessage = `You charged into battle! In the chaos, you lost ${arrowsLost} arrows, ${whetstonesLost} whetstones, and ${axeHandlesLost} axe handles.\n\n`;

        if (!hasGear) {
            resultMessage += "**Your weapons were dull and quivers empty! The enemy overwhelmed your defenses.**\n\n";
        }

        // Apply individual RNG damage
        state.party.forEach(m => {
            if (m.isAlive) {
                // Good gear: 0 to 20 dmg. Bad gear: 15 to 35 dmg.
                let dmg = hasGear ? Math.floor(Math.random() * 21) : Math.floor(Math.random() * 21) + 15;
                m.health -= dmg;
                
                resultMessage += `${m.name} took ${dmg} dmg. `;

                if (m.health <= 0) {
                    m.health = 0;
                    m.isAlive = false;
                    resultMessage += `\n**${m.name} WAS SLAIN!**\n`;
                }
            }
        });

    } else if (choice === 'detour') {
        let lostDays = 3;
        let foodCost = livingCount * 2 * lostDays; 
        
        state.day += lostDays;
        state.ringCorruption += 8;
        
        if (state.inventory.food >= foodCost) {
            state.inventory.food -= foodCost;
            resultMessage = `You took the long way around. It cost you ${lostDays} extra days and ${foodCost} portions of food, and the Ring grows heavier.`;
        } else {
            state.inventory.food = 0;
            resultMessage = `You tried to detour, but ran out of food! The party starved during the extra ${lostDays} days.\n`;
            state.party.forEach(m => {
                if (m.isAlive) {
                    m.health -= 20;
                    if (m.health <= 0) { m.health = 0; m.isAlive = false; resultMessage += `\n${m.name} starved to death!`; }
                }
            });
        }

    } else if (choice === 'pay') {
        if (state.inventory.currency >= 35) {
            state.inventory.currency -= 35;
            resultMessage = "You paid 35 Silver Pennies to a wandering company of Rangers. They cleared the path and guided you safely through with no injuries.";
        } else {
            resultMessage = "You didn't have enough Silver Pennies! The mercenaries laughed and left you to the horde.\n\n";
            state.party.forEach(m => {
                if (m.isAlive) {
                    let dmg = Math.floor(Math.random() * 16) + 15; // RNG penalty 15-30 dmg
                    m.health -= dmg;
                    resultMessage += `${m.name} took ${dmg} dmg. `;
                    if (m.health <= 0) { m.health = 0; m.isAlive = false; resultMessage += `\n**${m.name} was slain!**\n`; }
                }
            });
        }
    }

    const ringbearer = state.party.find(m => m.isRingbearer);
    if (!ringbearer.isAlive) {
        showModal("Game Over", resultMessage + "\n\nFrodo has fallen. The Ring is lost, and Middle-earth will fall into shadow.", [{text: "Try Again", action: () => location.reload()}]);
        return;
    }
    if (state.ringCorruption >= 100) {
        showModal("Game Over", resultMessage + "\n\nThe Ring has fully corrupted Frodo. He has claimed it for himself.", [{text: "Try Again", action: () => location.reload()}]);
        return;
    }

    updateUI();
    showModal("Encounter Resolved", resultMessage);
}

// --- TRAVEL LOOP ---
travelBtn.addEventListener('click', () => {
    state.day++;
    let dailyMessage = "";
    let arrivedAtLandmark = false;
    let nextLandmark = landmarks[state.nextLandmarkIndex];
    let milesCovered = 0;

    if (state.pace === 'Cautious') { milesCovered = Math.floor(Math.random() * 10) + 10; state.ringCorruption += 2; } 
    else if (state.pace === 'Steady') { milesCovered = Math.floor(Math.random() * 10) + 20; state.ringCorruption += 1; } 
    else if (state.pace === 'Grueling') { milesCovered = Math.floor(Math.random() * 10) + 30; }

    if (nextLandmark && (state.distanceTraveled + milesCovered) >= nextLandmark.distance) {
        milesCovered = nextLandmark.distance - state.distanceTraveled;
        state.currentLocation = nextLandmark.name;
        state.nextLandmarkIndex++;
        arrivedAtLandmark = true;
    } else {
        state.currentLocation = "In the Wilds";
    }

    state.distanceTraveled += milesCovered;
    dailyMessage += `You traveled ${milesCovered} miles today. \n`;

    const livingCount = state.party.filter(m => m.isAlive).length;
    let foodNeeded = 0;
    let baseHealthChange = 0;

    if (state.rations === 'Meager') { foodNeeded = livingCount * 1; baseHealthChange = -5; } 
    else if (state.rations === 'Normal') { foodNeeded = livingCount * 2; baseHealthChange = 0; } 
    else if (state.rations === 'Filling') { foodNeeded = livingCount * 3; baseHealthChange = 5; }

    if (state.inventory.food >= foodNeeded) {
        state.inventory.food -= foodNeeded;
    } else {
        state.inventory.food = 0;
        baseHealthChange -= 15; 
        dailyMessage += "You are out of Lembas bread! The Fellowship is starving. \n";
    }

    const cloakPriority = ["Frodo", "Sam", "Pippin", "Merry", "Aragorn", "Legolas", "Gandalf", "Gimli"];
    let livingMembersList = state.party.filter(m => m.isAlive);
    livingMembersList.sort((a, b) => cloakPriority.indexOf(a.name) - cloakPriority.indexOf(b.name));
    let cloaksLeft = state.inventory.cloaks;
    let penaltyMessageAdded = false;

    livingMembersList.forEach(member => {
        let personalHealthChange = baseHealthChange; 
        if (state.pace === 'Grueling') {
            if (cloaksLeft > 0) cloaksLeft--; 
            else {
                personalHealthChange -= 10; 
                if (!penaltyMessageAdded) { dailyMessage += "Not enough Elven Cloaks! Some members took damage.\n"; penaltyMessageAdded = true; }
            }
        }
        let stateMember = state.party.find(m => m.name === member.name);
        stateMember.health += personalHealthChange;
        if (stateMember.health > 100) stateMember.health = 100;
        if (stateMember.health <= 0) { stateMember.health = 0; stateMember.isAlive = false; dailyMessage += `${stateMember.name} has fallen... \n`; }
    });

    const ringbearer = state.party.find(m => m.isRingbearer);
    if (!ringbearer.isAlive) { showModal("Game Over", "Frodo has fallen. The Ring is lost.", [{text: "Try Again", action: () => location.reload()}]); return; }
    if (state.ringCorruption >= 100) { showModal("Game Over", "The Ring has fully corrupted Frodo.", [{text: "Try Again", action: () => location.reload()}]); return; }

    updateUI();
    
    if (arrivedAtLandmark) {
        if (nextLandmark.type === 'finish') {
            showModal("Victory!", `You have reached the fires of ${nextLandmark.name} and destroyed the One Ring!`, [{text: "Play Again", action: () => location.reload()}]);
        } else if (nextLandmark.type === 'hazard') {
            triggerHazardEncounter(nextLandmark.name, dailyMessage);
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
        state.ringCorruption += 2; 
        updateUI();
        showModal("Camped", "The Fellowship rested and healed 15 HP, but the Ring's corruption grows heavier.");
    } else {
        showModal("Cannot Rest", "You do not have enough Lembas bread to make camp safely!");
    }
});
