module.exports = {
  config: {
    name: "bet",
    version: "3.1",
    author: "T A N J I L",
    shortDescription: { en: "Random multiplier bet game" },
    longDescription: { en: "Place a bet and win with a random multiplier between 1.0× to 3.0×, or hit the jackpot (50×)!" },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "⚠️ Invalid bet amount. Use values like 1K, 10M, 500K, etc.",
      not_enough_money: "⚠️ You don't have enough money to place this bet.",
      win: "╭─────\n│\n│     You Won!\n│\n│     Multiplier: %1×\n│     Winnings: $%2\n│     Balance: $%3\n│\n│     B E T\n╰─────",
      jackpot: "╭─────\n│\n│     JACKPOT!!\n│\n│     You hit 50× = $%1\n│     Balance: $%2\n│\n│     *** JACKPOT ***\n╰─────",
      lose: "╭─────\n│\n│     You Lost\n│\n│     Lost: $%1\n│     Balance: $%2\n│\n│     B E T\n╰─────",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const input = args[0]?.toLowerCase();
    if (!input) return message.reply("⚠️ Please provide your bet amount. Example: /bet 1M");

    const isForceWin = input.endsWith(".win");
    const rawAmount = isForceWin ? input.replace(".win", "") : input;

    function parseAmount(str) {
      const units = { k: 1e3, m: 1e6, b: 1e9, t: 1e12, q: 1e15 };
      const match = str.match(/^(\d+(\.\d+)?)([kmbtq])$/);
      if (!match) return null;
      const [_, num, __, unit] = match;
      return parseFloat(num) * units[unit];
    }

    const bet = parseAmount(rawAmount);
    if (!bet || bet < 1000) return message.reply(getLang("invalid_amount"));

    const userData = await usersData.get(senderID);
    let balance = userData.money || 0;

    if (balance < bet) return message.reply(getLang("not_enough_money"));

    let winAmount = 0;
    let resultMsg = "";
    const chance = Math.random();

    if (chance < 0.05) {
      // Jackpot!
      winAmount = bet * 50;
      balance += winAmount;
      resultMsg = getLang("jackpot", format(winAmount), format(balance));
    } else if (chance < 0.65 || isForceWin) {
      // Random multiplier win
      const multiplier = (Math.random() * 2 + 1).toFixed(1); // 1.0 - 3.0
      winAmount = bet * parseFloat(multiplier);
      balance += winAmount;
      resultMsg = getLang("win", multiplier, format(winAmount), format(balance));
    } else {
      // Loss
      winAmount = -bet;
      balance += winAmount;
      resultMsg = getLang("lose", format(bet), format(balance));
    }

    await usersData.set(senderID, {
      money: balance,
      data: userData.data,
    });

    return message.reply(resultMsg);

    function format(n) {
      if (n >= 1e15) return (n / 1e15).toFixed(2) + "Q";
      if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
      if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
      return n.toFixed(2);
    }
  },
};
