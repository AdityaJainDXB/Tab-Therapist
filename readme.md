# Tab Therapist

Tab Therapist is a Chrome/Brave/Firefox extension I made to help with a problem I have pretty often: having way too many tabs open.

When I am working on school work or coding, I can easily end up with dozens of tabs open. Sometimes I have the same page open multiple times, and other times I have tabs that I want to keep but don't need open right now.

I made Tab Therapist to make managing this easier.

## What it does

Tab Therapist looks at the tabs that are currently open and gives you some tools to manage them.

### Tab Health Score

The extension gives your current tabs a score based on things like the number of tabs you have open and duplicate tabs.

The idea is to give you a quick way to see how messy your current browser session is.

### Duplicate Detection

Tab Therapist checks your open tabs for duplicate URLs.

If you have the same page open multiple times, it can identify those duplicates so you don't have to manually look through every tab.

### Clean My Tabs

This lets you remove duplicate tabs.

Instead of closing them one by one, Tab Therapist can clean them up for you.

### Organize My Tabs

The extension can group tabs into categories such as:

- School Work
- Entertainment
- Shopping
- Other

This uses Chrome/Brave/Firefox's tab grouping features to make large numbers of tabs easier to manage.

### Save Tabs

Sometimes I don't want to close a tab because I might need it later.

Tab Therapist lets me save tabs and close them without losing the links.

Saved tabs can then be opened again later or deleted from the saved list.

### Recommendations

The extension also gives simple recommendations based on the current state of your tabs.

For example, if there are a lot of duplicate tabs, it can suggest cleaning them up.

## Why I made it

I made this project because I personally have a problem with keeping too many tabs open.

I wanted to make something that was actually useful to me instead of just making a project to demonstrate a technology.

I also wanted to learn more about Chrome/Brave/Firefox extensions and how they can interact with the browser.

## How I built it

Tab Therapist is built using:

- HTML
- CSS
- JavaScript
- Chrome/Brave/Firefox Extensions API
- Chrome/Brave/Firefox Storage API
- Chrome/Brave/Firefox Tab Groups API

I used JavaScript for the main functionality and Chrome/Brave/Firefox's APIs to access and manage the tabs.

One of the parts I worked on was detecting duplicate tabs by comparing their URLs. I also used Chrome/Chrome/Brave/Firefox storage so that saved tabs can remain available after closing the extension.

## Privacy

Tab Therapist does not require an account or an external server.

The extension uses Chrome/Chrome/Brave/Firefox's APIs to access the tabs needed for its features. Saved tabs are stored using Chrome/Chrome/Brave/Firefox's local storage.

The project does not need to send your tabs to a server for it to work.

## Installation

The Chrome/Chrome/Brave/Firefox Web Store version is not available yet, so the extension currently needs to be installed manually.

### 1. Download the project

Download this repository (Specifically for Chrome and Chrome/Brave/ use CB folder/Firefox version is built release shows installation guidelines)  using:

**Code → Download ZIP**

Extract the ZIP file somewhere on your computer.

### 2. Open Chrome/Brave Extensions

Open Chrome/Brave and go to:

`Chrome/Brave://extensions`

### 3. Enable Developer Mode

Turn on **Developer mode** in the top-right corner.

### 4. Load the extension

Click **Load unpacked**.

Select the folder containing `manifest.json`.

It should look something like:

```text
Tab-Therapist/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
└── icon.png
```

###NOTE FIREFOX INSTRUCTIONS SHOWN IN RELEASE!!

### 5. Open Tab Therapist

Click the Extensions button in Chrome/Brave, find Tab Therapist, and pin it if you want quick access.

Then click the Tab Therapist icon to open it.

## What I learned

Building this project helped me learn more about how Chrome/Brave extensions work.

Some of the things I learned while making it were:

- Working with the Chrome/Brave Tabs API
- Using Chrome/Chrome/Brave/Firefox storage
- Working with Chrome/Chrome/Brave/Firefox tab groups
- Detecting duplicate URLs with JavaScript
- Building a popup interface for a browser extension
- Handling permissions in a Chrome/Chrome/Brave/Firefox extension
- Organizing a project into multiple files

I also learned that making a project that seems simple can involve quite a few smaller problems once you actually start building it.

## Future improvements

There are still some things I would like to add in future versions:

- Better tab categorization
- Custom categories
- Tab search
- Detection of tabs that have not been used recently
- More detailed health-score information
- Dark mode
- More customization options
- Chrome/Chrome/Brave/Firefox Web Store release

## Contributing

If you find a bug or have an idea for improving Tab Therapist, you can open an issue or submit a pull request.

## License

See the license included in this repository for information about using and modifying the project.

---

I made Tab Therapist as a small project to solve a problem I actually have when using Chrome/Chrome/Brave/Firefox. It started as an idea for managing too many tabs and became a project where I could learn more about browser extensions and JavaScript.
