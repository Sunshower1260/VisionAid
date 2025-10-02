//post img
app.post("/upload", async (req, res) => {
  const { image } = req.body; 

  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    console.log("Received image length:", image.length);

    res.json({ success: true, message: "Image uploaded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
