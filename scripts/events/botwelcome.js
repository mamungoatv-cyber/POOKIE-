const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "botWelcome",
        version: "1.0",
        author: "xalman",
        category: "events"
    },

    onStart: async ({ message, event, api }) => {
        if (event.logMessageType !== "log:subscribe") return;

        const { threadID } = event;
        const dataAddedParticipants = event.logMessageData.addedParticipants;
        const prefix = global.utils.getPrefix(threadID);

        if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
            try {
                const canvas = createCanvas(1000, 500);
                const ctx = canvas.getContext("2d");


                const bg = await loadImage("https://i.ibb.co/VWj5xLWR/6641a83f9935.jpg");
                ctx.drawImage(bg, 0, 0, 1000, 500);
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.roundRect(100, 80, 800, 340, 30);
                ctx.fill();
                ctx.strokeStyle = "#00d2ff";
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.textAlign = "center";
                ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
                ctx.shadowBlur = 15;
                ctx.font = "bold 60px Impact";
                ctx.fillStyle = "#00d2ff";
                ctx.fillText("THANKS FOR INVITING ME!", 500, 180);
                ctx.font = "bold 40px Arial";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(`My Prefix is: ${prefix}`, 500, 260);

                ctx.font = "30px Arial";
                ctx.fillStyle = "#92fe9d";
                ctx.fillText(`Type ${prefix}help to see my commands`, 500, 330);
              
                const botJoinPath = path.join(__dirname, "cache", `bot_join_${threadID}.png`);
                if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
                
                fs.writeFileSync(botJoinPath, canvas.toBuffer());

                return message.send({
                    body: `☄️ Hello Everyone! Thanks for inviting me 💋.\n✨ Prefix: ${prefix}\n🦋 Use ${prefix}help for show my all commands.`,
                    attachment: fs.createReadStream(botJoinPath)
                }, () => fs.unlinkSync(botJoinPath));

            } catch (err) {
                console.error(err);
                return message.send(`Thank you for inviting me! My prefix is: ${prefix}`);
            }
        }
    }
};
