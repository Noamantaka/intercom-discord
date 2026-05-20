import { REST, Routes, Client, GatewayIntentBits, SlashCommandBuilder } from "discord.js";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const INTERCOM_API_KEY = process.env.INTERCOM_API_KEY;
const APPLICATION_ID = "1506721049356534060";

// Register Slash Command
const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

const commands = [
  new SlashCommandBuilder()
    .setName("reply")
    .setDescription("رد على محادثة Intercom")
    .addStringOption((option) =>
      option
        .setName("conversation_id")
        .setDescription("الـ Conversation ID")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("الرسالة")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

await rest.put(Routes.applicationCommands(APPLICATION_ID), { body: commands });
console.log("✅ Slash command registered");

// Start Bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "reply") return;

  const conversationId = interaction.options.getString("conversation_id");
  const message = interaction.options.getString("message");

  await interaction.deferReply();

  try {
    const response = await fetch(
      `https://api.intercom.io/conversations/${conversationId}/reply`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${INTERCOM_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message_type: "comment",
          type: "admin",
          body: message,
        }),
      }
    );

    if (response.ok) {
      await interaction.editReply("✅ الرسالة اتبعتت لـ Intercom!");
    } else {
      const err = await response.json();
      console.error("Intercom error:", err);
      await interaction.editReply("❌ فيه مشكلة — " + JSON.stringify(err));
    }
  } catch (err) {
    console.error("Error:", err);
    await interaction.editReply("❌ فيه مشكلة!");
  }
});

client.login(DISCORD_BOT_TOKEN);