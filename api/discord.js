const { verifyKey } = require("discord-interactions");

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", () => resolve(Buffer.concat(data)));
    req.on("error", reject);
  });
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const rawBody = await getRawBody(req);
  const { type, data } = JSON.parse(rawBody.toString());

  if (type === 1) {
    return res.status(200).json({ type: 1 });
  }

  if (type === 2 && data.name === "reply") {
    const conversationId = data.options.find(o => o.name === "conversation_id")?.value;
    const message = data.options.find(o => o.name === "message")?.value;

    try {
      const response = await fetch(
        `https://api.intercom.io/conversations/${conversationId}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.INTERCOM_API_KEY}`,
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
        return res.status(200).json({
          type: 4,
          data: { content: "✅ الرسالة اتبعتت لـ Intercom!" },
        });
      } else {
        const err = await response.json();
        return res.status(200).json({
          type: 4,
          data: { content: "❌ فيه مشكلة: " + JSON.stringify(err) },
        });
      }
    } catch (err) {
      return res.status(200).json({
        type: 4,
        data: { content: "❌ فيه error!" },
      });
    }
  }

  return res.status(400).json({ error: "Unknown interaction" });
}

handler.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = handler;