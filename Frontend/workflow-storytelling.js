/**
 * Sociality AI - Interactive Workflow Storytelling
 * Uses GSAP & ScrollTrigger to animate SVG energy journey and act cards.
 */
(function() {
  

  function initWorkflowStorytelling() {
    
    try {
      if (typeof gsap === "undefined") {
        console.error("Sociality AI Error: gsap is undefined!");
        return;
      }
      if (typeof ScrollTrigger === "undefined") {
        console.error("Sociality AI Error: ScrollTrigger is undefined!");
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      console.log("Sociality AI: ScrollTrigger registered successfully on Home.");

      const path = document.querySelector("#journey-path");
      console.log("Sociality AI: journey-path element:", path);
      let pathLength = 1000;
      if (path) {
        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;
      }

      const infPath = document.querySelector("#infinity-path");
      console.log("Sociality AI: infinity-path element:", infPath);
      if (infPath) {
        const infLength = infPath.getTotalLength() || 100;
        infPath.style.strokeDasharray = infLength;
        infPath.style.strokeDashoffset = infLength;
      }

      const chartPath = document.querySelector("#analytics-chart-path");
      console.log("Sociality AI: analytics-chart-path element:", chartPath);
      if (chartPath) {
        const chartLength = chartPath.getTotalLength() || 200;
        chartPath.style.strokeDasharray = chartLength;
        chartPath.style.strokeDashoffset = chartLength;
      }

      const triggerEl = document.querySelector("#workflow-storytelling");
      console.log("Sociality AI: trigger element:", triggerEl);

      // GSAP ScrollTrigger Timeline with native Pinning
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#workflow-storytelling",
          start: "top top",
          end: "+=400%", // 4 screens of scrolling distance
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true
        }
      });
      console.log("Sociality AI: GSAP Timeline initialized on Home:", tl);

      // Core track animations (lasts full duration of 10)
      tl.to("#journey-path", { strokeDashoffset: 0, ease: "none", duration: 10 }, 0);
      tl.to("#journey-orb", { top: "100%", ease: "none", duration: 10 }, 0);

      // ACT 1: Connect & Discover (0 to 2)
      tl.to("#act-1-text", { opacity: 1, y: 0, pointerEvents: "auto", duration: 1 }, 0);
      tl.to("#act-1-visual", { opacity: 1, scale: 1, duration: 1 }, 0);
      tl.to("#act-1-text", { opacity: 0, y: -20, pointerEvents: "none", duration: 1 }, 2);
      tl.to("#act-1-visual", { opacity: 0, scale: 0.95, duration: 1 }, 2);

      // ACT 2: Analysis (2 to 4)
      tl.to("#act-2-text", { opacity: 1, y: 0, pointerEvents: "auto", duration: 1 }, 2);
      tl.to("#act-2-visual", { opacity: 1, scale: 1, duration: 1 }, 2);
      tl.to("#audit-ai-card", { borderColor: "#F48F68", boxShadow: "0 0 30px rgba(244,143,104,0.3)", duration: 0.5 }, 2.5);
      tl.to("#act-2-text", { opacity: 0, y: -20, pointerEvents: "none", duration: 1 }, 4);
      tl.to("#act-2-visual", { opacity: 0, scale: 0.95, duration: 1 }, 4);

      // ACT 3: Strategy & Blueprint (4 to 6)
      tl.to("#act-3-text", { opacity: 1, y: 0, pointerEvents: "auto", duration: 1 }, 4);
      tl.to("#act-3-visual", { opacity: 1, scale: 1, duration: 1 }, 4);
      tl.to("#act-3-text", { opacity: 0, y: -20, pointerEvents: "none", duration: 1 }, 6);
      tl.to("#act-3-visual", { opacity: 0, scale: 0.95, duration: 1 }, 6);

      // ACT 4: Design & Dev (6 to 8)
      tl.to("#act-4-text", { opacity: 1, y: 0, pointerEvents: "auto", duration: 1 }, 6);
      tl.to("#act-4-visual", { opacity: 1, scale: 1, duration: 1 }, 6);
      tl.to("#act-4-text", { opacity: 0, y: -20, pointerEvents: "none", duration: 1 }, 8);
      tl.to("#act-4-visual", { opacity: 0, scale: 0.95, duration: 1 }, 8);

      // ACT 5: Launch & Growth (8 to 10)
      tl.to("#act-5-text", { opacity: 1, y: 0, pointerEvents: "auto", duration: 1 }, 8);
      tl.to("#act-5-visual", { opacity: 1, scale: 1, duration: 1 }, 8);
      if (chartPath) {
        tl.to(chartPath, { strokeDashoffset: 0, duration: 1.5, ease: "power1.out" }, 8.5);
      }
      if (infPath) {
        tl.to(infPath, { strokeDashoffset: 0, duration: 1.5, ease: "power1.out" }, 8.5);
      }

      // Micro interactions: mouse tilt relative to grid
      const sandbox = document.querySelector("#workflow-storytelling .grid > div:last-child");
      if (sandbox) {
        sandbox.addEventListener("mousemove", (e) => {
          const bounds = sandbox.getBoundingClientRect();
          const mouseX = e.clientX - bounds.left - bounds.width / 2;
          const mouseY = e.clientY - bounds.top - bounds.height / 2;
          
          gsap.to("#act-1-visual, #act-2-visual, #act-3-visual, #act-4-visual, #act-5-visual", {
            rotationY: mouseX * 0.05,
            rotationX: -mouseY * 0.05,
            ease: "power1.out",
            transformPerspective: 500,
            overwrite: "auto"
          });
          
          gsap.to("#ambient-glow", {
            x: mouseX * 0.25,
            y: mouseY * 0.25,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
        
        sandbox.addEventListener("mouseleave", () => {
          gsap.to("#act-1-visual, #act-2-visual, #act-3-visual, #act-4-visual, #act-5-visual", {
            rotationY: 0,
            rotationX: 0,
            ease: "power1.out"
          });
        });
      }
    } catch (err) {
      console.error("Sociality AI Error inside initWorkflowStorytelling on Home:", err);
    }
  }

  // Robust document initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorkflowStorytelling);
  } else {
    initWorkflowStorytelling();
  }
})();
