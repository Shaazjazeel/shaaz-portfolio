/* ============================================
   SHAAZ JAZEEL — PORTFOLIO ANIMATIONS v2
   Phase 1+2: Polish + Wow Factor
   ============================================ */

import { inject } from '@vercel/analytics';
inject();

let lenis; // Global lenis instance

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initGSAP();
  initNeuralNetwork();
  initLoader();
  initCursor();
  initScrollReveal();
  initParallax();
  initCardTilt();
  initNavbar();
  initCounters();
  initSmoothScroll();
  initSkillsRadar();
  initProcessReveal();
  initDynamicTitle();
  
  // New features for Phase 2
  initScrollProgress();
  initBackToTop();
  initMagneticButtons();
});

/* ---- LENIS SMOOTH SCROLL ---- */
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

/* ---- GSAP ANIMATIONS ---- */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  // Horizontal Scroll for Projects
  const projectsWrapper = document.getElementById('projectsWrapper');
  const projectsContainer = document.getElementById('projectsContainer');
  
  if (projectsWrapper && projectsContainer) {
    // We add a tiny bit of extra width to the scroll distance to ensure the last item is fully visible
    let scrollWidth = projectsContainer.scrollWidth - window.innerWidth + window.innerWidth * 0.15; 
    
    let horizontalTween = gsap.to(projectsContainer, {
      x: () => -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: projectsWrapper,
        pin: true,
        scrub: 1, // Smooth scrubbing
        start: "center center",
        end: () => "+=" + scrollWidth,
        invalidateOnRefresh: true,
      }
    });

    // 2. Image Reveal Mask & 3. Staggered Grid Animation for Projects
    const projects = projectsContainer.querySelectorAll('.featured-project');
    projects.forEach((proj, i) => {
      const wrapper = proj.querySelector('.fp-image-wrapper');
      const content = proj.querySelector('.fp-content');
      
      if (wrapper) {
        ScrollTrigger.create({
          trigger: proj,
          containerAnimation: horizontalTween,
          start: "left 85%",
          onEnter: () => {
            wrapper.classList.add('revealed');
            if (content) {
              gsap.fromTo(content, 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
              );
            }
          }
        });
      }
    });

    // Option B: Cinematic Parallax for images
    const fpImages = projectsContainer.querySelectorAll('.fp-image-wrapper img');
    fpImages.forEach((img) => {
      // Set initial state to scale 1.3 to give room for panning
      gsap.set(img, { scale: 1.3, xPercent: -15, transformOrigin: "center center" });
      
      gsap.to(img, {
        xPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: projectsWrapper,
          scrub: 1,
          start: "center center",
          end: () => "+=" + scrollWidth,
          invalidateOnRefresh: true,
        }
      });

      // Hover Image Zoom (Tier 2)
      const wrapper = img.closest('.fp-image-wrapper');
      if (wrapper) {
        wrapper.addEventListener('mouseenter', () => {
          gsap.to(img, { scale: 1.35, duration: 0.8, ease: "power2.out", overwrite: "auto" });
        });
        wrapper.addEventListener('mouseleave', () => {
          gsap.to(img, { scale: 1.3, duration: 0.8, ease: "power2.out", overwrite: "auto" });
        });
      }
    });



  }
}

/* ---- LOADING SCREEN & SCRAMBLE TEXT ---- */
function initLoader() {
  const loaderWrap = document.getElementById('loaderWrap');
  const counter = document.getElementById('loaderCounter');
  const bar = document.getElementById('loaderBar');
  const progressGroup = document.getElementById('loaderProgressGroup');
  const loaderBrandGroup = document.getElementById('loaderBrandGroup');
  const loaderName = document.getElementById('loaderName');
  if(!loaderWrap || !counter) return;

  let progress = { value: 0 };
  
  // 1. Fast counter 0-100
  gsap.to(progress, {
    value: 100,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => {
      counter.innerText = Math.round(progress.value).toString().padStart(2, '0');
      bar.style.width = `${progress.value}%`;
    },
    onComplete: () => {
      // 2. Hide counter
      progressGroup.style.opacity = 0;
      progressGroup.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        progressGroup.style.display = 'none';
        loaderBrandGroup.style.display = 'flex';
        
        // 3. Reveal Name
        const nameText = 'SHAAZ JAZEEL';
        nameText.split('').forEach((char, i) => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.animationDelay = `${i * 0.04}s`;
          loaderName.appendChild(span);
        });
        
        // 4. Split screen after holding name and subtitle
        setTimeout(() => {
          loaderWrap.classList.add('loaded');
          setTimeout(() => {
            triggerHeroSequence();
            setTimeout(() => loaderWrap.remove(), 1500);
          }, 400);
        }, 2200); // Wait long enough for the red line and subtitle to appear
        
      }, 300);
    }
  });
}

