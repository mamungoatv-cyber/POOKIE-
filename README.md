<p align="center">
  "<img src=". />"="MAMUN">
  <br>
  <a href="https://www.facebook.com/share/14V9BD88uRH/.2.0" target="_blank">
    <img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white" />
  </a>
  <a href="https://wa.me/88018730981279" target="_blank">
    <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  </a>
</p>

<h1 align="center">MAMUN-GOAT-V2</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Maintained%3F-Yes-green.svg?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Build-Passing-brightgreen.svg?style=for-the-badge" />
   <img src="https://img.shields.io/badge/NODE%20VERSION-%3E%3D20.x-green?logo=node.js&logoColor=white" alt="Node Version">
  <img src="https://img.shields.io/badge/Bot_Version-V2.0-blueviolet?style=for-the-badge" />
</p>

<p align="center">
  <strong>The Greatest Of All Time multi-functional automation bot system.</strong>
</p>

---

## 👨‍💻 Developed By
**亗🅼🅰ᥫᩣ🅼ᥫᩣ🆄🅽×͜×** *Passionate Developer | Bot Specialist |*

---

## 🚀 Key Features
* **⚡ Ultra Fast:** Highly optimized core for lightning-fast response times.
* **🖥️ Web Dashboard:** Manage and monitor your bot settings through a clean UI.
* **🌍 Localization:** Full support for multiple languages via the `languages/` folder.
* **🛡️ Secure & Stable:** Built on a custom `fb-chat-api` for maximum stability.
* **📊 Advanced Logging:** Comprehensive logging system to track every action.

---

## 🛠️ Installation Guide
1. **Clone the project:** `git clone `
2. **Install dependencies:** `npm install`
3. **Launch the bot:** `node index.js`

---
---


## ⛳ another most popular deployer web


RENDER,REPLIT,RAILWAY

---

## 🤖 Run on GitHub Actions
To run this bot using GitHub Actions, create a file at `.github/workflows/main.yml` and paste the following code:

```yaml
name: Build (20.x)

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: 🧩 Checkout repository
        uses: actions/checkout@v4

      - name: 🧰 Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: 📦 Install dependencies
        run: |
          npm install
          npm install request-promise --save

      - name: 🚀 Start bot
        env:
          FB_EMAIL: ${{ secrets.FB_EMAIL }}
          FB_PASSWORD: ${{ secrets.FB_PASSWORD }}
          FB_COOKIE: ${{ secrets.FB_COOKIE }}
        run: |
          echo "Starting bot..."
          node index.js || echo "⚠️ Login error occurred, check cookie or Facebook verification."

      - name: 🧹 Clean up (optional)
        if: always()
        run: |
          echo "Job finished. Cleaning up..."




