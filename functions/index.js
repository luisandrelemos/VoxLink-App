const functions = require("firebase-functions/v2");
const express = require("express");
const cors = require("cors");
const { SpeechClient } = require("@google-cloud/speech");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "50mb" }));

const client = new SpeechClient();

app.post("/transcribe", async (req, res) => {
  try {
    const { audio, languageCode } = req.body;

    if (!audio) {
      return res.status(400).json({ error: "Base64 inválido" });
    }

    const [response] = await client.recognize({
      config: {
        encoding: "MP3", // funciona para .m4a gravado com expo-av
        sampleRateHertz: 44100,
        languageCode: languageCode || "pt-PT",
        enableAutomaticPunctuation: true,
      },
      audio: { content: audio },
    });

    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    res.json({ text: transcription });
  } catch (error) {
    console.error("Erro na função:", error);
    res.status(500).json({ error: error.message });
  }
});

exports.api = functions.https.onRequest(app);