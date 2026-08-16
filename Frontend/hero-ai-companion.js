(function () {
  function initAICompanion() {
    // 1. Inject Styles for Floating Anti-Gravity, Glassmorphism, Morphing, and Soundwaves
    if (!document.getElementById('ai-companion-styles')) {
      const style = document.createElement('style');
      style.id = 'ai-companion-styles';
      style.textContent = `
        /* Anti-gravity continuous floating animation */
        @keyframes aiFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1.5deg); }
        }

        /* Ambient glowing aura pulse */
        @keyframes aiGlowPulse {
          0%, 100% { box-shadow: 0 0 25px rgba(244, 143, 104, 0.4), 0 0 50px rgba(206, 198, 176, 0.2); }
          50% { box-shadow: 0 0 40px rgba(244, 143, 104, 0.65), 0 0 75px rgba(244, 143, 104, 0.35); }
        }

        /* Soundwave bar height equalizer animation */
        @keyframes soundwaveEqualizer {
          0%, 100% { height: 6px; }
          50% { height: 22px; }
        }

        .ai-companion-container {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 99;
          animation: aiFloat 4s ease-in-out infinite, aiGlowPulse 3s ease-in-out infinite;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }

        /* Glassmorphism Orb Base Style */
        .ai-companion-element {
          background: rgba(28, 26, 22, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(244, 143, 104, 0.35);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Hero State: Glowing Round Orb */
        .ai-companion-container.state-orb .ai-companion-element {
          width: 58px;
          height: 58px;
          border-radius: 50%;
        }

        /* Services / Active State: Morphed Chat & Voice Bubble */
        .ai-companion-container.state-bubble .ai-companion-element {
          width: auto;
          min-width: 210px;
          height: 58px;
          border-radius: 28px;
          padding: 0 20px;
        }

        /* Soundwave Equalizer Bars */
        .ai-soundwave-bar {
          width: 3.5px;
          background: linear-gradient(180deg, #F48F68 0%, #fff6de 100%);
          border-radius: 4px;
          animation: soundwaveEqualizer 1.2s ease-in-out infinite;
        }

        .ai-soundwave-bar:nth-child(1) { animation-delay: 0.0s; }
        .ai-soundwave-bar:nth-child(2) { animation-delay: 0.2s; }
        .ai-soundwave-bar:nth-child(3) { animation-delay: 0.4s; }
        .ai-soundwave-bar:nth-child(4) { animation-delay: 0.1s; }
      `;
      document.head.appendChild(style);
    }

    // 2. Build and Inject Floating Companion DOM Structure
    if (document.getElementById('ai-voice-companion')) return;

    const container = document.createElement('div');
    container.id = 'ai-voice-companion';
    container.className = 'ai-companion-container state-orb';
    container.setAttribute('title', 'Sociality AI Voice Assistant Companion');

    container.innerHTML = `
      <div class="ai-companion-element shadow-2xl">
        <!-- Orb Icon State (Hero Section) -->
        <div id="ai-orb-content" class="flex items-center justify-center transition-opacity duration-300">
          <div class="relative w-8 h-8 flex items-center justify-center">
            <span class="material-symbols-outlined text-[#F48F68] text-2xl animate-pulse">graphic_eq</span>
            <div class="absolute inset-0 rounded-full bg-[#F48F68]/20 blur-sm"></div>
          </div>
        </div>

        <!-- Active Bubble State Content (Services / AI Section) -->
        <div id="ai-bubble-content" class="hidden opacity-0 items-center gap-3.5 transition-all duration-300 w-full">
          <!-- Animated Soundwaves -->
          <div class="flex items-center gap-1.5 h-6 shrink-0">
            <span class="ai-soundwave-bar"></span>
            <span class="ai-soundwave-bar"></span>
            <span class="ai-soundwave-bar"></span>
            <span class="ai-soundwave-bar"></span>
          </div>

          <!-- Status & Title Text -->
          <div class="flex flex-col text-left">
            <span class="text-[10px] font-label-md text-[#F48F68] uppercase tracking-widest font-bold leading-none mb-1">AI Voice Active</span>
            <span class="text-xs font-body-md text-[#fff6de] font-semibold leading-none">Listening & Helping...</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const orbContent = document.getElementById('ai-orb-content');
    const bubbleContent = document.getElementById('ai-bubble-content');

    // 3. Scroll-Linked Morphing State Controller
    function updateCompanionState() {
      const scrollPosition = window.scrollY || window.pageYOffset;
      const heroHeight = window.innerHeight * 0.7; // Switch state once scrolled past 70% of hero

      if (scrollPosition < heroHeight) {
        // Hero Section State -> Orb Shape
        container.classList.remove('state-bubble');
        container.classList.add('state-orb');

        orbContent.classList.remove('hidden');
        orbContent.classList.remove('opacity-0');

        bubbleContent.classList.add('hidden');
        bubbleContent.classList.add('opacity-0');
        bubbleContent.classList.remove('flex');
      } else {
        // Services / AI Section State -> Morphed Chat Bubble with Soundwaves
        container.classList.remove('state-orb');
        container.classList.add('state-bubble');

        orbContent.classList.add('hidden');
        orbContent.classList.add('opacity-0');

        bubbleContent.classList.remove('hidden');
        bubbleContent.classList.add('flex');
        setTimeout(() => {
          bubbleContent.classList.remove('opacity-0');
        }, 50);
      }
    }

    // 4. Attach Listeners
    window.addEventListener('scroll', updateCompanionState, { passive: true });
    updateCompanionState();

    // Click Interaction (Smooth scroll to Book a Call or trigger voice demo)
    container.addEventListener('click', () => {
      window.location.href = 'book-a-call.html';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAICompanion);
  } else {
    initAICompanion();
  }
})();
