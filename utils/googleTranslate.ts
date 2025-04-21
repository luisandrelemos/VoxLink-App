// utils/googleTranslate.ts  (ficheiro completo)
import axios from 'axios';
import Constants from 'expo-constants';

/**
 * Tradução simples Google Cloud – usa a MESMA API‑key do TTS
 * @param text       Texto original
 * @param targetLang Código alvo, ex. "pt-PT", "en-US"
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  const apiKey = Constants.expoConfig?.extra?.googleTtsKey;
  if (!apiKey) throw new Error('API key não definida em app.json');

  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const body = {
    q: text,
    target: targetLang.slice(0, 2),   // "pt", "en", …
    format: 'text',
  };

  const { data } = await axios.post(url, body);
  return data.data.translations[0].translatedText as string;
}
