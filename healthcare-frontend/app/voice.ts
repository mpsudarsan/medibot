// Voice Recognition Setup for 4 Languages

const VOICE_LANG_MAP: Record<string, string> = {
    en: 'en-IN',  // English India
    hi: 'hi-IN',  // Hindi India
    ta: 'ta-IN',  // Tamil India
    te: 'te-IN',  // Telugu India
  };
  
  export function startVoiceRecognition(
    langCode: string,
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onStart: () => void,
    onEnd: () => void
  ) {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
  
    if (!SpeechRecognition) {
      onError('Speech recognition not supported. Use Chrome or Edge.');
      return null;
    }
  
    const recognition = new SpeechRecognition();
  
    // ✅ SET LANGUAGE - IMPORTANT!
    recognition.lang = VOICE_LANG_MAP[langCode] || 'en-IN';
  
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    console.log(`🎤 Voice Recognition Setup for: ${recognition.lang}`);
  
    // When listening starts
    recognition.onstart = () => {
      console.log(`✅ Started listening in ${recognition.lang}`);
      onStart();
    };
  
    // When listening stops
    recognition.onend = () => {
      console.log(`⏹️ Stopped listening`);
      onEnd();
    };
  
    // If error occurs
    recognition.onerror = (event: any) => {
      console.error(`❌ Voice error: ${event.error}`);
      onError(`Error: ${event.error}`);
    };
  
    // When speech is recognized
    recognition.onresult = (event: any) => {
      let transcript = '';
  
      // Collect all recognized speech
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        transcript += transcriptPart;
      }
  
      console.log(`📝 Recognized: "${transcript}"`);
      onResult(transcript);
    };
  
    // Start listening
    recognition.start();
  
    return recognition;
  }