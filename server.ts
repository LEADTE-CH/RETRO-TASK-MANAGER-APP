import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// Health / Status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'PixelQuest Task Manager Server',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Download Project Zip Archive endpoint
app.get('/api/download', (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'pixelquest-task-manager.zip');
  res.download(zipPath, 'pixelquest-task-manager.zip', (err) => {
    if (err) {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download zip archive' });
      }
    }
  });
});

// Grounded Task-Aware AI Assistant
app.post('/api/assistant', async (req: Request, res: Response) => {
  try {
    const { question, tasks, stats, focusSessions, username } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Deterministic fallback response when no API key is provided
      return res.json({
        reply: generateDeterministicAssistantResponse(question, tasks || [], stats || {}),
        isOfflineFallback: true,
        model: 'retro-deterministic-engine',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format tasks summary for context
    const taskSummary = (tasks || []).slice(0, 30).map((t: any) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      category: t.category,
      isCompleted: t.isCompleted,
      dueDate: t.dueDate,
      dueTime: t.dueTime,
      isUrgent: t.isUrgent,
      isImportant: t.isImportant,
      matrixQuadrant: t.matrixQuadrant,
      estimatedMinutes: t.estimatedMinutes,
    }));

    const systemPrompt = `You are "8-BIT COMPANION" (or "QUEST MASTER"), the grounded productivity AI assistant inside PixelQuest Task Manager.
The user is ${username || 'Hero'}.
Here is the user's current live quest/task data in JSON:
${JSON.stringify(taskSummary, null, 2)}

User productivity stats:
${JSON.stringify(stats || {}, null, 2)}

Personality & Formatting Guidelines:
1. Speak in a delightfully crisp, retro RPG guide tone (using occasional gaming terms like "Quest", "XP", "Boss", "Buff", "Inventory", but stay deeply practical and helpful).
2. Ground all answers strictly in the provided task data. If asked about today's tasks, deadlines, priorities, or recommendations, check the actual tasks in the context.
3. Be concise and scannable! Use short bullet points or clear 1-3 sentence answers so it reads like retro RPG dialog boxes.
4. If the user asks for suggestions or what to tackle next, use the Eisenhower matrix logic (Prioritize Q1: Urgent & Important, then Q2: Important & Non-Urgent) and recommend 1-3 specific quests.
5. If the user asks something unrelated to their tasks or productivity, gently steer them back to their quest log.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Question: ${question}` }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });

    const reply = response.text || "No response generated from the Quest Master.";
    return res.json({
      reply,
      isOfflineFallback: false,
      model: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error in /api/assistant:', error);
    // Graceful deterministic fallback on API error
    const fallback = generateDeterministicAssistantResponse(
      req.body?.question || '',
      req.body?.tasks || [],
      req.body?.stats || {}
    );
    return res.json({
      reply: `${fallback}\n\n[Note: Comm link to server experienced interference; retro local coprocessor answered.]`,
      isOfflineFallback: true,
      errorDetails: error?.message || 'Server error',
    });
  }
});

// Deterministic rule-based assistant fallback
function generateDeterministicAssistantResponse(
  question: string,
  tasks: any[],
  stats: any
): string {
  const q = question.toLowerCase();
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const todayStr = new Date().toISOString().split('T')[0];
  const dueToday = activeTasks.filter((t) => t.dueDate === todayStr);
  const urgentImportant = activeTasks.filter((t) => t.isUrgent && t.isImportant);
  const overdue = activeTasks.filter((t) => t.dueDate && t.dueDate < todayStr);

  if (q.includes('what should i do') || q.includes('next') || q.includes('recommend') || q.includes('priority')) {
    if (urgentImportant.length > 0) {
      const top = urgentImportant[0];
      return `CRITICAL QUEST DETECTED: "${top.title}" [Quadrant 1: Urgent & Important, Priority: ${top.priority.toUpperCase()}]. Tackling this will grant +${top.estimatedMinutes ? Math.max(15, top.estimatedMinutes * 2) : 25} XP and protect your HP!`;
    }
    if (overdue.length > 0) {
      return `WARNING: You have ${overdue.length} overdue quest(s)! Top alert: "${overdue[0].title}". Clear this dungeon room first to preserve your streak!`;
    }
    if (dueToday.length > 0) {
      return `TODAY'S CAMPAIGN: You have ${dueToday.length} quest(s) due today. Next recommended: "${dueToday[0].title}".`;
    }
    if (activeTasks.length > 0) {
      return `ACTIVE QUEST LOG: You have ${activeTasks.length} active quest(s). Recommended pick: "${activeTasks[0].title}". Let's start a 25m Focus Session!`;
    }
    return `ALL QUESTS CLEARED! Your quest log is empty. Take a rest at the inn or forge a new quest with the [Create Task] button!`;
  }

  if (q.includes('today') || q.includes('due today')) {
    if (dueToday.length === 0) {
      return `No quests strictly scheduled for today (${todayStr})! You have ${activeTasks.length} backlog quests available.`;
    }
    const titles = dueToday.map((t, idx) => `${idx + 1}. ${t.title} (${t.priority})`).join('\n');
    return `TODAY'S SCHEDULE (${dueToday.length} Quests):\n${titles}`;
  }

  if (q.includes('overdue') || q.includes('late')) {
    if (overdue.length === 0) {
      return `ZERO OVERDUE QUESTS! Your radar is clear and your quest timing is pristine!`;
    }
    const titles = overdue.map((t, idx) => `${idx + 1}. ${t.title} (Due: ${t.dueDate})`).join('\n');
    return `OVERDUE WARNING (${overdue.length} Quests):\n${titles}`;
  }

  if (q.includes('stat') || q.includes('level') || q.includes('xp') || q.includes('streak')) {
    return `HERO STATUS:\n• Level: ${stats.level || 1}\n• XP: ${stats.xp || 0} / ${stats.xpToNextLevel || 100}\n• Streak: ${stats.streakDays || 1} day(s)\n• Completed Quests: ${completedTasks.length}\n• Active Quests: ${activeTasks.length}`;
  }

  if (q.includes('matrix') || q.includes('eisenhower') || q.includes('quadrant')) {
    const q1 = activeTasks.filter(t => t.isUrgent && t.isImportant).length;
    const q2 = activeTasks.filter(t => !t.isUrgent && t.isImportant).length;
    const q3 = activeTasks.filter(t => t.isUrgent && !t.isImportant).length;
    const q4 = activeTasks.filter(t => !t.isUrgent && !t.isImportant).length;
    return `EISENHOWER RADAR:\n• Q1 (Do First - Urgent & Important): ${q1}\n• Q2 (Schedule - Important): ${q2}\n• Q3 (Delegate - Urgent): ${q3}\n• Q4 (Eliminate - Neither): ${q4}`;
  }

  return `GREETINGS HERO! I have scanned your ${activeTasks.length} active quests. Ask me "What should I do next?", "What is due today?", "Show my stats", or "Review my Matrix"!`;
}

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PixelQuest Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
