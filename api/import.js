export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    // You can inspect the uploaded file here
    console.log("Import request received");

    // Respond with a dummy jobId for now
    res.status(200).json({ jobId: "12345" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Import failed" });
  }
}

