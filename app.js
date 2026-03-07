// The Fellowship Trail - Game Engine v1.15 (Phase 1: Economy Update)

const defaultState = {
    day: 1,
    distanceTraveled: 0,
    totalDistance: 2000, 
    ringCorruption: 0,      
    travelMode: 'Steady', 

    inventory: {
        food: 300,      
        medicine: 5,    
        pipeweed: 3,
        currency: 150,
        cloaks: 4,      
        arrows: 30,
        whetstones: 3,
        axeHandles: 2
    },

    party: [
        { name: "Frodo", isAlive: true, health: 100, isRingbearer: true, status: 'Healthy' },
        { name: "Sam", isAlive: true, health: 100, status: 'Healthy' },
        { name: "Aragorn", isAlive: true, health: 100, status: 'Healthy' },
        { name: "Legolas", isAlive: true, health: 100, status: 'Healthy' },
        { name: "Gimli", isAlive: true, health: 100, status: 'Healthy' },
        { name: "Gandalf", isAlive: true, health: 100, status: 'Healthy' },
        { name: "Merry", isAlive: true, health: 100, status: 'Healthy' },
        { name: "Pippin", isAlive: true, health: 100, status: 'Healthy' }
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
    { id: 'pipeweed', name: "Longbottom Leaf (1 pouch)", cost: 15, qty: 1 },
    { id: 'cloaks', name: "Elven Cloak (1 cloak)", cost: 25, qty: 1 },
    { id: 'arrows', name: "Bundle of Arrows (10)", cost: 5, qty: 10 },
    { id: 'whetstones', name: "Ranger's Whetstone", cost: 8, qty: 1 },
    { id: 'axeHandles', name: "Sturdy Axe Handle", cost: 12, qty: 1 }
];

const sellableItems = [
    { id: 'cloaks', name: "Elven Cloak", sellPrice: 12 },
    { id: 'medicine', name: "Athelas Leaf", sellPrice: 5 },
    { id: 'whetstones', name: "Whetstone", sellPrice: 4 },
    { id: 'axeHandles', name: "Axe Handle", sellPrice: 5 }
];

const safeTowns = ['Rivendell', 'Lothlórien', 'Minas Tirith'];

let state = JSON.parse(JSON.stringify(defaultState));

const travelBtn = document.getElementById('travel-btn');
const huntBtn = document.getElementById('hunt-btn');
const restBtn = document.getElementById('rest-btn');
const tradeBtn = document.getElementById('trade-btn');
const healBtn = document.getElementById('heal-btn');
const pipeBtn = document.getElementById('pipe-btn');
const modal = document.getElementById('custom-modal');
const shopModal = document.getElementById('shop-modal');

updateUI();

function changeSetting(value) {
    state.travelMode = value;
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
    document.getElementById('pipeweed-supply').innerText = state.inventory.pipeweed;
    document.getElementById('currency-supply').innerText = state.inventory.currency;
    document.getElementById('cloak-supply').innerText = state.inventory.cloaks;
    document.getElementById('arrow-supply').innerText = state.inventory.arrows;
    document.getElementById('whetstone-supply').innerText = state.inventory.whetstones;
    document.getElementById('axe-supply').innerText = state.inventory.axeHandles;

    document.getElementById('current-travel-mode').innerText = state.travelMode;

    if (safeTowns.includes(state.currentLocation)) tradeBtn.style.display = 'block';
    else tradeBtn.style.display = 'none';

    const partyListEl = document.getElementById('party-list');
    partyListEl.innerHTML = ''; 

    let livingMembers = 0;
    let totalHealth = 0;

    state.party.forEach(member => {
        if (member.isAlive) {
            livingMembers++;
            totalHealth += member.health;
            let statusText = member.status === 'Healthy' ? '' : ` <span style="color: orange;">(${member.status})</span>`;
            partyListEl.innerHTML += `<p><strong>${member.name}</strong>: ${member.health} HP${statusText}</p>`;
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
        else { healthDisplay.innerText = "Poor"; healthDisplay.style.color = "orange"; }
    }
}

function showModal(title, message, buttons = [{text: 'Continue', action: null}], gifUrl = null) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerHTML = message.replace(/\n/g, '<br>'); 

    const modalGif = document.getElementById('modal-gif');
    if (gifUrl) {
        modalGif.src = gifUrl;
        modalGif.style.display = 'inline-block';
    } else {
        modalGif.style.display = 'none';
    }

    const modalButtons = document.getElementById('modal-buttons');
    modalButtons.innerHTML = ''; 

    modalButtons.style.display = 'flex';
    modalButtons.style.flexDirection = 'column';
    modalButtons.style.gap = '10px';
    modalButtons.style.maxHeight = '40vh'; 
    modalButtons.style.overflowY = 'auto';
    modalButtons.style.padding = '5px';
    // THE FRODO FIX: Adding flex-start ensures the top item is never cut off when scrolling
    modalButtons.style.justifyContent = 'flex-start'; 

    buttons.forEach(btn => {
        const buttonEl = document.createElement('button');
        buttonEl.innerText = btn.text;
        buttonEl.style.width = '100%'; 
        buttonEl.style.margin = '0';
        buttonEl.style.flexShrink = '0'; // THE FRODO FIX: Prevents buttons from squishing
        buttonEl.onclick = () => {
            modal.style.display = 'none'; 
            if (btn.action) btn.action(); 
        };
        modalButtons.appendChild(buttonEl);
    });
    modal.style.display = 'block';
}

// --- VICTORY SCORING SYSTEM ---
function calculateScore() {
    let score = 5000; 
    let breakdown = "<br><strong>Base Victory: 5000 pts</strong><br>";

    if (state.party.find(m => m.name === 'Sam').isAlive) { score += 2000; breakdown += "Samwise survived: +2000 pts<br>"; }

    ['Merry', 'Pippin'].forEach(name => {
        if (state.party.find(m => m.name === name).isAlive) { score += 1000; breakdown += `${name} survived: +1000 pts<br>`; }
    });

    ['Aragorn', 'Legolas', 'Gimli', 'Gandalf'].forEach(name => {
        if (state.party.find(m => m.name === name).isAlive) { score += 500; breakdown += `${name} survived: +500 pts<br>`; }
    });

    let supplyBonus = (state.inventory.food * 2) + (state.inventory.currency * 2);
    score += supplyBonus;
    breakdown += `Remaining Supplies: +${supplyBonus} pts<br>`;

    breakdown += `<br><span style="color: #d4af37; font-size: 1.2em;"><strong>FINAL SCORE: ${score}</strong></span>`;
    return breakdown;
}

function getRandomEvent() {
    const defaultReturn = { text: "", buttons: [{text: 'Continue', action: null}], gifUrl: null };
    if (Math.random() > 0.45) return defaultReturn;
    const livingMembers = state.party.filter(m => m.isAlive);
    if (livingMembers.length === 0) return defaultReturn;
    const randomMember = livingMembers[Math.floor(Math.random() * livingMembers.length)];

    const events = [
        () => {
            if (randomMember.status !== 'Healthy') return defaultReturn; 
            randomMember.status = 'Sick';
            return { text: `<br><br><span style="color: orange;">⚠️ <strong>Bad Water:</strong> ${randomMember.name} drank from a stagnant pool and is now Sick! (-5 extra HP per day)</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'sick.gif' };
        },
        () => {
            if (randomMember.status !== 'Healthy') return defaultReturn;
            randomMember.status = 'Injured';
            return { text: `<br><br><span style="color: orange;">⚠️ <strong>Rough Terrain:</strong> ${randomMember.name} took a nasty fall and is Injured! (-8 extra HP per day)</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'injured.gif' };
        },
        () => {
            if (randomMember.status !== 'Healthy') return defaultReturn;
            randomMember.status = 'Poisoned';
            return { text: `<br><br><span style="color: red;">🕷️ <strong>Spider Bite!</strong> ${randomMember.name} was bitten in the night and is Poisoned! (-12 extra HP per day)</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'spider.gif' };
        },
        () => {
            let stolen = Math.floor(Math.random() * 15) + 5;
            if (state.inventory.food >= stolen) {
                state.inventory.food -= stolen;
                return { text: `<br><br><span style="color: orange;">⚠️ <strong>Thief!</strong> Gollum crept into camp while you slept and stole ${stolen} portions of food.</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'gollum.gif' };
            }
            return defaultReturn;
        },
        () => {
            state.inventory.medicine += 1;
            return { text: `<br><br><span style="color: #4a5d23;">🌿 <strong>Good Fortune:</strong> You spotted Kingsfoil growing near the path! (+1 Athelas leaf)</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'kingsfoil.gif' };
        }
    ];
    return events[Math.floor(Math.random() * events.length)]();
}

// --- ITEM BUTTON LOGIC ---
healBtn.addEventListener('click', () => {
    if (state.inventory.medicine <= 0) { showModal("No Medicine", "You do not have any Athelas leaves!"); return; }
    let healButtons = [];
    state.party.forEach(m => {
        if (m.isAlive && (m.health < 100 || m.status !== 'Healthy')) {
            healButtons.push({ text: m.name, action: () => applyAthelas(m.name) });
        }
    });
    if (healButtons.length === 0) { showModal("Everyone is Healthy", "The Fellowship is already at full health and free of ailments."); } 
    else { healButtons.push({text: "Cancel", action: null}); showModal("Use Athelas", "Who will you treat? (Restores 30 HP and cures all ailments)", healButtons, 'kingsfoil.gif'); }
});

function applyAthelas(memberName) {
    state.inventory.medicine--;
    let member = state.party.find(m => m.name === memberName);
    member.health = Math.min(100, member.health + 30);
    member.status = 'Healthy';
    updateUI();
    showModal("Treated", `${memberName} was treated with Athelas. They recovered 30 HP and are fully cured.`);
}

pipeBtn.addEventListener('click', () => {
    let gandalf = state.party.find(m => m.name === 'Gandalf');
    if (!gandalf.isAlive) {
        showModal("No Comfort", "With Gandalf gone, the remaining Fellowship finds no joy or solace in the pipe-weed. The Ring's corruption continues to grow.", [{text: "Continue", action: null}], 'gameover.gif');
        return;
    }
    if (state.inventory.pipeweed <= 0) {
        showModal("Out of Pipe-Weed", "You have no Longbottom Leaf left in your pouches!");
        return;
    }

    state.inventory.pipeweed--;
    state.ringCorruption = Math.max(0, state.ringCorruption - 15);
    updateUI();
    showModal("A Moment of Peace", "Gandalf blows a series of intricate smoke rings. The party relaxes, and the heavy burden of the Ring feels lighter today.<br><br><span style='color: #d4af37;'>(-15% Ring Corruption)</span>", [{text: "Continue", action: null}], 'pipeweed.gif');
});

// --- HUNTING & FORAGING (NEW MECHANIC) ---
huntBtn.addEventListener('click', () => {
    state.day++;
    state.ringCorruption += 1;
    let huntMsg = "You spent the day hunting and gathering.<br><br>";
    let foodFound = 0;
    
    let aragorn = state.party.find(m => m.name === 'Aragorn').isAlive;
    let legolas = state.party.find(m => m.name === 'Legolas').isAlive;
    let gimli = state.party.find(m => m.name === 'Gimli').isAlive;

    if (aragorn || legolas) {
        foodFound = Math.floor(Math.random() * 25) + 20; // Massive yield if Rangers are alive
        huntMsg += `The Rangers tracked game through the brush. You gained ${foodFound} portions of food!<br>`;
        if (Math.random() > 0.6 && state.inventory.arrows > 0) {
            state.inventory.arrows--;
            huntMsg += "<span style='color: #888;'>(-1 Arrow used)</span><br>";
        }
    } else {
        foodFound = Math.floor(Math.random() * 10) + 5; 
        huntMsg += `Without your expert hunters, the party managed to clumsily scavenge ${foodFound} portions of meager food.<br>`;
    }

    if (!gimli) {
        huntMsg += "<br><span style='color: red;'>Without Gimli to guard the camp, a scavenger crept in and stole 5 Silver Pennies while you were hunting!</span>";
        state.inventory.currency = Math.max(0, state.inventory.currency - 5);
    }

    state.inventory.food += foodFound;
    updateUI();
    showModal("Hunting & Foraging", huntMsg, [{text: "Continue", action: null}], 'camp.gif'); 
});

// --- TWO-WAY TRADING POST (NEW MECHANIC) ---
tradeBtn.addEventListener('click', () => {
    document.getElementById('shop-currency').innerText = state.inventory.currency;
    const shopItemsEl = document.getElementById('shop-items');
    shopItemsEl.innerHTML = '<h4 style="margin: 0 0 10px 0; border-bottom: 1px solid #4a5d23;">Buy Supplies</h4>';
    
    shopInventory.forEach(item => {
        shopItemsEl.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #333; padding: 10px 0;">
                <span>${item.name} <br><small style="color: #888;">${item.cost} Coins</small></span>
                <button onclick="buyItem('${item.id}', ${item.cost}, ${item.qty})" style="padding: 5px 10px; margin: 0; flex-shrink: 0;">Buy</button>
            </div>
        `;
    });

    shopItemsEl.innerHTML += '<h4 style="margin: 20px 0 10px 0; border-bottom: 1px solid #4a5d23; color: #6d597a;">Sell Gear</h4>';
    
    sellableItems.forEach(item => {
        shopItemsEl.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #333; padding: 10px 0;">
                <span>${item.name} <br><small style="color: #888;">Sell for ${item.sellPrice} Coins</small></span>
                <button onclick="sellItem('${item.id}', ${item.sellPrice})" style="padding: 5px 10px; margin: 0; flex-shrink: 0; background-color: #6d597a;">Sell</button>
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
        closeShop();
        showModal("Not Enough Coins", "You do not have enough Silver Pennies to make this purchase."); 
    }
}

function sellItem(itemId, price) {
    if (state.inventory[itemId] > 0) {
        state.inventory[itemId]--;
        state.inventory.currency += price;
        document.getElementById('shop-currency').innerText = state.inventory.currency;
        updateUI();
    } else {
        closeShop();
        showModal("Cannot Sell", "You do not have any of that item in your inventory to sell!");
    }
}

function closeShop() { shopModal.style.display = 'none'; }

// --- HAZARD ENCOUNTER ENGINE ---
function triggerHazardEncounter(hazardName, dailyMessage) {
    let enemyDesc = "";
    let hazardGif = "";
    if (hazardName === "The Pass of Caradhras") { enemyDesc = "A pack of Wargs and Saruman's Orc scouts block the mountain pass!"; hazardGif = "caradhras.gif"; }
    if (hazardName === "The Mines of Moria") { enemyDesc = "A massive swarm of Moria Goblins block the great bridge!"; hazardGif = "moria.gif"; }
    if (hazardName === "The Argonath") { enemyDesc = "A deadly band of Uruk-hai ambush you from the woods!"; hazardGif = "ambush.gif"; }

    const message = `${dailyMessage}<br><br>**HAZARD ENCOUNTERED!**<br>${enemyDesc}<br>How will the Fellowship proceed?`;

    showModal(`Arrived at ${hazardName}`, message, [
        { text: "Charge into Battle", action: () => resolveHazard('fight', hazardName) },
        { text: "Take a Detour (3 Days)", action: () => resolveHazard('detour', hazardName) },
        { text: "Hire Mercenaries (35 Coins)", action: () => resolveHazard('pay', hazardName) }
    ], hazardGif);
}

function resolveHazard(choice, hazardName) {
    let resultMessage = "";
    const livingCount = state.party.filter(m => m.isAlive).length;

    if (choice === 'fight') {
        let hasGear = (state.inventory.arrows >= 5 && state.inventory.whetstones >= 1 && state.inventory.axeHandles >= 1);
        let vanguardIntact = (state.party.find(m => m.name === 'Aragorn').isAlive && state.party.find(m => m.name === 'Legolas').isAlive && state.party.find(m => m.name === 'Gimli').isAlive);

        let arrowsLost = Math.min(state.inventory.arrows, Math.floor(Math.random() * 6)); 
        let whetstonesLost = Math.min(state.inventory.whetstones, Math.floor(Math.random() * 3)); 
        let axeHandlesLost = Math.min(state.inventory.axeHandles, Math.floor(Math.random() * 3)); 

        state.inventory.arrows -= arrowsLost;
        state.inventory.whetstones -= whetstonesLost;
        state.inventory.axeHandles -= axeHandlesLost;

        resultMessage = `You charged into battle! In the chaos, you lost ${arrowsLost} arrows, ${whetstonesLost} whetstones, and ${axeHandlesLost} axe handles.<br><br>`;
        if (!hasGear) resultMessage += "**Your weapons were dull and quivers empty! The enemy overwhelmed your defenses.**<br>";
        if (!vanguardIntact) resultMessage += "<span style='color: red;'>**Without Aragorn, Legolas, and Gimli fighting together, the enemy broke through your vanguard! (+15 Damage to all)**</span><br><br>";

        state.party.forEach(m => {
            if (m.isAlive) {
                let dmg = hasGear ? Math.floor(Math.random() * 21) : Math.floor(Math.random() * 21) + 15;
                if (!vanguardIntact) dmg += 15; 

                m.health -= dmg;
                resultMessage += `${m.name} took ${dmg} dmg. `;
                if (m.health <= 0) { m.health = 0; m.isAlive = false; resultMessage += `<br>**${m.name} WAS SLAIN!**<br>`; }
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
            resultMessage = `You tried to detour, but ran out of food! The party starved during the extra ${lostDays} days.<br>`;
            state.party.forEach(m => {
                if (m.isAlive) {
                    m.health -= 20;
                    if (m.health <= 0) { m.health = 0; m.isAlive = false; resultMessage += `<br>${m.name} starved to death!`; }
                }
            });
        }
    } else if (choice === 'pay') {
        if (state.inventory.currency >= 35) {
            state.inventory.currency -= 35;
            resultMessage = "You paid 35 Silver Pennies to a wandering company of Rangers. They cleared the path and guided you safely through with no injuries.";
        } else {
            resultMessage = "You didn't have enough Silver Pennies! The mercenaries laughed and left you to the horde.<br><br>";
            state.party.forEach(m => {
                if (m.isAlive) {
                    let dmg = Math.floor(Math.random() * 16) + 15; 
                    m.health -= dmg;
                    resultMessage += `${m.name} took ${dmg} dmg. `;
                    if (m.health <= 0) { m.health = 0; m.isAlive = false; resultMessage += `<br>**${m.name} was slain!**<br>`; }
                }
            });
        }
    }

    const ringbearer = state.party.find(m => m.isRingbearer);
    if (!ringbearer.isAlive) { showModal("Game Over", resultMessage + "<br><br>Frodo has fallen. The Ring is lost.", [{text: "Try Again", action: () => location.reload()}], 'gameover.gif'); return; }
    if (state.ringCorruption >= 100) { showModal("Game Over", resultMessage + "<br><br>The Ring has fully corrupted Frodo.", [{text: "Try Again", action: () => location.reload()}], 'gameover.gif'); return; }

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
    const livingCount = state.party.filter(m => m.isAlive).length;

    // THE STREAMLINED TRAVEL MATH
    let foodNeeded = 0;
    let baseHealthChange = 0;

    if (state.travelMode === 'Cautious') { 
        milesCovered = Math.floor(Math.random() * 10) + 10; 
        state.ringCorruption += 2; 
        foodNeeded = livingCount * 2; 
        baseHealthChange = 5; 
    } else if (state.travelMode === 'Steady') { 
        milesCovered = Math.floor(Math.random() * 10) + 20; 
        state.ringCorruption += 1; 
        foodNeeded = livingCount * 2; 
        baseHealthChange = 0;
    } else if (state.travelMode === 'Forced March') { 
        milesCovered = Math.floor(Math.random() * 10) + 30; 
        foodNeeded = livingCount * 3; 
        baseHealthChange = -5; 
    }

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

    // HOBBIT PASSIVE FORAGING
    let passiveFood = 0;
    if (state.party.find(m => m.name === 'Sam').isAlive) passiveFood += 4;
    if (state.party.find(m => m.name === 'Merry').isAlive) passiveFood += 3;
    if (state.party.find(m => m.name === 'Pippin').isAlive) passiveFood += 3;
    
    if (passiveFood > 0) {
        state.inventory.food += passiveFood;
        dailyMessage += `The Hobbits foraged +${passiveFood} portions of food while walking. \n`;
    }

    let eventData = { text: "", buttons: [{text: 'Continue', action: null}], gifUrl: null };
    let currentGif = "walking.gif"; 

    if (!arrivedAtLandmark) {
        eventData = getRandomEvent();
        dailyMessage += eventData.text;
        if (eventData.gifUrl) currentGif = eventData.gifUrl;
    }

    if (state.inventory.food >= foodNeeded) { state.inventory.food -= foodNeeded; } 
    else { state.inventory.food = 0; baseHealthChange -= 15; dailyMessage += "<br>You are out of food! The Fellowship is starving. \n"; }

    const cloakPriority = ["Frodo", "Sam", "Pippin", "Merry", "Aragorn", "Legolas", "Gandalf", "Gimli"];
    let livingMembersList = state.party.filter(m => m.isAlive);
    livingMembersList.sort((a, b) => cloakPriority.indexOf(a.name) - cloakPriority.indexOf(b.name));
    let cloaksLeft = state.inventory.cloaks;
    let penaltyMessageAdded = false;

    livingMembersList.forEach(member => {
        let personalHealthChange = baseHealthChange; 
        let stateMember = state.party.find(m => m.name === member.name);
        if (stateMember.status === 'Sick') personalHealthChange -= 5;
        if (stateMember.status === 'Injured') personalHealthChange -= 8;
        if (stateMember.status === 'Poisoned') personalHealthChange -= 12;

        if (state.travelMode === 'Forced March') {
            if (cloaksLeft > 0) cloaksLeft--; 
            else { personalHealthChange -= 10; if (!penaltyMessageAdded) { dailyMessage += "<br>Not enough Elven Cloaks! The brutal pace hurt the uncloaked members.\n"; penaltyMessageAdded = true; } }
        }

        stateMember.health += personalHealthChange;
        if (stateMember.health > 100) stateMember.health = 100;
        if (stateMember.health <= 0) { stateMember.health = 0; stateMember.isAlive = false; dailyMessage += `<br>${stateMember.name} has fallen... \n`; }
    });

    const ringbearer = state.party.find(m => m.isRingbearer);
    if (!ringbearer.isAlive) { showModal("Game Over", "Frodo has fallen. The Ring is lost.", [{text: "Try Again", action: () => location.reload()}], 'gameover.gif'); return; }
    if (state.ringCorruption >= 100) { showModal("Game Over", "The Ring has fully corrupted Frodo.", [{text: "Try Again", action: () => location.reload()}], 'gameover.gif'); return; }

    updateUI();

    if (arrivedAtLandmark) {
        if (nextLandmark.type === 'finish') {
            let finalScoreText = calculateScore();
            showModal("Victory!", `You have reached the fires of Mount Doom and destroyed the One Ring!<br>${finalScoreText}`, [{text: "Play Again", action: () => location.reload()}], 'victory.gif');
        } else if (nextLandmark.type === 'hazard') {
            triggerHazardEncounter(nextLandmark.name, dailyMessage);
        } else {
            showModal("Landmark Reached!", `${dailyMessage}<br><br>You have arrived at: ${nextLandmark.name}.`, [{text: 'Continue', action: null}], 'landmark.gif');
        }
    } else {
        showModal(`Day ${state.day}`, dailyMessage, eventData.buttons, currentGif);
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
        showModal("Camped", "The Fellowship rested and healed 15 HP, but the Ring's corruption grows heavier.", [{text: "Continue", action: null}], 'camp.gif'); 
    } else { showModal("Cannot Rest", "You do not have enough food to make camp safely!"); }
});

// --- GAME INITIALIZATION (THE OPENING STORY) ---
if (state.day === 1 && state.distanceTraveled === 0) {
    showModal(
        "The Fellowship Departs",
        "The Council of Elrond has concluded. A Fellowship of eight has been chosen to bear the One Ring to the fires of Mount Doom. The road stretches 2,000 miles through the perilous wilds of Middle-earth.<br><br>Manage your Travel Mode carefully. Keep the Hobbits alive to forage for food, and rely on Aragorn and Legolas to hunt when supplies run low. Beware the creeping shadow of the Ring's corruption, and guard your vanguard well.<br><br>Before you leave the valley, it would be wise to visit the Trading Post. May the stars shine upon your faces!",
        [
            { text: "Visit Trading Post", action: () => tradeBtn.click() },
            { text: "Set Forth", action: null }
        ],
        'waterfall.gif' 
    );
}
