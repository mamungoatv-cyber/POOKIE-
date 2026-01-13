const { config } = global.GoatBot;
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');

module.exports = {
    config: {
        name: "balance",
        aliases: ["bal", "money"],
        version: "9.0.0",
        author: "xalman",
        countDown: 5,
        role: 0,
        description: "💳 আপনার ডিজিটাল ভিসা কার্ড দেখুন।\n\n🔹 কার্ড আপগ্রেড সিস্টেম:\n- Silver: $500k\n- Gold: $1M\n- Platinum: $5M\n(প্রতিটি কার্ডের মেয়াদ ৭ দিন)\n\n🔹 অন্যান্য কমান্ড:\n- balance buy <type> (কার্ড কিনতে)\n- balance set <type> (কেনা কার্ড সেট করতে)",
        category: "economy",
        guide: { 
            en: "{pn} | {pn} @tag\n{pn} buy <silver/gold/platinum>\n{pn} set <silver/gold/platinum/normal>" 
        }
    },

    onStart: async function ({ message, usersData, event, args }) {
        const { senderID, mentions, messageReply } = event;
        const now = Date.now();

        const formatBalance = (num) => {
            const n = Number(num);
            if (n === Infinity || isNaN(n) || n >= 1e15) return "infinity";
            if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
            if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
            if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
            return n.toLocaleString();
        };

        const userData = await usersData.get(senderID);
        let userCards = userData.data?.userCards || {}; 
        let activeCard = userData.data?.activeCard || "normal";

        if (activeCard !== "normal" && userCards[activeCard] < now) {
            delete userCards[activeCard];
            activeCard = "normal";
            await usersData.set(senderID, { data: { ...userData.data, userCards, activeCard: "normal" } });
            message.reply(`⚠️ আপনার ${activeCard.toUpperCase()} কার্ডের মেয়াদ শেষ হয়ে গেছে! ডিজাইন এখন Normal-এ ফিরে গেছে।`);
        }

        if (args[0] === "buy") {
            const shop = { silver: 500000, gold: 1000000, platinum: 5000000 };
            const choice = args[1]?.toLowerCase();

            if (!choice || !shop[choice]) {
                return message.reply(`💳 **Card Upgrade Shop (মেয়াদ ৭ দিন)**\n━━━━━━━━━━━━━━━━━━\n🥈 Silver: $500k\n🥇 Gold: $1M\n💎 Platinum: $5M\n━━━━━━━━━━━━━━━━━━\nব্যবহার: balance buy gold`);
            }

            const money = Number(userData.money || 0);
            if (money < shop[choice]) return message.reply(`❌ আপনার যথেষ্ট টাকা নেই! এই কার্ডের জন্য $${shop[choice].toLocaleString()} প্রয়োজন।`);

            const expiryTime = now + (7 * 24 * 60 * 60 * 1000); 
            userCards[choice] = expiryTime;
            
            await usersData.set(senderID, { 
                money: (money - shop[choice]).toString(),
                data: { ...userData.data, userCards, activeCard: choice }
            });
            return message.reply(`🎉 অভিনন্দন! আপনি $${shop[choice].toLocaleString()} খরচ করে ${choice.toUpperCase()} কার্ড কিনেছেন। মেয়াদ থাকবে ৭ দিন।`);
        }

        if (args[0] === "set") {
            const choice = args[1]?.toLowerCase();
            if (choice === "normal") {
                activeCard = "normal";
            } else if (!userCards[choice] || userCards[choice] < now) {
                return message.reply(`❌ এই কার্ডটি আপনার কেনা নেই অথবা মেয়াদ শেষ হয়ে গেছে।`);
            } else {
                activeCard = choice;
            }
            await usersData.set(senderID, { data: { ...userData.data, activeCard } });
            return message.reply(`✅ কার্ড সেট করা হয়েছে: ${activeCard.toUpperCase()}`);
        }

        const createCard = async (name, balance, uid, type) => {
            const canvas = createCanvas(800, 450);
            const ctx = canvas.getContext('2d');

            let col1, col2, neon, label;
            if (type === "silver") { col1 = "#3e4142"; col2 = "#bdc3c7"; neon = "#ecf0f1"; label = "SILVER VISA"; }
            else if (type === "gold") { col1 = "#432d03"; col2 = "#bf953f"; neon = "#ffd700"; label = "GOLD VISA"; }
            else if (type === "platinum") { col1 = "#000000"; col2 = "#232526"; neon = "#00ffcc"; label = "PLATINUM VISA"; }
            else { col1 = "#0f0c29"; col2 = "#302b63"; neon = "#00d2ff"; label = "VISA"; }

            const grad = ctx.createLinearGradient(0, 0, 800, 450);
            grad.addColorStop(0, col1); grad.addColorStop(0.5, col2); grad.addColorStop(1, col1);
            ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(0, 0, 800, 450, 30); ctx.fill();

            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.font = "28px monospace";
            const cardNum = uid.toString().padEnd(16, '0').match(/.{1,4}/g).join("  ");
            ctx.fillText(cardNum, 60, 380);

            let expiryDate = "12/29";
            if (type !== "normal" && userCards[type]) {
                expiryDate = moment(userCards[type]).tz("Asia/Dhaka").format("MM/YY");
            }
            ctx.font = "18px Arial";
            ctx.fillText(`VALID THRU: ${expiryDate}`, 550, 420);

            try {
                const avtURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                const res = await axios.get(avtURL, { responseType: 'arraybuffer' });
                const img = await loadImage(Buffer.from(res.data));
                ctx.save(); ctx.shadowColor = neon; ctx.shadowBlur = 20;
                ctx.beginPath(); ctx.arc(100, 100, 60, 0, Math.PI * 2); ctx.clip();
                ctx.drawImage(img, 40, 40, 120, 120); ctx.restore();
                ctx.strokeStyle = neon; ctx.lineWidth = 3; ctx.stroke();
            } catch (e) {}

            ctx.fillStyle = "#ffffff"; ctx.font = "italic bold 35px sans-serif"; ctx.fillText(label, 520, 80);
            ctx.shadowColor = neon; ctx.shadowBlur = 15; ctx.fillStyle = neon;
            const bTxt = formatBalance(balance);
            ctx.font = "bold 75px Arial"; ctx.fillText(`$${bTxt}`, 60, 320);
            ctx.shadowBlur = 0; ctx.fillStyle = "#ffffff"; ctx.font = "bold 24px Arial"; ctx.fillText(name.toUpperCase(), 60, 420);

            const cp = path.join(__dirname, "cache", `card_${uid}.png`);
            fs.ensureDirSync(path.join(__dirname, "cache"));
            fs.writeFileSync(cp, canvas.toBuffer());
            return cp;
        };

        const targetID = (messageReply ? messageReply.senderID : Object.keys(mentions)[0]) || senderID;
        const targetData = await usersData.get(targetID);
        const targetActive = targetData.data?.activeCard || "normal";

        message.reply("please wait... ⏳");
        const cardImg = await createCard(targetData.name || "User", targetData.money || 0, targetID, targetActive);
        
        return message.reply({
            body: `✨ [${targetActive.toUpperCase()}] Visa Card\n👤 নাম: ${targetData.name}\n💰 ব্যালেন্স: $${formatBalance(targetData.money || 0)}`,
            attachment: fs.createReadStream(cardImg)
        }, () => { if(fs.existsSync(cardImg)) fs.unlinkSync(cardImg); });
    }
};
