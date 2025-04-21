// utils/VoiceAssistant.ts
import { Audio } from 'expo-av';
import { transcribeAudio } from './googleSTT';

let currentRecording: Audio.Recording | null = null;
let forceCanceled = false;

export async function listenAndRecognize(): Promise<string | null> {
  forceCanceled = false;
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) throw new Error('Sem permissão para usar o microfone.');

    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    currentRecording = recording;

    await new Promise((resolve) => setTimeout(resolve, 3500));

    if (forceCanceled) return null;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    currentRecording = null;
    if (!uri) return null;

    const text = await transcribeAudio(uri, 'auto');
    return text;
  } catch (err) {
    if (!forceCanceled) console.error('Erro no assistente de voz:', err);
    return null;
  }
}

export async function cancelRecording() {
  forceCanceled = true;
  try {
    if (currentRecording) {
      const status = await currentRecording.getStatusAsync();
      if (status.isRecording) {
        await currentRecording.stopAndUnloadAsync();
      }
      currentRecording = null;
    }
  } catch (e) {
    console.warn('Erro ao cancelar gravação:', e);
  }
}