// Token-stream text effect resembling LLM output
function tokenStreamText(element, finalString, speed = 20) {
  let currentOutput = '';
  let i = 0;
  element.innerHTML = '<span class="cursor-blink">█</span>';
  
  function nextChunk() {
    if (i < finalString.length) {
      const chunkSize = Math.floor(Math.random() * 4) + 1;
      const chunk = finalString.substring(i, i + chunkSize);
      currentOutput += chunk;
      element.innerHTML = currentOutput + '<span class="cursor-blink">█</span>';
      i += chunkSize;
      setTimeout(nextChunk, speed + Math.random() * 40);
    } else {
      setTimeout(() => {
        element.innerHTML = finalString;
      }, 500);
    }
  }
  // Small initial delay before streaming starts
  setTimeout(nextChunk, 100);
}

/* ---- HERO SEQUENCE ---- */
function triggerHeroSequence() {
  const greeting = document.getElementById('heroGreeting');
  const title = document.getElementById('heroTitle');
  const bio = document.getElementById('heroBio');
  const available = document.getElementById('heroAvailable');
  const heroPhoto = document.getElementById('heroPhoto');
  const heroBadge = document.getElementById('heroBadge');

  // Trigger Token Stream Text for Name
  const nameSpans = document.querySelectorAll('.hero-name .word span');
  nameSpans.forEach((span, i) => {
    setTimeout(() => {
      span.classList.add('revealed');
      const originalText = span.textContent;
      // Reveal name text instantly
      span.style.opacity = 1;
      
      // Start token stream effect shortly after revealing
      setTimeout(() => tokenStreamText(span, originalText), 100);
    }, i * 250);
  });

  // Greeting
  setTimeout(() => {
    if (greeting) {
      greeting.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      greeting.style.transform = 'translateY(-5px)';
      greeting.style.opacity = '1';
    }
  }, 100);

  // Photo
  setTimeout(() => {
    if (heroPhoto) heroPhoto.style.opacity = '1';
  }, 300);

  // Title Auto-Typing
  setTimeout(() => {
    if (title) {
      title.style.transition = 'opacity 0.3s ease';
      title.style.opacity = '1';
      const text = "AI Engineer &|Full-Stack AI Developer";
      title.innerHTML = '<span class="cursor-blink">|</span>';
      let i = 0;
      let htmlContent = "";
      
      function typeChar() {
        if (i < text.length) {
          if (text.charAt(i) === '|') {
            htmlContent += '<br>';
          } else {
            htmlContent += text.charAt(i);
          }
          title.innerHTML = htmlContent + '<span class="cursor-blink">|</span>';
          i++;
          setTimeout(typeChar, 40 + Math.random() * 50);
        } else {
          title.innerHTML = htmlContent + '<span class="cursor-blink">|</span>';
        }
      }
      typeChar();
    }
  }, 900);

  // Bio
  setTimeout(() => {
    if (bio) {
      bio.style.transition = 'opacity 0.6s ease';
      bio.style.opacity = '1';
    }
  }, 1100);

  // Available
  setTimeout(() => {
    if (available) {
      available.style.transition = 'opacity 0.6s ease';
      available.style.opacity = '1';
    }
  }, 1300);

  // Badge
  setTimeout(() => {
    if (heroBadge) {
      heroBadge.style.opacity = '1';
    }
  }, 1000);

  // Stats
  const stats = document.querySelectorAll('.stat-item');
  stats.forEach((stat, i) => {
    setTimeout(() => {
      stat.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      stat.style.opacity = '1';
      stat.style.transform = 'translateX(0)';
    }, 1100 + (i * 150));
  });
}

