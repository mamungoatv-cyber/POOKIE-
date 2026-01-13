const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help2",
    aliases: ["h", "hp", "help2"],
    version: "2.1",
    author: "T A N J I L 🎀",
    countDown: 1,
    role: 0,
    shortDescription: {
      en: "View command usage"
    },
    longDescription: {
      en: "View full list of commands with details"
    },
    category: "info",
    guide: {
      en: "{pn} [empty | <page number> | <command name>]"
        + "\n{pn} <command name> [-u | usage | -g | guide]: only show usage"
        + "\n{pn} <command name> [-i | info]: only show info"
        + "\n{pn} <command name> [-r | role]: only show role"
        + "\n{pn} <command name> [-a | alias]: only show alias"
    },
    priority: 1
  },

  onStart: async function ({ args, message, event }) {
    const prefix = await getPrefix(event.threadID);
    const totalCommands = commands.size;
    const botName = "bolbo na✨⃝٭";
    const ownerName = "NX🎀";
    const perPage = 60;

    // PAGE SYSTEM
    if (args.length === 0 || !isNaN(args[0])) {
      const page = parseInt(args[0]) || 1;

      const allCommands = [...commands.values()]
        .filter(cmd => cmd.config.role <= 1)
        .sort((a, b) => a.config.name.localeCompare(b.config.name));

      const totalPages = Math.ceil(allCommands.length / perPage);
      const start = (page - 1) * perPage;
      const end = start + perPage;

      const pageCommands = allCommands.slice(start, end).map(cmd => {
        const aliasesList = [...aliases.entries()]
          .filter(([_, v]) => v === cmd.config.name)
          .map(([k]) => k);

        // ⛔ CATEGORY REMOVED FROM HERE
        return `🔹 ${prefix}${cmd.config.name}\n   ✨ Aliases: ${aliasesList.join(", ") || "None"}`;
      }).join("\n\n");

      return message.reply(
        `📘 𝑯𝑬𝑳𝑷 𝑴𝑬𝑵𝑼 (Page ${page}/${totalPages})\n\n`
        + pageCommands
        + `\n\n━━━━━━━━━━━━━━━━━━\n`
        + `🔢 Total Commands: ${totalCommands}\n`
        + `📝 Prefix: ${prefix || "NoPrefix"}\n`
        + `👑 Owner: ${ownerName}\n`
        + `🤖 Bot Name: ${botName}`
      );
    }

    // SINGLE COMMAND DETAILS
    const commandName = args[0].toLowerCase();
    const cmd = commands.get(commandName) || commands.get(aliases.get(commandName));

    if (!cmd)
      return message.reply(`❌ Command "${commandName}" not found.`);

    const flags = args.slice(1);
    let replyText = `📄 Info for command: ${prefix}${cmd.config.name}\n\n`;

    if (flags.includes("-u") || flags.includes("usage") || flags.includes("-g") || flags.includes("guide")) {
      replyText += `📘 Guide:\n${cmd.config.guide.en.replace(/{pn}/g, prefix + cmd.config.name)}`;
    } 
    else if (flags.includes("-i") || flags.includes("info")) {
      replyText += `ℹ️ Description: ${cmd.config.longDescription.en}`;
    } 
    else if (flags.includes("-r") || flags.includes("role")) {
      replyText += `🔐 Role Required: ${cmd.config.role}`;
    } 
    else if (flags.includes("-a") || flags.includes("alias")) {
      const aliasList = [...aliases.entries()]
        .filter(([_, v]) => v === cmd.config.name)
        .map(([k]) => k);
      replyText += `🔁 Aliases: ${aliasList.join(", ") || "None"}`;
    } 
    else {
      const aliasList = [...aliases.entries()]
        .filter(([_, v]) => v === cmd.config.name)
        .map(([k]) => k);

      replyText += `ℹ️ Description: ${cmd.config.shortDescription.en}`
        + `\n📘 Guide:\n${cmd.config.guide.en.replace(/{pn}/g, prefix + cmd.config.name)}`
        + `\n🔐 Role Required: ${cmd.config.role}`
        + `\n🔁 Aliases: ${aliasList.join(", ") || "None"}`;
      
      // ⛔ CATEGORY REMOVED COMPLETELY
    }

    return message.reply(replyText);
  },

  onChat: async function ({ event, message, args }) {
    if (args[0] && args[0].toLowerCase() === "help") {
      this.onStart({ args: args.slice(1), message, event });
    }
  }
};
