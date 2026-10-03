import { useState, useEffect } from 'react';

/**
 * InstallPWA — A beautiful "Add to Home Screen" banner/prompt component.
 * 
 * Shows an install prompt on mobile browsers when the PWA install criteria are met.
 * Also provides manual instructions for iOS Safari (which doesn't support beforeinstallprompt).
 */
export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed (with a 3-day cooldown)
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedAt) < threeDays) return;
    }

    // Detect iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari) {
      // Delay showing the iOS banner for a better UX
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    // Listen for the browser's install prompt (Chrome, Edge, etc.)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Delay showing banner for a better UX
      setTimeout(() => setShowBanner(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // On iOS, show manual instructions
      setShowIOSInstructions(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    dismissBanner();
  };

  const dismissBanner = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setShowBanner(false);
      setIsAnimatingOut(false);
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }, 300);
  };

  if (isInstalled || !showBanner) return null;

  // Detect iOS for instruction display
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <>
      {/* Backdrop overlay */}
      {showIOSInstructions && (
        <div
          onClick={() => setShowIOSInstructions(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          borderRadius: '20px',
          padding: '28px 24px',
          maxWidth: '340px',
          width: '90vw',
          boxShadow: '0 25px 60px rgba(79, 70, 229, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          color: '#fff'
        }}>
          <h3 style={{
            margin: '0 0 16px',
            fontSize: '18px',
            fontWeight: 700,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #c7d2fe, #e9d5ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Add NestOps to Home Screen
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <StepItem step="1" text='Tap the Share button' icon="↗" />
            <StepItem step="2" text='Scroll down and tap "Add to Home Screen"' icon="➕" />
            <StepItem step="3" text='Tap "Add" to confirm' icon="✓" />
          </div>

          <button
            onClick={() => setShowIOSInstructions(false)}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '12px',
              border: 'none',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              color: '#e0e7ff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
              backdropFilter: 'blur(8px)'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
          >
            Got it!
          </button>
        </div>
      )}

      {/* Install Banner */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: `translateX(-50%) translateY(${isAnimatingOut ? '120%' : '0'})`,
        zIndex: 9997,
        width: '92vw',
        maxWidth: '420px',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
        borderRadius: '18px',
        padding: '16px 18px',
        boxShadow: '0 20px 50px rgba(79, 70, 229, 0.35), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
        animation: isAnimatingOut ? 'none' : 'slideUpBanner 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        color: '#fff'
      }}>
        {/* Close button */}
        <button
          onClick={dismissBanner}
          aria-label="Dismiss install banner"
          style={{
            position: 'absolute',
            top: '8px',
            right: '10px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.color = '#fff'}
          onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}
        >
          ✕
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* App Icon */}
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <img
              src="/icon-192.jpg"
              alt="NestOps"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '15px',
              fontWeight: 700,
              marginBottom: '2px',
              background: 'linear-gradient(135deg, #e0e7ff, #c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Add NestOps to Home Screen
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(199, 210, 254, 0.75)',
              lineHeight: 1.3
            }}>
              Quick access · Works offline · No app store needed
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '14px'
        }}>
          <button
            onClick={dismissBanner}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(199, 210, 254, 0.8)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.12)';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.06)';
              e.target.style.color = 'rgba(199, 210, 254, 0.8)';
            }}
          >
            Not Now
          </button>
          <button
            onClick={handleInstall}
            style={{
              flex: 1.5,
              padding: '10px 16px',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
            }}
          >
            {isIOS ? '📱 Show Me How' : '⬇ Install App'}
          </button>
        </div>

        {/* Decorative shimmer */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          borderRadius: '18px 18px 0 0'
        }} />
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, -40%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes slideUpBanner {
          from { opacity: 0; transform: translateX(-50%) translateY(120%); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}

/** Helper component for iOS instruction steps */
function StepItem({ step, text, icon }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '12px 14px',
      border: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 700,
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
      }}>
        {icon}
      </div>
      <div>
        <span style={{
          fontSize: '11px',
          color: 'rgba(167, 139, 250, 0.8)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Step {step}
        </span>
        <div style={{ fontSize: '13px', color: '#e0e7ff', fontWeight: 500, marginTop: '1px' }}>
          {text}
        </div>
      </div>
    </div>
  );
}
