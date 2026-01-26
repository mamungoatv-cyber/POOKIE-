const axios = require("axios");
const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "welcome",
        version: "5.0",
        author: "xalman",
        category: "events"
    },

    onStart: async ({ threadsData, message, event, api }) => {
        if (event.logMessageType !== "log:subscribe") return;

        const { threadID, author } = event;
        const dataAddedParticipants = event.logMessageData.addedParticipants;

        if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) return;

        const threadData = await threadsData.get(threadID);
        const threadName = threadData.threadName || "Our Group";
        const threadInfo = await api.getThreadInfo(threadID);
        const memberCount = threadInfo.participantIDs.length;
		
        const inviterInfo = await api.getUserInfo(author);
        const inviterName = inviterInfo[author].name;

        const backgrounds = [
            "https://i.ibb.co/DPCX3TRH/3bf31bd6449c.jpg",
            "https://i.ibb.co/JWyDVPJk/42a541cc5021.jpg",
            "https://i.ibb.co/VWj5xLWR/6641a83f9935.jpg",
            "https://i.ibb.co/HDBBGLyX/a69de460fad6.jpg"
        ];

        for (const user of dataAddedParticipants) {
            try {
                const canvas = createCanvas(1000, 500);
                const ctx = canvas.getContext("2d");
                const bgLink = backgrounds[Math.floor(Math.random() * backgrounds.length)];
                const background = await loadImage(bgLink);
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.roundRect(50, 50, 900, 400, 30);
                ctx.fill();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.stroke();

                const userAvatarUrl = `https://graph.facebook.com/${user.userFbId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                const uAvatar = await loadImage(userAvatarUrl).catch(() => loadImage("https://i.imgur.com/6eSrt9al.png"));

                ctx.save();
                ctx.beginPath();
                ctx.arc(500, 180, 100, 0, Math.PI * 2);
                ctx.lineWidth = 6;
                ctx.strokeStyle = "#fff";
                ctx.shadowColor = "#fff";
                ctx.shadowBlur = 20;
                ctx.stroke();
                ctx.clip();
                ctx.drawImage(uAvatar, 400, 80, 200, 200);
                ctx.restore();
                ctx.textAlign = "center";
                ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
                ctx.shadowBlur = 10;
				
                const grad = ctx.createLinearGradient(400, 0, 600, 0);
                grad.addColorStop(0, "#00d2ff");
                grad.addColorStop(1, "#92fe9d");
                
                ctx.fillStyle = grad;
                ctx.font = "bold 70px Impact, sans-serif"; 
                ctx.fillText("WELCOME", 500, 330);
                ctx.fillStyle = "#ffffff";
                ctx.font = "500 40px 'Segoe UI', Arial, sans-serif";
                ctx.fillText(user.fullName, 500, 385);
                ctx.font = "bold 22px Courier New";
                ctx.fillStyle = "#FFCC00";
                ctx.fillText(`YOU ARE THE #${memberCount} MEMBER|  INVITED BY: ${inviterName.toUpperCase()}`, 500, 430);

                const imgPath = path.join(__dirname, "cache", `w_${user.userFbId}.png`);
                fs.writeFileSync(imgPath, canvas.toBuffer());

                message.send({
                    body: `🎉  welcome  ${user.fullName}!\n━━━━━━━━━━━━━━━━━━\n✨ Added by: ${inviterName}\n📊 You are the  ${memberCount} member`,
                    attachment: fs.createReadStream(imgPath)
                }, () => fs.unlinkSync(imgPath));

            } catch (err) {
                console.error(err);
                message.send(`Welcome ${user.fullName}!`);
            }
        }
    }
};
