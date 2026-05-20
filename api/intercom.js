export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const payload = req.body;
  console.log("Intercom webhook received:", JSON.stringify(payload, null, 2));

  // ✅ event type بيجي في payload.topic مش في data.item.type
  const eventType = payload?.topic;
  const item = payload?.data?.item;

  const isMessageEvent =
    eventType === "conversation.user.replied" ||
    eventType === "conversation.user.created";

  if (!isMessageEvent) {
    console.log("Ignored event type:", eventType);
    return res.status(200).json({ ignored: true });
  }

  // ✅ استخراج البيانات
  const name =
    item?.source?.author?.name ||
    item?.contacts?.data?.[0]?.name ||
    item?.author?.name ||
    "Unknown User";

  const email =
    item?.contacts?.data?.[0]?.email ||
    item?.source?.author?.email ||
    item?.author?.email ||
    "No Email";

  // ✅ المحتوى بيجي من source.body أو آخر part
  const rawMessage =
    item?.source?.body ||
    item?.conversation_parts?.conversation_parts?.slice(-1)?.[0]?.body ||
    item?.body ||
    "No message content";

  // ✅ تنظيف HTML tags من الرسالة
  const message = rawMessage.replace(/<[^>]*>/g, "").trim().substring(0, 1024);

  const conversationId = item?.id || "N/A";
  const time = new Date().toISOString();

  const discordPayload = {
    embeds: [
      {
        title: "📩 New Intercom Message",
        color: 5814783,
        fields: [
          { name: "👤 Name", value: name || "—", inline: true },
          { name: "📧 Email", value: email || "—", inline: true },
          { name: "💬 Message", value: message || "—", inline: false },
          { name: "🧾 Conversation ID", value: String(conversationId), inline: true },
          { name: "⏰ Time", value: time, inline: true },
        ],
      },
    ],
  };

  // ✅ الـ URL من environment variable مش hardcoded
  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  if (!DISCORD_WEBHOOK_URL) {
    console.error("Missing DISCORD_WEBHOOK_URL env variable");
    return res.status(500).json({ error: "Webhook URL not configured" });
  }

  // ✅ retry مرة واحدة لو فشل
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload),
      });

      if (!discordRes.ok) {
        const errText = await discordRes.text();
        console.error(`Discord attempt ${attempt} failed:`, discordRes.status, errText);
        if (attempt === 2) return res.status(500).json({ error: "Discord failed", detail: errText });
        continue;
      }

      console.log("Discord message sent successfully");
      return res.status(200).json({ success: true });

    } catch (err) {
      console.error(`Discord attempt ${attempt} error:`, err);
      if (attempt === 2) return res.status(500).json({ error: "Discord failed" });
    }
  }
}