const nacl = require("tweetnacl");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const signature = req.headers["x-signature-ed25519"];
  const timestamp = req.headers["x-signature-timestamp"];
  const body = JSON.stringify(req.body);

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(process.env.DISCORD_PUBLIC_KEY, "hex")
  );

  if (!isVerified) {
    return res.status(401).send("Invalid signature");
  }

  const { type } = req.body;

  if (type === 1) {
    return res.status(200).json({ type: 1 });
  }

  return res.status(400).json({ error: "Unknown interaction" });
}