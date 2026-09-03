// Cross-browser namespace polyfill (Firefox uses 'browser', Chromium uses 'chrome')
const ext = typeof browser !== "undefined" ? browser : chrome;

let allTabs = [];
let duplicates = [];
let savedTabs = [];

document.addEventListener("DOMContentLoaded", () => {
    loadTabs();
    loadSavedTabs();

    document
        .getElementById("refreshBtn")
        .addEventListener("click", loadTabs);
    document
        .getElementById("cleanupBtn")
        .addEventListener("click", cleanDuplicates);

    document
        .getElementById("organizeBtn")
        .addEventListener("click", organizeTabs);

    document
        .getElementById("saveAllBtn")
        .addEventListener("click", saveAllTabs);  
});

/*-------------------------------------
            LOAD TABS
--------------------------------------*/
async function loadTabs() {
    allTabs = await ext.tabs.query({});

    detectDuplicates();
    updateStats();
    calculateHealth();
    displayTabs();
}

/* ------------------------------------
        DUPLICATE DETECTION
---------------------------------------*/
function detectDuplicates() {
    const urlMap = new Map();
    duplicates = [];

    allTabs.forEach(tab => {
        if (!tab.url) return;

        // Ignores Chrome AND Firefox internal system/extension URLs
        if (
            tab.url.startsWith("chrome://") ||
            tab.url.startsWith("chrome-extension://") ||
            tab.url.startsWith("about:") ||
            tab.url.startsWith("moz-extension://")
        ){
            return;
        }

        if (urlMap.has(tab.url)){
            duplicates.push(tab);
        } else {
            urlMap.set(tab.url, tab);
        }
    });
}

/* -----------------------------
   STATISTICS
----------------------------- */
function updateStats(){
    const inactive = allTabs.filter(
        tab => !tab.active
    ).length;
    document.getElementById("tabCount").textContent = allTabs.length;

    document.getElementById("duplicateCount").textContent = duplicates.length;

    document.getElementById("inactiveCount").textContent = inactive;
}

/* -----------------------------
   TAB HEALTH
----------------------------- */
function calculateHealth(){
    let score = 100;

    const tabPenalty = 
        Math.max(0, allTabs.length - 10) * 2;

    const duplicatePenalty = 
        duplicates.length * 5;
    const inactivePenalty = 
        Math.max(0, allTabs.filter(t => !t.active).length - 15);
    score -= tabPenalty;
    score -= duplicatePenalty;
    score -= inactivePenalty;
    score = Math.max(0, Math.min(100, score));
    document.getElementById("healthScore").textContent = score;
    document.getElementById("healthBar").style.width = `${score}%`;
    
    let message = "";
    if (score >= 80){
        message = "Your tabs are looking healthy. Keep it up!";
    } else if (score >= 60){
        message = "You're doing okay, but a little cleanup wouldn't hurt.";
    } else if (score >= 40){
        message = "We should probably talk about your tab habits.";
    } else {
        message = "Your browser needs professional help.";
    }

    document.getElementById("healthMessage").textContent = message;

    updateRecommendation();
}

/* -----------------------------
   THERAPIST RECOMMENDATION
----------------------------- */
function updateRecommendation(){
    const recommendation = document.getElementById("recommendation");

    if (duplicates.length > 0){
        recommendation.textContent = 
        `I found ${duplicates.length} duplicate tab(s). You don't need to keep seeing the same page twice.`;
    } else if (allTabs.length > 30){
        recommendation.textContent = 
        "You have over 30 tabs open. Let's take this one tab at a time.";
    } else if (allTabs.length > 15){
        recommendation.textContent = 
        "You have quite a few tabs open. Consider closing anything you haven't used recently.";
    } else {
        recommendation.textContent = 
        "Your browser is looking pretty healthy. I'm proud of you.";
    }
}

/* -----------------------------
   DISPLAY TABS
----------------------------- */
function displayTabs() {
    const container = document.getElementById("tabsList");
    container.innerHTML = "";

    if (allTabs.length === 0) {
        container.innerHTML = `<div class="empty">No tabs found.</div>`;
        return;
    }

    allTabs.forEach(tab => {
        const div = document.createElement("div");
        div.className = "tab";

        div.innerHTML = `
          <img
            class="favicon"
            src="${tab.favIconUrl || ""}"
          >
          <div class="tab-info">
            <div class="tab-title">
              ${escapeHTML(tab.title || "Untitled")}
            </div>
            <div class="tab-url">
              ${escapeHTML(tab.url || "")}
            </div>
          </div>
          <button
            class="small-btn save-btn"
            data-id="${tab.id}"
          >
            💾
          </button>
          <button
            class="small-btn close-btn"
            data-id="${tab.id}"
          >
            ×
          </button>
        `;

        container.appendChild(div);
    });

    document
        .querySelectorAll(".close-btn")
        .forEach(button => {
            button.addEventListener("click", async () => {
                const id = Number(button.dataset.id);
                await ext.tabs.remove(id);
                loadTabs();
            });
        });

    document
        .querySelectorAll(".save-btn")
        .forEach(button => {
            button.addEventListener("click", async () => {
                const id = Number(button.dataset.id);
                const tab = allTabs.find(t => t.id === id);
                if (tab) {
                    await saveTab(tab);
                }
            });
        });
}

