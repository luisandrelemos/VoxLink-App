import { Audio } from 'expo-av';
import { transcribeAudio } from './googleSTT';

let currentRecording: Audio.Recording | null = null;
let forceCanceled = false;
let interval: NodeJS.Timeout | null = null;

export async function listenAndRecognize(): Promise<string | null> {
  forceCanceled = false;
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) throw new Error('Sem permissão para usar o microfone.');

    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    const { recording } = await Audio.Recording.createAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true, // Habilita medição de volume
    });

    currentRecording = recording;

    let silentCount = 0;
    interval = setInterval(async () => {
      const status = await recording.getStatusAsync();
      if (!status.isRecording) return;

      const meter = (status as any).metering ?? -160;
      if (meter < -40) {
        silentCount++;
      } else {
        silentCount = 0;
      }

      if (silentCount >= 3) { // 1.5s de silêncio (500ms x 3)
        clearInterval(interval!);
        await recording.stopAndUnloadAsync();
        currentRecording = null;
      }
    }, 500);

    // Espera o fim da gravação
    while ((await recording.getStatusAsync()).isRecording) {
      if (forceCanceled) return null;
      await new Promise((res) => setTimeout(res, 100));
    }

    const uri = recording.getURI();
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
    if (interval) clearInterval(interval);
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
