// --- INITIAL STATE ---
let day = 1;
let miles = 0;
let food = 100;
let silver = 50;
let arrows = 15; // Nerfed starting arrows
let whetstones = 3;
let athelas = 5;
let corruption = 0;
let isSick = { Sam: false }; // Keeping the sick logic as requested

// Fellowship Array
let fellowship = [
    { name: "Frodo", hp: 100 },
    { name: "Sam", hp: 100 },
    { name: "Merry", hp: 100 },
    { name: "Pippin", hp: 100 },
    { name: "Aragorn", hp: 100 },
    { name: "Legolas", hp: 100 },
    { name: "Gimli", hp: 100 },
    { name: "Gandalf", hp: 100 }
];

// --- CORE LOOPS ---

function updateUI() {
    document.getElementById("day-count").innerText = day;
    document.getElementById("mileage").innerText = miles;
    document.getElementById("corruption-percent").innerText = corruption;
    document.getElementById("food").innerText = food;
    document.getElementById("silver").innerText = silver;
    document.getElementById("arrows").innerText = arrows;
    document.getElementById("whetstones").innerText = whetstones;
    document.getElementById("athelas").innerText = athelas;

    // Persistent Location Logic
    let loc = "In the Wilds";
    let showShop = false;

    if (miles >= 2000) loc = "Mount Doom (Victory!)";
    else if (miles >= 1700) { loc = "Minas Tirith"; showShop = true; } 
    else if (miles >= 1500) loc = "Cirith Ungol / Morgul Vale";
    else if (miles >= 1250) loc = "The Black Gate";
    else if (miles >= 1000) loc = "The Dead Marshes";
    else if (miles >= 750) loc = "The Argonath";
    else if (miles >= 500) { loc = "Lothlórien"; showShop = true; }

    document.getElementById("location-text").innerText = loc;
    
    // Toggle Shop Button
    document.getElementById("btn-shop").className = showShop ? "" : "hidden";

    // Update HP List
    let partyHTML = "";
    fellowship.forEach(member => {
        partyHTML += `<li>${member.name}: ${member.hp} HP</li>`;
    });
    document.getElementById("party-list").innerHTML = partyHTML;
}

function travel() {
    day += 1;
    miles += Math.floor(Math.random() * 10) + 18; // 18-27 miles per day
    food -= 16; // 2 portions per member
    
    // Base travel attrition
    fellowship.forEach(member => member.hp -= 1);
    
    if (isSick.Sam) {
        let sam = fellowship.find(m => m.name === "Sam");
        if (sam) sam.hp -= 5;
    }

    // Trigger Random Event (30% chance)
    if (Math.random() < 0.30) {
        generateEvent();
    } else {
        updateUI();
    }
}

// --- NEW MECHANICS ---

function hunt() {
    if (arrows <= 0) {
        alert("Legolas is out of arrows! You cannot hunt.");
        return;
    }

    day += 1;
    let arrowsUsed = Math.floor(Math.random() * 3) + 2; // Burns 2-4 arrows
    arrows = Math.max(0, arrows - arrowsUsed);

    let whetstoneUsed = false;
    let dullBlade = false;

    if (whetstones > 0) {
        if (Math.random() < 0.33) {
            whetstones -= 1;
            whetstoneUsed = true;
        }
    } else {
        dullBlade = true; // No whetstones left for Aragorn
    }

    // Yield calculation
    let baseYield = Math.floor(Math.random() * 15) + 15; // 15-30 food
    if (dullBlade) baseYield = Math.floor(baseYield / 2); // 50% penalty

    food += baseYield;
    
    let msg = `Legolas used ${arrowsUsed} arrows. The Rangers gathered ${baseYield} food.`;
    if (whetstoneUsed) msg += " Aragorn used 1 Whetstone sharpening his blade.";
    if (dullBlade) msg += " Aragorn's blade is dull; food yield was halved.";
    
    alert(msg);
    updateUI();
}

// --- EVENT GENERATOR ---

function generateEvent() {
    let roll = Math.random();
    
    // Wraith Event Escalation
    if (corruption >= 20 && roll < 0.40) {
        triggerWraithEvent();
        return;
    }

    // Nerfed Ranger Trade
    if (roll < 0.30 && athelas > 0) {
        triggerRangerTrade();
        return;
    }

    alert("The road is quiet today, but the shadow grows...");
    updateUI();
}

function triggerWraithEvent() {
    let choice = prompt("WRAITHS APPROACH! \n1. Wear the Ring (Escape, +15% Corruption) \n2. Hide in the shadows (5 Days pass, -80 Food, -25 HP to all, -5% Corruption)");
    
    if (choice === "1") {
        corruption += 15;
        alert("Frodo put on the Ring! You escaped, but the corruption deepens.");
    } else {
        day += 5;
        food -= 80;
        corruption = Math.max(0, corruption - 5);
        fellowship.forEach(member => member.hp -= 25);
        alert("The Fellowship hid for 5 days. You are starving and terrified, but the Ring cooled slightly.");
    }
    updateUI();
}

function triggerRangerTrade() {
    let choice = prompt("A Desperate Ranger begs for 1 Athelas leaf. \n1. Trade for 12 Silver Pennies \n2. Trade for 5 Arrows & 1 Whetstone \n3. Ignore him");
    
    if (choice === "1") {
        athelas -= 1;
        silver += 12; // Nerfed from 38+
        alert("Traded for 12 Silver.");
    } else if (choice === "2") {
        athelas -= 1;
        arrows += 5;
        whetstones += 1;
        alert("Traded for Arrows and a Whetstone.");
    }
    updateUI();
}

// --- SHOP LOGIC ---
function openShop() {
    let choice = prompt(`Trading Post (${silver} Silver)\n1. Buy Athelas (25 Silver)\n2. Buy Arrows (Bundle of 5 for 10 Silver)\n3. Leave`);
    
    if (choice === "1" && silver >= 25) {
        silver -= 25;
        athelas += 1;
        alert("Bought 1 Athelas leaf.");
    } else if (choice === "2" && silver >= 10) {
        silver -= 10;
        arrows += 5; // Reduced bundle size
        alert("Bought 5 Arrows.");
    } else if (choice === "1" || choice === "2") {
        alert("Not enough silver!");
    }
    updateUI();
}

// Initialize
updateUI();
