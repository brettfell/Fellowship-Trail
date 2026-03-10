// The Fellowship Trail - Game Engine v1.21
const defaultState = {
    day: 1,
    distanceTraveled: 0,
    totalDistance: 2000, 
    ringCorruption: 0,      

    inventory: {
        food: 300,      
        medicine: 5,    
        pipeweed: 3,
        currency: 150,     
        arrows: 15,
        whetstones: 3,
        axeHandles: 2,
        woodenTokens: 0 
    },

    party: [
        { name: "Frodo", isAlive: true, health: 100, isRingbearer: true, status: 'Healthy', statusDays: 0 },
        { name: "Sam", isAlive: true, health: 100, status: 'Healthy', statusDays: 0 },
        { name: "Aragorn", isAlive: true, health: 100, status: 'Healthy', statusDays: 0 },
        { name: "Legolas", isAlive: true, health: 100, status: 'Healthy', statusDays: 0 },
        { name: "Gimli", isAlive: true, health: 100, status: 'Healthy', statusDays: 0 },
        { name: "Gandalf", isAlive: true, health: 100, status: 'Healthy', statusDays: 0 },
        { name: "Merry", isAlive: true, health: 100, status: 'Healthy', statusDays: 0 },
        { name: "Pippin", isAlive: true, health: 100, status: 'Healthy', statusDays: 0 }
    ],

    currentLocation: 'Rivendell',
    nextLandmarkIndex: 0
};

const landmarks = [
    { name: "The Pass of Caradhras", distance: 150, type: "hazard" },
    { name: "The Mines of Moria", distance: 400, type: "hazard" },
    { name: "Lothlórien", distance: 500, type: "town" },
    { name: "The Argonath", distance: 750, type: "hazard" },
    { name: "The Dead Marshes", distance: 1000, type: "hazard" },
    { name: "The Black Gate", distance: 1250, type: "hazard" },
    { name: "Cirith Ungol", distance: 1500, type: "hazard" },
    { name: "Minas Tirith", distance: 1700, type: "town" },
    { name: "Mount Doom", distance: 2000, type: "finish" }
];

const shopInventory = [
    { id: 'food', name: "Lembas Bread (20 portions)", cost: 5, qty: 20 },
    { id: 'medicine', name: "Athelas (1 leaf)", cost: 10, qty: 1 },
    { id: 'pipeweed', name: "Longbottom Leaf (1 pouch)", cost: 15, qty: 1 },
    { id: 'arrows', name: "Bundle of Arrows (5)", cost: 10, qty: 5 },
    { id: 'whetstones', name: "Ranger's Whetstone", cost: 8, qty: 1 },
    { id: 'axeHandles', name: "Sturdy Axe Handle", cost: 12, qty: 1 }
];

const sellableItems = [
    { id: 'medicine', name: "Athelas Leaf", sellPrice: 5 },
    { id: 'whetstones', name: "Whetstone", sellPrice: 4 },
    { id: 'axeHandles', name: "Axe Handle", sellPrice: 5 },
    { id: 'pipeweed', name: "Longbottom Leaf", sellPrice: 8 },
    { id: 'arrows', name: "Arrow (1)", sellPrice: 1 } 
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
    document.getElementById('arrow-supply').innerText = state.inventory.arrows;
    document.getElementById('whetstone-supply').innerText = state.inventory.whetstones;
    document.getElementById('axe-supply').innerText = state.inventory.axeHandles;

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
            let daysLeft = member.statusDays > 0 ? ` (${member.statusDays} days left)` : '';
            let statusText = member.status === 'Healthy' ? '' : ` <span style="color: orange;">(${member.status}${daysLeft})</span>`;
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
    modalButtons.style.justifyContent = 'flex-start'; 

    buttons.forEach(btn => {
        const buttonEl = document.createElement('button');
        buttonEl.innerText = btn.text;
        buttonEl.style.width = '100%'; 
        buttonEl.style.margin = '0';
        buttonEl.style.flexShrink = '0'; 
        buttonEl.onclick = () => {
            modal.style.display = 'none'; 
            if (btn.action) btn.action(); 
        };
        modalButtons.appendChild(buttonEl);
    });
    modal.style.display = 'block';
}

