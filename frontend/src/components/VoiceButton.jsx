import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Loader } from 'lucide-react';
import clsx from 'clsx';

const LANG_MAP = {
  te: 'te-IN', hi: 'hi-IN', ta: 'ta-IN', kn: 'kn-IN',
  ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-IN'
};

export default function VoiceButton({ onTranscript, lang = 'en' }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState('idle'); // idle | listening | processing
  const recognitionRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) return null; // Hide if unsupported

  const startListening = () => {
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_MAP[lang] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setStatus('listening');

    recognition.onresult = (event) => {
      setStatus('processing');
      const transcript = event.results[0][0].transcript;
      onTranscript?.(transcript);
      setStatus('idle');
    };

    recognition.onerror = () => setStatus('idle');
    recognition.onend = () => setStatus('idle');

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setStatus('idle');
  };

  return (
    <button
      onClick={status === 'listening' ? stopListening : startListening}
      className={clsx(
        'w-14 h-14 rounded-full flex items-center justify-center transition-all',
        'min-h-touch min-w-touch shadow-lg',
        status === 'listening'
          ? 'bg-red-500 text-white animate-pulse'
          : status === 'processing'
          ? 'bg-gray-300 text-gray-500'
          : 'bg-primary-600 text-white active:bg-primary-700'
      )}
      disabled={status === 'processing'}
    >
      {status === 'listening' ? (
        <MicOff size={24} />
      ) : status === 'processing' ? (
        <Loader size={24} className="animate-spin" />
      ) : (
        <Mic size={24} />
      )}
    </button>
  );
}
