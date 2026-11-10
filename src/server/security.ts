/**
 * Security and sanitization utilities for Vasantha Kavithaigal
 */

/**
 * Sanitize string to prevent Cross-Site Scripting (XSS)
 * Escapes HTML characters: &, <, >, ", ', /
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Basic safe text cleaner (removes null bytes, trims, preserves newlines for poetry)
 */
export function cleanPoetryText(input: string): string {
  if (typeof input !== 'string') return '';
  // Remove null characters and unsafe control characters while keeping valid UTF-8 Tamil characters and newlines
  return input
    .replace(/\0/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * Simple in-memory token store for CAPTCHA challenges
 */
interface CaptchaEntry {
  solution: string;
  expiresAt: number;
}

const captchaStore = new Map<string, CaptchaEntry>();

// Clean up expired tokens every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of captchaStore.entries()) {
      if (value.expiresAt < now) {
        captchaStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Generate a new CAPTCHA challenge
 */
export function generateCaptchaChallenge(): {
  token: string;
  question: string;
  tamilHint: string;
  type: 'math' | 'tamil_number' | 'word';
} {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const types = ['math', 'tamil_number', 'word'] as const;
  const selectedType = types[Math.floor(Math.random() * types.length)];

  let question = '';
  let solution = '';
  let tamilHint = '';

  if (selectedType === 'math') {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 15) + 1;
    question = `${a} + ${b} = ?`;
    solution = String(a + b);
    tamilHint = 'கூட்டல் விடையை உள்ளிடவும் (Enter the sum)';
  } else if (selectedType === 'tamil_number') {
    const tamilNumbers: [string, string, string][] = [
      ['க', '1', 'ஒன்று (One)'],
      ['உ', '2', 'இரண்டு (Two)'],
      ['௩', '3', 'மூன்று (Three)'],
      ['௪', '4', 'நான்கு (Four)'],
      ['௫', '5', 'ஐந்து (Five)'],
      ['௬', '6', 'ஆறு (Six)'],
      ['௭', '7', 'ஏழு (Seven)'],
      ['௮', '8', 'எட்டு (Eight)'],
      ['௯', '9', 'ஒன்பது (Nine)'],
      ['௰', '10', 'பத்து (Ten)'],
    ];
    const picked = tamilNumbers[Math.floor(Math.random() * tamilNumbers.length)];
    question = `தமிழ் எண் குறியீடு '${picked[0]}' இன் மதிப்பு என்ன? (What is the numeric value of Tamil numeral '${picked[0]}'?)`;
    solution = picked[1];
    tamilHint = `குறிப்பு: ${picked[2]}`;
  } else {
    // Poetic word challenge
    const words: [string, string][] = [
      ['தமிழ்', 'tamil'],
      ['வசந்தம்', 'vasantham'],
      ['கவிதை', 'kavithai'],
      ['சோலை', 'solai'],
      ['மழை', 'mazhai'],
    ];
    const picked = words[Math.floor(Math.random() * words.length)];
    question = `கீழே உள்ள சொல்லை அப்படியே உள்ளிடவும்: "${picked[0]}"`;
    solution = picked[0];
    tamilHint = `சரியான சொல்லை மேலே உள்ளவாறு எழுதவும் (Type: ${picked[0]})`;
  }

  // Store valid for 10 minutes
  captchaStore.set(token, {
    solution: solution.trim().toLowerCase(),
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  return { token, question, tamilHint, type: selectedType };
}

/**
 * Verify CAPTCHA answer
 */
export function verifyCaptchaSolution(token: string, answer: string): boolean {
  if (!token || !answer) return false;
  const entry = captchaStore.get(token);
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    captchaStore.delete(token);
    return false;
  }

  const isValid = entry.solution.toLowerCase() === answer.trim().toLowerCase();
  if (isValid) {
    // One-time use to prevent replay attacks
    captchaStore.delete(token);
  }
  return isValid;
}
