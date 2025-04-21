type VoiceCommand = {
  keywords: string[];
  action: () => Promise<void>;
};

export async function getVoiceCommand(
  text: string,
  router: any,
  toggleSound: () => Promise<void>,
  toggleVibration: () => Promise<void>
): Promise<boolean> {
  const commandList: VoiceCommand[] = [
    // Home
    {
      keywords: ['início', 'inicio', 'home', 'accueil', 'startseite', 'página inicial'],
      action: async () => router.replace('/home'),
    },
    // Conta
    {
      keywords: ['minha conta', 'perfil', 'account', 'compte', 'konto', 'meu perfil', 'conta'],
      action: async () => router.replace('/account'),
    },
    // Info
    {
      keywords: ['informações', 'info', 'sobre', 'about', 'information', 'über', 'acerca', 'termos'],
      action: async () => router.replace('/info'),
    },
    // STT
    {
      keywords: ['stt', 'speech to text', 'falar', 'gravação', 'voz para texto', 'speechtotext', 'ditar', 'dictar', 'dicter', 'sprechen'],
      action: async () => router.replace('/stt'),
    },
    // TTS
    {
      keywords: ['tts', 'text to speech', 'texto para voz', 'ler texto', 'texttospeech', 'ler', 'leer', 'lire', 'lesen'],
      action: async () => router.replace('/tts'),
    },
    // FastText
    {
      keywords: ['comunicação rápida', 'mensagens rápidas', 'frases rápidas', 'quick messages', 'communication rapide', 'nachrichten', 'mensagens curtas'],
      action: async () => router.replace('/fasttext'),
    },
    // Definições
    {
      keywords: ['definições', 'settings', 'preferências', 'configurações', 'config', 'acessibilidade', 'paramètres', 'ajustes', 'einstellungen'],
      action: async () => router.replace('/settings'),
    },
    // Ativar som
    {
      keywords: ['ativar som', 'ligar som', 'ligar áudio', 'som ativado', 'enable sound', 'activer son', 'einschalten ton'],
      action: toggleSound,
    },
    // Desativar som
    {
      keywords: ['desativar som', 'desligar som', 'sem som', 'mutar', 'mute', 'disable sound', 'désactiver son', 'ton aus'],
      action: toggleSound,
    },
    // Ligar vibração
    {
      keywords: ['ligar vibração', 'ativar vibração', 'enable vibration', 'activer vibration', 'vibração ligada', 'vibration an'],
      action: toggleVibration,
    },
    // Desligar vibração
    {
      keywords: ['desligar vibração', 'desativar vibração', 'sem vibração', 'disable vibration', 'désactiver vibration', 'vibration aus'],
      action: toggleVibration,
    },
  ];

  const lower = text.toLowerCase();

  for (const cmd of commandList) {
    if (cmd.keywords.some((k) => lower.includes(k))) {
      await cmd.action();
      return true;
    }
  }

  return false;
}