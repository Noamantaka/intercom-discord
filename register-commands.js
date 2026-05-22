const APPLICATION_ID = "1506721049356534060";
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const commands = [
  {
    name: "reply",
    description: "Reply to the current Intercom conversation",
    options: [
      {
        name: "message",
        description: "Your message",
        type: 3,
        required: true,
      },
    ],
  },
];

async function register() {
  const response = await fetch(
    `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    }
  );

  const data = await response.json();
  console.log("✅ Commands registered:", data);
}

register();