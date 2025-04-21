import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { transcribeAudio } from './googleSTT';

export async function listenAndRecognize(): Promise<string | null> {
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) throw new Error('Sem permissão para usar o microfone.');

    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await new Promise((res) => setTimeout(res, 3000)); // Esperar 3 segundos para o utilizador falar
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    if (!uri) return null;

    const text = await transcribeAudio(uri);
    return text;
  } catch (err) {
    console.error('Erro no assistente de voz:', err);
    return null;
  }
}