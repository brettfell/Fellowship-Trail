// The Fellowship Trail - Game Engine v1.11

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
const healBtn = document.getElementById('heal-btn');
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

    // NEW: Forces buttons to stack vertically and adds a scrollbar!
    modalButtons.style.display = 'flex';
    modalButtons.style.flexDirection = 'column';
    modalButtons.style.gap = '10px';
    modalButtons.style.maxHeight = '40vh'; 
    modalButtons.style.overflowY = 'auto';
    modalButtons.style.padding = '5px';

    buttons.forEach(btn => {
        const buttonEl = document.createElement('button');
        buttonEl.innerText = btn.text;
        buttonEl.style.width = '100%'; // Makes buttons stretch nicely
        buttonEl.style.margin = '0';
        buttonEl.onclick = () => {
            modal.style.display = 'none'; 
            if (btn.action) btn.action(); 
        };
        modalButtons.appendChild(buttonEl);
    });
    modal.style.display = 'block';
}

// --- INTERACTIVE RANDOM EVENT ENGINE ---
function getRandomEvent() {
    const defaultReturn = { text: "", buttons: [{text: 'Continue', action: null}] };
    
    // Increased chance to 45% so you see trades more often
    if (Math.random() > 0.45) return defaultReturn;

    const livingMembers = state.party.filter(m => m.isAlive);
    if (livingMembers.length === 0) return defaultReturn;
    const randomMember = livingMembers[Math.floor(Math.random() * livingMembers.length)];
    
    const events = [
        // Passive Events (Return standard Continue button)
        () => {
            if (randomMember.status !== 'Healthy') return defaultReturn; 
            randomMember.status = 'Sick';
            return { text: `<br><br><span style="color: orange;">⚠️ <strong>Bad Water:</strong> ${randomMember.name} drank from a stagnant pool and is now Sick! (-5 extra HP per day)</span>`, buttons: [{text: 'Continue', action: null}] };
        },
        () => {
            if (randomMember.status !== 'Healthy') return defaultReturn;
            randomMember.status = 'Injured';
            return { text: `<br><br><span style="color: orange;">⚠️ <strong>Rough Terrain:</strong> ${randomMember.name} took a nasty fall and is Injured! (-8 extra HP per day)</span>`, buttons: [{text: 'Continue', action: null}] };
        },
        () => {
            if (randomMember.status !== 'Healthy') return defaultReturn;
            randomMember.status = 'Poisoned';
            return { text: `<br><br><span style="color: red;">🕷️ <strong>Spider Bite!</strong> ${randomMember.name} was bitten in the night and is Poisoned! (-12 extra HP per day)</span>`, buttons: [{text: 'Continue', action: null}] };
        },
        () => {
            let stolen = Math.floor(Math.random() * 15) + 5;
            if (state.inventory.food >= stolen) {
                state.inventory.food -= stolen;
                return { text: `<br><br><span style="color: orange;">⚠️ <strong>Thief!</strong> Gollum crept into camp while you slept and stole ${stolen} portions of Lembas bread.</span>`, buttons: [{text: 'Continue', action: null}] };
            }
            return defaultReturn;
        },
        () => {
            state.inventory.medicine += 1;
            return { text: `<br><br><span style="color: #4a5d23;">🌿 <strong>Good Fortune:</strong> You spotted Kingsfoil growing near the path! (+1 Athelas leaf)</span>`, buttons: [{text: 'Continue', action: null}] };
        },

        // --- NEW: Interactive Trade Events ---
        () => {
            let cost = Math.floor(Math.random() * 15) + 25; // 25-39 coins
            return {
                text: `<br><br><span style="color: #d4af37;">🤝 <strong>Wandering Elves:</strong> A scout offers to sell you 1 Elven Cloak for ${cost} Silver Pennies.</span>`,
                buttons: [
                    {
                        text: `Buy Cloak (${cost} coins)`,
                        action: () => {
                            if (state.inventory.currency >= cost) {
                                state.inventory.currency -= cost;
                                state.inventory.cloaks += 1;
                                updateUI();
                                showModal("Trade Successful", `You handed over the coins and received an Elven Cloak. It will protect a party member during grueling travel.`);
                            } else {
                                showModal("Trade Failed", "You don't have enough Silver Pennies. The scout departs in silence.");
                            }
                        }
                    },
                    { text: "Decline Offer", action: null }
                ]
            };
        },
        () => {
            let cost = Math.floor(Math.random() * 10) + 10; // 10-19 coins
            let qty = Math.floor(Math.random() * 15) + 15;  // 15-29 food
            return {
                text: `<br><br><span style="color: #d4af37;">🤝 <strong>Friendly Strangers:</strong> A group of travelers offers you ${qty} portions of food for ${cost} Silver Pennies.</span>`,
                buttons: [
                    {
                        text: `Buy Food (${cost} coins)`,
                        action: () => {
                            if (state.inventory.currency >= cost) {
                                state.inventory.currency -= cost;
                                state.inventory.food += qty;
                                updateUI();
                                showModal("Trade Successful", `You successfully traded for ${qty} portions of food to sustain the Fellowship.`);
                            } else {
                                showModal("Trade Failed", "You don't have enough Silver Pennies to make the trade.");
                            }
                        }
                    },
                    { text: "Decline Offer", action: null }
                ]
            };
        },
        () => {
            let offer = Math.floor(Math.random() * 20) + 20; // 20-39 coins
            let foodWanted = Math.floor(Math.random() * 15) + 15; // 15-29 food
            return {
                text: `<br><br><span style="color: #d4af37;">🤝 <strong>Desperate Refugee:</strong> A starving traveler begs to buy ${foodWanted} portions of your Lembas bread in exchange for ${offer} Silver Pennies.</span>`,
                buttons: [
                    {
                        text: `Sell Food (+${offer} coins)`,
                        action: () => {
                            if (state.inventory.food >= foodWanted) {
                                state.inventory.food -= foodWanted;
                                state.inventory.currency += offer;
                                updateUI();
                                showModal("Trade Successful", `You parted with your food, but your purse is ${offer} Silver Pennies heavier.`);
                            } else {
                                showModal("Trade Failed", "You realize you don't even have enough food to spare.");
                            }
                        }
                    },
                    { text: "Decline Offer", action: null }
                ]
            };
        }
    ];

    return events[Math.floor(Math.random() * events.length)]();
}

