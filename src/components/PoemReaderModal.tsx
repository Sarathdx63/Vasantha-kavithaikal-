import React, { useState } from 'react';
import { X, Download, FileText, Image, Heart, Copy, Check, Type } from 'lucide-react';
import { Poem } from '../types';

interface PoemReaderModalProps {
  poem: Poem | null;
  onClose: () => void;
  onLikePoem: (poemId: number) => void;
}

export const PoemReaderModal: React.FC<PoemReaderModalProps> = ({
  poem,
  onClose,
  onLikePoem,
}) => {
  if (!poem) return null;

  const [copied, setCopied] = useState(false);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Copy poem to clipboard
  const handleCopy = async () => {
    const textToCopy = `${poem.title}\nஆசிரியர்: ${poem.author}\n\n${poem.content}\n\n- வசந்த கவிதைகள்`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  // Safe TXT Download
  const handleDownloadTxt = async () => {
    // Increment download count on server
    fetch(`/api/poems/${poem.id}/download`, { method: 'POST' }).catch(() => {});

    const fileContent = `=====================================================
வசந்த கவிதைகள் • Vasantha Kavithaigal
=====================================================

தலைப்பு: ${poem.title}
ஆசிரியர்: ${poem.author}
வகை: ${poem.category}
பதிவிடப்பட்ட நாள்: ${new Date(poem.created_at).toLocaleDateString('ta-IN')}

-----------------------------------------------------
கவிதை வரிகள்:
-----------------------------------------------------

${poem.content}

=====================================================
இலக்கியப் பூங்கா • வசந்த கவிதைகள்
=====================================================
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${poem.title.replace(/\s+/g, '_')}_vasantham.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Safe PNG Image Card Download (HTML5 Canvas generation)
  const handleDownloadImageCard = async () => {
    setDownloadingImg(true);
    fetch(`/api/poems/${poem.id}/download`, { method: 'POST' }).catch(() => {});

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Set canvas dimension (high resolution 1080 x 1440)
      const width = 1080;
      const height = 1440;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Parchment Texture Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FCFAF6');
      bgGrad.addColorStop(0.5, '#F5EDE1');
      bgGrad.addColorStop(1, '#EDE2D1');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Elegant Outer & Inner Borders
      ctx.strokeStyle = '#8B5A2B';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, width - 100, height - 100);

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(62, 62, width - 124, height - 124);

      // Corner Accents
      const cornerSize = 25;
      ctx.fillStyle = '#8B5A2B';
      ctx.fillRect(46, 46, cornerSize, cornerSize);
      ctx.fillRect(width - 50 - cornerSize + 4, 46, cornerSize, cornerSize);
      ctx.fillRect(46, height - 50 - cornerSize + 4, cornerSize, cornerSize);
      ctx.fillRect(width - 50 - cornerSize + 4, height - 50 - cornerSize + 4, cornerSize, cornerSize);

      // 3. Top Header Stamp
      ctx.textAlign = 'center';
      ctx.fillStyle = '#8B5A2B';
      ctx.font = 'bold 26px "Noto Serif Tamil", Georgia, serif';
      ctx.fillText('• வசந்த கவிதைகள் •', width / 2, 130);

      ctx.fillStyle = '#6E5C4E';
      ctx.font = '18px "Noto Sans Tamil", sans-serif';
      ctx.fillText(`வகை: ${poem.category}`, width / 2, 168);

      // Divider line
      ctx.strokeStyle = '#CBBBA8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 180, 200);
      ctx.lineTo(width / 2 + 180, 200);
      ctx.stroke();

      // 4. Poem Title
      ctx.fillStyle = '#1F1812';
      ctx.font = 'bold 44px "Noto Serif Tamil", Georgia, serif';
      ctx.fillText(poem.title, width / 2, 280);

      // Author Name
      ctx.fillStyle = '#8B5A2B';
      ctx.font = 'italic 24px "Noto Serif Tamil", Georgia, serif';
      ctx.fillText(`— கவிஞர்: ${poem.author}`, width / 2, 330);

      // Small ornamental flourish
      ctx.fillStyle = '#D4AF37';
      ctx.font = '28px sans-serif';
      ctx.fillText('❦', width / 2, 380);

      // 5. Verses lines
      ctx.fillStyle = '#261F18';
      ctx.font = '28px "Noto Serif Tamil", Georgia, serif';

      const lines = poem.content.split('\n');
      const lineHeight = 44;
      let startY = 460;

      // If poem is long, scale lines gracefully
      const maxLines = 16;
      const displayLines = lines.slice(0, maxLines);

      displayLines.forEach((line) => {
        ctx.fillText(line.trim(), width / 2, startY);
        startY += lineHeight;
      });

      if (lines.length > maxLines) {
        ctx.fillStyle = '#7A6B5C';
        ctx.font = 'italic 20px "Noto Serif Tamil", serif';
        ctx.fillText('... (முழு கவிதை வசந்த கவிதைகள் தளத்தில்) ...', width / 2, startY + 20);
      }

      // 6. Footer Signature & Date
      ctx.fillStyle = '#6E5C4E';
      ctx.font = '18px "Noto Sans Tamil", sans-serif';
      ctx.fillText('இலக்கியச் சோலை • vasantha-kavithaigal', width / 2, height - 100);

      // Export as PNG
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `${poem.title.replace(/\s+/g, '_')}_card.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Error generating image card:', err);
    } finally {
      setDownloadingImg(false);
    }
  };

  const fontSizeClasses = {
    sm: 'text-sm sm:text-base leading-relaxed',
    md: 'text-base sm:text-lg leading-loose',
    lg: 'text-lg sm:text-xl leading-loose',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#120E0A]/80 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl bg-[#FCFAF6] border border-[#443426]/20 shadow-2xl flex flex-col text-[#241F1A]">
        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#EAE2D4] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8B5A2B] font-medium uppercase tracking-wider">
              <span>{poem.category}</span>
              <span aria-hidden="true">·</span>
              <span>{new Date(poem.created_at).toLocaleDateString('ta-IN')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F1914] font-tamil-serif mt-1">
              {poem.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#6C5D4F] mt-0.5 font-tamil-sans">
              ஆசிரியர்: <span className="font-semibold text-[#241F1A]">{poem.author}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#7A6B5C] hover:text-[#241F1A] hover:bg-[#EFE6D9] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Font Size Controls + Copy */}
        <div className="px-5 sm:px-6 py-2.5 bg-[#F6F0E6] border-b border-[#EAE2D4] flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-[#6B5C4E]">
            <Type className="w-3.5 h-3.5" />
            <span>எழுத்து அளவு:</span>
            <div className="flex items-center gap-1 ml-1 bg-white/80 rounded-md p-0.5 border border-[#DDD3C3]">
              <button
                type="button"
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  fontSize === 'sm' ? 'bg-[#241F1A] text-white' : 'text-[#5B4E41] hover:bg-[#EAE1D3]'
                }`}
              >
                சின்னது
              </button>
              <button
                type="button"
                onClick={() => setFontSize('md')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  fontSize === 'md' ? 'bg-[#241F1A] text-white' : 'text-[#5B4E41] hover:bg-[#EAE1D3]'
                }`}
              >
                இயல்பு
              </button>
              <button
                type="button"
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  fontSize === 'lg' ? 'bg-[#241F1A] text-white' : 'text-[#5B4E41] hover:bg-[#EAE1D3]'
                }`}
              >
                பெரிது
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[#5B4E41] hover:text-[#241F1A] hover:bg-white/80 transition-colors cursor-pointer border border-transparent hover:border-[#DDD3C3]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">நகலெடுக்கப்பட்டது</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>நகலெடு (Copy)</span>
              </>
            )}
          </button>
        </div>

        {/* Poem Reading Body */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-[#FDFBF7]">
          <div className="max-w-xl mx-auto text-center">
            {/* Delicate top ornamental motif */}
            <div className="text-[#C99E64] text-lg mb-6">❦</div>

            <div
              className={`font-tamil-serif text-[#221C16] whitespace-pre-line tracking-wide ${fontSizeClasses[fontSize]}`}
            >
              {poem.content}
            </div>

            {/* Bottom motif */}
            <div className="text-[#C99E64] text-lg mt-8 mb-4">❦</div>
            <p className="text-xs text-[#8A7A6C] italic font-serif">
              — {poem.author}
            </p>
          </div>
        </div>

        {/* Footer: Safe Download Options + Like */}
        <div className="p-4 sm:p-5 bg-[#F6F0E6] border-t border-[#EAE2D4] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onLikePoem(poem.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#7A3E1D] hover:bg-[#EFE6D9] transition-colors cursor-pointer border border-[#8B5A2B]/20"
          >
            <Heart className="w-4 h-4 fill-[#C85A32] text-[#C85A32]" />
            <span>விருப்பம் ({poem.likes_count})</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Safe TXT Download */}
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#EAE2D3] border border-[#D5C7B5] text-[#3D3126] text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-xs"
              title="Download as clean formatted text file"
            >
              <FileText className="w-4 h-4 text-[#8B5A2B]" />
              <span>உரை வடிவம் (TXT)</span>
              <Download className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Safe PNG Image Card Download */}
            <button
              type="button"
              onClick={handleDownloadImageCard}
              disabled={downloadingImg}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#241F1A] hover:bg-[#3D332B] disabled:bg-[#8A7C6E] text-[#FDFBF7] text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-sm"
              title="Download as high-res literary quote card PNG"
            >
              <Image className="w-4 h-4 text-[#E0B888]" />
              <span>{downloadingImg ? 'தயாராகிறது...' : 'கவிதை அட்டை (PNG)'}</span>
              <Download className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
