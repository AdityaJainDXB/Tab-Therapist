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
   allTabs = await chrome.tabs.query({});

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
        if (
            tab.url.startsWith("chrome://") ||
            tab.url.startsWith("chrome-extension://")
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
    if(score >= 80){
        message = "Your tabs are looking healthy. Keep it up!";
    }
    else if (score >= 60){
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
    const recommendation = 
    document.getElementById("recommendation");

    if (duplicates.length > 0){
        recommendation.textContent = 
        `I found ${duplicates.length} duplicate tab(s). You don't need to keep seeing the same page twice.`;
    } else if( allTabs.length > 30){
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
        await chrome.tabs.remove(id);
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
    if(duplicates.length === 0){
        alert("No duplicate tabs found!");
        return;
    }
    const ids = duplicates.map(tab => tab.id);
    await chrome.tabs.remove(ids);

    loadTabs();
}

/* -------------------------------------------
            SAVE TAB
----------------------------------------------*/
async function saveTab(tab){
    const existing = savedTabs.find(t => t.url === tab.url);
    if(existing) {
        return;
    }

    savedTabs.push({
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
    });

    await chrome.storage.local.set({
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
    const data = await chrome.storage.local.get("savedTabs");
    savedTabs = data.savedTabs || [];

    displaySavedTabs();
}

/*-------------------------------------
        DISPLAY SAVED
---------------------------------------*/
function displaySavedTabs() {
    const container = document.getElementById("savedTabsList");
    container.innerHTML = "";

    if(savedTabs.length === 0 ){
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
            chrome.tabs.create({
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

            await chrome.storage.local.set({
              savedTabs
            });

            displaySavedTabs();
        });
    });
}

/* ---------------------------------
        ORGANIZATION
------------------------------------*/
async function organizeTabs() {
    const categories = {
        "School": [
            "classroom.google.com", "docs.google.com", "drive.google.com",
            "slides.google.com", "sheets.google.com", "forms.google.com",
            "khanacademy.org", "quizlet.com", "wikipedia.org", "coursera.org",
            "edx.org", "udemy.com", "duolingo.com", "kahoot.it", "brainly.com",
            "quizizz.com", "chegg.com", "grammarly.com", "managebac.com", "padlet.com"
        ],
        "Work": [
            "notion.so", "slack.com", "figma.com", "trello.com", "asana.com",
            "monday.com", "atlassian.net", "clickup.com", "miro.com", "canva.com",
            "zoom.us", "teams.microsoft.com", "meet.google.com", "office.com"
        ],
        "Dev & AI": [
            "github.com", "gitlab.com", "stackoverflow.com", "replit.com",
            "cursor.com", "chatgpt.com", "openai.com", "claude.ai", "perplexity.ai",
            "huggingface.co", "npmjs.com", "developer.mozilla.org", "w3schools.com"
        ],
        "Social": [
            "x.com", "twitter.com", "instagram.com", "facebook.com", "linkedin.com",
            "discord.com", "reddit.com", "whatsapp.com", "telegram.org", "pinterest.com",
            "tiktok.com"
        ],
        "Entertainment": [
            "youtube.com", "netflix.com", "spotify.com", "twitch.tv", "hulu.com",
            "disneyplus.com", "primevideo.com", "soundcloud.com", "steampowered.com"
        ],
        "Shopping": [
            "amazon.com", "noon.com", "ebay.com", "etsy.com", "aliexpress.com",
            "walmart.com", "target.com", "bestbuy.com", "ikea.com"
        ]
    };

    const categoryColors = {
        "School": "blue",
        "Work": "green",
        "Dev & AI": "purple",
        "Social": "orange",
        "Entertainment": "red",
        "Shopping": "pink"
    };

    const groups = {};

    for (const tab of allTabs) {
        if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
            continue;
        }

        let category = "Other";

        try {
            const hostname = new URL(tab.url).hostname.toLowerCase();

            for (const [name, domains] of Object.entries(categories)) {
                if (domains.some(domain => hostname === domain || hostname.endsWith("." + domain))) {
                    category = name;
                    break;
                }
            }
        } catch (e) {
            // Skips invalid/unparseable URLs
        }

        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(tab.id);
    }

    for (const [category, tabIds] of Object.entries(groups)) {
        // Skip grouping if less than 2 tabs, or if it falls into "Other"
        if (tabIds.length < 2 || category === "Other") continue;

        try {
            const groupId = await chrome.tabs.group({ tabIds });
            await chrome.tabGroups.update(groupId, {
                title: category,
                color: categoryColors[category] || "grey",
                collapsed: false
            });
        } catch (error) {
            console.error(`Failed to group category "${category}":`, error);
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
