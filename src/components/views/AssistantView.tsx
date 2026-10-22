import React, { useState, useEffect, useRef } from 'react';
import { Task, UserStats, AuthUser } from '../../types';
import { PixelCard, PixelButton, PixelInput } from '../ui/PixelUI';
import { voiceAssistant } from '../../utils/speech';
import { retroAudio } from '../../utils/audio';

interface AssistantViewProps {
  tasks: Task[];
  stats: UserStats;
  user: AuthUser;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isOfflineFallback?: boolean;
}

const QUICK_PROMPTS = [
  'What should I tackle next?',
  'What is due today?',
  'Review my Eisenhower Matrix',
  'Show my hero stats & XP',
  'Do I have any overdue quests?',
];

export const AssistantView: React.FC<AssistantViewProps> = ({
  tasks,
  stats,
  user,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: `GREETINGS HERO ${user.displayName.toUpperCase()}! I am your 8-bit Quest Oracle. I analyze your current quest backlog, deadlines, and Eisenhower Matrix in real time. Speak into your microphone or enter a query below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (questionText: string) => {
    const text = questionText.trim();
    if (!text || isLoading) return;

    retroAudio.playBlip();

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setMicError(null);

    try {
      const response = await voiceAssistant.askAssistant(
        text,
        tasks,
        stats,
        user.displayName
      );

      retroAudio.playSuccess();

      const assistantMsg: Message = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOfflineFallback: response.isOfflineFallback,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (autoSpeak && voiceAssistant.speechSupported) {
        voiceAssistant.speak(response.reply);
      }
    } catch {
      const errorMsg: Message = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        text: 'Communications with the Oracle experienced cosmic interference. All systems operational in local offline mode.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOfflineFallback: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!voiceAssistant.micSupported) {
      setMicError('Microphone speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      voiceAssistant.stopSpeaking();
      setIsListening(false);
      return;
    }

    retroAudio.playBlip();
    setMicError(null);
    setIsListening(true);

    voiceAssistant.listen(
      (transcript) => {
        setIsListening(false);
        handleSend(transcript);
      },
      (error) => {
        setIsListening(false);
        setMicError(`Voice error: ${error}`);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#121824] pixel-border p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[10px] text-[#39ff14] bg-[#0c2412] px-2 py-0.5 border border-[#39ff14]">
              GROUNDED TASK INTELLIGENCE
            </span>
            <span className="font-mono text-xs text-[#94a3b8]">Live Context Sync</span>
          </div>
          <h2 className="font-pixel text-base sm:text-lg text-[#ede4ce] tracking-tight">
            8-BIT QUEST ORACLE
          </h2>
          <p className="font-mono text-xs text-[#94a3b8] mt-1">
            Ask questions grounded strictly in your current quests, due dates, and Eisenhower priorities.
          </p>
        </div>

        {/* Audio / Voice Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              retroAudio.playBlip();
              setAutoSpeak(!autoSpeak);
            }}
            className={`px-2.5 py-1.5 border text-xs font-mono flex items-center gap-1.5 cursor-pointer ${
              autoSpeak
                ? 'border-[#39ff14] text-[#39ff14] bg-[#0c2412]'
                : 'border-[#334155] text-[#64748b] bg-[#0b0e14]'
            }`}
          >
            <span>{autoSpeak ? '🔊' : '🔇'}</span>
            <span className="font-pixel text-[9px]">AUTO-VOICE</span>
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="font-pixel text-[9px] text-[#64748b] whitespace-nowrap pl-1">
          SUGGESTIONS:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 text-xs font-mono bg-[#121824] border border-[#2d3748] text-[#cbd5e1] hover:text-[#39ff14] hover:border-[#39ff14] whitespace-nowrap cursor-pointer transition disabled:opacity-40"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Messages Console Box */}
      <div className="bg-[#0b0e14] pixel-border border-2 border-[#222d3f] p-4 sm:p-6 min-h-[380px] max-h-[480px] overflow-y-auto space-y-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="font-pixel text-[9px] text-[#94a3b8]">
                  {isUser ? `[HERO] ${user.displayName}` : '[ORACLE] QUEST MASTER'}
                </span>
                <span className="font-mono text-[10px] text-[#475569]">
                  {msg.timestamp}
                </span>
                {msg.isOfflineFallback && (
                  <span className="font-pixel text-[8px] bg-[#221708] border border-[#f59e0b] text-[#f59e0b] px-1">
                    OFFLINE ENGINE
                  </span>
                )}
              </div>

              <div
                className={`max-w-xl p-3.5 border-2 text-xs sm:text-sm font-mono leading-relaxed relative ${
                  isUser
                    ? 'bg-[#152538] border-[#38bdf8] text-[#ede4ce] shadow-[2px_2px_0_0_#06090e]'
                    : 'bg-[#121f18] border-[#39ff14] text-[#ede4ce] shadow-[2px_2px_0_0_#06090e]'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Speak button on assistant replies */}
                {!isUser && voiceAssistant.speechSupported && (
                  <div className="mt-2.5 pt-2 border-t border-[#1e3a24] flex items-center justify-between text-[10px]">
                    <span className="text-[#64748b]">Grounded in live quest backlog</span>
                    <button
                      onClick={() => {
                        retroAudio.playBlip();
                        voiceAssistant.speak(msg.text);
                      }}
                      className="text-[#39ff14] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>🔊 Read aloud</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Dialog State */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <span className="font-pixel text-[9px] text-[#39ff14] mb-1">
              [ORACLE] CONSULTING SCROLLS...
            </span>
            <div className="bg-[#121f18] border-2 border-[#39ff14] p-3 text-xs font-pixel text-[#39ff14] animate-retro-pulse flex items-center gap-2">
              <span>👾</span>
              <span>PARSING QUEST COORDINATES & MATRIX...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mic error notice if any */}
      {micError && (
        <div className="p-2 bg-[#290d11] border border-[#ef4444] text-xs font-mono text-[#ef4444] flex items-center justify-between">
          <span>{micError}</span>
          <button onClick={() => setMicError(null)} className="font-pixel text-[10px]">
            ✕
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="flex items-center gap-2"
      >
        {/* Mic Speech Recognition Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`px-3 py-2.5 border-2 text-xs font-pixel flex items-center justify-center cursor-pointer transition ${
            isListening
              ? 'border-[#ef4444] bg-[#3a1318] text-[#ef4444] animate-retro-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]'
              : 'border-[#38bdf8] bg-[#0c202d] text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#0b0e14]'
          }`}
          title={isListening ? 'Listening... click to cancel' : 'Voice input by microphone'}
        >
          <span>{isListening ? '🔴 MIC ON' : '🎤 VOICE'}</span>
        </button>

        {/* Text Input */}
        <div className="flex-1">
          <PixelInput
            placeholder="Ask the Oracle about your quests, deadlines, priority advice..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Send Button */}
        <PixelButton
          type="submit"
          variant="primary"
          disabled={!inputText.trim() || isLoading}
        >
          SEND ▶
        </PixelButton>
      </form>
    </div>
  );
};
