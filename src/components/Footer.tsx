import React from 'react';
import { Feather, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin }) => {
  return (
    <footer id="about" className="bg-[#1A1510] text-[#E8DEC\-C] text-[#E5DCD0] border-t border-[#33261C] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2E2218]">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B5A2B]/40 flex items-center justify-center text-[#E0B888]">
                <Feather className="w-4 h-4" />
              </div>
              <span className="text-2xl font-serif font-bold text-[#FDFBF7] font-tamil-serif">
                வசந்த கவிதைகள்
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#B8A896] font-tamil-sans max-w-md leading-relaxed">
              தமிழ் மொழியின் இனிமையையும், நவீன புதுக்கவிதைகளின் அழகையும் கொண்டாடும் இணையப் பெருவெளி. படைப்பாளர்களின் வரிகளை பாதுகாப்பாக ஆவணப்படுத்தி, வெளியிடப்பட்ட நூல்களை உலகத் தமிழர்களிடம் கொண்டு சேர்க்கும் இலக்கியப் பாலம்.
            </p>

            <div className="pt-2 text-xs text-[#E0B888] font-tamil-serif italic">
              "தமிழுக்கும் அமுதென்று பேர்! அந்தத் தமிழின்பத் தமிழெங்கள் உயிருக்கு நேர்!" — பாரதிதாசன்
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#E0B888]">
              பிரிவுகள்
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A89886]">
              <li>
                <a href="#poems" className="hover:text-[#FDFBF7] transition-colors">
                  கவிதைகள் வாசிக்க
                </a>
              </li>
              <li>
                <a href="#books" className="hover:text-[#FDFBF7] transition-colors">
                  வெளியிடப்பட்ட நூல்கள்
                </a>
              </li>
              <li>
                <a
                  href="https://www.amazon.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FDFBF7] transition-colors inline-flex items-center gap-1"
                >
                  <span>அமேசான் ஸ்டோர்</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Integrity */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#E0B888]">
              பாதுகாப்பு & நெறிமுறைகள்
            </h4>
            <p className="text-xs text-[#A89886] leading-relaxed">
              அனைத்துப் படைப்புகளும் CAPTCHA பாதுகாப்புச் சுவர், உள்ளீட்டு சுத்திகரிப்பு (XSS Prevention) மற்றும் நிர்வாக ஒப்புதல் முறையின் மூலம் சரிபார்க்கப்பட்டு வெளியிடப்படுகின்றன.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-[11px] text-[#A89886] hover:text-[#E0B888] transition-colors underline cursor-pointer"
              >
                நிர்வாகி வாயில் (Admin Login)
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7969]">
          <p>© {new Date().getFullYear()} வசந்த கவிதைகள் (Vasantha Kavithaigal). அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
          <div className="flex items-center gap-1">
            <span>தமிழன்போடு உருவாக்கப்பட்டது</span>
            <Heart className="w-3 h-3 text-[#C85A32] fill-[#C85A32]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