/* ---- CUSTOM CURSOR ---- */
function initCursor() {
  const dot = document.getElementById('cursorDot');
  const outline = document.getElementById('cursorOutline');
  if (!dot || !outline) return;
  if ('ontouchstart' in window) {
    dot.style.display = 'none';
    outline.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;
  let isHovering = false;
  let isActive = true;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  document.addEventListener('mouseenter', () => { isActive = true; dot.style.opacity = 1; outline.style.opacity = 1; });
  document.addEventListener('mouseleave', () => { isActive = false; dot.style.opacity = 0; outline.style.opacity = 0; });


  function animateOutline() {
    if (isActive) {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        outline.style.left = outlineX + 'px';
        outline.style.top = outlineY + 'px';
    }
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  const targets = document.querySelectorAll('a, button, .contact-cta, .skill-tag, .section-link');
  targets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  const projectImages = document.querySelectorAll('.featured-project');
  projectImages.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'cursor-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

/* ---- SCROLL PROGRESS BAR ---- */
function initScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ---- BACK TO TOP BUTTON ---- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 500) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---- (Moved Magnetic Buttons to end of file) ---- */
/* ---- SCROLL REVEAL & CHOREOGRAPHY ---- */
function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof gsap === 'undefined') {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .section-line').forEach(el => el.classList.add('revealed'));
    return;
  }

  // 1. Connected Animation Timing (Choreography)
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    // Create a master timeline for this section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
      }
    });

    const line = section.querySelector('.section-line');
    const title = section.querySelector('.section-title');
    const reveals = section.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const timelineItems = section.querySelectorAll('.timeline-item');
    const skillTags = section.querySelectorAll('.skill-tag');
    
    // Step 1: Section Line expands
    if (line) {
      tl.to(line, { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0);
    }

    // Step 2: Title Token Stream Reveal
    if (title) {
      // Instead of simple CSS letter-spacing animation, trigger the LLM token stream
      // Using ScrollTrigger directly for this specific element to fire exactly when it enters
      ScrollTrigger.create({
        trigger: title,
        start: "top 80%",
        once: true,
        onEnter: () => {
          const originalText = title.textContent.trim();
          title.style.opacity = 1;
          title.style.letterSpacing = "0.2em"; // Final spacing
          tokenStreamText(title, originalText, 15);
        }
      });
    }

    // Step 3: Generic reveals inside the section
    if (reveals.length > 0) {
      tl.add(() => {
        reveals.forEach(el => el.classList.add('revealed'));
      }, 0.5);
    }

    // Step 4: Staggered items
    if (timelineItems.length > 0) {
      tl.fromTo(timelineItems,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" },
        0.6
      );
    }

    if (skillTags.length > 0) {
      tl.fromTo(skillTags,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, stagger: 0.05, duration: 0.5, ease: "back.out(1.7)" },
        0.6
      );
    }
  });

  // Fade Between Sections (Tier 2)
  const fadeSections = document.querySelectorAll('.section:not(#projects), .hero');
  fadeSections.forEach(section => {
    gsap.to(section, {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "bottom 50%", 
        end: "bottom top",   
        scrub: true
      }
    });
  }); 
}

/* ---- PARALLAX ---- */
function initParallax() {
  const bgText = document.getElementById('heroBgText');
  if (!bgText) return;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.to(bgText, {
      y: 200,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  } else {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          bgText.style.transform = `translateX(-50%) translateY(${scrollY * 0.25}px)`;
          ticking = false;
        });
        ticking = true;
      }
    });
  }
}

/* ---- CARD TILT ---- */
function initCardTilt() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

