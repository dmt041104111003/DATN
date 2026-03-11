"use client";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full relative text-white">
      <div className="absolute inset-0 z-0">
        <Image
          src="/footer.png"
          alt="Footer background"
          fill
          className="object-cover"
          quality={90}
        />
      </div>
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-12 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-icons text-lg mt-0.5">location_on</span>
              <p className="text-sm md:text-base flex-1">Hanoi, Vietnam</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-icons text-lg mt-0.5">phone</span>
              <p className="text-sm md:text-base flex-1">Hotline: (84) 24 xxxx xxxx</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-icons text-lg mt-0.5">email</span>
              <p className="text-sm md:text-base flex-1">contact@traceability.vn</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg md:text-xl font-bold">Connect with us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="Facebook">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="YouTube">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="TikTok">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg md:text-xl font-bold">Download our app</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 border border-white/30 px-4 py-3 rounded-lg hover:opacity-80 transition-opacity">
                <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-sm md:text-base font-semibold text-white">Download on App Store</span>
              </a>
              <a href="#" className="flex items-center gap-3 border border-white/30 px-4 py-3 rounded-lg hover:opacity-80 transition-opacity">
                <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" fill="url(#googlePlayGradientFooter)"/>
                  <defs>
                    <linearGradient id="googlePlayGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00A0FF"/>
                      <stop offset="25%" stopColor="#00A0FF"/>
                      <stop offset="25%" stopColor="#00C73B"/>
                      <stop offset="50%" stopColor="#00C73B"/>
                      <stop offset="50%" stopColor="#FFD200"/>
                      <stop offset="75%" stopColor="#FFD200"/>
                      <stop offset="75%" stopColor="#FF8C00"/>
                      <stop offset="100%" stopColor="#FF8C00"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-sm md:text-base font-semibold text-white">Download on Google Play</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 pt-3 pb-2">
          <p className="text-center text-xs md:text-sm text-white/80">
            © {new Date().getFullYear()} Traceability
          </p>
        </div>
      </div>
    </footer>
  );
}

