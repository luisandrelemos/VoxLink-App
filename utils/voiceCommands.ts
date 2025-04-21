type VoiceCommand = {
    keywords: string[];
    action: () => void;
  };
  
  export function getVoiceCommand(text: string, router: any, toggleSound: () => void): boolean {
    const commandList: VoiceCommand[] = [
      {
        keywords: ['stt', 'speech to text', 'falar', 'gravação', 'voz para texto', 'speechtotext'],
        action: () => router.replace('/stt'),
      },
      {
        keywords: ['tts', 'text to speech', 'texto para voz', 'ler', 'texttospeech'],
        action: () => router.replace('/tts'),
      },
      {
        keywords: ['definições', 'settings', 'preferências', 'configurações', 'config', 'acessibilidade'],
        action: () => router.replace('/settings'),
      },
      {
        keywords: ['comunicação rápida', 'rápida', 'mensagens rápidas'],
        action: () => router.replace('/fasttext'),
      },
      {
        keywords: ['feedback', 'som', 'ativar som'],
        action: toggleSound,
      },
    ];
  
    const lower = text.toLowerCase();
    for (const cmd of commandList) {
      if (cmd.keywords.some((k) => lower.includes(k))) {
        cmd.action();
        return true;
      }
    }
  
    return false;
  }  