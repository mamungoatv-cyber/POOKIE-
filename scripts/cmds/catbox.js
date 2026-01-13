const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    config: {
        name: "catbox",
        version: "3.0",
        hasPermssion: 0,
        credits: "xalman",
        description: "Upload to Catbox via reply any photos and videos",
        commandCategory: "utility",
        usages: "[reply to photo]",
        cooldowns: 5,
    },

    onStart: async function ({ api, event }) {
        if (event.type !== "message_reply" || !event.messageReply.attachments[0]) {
            return api.sendMessage("❌ please reply any photos and videos", event.threadID, event.messageID);
        }

        const imageUrl = event.messageReply.attachments[0].url;
        api.setMessageReaction("🕑", event.messageID, () => {}, true);

        try {
            const githubRes = await axios.get("https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json");
            const baseUrl = githubRes.data.catbox; 
            const endpoint = `${baseUrl.replace(/\/$/, "")}/upload`;
            const imgBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const form = new FormData();
            form.append('image', Buffer.from(imgBuffer.data), 'nx.jpg');

            const response = await axios.post(endpoint, form, { headers: form.getHeaders() });

            if (response.data.success) {
                api.setMessageReaction("✅", event.messageID, () => {}, true);
                api.sendMessage(`✅ Catbox Link: ${response.data.url}`, event.threadID, event.messageID);
            }
        } catch (e) {
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            api.sendMessage(`⚠️ Error: ${e.message}`, event.threadID);
        }
    }
};
