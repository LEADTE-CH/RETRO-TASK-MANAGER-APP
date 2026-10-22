import { Task, UserStats } from '../types';

export class VoiceAssistantEngine {
  private recognition: any = null;
  public isListening: boolean = false;
  public isSpeaking: boolean = false;
  public speechSupported: boolean = false;
  public micSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.micSupported = true;
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
      if ('speechSynthesis' in window) {
        this.speechSupported = true;
      }
    }
  }

  // Listen from microphone
  public listen(
    onResult: (transcript: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): () => void {
    if (!this.recognition) {
      onError('Microphone speech recognition is not supported in this browser.');
      return () => {};
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Speech capture failed');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      onError(e.message || 'Could not start microphone');
    }

    return () => {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    };
  }

  // Speak text using speech synthesis
  public speak(text: string, onEnd?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active utterances

    // Clean markdown/emojis for cleaner speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/[👾⚔️👑🛡️🔥🧭⏰✔]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && !v.name.includes('Google'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Send grounded question to assistant
  public async askAssistant(
    question: string,
    tasks: Task[],
    stats: UserStats,
    username: string
  ): Promise<{ reply: string; isOfflineFallback: boolean }> {
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, tasks, stats, username }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        reply: data.reply || 'No response from Quest Master.',
        isOfflineFallback: Boolean(data.isOfflineFallback),
      };
    } catch {
      // Deterministic client-side offline fallback
      return {
        reply: this.clientDeterministicFallback(question, tasks, stats),
        isOfflineFallback: true,
      };
    }
  }

  private clientDeterministicFallback(question: string, tasks: Task[], stats: UserStats): string {
    const q = question.toLowerCase();
    const activeTasks = tasks.filter((t) => !t.isCompleted);
    const todayStr = new Date().toISOString().split('T')[0];
    const dueToday = activeTasks.filter((t) => t.dueDate === todayStr);
    const overdue = activeTasks.filter((t) => t.dueDate && t.dueDate < todayStr);
    const q1 = activeTasks.filter((t) => t.isUrgent && t.isImportant);

    if (q.includes('next') || q.includes('what should i do') || q.includes('recommend')) {
      if (q1.length > 0) {
        return `[OFFLINE RADAR] Priority target detected: "${q1[0].title}" (Quadrant 1: Urgent & Important, Priority ${q1[0].priority.toUpperCase()}). Tackle this next to maximize XP!`;
      }
      if (overdue.length > 0) {
        return `[OFFLINE RADAR] Warning: ${overdue.length} overdue quest(s) need your immediate attention! Top priority: "${overdue[0].title}".`;
      }
      if (dueToday.length > 0) {
        return `[OFFLINE RADAR] Next scheduled today: "${dueToday[0].title}". Ready for a 25m Focus Session?`;
      }
      if (activeTasks.length > 0) {
        return `[OFFLINE RADAR] Recommended quest from your active backlog: "${activeTasks[0].title}".`;
      }
      return `[OFFLINE RADAR] All quests completed! Check back later or forge a new quest!`;
    }

    if (q.includes('today')) {
      if (dueToday.length === 0) return `[OFFLINE RADAR] No quests due today. You have ${activeTasks.length} active backlog quests.`;
      return `[OFFLINE RADAR] ${dueToday.length} quest(s) due today:\n${dueToday.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`;
    }

    return `[OFFLINE RADAR] Hero Status: Level ${stats.level} | ${activeTasks.length} Active Quests | ${stats.streakDays} Day Streak. Ask for recommendations, today's schedule, or matrix summary!`;
  }
}

export const voiceAssistant = new VoiceAssistantEngine();