/*-------------------------------------------
        CLEAN DUPLICATES
---------------------------------------------*/
async function cleanDuplicates(){
    if (duplicates.length === 0){
        alert("No duplicate tabs found!");
        return;
    }
    const ids = duplicates.map(tab => tab.id);
    await ext.tabs.remove(ids);
    loadTabs();
}

/* -------------------------------------------
        SAVE TAB
----------------------------------------------*/
async function saveTab(tab){
    const existing = savedTabs.find(t => t.url === tab.url);
    if (existing) {
        return;
    }

    savedTabs.push({
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
    });

    await ext.storage.local.set({
        savedTabs
    });

    displaySavedTabs();
}

/*----------------------------------
            SAVE ALL
------------------------------------*/
async function saveAllTabs(){
    for (const tab of allTabs){
        await saveTab(tab);
    }
    displaySavedTabs();
}

/*-----------------------
        LOAD SAVED
-------------------------*/
async function loadSavedTabs(){
    const data = await ext.storage.local.get("savedTabs");
    savedTabs = data.savedTabs || [];
    displaySavedTabs();
}

/*-------------------------------------
        DISPLAY SAVED
---------------------------------------*/
function displaySavedTabs() {
    const container = document.getElementById("savedTabsList");
    container.innerHTML = "";

    if (savedTabs.length === 0){
        container.innerHTML = '<div class="empty">No saved tabs.</div>';
        return;
    }

    savedTabs.forEach((tab, index) => {
        const div = document.createElement("div");
        div.className = "tab";

        div.innerHTML = `
        <img
            class="favicon"
            src="${tab.favIconUrl || ""}"
        >    
        <div class="tab-info">
            <div class="tab-title">
                ${escapeHTML(tab.title || "Untitled")}
            </div>
        </div>
        <button
            class="small-btn open-saved"
            data-index="${index}"
        >
            ↗
        </button>
        <button
            class="small-btn delete-saved"
            data-index="${index}"
        >
            ×
        </button>
        `;
        container.appendChild(div);
    });

    document
        .querySelectorAll(".open-saved")
        .forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.index);
                ext.tabs.create({
                    url: savedTabs[index].url
                });
            });
        });

    document
        .querySelectorAll(".delete-saved")
        .forEach(button => {
            button.addEventListener("click", async () => {
                const index = Number(button.dataset.index);
                savedTabs.splice(index, 1);
                await ext.storage.local.set({
                    savedTabs
                });
                displaySavedTabs();
            });
        });
}

/* ---------------------------------
        ORGANIZATION
------------------------------------*/
async function organizeTabs(){
    // Check if Tab Grouping API is available (Chrome/Brave support it, Firefox does not)
    if (!ext.tabs.group || !ext.tabGroups) {
        alert("Tab grouping is not natively supported by Firefox.");
        return;
    }

    const categories = {
        School: [
            "google.com",
            "docs.google.com",
            "classroom.google.com",
            "khanacademy.org",
            "quizlet.com",
            "wikipedia.org"
        ],
        Work: [
            "github.com",
            "slack.com",
            "notion.so",
            "figma.com"
        ],
        Entertainment: [
            "youtube.com",
            "netflix.com",
            "spotify.com",
            "reddit.com"
        ],
        Shopping: [
            "amazon.com",
            "noon.com",
            "ebay.com"
        ]
    };

    const groups = {};

    for (const tab of allTabs){
        if (!tab.url) continue;
        let category = "Other";

        for (const [name, domains] of Object.entries(categories)){
            if (domains.some(domain => tab.url.includes(domain))){
                category = name;
                break;
            }
        }

        if (!groups[category]){
            groups[category] = [];
        }
        groups[category].push(tab.id);
    }

    for (const [category, tabIds] of Object.entries(groups)){
        if (tabIds.length < 2) continue;
        try {
            const groupId = await ext.tabs.group({ tabIds });
            await ext.tabGroups.update(groupId, {
                title: category,
                collapsed: false
            });
        } catch (error) {
            console.error(error);
        }
    }
    loadTabs();
}

/*-----------------------------------
        SECURITY
--------------------------------------*/
function escapeHTML(text){
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}
