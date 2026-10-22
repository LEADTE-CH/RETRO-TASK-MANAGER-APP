import React, { useEffect } from 'react';
import { retroAudio } from '../../utils/audio';

// 1. PixelButton
interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'amber' | 'cyan' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  playSound?: boolean;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  playSound = true,
  onClick,
  className = '',
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playSound && !disabled) {
      retroAudio.playBlip();
    }
    if (onClick) onClick(e);
  };

  const variantClass = {
    default: 'pixel-btn text-[#ede4ce]',
    primary: 'pixel-btn-primary',
    amber: 'pixel-btn-amber',
    cyan: 'pixel-btn-cyan',
    danger: 'pixel-btn-danger',
    ghost: 'bg-transparent border border-dashed border-[#3d4f6c] text-[#a5b4fc] hover:bg-[#1a2234] hover:border-solid',
  }[variant];

  const sizeClass = {
    sm: 'px-2.5 py-1 text-xs font-mono tracking-wider',
    md: 'px-4 py-2 text-xs font-pixel leading-tight',
    lg: 'px-6 py-3 text-sm font-pixel leading-normal',
  }[size];

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 cursor-pointer font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] disabled:opacity-40 disabled:cursor-not-allowed ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// 2. PixelCard
interface PixelCardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  variant?: 'default' | 'green' | 'amber' | 'cyan' | 'red';
  className?: string;
  headerAction?: React.ReactNode;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  title,
  subtitle,
  badge,
  variant = 'default',
  className = '',
  headerAction,
}) => {
  const borderClass = {
    default: 'pixel-border bg-[#121824]',
    green: 'pixel-border-green bg-[#121f18]',
    amber: 'pixel-border-amber bg-[#20180d]',
    cyan: 'pixel-border-cyan bg-[#0e1b29]',
    red: 'pixel-border-red bg-[#221015]',
  }[variant];

  return (
    <div className={`relative p-4 md:p-5 text-[#ede4ce] ${borderClass} ${className}`}>
      {(title || subtitle || badge || headerAction) && (
        <div className="flex items-center justify-between gap-2 border-b-2 border-[#1e293b] pb-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {badge}
            {title && (
              <h3 className="font-pixel text-xs md:text-sm text-[#ede4ce] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <span className="text-xs text-[#94a3b8] font-mono">
                {subtitle}
              </span>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

// 3. PixelInput
interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PixelInput: React.FC<PixelInputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '_') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="font-pixel text-[10px] text-[#94a3b8] tracking-wider uppercase">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-[#0b0e14] border-2 border-[#2c384e] text-[#ede4ce] px-3 py-2 font-mono text-sm focus:border-[#38bdf8] focus:bg-[#101726] focus:outline-none shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.6)] placeholder:text-[#475569] ${
          error ? 'border-[#ef4444]' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="font-mono text-xs text-[#ef4444]">! {error}</span>}
      {helperText && !error && (
        <span className="font-mono text-[11px] text-[#64748b]">{helperText}</span>
      )}
    </div>
  );
};

// 4. PixelCheckbox
interface PixelCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const PixelCheckbox: React.FC<PixelCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled,
  className = '',
}) => {
  const handleToggle = () => {
    if (disabled) return;
    retroAudio.playBlip();
    onChange(!checked);
  };

  return (
    <label
      onClick={handleToggle}
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div
        className={`w-5 h-5 flex items-center justify-center border-2 border-[#3d4f6c] transition-colors ${
          checked
            ? 'bg-[#39ff14] border-[#39ff14] text-[#0b0e14]'
            : 'bg-[#0b0e14] hover:border-[#38bdf8]'
        } shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.5)]`}
      >
        {checked && <span className="font-pixel text-[10px] font-black">✓</span>}
      </div>
      {label && <span className="font-mono text-xs text-[#ede4ce]">{label}</span>}
    </label>
  );
};

// 5. PixelBadge
interface PixelBadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'cyan' | 'red' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    green: 'border-[#39ff14] text-[#39ff14] bg-[#0c2412]',
    amber: 'border-[#f59e0b] text-[#f59e0b] bg-[#271a06]',
    cyan: 'border-[#38bdf8] text-[#38bdf8] bg-[#0c202d]',
    red: 'border-[#ef4444] text-[#ef4444] bg-[#290d11]',
    purple: 'border-[#c084fc] text-[#c084fc] bg-[#221034]',
    slate: 'border-[#475569] text-[#cbd5e1] bg-[#1a2234]',
  }[variant];

  const sizeStyles = {
    sm: 'text-[9px] px-1.5 py-0.5 font-pixel',
    md: 'text-xs px-2 py-1 font-pixel',
  }[size];

  return (
    <span
      className={`inline-block border uppercase tracking-wider select-none font-bold shadow-[1px_1px_0_0_#06090e] ${variantStyles} ${sizeStyles} ${className}`}
    >
      {children}
    </span>
  );
};

