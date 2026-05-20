const APPLICATION_ID = "1506721049356534060";
const DISCORD_BOT_TOKEN = "MTUwNjcyMTA0OTM1NjUzNDA2MA.GmPQ0s.dTWD6H8gwjhsCretktCKOZ36qgceKtVbDLl9vk";

const commands = [
  {
    name: "reply",
    description: "رد على محادثة Intercom",
    options: [
      {
        name: "conversation_id",
        description: "الـ Conversation ID",
        type: 3,
        required: true,
      },
      {
        name: "message",
        description: "الرسالة",
        type: 3,
        required: true,
      },
    ],
  },
];

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