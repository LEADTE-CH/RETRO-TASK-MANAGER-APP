# PixelQuest - Retro Pixel Task Manager

A cross-platform productivity console designed in an authentic **Retro Pixel Console** aesthetic, featuring local-first durable persistence, Eisenhower matrix prioritization, Pomodoro focus chamber, gamified RPG leveling, grounded AI task assistance with voice capabilities, and safe synchronization with Supabase.

Web Address: [pixelquesttaskmanager.com](https://pixelquesttaskmanager.com)

---

## 🎮 Core Capabilities & Flows

1. **Local-First & Offline Durability**:
   - Every creation, edit, completion, or deletion writes synchronously to durable local storage.
   - Operations are queued in a restart-safe FIFO sync queue (`pixelquest_sync_queue_v1`).
   - Automatically synchronizes with Supabase when online using Last-Write-Wins (LWW) conflict resolution.

2. **Eisenhower Decision Matrix (4-Quadrant Strategy)**:
   - **Quadrant 1 (Do First)**: Urgent & Important (Boss Battles & Crises).
   - **Quadrant 2 (Schedule)**: Not Urgent & Important (Strategic Growth & Deep Work).
   - **Quadrant 3 (Delegate)**: Urgent & Not Important (Interrupts & Quick Handoffs).
   - **Quadrant 4 (Don't Do / Eliminate)**: Not Urgent & Not Important (Distractions).
   - Responsive 2x2 desktop grid and stacked/tabbed layout for mobile devices.

3. **Daily Quest Bounty (24-Hour Task Review)**:
   - Rewards heroes with bonus XP once every 24 hours for opening the app and inspecting their active quest backlog.
   - **Check-in Streak Scaling**: Earns base +35 XP plus an extra +5 XP per consecutive day checked in (up to +60 XP total) and restores +10 HP stamina.
   - **Live 24-Hour Reset Countdown**: Displays a live countdown timer until the next midnight reset (`Resets in: HH:MM:SS`).
   - Interactive claim button with 8-bit fanfare and celebration confetti, and quick shortcut to review active tasks.

4. **Chrono Focus Chamber & Gamified Focus Stats**:
   - Configurable 25m Focus, 5m Short Break, and 15m Long Break intervals.
   - **Background-safe elapsed-time tracking**: Uses delta calculations from target epoch timestamps (`Date.now()`) to prevent timer slowdowns when browser tabs are in the background.
   - **'Focus Streak Counter'**: Tracks consecutive completed focus sessions without quitting. Displays retro animated pixel flames, combo multipliers (`3x COMBO BUFF`), and best streak record.
   - **'Total Focus Time Meter'**: Arcade battery/mana meter accumulating total minutes and awarding Chrono Titles (*Initiate Chronomancer*, *Time Adept*, *Focus Knight*, *Chrono Grandmaster*, *Time Lord*).
   - **'Planned Focus Completion Ratio'**: Percentage meter tracking successfully finished sessions vs abandoned attempts.
   - Completion feedback prompt without auto-completing tasks.
   - Real-time session history log with duration and quest references.

4. **Achievement Badges System & Cross-Device Synchronization**:
   - Distinct pixel-art badge crests with stepped 8-bit corners, tier borders (Bronze, Silver, Gold, Platinum), and clear unlock criteria:
     - ⚔️ **First Task Completed** (*Bronze*): Complete your first quest from the active log.
     - 🛡️ **10 Tasks Completed** (*Silver*): Prove dedication by clearing 10 total quests.
     - 🔥 **Perfect Week** (*Gold*): Maintain an unbroken 7-day daily quest streak.
     - ⏳ **Focus Master** (*Gold*): Complete 10 focus sessions or accumulate 250+ focus minutes.
     - 🧭 **Eisenhower Expert** (*Platinum*): Complete tasks in all 4 quadrants (Q1, Q2, Q3, Q4).
     - 🐉 **Dragon Slayer** (*Gold*): Vanquish a Critical (Rank-S) priority boss.
     - 👑 **Grand Paladin Centurion** (*Platinum*): Attain legendary status with 25 completed quests.
   - Badges are showcased in the **User Profile Modal**, the **Stats & Trophy Room**, and synchronized automatically across devices via Supabase.

5. **15-Minute Advance Deadline Alarms**:
   - Web Notification API integration with permission requests.
   - Schedules audio chime and notification 15 minutes before due time.
   - Editing, completing, or deleting a quest automatically cancels or reschedules the alarm without duplicates.
   - Clear fallback indicators for denied or unsupported permissions.

6. **8-Bit Oracle Grounded AI Assistant**:
   - Grounded strictly in the user's live active quest backlog, overdue alerts, and Eisenhower quadrants.
   - Microphonic voice input via Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
   - Speech synthesis read-aloud via `window.speechSynthesis`.
   - Server-side Gemini 3.8 Flash proxy (`/api/assistant`) with immediate local deterministic fallback when offline.

7. **8-Bit Web Audio Synthesizer**:
   - Built with the native Web Audio API (`AudioContext`).
   - Zero external audio MP3/WAV dependencies.
   - Master volume slider, mute toggle, and distinct frequencies for navigation blips, level-up fanfares, alarms, and focus bells.

---

## 🗄️ Supabase Database Setup & RLS

PixelQuest includes complete production-ready PostgreSQL migrations with strict **Row Level Security (RLS)**:

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Go to **CONFIG** (Settings) tab in PixelQuest and click **"COPY SQL SCRIPT"** (or view `src/db/schema.sql.ts`).
3. Paste and run the script in Supabase.
4. Go to **Project Settings > API** in Supabase and copy your:
   - `Project URL`
   - `Anon / Public API Key`
5. Enter them in PixelQuest under **CONFIG > Supabase Cloud Synchronization** and toggle **"Enable Cloud Sync"**.

All tables (`profiles`, `user_stats`, `tasks`, `focus_sessions`, `achievements`) enforce `auth.uid() = user_id`, preventing cross-user access.

---

## ⌨️ Global Keyboard Shortcuts

- `1`: Radar Dashboard
- `2`: Quest Journal
- `3`: Eisenhower Matrix
- `4`: Focus Chamber
- `5`: Hero Stats & Badges
- `6`: 8-Bit Oracle Assistant
- `7`: System Config
- `N`: Forge New Quest
- `Esc`: Close open modal