// --- MASTER EVENT ENGINE ---
function getRandomEvent() {
    const defaultReturn = { text: "", buttons: [{text: 'Continue', action: null}], gifUrl: null };
    if (Math.random() > 0.55) return defaultReturn; 

    const livingMembers = state.party.filter(m => m.isAlive);
    if (livingMembers.length === 0) return defaultReturn;

    // --- THE WRAITH ESCALATION ---
    if (state.ringCorruption >= 20 && Math.random() < 0.3) {
        return {
            text: `<br><br><span style="color: cyan;">👻 <strong>THE NAZGÛL APPROACH:</strong> The air grows freezing cold. The Wraiths have found you!</span>`,
            buttons: [
                { text: "Wear the Ring (+15% Corruption)", action: () => { 
                    state.ringCorruption += 15; updateUI(); 
                    showModal("Escaped", "Frodo put on the Ring! You escaped, but the Eye sees you.", [{text:"Continue", action:null}], "nazgul.gif"); 
                }},
                { text: "Hide (5 Days, -80 Food, -25 HP)", action: () => { 
                    state.day += 5; 
                    state.inventory.food = Math.max(0, state.inventory.food - 80); 
                    state.ringCorruption = Math.max(0, state.ringCorruption - 5);
                    state.party.forEach(m => { if(m.isAlive) m.health -= 25; });
                    updateUI(); 
                    showModal("Hidden", "You hid for 5 agonizing days. The Fellowship starved and took heavy damage from the terror, but the Ring cooled.", [{text:"Continue", action:null}], "nazgul.gif"); 
                }}
            ],
            gifUrl: 'nazgul.gif'
        };
    }

    const randomMember = livingMembers[Math.floor(Math.random() * livingMembers.length)];
    const randomMemberGif = `${randomMember.name.toLowerCase()}-status.gif`; 

    const events = [
        () => {
            if (randomMember.status !== 'Healthy') return defaultReturn; 
            randomMember.status = 'Sick';
            randomMember.statusDays = Math.floor(Math.random() * 3) + 3; 
            return { text: `<br><br><span style="color: orange;">⚠️ <strong>Bad Water:</strong> ${randomMember.name} drank from a stagnant pool and is Sick! (-5 HP per day)</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: randomMemberGif };
        },
        () => {
            if (randomMember.status !== 'Healthy') return defaultReturn;
            randomMember.status = 'Injured';
            randomMember.statusDays = Math.floor(Math.random() * 3) + 3;
            return { text: `<br><br><span style="color: orange;">⚠️ <strong>Rough Terrain:</strong> ${randomMember.name} took a nasty fall and is Injured! (-8 HP per day)</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: randomMemberGif };
        },
        () => {
            if (randomMember.status !== 'Healthy') return defaultReturn;
            randomMember.status = 'Poisoned';
            randomMember.statusDays = Math.floor(Math.random() * 3) + 3;
            return { text: `<br><br><span style="color: red;">🕷️ <strong>Spider Bite!</strong> ${randomMember.name} was bitten in the night and is Poisoned! (-12 HP per day)</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'spider.gif' };
        },
        () => { // The Gollum Catch (Axe Required)
            if (state.inventory.food <= 0) {
                return { text: `<br><br><span style="color: #4a5d23;">👀 <strong>A Shadow in the Dark:</strong> Gollum crept into your camp to steal food, but found your pantry completely empty. He slinked away in disgust.</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'gollum-pouting.gif' };
            }

            let stolen = Math.floor(Math.random() * 15) + 5;
            let gimliAlive = state.party.find(m => m.name === 'Gimli').isAlive;
            let hasHandle = state.inventory.axeHandles > 0;

            if (gimliAlive && hasHandle) {
                if (Math.random() > 0.5) { 
                    return { text: `<br><br><span style="color: #4a5d23;">👀 <strong>Gimli on Guard:</strong> Gollum crept into camp to steal food, but Gimli brandished his axe and scared the creature off. Gollum slinked away empty-handed.</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'gollum-pouting.gif' };
                } else { 
                    state.inventory.food = Math.max(0, state.inventory.food - stolen);
                    return { text: `<br><br><span style="color: orange;">⚠️ <strong>Thief!</strong> Gollum managed to sneak past Gimli's watch and stole ${stolen} portions of food!</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'gollum.gif' };
                }
            } else if (gimliAlive && !hasHandle) {
                state.inventory.food = Math.max(0, state.inventory.food - stolen);
                return { text: `<br><br><span style="color: orange;">⚠️ <strong>Thief!</strong> Gimli tried to guard the camp, but without a sturdy axe, he couldn't keep the wretched creature at bay. Gollum stole ${stolen} portions of food!</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'gollum.gif' };
            } else { 
                state.inventory.food = Math.max(0, state.inventory.food - stolen);
                return { text: `<br><br><span style="color: red;">⚠️ <strong>Thief!</strong> With Gimli gone, the camp was unguarded. Gollum crept in and stole ${stolen} portions of food!</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'gollum.gif' };
            }
        },
        () => { // Half-chance Athelas
            state.inventory.medicine += 1;
            return { text: `<br><br><span style="color: #4a5d23;">🌿 <strong>Good Fortune:</strong> You spotted Kingsfoil growing near the path! (+1 Athelas leaf)</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'kingsfoil.gif' };
        },
        () => { // Wild Pipe-weed Event
            state.inventory.pipeweed += 1;
            return { text: `<br><br><span style="color: #6d597a;">💨 <strong>Rare Find:</strong> You discovered a wild patch of sweet-smelling herbs. (+1 Pipe-weed Pouch)</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'pipeweed.gif' };
        },
        () => { // Spoiled Meat Hazard
            if (state.inventory.food < 40) return defaultReturn;
            let spoiled = Math.floor(state.inventory.food * 0.2); 
            state.inventory.food -= spoiled;
            return { text: `<br><br><span style="color: red;">🪰 <strong>Rot and Ruin:</strong> The damp weather caused ${spoiled} portions of your food supply to spoil!</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'meat-bad.gif' };
        },
        () => { // Troll Cache
            let coins = Math.floor(Math.random() * 15) + 10;
            state.inventory.currency += coins;
            return { text: `<br><br><span style="color: #d4af37;">💰 <strong>Forgotten Hoard:</strong> You stumbled upon an old, abandoned Troll-hole. Hidden in the muck was a lockbox with ${coins} Silver Pennies!</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'trade.gif' };
        },
        () => { // Abandoned Camp Loot
            const items = ['arrows', 'whetstones', 'axeHandles'];
            const foundItem = items[Math.floor(Math.random() * items.length)];
            const foundName = foundItem === 'arrows' ? 'Bundle of Arrows' : foundItem === 'whetstones' ? 'Whetstone' : 'Axe Handle';
            state.inventory[foundItem] += 1;
            return { text: `<br><br><span style="color: #4a5d23;">🏕️ <strong>Abandoned Camp:</strong> You found the remains of a Ranger camp. Searching the ashes, you recovered a ${foundName}!</span>`, buttons: [{text: 'Continue', action: null}], gifUrl: 'camp.gif' };
        },
        () => { // Desperate Ranger Trade (TOKEN SYSTEM)
            if (state.inventory.medicine <= 0) return defaultReturn; 
            let rangerButtons = [
                { text: `Trade for 12 Coins`, action: () => { 
                    if (state.inventory.medicine >= 1) { state.inventory.medicine -= 1; state.inventory.currency += 12; updateUI(); showModal("Traded", `You handed over the medicine for 12 Silver Pennies.`); } 
                }},
                { text: `Trade for 5 Arrows & 1 Whetstone`, action: () => { 
                    if (state.inventory.medicine >= 1) { state.inventory.medicine -= 1; state.inventory.arrows += 5; state.inventory.whetstones += 1; updateUI(); showModal("Traded", `You traded for 5 arrows and a whetstone.`); } 
                }},
                { text: "Keep Your Medicine", action: null }
            ];

            let hasFutureHazard = landmarks.some(l => l.type === 'hazard' && l.distance > state.distanceTraveled);
            if (state.inventory.woodenTokens === 0 && hasFutureHazard) {
                rangerButtons.unshift({
                    text: "Give Leaf Freely", action: () => {
                        if (state.inventory.medicine >= 1) {
                            state.inventory.medicine -= 1;
                            state.inventory.woodenTokens += 1;
                            updateUI();
                            showModal("A Selfless Act", "The Ranger takes the leaf with tears in his eyes.\n\n\"Your generosity knows no bounds... the woods have a way of repaying one for charity.\"\n\nHe presses a small carved Wooden Token into your hand before disappearing into the brush.", [{text: "Continue", action: null}], 'ranger-trade.gif');
                        }
                    }
                });
            }

            return {
                text: `<br><br><span style="color: #d4af37;">🤝 <strong>Desperate Ranger:</strong> A severely wounded traveler begs you for an Athelas leaf.</span>`,
                buttons: rangerButtons,
                gifUrl: 'ranger-trade.gif' 
            };
        },
        () => { // Figwit Trade
            let selling = Math.random() > 0.5;
            let figButtons = selling ? [
                { text: `Buy Bread (10 Coins)`, action: () => { 
                    if(state.inventory.currency >= 10) { state.inventory.currency -= 10; state.inventory.food += 20; updateUI(); showModal("Traded", "You purchased the Lembas bread."); } 
                    else { showModal("Not Enough Coins", "You cannot afford the bread."); } 
                }},
                { text: "Decline", action: null }
            ] : [
                { text: `Sell Food (Gain 15 Coins)`, action: () => { 
                    if(state.inventory.food >= 20) { state.inventory.food -= 20; state.inventory.currency += 15; updateUI(); showModal("Traded", "You sold the food."); } 
                    else { showModal("Not Enough Food", "You do not have enough food to spare."); } 
                }},
                { text: "Decline", action: null }
            ];

            return {
                text: `<br><br><span style="color: #4a5d23;">🧝 <strong>Elven Scout:</strong> A scout crosses your path offering a trade of supplies.</span>`,
                buttons: figButtons,
                gifUrl: 'figwit.gif'
            };
        }
    ];
    return events[Math.floor(Math.random() * events.length)]();
}