// 6. PixelProgressBar
interface PixelProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: 'green' | 'amber' | 'cyan' | 'red';
  showNumeric?: boolean;
}

export const PixelProgressBar: React.FC<PixelProgressBarProps> = ({
  value,
  max,
  label,
  color = 'green',
  showNumeric = true,
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const barColor = {
    green: 'bg-[#39ff14] shadow-[0_0_8px_#39ff14]',
    amber: 'bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]',
    cyan: 'bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]',
    red: 'bg-[#ef4444] shadow-[0_0_8px_#ef4444]',
  }[color];

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex justify-between items-center text-[10px] font-pixel text-[#94a3b8]">
        {label && <span>{label}</span>}
        {showNumeric && (
          <span className="font-mono text-xs text-[#ede4ce]">
            {value} / {max} ({percent}%)
          </span>
        )}
      </div>
      <div className="w-full h-4 bg-[#0b0e14] border-2 border-[#2c384e] p-0.5 relative shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.8)]">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
        {/* Subtle retro segment hatch grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 6px, #000 6px, #000 8px)',
          }}
        />
      </div>
    </div>
  );
};

// 7. PixelModal
interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const PixelModal: React.FC<PixelModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'max-w-xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        className={`w-full ${width} bg-[#121824] pixel-border border-3 border-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.25)] flex flex-col max-h-[90vh]`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="bg-[#1a2234] border-b-2 border-[#2c384e] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#39ff14] text-xs font-pixel">▶</span>
            <h2 className="font-pixel text-xs text-[#ede4ce] tracking-wide">{title}</h2>
          </div>
          <button
            onClick={() => {
              retroAudio.playBlip();
              onClose();
            }}
            className="w-6 h-6 flex items-center justify-center bg-[#290d11] text-[#ef4444] border border-[#ef4444] font-pixel text-xs hover:bg-[#ef4444] hover:text-[#0b0e14] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">{children}</div>
      </div>
    </div>
  );
};

// 8. PixelToast
interface PixelToastProps {
  message: string;
  type?: 'success' | 'alert' | 'info';
  onDismiss: () => void;
}

export const PixelToast: React.FC<PixelToastProps> = ({
  message,
  type = 'info',
  onDismiss,
}) => {
  const borderColor = {
    success: 'border-[#39ff14] text-[#39ff14]',
    alert: 'border-[#ef4444] text-[#ef4444]',
    info: 'border-[#38bdf8] text-[#38bdf8]',
  }[type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-[#0f172a] pixel-border ${borderColor} px-4 py-3 flex items-center gap-3 shadow-xl max-w-sm`}
    >
      <span className="font-pixel text-xs">
        {type === 'success' ? '✔' : type === 'alert' ? '⚠' : '✦'}
      </span>
      <p className="font-mono text-xs text-[#ede4ce] flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="font-pixel text-[10px] text-[#94a3b8] hover:text-white cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
};
