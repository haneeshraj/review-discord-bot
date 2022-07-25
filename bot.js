const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const validURL = require("valid-url");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

let prefix = ">";
let admin = "";

let subChannel = "";
let fbChannel = "";
let successEmbed = new EmbedBuilder().setColor("Green").setTitle("Success!");
let failEmbed = new EmbedBuilder().setColor("Red").setTitle("Error!");
client.on("messageCreate", (message) => {
  //   if (message.author.bot) return;

  if (message.channelId === fbChannel) {
    message.react("🔥");
    message.react("🆗");
    message.react("🗑");
  }

  const filter = (reaction, user) => {
    return reaction.emoji.name === "▶" && user.id === message.author.id;
  };
  const collector = message.createReactionCollector(filter, {
    time: 15000,
  });

  collector.on("collect", (reaction, user) => {
    if (user.username === client.user.username) return;
    admin = user.username;
  });

  if (message.content.startsWith(prefix)) {
    const [cmd, ...args] = message.content.slice(prefix.length).split(" ");

    if (cmd === "review") {
      if (
        message.member.permissions.has(PermissionFlagsBits.ManageChannels) ||
        message.member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        if (!args[1])
          return message.channel.send({
            embeds: [
              failEmbed.setDescription(
                `Please mention the channel after the type of assignment!`
              ),
            ],
          });

        const type = args[0];
        const channel = args[1].slice(2, args[1].length - 1);

        if (type === "submit") {
          subChannel = channel;
          let channelName = message.guild.channels.cache.get(subChannel);
          return message.channel.send({
            embeds: [
              successEmbed.setDescription(
                `The submission channel is set to ${channelName}`
              ),
            ],
          });
        } else if (type === "fb") {
          fbChannel = channel;
          let channelName = message.guild.channels.cache.get(fbChannel);
          return message.channel.send({
            embeds: [
              successEmbed.setDescription(
                `The feedback channel is set to ${channelName}`
              ),
            ],
          });
        }
      }
    }
  }

  if (message.channel.id === subChannel) {
    let notURLEmbed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Not a valid link!")
      .setAuthor({
        name: message.guild.name,
        iconURL: client.user.defaultAvatarURL,
      })
      .setDescription("Please send a valid link and not a message!");

    if (!fbChannel) {
      let error = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Error!")
        .setDescription(
          "The feedback channel is not set! Please assign the channel by using the following command below"
        )
        .addFields({
          name: "Command",
          value: "`>review fb #[channel-name]`",
        });
      return message.channel.send({
        embeds: [error],
      });
    }
    if (validURL.isUri(message.content)) return message.react("▶");
    else return message.author.send({ embeds: [notURLEmbed] });
  }
});

client.on("messageReactionAdd", (reaction, user) => {
  if (reaction.message.channelId !== subChannel) return;

  if (reaction.count === 1) return;

  if (reaction.count === 2) {
    const newEmbed = new EmbedBuilder()
      .setAuthor({
        name: reaction.message.author.username,
        iconURL: reaction.message.author.avatarURL(),
      })
      .setTitle(`A track by ${reaction.message.author.username} `)
      .setURL(reaction.message.content)
      .setFields({ name: "Status", value: "Is now being reviewed!" })
      .setColor("Orange");

    let messageOfReview = reaction.message.guild.channels.cache.get(fbChannel);
    messageOfReview.send({ embeds: [newEmbed] });
  }
});

client.once("ready", () => {
  console.log("The bot is up and running!");
});

client.login(process.env.DISCORD_BOT_TOKEN);
