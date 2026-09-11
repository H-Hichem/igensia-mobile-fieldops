import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface Props {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Saisie de code OTP : un input par chiffre. Avance automatiquement au chiffre
// suivant, revient en arriere sur backspace, gere le collage d'un code complet.
export function OtpInput({ length = 6, value, onChange, disabled }: Props) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(''));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      e.preventDefault();
      onChange(pasted.padEnd(length, ''));
      inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Chiffre ${index + 1} du code`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          style={{
            width: 40,
            height: 48,
            textAlign: 'center',
            fontSize: 20,
            borderRadius: 8,
            border: '1px solid var(--ion-border-color)',
            background: 'var(--ion-item-background)',
            color: 'var(--ion-text-color)',
          }}
        />
      ))}
    </div>
  );
}