// --- HUNTING LOOP ---
huntBtn.addEventListener('click', () => {
    state.day++;
    state.ringCorruption += 1;

    let aragornObj = state.party.find(m => m.name === 'Aragorn');
    let aragorn = aragornObj.isAlive;
    let legolas = state.party.find(m => m.name === 'Legolas').isAlive;
    let legolasOut = false;
    let fletchedArrows = 0;

    if (legolas && state.inventory.arrows < 2) {
        legolas = false; 
        legolasOut = true; 
        fletchedArrows = Math.floor(Math.random() * 2) + 1; 
        state.inventory.arrows += fletchedArrows;
    }

    if (!legolas && !aragorn) {
        let meagerFood = Math.floor(Math.random() * 10) + 5;
        state.inventory.food += meagerFood;
        let meagerMsg = `Without hunters, the party scavenged ${meagerFood} portions of meager food.`;
        if (legolasOut) meagerMsg = `Legolas fletched (+${fletchedArrows} Arrows). ` + meagerMsg;
        updateUI();
        showModal("Hunting", meagerMsg, [{text: "Continue", action: null}], 'meat-good.gif');
        return;
    }

    let arrowsUsed = 0;
    if (legolas) {
        arrowsUsed = Math.floor(Math.random() * 3) + 2; 
        state.inventory.arrows = Math.max(0, state.inventory.arrows - arrowsUsed);
    }

    let whetstoneUsed = false;
    if (aragorn && state.inventory.whetstones > 0) {
        if (Math.random() < 0.45) { // 45% proc chance
            state.inventory.whetstones -= 1;
            whetstoneUsed = true;
        }
    }

    let foodYield = legolas ? Math.floor(Math.random() * 15) + 15 : Math.floor(Math.random() * 11) + 15; 
    if (whetstoneUsed) foodYield *= 2; 
    state.inventory.food += foodYield;

    let aragornDmg = 0;
    let aragornFallenMsg = "";
    if (aragorn && !legolas) { 
        aragornDmg = Math.floor(Math.random() * 6) + 5;
        aragornObj.health = Math.max(0, aragornObj.health - aragornDmg);
        if (aragornObj.health === 0) { aragornObj.isAlive = false; aragornFallenMsg = `<br><br><span style='color: red;'>**Aragorn has fallen during the melee hunt!**</span>`; }
    }

    let huntMsg = legolasOut ? `Legolas stayed back to fletch (+${fletchedArrows} Arrows). ` : legolas ? `Legolas used ${arrowsUsed} arrows. ` : "";
    huntMsg += whetstoneUsed ? `<br><br><span style='color: #d4af37;'><strong>Critical Hunt!</strong> Aragorn's razor edge yielded ${foodYield} portions!</span>` : `The hunters gathered ${foodYield} portions.`;
    if (aragornDmg > 0) huntMsg += `<br><br><span style='color: orange;'>Hunting wild game with only a blade cost Aragorn ${aragornDmg} HP!</span>${aragornFallenMsg}`;

    updateUI();
    showModal("Hunting", huntMsg, [{text: "Continue", action: null}], 'meat-good.gif'); 
});

