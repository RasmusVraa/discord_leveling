const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});
const fs = require('fs');

// загружаем данные из файла
let data = JSON.parse(fs.readFileSync('data.json'));

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
  // проверяем, что сообщение не от бота и не является командой
  if (!msg.author.bot && !msg.content.startsWith('!')) {
    const userId = msg.author.id;

    // добавляем пользователя в данные, если его еще нет
    if (!data.users[userId]) {
      data.users[userId] = {
        level: 0,
        messages: 0,
      };
    }

    // увеличиваем количество сообщений пользователя и проверяем, нужно ли повышать его уровень
    data.users[userId].messages++;
    const messagesNeededForNextLevel = 5 * Math.pow(data.users[userId].level, 2) + 50 * data.users[userId].level + 100;
    if (data.users[userId].messages >= messagesNeededForNextLevel) {
      data.users[userId].level++;
      msg.reply(`Congratulations, you've reached level ${data.users[userId].level}!`);
    }

    // записываем данные в файл
    fs.writeFileSync('data.json', JSON.stringify(data));
  }

  // обработка команд
  if (msg.content.startsWith('!top')) {
    const topUsers = Object.keys(data.users)
      .sort((a, b) => data.users[b].level - data.users[a].level)
      .slice(0, 10);
    const topList = topUsers.map((userId, index) => `${index + 1}. <@${userId}> - level ${data.users[userId].level}`).join('\n');
    msg.channel.send(`**Top 10 users by level:**\n${topList}`);
  } else if (msg.content.startsWith('!rank')) {
    const args = msg.content.split(' ');
    let userId;
    if (args.length > 1) {
      userId = args[1].replace(/[^0-9]/g, '');
    } else {
      userId = msg.author.id;
    }
    const user = data.users[userId];
    if (!user) {
      msg.reply("I don't have any data on that user yet.");
    } else {
      msg.reply(`<@${userId}> is currently level ${user.level}.`);
    }
  }
});

client.login('TOKEN');
