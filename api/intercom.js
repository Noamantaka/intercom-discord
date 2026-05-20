export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const payload = req.body;
  console.log("Intercom webhook received:", JSON.stringify(payload, null, 2));

  const eventType = payload?.topic;
  const item = payload?.data?.item;

  const isMessageEvent =
    eventType === "conversation.user.replied" ||
    eventType === "conversation.user.created";

  if (!isMessageEvent) {
    console.log("Ignored event type:", eventType);
    return res.status(200).json({ ignored: true });
  }

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

  const rawMessage =
    item?.source?.body ||
    item?.conversation_parts?.conversation_parts?.slice(-1)?.[0]?.body ||
    item?.body ||
    "No message content";

  const message = rawMessage.replace(/<[^>]*>/g, "").trim().substring(0, 1024);
  const conversationId = item?.id || "N/A";
  const time = new Date().toISOString();

  const DISCORD_WEBHOOK_URL = p