// --- HEALING LOGIC ---
healBtn.addEventListener('click', () => {
    if (state.inventory.medicine <= 0) {
        showModal("No Medicine", "You do not have any Athelas leaves!");
        return;
    }
    
    let healButtons = [];
    state.party.forEach(m => {
        if (m.isAlive && (m.health < 100 || m.status !== 'Healthy')) {
            healButtons.push({ text: m.name, action: () => applyAthelas(m.name) });
        }
    });

    if (healButtons.length === 0) {
        showModal("Everyone is Healthy", "The Fellowship is already at full health and free of ailments.");
    } else {
        healButtons.push({text: "Cancel", action: null});
        showModal("Use Athelas", "Who will you treat? (Restores 30 HP and cures all ailments)", healButtons);
    }
});

function applyAthelas(memberName) {
    state.inventory.medicine--;
    let member = state.party.find(m => m.name === memberName);
    member.health = Math.min(100, member.health + 30);
    member.status = 'Healthy';
    updateUI();
    showModal("Treated", `${memberName} was treated with Athelas. They recovered 30 HP and are fully cured.`);
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
    } else { alert("Not enough Silver Pennies!"); }
}

function closeShop() { shopModal.style.display = 'none'; }

// --- HAZARD / BATTLE ENCOUNTER ENGINE ---
function triggerHazardEncounter(hazardName, dailyMessage) {
    let enemyDesc = "";
    if (hazardName === "The Pass of Caradhras") enemyDesc = "A pack of Wargs and Saruman's Orc scouts block the mountain pass!";
    if (hazardName === "The Mines of Moria") enemyDesc = "A massive swarm of Moria Goblins block the great bridge!";
    if (hazardName === "The Argonath") enemyDesc = "A deadly band of Uruk-hai ambush you from the woods!";

    const message = `${dailyMessage}<br><br>**HAZARD ENCOUNTERED!**<br>${enemyDesc}<br>How will the Fellowship proceed?`;

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
        let hasGear = (state.inventory.arrows >= 5 && state.inventory.whetstones >= 1 && state.inventory.axeHandles >= 1);
        let arrowsLost = Math.min(state.inventory.arrows, Math.floor(Math.random() * 6)); 
        let whetstonesLost = Math.min(state.inventory.whetstones, Math.floor(Math.random() * 3)); 
        let axeHandlesLost = Math.min(state.inventory.axeHandles, Math.floor(Math.random() * 3)); 

        state.inventory.arrows -= arrowsLost;
        state.inventory.whetstones -= whetstonesLost;
        state.inventory.axeHandles -= axeHandlesLost;

        resultMessage = `You charged into battle! In the chaos, you lost ${arrowsLost} arrows, ${whetstonesLost} whetstones, and ${axeHandlesLost} axe handles.<br><br>`;
        if (!hasGear) resultMessage += "**Your weapons were dull and quivers empty! The enemy overwhelmed your defenses.**<br><br>";

        state.party.forEach(m => {
            if (m.isAlive) {
                let dmg = hasGear ? Math.floor(Math.random() * 21) : Math.floor(Math.random() * 21) + 15;
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
    if (!ringbearer.isAlive) { showModal("Game Over", resultMessage + "<br><br>Frodo has fallen. The Ring is lost.", [{text: "Try Again", action: () => location.reload()}]); return; }
    if (state.ringCorruption >= 100) { showModal("Game Over", resultMessage + "<br><br>The Ring has fully corrupted Frodo.", [{text: "Try Again", action: () => location.reload()}]); return; }

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

    // Only roll for a random event if we DID NOT just trigger a major landmark or hazard
    let eventData = { text: "", buttons: [{text: 'Continue', action: null}] };
    if (!arrivedAtLandmark) {
        eventData = getRandomEvent();
        dailyMessage += eventData.text;
    }

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
        dailyMessage += "<br>You are out of Lembas bread! The Fellowship is starving. \n";
    }

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

        if (state.pace === 'Grueling') {
            if (cloaksLeft > 0) cloaksLeft--; 
            else {
                personalHealthChange -= 10; 
                if (!penaltyMessageAdded) { dailyMessage += "<br>Not enough Elven Cloaks! Some members took damage.\n"; penaltyMessageAdded = true; }
            }
        }
        
        stateMember.health += personalHealthChange;
        if (stateMember.health > 100) stateMember.health = 100;
        if (stateMember.health <= 0) { stateMember.health = 0; stateMember.isAlive = false; dailyMessage += `<br>${stateMember.name} has fallen... \n`; }
    });

    const ringbearer = state.party.find(m => m.isRingbearer);
    if (!ringbearer.isAlive) { showModal("Game Over", "Frodo has fallen. The Ring is lost.", [{text: "Try Again", action: () => location.reload()}]); return; }
    if (state.ringCorruption >= 100) { showModal("Game Over", "The Ring has fully corrupted Frodo.", [{text: "Try Again", action: () => location.reload()}]); return; }

    updateUI();
    
    let travelGif = "walking.gif"; 

    if (arrivedAtLandmark) {
        if (nextLandmark.type === 'finish') {
            showModal("Victory!", `You have reached the fires of ${nextLandmark.name} and destroyed the One Ring!`, [{text: "Play Again", action: () => location.reload()}]);
        } else if (nextLandmark.type === 'hazard') {
            triggerHazardEncounter(nextLandmark.name, dailyMessage);
        } else {
            showModal("Landmark Reached!", `${dailyMessage}<br><br>You have arrived at: ${nextLandmark.name}.`);
        }
    } else {
        // Now using the dynamic eventData.buttons instead of just a generic 'Continue'
        showModal(`Day ${state.day}`, dailyMessage, eventData.buttons, travelGif);
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