// --- HAZARDS ---
function triggerHazardEncounter(hazardName, dailyMessage) {
    let enemyDesc = "Fierce enemies block your path!";
    let hazardGif = "ambush.gif"; 

    if (hazardName === "The Pass of Caradhras") { enemyDesc = "A pack of Wargs and scouts block the pass!"; hazardGif = "caradhras.gif"; }
    else if (hazardName === "The Mines of Moria") { enemyDesc = "A swarm of Goblins block the bridge!"; hazardGif = "moria.gif"; }
    else if (hazardName === "The Argonath") { enemyDesc = "Uruk-hai ambush you from the woods!"; hazardGif = "ambush.gif"; }
    else if (hazardName === "The Dead Marshes") { enemyDesc = "Ghoulish lights flicker in the bog!"; hazardGif = "deadmarshes.gif"; }
    else if (hazardName === "The Black Gate") { enemyDesc = "Easterling forces guard the ash-plains!"; hazardGif = "blackgate.gif"; }
    else if (hazardName === "Cirith Ungol") { enemyDesc = "Shelob's brood swarms the stairs!"; hazardGif = "shelob.gif"; }

    let availableAlly;
    if (state.inventory.woodenTokens > 0) {
        availableAlly = { text: "Call the Ents (Uses 1 Wooden Token)", type: "ents", cost: 1, resource: "woodenTokens" };
    } else {
        const standardAllies = [
            { text: "Call the Great Eagles (25 Food)", type: "eagles", cost: 25, resource: "food" },
            { text: "Hire Dwarven Vanguard (35 Coins)", type: "dwarves", cost: 35, resource: "currency" },
            { text: "Pay Elven Scouts (30 Coins)", type: "elves", cost: 30, resource: "currency" }
        ];
        availableAlly = standardAllies[Math.floor(Math.random() * standardAllies.length)];
    }

    showModal(`Arrived at ${hazardName}`, `${dailyMessage}<br><br>**HAZARD ENCOUNTERED!**<br>${enemyDesc}`, [
        { text: "Charge into Battle", action: () => resolveHazard('fight', hazardName) },
        { text: "Take a Detour (3 Days)", action: () => resolveHazard('detour', hazardName) },
        { text: availableAlly.text, action: () => resolveHazard('ally', hazardName, availableAlly) }
    ], hazardGif);
}