/* ---- NAVBAR ---- */
function initNavbar() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ---- COUNTERS ---- */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  let counted = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        counters.forEach(c => animateCounter(c));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const stats = document.getElementById('heroStats');
  if (stats) observer.observe(stats);
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 1500;
  const start = performance.now();
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReducedMotion){
      el.textContent = target;
      return;
  }

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ---- SMOOTH SCROLL & VELOCITY SKEW ---- */
function initSmoothScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  // Lenis is handling the smooth scroll itself, so we just use GSAP for velocity skewing (Tier 3)
  
  const skewSetter = gsap.quickSetter(".fp-image-wrapper, .skill-tag", "skewY", "deg");
  const clamp = gsap.utils.clamp(-5, 5); // Max skew of 5 degrees
  
  ScrollTrigger.create({
    onUpdate: (self) => {
      const velocity = clamp(self.getVelocity() / -300);
      
      // Only apply skew if we are moving fast enough, else reset to 0
      if (Math.abs(velocity) > 0.1) {
        skewSetter(velocity);
      } else {
        skewSetter(0);
      }
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const href = a.getAttribute('href');
      if(href === '#') return; // Ignore empty links
      
      if (typeof lenis !== 'undefined') {
        lenis.scrollTo(href);
      } else {
        const t = document.querySelector(href);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ---- NEURAL NETWORK CANVAS ---- */
function initNeuralNetwork() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  
  // Mouse position tracking
  let mouse = { x: null, y: null, radius: 150 };
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });
  
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Background Evolution tracking
  let scrollPercent = 0;
  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollPercent = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
  });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  }
  
  window.addEventListener('resize', resize);
  
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 2 + 1;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = (Math.random() * 30) + 1;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
    }
    
    draw() {
      ctx.beginPath();
      // Size pulses slightly based on scroll depth
      ctx.arc(this.x, this.y, this.size * (1 + scrollPercent), 0, Math.PI * 2);
      ctx.closePath();
      // Morph color from Red (230, 57, 70) to lighter tone as you scroll
      const r = Math.floor(230 + (255 - 230) * scrollPercent);
      const g = Math.floor(57 + (200 - 57) * scrollPercent);
      const b = Math.floor(70 + (200 - 70) * scrollPercent);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`; 
      ctx.fill();
    }
    
    update() {
      // Float around slowly, speeds up slightly as you scroll down
      this.x += this.vx * (1 + scrollPercent * 2);
      this.y += this.vy * (1 + scrollPercent * 2);
      
      // Bounce off edges
      if(this.x < 0 || this.x > width) this.vx *= -1;
      if(this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interaction
      if (mouse.x != null && mouse.y != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          // Push away slightly
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          const force = (maxDistance - distance) / maxDistance;
          const directionX = forceDirectionX * force * this.density * 0.6;
          const directionY = forceDirectionY * force * this.density * 0.6;
          
          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }
  }
  
  function initParticles() {
    particles = [];
    let numParticles = (width * height) / 15000;
    for (let i = 0; i < numParticles; i++) {
      let x = Math.random() * width;
      let y = Math.random() * height;
      particles.push(new Particle(x, y));
    }
  }
  
  function connect() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let distance = dx * dx + dy * dy;
        
        if (distance < 12000) {
          let opacity = 1 - (distance / 12000);
          const redVal = Math.floor(230 + (255 - 230) * scrollPercent);
          const greenVal = Math.floor(57 + (200 - 57) * scrollPercent);
          const blueVal = Math.floor(70 + (200 - 70) * scrollPercent);
          ctx.strokeStyle = `rgba(${redVal}, ${greenVal}, ${blueVal}, ${opacity * 0.4})`; 
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connect();
    requestAnimationFrame(animate);
  }
  
  resize();
  animate();
}

/* ---- SKILLS RADAR CHART ---- */
function initSkillsRadar() {
  const ctx = document.getElementById('skillsRadar');
  if (!ctx || typeof Chart === 'undefined') return;

  // Chart configuration
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        'LLMs / Prompt Eng.', 
        'RAG / Vector DBs', 
        'Backend (Python)', 
        'Frontend (React)', 
        'Databases', 
        'Architecture'
      ],
      datasets: [{
        label: 'Proficiency',
        data: [95, 90, 85, 75, 80, 85],
        backgroundColor: 'rgba(230, 57, 70, 0.2)', // var(--red) with opacity
        borderColor: '#E63946',
        pointBackgroundColor: '#F8F9FA',
        pointBorderColor: '#E63946',
        pointHoverBackgroundColor: '#E63946',
        pointHoverBorderColor: '#F8F9FA',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: {
            color: '#A1A1AA', // var(--muted)
            font: { family: 'inherit', size: 12, weight: 600 }
          },
          ticks: { display: false, max: 100, min: 0, stepSize: 20 }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1E1E1E',
          titleColor: '#F8F9FA',
          bodyColor: '#F8F9FA',
          borderColor: '#333333',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return context.formattedValue + '% Proficiency';
            }
          }
        }
      }
    }
  });
}

/* ---- PROCESS STEPS STAGGER ---- */
function initProcessReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReducedMotion) return;

  const steps = document.querySelectorAll('.process-step');
  if(steps.length === 0) return;

  const stepObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        stepObs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -30px 0px', threshold: 0.2 });
  
  steps.forEach((s, i) => {
    s.style.transitionDelay = `${i * 0.15}s`;
    stepObs.observe(s);
  });
}

/* ---- (Removed Modal Logic - Replaced with Dedicated Case Study Pages) ---- */

/* ---- DYNAMIC TAB TITLE ---- */
function initDynamicTitle() {
  let originalTitle = document.title;
  window.addEventListener("blur", () => {
    document.title = "Wait, come back! 🥺";
  });
  window.addEventListener("focus", () => {
    document.title = originalTitle;
  });
}

/* ---- MAGNETIC UI ELEMENTS ---- */
function initMagneticButtons() {
  const magnets = document.querySelectorAll('[data-magnetic]');
  magnets.forEach(magnet => {
    magnet.addEventListener('mousemove', (e) => {
      const rect = magnet.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(magnet, {
        x: x * 0.4,
        y: y * 0.4,
        duration: 0.6,
        ease: "power3.out"
      });
    });
    
    magnet.addEventListener('mouseleave', () => {
      gsap.to(magnet, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.3)"
      });
    });
  });
}

/* ---- AI CHATBOT PALETTE REMOVED ---- */
/* ---- UI SOUND DESIGN ---- */
function initUISounds() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function playTick() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }
  
  document.querySelectorAll('a, button, .featured-project, .cmd-item').forEach(el => {
    el.addEventListener('mouseenter', playTick);
  });
}
document.addEventListener('DOMContentLoaded', initUISounds);

/* ---- LOCAL TIME ---- */
function initLocalTime() {
  const timeEl = document.getElementById('localTime');
  if(!timeEl) return;
  
  function updateTime() {
    const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    const formatted = `${parts.find(p=>p.type==='hour').value}:${parts.find(p=>p.type==='minute').value}:${parts.find(p=>p.type==='second').value} ${parts.find(p=>p.type==='dayPeriod').value} IST`;
    
    timeEl.textContent = `Local Time: ${formatted}`;
  }
  
  updateTime();
  setInterval(updateTime, 1000);
}

/* ---- KONAMI CODE EASTER EGG (SUDO) ---- */
function initKonamiCode() {
  const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let currentPos = 0;
  
  document.addEventListener('keydown', (e) => {
    if (e.key === sequence[currentPos]) {
      currentPos++;
      if (currentPos === sequence.length) {
        currentPos = 0;
        triggerSudoMode();
      }
    } else {
      currentPos = 0;
    }
  });
}

function triggerSudoMode() {
  document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
  setTimeout(() => {
    alert("SYSTEM OVERRIDE: SUDO MODE ENGAGED. ROOT ACCESS GRANTED.");
  }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  initLocalTime();
  initKonamiCode();
  initThemeToggle();
  initContactForm();
  console.log("%c✦ LINNK ENGINE ACTIVE ✦", "color: #E63946; font-size: 20px; font-weight: bold; font-family: monospace;");
});

/* ---- WATER-DROP THEME TOGGLE ---- */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  // Restore saved theme
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  toggle.addEventListener('click', (e) => {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const targetTheme = isDark ? 'light' : 'dark';

    // Fallback for browsers that don't support View Transitions API
    if (!document.startViewTransition) {
      if (targetTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('theme', targetTheme);
      return;
    }

    // Get toggle button center position for the ripple origin
    const rect = toggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    document.documentElement.style.setProperty('--ripple-x', x + 'px');
    document.documentElement.style.setProperty('--ripple-y', y + 'px');

    document.documentElement.classList.add('theme-transition');

    const transition = document.startViewTransition(() => {
      if (targetTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('theme', targetTheme);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-transition');
    });
  });
}

/* ---- CONTACT FORM HANDLER ---- */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Access key injected by Vite during build/dev
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      alert("Configuration Error: Web3Forms access key is missing. Please contact directly via email.");
      return;
    }

    const formData = new FormData(form);
    formData.append("access_key", accessKey);

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(async (response) => {
      let json = await response.json();
      if (response.status == 200) {
        alert("Message sent successfully!");
        form.reset();
      } else {
        console.log(response);
        alert(json.message || "Something went wrong!");
      }
    })
    .catch((error) => {
      console.log(error);
      alert("Something went wrong!");
    })
    .finally(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
  });
}
