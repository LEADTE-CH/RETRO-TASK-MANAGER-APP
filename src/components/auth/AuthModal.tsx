import React, { useState } from 'react';
import { AuthUser, UserStats, Achievement } from '../../types';
import { PixelModal, PixelButton, PixelInput } from '../ui/PixelUI';
import { syncEngine } from '../../db/supabase';
import { retroAudio } from '../../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  stats?: UserStats;
  achievements?: Achievement[];
  onLoginSuccess: (user: AuthUser) => void;
  onSignOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  stats,
  achievements = [],
  onLoginSuccess,
  onSignOut,
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const client = syncEngine.getClient();
  const unlockedBadges = achievements.filter((a) => a.unlockedAt !== null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError('Email and password required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (client) {
      // Real Supabase Auth
      try {
        if (tab === 'register') {
          const { data, error: err } = await client.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName || email.split('@')[0],
              },
            },
          });
          if (err) throw err;
          if (data.user) {
            retroAudio.playLevelUp();
            const authedUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || email,
              displayName: displayName || email.split('@')[0],
              isGuest: false,
              createdAt: data.user.created_at,
            };
            onLoginSuccess(authedUser);
            setMessage('Registration successful! Session initialized.');
            setTimeout(() => onClose(), 1000);
          }
        } else {
          const { data, error: err } = await client.auth.signInWithPassword({
            email,
            password,
          });
          if (err) throw err;
          if (data.user) {
            retroAudio.playLevelUp();
            const authedUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || email,
              displayName:
                data.user.user_metadata?.display_name || email.split('@')[0],
              isGuest: false,
              createdAt: data.user.created_at,
            };
            onLoginSuccess(authedUser);
            setMessage('Signed in successfully!');
            setTimeout(() => onClose(), 800);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Authentication error.');
      } finally {
        setLoading(false);
      }
    } else {
      // Local Auth session (offline simulation without Supabase cloud keys configured yet)
      setTimeout(() => {
        setLoading(false);
        retroAudio.playLevelUp();
        const authedUser: AuthUser = {
          id: 'user_' + Math.random().toString(36).substring(2, 9),
          email,
          displayName: displayName || email.split('@')[0],
          isGuest: false,
          createdAt: new Date().toISOString(),
        };
        onLoginSuccess(authedUser);
        setMessage('Local hero session established! Connect Supabase in Settings for cloud sync.');
        setTimeout(() => onClose(), 1000);
      }, 500);
    }
  };

  const handleContinueAsGuest = () => {
    retroAudio.playBlip();
    const guestUser: AuthUser = {
      id: 'guest_hero_01',
      email: 'hero@pixelquest.local',
      displayName: 'Pixel Knight',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={currentUser.isGuest ? 'HERO AUTHENTICATION & PROFILE' : 'HERO PROFILE & ACCOUNT'}
    >
      <div className="space-y-4">
        {/* If already signed in as non-guest or viewing profile */}
        {!currentUser.isGuest ? (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-[#1a2234] border-2 border-[#39ff14] mx-auto flex items-center justify-center text-3xl shadow-[2px_2px_0_0_#06090e]">
              🛡️
            </div>
            <div>
              <h3 className="font-pixel text-sm text-white">{currentUser.displayName}</h3>
              <p className="font-mono text-xs text-[#94a3b8]">{currentUser.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="font-pixel text-[9px] bg-[#0c2412] border border-[#39ff14] text-[#39ff14] px-2 py-0.5">
                  AUTHENTICATED HERO
                </span>
                {stats && (
                  <span className="font-pixel text-[9px] bg-[#291705] border border-[#f59e0b] text-[#f59e0b] px-2 py-0.5">
                    🔥 {stats.focusStreakCurrent} FOCUS STREAK
                  </span>
                )}
              </div>
            </div>

            {/* Achievement Badges Showcase */}
            <div className="bg-[#0b0e14] border-2 border-[#222d3f] p-3 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[9px] text-[#38bdf8] uppercase">
                  UNLOCKED ACHIEVEMENT CRESTS ({unlockedBadges.length}/{achievements.length})
                </span>
                <span className="font-mono text-[10px] text-[#39ff14]">
                  Cloud Synchronized
                </span>
              </div>
              {unlockedBadges.length === 0 ? (
                <p className="font-mono text-xs text-[#64748b] text-center py-2">
                  No badges unlocked yet. Complete tasks and focus sessions to earn crests!
                </p>
              ) : (
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                  {unlockedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center p-2 bg-[#121824] border border-[#39ff14] shrink-0 w-24 text-center"
                      title={`${badge.title}: ${badge.criteria}`}
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <span className="font-pixel text-[8px] text-white mt-1 truncate w-full">
                        {badge.title}
                      </span>
                      <span className="font-mono text-[8px] text-[#39ff14]">
                        +{badge.xpBonus} XP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-center gap-3">
              <PixelButton
                variant="danger"
                size="sm"
                onClick={() => {
                  retroAudio.playAlert();
                  onSignOut();
                  onClose();
                }}
              >
                SIGN OUT
              </PixelButton>
              <PixelButton variant="ghost" size="sm" onClick={onClose}>
                CLOSE
              </PixelButton>
            </div>
          </div>
        ) : (
          /* Sign In or Register Form */
          <div className="space-y-4">
            <div className="flex border-b border-[#222d3f]">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setTab('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 font-pixel text-xs border-b-2 cursor-pointer transition ${
                  tab === 'signin'
                    ? 'border-[#38bdf8] text-[#38bdf8]'
                    : 'border-transparent text-[#64748b] hover:text-white'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setTab('register');
                  setError(null);
                }}
                className={`flex-1 py-2 font-pixel text-xs border-b-2 cursor-pointer transition ${
                  tab === 'register'
                    ? 'border-[#39ff14] text-[#39ff14]'
                    : 'border-transparent text-[#64748b] hover:text-white'
                }`}
              >
                NEW HERO REGISTER
              </button>
            </div>

            <p className="font-mono text-xs text-[#94a3b8]">
              {client
                ? 'Connected to configured Supabase Cloud instance.'
                : 'Local-first hero session with instant offline durability.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === 'register' && (
                <PixelInput
                  label="Hero Name / Handle"
                  placeholder="e.g. Paladin Arthur"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              )}

              <PixelInput
                label="Email Address"
                type="email"
                placeholder="hero@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <PixelInput
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="p-2 bg-[#290d11] border border-[#ef4444] text-xs font-mono text-[#ef4444]">
                  ! {error}
                </div>
              )}

              {message && (
                <div className="p-2 bg-[#0c2412] border border-[#39ff14] text-xs font-mono text-[#39ff14]">
                  ✔ {message}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 gap-2">
                <PixelButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleContinueAsGuest}
                >
                  PLAY AS GUEST
                </PixelButton>

                <PixelButton
                  type="submit"
                  variant={tab === 'register' ? 'primary' : 'cyan'}
                  disabled={loading}
                >
                  {loading
                    ? 'AUTHENTICATING...'
                    : tab === 'register'
                    ? 'CREATE ACCOUNT'
                    : 'SIGN IN'}
                </PixelButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </PixelModal>
  );
};