function resolveHazard(choice, hazardName, allyData = null) {
    let resultMessage = "";
    const livingCount = state.party.filter(m => m.isAlive).length;

    if (choice === 'fight') {
        let hasGear = (state.inventory.arrows >= 5 && state.inventory.whetstones >= 1 && state.inventory.axeHandles >= 1);
        let vanguardIntact = (state.party.find(m => m.name === 'Aragorn').isAlive && state.party.find(m => m.name === 'Legolas').isAlive && state.party.find(m => m.name === 'Gimli').isAlive);
        
        state.inventory.arrows = Math.max(0, state.inventory.arrows - Math.floor(Math.random() * 6));
        state.inventory.whetstones = Math.max(0, state.inventory.whetstones - Math.floor(Math.random() * 3));
        state.inventory.axeHandles = Math.max(0, state.inventory.axeHandles - Math.floor(Math.random() * 3));

        resultMessage = `You charged! Gear was lost in the chaos.<br>`;
        if (!hasGear) resultMessage += "**Your dull blades and empty quivers offered little defense!**<br>";
        if (!vanguardIntact) resultMessage += "<span style='color: red;'>**The vanguard has crumbled! (+15 DMG)**</span><br>";

        state.party.forEach(m => {
            if (m.isAlive) {
                let dmg = (hasGear ? Math.floor(Math.random() * 21) : Math.floor(Math.random() * 21) + 15) + (vanguardIntact ? 0 : 15);
                m.health = Math.max(0, m.health - dmg);
                resultMessage += `${m.name} took ${dmg} dmg. `;
                if (m.health === 0) { m.isAlive = false; resultMessage += `**${m.name} has fallen!** `; }
            }
        });
    } else if (choice === 'detour') {
        state.day += 3; state.ringCorruption += 8;
        state.inventory.food = Math.max(0, state.inventory.food - (livingCount * 6));
        resultMessage = `A 3-day detour cost you food and time.`;
    } else if (choice === 'ally') {
        state.inventory[allyData.resource] -= allyData.cost;
        resultMessage = `Allies cleared the path safely!`;
    }

    const ringbearer = state.party.find(m => m.isRingbearer);
    if (!ringbearer.isAlive || state.ringCorruption >= 100) { 
        showModal("Game Over", resultMessage + "<br><br>The quest has failed.", [{text: "Restart", action: () => location.reload()}], 'frodo-fallen.gif'); 
    } else {
        updateUI(); showModal("Resolved", resultMessage);
    }
}

