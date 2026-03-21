'use client';

import { useState, useRef, useEffect } from 'react';
import { startVoiceRecognition } from './voice';
import {
  Send, Menu, X, MessageCircle, Plus,
  Settings, AlertCircle, Loader, Bot,
  LogOut, User, ChevronRight, Activity,
  Heart, Shield, Stethoscope, Mic, MicOff, Volume2, Zap
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
  language?: string;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const SYMPTOMS = [
  { id: 'fever',     emoji: '🤒', label: 'Fever & Cough',    glowClass: 'glow-cyan'   },
  { id: 'headache',  emoji: '🧠', label: 'Headache',         glowClass: 'glow-purple' },
  { id: 'stomach',   emoji: '🤢', label: 'Stomach Pain',     glowClass: 'glow-yellow' },
  { id: 'chest',     emoji: '⚠️', label: 'Chest Pain',       glowClass: 'glow-red'    },
  { id: 'breathing', emoji: '😮‍💨', label: 'Breathing Issues', glowClass: 'glow-blue'   },
  { id: 'bleeding',  emoji: '🩸', label: 'Severe Bleeding',  glowClass: 'glow-rose'   },
  { id: 'rash',      emoji: '😤', label: 'Skin Rash',        glowClass: 'glow-pink'   },
  { id: 'dizziness', emoji: '🌀', label: 'Dizziness',        glowClass: 'glow-indigo' },
  { id: 'vomit',     emoji: '🤮', label: 'Nausea',           glowClass: 'glow-orange' },
  { id: 'ache',      emoji: '😩', label: 'Body Ache',        glowClass: 'glow-lime'   },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', voiceCode: 'en-IN', name: 'English' },
  { code: 'hi', label: 'हिंदी',   flag: '🇮🇳', voiceCode: 'hi-IN', name: 'Hindi'   },
  { code: 'ta', label: 'தமிழ்',   flag: '🇮🇳', voiceCode: 'ta-IN', name: 'Tamil'   },
  { code: 'te', label: 'తెలుగు',  flag: '🇮🇳', voiceCode: 'te-IN', name: 'Telugu'  },
];

const VOICE_LANG_MAP: Record<string, string> = {
  en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN',
};

// ✅ Backend port — make sure healthcare-backend runs on 3001
const API_BASE_URL = 'http://localhost:3001';

// ─────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────
function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [leftEyePos,  setLeftEyePos]  = useState({ x: 0, y: 0 });
  const [rightEyePos, setRightEyePos] = useState({ x: 0, y: 0 });
  const [clicked,     setClicked]     = useState(false);
  const botRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!botRef.current) return;
      const { left, top, width, height } = botRef.current.getBoundingClientRect();
      const angle = Math.atan2(e.clientY - (top + height / 2), e.clientX - (left + width / 2));
      const pos = { x: Math.cos(angle) * 6, y: Math.sin(angle) * 6 };
      setLeftEyePos(pos);
      setRightEyePos(pos);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => onEnter(), 700);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className={`relative z-10 text-center transition-all duration-700 ${clicked ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-7xl font-black mb-3 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
            MediBot
          </h1>
          <p className="text-xl text-gray-300 font-light">Your AI Healthcare Companion</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="text-xs text-cyan-400 flex items-center gap-1"><Mic size={12} /> Voice Input</span>
            <span className="text-xs text-blue-400 flex items-center gap-1"><Volume2 size={12} /> Voice Output</span>
            <span className="text-xs text-purple-400 flex items-center gap-1"><Zap size={12} /> AI Powered</span>
          </div>
        </div>

        {/* Big Robot */}
        <div
          ref={botRef}
          onClick={handleClick}
          className="relative mx-auto mb-16 cursor-pointer group"
          style={{ width: '220px', height: '280px' }}
        >
          <div className="absolute inset-0 landing-float">
            {/* Glow */}
            <div className="absolute inset-0 rounded-3xl blur-3xl bg-gradient-to-br from-cyan-400/30 to-blue-400/20 group-hover:from-cyan-400/60 group-hover:to-blue-400/50 transition-all duration-500" />

            {/* Body */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-200 border-4 border-white/80 shadow-2xl shadow-blue-500/40 group-hover:shadow-cyan-500/60 transition-all">

              {/* Face */}
              <div className="w-full h-36 bg-gradient-to-b from-gray-100 to-white flex flex-col items-center justify-center relative">
                <div className="absolute inset-2 bg-gradient-to-br from-gray-900 to-black rounded-2xl" />
                {/* Eyes */}
                <div className="relative z-10 flex gap-5 mb-3">
                  {[leftEyePos, rightEyePos].map((pos, i) => (
                    <div key={i} className="relative w-8 h-8 bg-gradient-to-br from-white to-cyan-100 rounded-full shadow-xl shadow-cyan-400 flex items-center justify-center overflow-hidden border-2 border-white/60">
                      <div className="w-3.5 h-3.5 bg-black rounded-full transition-all duration-100" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} />
                      <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-80" />
                    </div>
                  ))}
                </div>
                {/* Smile */}
                <div className="relative z-10 w-10 h-2.5 border-b-2 border-cyan-300 rounded-b-full group-hover:border-cyan-400 transition-all" />
              </div>

              {/* Chest lights */}
              <div className="w-full h-10 bg-gradient-to-b from-gray-200 to-gray-100 flex items-center justify-center gap-2 px-4">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                <div className="flex-1 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-60" />
              </div>

              {/* Click to start */}
              <div className="w-full flex-1 bg-gray-50 flex flex-col items-center justify-center p-4">
                <p className="text-sm font-black text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text group-hover:from-cyan-500 group-hover:to-purple-500 transition-all">
                  Click to Start
                </p>
              </div>
            </div>
          </div>

          <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-gray-400 animate-bounce whitespace-nowrap">
            👆 Click the bot to begin
          </p>
        </div>

        {/* Language badges */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {LANGUAGES.map(l => (
            <span key={l.code} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
              {l.flag} {l.label}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .landing-float { animation: landingFloat 3s ease-in-out infinite; }
        @keyframes landingFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1', type: 'bot',
      content: "👋 Welcome to MediBot! I'm your AI healthcare companion.\n\n🎤 Click a language mic button in the sidebar to speak, or type below.\n\n⚡ Or tap a symptom card to get started!",
      timestamp: new Date(),
    },
  ]);

  const [inputValue,    setInputValue]    = useState('');
  const [language,      setLanguage]      = useState('en');
  const [loading,       setLoading]       = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [showEmergency, setShowEmergency] = useState(false);
  const [mounted,       setMounted]       = useState(false);
  const [listeningLang, setListeningLang] = useState<string | null>(null);
  const [isSpeaking,    setIsSpeaking]    = useState(false);
  const [lipOpen,       setLipOpen]       = useState(false);
  const [leftEyePos,    setLeftEyePos]    = useState({ x: 0, y: 0 });
  const [rightEyePos,   setRightEyePos]   = useState({ x: 0, y: 0 });
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'Fever & Cough Consultation', timestamp: new Date() },
    { id: '2', title: 'Headache Relief Tips',        timestamp: new Date(Date.now() - 3600000) },
    { id: '3', title: 'Stomach Pain Advice',         timestamp: new Date(Date.now() - 7200000) },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const botRef         = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const lipIntervalRef = useRef<any>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!botRef.current) return;
      const { left, top, width, height } = botRef.current.getBoundingClientRect();
      const angle = Math.atan2(e.clientY - (top + height / 2), e.clientX - (left + width / 2));
      const pos = { x: Math.cos(angle) * 6, y: Math.sin(angle) * 6 };
      setLeftEyePos(pos);
      setRightEyePos(pos);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // ✅ Lip flicker animation when speaking
  useEffect(() => {
    if (isSpeaking) {
      lipIntervalRef.current = setInterval(() => setLipOpen(p => !p), 140);
    } else {
      clearInterval(lipIntervalRef.current);
      setLipOpen(false);
    }
    return () => clearInterval(lipIntervalRef.current);
  }, [isSpeaking]);

  const formatTime = (date: Date) => {
    if (!mounted) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ✅ Robot speaks using browser Web Speech API — no backend change needed
  const speakText = (text: string, lang: string = language) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance        = new SpeechSynthesisUtterance(text);
    utterance.lang         = VOICE_LANG_MAP[lang] || 'en-IN';
    utterance.rate         = 0.92;
    utterance.pitch        = 1.1;
    utterance.onstart      = () => setIsSpeaking(true);
    utterance.onend        = () => setIsSpeaking(false);
    utterance.onerror      = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // ✅ Mic — listens and auto sends


// ... inside your component:

const startListeningInLanguage = (langCode: string) => {
  if (typeof window === 'undefined') return;

  // If already listening, stop
  if (listeningLang === langCode) {
    recognitionRef.current?.stop();
    setListeningLang(null);
    return;
  }

  // Stop any previous listening
  if (recognitionRef.current) {
    recognitionRef.current.stop();
  }

  // Start new recognition
  const recognition = startVoiceRecognition(
    langCode,
    // onResult - when user finishes speaking
    (transcript: string) => {
      console.log(`Got transcript: ${transcript}`);
      setInputValue(transcript);
      setListeningLang(null);
      setTimeout(() => {
        sendMessage(transcript, langCode);
      }, 500);
    },
    // onError - if something goes wrong
    (error: string) => {
      console.error(error);
      setListeningLang(null);
    },
    // onStart - when listening begins
    () => {
      setListeningLang(langCode);
      setLanguage(langCode);
    },
    // onEnd - when listening stops
    () => {
      setListeningLang(null);
    }
  );

  recognitionRef.current = recognition;
};

  // ✅ Send message to backend and get reply fast
  const sendMessage = async (text: string, lang: string = language) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(), type: 'user',
      content: text, timestamp: new Date(), language: lang,
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res  = await fetch(`${API_BASE_URL}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, language: lang }),
      });
      const data = await res.json();

      if (data.success) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(), type: 'bot',
          content: data.reply, timestamp: new Date(),
          isEmergency: data.is_emergency, language: lang,
        };
        setMessages(prev => [...prev, botMsg]);

        // ✅ Robot speaks the reply — pure browser, no backend needed
        setTimeout(() => speakText(data.reply, lang), 300);

        if (data.is_emergency) {
          setShowEmergency(true);
          setTimeout(() => setShowEmergency(false), 8000);
        }
      }
    } catch (err) {
      console.error('API error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(), type: 'bot',
        content: '⚠️ Could not connect to backend. Make sure it is running on port 3001.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setMessages([{ id: '1', type: 'bot', content: '👋 How can I help you today?', timestamp: new Date() }]);
    setConversations(prev => [
      { id: Date.now().toString(), title: 'New Conversation', timestamp: new Date() },
      ...prev,
    ]);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* ══ SIDEBAR ══════════════════════════════════════════ */}
      <div className={`flex-shrink-0 h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 z-50 overflow-hidden ${sidebarOpen ? 'w-72' : 'w-0 border-r-0'}`}>
        <div className="w-72 h-full overflow-y-auto flex flex-col">

          {/* Logo */}
          <div className="p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">MediBot</h1>
                  <p className="text-xs text-gray-500">Healthcare AI</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* New Chat */}
          <div className="px-4 py-4 flex-shrink-0">
            <button onClick={newChat} className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/40 text-white hover:from-cyan-500/40 hover:to-blue-500/40 transition-all flex items-center justify-center gap-2 font-medium group">
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              New Chat
            </button>
          </div>

          {/* ✅ Voice Language Buttons */}
          <div className="px-4 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">🎤 Tap to Speak</p>
            <div className="space-y-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => startListeningInLanguage(lang.code)}
                  className={`w-full relative py-3 px-4 rounded-xl border transition-all flex items-center justify-between text-sm font-medium overflow-hidden ${
                    listeningLang === lang.code
                      ? 'bg-red-500/30 border-red-400 text-white shadow-lg shadow-red-500/30'
                      : language === lang.code
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/30'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {listeningLang === lang.code
                      ? <MicOff size={16} className="text-red-300" />
                      : <Mic size={16} className={language === lang.code ? 'text-cyan-400' : 'text-gray-400'} />
                    }
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </div>
                  {listeningLang === lang.code && (
                    <>
                      <span className="text-xs text-red-300 animate-pulse">Listening...</span>
                      <span className="absolute inset-0 rounded-xl animate-pulse bg-red-400/10" />
                    </>
                  )}
                  {language === lang.code && listeningLang !== lang.code && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Chats */}
          <div className="px-4 mt-6 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">Recent Chats</p>
            <div className="space-y-1">
              {conversations.map(conv => (
                <button key={conv.id} className="w-full text-left px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition-all text-xs truncate group relative">
                  <MessageCircle size={12} className="inline mr-2 opacity-60" />
                  {conv.title}
                  <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-6" />

          {/* Account */}
          <div className="border-t border-white/10 p-4 space-y-3 flex-shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">m.p.sudarsan</p>
                <p className="text-xs text-gray-400">Free Plan</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all flex items-center justify-center gap-2 text-sm">
                <Settings size={14} /> Settings
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-200 transition-all flex items-center justify-center gap-2 text-sm">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ══ MAIN CONTENT ═════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 min-w-0">

        {/* Emergency */}
        {showEmergency && (
          <div className="fixed top-4 right-4 z-50 animate-bounce">
            <div className="bg-gradient-to-br from-red-600/50 to-orange-600/50 backdrop-blur-xl border border-red-500/60 rounded-xl p-4 max-w-sm shadow-2xl shadow-red-500/40">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-300 animate-pulse mt-1" />
                <div>
                  <p className="font-bold text-red-200">🚨 EMERGENCY ALERT</p>
                  <p className="text-sm text-red-100 mt-1">Call 108 immediately!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STICKY HEADER ────────────────────────────────── */}
        <div className="flex-shrink-0 relative border-b border-white/10 bg-gradient-to-r from-slate-900/90 via-blue-950/80 to-slate-900/90 backdrop-blur-xl overflow-hidden">

          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[1,2,3,4,5].map(i => <div key={i} className={`particle particle-${i}`} />)}
          </div>

          {/* ECG */}
          <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden opacity-25 pointer-events-none">
            <svg viewBox="0 0 1200 32" className="w-full h-full ecg-line" preserveAspectRatio="none">
              <polyline points="0,16 80,16 100,4 120,28 140,4 160,28 180,16 240,16 260,16 280,4 300,28 320,4 340,28 360,16 420,16 440,16 460,4 480,28 500,4 520,28 540,16 600,16 620,16 640,4 660,28 680,4 700,28 720,16 780,16 800,16 820,4 840,28 860,4 880,28 900,16 960,16 980,16 1000,4 1020,28 1040,4 1060,28 1080,16 1200,16"
                fill="none" stroke="#06b6d4" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative px-6 py-4 flex items-center justify-between gap-4">

            {/* Left */}
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0">
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 bg-clip-text text-transparent whitespace-nowrap">
                    Healthcare Assistant
                  </h2>
                  <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                  <Activity size={10} className="text-cyan-400 flex-shrink-0" />
                  {listeningLang
                    ? `🎤 Listening in ${LANGUAGES.find(l => l.code === listeningLang)?.name}...`
                    : isSpeaking
                    ? '🔊 Bot is speaking...'
                    : `Ready · ${LANGUAGES.find(l => l.code === language)?.name}`
                  }
                </p>
              </div>
            </div>

            {/* Centre badges */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-300 text-xs">
                <Heart size={11} className="animate-pulse" /> 24/7
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
                <Shield size={11} /> Secure
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
                <Stethoscope size={11} /> AI Doctor
              </div>
            </div>

            {/* ✅ Robot with lip movement */}
            <div ref={botRef} className="relative flex-shrink-0">
              {/* Rope */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-400/40 to-cyan-400 rounded-full" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-md shadow-cyan-400" />
              </div>

              {/* Speaking badge */}
              {isSpeaking && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 z-20 whitespace-nowrap">
                  <Volume2 size={10} className="text-cyan-300 animate-pulse" />
                  <span className="text-xs text-cyan-300">Speaking...</span>
                </div>
              )}

              <div className="robot-hang mt-3 relative w-28 h-36">

                {/* Antenna */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1.5 h-7 bg-gradient-to-t from-blue-500 via-cyan-400 to-blue-300 rounded-full shadow-md shadow-blue-400/60">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full animate-pulse shadow-xl shadow-blue-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full opacity-80" />
                  </div>
                </div>

                {/* Body */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-28 rounded-2xl overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-200 border-2 border-white/60 shadow-2xl shadow-blue-400/50">

                  {/* Face */}
                  <div className="w-full h-16 bg-gradient-to-b from-gray-100 to-white flex flex-col items-center justify-center relative rounded-t-2xl">
                    <div className="absolute inset-2 bg-gradient-to-br from-gray-900 to-black rounded-xl" />
                    {/* Eyes */}
                    <div className="relative z-10 flex gap-3 mb-2">
                      {[leftEyePos, rightEyePos].map((pos, i) => (
                        <div key={i} className="relative w-6 h-6 bg-gradient-to-br from-white to-cyan-100 rounded-full shadow-lg shadow-cyan-400/80 flex items-center justify-center overflow-hidden border-2 border-white/60">
                          <div className="w-2.5 h-2.5 bg-black rounded-full transition-all duration-100" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} />
                          <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                        </div>
                      ))}
                    </div>
                    {/* ✅ Lip — open/close when speaking */}
                    <div className="relative z-10">
                      {isSpeaking ? (
                        <div className="border-2 border-cyan-300 rounded-full transition-all duration-100 shadow-md shadow-cyan-300/50"
                          style={{
                            width:      lipOpen ? '20px' : '12px',
                            height:     lipOpen ? '12px' : '3px',
                            background: lipOpen ? 'rgba(6,182,212,0.35)' : 'transparent',
                          }}
                        />
                      ) : (
                        <div className="w-8 h-2 border-b-2 border-cyan-300 rounded-b-full shadow-md shadow-cyan-300/50" />
                      )}
                    </div>
                  </div>

                  {/* Chest */}
                  <div className="w-full h-7 bg-gradient-to-b from-gray-200 to-gray-100 flex items-center justify-center gap-1.5 px-2">
                    <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-ping' : 'bg-green-400 animate-pulse'}`} />
                    <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-400 animate-ping' : 'bg-blue-400 animate-pulse'}`} style={{ animationDelay: '0.2s' }} />
                    <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-purple-400 animate-ping' : 'bg-purple-400 animate-pulse'}`} style={{ animationDelay: '0.4s' }} />
                    <div className="ml-1 w-7 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-50" />
                  </div>

                  {/* Arms */}
                  <div className="w-full h-5 bg-gradient-to-b from-gray-100 to-gray-50 flex items-center justify-between px-3">
                    <div className="flex items-center gap-0.5">
                      <div className="w-2 h-3 bg-gray-400 rounded-sm" />
                      <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full" />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full" />
                      <div className="w-2 h-3 bg-gray-400 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Glow halo */}
                <div className={`absolute inset-0 rounded-2xl blur-2xl animate-pulse transition-all duration-500 ${isSpeaking ? 'bg-gradient-to-br from-cyan-400/50 to-blue-400/40' : 'bg-gradient-to-br from-blue-400/25 to-cyan-300/15'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* ── MESSAGES ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-lg px-5 py-4 rounded-2xl backdrop-blur-md border transition-all ${
                msg.type === 'user'
                  ? 'bg-gradient-to-br from-cyan-500/50 to-blue-500/50 border-cyan-400/50 text-white shadow-lg shadow-cyan-500/20'
                  : msg.isEmergency
                  ? 'bg-gradient-to-br from-red-600/40 to-orange-600/40 border-red-400/40 text-white shadow-lg shadow-red-500/20'
                  : 'bg-gradient-to-br from-white/15 to-white/5 border-white/20 text-gray-100'
              }`}>
                {msg.isEmergency && <p className="text-sm font-bold text-red-200 mb-2">🚨 EMERGENCY</p>}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <p className="text-xs opacity-50" suppressHydrationWarning>{formatTime(msg.timestamp)}</p>
                  {msg.language && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 opacity-70">
                      {LANGUAGES.find(l => l.code === msg.language)?.flag}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-3">
                <Loader className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-sm text-gray-300">MediBot is analyzing...</span>
              </div>
            </div>
          )}

          {/* Symptom grid — shown only on welcome screen */}
          {messages.length <= 1 && (
            <div className="mt-6">
              <p className="text-xs text-gray-400 mb-4 font-semibold uppercase tracking-widest text-center flex items-center gap-2">
                <span className="flex-1 h-px bg-white/10" />
                ⚡ Quick Symptom Select
                <span className="flex-1 h-px bg-white/10" />
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {SYMPTOMS.map(s => (
                  <button key={s.id} onClick={() => sendMessage(s.label)} disabled={loading}
                    className={`${s.glowClass} h-24 rounded-2xl bg-black/50 backdrop-blur-md flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 group`}>
                    <p className="text-3xl group-hover:scale-125 transition-transform duration-300">{s.emoji}</p>
                    <p className="text-xs font-bold text-white mt-2 text-center px-2 leading-tight">{s.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT BAR ─────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-white/10 px-6 py-4 bg-gradient-to-t from-slate-950/90 to-transparent backdrop-blur-md">

          {/* Listening wave */}
          {listeningLang && (
            <div className="mb-3 flex items-center gap-3 px-4 py-2 rounded-xl bg-red-500/10 border border-red-400/30">
              <div className="flex gap-1 items-end">
                {[0,0.1,0.2,0.15,0.05].map((d, i) => (
                  <div key={i} className="w-1 bg-red-400 rounded-full animate-bounce" style={{ height: `${12 + i * 4}px`, animationDelay: `${d}s` }} />
                ))}
              </div>
              <span className="text-sm text-red-300 font-medium">
                Listening in {LANGUAGES.find(l => l.code === listeningLang)?.name}...
              </span>
              <span className="ml-auto text-xs text-gray-500">speak clearly</span>
            </div>
          )}

          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(inputValue)}
              placeholder={listeningLang ? '🎤 Listening...' : 'Type your health concern or use voice...'}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 transition-all"
            />

            {/* Send */}
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={loading || !inputValue.trim()}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/60 to-blue-500/60 hover:from-cyan-400/80 hover:to-blue-400/80 border border-cyan-400/40 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-cyan-500/20 flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            🎤 Tap language in sidebar to speak · 🔊 Bot replies in your language · Works on Chrome/Edge
          </p>
        </div>
      </div>

      {/* ── ALL STYLES ───────────────────────────────────────── */}
      <style jsx>{`
        .robot-hang{animation:robotSwing 4s ease-in-out infinite;transform-origin:top center}
        @keyframes robotSwing{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}

        .ecg-line{animation:ecgScroll 4s linear infinite}
        @keyframes ecgScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        .particle{position:absolute;border-radius:50%;animation:floatP linear infinite;opacity:0.35}
        .particle-1{width:5px;height:5px;background:#06b6d4;left:8%;animation-duration:7s;animation-delay:0s}
        .particle-2{width:4px;height:4px;background:#a855f7;left:22%;animation-duration:9s;animation-delay:1s}
        .particle-3{width:5px;height:5px;background:#3b82f6;left:48%;animation-duration:8s;animation-delay:2s}
        .particle-4{width:3px;height:3px;background:#ec4899;left:68%;animation-duration:10s;animation-delay:0.5s}
        .particle-5{width:5px;height:5px;background:#84cc16;left:84%;animation-duration:6s;animation-delay:1.5s}
        @keyframes floatP{0%{bottom:-10px;opacity:0}10%{opacity:0.35}90%{opacity:0.35}100%{bottom:100%;opacity:0}}

        @keyframes eGCyan   {0%,100%{box-shadow:0 0 8px #06b6d4,0 0 16px #06b6d4,0 0 24px #06b6d4}50%{box-shadow:0 0 16px #06b6d4,0 0 24px #06b6d4,0 0 36px #06b6d4}}
        @keyframes eGPurple {0%,100%{box-shadow:0 0 8px #a855f7,0 0 16px #a855f7,0 0 24px #a855f7}50%{box-shadow:0 0 16px #a855f7,0 0 24px #a855f7,0 0 36px #a855f7}}
        @keyframes eGYellow {0%,100%{box-shadow:0 0 8px #eab308,0 0 16px #eab308,0 0 24px #eab308}50%{box-shadow:0 0 16px #eab308,0 0 24px #eab308,0 0 36px #eab308}}
        @keyframes eGRed    {0%,100%{box-shadow:0 0 8px #dc2626,0 0 16px #dc2626,0 0 24px #dc2626}50%{box-shadow:0 0 16px #dc2626,0 0 24px #dc2626,0 0 36px #dc2626}}
        @keyframes eGBlue   {0%,100%{box-shadow:0 0 8px #3b82f6,0 0 16px #3b82f6,0 0 24px #3b82f6}50%{box-shadow:0 0 16px #3b82f6,0 0 24px #3b82f6,0 0 36px #3b82f6}}
        @keyframes eGRose   {0%,100%{box-shadow:0 0 8px #e11d48,0 0 16px #e11d48,0 0 24px #e11d48}50%{box-shadow:0 0 16px #e11d48,0 0 24px #e11d48,0 0 36px #e11d48}}
        @keyframes eGPink   {0%,100%{box-shadow:0 0 8px #ec4899,0 0 16px #ec4899,0 0 24px #ec4899}50%{box-shadow:0 0 16px #ec4899,0 0 24px #ec4899,0 0 36px #ec4899}}
        @keyframes eGIndigo {0%,100%{box-shadow:0 0 8px #6366f1,0 0 16px #6366f1,0 0 24px #6366f1}50%{box-shadow:0 0 16px #6366f1,0 0 24px #6366f1,0 0 36px #6366f1}}
        @keyframes eGOrange {0%,100%{box-shadow:0 0 8px #f97316,0 0 16px #f97316,0 0 24px #f97316}50%{box-shadow:0 0 16px #f97316,0 0 24px #f97316,0 0 36px #f97316}}
        @keyframes eGLime   {0%,100%{box-shadow:0 0 8px #84cc16,0 0 16px #84cc16,0 0 24px #84cc16}50%{box-shadow:0 0 16px #84cc16,0 0 24px #84cc16,0 0 36px #84cc16}}

        .glow-cyan   {border:2px solid #06b6d4;animation:eGCyan   2s ease-in-out infinite}
        .glow-purple {border:2px solid #a855f7;animation:eGPurple 2s ease-in-out infinite}
        .glow-yellow {border:2px solid #eab308;animation:eGYellow 2s ease-in-out infinite}
        .glow-red    {border:2px solid #dc2626;animation:eGRed    2s ease-in-out infinite}
        .glow-blue   {border:2px solid #3b82f6;animation:eGBlue   2s ease-in-out infinite}
        .glow-rose   {border:2px solid #e11d48;animation:eGRose   2s ease-in-out infinite}
        .glow-pink   {border:2px solid #ec4899;animation:eGPink   2s ease-in-out infinite}
        .glow-indigo {border:2px solid #6366f1;animation:eGIndigo 2s ease-in-out infinite}
        .glow-orange {border:2px solid #f97316;animation:eGOrange 2s ease-in-out infinite}
        .glow-lime   {border:2px solid #84cc16;animation:eGLime   2s ease-in-out infinite}

        button:hover.glow-cyan   {animation:eGCyan   1s ease-in-out infinite}
        button:hover.glow-purple {animation:eGPurple 1s ease-in-out infinite}
        button:hover.glow-yellow {animation:eGYellow 1s ease-in-out infinite}
        button:hover.glow-red    {animation:eGRed    1s ease-in-out infinite}
        button:hover.glow-blue   {animation:eGBlue   1s ease-in-out infinite}
        button:hover.glow-rose   {animation:eGRose   1s ease-in-out infinite}
        button:hover.glow-pink   {animation:eGPink   1s ease-in-out infinite}
        button:hover.glow-indigo {animation:eGIndigo 1s ease-in-out infinite}
        button:hover.glow-orange {animation:eGOrange 1s ease-in-out infinite}
        button:hover.glow-lime   {animation:eGLime   1s ease-in-out infinite}

        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
        ::-webkit-scrollbar-thumb{background:rgba(34,211,238,0.25);border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(34,211,238,0.5)}
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT — shows Landing first, then Dashboard
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [ready, setReady] = useState(false);
  return ready ? <Dashboard /> : <LandingPage onEnter={() => setReady(true)} />;
}