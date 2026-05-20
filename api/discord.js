const nacl = require("tweetnacl");

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", () => resolve(Buffer.concat(data)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const signature = req.headers["x-signature-ed25519"];
  const timestamp = req.headers["x-signature-timestamp"];
  const rawBody = await getRawBody(req);

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody.toString()),
    Buffer.from(signature, "hex"),
    Buffer.from(process.env.DISCORD_PUBLIC_KEY, "hex")
  );

  if (!isVerified) {
    console.log("❌ Invalid signature");
    return res.status(401).send("Invalid signature");
  }

  const { type } = JSON.parse(rawBody.toString());

  if (type === 1) {
    return res.status(200).json({ type: 1 });
  }

  return res.status(400).json({ error: "Unknown interaction" });
}