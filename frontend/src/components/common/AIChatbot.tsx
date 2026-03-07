import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { chatWithAI } from '../../api/aiApi';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your NagarSetu AI assistant. I can help you with:\n\n\u2022 How to report an issue\n\u2022 Understanding issue categories\n\u2022 Points and rewards system\n\u2022 General questions about the app\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [canUseSTT, setCanUseSTT] = useState(false);
  const [canUseTTS, setCanUseTTS] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognition: any = new SpeechRecognitionClass();
      recognition.lang = 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };
      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
        setInterimTranscript('');
        toast.error('Could not access microphone');
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };
      recognition.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';

        Array.from(event.results).forEach((result: any) => {
          const text = result[0].transcript.trim();
          if (result.isFinal) {
            finalText += `${text} `;
          } else {
            interimText += `${text} `;
          }
        });

        if (finalText.trim()) {
          setInput((prev) => {
            const next = `${prev ? `${prev} ` : ''}${finalText.trim()}`;
            inputRef.current = next;
            return next;
          });
        }
        setInterimTranscript(interimText.trim());

        // restart 3s silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          stopListening(true);
        }, 3000);
      };

      recognitionRef.current = recognition;
      setCanUseSTT(true);
    }

    if ('speechSynthesis' in window) {
      setCanUseTTS(true);
    } else {
      setAutoSpeak(false);
    }

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current?.abort?.();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const detectLanguage = (text: string) => {
    // Basic script-based detection for common languages; fallback to browser default
    const trimmed = text.trim();
    if (/[\u0900-\u097F]/.test(trimmed)) return 'hi-IN'; // Devanagari (Hindi, etc.)
    if (/[\u0980-\u09FF]/.test(trimmed)) return 'bn-IN'; // Bengali
    if (/[\u3040-\u30ff]/.test(trimmed)) return 'ja-JP'; // Japanese
    if (/[\u4e00-\u9fff]/.test(trimmed)) return 'zh-CN'; // Chinese
    if (/[\u0600-\u06FF]/.test(trimmed)) return 'ar-SA'; // Arabic
    if (/[\u0B80-\u0BFF]/.test(trimmed)) return 'ta-IN'; // Tamil
    if (/[\u0C00-\u0C7F]/.test(trimmed)) return 'te-IN'; // Telugu
    if (/[\u0C80-\u0CFF]/.test(trimmed)) return 'kn-IN'; // Kannada
    return navigator.language || 'en-US';
  };

  const toPlainText = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/[_]+/g, '')
      .trim();

  const speakText = (text: string, showWarning = false) => {
    if (!canUseTTS || typeof window === 'undefined') {
      if (showWarning) {
        toast.error('Voice playback not supported');
      }
      return;
    }

    // If already speaking, stop first
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const clean = toPlainText(text);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = detectLanguage(clean);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (!canUseTTS || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSendManual = async (text: string) => {
    if (isLoading || !text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    inputRef.current = '';
    setIsLoading(true);

    try {
      const response = await chatWithAI(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (autoSpeak && canUseTTS) {
        speakText(assistantMessage.content);
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to get response');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I apologize, but I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // set input for UI, then send
    setInput(trimmed);
    inputRef.current = trimmed;
    await handleSendManual(trimmed);
  };

  const stopListening = (autoSubmit = false) => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    recognitionRef.current.abort?.();
    setIsListening(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (autoSubmit) {
      const textToSend = `${inputRef.current} ${interimTranscript}`.trim();
      setInterimTranscript('');
      if (textToSend) {
        sendText(textToSend);
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech-to-text not supported in this browser');
      return;
    }

    if (isListening) {
      stopListening(true);
    } else {
      try {
        recognitionRef.current.start();
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } catch (err) {
        toast.error('Unable to start listening');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendManual(input);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all transform hover:scale-110 ${
          isOpen ? 'hidden' : 'flex items-center justify-center'
        }`}
        aria-label="Open AI Chat"
      >
        <Bot className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-slide-up">
          <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">NagarSetu Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoSpeak((prev) => !prev)}
                disabled={!canUseTTS}
                className="p-1 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                aria-label="Toggle voice playback"
                title={
                  canUseTTS
                    ? autoSpeak
                      ? 'Mute voice replies'
                      : 'Enable voice replies'
                    : 'Voice playback not supported'
                }
              >
                {autoSpeak && canUseTTS ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-primary-700 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' ? 'bg-gray-200' : 'bg-primary-100'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary-600" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 whitespace-pre-wrap text-left">
                      {message.content}
                    </div>
                    {message.role === 'assistant' && canUseTTS && (
                      <button
                        onClick={() =>
                          isSpeaking ? stopSpeech() : speakText(message.content, true)
                        }
                        className="text-primary-600 hover:text-primary-700"
                        title={isSpeaking ? 'Stop voice' : 'Play response'}
                        aria-label={isSpeaking ? 'Stop voice' : 'Play response'}
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={toggleListening}
                disabled={!canUseSTT || isLoading}
                className={`p-2 rounded-lg border border-gray-300 hover:border-primary-500 hover:text-primary-600 transition-colors ${
                  isListening ? 'bg-primary-50 text-primary-700 border-primary-300' : ''
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Toggle voice input"
                title={
                  canUseSTT
                    ? isListening
                      ? 'Stop listening and send'
                      : 'Talk instead of typing'
                    : 'Voice input not supported'
                }
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => handleSendManual(input)}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {interimTranscript && (
              <p className="mt-2 text-xs text-primary-600 italic">
                Listening… {interimTranscript}
              </p>
            )}
            {!canUseSTT && (
              <p className="mt-2 text-xs text-gray-500">
                Voice input is not supported in this browser. Try Chrome or Edge on desktop/mobile.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
