app.post("/analyze", async (req, res) => {
  const { image } = req.body;

  if (!image) return res.status(400).json({ error: "No image provided" });

  try {
    // Gửi ảnh đến Python FastAPI server (VisionAid)
    const response = await fetch("http://192.168.1.9:7000/upload_base64", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });

    const result = await response.json();
    console.log("AI Result:", result);

    res.json({
      success: true,
      text: result.text_result,
      audioUrl: result.audio_url, // file WAV trả từ VisionAid
    });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
