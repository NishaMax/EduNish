// Digital Waterfall Interactive Learning System
class DigitalWaterfall {
  constructor(canvasId, grade) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.grade = grade;
    this.bubbles = [];
    this.particles = [];
    this.streams = [];
    this.mouse = { x: 0, y: 0 };
    this.isRunning = false;
    
    this.setupCanvas();
    this.setupTopics();
    this.setupEventListeners();
    this.createStreams();
    this.start();
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * 2; // High DPI
    this.canvas.height = rect.height * 2;
    this.ctx.scale(2, 2);
    this.width = rect.width;
    this.height = rect.height;
  }

  setupTopics() {
    this.topics = this.grade === 10 ? {
      'Introduction to ICT': { color: '#06b6d4', difficulty: 1 },
      'Computer Hardware': { color: '#3b82f6', difficulty: 2 },
      'Operating Systems': { color: '#1e40af', difficulty: 3 },
      'Input/Output Devices': { color: '#0ea5e9', difficulty: 2 },
      'Storage Devices': { color: '#0284c7', difficulty: 2 },
      'Computer Networks': { color: '#0369a1', difficulty: 4 },
      'Internet & Web': { color: '#075985', difficulty: 3 },
      'Digital Communication': { color: '#0c4a6e', difficulty: 3 },
      'Computer Security': { color: '#164e63', difficulty: 4 }
    } : {
      'Programming Concepts': { color: '#8b5cf6', difficulty: 4 },
      'Algorithm Design': { color: '#7c3aed', difficulty: 5 },
      'Database Systems': { color: '#6d28d9', difficulty: 5 },
      'Web Development': { color: '#5b21b6', difficulty: 4 },
      'System Analysis': { color: '#581c87', difficulty: 5 },
      'Project Management': { color: '#4c1d95', difficulty: 4 },
      'Advanced Security': { color: '#ec4899', difficulty: 5 },
      'Data Analytics': { color: '#db2777', difficulty: 5 },
      'Emerging Technologies': { color: '#be185d', difficulty: 5 }
    };
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('click', (e) => {
      this.handleBubbleClick(e);
    });

    window.addEventListener('resize', () => {
      this.setupCanvas();
    });
  }

  createStreams() {
    const streamCount = 5;
    for (let i = 0; i < streamCount; i++) {
      this.streams.push({
        x: (this.width / (streamCount + 1)) * (i + 1),
        opacity: 0.1 + Math.random() * 0.2,
        speed: 0.5 + Math.random() * 0.5
      });
    }
  }

  createBubble() {
    const topicKeys = Object.keys(this.topics);
    const topic = topicKeys[Math.floor(Math.random() * topicKeys.length)];
    const topicData = this.topics[topic];
    
    const stream = this.streams[Math.floor(Math.random() * this.streams.length)];
    
    const bubble = {
      x: stream.x + (Math.random() - 0.5) * 100,
      y: -50,
      radius: 15 + topicData.difficulty * 5,
      topic: topic,
      color: topicData.color,
      speed: 1 + Math.random() * 2,
      opacity: 0.8 + Math.random() * 0.2,
      wobble: Math.random() * Math.PI * 2,
      collected: false,
      trail: []
    };
    
    this.bubbles.push(bubble);
  }

  updateBubbles() {
    this.bubbles.forEach((bubble, index) => {
      if (bubble.collected) return;
      
      // Update position with wobble effect
      bubble.y += bubble.speed;
      bubble.x += Math.sin(bubble.wobble + bubble.y * 0.01) * 0.5;
      bubble.wobble += 0.02;
      
      // Add trail point
      bubble.trail.push({ x: bubble.x, y: bubble.y, opacity: bubble.opacity });
      if (bubble.trail.length > 10) bubble.trail.shift();
      
      // Check for mouse interaction
      const distance = Math.sqrt(
        Math.pow(bubble.x - this.mouse.x, 2) + 
        Math.pow(bubble.y - this.mouse.y, 2)
      );
      
      if (distance < bubble.radius + 10) {
        this.showTopicInfo(bubble.topic);
        bubble.radius += 0.5; // Grow on hover
        this.createParticleEffect(bubble.x, bubble.y, bubble.color);
      } else {
        bubble.radius = Math.max(bubble.radius - 0.2, 15 + this.topics[bubble.topic].difficulty * 5);
      }
      
      // Remove bubbles that are off screen
      if (bubble.y > this.height + 100) {
        this.bubbles.splice(index, 1);
      }
    });
  }

  createParticleEffect(x, y, color) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: color,
        life: 1,
        decay: 0.02
      });
    }
  }

  updateParticles() {
    this.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      
      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });
  }

  drawStreams() {
    this.streams.forEach(stream => {
      this.ctx.save();
      this.ctx.globalAlpha = stream.opacity;
      
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      if (this.grade === 10) {
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(236, 72, 153, 0)');
        gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.3)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
      }
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(stream.x - 20, 0, 40, this.height);
      this.ctx.restore();
    });
  }

  drawBubbles() {
    this.bubbles.forEach(bubble => {
      // Draw trail
      bubble.trail.forEach((point, index) => {
        const alpha = (index / bubble.trail.length) * bubble.opacity * 0.3;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = bubble.color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
      
      // Draw main bubble
      this.ctx.save();
      this.ctx.globalAlpha = bubble.opacity;
      
      // Outer glow
      const glowGradient = this.ctx.createRadialGradient(
        bubble.x, bubble.y, 0,
        bubble.x, bubble.y, bubble.radius * 2
      );
      glowGradient.addColorStop(0, bubble.color);
      glowGradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(bubble.x, bubble.y, bubble.radius * 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Main bubble
      const bubbleGradient = this.ctx.createRadialGradient(
        bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, 0,
        bubble.x, bubble.y, bubble.radius
      );
      bubbleGradient.addColorStop(0, this.hexToRgba(bubble.color, 0.9));
      bubbleGradient.addColorStop(0.7, this.hexToRgba(bubble.color, 0.6));
      bubbleGradient.addColorStop(1, this.hexToRgba(bubble.color, 0.3));
      
      this.ctx.fillStyle = bubbleGradient;
      this.ctx.beginPath();
      this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Bubble highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(
        bubble.x - bubble.radius * 0.4, 
        bubble.y - bubble.radius * 0.4, 
        bubble.radius * 0.3, 
        0, Math.PI * 2
      );
      this.ctx.fill();
      
      // Topic text (abbreviated)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        bubble.topic.split(' ')[0], 
        bubble.x, 
        bubble.y + 3
      );
      
      this.ctx.restore();
    });
  }

  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  showTopicInfo(topic) {
    const topicDisplay = document.getElementById(`topic${this.grade}`);
    if (topicDisplay) {
      topicDisplay.textContent = `${topic} - ${this.topics[topic].difficulty}/5 difficulty`;
    }
  }

  handleBubbleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    this.bubbles.forEach((bubble, index) => {
      const distance = Math.sqrt(
        Math.pow(bubble.x - clickX, 2) + 
        Math.pow(bubble.y - clickY, 2)
      );
      
      if (distance < bubble.radius && !bubble.collected) {
        bubble.collected = true;
        this.collectBubble(bubble, clickX, clickY);
        this.bubbles.splice(index, 1);
      }
    });
  }

  collectBubble(bubble, x, y) {
    // Create splash effect
    this.createSplashEffect(x, y);
    
    // Create particle explosion
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: bubble.color,
        life: 1,
        decay: 0.03
      });
    }
    
    // Show achievement notification
    this.showAchievement(bubble.topic);
  }

  createSplashEffect(x, y) {
    const splash = document.createElement('div');
    splash.className = `bubble-splash ${this.grade === 10 ? 'grade10-splash' : 'grade11-splash'}`;
    splash.style.left = (x - 50) + 'px';
    splash.style.top = (y - 50) + 'px';
    
    const container = this.canvas.parentElement;
    container.appendChild(splash);
    
    setTimeout(() => splash.remove(), 600);
  }

  showAchievement(topic) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon-container">
        <i data-lucide="check-circle" class="achievement-check-icon"></i>
      </div>
      <div class="achievement-text">
        <strong>Knowledge Collected!</strong><br>
        <span>${topic}</span>
      </div>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(34, 197, 94, 0.9)',
      color: 'white',
      padding: '1rem',
      borderRadius: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      zIndex: '1000',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      animation: 'slideInRight 0.5s ease-out forwards'
    });
    
    document.body.appendChild(notification);
    
    // Add slide animation
    const slideKeyframes = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    
    if (!document.getElementById('achievement-styles')) {
      const style = document.createElement('style');
      style.id = 'achievement-styles';
      style.textContent = slideKeyframes;
      document.head.appendChild(style);
    }
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.5s ease-in forwards';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  animate() {
    if (!this.isRunning) return;
    
    // Clear canvas with fade effect
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw streams
    this.drawStreams();
    
    // Update and draw bubbles
    this.updateBubbles();
    this.drawBubbles();
    
    // Update and draw particles
    this.updateParticles();
    this.drawParticles();
    
    // Create new bubbles periodically
    if (Math.random() < 0.02) {
      this.createBubble();
    }
    
    requestAnimationFrame(() => this.animate());
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }
}

