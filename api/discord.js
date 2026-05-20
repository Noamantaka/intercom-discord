const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require("discord-interactions");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { type } = req.body;

  if (type === InteractionType.PING) {
    return res.status(200).json({ type: InteractionResponseType.PONG });
  }

  return res.status(400).json({ error: "Unknown interaction" });
};