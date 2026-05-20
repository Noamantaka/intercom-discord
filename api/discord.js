const nacl = require("tweetnacl");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const signature = req.headers["x-signature-ed25519"];
  const timestamp = req.headers["x-signature-timestamp"];
  const rawBody = await new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });

  try {
    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, "hex"),
      Buffer.from(process.env.DISCORD_PUBLIC_KEY, "hex")
    );

    if (!isVerified) {
      console.log("❌ Invalid signature");
      return res.status(401).send("Invalid signature");
    }
  } catch (e) {
    console.log("❌ Verification error:", e.message);
    return res.status(401).send("Invalid signature");
  }

  const body = JSON.parse(rawBody);
  console.log("✅ Valid - type:", body.type);

  if (body.type === 1) {
    return res.status(200).json({ type: 1 });
  }

  return res.status(400).json({ error: "Unknown interaction" });
};

module.exports.config = {
  api: { bodyParser: false },
};