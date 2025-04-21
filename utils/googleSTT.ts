import * as FileSystem from 'expo-file-system';

export async function transcribeAudio(uri: string, code?: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch('https://api-msd2tzx4aq-uc.a.run.app/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: base64,
        config: {
          languageCode: 'pt-PT', // Idioma principal (pode ser qualquer um válido)
          alternativeLanguageCodes: ['en-US', 'es-ES', 'fr-FR'], // Idiomas adicionais
        },
      }),
    });

    const json = await response.json();

    if (json.text) return json.text;
    if (json.error) console.error('Erro da função:', json.error);

    return '';
  } catch (error) {
    console.error('Erro ao transcrever:', error);
    return '';
  }
}
