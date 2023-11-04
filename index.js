const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'MESSAGE_CONTENT'] });

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on('ready', () => {
  console.log(`${client.user.tag} Hazır!`);
});

client.on('messageCreate', (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('Komutu çalıştırırken bir hata oluştu!');
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (!client.commands.has(commandName)) return;

  try {
    await client.commands.get(commandName).execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Komutu çalıştırırken bir hata oluştu!', ephemeral: true });
  }
});
// destek oluşturma
const categoryId = config.destek_kategori_id;
const roleId = config.destek_sorumlusu_id;
const footer = config.footer
const footer_icon = config.footer_icon

client.on('messageCreate', async (message) => {
  if (message.content.toLowerCase() === `${config.prefix}destek` && message.member.permissions.has('ADMINISTRATOR')) {
    const destekEmbed = {
      color: '#0a30ff',
      title: 'Ailght Destek',
      description: 'Destek Talebi oluşturmak için **Destek Oluştur** butonuna basın!',
      footer: {
        text: footer,
        icon_url: footer_icon,
      },
    };
    
    const row = {
      type: 'ACTION_ROW',
      components: [
        {
          type: 'BUTTON',
          style: 'PRIMARY',
          label: 'Destek Oluştur',
          customId: 'destek_al',
        },
      ],
    };

    const messageSent = await message.channel.send({ embeds: [destekEmbed], components: [row] });
    messageSent.destekKanal = null;
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'destek_al') {
    const guild = interaction.guild;
    const category = guild.channels.cache.get(config.destek_kategori_id);
    const destekSorumlusuRole = guild.roles.cache.get(config.destek_sorumlusu_id);

    if (!category) {
      await guild.channels.create('Destek Talepleri', {
        type: 'GUILD_CATEGORY',
        reason: 'Destek talepleri için kategori oluşturuldu',
      });
    }

    const channelName = `🎫・destek-${interaction.user.username.toLowerCase()}`;

    const channel = await guild.channels.create(channelName, {
      type: 'GUILD_TEXT',
      parent: category || undefined,
    });

    await channel.permissionOverwrites.edit(guild.roles.everyone, {
      VIEW_CHANNEL: false,
      SEND_MESSAGES: false,
    });

    await channel.permissionOverwrites.edit(destekSorumlusuRole, {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
    });

    await interaction.user.send(`Destek talebiniz açıldı! ${channel}`);

    const embed = {
      color: '#0a30ff',
      title: 'Destek Talebi',
      description: 'Lütfen sorununuzu aşağıya yazınız. Yetkililer en yakın zamanda sizinle ilgilenecektir.',
      thumbnail: {
        url: guild.iconURL({ format: 'png', dynamic: true, size: 4096 })
      }
    };    

    const destekEtiket = await channel.send(`<@${interaction.user.id}>, <@&${config.destek_sorumlusu_id}>`);
    const destekMesaj = await channel.send({ embeds: [embed] });

    if (interaction.customId === 'destek_kapat') {
      console.log(interaction.customId);
      await channel.delete();
      console.log(`Kanal silindi: ${channelName}`);
      const logKanal = guild.channels.cache.get(config.destek_log);
      if (logKanal) {
        logKanal.send(`${interaction.user.tag} (${interaction.user.id}) tarafından ${channelName} kanalı silindi.`);
      }
    }
  }
});
// destek kapat

client.on('messageCreate', async (message) => {
  if (message.content.toLowerCase() === `${config.prefix}destek-kapat` && message.member.roles.cache.has(config.destek_sorumlusu_id)) {
    const channelToDelete = message.channel;

    if (channelToDelete.parentId === config.destek_kategori_id && channelToDelete.id !== config.destek_log) {

      const messages = await channelToDelete.messages.fetch();
      

      const transcript = messages.map(msg => {
        return {
          author: msg.author.tag,
          content: msg.content,
          timestamp: msg.createdAt
        };
      });


      fs.writeFileSync('transcript.json', JSON.stringify(transcript, null, 2));


      await channelToDelete.delete();

      const logKanal = message.guild.channels.cache.get(config.destek_log);
      const embed = new Discord.MessageEmbed()
        .setTitle('Destek Kapatıldı!')
        .setDescription(`<@${message.author.id}> tarafından **${channelToDelete.name}** kanalı silindi.`)
        .setColor('#0a30ff');

      if (logKanal) {
        logKanal.send({ embeds: [embed] });


        logKanal.send({ files: ['transcript.json'] });
      }
    } else {
      message.reply('Bu komut sadece destek kanallarında kullanılabilir.');
    }
  }
});


client.login(config.token);