// --- TRAVEL LOOP ---
travelBtn.addEventListener('click', () => {
    state.day++;
    let arrivedAtLandmark = false;
    let nextLandmark = landmarks[state.nextLandmarkIndex];
    let miles = Math.floor(Math.random() * 10) + 20; 
    state.ringCorruption += 1;

    if (nextLandmark && (state.distanceTraveled + miles) >= nextLandmark.distance) {
        miles = nextLandmark.distance - state.distanceTraveled; 
        state.currentLocation = nextLandmark.name; 
        state.nextLandmarkIndex++; arrivedAtLandmark = true;
    } else {
        let currentDist = state.distanceTraveled + miles;
        if (currentDist >= 1700) state.currentLocation = "Gondor";
        else if (currentDist >= 1000) state.currentLocation = "Dead Marshes";
        else if (currentDist >= 500) state.currentLocation = "Rohan";
        else state.currentLocation = "The Wilds";
    }

    state.distanceTraveled += miles;
    let dailyMsg = `Traveled ${miles} miles. `;
    
    let passiveFood = 0;
    ['Sam', 'Merry', 'Pippin'].forEach(n => { if(state.party.find(m => m.name === n).isAlive) passiveFood += Math.floor(Math.random() * 3) + 1; });
    state.inventory.food += passiveFood;
    dailyMsg += `Hobbits scavenged +${passiveFood} food. `;

    let eventData = !arrivedAtLandmark ? getRandomEvent() : { text: "", buttons: [{text: 'Continue', action: null}], gifUrl: null };
    dailyMsg += eventData.text;

    let livingCount = state.party.filter(m => m.isAlive).length;
    let isStarving = false;
    if (state.inventory.food >= livingCount * 2) state.inventory.food -= livingCount * 2;
    else { state.inventory.food = 0; isStarving = true; dailyMsg += "<br><span style='color: red;'>Starving!</span>"; }

    state.party.forEach(m => {
        if (!m.isAlive) return;
        let pChange = -(Math.floor(Math.random() * 3)) + (isStarving ? -15 : 0);
        if (m.status === 'Sick') pChange -= 5;
        if (m.status === 'Injured') pChange -= 8;
        if (m.status === 'Poisoned') pChange -= 12;
        if (m.status !== 'Healthy') { m.statusDays--; if (m.statusDays <= 0) m.status = 'Healthy'; }
        m.health = Math.min(100, Math.max(0, m.health + pChange));
        if (m.health === 0) { m.isAlive = false; dailyMsg += `<br>**${m.name} has fallen!**`; }
    });

    updateUI();
    if (arrivedAtLandmark) {
        if (nextLandmark.type === 'finish') showModal("Victory!", "Mount Doom reached!", [{text: "Restart", action: () => location.reload()}], 'victory.gif');
        else if (nextLandmark.type === 'hazard') triggerHazardEncounter(nextLandmark.name, dailyMsg);
        else showModal("Arrived", dailyMsg + `<br><br>At ${nextLandmark.name}`, [{text: 'Continue', action: null}], 'landmark.gif');
    } else {
        showModal(`Day ${state.day}`, dailyMsg, eventData.buttons, eventData.gifUrl || 'walking.gif');
    }
});

