/* utils/googleTTS.ts ----------------------------------------- */
import Constants from 'expo-constants';
import axios from 'axios';

export type TTSOptions = { text: string; langCode: string; speakingRate?: number; voiceName?: string; };

/* 🔸 1. Obtém a chave em qualquer dos campos ‘extra’ (EAS + Classic).  */
const apiKey =
  Constants.expoConfig?.extra?.googleTtsKey   // config -> app.json / app.config.js
  ?? Constants.manifest?.extra?.googleTtsKey; // fallback para expo‑classic

if (!apiKey) {
  throw new Error(
    'googleTtsKey não encontrada em extra.* do app.json. ' +
    'Adiciona-a a "extra": { "googleTtsKey": "AQUI_A_TUA_CHAVE" }.'
  );
}

/* 🔸 2. Função de síntese — inalterada excepto pelos comentários. */
export async function synthesizeTTS({
  text,
  langCode,
  speakingRate = 1,
  voiceName = '',
}: TTSOptions) {
  const body = {
    input: { text },
    voice: { languageCode: langCode, name: voiceName },
    audioConfig: { audioEncoding: 'MP3', speakingRate },
  };

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const { data } = await axios.post(url, body);

  /* data.audioContent vem em Base64 — devolvemos já num data‑URI. */
  return `data:audio/mp3;base64,${data.audioContent}`;
}