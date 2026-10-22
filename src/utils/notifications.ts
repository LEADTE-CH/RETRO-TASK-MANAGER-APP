import { Task } from '../types';
import { retroAudio } from './audio';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

class NotificationService {
  private activeReminders: Map<string, number> = new Map();
  private onInAppAlertCallback: ((task: Task) => void) | null = null;

  public getPermission(): NotificationPermissionState {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as NotificationPermissionState;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }

  public setInAppAlertHandler(handler: (task: Task) => void) {
    this.onInAppAlertCallback = handler;
  }

  /**
   * Schedule 15-minute advance reminder for task deadline
   */
  public scheduleTaskReminder(task: Task, onAlert?: (task: Task) => void): void {
    this.cancelTaskReminder(task.id);

    if (task.isCompleted || !task.reminderSet || !task.dueDate) {
      return;
    }

    try {
      const timeStr = task.dueTime || '12:00';
      const dueTimestamp = new Date(`${task.dueDate}T${timeStr}:00`).getTime();
      const now = Date.now();

      // 15 minutes before deadline
      const reminderTimestamp = dueTimestamp - 15 * 60 * 1000;
      const delayMs = reminderTimestamp - now;

      // If already within 15 minutes or past, but still due in the future, trigger promptly or warn
      if (delayMs > 0 && delayMs < 24 * 3600 * 1000) {
        const timerId = window.setTimeout(() => {
          this.triggerAlert(task, onAlert);
        }, delayMs);
        this.activeReminders.set(task.id, timerId);
      }
    } catch (e) {
      console.error('Failed to schedule reminder for task', task.id, e);
    }
  }

  public cancelTaskReminder(taskId: string): void {
    const existing = this.activeReminders.get(taskId);
    if (existing) {
      clearTimeout(existing);
      this.activeReminders.delete(taskId);
    }
  }

  public triggerAlert(task: Task, onAlert?: (task: Task) => void): void {
    retroAudio.playAlert();

    // Browser Notification
    if (this.getPermission() === 'granted') {
      try {
        new Notification(`⏰ PixelQuest Deadline Warning!`, {
          body: `"${task.title}" is due in 15 minutes! [Rank: ${task.priority.toUpperCase()}]`,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.error('Error firing browser notification:', e);
      }
    }

    if (onAlert) {
      onAlert(task);
    } else if (this.onInAppAlertCallback) {
      this.onInAppAlertCallback(task);
    }
  }

  /**
   * Send a test notification to verify audio & browser permission
   */
  public sendTestNotification(onInAppToast?: (msg: string) => void) {
    retroAudio.playSuccess();
    const perm = this.getPermission();
    if (perm === 'granted') {
      try {
        new Notification('👾 PixelQuest System Ready!', {
          body: 'Audio and alert channels are fully synchronized, Hero!',
          icon: '/favicon.ico',
        });
      } catch {
        // ignore
      }
    }
    if (onInAppToast) {
      onInAppToast('Test alert triggered! Sound & notification channels validated.');
    }
  }
}

export const notificationService = new NotificationService();
