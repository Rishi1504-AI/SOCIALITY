/**
 * Sociality AI - WebGL Capabilities 3D Interactive Ecosystem
 * Built with Three.js. Supports orbit animations, interactive raycasting,
 * detailed node inspection, and offscreen performance pausing.
 */
(function() {
  if (typeof THREE === 'undefined') {
    return;
  }

  const PILLARS_DATA = [
    {
      id: 1,
      category: "Design & Dev",
      icon: "devices",
      title: "More Than a Website",
      geometry: "crystal",
      material: "glass",
      desc: "We don't just build websites—we engineer complete digital experiences designed to grow your business. Every project is strategically crafted for performance, engagement, and measurable results.",
      bullets: [
        "High-performance custom websites",
        "Conversion-focused UI/UX design",
        "Mobile-first responsive experiences",
        "Lightning-fast performance optimization",
        "Technical SEO built into the foundation",
        "Brand-consistent design systems",
        "Future-ready development practices",
        "Custom-built solutions (never templates)"
      ]
    },
    {
      id: 2,
      category: "Post-Launch",
      icon: "loop",
      title: "Fully Managed",
      geometry: "ring",
      material: "gold",
      desc: "Launching your website is only the beginning. We continuously manage, optimize, secure, and improve your digital ecosystem so you can focus entirely on running your business.",
      bullets: [
        "Complete setup & deployment",
        "Ongoing maintenance & updates",
        "Enterprise-grade security",
        "Reliable cloud hosting",
        "Automated backups & monitoring",
        "Analytics & business insights",
        "Easy content management",
        "Continuous improvements & support"
      ]
    },
    {
      id: 3,
      category: "AI & Scalability",
      icon: "smart_toy",
      title: "AI-Powered Growth",
      geometry: "neural_network",
      material: "purple_network",
      desc: "Leverage the power of AI to automate workflows, qualify leads, enhance customer experiences, and build scalable systems that grow alongside your business.",
      bullets: [
        "AI-powered automation",
        "Intelligent chat & voice agents",
        "Lead qualification & booking",
        "CRM & third-party integrations",
        "Workflow automation",
        "Scalable cloud architecture",
        "Modern modular infrastructure",
        "Future-proof technology stack"
      ]
    }
  ];

  // Vertex shader for the organic liquid core distortion
  const CORE_VERTEX_SHADER = `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Simple 3D noise generator
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.1));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f*f*(3.0-2.0*f);
      return mix(mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
                     mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
                  mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                     mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
    }

    void main() {
      vNormal = normal;
      vPosition = position;
      // Gentle surface breathing displacement using time-varying noise
      float displacement = noise(position * 2.2 + uTime * 0.6) * 0.15;
      vec3 newPosition = position + normal * displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  // Fragment shader for warm candlelight core glow
  const CORE_FRAGMENT_SHADER = `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      float pulse = sin(uTime * 1.5) * 0.5 + 0.5;
      vec3 warmIvory = vec3(1.0, 0.96, 0.87); // #fff6de
      vec3 warmTerracotta = vec3(0.95, 0.56, 0.41); // #F48F68
      
      // Calculate smooth outer rim glow
      float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
      rim = pow(rim, 3.0);
      
      vec3 baseGlow = mix(warmTerracotta, warmIvory, pulse * 0.25) + vec3(1.0, 0.5, 0.2) * rim * 1.2;
      gl_FragColor = vec4(baseGlow, 1.0);
    }
  `;

  function initWebGLCapabilities() {
    const container = document.getElementById("webgl-ecosystem-container");
    if (!container) return;

    // 1. Setup Scene, Camera & WebGLRenderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Setup Lighting (Warm ambient tones, core point light, cool rim light, warm front light)
    const ambientLight = new THREE.AmbientLight(0x231f1a, 1.5); // Warm vintage ambient
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0xF48F68, 6.0, 15); // Enhanced point light inside the core
    scene.add(coreLight);

    const rimLight = new THREE.DirectionalLight(0x9aeeec, 0.8); // Cool rim light opposite sheens
    rimLight.position.set(5, 5, 5);
    scene.add(rimLight);

    const frontLight = new THREE.DirectionalLight(0xfff6de, 1.5); // Front key light for crystal & orbit nodes visibility
    frontLight.position.set(0, 2, 8);
    scene.add(frontLight);

    // 3. Add Starfield / Energy Dust Particles
    const starCount = 100;
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      // Position points randomly in a sphere
      const r = 2.0 + Math.random() * 5.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xfff6de,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true
    });
    const starParticles = new THREE.Points(starGeometry, starMaterial);
    scene.add(starParticles);

    // 4. Setup Custom Liquid AI Energy Core
    const coreGeo = new THREE.SphereGeometry(1.1, 64, 64);
    const coreMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: CORE_VERTEX_SHADER,
      fragmentShader: CORE_FRAGMENT_SHADER,
      transparent: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // 5. Generate Geometries & Materials programmatically for the 3 Nodes
    const pillars = [];
    const materialsMap = {
      glass: new THREE.MeshPhysicalMaterial({ 
        color: 0x81d5d3, // Light cyan glassmorphism tint
        roughness: 0.2, 
        metalness: 0.1, 
        transparent: true,
        opacity: 0.6,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: 0x225566, // Vibrant cyan-blue emissive glow
        emissiveIntensity: 0.5
      }),
      gold: new THREE.MeshStandardMaterial({ 
        color: 0xffdbce, // Brushed coppery gold / brass
        roughness: 0.3, 
        metalness: 0.6, // Balanced metalness for rich shading without envMap
        emissive: 0x4a2312, // Vibrant warm orange-gold emissive glow
        emissiveIntensity: 0.5
      })
    };

    function createPillarGeometry(type) {
      switch (type) {
        case "crystal":
          // 🔷 Premium Glass Crystal (Icosahedron) scaled up to command attention
          return new THREE.IcosahedronGeometry(0.38, 0);
        case "ring":
          // ⚪ Infinite Floating Torus Ring
          return new THREE.TorusGeometry(0.3, 0.07, 16, 64);
        case "neural_network": {
          // 🟣 Modular Neural Cube Network
          const group = new THREE.Group();
          
          // Connective thin wireframe lines
          const lineMat = new THREE.LineBasicMaterial({ color: 0xa387cf, transparent: true, opacity: 0.6 });
          const points = [];
          points.push(new THREE.Vector3(-0.35, 0.15, 0));
          points.push(new THREE.Vector3(0.35, 0.15, 0));
          points.push(new THREE.Vector3(0, -0.25, 0));
          points.push(new THREE.Vector3(-0.35, 0.15, 0));
          
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, lineMat);
          group.add(line);

          // 3 nested floating modular boxes (soft purple frosted glass)
          const boxMat = new THREE.MeshPhysicalMaterial({
            color: 0xa387cf, 
            roughness: 0.2, 
            metalness: 0.1, 
            transparent: true,
            opacity: 0.65,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            emissive: 0x331155, // Vibrant purple emissive glow
            emissiveIntensity: 0.6
          });
          
          const boxGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
          
          const b1 = new THREE.Mesh(boxGeo, boxMat);
          b1.position.set(-0.35, 0.15, 0);
          
          const b2 = new THREE.Mesh(boxGeo, boxMat);
          b2.position.set(0.35, 0.15, 0);
          
          const b3 = new THREE.Mesh(boxGeo, boxMat);
          b3.position.set(0, -0.25, 0);
          
          group.add(b1, b2, b3);
          return group;
        }
        default:
          return new THREE.SphereGeometry(0.2, 32, 32);
      }
    }

    PILLARS_DATA.forEach((data, index) => {
      const geomOrGroup = createPillarGeometry(data.geometry);
      let mesh;
      const mat = materialsMap[data.material];

      if (geomOrGroup instanceof THREE.Group) {
        mesh = geomOrGroup;
      } else {
        mesh = new THREE.Mesh(geomOrGroup, mat);
      }

      mesh.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
        }
      });

      const pGroup = new THREE.Group();
      pGroup.add(mesh);
      scene.add(pGroup);

      // Clean, mathematically structured orbits: 120 degrees spaced
      const radius = 2.8; 
      const phase = index * (Math.PI * 2 / 3); // Spaced perfectly at 0, 120, 240 degrees
      const speed = 0.15; // Slow precise rotation speed
      const heightOffset = 0.0; // Flat circular plane
      const inclination = 0.15; // Fixed system inclination

      pillars.push({
        group: pGroup,
        mesh: mesh,
        data: data,
        angle: phase,
        radius: radius,
        speed: speed,
        heightOffset: heightOffset,
        inclination: inclination,
        phase: phase
      });
    });

    // 6. Interactive Raycasting & Mouse Parallax Variables
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredPillar = null;
    let clickedPillar = null;
    let isPaused = false;

    // Track base camera coordinates
    const baseCameraPosition = new THREE.Vector3(0, 0, 8.5);

    // Parallax factor
    const targetParallax = new THREE.Vector2();
    const currentParallax = new THREE.Vector2();

    // 7. Event Listeners
    container.addEventListener("mousemove", (e) => {
      const bounds = container.getBoundingClientRect();
      // Translate mouse coordinates into WebGL screen coords (-1 to +1)
      mouse.x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;

      // Subtle parallax target offset
      if (!clickedPillar) {
        targetParallax.x = mouse.x * 1.5;
        targetParallax.y = mouse.y * 1.2;
      }
    });

    // Raycast on hover
    function checkHover() {
      if (isPaused || clickedPillar) return;

      raycaster.setFromCamera(mouse, camera);
      // Collect all mesh structures inside the pillar groups
      const targets = pillars.map(p => p.mesh);
      const intersects = raycaster.intersectObjects(targets, true);

      if (intersects.length > 0) {
        // Find which pillar data owns the intersected mesh
        let hitMesh = intersects[0].object;
        let depth = 0;
        while (hitMesh.parent && !targets.includes(hitMesh) && depth < 20) {
          hitMesh = hitMesh.parent;
          depth++;
        }

        const pillar = pillars.find(p => p.mesh === hitMesh);
        if (pillar && hoveredPillar !== pillar) {
          if (hoveredPillar) {
            // Restore previous hovered scale
            gsap.to(hoveredPillar.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
          }
          hoveredPillar = pillar;
          // Magnify hovered pillar, slow orbital speed
          gsap.to(pillar.mesh.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.3 });
          container.style.cursor = "pointer";
        }
      } else {
        if (hoveredPillar) {
          gsap.to(hoveredPillar.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
          hoveredPillar = null;
          container.style.cursor = "grab";
        }
      }
    }

    // click interactions
    container.addEventListener("click", () => {
      if (isPaused) return;

      raycaster.setFromCamera(mouse, camera);
      const targets = pillars.map(p => p.mesh);
      const intersects = raycaster.intersectObjects(targets, true);

      if (intersects.length > 0) {
        let hitMesh = intersects[0].object;
        let depth = 0;
        while (hitMesh.parent && !targets.includes(hitMesh) && depth < 20) {
          hitMesh = hitMesh.parent;
          depth++;
        }

        const pillar = pillars.find(p => p.mesh === hitMesh);
        if (pillar) {
          clickedPillar = pillar;
          isPaused = true;
          container.style.cursor = "default";

          // 1. Camera Eases to Object Position
          const targetCamX = pillar.mesh.position.x * 1.4;
          const targetCamY = pillar.mesh.position.y * 1.2;
          const targetCamZ = pillar.mesh.position.z * 1.4;

          gsap.to(camera.position, {
            x: targetCamX,
            y: targetCamY,
            z: Math.max(targetCamZ, 3.5),
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              camera.lookAt(pillar.mesh.position);
            }
          });

          // 2. Dim all other pillars
          pillars.forEach(p => {
            if (p !== pillar) {
              p.mesh.traverse(child => {
                if (child.isMesh) {
                  gsap.to(child.material, { opacity: 0.15, duration: 1.0 });
                }
              });
            } else {
              // Highlight selected
              gsap.to(p.mesh.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.5 });
            }
          });

          // 3. Show Details Card
          const card = document.getElementById("ecosystem-detail-card");
          document.getElementById("detail-card-icon").innerText = pillar.data.icon;
          document.getElementById("detail-card-category").innerText = pillar.data.category;
          document.getElementById("detail-card-title").innerText = pillar.data.title;
          document.getElementById("detail-card-desc").innerText = pillar.data.desc;
          
          const bulletsUl = document.getElementById("detail-card-bullets");
          if (bulletsUl) {
            bulletsUl.innerHTML = "";
            pillar.data.bullets.forEach(bullet => {
              const li = document.createElement("li");
              li.className = "flex items-start gap-2";
              li.innerHTML = `<span class="text-[#F48F68] shrink-0">•</span><span>${bullet}</span>`;
              bulletsUl.appendChild(li);
            });
          }
          
          card.classList.remove("pointer-events-none");
          gsap.to(card, { opacity: 1, scale: 1, y: "-50%", x: "-50%", duration: 0.5, delay: 0.6 });
        }
      }
    });

    // Close Details Panel
    const closeBtn = document.getElementById("close-detail-card");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = document.getElementById("ecosystem-detail-card");
        card.classList.add("pointer-events-none");
        
        // Hide card
        gsap.to(card, { opacity: 0, scale: 0.95, y: "-50%", x: "-50%", duration: 0.4 });

        // Restore all other meshes
        pillars.forEach(p => {
          p.mesh.traverse(child => {
            if (child.isMesh) {
              gsap.to(child.material, { opacity: 1.0, duration: 1.0 });
            }
          });
          if (p === clickedPillar) {
            gsap.to(p.mesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.8 });
          }
        });

        // Ease Camera back to base position
        gsap.to(camera.position, {
          x: currentParallax.x,
          y: currentParallax.y,
          z: baseCameraPosition.z,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            // Smoothly look back at center core
            camera.lookAt(0, 0, 0);
          },
          onComplete: () => {
            clickedPillar = null;
            isPaused = false;
          }
        });
      });
    }

    // 8. Clock & Animation Loop
    const clock = new THREE.Clock();

    
    // 8b. Performance Optimization: Pause rendering when offscreen (Three.js Animation Skill)
    let isVisible = true;
    let isTicking = true;

    if ('IntersectionObserver' in window) {
      const visObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible && !isTicking) {
            isTicking = true;
            requestAnimationFrame(tick);
          }
        });
      }, { threshold: 0.05 });
      visObserver.observe(container);
    }

    document.addEventListener('visibilitychange', () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible && !isTicking) {
        isTicking = true;
        requestAnimationFrame(tick);
      }
    });

    function tick() {
      if (!isVisible) {
        isTicking = false;
        return;
      }

      const elapsedTime = clock.getElapsedTime();

      // Update liquid core shader uniforms
      coreMat.uniforms.uTime.value = elapsedTime;

      // Rotate star particles slowly
      starParticles.rotation.y = elapsedTime * 0.03;

      // Organic orbit movement of the pillars
      pillars.forEach((pillar) => {
        // Orbital progression (slow down if hovered)
        const speedMultiplier = (hoveredPillar === pillar) ? 0.15 : 1.0;
        
        if (!isPaused) {
          pillar.angle += pillar.speed * 0.0035 * speedMultiplier;
        }

        // Compute polar coordinates
        let x = Math.cos(pillar.angle) * pillar.radius;
        let z = Math.sin(pillar.angle) * pillar.radius;
        let y = Math.sin(pillar.angle + pillar.phase) * pillar.heightOffset;

        // Apply plane tilt (inclination) coordinates rotation
        const rotatedX = x * Math.cos(pillar.inclination) - y * Math.sin(pillar.inclination);
        const rotatedY = x * Math.sin(pillar.inclination) + y * Math.cos(pillar.inclination);

        // Slow hover rotation drift
        if (clickedPillar === pillar) {
          pillar.mesh.position.set(rotatedX, rotatedY, z);
          // Slow inspect spin
          pillar.mesh.rotation.y += 0.005;
        } else {
          pillar.mesh.position.set(rotatedX, rotatedY, z);
          pillar.mesh.rotation.y += 0.015;
          pillar.mesh.rotation.x += 0.008;
        }
      });

      // Smooth camera parallax interpolation (only when inspect details is closed)
      if (!isPaused && !clickedPillar) {
        currentParallax.x += (targetParallax.x - currentParallax.x) * 0.06;
        currentParallax.y += (targetParallax.y - currentParallax.y) * 0.06;
        
        camera.position.x = currentParallax.x;
        camera.position.y = currentParallax.y;
        camera.lookAt(0, 0, 0);
      }

      checkHover();
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }

    tick();

    // 9. Resize Handling
    window.addEventListener("resize", () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  // Double check initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWebGLCapabilities);
  } else {
    initWebGLCapabilities();
  }
})();
