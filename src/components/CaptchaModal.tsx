import React, { useState, useEffect } from 'react';
import { ShieldCheck, RotateCw, Sparkles, AlertCircle } from 'lucide-react';
import { CaptchaChallenge } from '../types';

interface CaptchaModalProps {
  onVerified: () => void;
}

export const CaptchaModal: React.FC<CaptchaModalProps> = ({ onVerified }) => {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenge = async () => {
    setFetching(true);
    setError(null);
    setAnswer('');
    try {
      const res = await fetch('/api/captcha/new');
      if (!res.ok) throw new Error('Failed to load CAPTCHA');
      const data = await res.json();
      setChallenge(data);
    } catch {
      // Fallback local challenge if offline
      setChallenge({
        token: 'local_' + Date.now(),
        question: '7 + 5 = ?',
        tamilHint: 'கூட்டல் விடையை உள்ளிடவும் (12)',
        type: 'math',
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !answer.trim()) return;

    setLoading(true);
    setError(null);

    // If local fallback token
    if (challenge.token.startsWith('local_')) {
      if (answer.trim() === '12') {
        sessionStorage.setItem('vasantham_verified', 'true');
        onVerified();
      } else {
        setError('தவறான விடை. மீண்டும் முயற்சிக்கவும்.');
        fetchChallenge();
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: challenge.token,
          answer: answer.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('vasantham_verified', 'true');
        if (data.verifiedTicket) {
          sessionStorage.setItem('vasantham_ticket', data.verifiedTicket);
        }
        onVerified();
      } else {
        setError(data.error || 'தவறான விடை. மீண்டும் முயற்சிக்கவும்.');
        fetchChallenge();
      }
    } catch {
      setError('சரிபார்ப்பில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
      fetchChallenge();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1612]/80 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#FCFAF6] border border-[#443426]/15 shadow-2xl p-6 sm:p-8 text-[#241F1A]">
        {/* Subtle decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B5A2B] via-[#C99E64] to-[#8B5A2B]" />

        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#F3ECE0] flex items-center justify-center mb-3 text-[#8B5A2B] shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1F1914] tracking-tight">
            பாதுகாப்பு சரிபார்ப்பு
          </h2>
          <p className="text-xs sm:text-sm text-[#6C5F53] mt-1">
            Security Verification • வசந்த கவிதைகள்
          </p>
          <p className="text-xs text-[#7A6B5C] mt-2 leading-relaxed">
            தளத்தின் உள்ளடக்கங்களை அணுக கீழே உள்ள எளிய சரிபார்ப்பு வினாவிற்கு விடையளிக்கவும்.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="bg-[#F4EFE6] border border-[#DDD3C2] rounded-xl p-4 text-center relative shadow-sm">
            <button
              type="button"
              onClick={fetchChallenge}
              disabled={fetching}
              className="absolute top-2 right-2 p-1.5 rounded-md text-[#7A6B5C] hover:text-[#241F1A] hover:bg-[#EAE2D3] transition-colors"
              title="புதிய வினா (Refresh challenge)"
              aria-label="Refresh challenge"
            >
              <RotateCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
            </button>

            <span className="text-[11px] font-medium uppercase tracking-wider text-[#8B5A2B] block mb-1">
              சரிபார்ப்புக் குறியீடு (Challenge)
            </span>

            {fetching ? (
              <div className="py-4 text-sm text-[#7A6B5C] animate-pulse">
                புதிய வினா தயாரிக்கப்படுகிறது...
              </div>
            ) : (
              <div className="py-2">
                <div className="text-2xl font-tamil-serif font-bold tracking-wide text-[#2C2219]">
                  {challenge?.question}
                </div>
                {challenge?.tamilHint && (
                  <p className="text-xs text-[#7A6B5C] mt-1 italic">
                    {challenge.tamilHint}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="captcha-answer" className="block text-xs font-medium text-[#4A3E33] mb-1.5">
              உங்கள் விடை (Your Answer):
            </label>
            <input
              id="captcha-answer"
              type="text"
              autoFocus
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="விடையை உள்ளிடவும் (e.g. 12 or சொல்)"
              className="w-full px-4 py-2.5 rounded-lg border border-[#D5C9B7] bg-white text-[#241F1A] placeholder-[#9E9080] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/40 focus:border-[#8B5A2B] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || fetching || !answer.trim()}
            className="w-full py-2.5 px-4 rounded-lg bg-[#241F1A] hover:bg-[#3D332B] disabled:bg-[#A39686] text-[#FDFBF7] text-sm font-medium transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>சரிபார்க்கப்படுகிறது...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D8B485]" />
                <span>உள்நுழைக (Enter Portal)</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#E8DEC\-C] border-[#E8DECE] text-center">
          <p className="text-[11px] text-[#8C7D6E]">
            வசந்த கவிதைகள் • பாதுகாப்பான இலக்கியச் சோலை
          </p>
        </div>
      </div>
    </div>
  );
};
