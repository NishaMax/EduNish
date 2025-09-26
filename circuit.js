// Digital Circuit Board City Interactive System
class DigitalCircuit {
  constructor(canvasId, grade) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.grade = grade;
    this.packets = [];
    this.particles = [];
    this.paths = [];
    this.mouse = { x: 0, y: 0 };
    this.isRunning = false;
    
    this.setupCanvas();
    this.setupTopics();
    this.setupEventListeners();
    this.createPaths();
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
      'Binary System': { color: '#06b6d4', difficulty: 1 },
      'Data Representation': { color: '#3b82f6', difficulty: 2 },
      'Logic Gates': { color: '#1e40af', difficulty: 3 },
      'Computer Architecture': { color: '#0ea5e9', difficulty: 2 },
      'Flowcharts': { color: '#0284c7', difficulty: 2 },
      'Internet & WWW': { color: '#0369a1', difficulty: 4 },
      'Security Threats': { color: '#075985', difficulty: 3 }
    } : {
      'Programming Loops': { color: '#8b5cf6', difficulty: 4 },
      'Arrays & Data Structures': { color: '#7c3aed', difficulty: 5 },
      'Database Queries': { color: '#6d28d9', difficulty: 5 },
      'Network Protocols': { color: '#5b21b6', difficulty: 4 },
      'Website Design': { color: '#581c87', difficulty: 5 },
      'Software Engineering': { color: '#4c1d95', difficulty: 4 },
      'Cybersecurity': { color: '#ec4899', difficulty: 5 }
    };
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('click', (e) => {
      this.handlePacketClick(e);
    });

    window.addEventListener('resize', () => {
      this.setupCanvas();
    });
  }

  createPaths() {
    const pathCount = 5;
    for (let i = 0; i < pathCount; i++) {
      this.paths.push({
        x: (this.width / (pathCount + 1)) * (i + 1),
        opacity: 0.1,
        speed: 0.5 + Math.random() * 0.5,
        color: this.grade === 10 ? '#06b6d4' : '#8b5cf6'
      });
    }
  }

  createPacket() {
    const topicKeys = Object.keys(this.topics);
    const topic = topicKeys[Math.floor(Math.random() * topicKeys.length)];
    const topicData = this.topics[topic];
    
    const path = this.paths[Math.floor(Math.random() * this.paths.length)];
    
    const packet = {
      x: path.x + (Math.random() - 0.5) * 60,
      y: -50,
      size: 10 + topicData.difficulty * 2,
      topic: topic,
      color: topicData.color,
      speed: 1 + Math.random() * 2,
      opacity: 0.8 + Math.random() * 0.2,
      wobble: Math.random() * Math.PI * 2,
      collected: false,
      trail: []
    };
    
    this.packets.push(packet);
  }

  updatePackets() {
    this.packets.forEach((packet, index) => {
      if (packet.collected) return;
      
      packet.y += packet.speed;
      packet.x += Math.sin(packet.wobble + packet.y * 0.01) * 0.5;
      packet.wobble += 0.02;
      
      packet.trail.push({ x: packet.x, y: packet.y, opacity: packet.opacity });
      if (packet.trail.length > 8) packet.trail.shift();
      
      const distance = Math.sqrt(
        Math.pow(packet.x - this.mouse.x, 2) + 
        Math.pow(packet.y - this.mouse.y, 2)
      );
      
      if (distance < packet.size + 10) {
        this.showTopicInfo(packet.topic);
        packet.size += 0.5;
        this.createParticleEffect(packet.x, packet.y, packet.color);
      } else {
        packet.size = Math.max(packet.size - 0.2, 10 + this.topics[packet.topic].difficulty * 2);
      }
      
      if (packet.y > this.height + 100) {
        this.packets.splice(index, 1);
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

  drawPaths() {
    this.paths.forEach(path => {
      this.ctx.save();
      this.ctx.globalAlpha = path.opacity;
      this.ctx.strokeStyle = path.color;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(path.x, 0);
      this.ctx.lineTo(path.x, this.height);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  drawPackets() {
    this.packets.forEach(packet => {
      // Draw trail
      packet.trail.forEach((point, index) => {
        const alpha = (index / packet.trail.length) * packet.opacity * 0.3;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = packet.color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
      
      // Draw main packet
      this.ctx.save();
      this.ctx.globalAlpha = packet.opacity;
      
      this.ctx.fillStyle = this.hexToRgba(packet.color, 0.9);
      this.ctx.shadowColor = packet.color;
      this.ctx.shadowBlur = 15;
      
      this.ctx.beginPath();
      this.ctx.arc(packet.x, packet.y, packet.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.shadowBlur = 0;
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('DATA', packet.x, packet.y + 3);
      
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
      topicDisplay.textContent = `${topic}`;
      const powerBar = document.getElementById(`powerBar${this.grade}`);
      const difficulty = this.topics[topic].difficulty;
      powerBar.style.width = `${(difficulty / 5) * 100}%`;
      const powerText = document.getElementById(`powerText${this.grade}`);
      powerText.textContent = `${difficulty}/5 Power`;
    }
  }

  handlePacketClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    this.packets.forEach((packet, index) => {
      const distance = Math.sqrt(
        Math.pow(packet.x - clickX, 2) + 
        Math.pow(packet.y - clickY, 2)
      );
      
      if (distance < packet.size && !packet.collected) {
        packet.collected = true;
        this.collectPacket(packet, clickX, clickY);
        this.packets.splice(index, 1);
      }
    });
  }

  collectPacket(packet, x, y) {
    this.createSplashEffect(x, y);
    
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: packet.color,
        life: 1,
        decay: 0.03
      });
    }
    
    this.showAchievement(packet.topic);
  }

  createSplashEffect(x, y) {
    const splash = document.createElement('div');
    splash.className = 'packet-splash';
    splash.style.left = (x - 50) + 'px';
    splash.style.top = (y - 50) + 'px';
    
    const container = this.canvas.parentElement;
    container.appendChild(splash);
    
    setTimeout(() => splash.remove(), 600);
  }

  showAchievement(topic) {
    const notification = document.createElement('div');
    notification.className = 'circuit-achievement-notification fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-2';
    notification.innerHTML = `
      <div class="circuit-achievement-icon-container">
        <i data-lucide="check-circle" class="circuit-achievement-icon"></i>
      </div>
      <div class="circuit-achievement-text">
        <strong>Data Packet Acquired!</strong><br>
        <span>${topic}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    lucide.createIcons();
    
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
    
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.drawPaths();
    
    this.updatePackets();
    this.drawPackets();
    
    this.updateParticles();
    this.drawParticles();
    
    if (Math.random() < 0.02) {
      this.createPacket();
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

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const canvas10 = document.getElementById('circuit10');
    const canvas11 = document.getElementById('circuit11');
    
    if (canvas10) {
      window.circuit10 = new DigitalCircuit('circuit10', 10);
    }
    
    if (canvas11) {
      window.circuit11 = new DigitalCircuit('circuit11', 11);
    }
  }, 100);
});

document.addEventListener('DOMContentLoaded', () => {
  const controlModules = document.querySelectorAll('.control-module');
  
  controlModules.forEach(module => {
    module.addEventListener('click', () => {
      if (module.classList.contains('completed')) {
        const icon = module.querySelector('.module-icon');
        
        // Show a completion message
        const message = document.createElement('div');
        message.className = 'system-message fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-2';
        message.innerHTML = `
          <div class="system-message-icon">
            <i data-lucide="check-circle" class="system-icon"></i>
          </div>
          <span class="system-message-text">Module already completed!</span>
        `;
        document.body.appendChild(message);
        lucide.createIcons();
        setTimeout(() => message.remove(), 2000);
        
      } else {
        showLockedMessage();
      }
    });
  });
});

function showLockedMessage() {
  const message = document.createElement('div');
  message.className = 'system-message fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-2';
  message.innerHTML = `
    <div class="system-message-icon">
      <i data-lucide="lock" class="system-icon"></i>
    </div>
    <span class="system-message-text">Access Denied. Complete prerequisites to unlock.</span>
  `;
  document.body.appendChild(message);
  lucide.createIcons();
  setTimeout(() => message.remove(), 2000);
}

window.addEventListener('beforeunload', () => {
  if (window.circuit10) window.circuit10.stop();
  if (window.circuit11) window.circuit11.stop();
});