restBtn.addEventListener('click', () => {
    const living = state.party.filter(m => m.isAlive).length;
    if (state.inventory.food >= living * 2) {
        state.inventory.food -= living * 2; state.day++; state.ringCorruption += 2;
        state.party.forEach(m => { if (m.isAlive) m.health = Math.min(100, m.health + 15); });
        let campMsg = "Healed 15 HP.";
        if (state.party.find(m => m.name === 'Legolas').isAlive) { 
            let f = Math.floor(Math.random() * 3) + 2; state.inventory.arrows += f; 
            campMsg += `<br>Legolas fletched +${f} arrows.`;
        }
        updateUI(); showModal("Camped", campMsg, [{text: "Continue", action: null}], 'camp.gif');
    } else showModal("No Food", "Cannot rest!");
});

tradeBtn.addEventListener('click', () => {
    document.getElementById('shop-currency').innerText = state.inventory.currency;
    const el = document.getElementById('shop-items');
    el.innerHTML = '<h4>Shop</h4>';
    shopInventory.forEach(i => { el.innerHTML += `<p>${i.name} (${i.cost}c) <button onclick="buyItem('${i.id}', ${i.cost}, ${i.qty})">Buy</button></p>`; });
    shopModal.style.display = 'block';
});

function buyItem(id, c, q) { if (state.inventory.currency >= c) { state.inventory.currency -= c; state.inventory[id] += q; tradeBtn.click(); updateUI(); } }
function closeShop() { shopModal.style.display = 'none'; }

healBtn.addEventListener('click', () => {
    let b = []; state.party.forEach(m => { if (m.isAlive && (m.health < 100 || m.status !== 'Healthy')) b.push({text: m.name, action: () => applyAthelas(m.name)}); });
    if (b.length > 0) showModal("Heal", "Who?", b, 'kingsfoil.gif');
});

function applyAthelas(n) { state.inventory.medicine--; let m = state.party.find(p => p.name === n); m.health = Math.min(100, m.health + 30); m.status = 'Healthy'; updateUI(); }

pipeBtn.addEventListener('click', () => {
    if (state.party.find(m => m.name === 'Gandalf').isAlive && state.inventory.pipeweed > 0) {
        state.inventory.pipeweed--; state.ringCorruption = Math.max(0, state.ringCorruption - 15); updateUI();
        showModal("Peace", "-15% Corruption", [{text: "Continue", action: null}], 'pipeweed.gif');
    }
});

if (state.day === 1 && state.distanceTraveled === 0) {
    showModal("Start", "Begin your journey.", [{text: "Shop", action: () => tradeBtn.click()}, {text: "Go", action: null}], 'waterfall.gif');
}
