// app/utils/VoiceAssistant.ts
import { Audio } from 'expo-av';
import { transcribeAudio } from './googleSTT';

let currentRecording : Audio.Recording | null = null;
let recordingBusy   = false;                  // ← mutex global
let forceCanceled   = false;
let meterInterval  : NodeJS.Timeout | null = null;

/* ─────────── grava + STT ─────────── */
export async function listenAndRecognize(): Promise<string | null> {
  /* se outra chamada já está a preparar/gravando devolvemos null      */
  if (recordingBusy) return null;

  recordingBusy = true;
  forceCanceled = false;

  try {
    /* permissões microfone */
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) throw new Error('Sem permissão para usar o microfone.');

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    /* inicia nova gravação */
    const { recording } = await Audio.Recording.createAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    });
    currentRecording = recording;

    /* detecta silêncio para parar automaticamente */
    let silent = 0;
    meterInterval = setInterval(async () => {
      const status: any = await recording.getStatusAsync();
      if (!status.isRecording) return;

      /* -40 dB ≈ silêncio */
      silent = (status.metering ?? -160) < -40 ? silent + 1 : 0;

      if (silent >= 3) {                 // ≈ 1.5 s (3 × 500 ms)
        clearInterval(meterInterval!);
        await recording.stopAndUnloadAsync();
        currentRecording = null;
      }
    }, 500);

    /* espera terminar (silêncio ou cancelManual) */
    while ((await recording.getStatusAsync()).isRecording) {
      if (forceCanceled) return null;
      await new Promise(r => setTimeout(r, 100));
    }

    const uri = recording.getURI();
    if (!uri) return null;

    /* transcreve */
    const text = await transcribeAudio(uri, 'auto');
    return text;
  } catch (err) {
    if (!forceCanceled) console.error('Erro no assistente de voz:', err);
    return null;
  } finally {
    /* liberta mutex em qualquer cenário */
    recordingBusy = false;
  }
}

/* ─────────── cancela gravação ─────────── */
export async function cancelRecording() {
  forceCanceled = true;

  try {
    if (meterInterval) clearInterval(meterInterval);

    if (currentRecording) {
      const status = await currentRecording.getStatusAsync();
      if (status.isRecording) await currentRecording.stopAndUnloadAsync();
      currentRecording = null;
    }
  } catch (e) {
    console.warn('Erro ao cancelar gravação:', e);
  } finally {
    recordingBusy = false;               // devolve lock
  }
}