// Initialize waterfalls when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for canvas elements to be available
  setTimeout(() => {
    const canvas10 = document.getElementById('waterfall10');
    const canvas11 = document.getElementById('waterfall11');
    
    if (canvas10) {
      window.waterfall10 = new DigitalWaterfall('waterfall10', 10);
    }
    
    if (canvas11) {
      window.waterfall11 = new DigitalWaterfall('waterfall11', 11);
    }
  }, 100);
});

// Achievement bubble interactions
document.addEventListener('DOMContentLoaded', () => {
  const achievementBubbles = document.querySelectorAll('.achievement-bubble');
  
  achievementBubbles.forEach(bubble => {
    bubble.addEventListener('click', () => {
      if (bubble.classList.contains('completed')) {
        const icon = bubble.querySelector('.achievement-icon');
        const iconName = icon.getAttribute('data-lucide');
        
        // Create celebration effect
        createCelebrationEffect(bubble, iconName);
      } else {
        showLockedMessage();
      }
    });
  });
});

function createCelebrationEffect(element, iconName) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${centerX}px;
      top: ${centerY}px;
      width: 8px;
      height: 8px;
      background: linear-gradient(45deg, #fbbf24, #f59e0b);
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      animation: explode 1s ease-out forwards;
    `;
    
    // Random direction for explosion
    const angle = (i / 20) * Math.PI * 2;
    const velocity = 50 + Math.random() * 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    particle.style.setProperty('--vx', vx + 'px');
    particle.style.setProperty('--vy', vy + 'px');
    
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), 1000);
  }
  
  // Add explosion keyframes if not exists
  if (!document.getElementById('explosion-styles')) {
    const style = document.createElement('style');
    style.id = 'explosion-styles';
    style.textContent = `
      @keyframes explode {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--vx), var(--vy)) scale(0);
          opacity: 0;
        }
      }
      @keyframes slideOutRight {
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

function showLockedMessage() {
  const message = document.createElement('div');
  message.textContent = 'Complete more lessons to unlock this achievement!';
  Object.assign(message.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '25px',
    zIndex: '1000',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    animation: 'fadeInOut 2s ease-in-out forwards'
  });
  
  // Add fade animation
  if (!document.getElementById('fade-styles')) {
    const style = document.createElement('style');
    style.id = 'fade-styles';
    style.textContent = `
      @keyframes fadeInOut {
        0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(message);
  setTimeout(() => message.remove(), 2000);
}

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.waterfall10) window.waterfall10.stop();
  if (window.waterfall11) window.waterfall11.stop();
});