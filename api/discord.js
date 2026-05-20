export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { type } = req.body;

  if (type === 1) {
    return res.status(200).json({ type: 1 });
  }

  return res.status(400).json({ error: "Unknown interaction" });
}