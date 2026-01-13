module.exports = {
  config: {
    name: "jackpot",
    version: "3.1",
    author: "T A N J I L",
    shortDescription: { en: "Jackpot Bet Game" },
    longDescription: { en: "Try your luck and win big in the jackpot bet game!" },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "⚠️ Invalid bet amount. Please enter a valid number like 1B, 10M, 500K, etc.",
      not_enough_money: "⚠️ You don't have enough balance to make this bet.",
      jackpot_win:
        "╭─────\n│\n│     JACKPOT HIT!!\n│\n│     YOU WIN 50× = $%1\n│     Balance: $%2\n│\n│     *** JACKPOT ***\n╰─────",
      normal_win:
        "╭─────\n│\n│     You Won!\n│\n│     YOU WIN %1× = $%2\n│     Balance: $%3\n│\n│         B E T\n╰─────",
      lose_message:
        "╭─────\n│\n│     Sorry...\n│\n│     You lost your bet of $%1.\n│     Balance: $%2\n│\n│         B E T\n╰─────",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const adminIDs = global.GoatBot?.config?.adminBot || [];
    const isAdmin = adminIDs.includes(senderID);

    const input = args[0]?.toLowerCase();
    if (!input) return message.reply("⚠️ Please specify your bet amount. Example: /bet 1B");

    const isForceWin = input.endsWith(".win");
    const rawAmount = isForceWin ? input.replace(".win", "") : input;

    function parseAmount(amountStr) {
      const units = { k: 1e3, m: 1e6, b: 1e9, t: 1e12, q: 1e15 };
      const match = amountStr.match(/^(\d+(\.\d+)?)([kmbtq])$/);
      if (!match) return null;
      const [_, num, __, unit] = match;
      return parseFloat(num) * units[unit];
    }

    const betAmount = parseAmount(rawAmount);
    if (!betAmount || betAmount < 1000) {
      return message.reply(getLang("invalid_amount"));
    }

    const userData = await usersData.get(senderID);
    const balance = userData.money || 0;

    if (balance < betAmount) {
      return message.reply(getLang("not_enough_money"));
    }

    let winAmount = 0;
    let resultText = "";
    let finalBalance = balance;

    const roll = Math.random();

    if (isForceWin ? isAdmin : roll < 0.05) {
      // Jackpot win - 5% chance
      winAmount = betAmount * 50;
      finalBalance += winAmount;
      resultText = getLang("jackpot_win", formatCurrency(winAmount), formatCurrency(finalBalance));
    } else if (roll < 0.6 || isForceWin) {
      // Normal win (1.0x to 3.0x)
      const multiplier = (Math.random() * 2 + 1).toFixed(1); // 1.0 to 3.0
      winAmount = betAmount * parseFloat(multiplier);
      finalBalance += winAmount;
      resultText = getLang("normal_win", multiplier, formatCurrency(winAmount), formatCurrency(finalBalance));
    } else {
      // Lose
      winAmount = -betAmount;
      finalBalance += winAmount;
      resultText = getLang("lose_message", formatCurrency(betAmount), formatCurrency(finalBalance));
    }

    await usersData.set(senderID, {
      money: finalBalance,
      data: userData.data,
    });

    return message.reply(resultText);

    function formatCurrency(number) {
      if (number >= 1e15) return (number / 1e15).toFixed(2) + "Q";
      if (number >= 1e12) return (number / 1e12).toFixed(2) + "T";
      if (number >= 1e9) return (number / 1e9).toFixed(2) + "B";
      if (number >= 1e6) return (number / 1e6).toFixed(2) + "M";
      if (number >= 1e3) return (number / 1e3).toFixed(2) + "K";
      return number.toFixed(2);
    }
  },
};
