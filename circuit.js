// Digital Circuit Board City Interactive Learning System
class CircuitBoardCity {
  constructor(canvasId, grade) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.grade = grade;
    this.nodes = [];
    this.connections = [];
    this.dataPackets = [];
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.isRunning = false;
    this.time = 0;
    
    this.setupCanvas();
    this.setupTopics();
    this.setupEventListeners();
    this.createCircuitBoard();
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
      'ICT Basics': { color: '#06b6d4', type: 'processor', importance: 5 },
      'Hardware': { color: '#3b82f6', type: 'memory', importance: 4 },
      'Operating Systems': { color: '#1e40af', type: 'processor', importance: 4 },
      'Input/Output': { color: '#0ea5e9', type: 'interface', importance: 3 },
      'Storage': { color: '#0284c7', type: 'memory', importance: 3 },
      'Networks': { color: '#0369a1', type: 'network', importance: 5 },
      'Internet': { color: '#075985', type: 'network', importance: 4 },
      'Communication': { color: '#0c4a6e', type: 'interface', importance: 3 },
      'Security': { color: '#164e63', type: 'shield', importance: 4 }
    } : {
      'Programming': { color: '#8b5cf6', type: 'processor', importance: 5 },
      'Algorithms': { color: '#7c3aed', type: 'processor', importance: 5 },
      'Databases': { color: '#6d28d9', type: 'memory', importance: 5 },
      'Web Dev': { color: '#5b21b6', type: 'interface', importance: 4 },
      'Analysis': { color: '#581c87', type: 'processor', importance: 5 },
      'Management': { color: '#4c1d95', type: 'interface', importance: 4 },
      'Advanced Security': { color: '#ec4899', type: 'shield', importance: 5 },
      'Data Analytics': { color: '#db2777', type: 'memory', importance: 5 },
      'Emerging Tech': { color: '#be185d', type: 'network', importance: 5 }
    };
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('click', (e) => {
      this.handleNodeClick(e);
    });

    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.createCircuitBoard();
    });
  }

  createCircuitBoard() {
    this.nodes = [];
    this.connections = [];
    
    const topicKeys = Object.keys(this.topics);
    const cols = 3;
    const rows = Math.ceil(topicKeys.length / cols);
    
    // Create grid layout for nodes
    topicKeys.forEach((topic, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = (this.width / (cols + 1)) * (col + 1);
      const y = (this.height / (rows + 1)) * (row + 1);
      
      const topicData = this.topics[topic];
      
      const node = {
        id: index,
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 30,
        topic: topic,
        color: topicData.color,
        type: topicData.type,
        importance: topicData.importance,
        radius: 15 + topicData.importance * 3,
        isActive: Math.random() > 0.5,
        pulsePhase: Math.random() * Math.PI * 2,
        connections: [],
        powerLevel: 0.3 + Math.random() * 0.7,
        dataFlow: 0
      };
      
      this.nodes.push(node);
    });
    
    // Create connections between related nodes
    this.createConnections();
  }

  createConnections() {
    const connectionRules = {
      'processor': ['memory', 'interface'],
      'memory': ['processor', 'network'],
      'network': ['interface', 'shield'],
      'interface': ['processor', 'shield'],
      'shield': ['network', 'processor']
    };
    
    this.nodes.forEach(node => {
      const compatibleTypes = connectionRules[node.type] || [];
      
      this.nodes.forEach(otherNode => {
        if (node.id !== otherNode.id && 
            compatibleTypes.includes(otherNode.type) &&
            Math.random() > 0.6) {
          
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + 
            Math.pow(node.y - otherNode.y, 2)
          );
          
          if (distance < 200) {
            this.connections.push({
              from: node.id,
              to: otherNode.id,
              strength: 0.3 + Math.random() * 0.7,
              dataFlow: 0,
              isActive: false
            });
          }
        }
      });
    });
  }

  createDataPacket(fromNode, toNode) {
    const packet = {
      x: fromNode.x,
      y: fromNode.y,
      targetX: toNode.x,
      targetY: toNode.y,
      progress: 0,
      speed: 0.02 + Math.random() * 0.03,
      color: fromNode.color,
      size: 3 + Math.random() * 3,
      trail: []
    };
    
    this.dataPackets.push(packet);
  }

  updateDataPackets() {
    this.dataPackets.forEach((packet, index) => {
      packet.progress += packet.speed;
      
      // Interpolate position
      packet.x = packet.x + (packet.targetX - packet.x) * packet.speed;
      packet.y = packet.y + (packet.targetY - packet.y) * packet.speed;
      
      // Add trail point
      packet.trail.push({ x: packet.x, y: packet.y, alpha: 1 });
      if (packet.trail.length > 8) packet.trail.shift();
      
      // Remove completed packets
      if (packet.progress >= 1) {
        this.createPacketExplosion(packet.targetX, packet.targetY, packet.color);
        this.dataPackets.splice(index, 1);
      }
    });
  }

  createPacketExplosion(x, y, color) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: color,
        life: 1,
        decay: 0.03,
        size: 2 + Math.random() * 2
      });
    }
  }

  updateParticles() {
    this.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.98; // Friction
      particle.vy *= 0.98;
      particle.life -= particle.decay;
      
      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });
  }

  drawCircuitBoard() {
    // Draw background grid
    this.drawGrid();
    
    // Draw connections first (behind nodes)
    this.drawConnections();
    
    // Draw nodes
    this.drawNodes();
    
    // Draw data packets
    this.drawDataPackets();
    
    // Draw particles
    this.drawParticles();
  }

  drawGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = this.grade === 10 ? 'rgba(6, 182, 212, 0.1)' : 'rgba(139, 92, 246, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < this.width; x += 30) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.height; y += 30) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawConnections() {
    this.connections.forEach(connection => {
      const fromNode = this.nodes[connection.from];
      const toNode = this.nodes[connection.to];
      
      if (!fromNode || !toNode) return;
      
      this.ctx.save();
      
      // Draw circuit trace
      const gradient = this.ctx.createLinearGradient(
        fromNode.x, fromNode.y, toNode.x, toNode.y
      );
      
      const alpha = connection.isActive ? 0.8 : 0.3;
      const baseColor = this.grade === 10 ? '6, 182, 212' : '139, 92, 246';
      
      gradient.addColorStop(0, `rgba(${baseColor}, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(${baseColor}, ${alpha * 1.5})`);
      gradient.addColorStop(1, `rgba(${baseColor}, ${alpha})`);
      
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = connection.isActive ? 4 : 2;
      this.ctx.shadowColor = `rgba(${baseColor}, 0.5)`;
      this.ctx.shadowBlur = connection.isActive ? 10 : 0;
      
      // Draw the trace with slight curve
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const offset = 20;
      
      this.ctx.beginPath();
      this.ctx.moveTo(fromNode.x, fromNode.y);
      this.ctx.quadraticCurveTo(midX + offset, midY, toNode.x, toNode.y);
      this.ctx.stroke();
      
      this.ctx.restore();
    });
  }

  drawNodes() {
    this.nodes.forEach((node, index) => {
      const distance = Math.sqrt(
        Math.pow(node.x - this.mouse.x, 2) + 
        Math.pow(node.y - this.mouse.y, 2)
      );
      
      const isHovered = distance < node.radius + 20;
      
      // Update pulse animation
      node.pulsePhase += 0.05;
      const pulseScale = 1 + Math.sin(node.pulsePhase) * 0.1;
      
      this.ctx.save();
      
      // Draw node glow
      if (node.isActive || isHovered) {
        const glowRadius = node.radius * (isHovered ? 3 : 2);
        const glowGradient = this.ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, glowRadius
        );
        glowGradient.addColorStop(0, this.hexToRgba(node.color, 0.3));
        glowGradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Draw node body based on type
      this.drawNodeByType(node, pulseScale, isHovered);
      
      // Draw topic label
      if (isHovered) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(node.topic, node.x, node.y - node.radius - 15);
        
        // Show topic info
        this.showTopicInfo(node.topic);
        
        // Activate connected nodes
        this.activateConnections(index);
      }
      
      this.ctx.restore();
    });
  }

  drawNodeByType(node, pulseScale, isHovered) {
    const radius = node.radius * pulseScale;
    
    switch (node.type) {
      case 'processor':
        this.drawProcessorNode(node, radius, isHovered);
        break;
      case 'memory':
        this.drawMemoryNode(node, radius, isHovered);
        break;
      case 'network':
        this.drawNetworkNode(node, radius, isHovered);
        break;
      case 'interface':
        this.drawInterfaceNode(node, radius, isHovered);
        break;
      case 'shield':
        this.drawShieldNode(node, radius, isHovered);
        break;
    }
  }

  drawProcessorNode(node, radius, isHovered) {
    // Square processor with rounded corners
    this.ctx.fillStyle = node.color;
    this.ctx.shadowColor = node.color;
    this.ctx.shadowBlur = isHovered ? 20 : 10;
    
    const size = radius * 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(node.x - size/2, node.y - size/2, size, size, 5);
    this.ctx.fill();
    
    // Internal grid pattern
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const offset = (size / 3) * i - size/2;
      this.ctx.beginPath();
      this.ctx.moveTo(node.x - size/2, node.y + offset);
      this.ctx.lineTo(node.x + size/2, node.y + offset);
      this.ctx.moveTo(node.x + offset, node.y - size/2);
      this.ctx.lineTo(node.x + offset, node.y + size/2);
      this.ctx.stroke();
    }
  }

  drawMemoryNode(node, radius, isHovered) {
    // Rectangular memory chip
    this.ctx.fillStyle = node.color;
    this.ctx.shadowColor = node.color;
    this.ctx.shadowBlur = isHovered ? 20 : 10;
    
    const width = radius * 2;
    const height = radius * 1.2;
    this.ctx.beginPath();
    this.ctx.roundRect(node.x - width/2, node.y - height/2, width, height, 3);
    this.ctx.fill();
    
    // Memory segments
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 4; i++) {
      const segY = node.y - height/2 + (height / 4) * i + 2;
      this.ctx.fillRect(node.x - width/2 + 5, segY, width - 10, height/4 - 4);
    }
  }

  drawNetworkNode(node, radius, isHovered) {
    // Hexagonal network node
    this.ctx.fillStyle = node.color;
    this.ctx.shadowColor = node.color;
    this.ctx.shadowBlur = isHovered ? 20 : 10;
    
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = node.x + Math.cos(angle) * radius;
      const y = node.y + Math.sin(angle) * radius;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    // Network symbol
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, radius * 0.3, 0, Math.PI * 2);
    this.ctx.stroke();
    
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(node.x, node.y);
      this.ctx.lineTo(
        node.x + Math.cos(angle) * radius * 0.6,
        node.y + Math.sin(angle) * radius * 0.6
      );
      this.ctx.stroke();
    }
  }

  drawInterfaceNode(node, radius, isHovered) {
    // Diamond-shaped interface
    this.ctx.fillStyle = node.color;
    this.ctx.shadowColor = node.color;
    this.ctx.shadowBlur = isHovered ? 20 : 10;
    
    this.ctx.beginPath();
    this.ctx.moveTo(node.x, node.y - radius);
    this.ctx.lineTo(node.x + radius, node.y);
    this.ctx.lineTo(node.x, node.y + radius);
    this.ctx.lineTo(node.x - radius, node.y);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Interface lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(node.x - radius * 0.5, node.y);
    this.ctx.lineTo(node.x + radius * 0.5, node.y);
    this.ctx.moveTo(node.x, node.y - radius * 0.5);
    this.ctx.lineTo(node.x, node.y + radius * 0.5);
    this.ctx.stroke();
  }

  drawShieldNode(node, radius, isHovered) {
    // Shield-shaped security node
    this.ctx.fillStyle = node.color;
    this.ctx.shadowColor = node.color;
    this.ctx.shadowBlur = isHovered ? 20 : 10;
    
    this.ctx.beginPath();
    this.ctx.moveTo(node.x, node.y - radius);
    this.ctx.lineTo(node.x + radius * 0.8, node.y - radius * 0.3);
    this.ctx.lineTo(node.x + radius * 0.8, node.y + radius * 0.5);
    this.ctx.lineTo(node.x, node.y + radius);
    this.ctx.lineTo(node.x - radius * 0.8, node.y + radius * 0.5);
    this.ctx.lineTo(node.x - radius * 0.8, node.y - radius * 0.3);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Shield symbol
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(node.x, node.y - radius * 0.4);
    this.ctx.lineTo(node.x, node.y + radius * 0.4);
    this.ctx.moveTo(node.x - radius * 0.3, node.y);
    this.ctx.lineTo(node.x + radius * 0.3, node.y);
    this.ctx.stroke();
  }

  drawDataPackets() {
    this.dataPackets.forEach(packet => {
      // Draw trail
      packet.trail.forEach((point, index) => {
        const alpha = (index / packet.trail.length) * 0.5;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = packet.color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, packet.size * (alpha + 0.3), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
      
      // Draw main packet
      this.ctx.save();
      this.ctx.fillStyle = packet.color;
      this.ctx.shadowColor = packet.color;
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.arc(packet.x, packet.y, packet.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Packet highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.beginPath();
      this.ctx.arc(packet.x - packet.size * 0.3, packet.y - packet.size * 0.3, packet.size * 0.4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  activateConnections(nodeIndex) {
    this.connections.forEach(connection => {
      if (connection.from === nodeIndex || connection.to === nodeIndex) {
        connection.isActive = true;
        
        // Create data flow
        if (Math.random() > 0.7) {
          const fromNode = this.nodes[connection.from];
          const toNode = this.nodes[connection.to];
          this.createDataPacket(fromNode, toNode);
        }
      }
    });
    
    // Deactivate after a delay
    setTimeout(() => {
      this.connections.forEach(connection => {
        if (connection.from === nodeIndex || connection.to === nodeIndex) {
          connection.isActive = false;
        }
      });
    }, 2000);
  }

  showTopicInfo(topic) {
    const topicDisplay = document.getElementById(`circuitTopic${this.grade}`);
    if (topicDisplay) {
      const topicData = this.topics[topic];
      topicDisplay.textContent = `${topic} - ${topicData.type.toUpperCase()} MODULE (Level ${topicData.importance}/5)`;
    }
  }

  handleNodeClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    this.nodes.forEach((node, index) => {
      const distance = Math.sqrt(
        Math.pow(node.x - clickX, 2) + 
        Math.pow(node.y - clickY, 2)
      );
      
      if (distance < node.radius + 10) {
        this.collectNode(node, clickX, clickY);
        this.activateConnections(index);
      }
    });
  }

  collectNode(node, x, y) {
    // Create electrical explosion effect
    this.createElectricalExplosion(x, y, node.color);
    
    // Show achievement notification
    this.showAchievement(node.topic, node.type);
    
    // Power up the node
    node.powerLevel = Math.min(node.powerLevel + 0.2, 1);
    node.isActive = true;
  }

  createElectricalExplosion(x, y, color) {
    // Create lightning-like particles
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        color: color,
        life: 1,
        decay: 0.04,
        size: 2 + Math.random() * 4
      });
    }
    
    // Create screen flash effect
    const flash = document.createElement('div');
    flash.className = 'circuit-flash';
    flash.style.cssText = `
      position: fixed;
      left: ${x - 100}px;
      top: ${y - 100}px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, ${color}50, transparent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      animation: electricFlash 0.5s ease-out forwards;
    `;
    
    const container = this.canvas.parentElement;
    container.appendChild(flash);
    
    setTimeout(() => flash.remove(), 500);
  }

  showAchievement(topic, type) {
    const notification = document.createElement('div');
    notification.className = 'circuit-achievement-notification';
    
    const typeIcons = {
      'processor': 'cpu',
      'memory': 'hard-drive',
      'network': 'wifi',
      'interface': 'monitor',
      'shield': 'shield'
    };
    
    notification.innerHTML = `
      <div class="achievement-icon-container">
        <i data-lucide="${typeIcons[type]}" class="achievement-circuit-icon"></i>
      </div>
      <div class="achievement-text">
        <strong>Circuit Activated!</strong><br>
        <span>${topic} ${type.toUpperCase()} Module</span>
      </div>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(59, 130, 246, 0.9))',
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
      animation: 'circuitSlideIn 0.5s ease-out forwards'
    });
    
    document.body.appendChild(notification);
    
    // Add circuit animation
    if (!document.getElementById('circuit-styles')) {
      const style = document.createElement('style');
      style.id = 'circuit-styles';
      style.textContent = `
        @keyframes circuitSlideIn {
          from { transform: translateX(100%) scale(0.8); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes electricFlash {
          0% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes circuitSlideOut {
          to { transform: translateX(100%) scale(0.8); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => {
      notification.style.animation = 'circuitSlideOut 0.5s ease-in forwards';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Auto-generate random data flow
  generateRandomDataFlow() {
    if (Math.random() < 0.3) {
      const activeNodes = this.nodes.filter(node => node.isActive);
      if (activeNodes.length >= 2) {
        const fromNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
        const toNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
        if (fromNode !== toNode) {
          this.createDataPacket(fromNode, toNode);
        }
      }
    }
  }

  animate() {
    if (!this.isRunning) return;
    
    this.time += 0.016; // Approximate 60fps
    
    // Clear canvas with fade effect
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw the circuit board
    this.drawCircuitBoard();
    
    // Update systems
    this.updateDataPackets();
    this.updateParticles();
    this.generateRandomDataFlow();
    
    // Random node activation
    if (Math.random() < 0.02) {
      const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      randomNode.isActive = !randomNode.isActive;
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

// Initialize circuit board cities when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const canvas10 = document.getElementById('circuit10');
    const canvas11 = document.getElementById('circuit11');
    
    if (canvas10) {
      window.circuit10 = new CircuitBoardCity('circuit10', 10);
    }
    
    if (canvas11) {
      window.circuit11 = new CircuitBoardCity('circuit11', 11);
    }
  }, 100);
});

// Control panel interactions
document.addEventListener('DOMContentLoaded', () => {
  const controlModules = document.querySelectorAll('.control-module');
  
  controlModules.forEach(module => {
    module.addEventListener('click', () => {
      if (module.classList.contains('completed')) {
        const achievement = module.getAttribute('data-achievement');
        createElectricalCelebration(module, achievement);
      } else {
        showSystemLockedMessage();
      }
    });
  });
});

function createElectricalCelebration(element, achievement) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Create electrical sparks
  for (let i = 0; i < 25; i++) {
    const spark = document.createElement('div');
    spark.style.cssText = `
      position: fixed;
      left: ${centerX}px;
      top: ${centerY}px;
      width: 4px;
      height: 4px;
      background: linear-gradient(45deg, #06b6d4, #3b82f6);
      box-shadow: 0 0 10px #06b6d4;
      pointer-events: none;
      z-index: 1000;
      animation: electricSpark 1.2s ease-out forwards;
    `;
    
    // Random lightning-like direction
    const angle = (i / 25) * Math.PI * 2;
    const velocity = 60 + Math.random() * 40;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    spark.style.setProperty('--vx', vx + 'px');
    spark.style.setProperty('--vy', vy + 'px');
    
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1200);
  }
  
  // Add spark animation if not exists
  if (!document.getElementById('electrical-styles')) {
    const style = document.createElement('style');
    style.id = 'electrical-styles';
    style.textContent = `
      @keyframes electricSpark {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 1;
          box-shadow: 0 0 10px currentColor;
        }
        100% {
          transform: translate(var(--vx), var(--vy)) scale(0);
          opacity: 0;
          box-shadow: 0 0 30px currentColor;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Pulse the module
  element.style.animation = 'modulePulse 0.6s ease-in-out';
  setTimeout(() => element.style.animation = '', 600);
}

function showSystemLockedMessage() {
  const message = document.createElement('div');
  message.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <i data-lucide="lock" style="width: 20px; height: 20px;"></i>
      <span>System Module Locked - Complete more circuits to unlock!</span>
    </div>
  `;
  
  Object.assign(message.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '15px',
    zIndex: '1000',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    animation: 'systemAlert 2.5s ease-in-out forwards'
  });
  
  // Add system alert animation
  if (!document.getElementById('system-styles')) {
    const style = document.createElement('style');
    style.id = 'system-styles';
    style.textContent = `
      @keyframes systemAlert {
        0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        15%, 85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes modulePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(6, 182, 212, 0.6); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(message);
  
  // Initialize lucide icons for the message
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  setTimeout(() => message.remove(), 2500);
}

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.circuit10) window.circuit10.stop();
  if (window.circuit11) window.circuit11.stop();
});

// Add CanvasRenderingContext2D.roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
}