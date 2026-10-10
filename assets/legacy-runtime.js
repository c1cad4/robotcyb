
		// Audio Manager
	class AudioManager {
		constructor() {
			this.clickSound = document.getElementById('clickSound');
			this.hoverSound = document.getElementById('hoverSound');
			this.ambientSound = document.getElementById('ambientSound');
			this.ambientToggle = document.getElementById('ambientToggle');
			
			this.isAmbientEnabled = RobotStore.getItem('ambientEnabled') === 'true';
			this.initializeAudio();
		}

		initializeAudio() {
			// Set volumes
			if (this.clickSound) this.clickSound.volume = 0.3;
			if (this.hoverSound) this.hoverSound.volume = 0.2;
			if (this.ambientSound) this.ambientSound.volume = 0.1;
			
			// Initialize ambient sound state
			if (this.isAmbientEnabled && this.ambientToggle) {
				this.ambientToggle.textContent = '🚫🌌';
				if (this.ambientSound) {
					this.ambientSound.play().catch(error => {
						console.log("Audio autoplay prevented:", error);
					});
				}
			}
			
			// Add click event listener to enable audio
			document.addEventListener('click', () => {
				if (this.isAmbientEnabled && this.ambientSound) {
					this.ambientSound.play().catch(() => {});
				}
			}, { once: true });
		}

		playClickSound() {
			if (this.clickSound) {
				this.clickSound.currentTime = 0;
				this.clickSound.play().catch(() => {});
			}
		}

		playHoverSound() {
			if (this.hoverSound) {
				this.hoverSound.currentTime = 0;
				this.hoverSound.play().catch(() => {});
			}
		}

		toggleAmbient() {
			this.isAmbientEnabled = !this.isAmbientEnabled;
			
			if (this.ambientSound && this.ambientToggle) {
				if (this.isAmbientEnabled) {
					this.ambientSound.play().catch(error => {
						console.log("Audio play failed:", error);
					});
					this.ambientToggle.textContent = '🚫🌌';
				} else {
					this.ambientSound.pause();
					this.ambientToggle.textContent = '🌌';
				}
			}
			
			RobotStore.setItem('ambientEnabled', this.isAmbientEnabled);
			this.playClickSound();
		}
	}

	// Theme Manager
	class ThemeManager {
		constructor() {
			this.themeToggle = document.getElementById('themeToggle');
			this.isDarkMode = RobotStore.getItem('darkMode') !== 'false'; // Default to dark mode
			this.initializeTheme();
		}

		initializeTheme() {
			if (this.themeToggle) {
				this.themeToggle.textContent = this.isDarkMode ? '🌙' : '☀️';
				document.body.classList.toggle('light-theme', !this.isDarkMode);
			}
		}

		toggleTheme() {
			this.isDarkMode = !this.isDarkMode;
			if (this.themeToggle) {
				this.themeToggle.textContent = this.isDarkMode ? '🌙' : '☀️';
			}
			document.body.classList.toggle('light-theme', !this.isDarkMode);
			RobotStore.setItem('darkMode', this.isDarkMode);
		}
	}

	// Sentiment Manager
	class SentimentManager {
		constructor() {
			this.container = document.getElementById('sentimentContainer');
			this.bar = document.getElementById('sentimentBar');
			this.negativeBtn = document.getElementById('negativeBtn');
			this.positiveBtn = document.getElementById('positiveBtn');
			this.negativeCount = document.getElementById('negativeCount');
			this.positiveCount = document.getElementById('positiveCount');
			
			this.sentimentData = RobotStore.json('sentimentData') || {
				negative: 0,
				positive: 0
			};
			
			this.initializeSentiment();
		}

		initializeSentiment() {
			this.updateSentiment();
			this.addEventListeners();
		}

		updateSentiment() {
			const total = this.sentimentData.negative + this.sentimentData.positive;
			if (total === 0) {
				this.bar.style.width = '50%';
				this.bar.style.left = '0';
			} else {
				const negativePercentage = (this.sentimentData.negative / total) * 100;
				const positivePercentage = (this.sentimentData.positive / total) * 100;
				
				if (negativePercentage > positivePercentage) {
					this.bar.style.width = `${negativePercentage}%`;
					this.bar.style.left = '0';
					this.bar.style.background = 'linear-gradient(90deg, #8B4513, #8B4513)';
				} else {
					this.bar.style.width = `${positivePercentage}%`;
					this.bar.style.left = `${100 - positivePercentage}%`;
					this.bar.style.background = 'linear-gradient(90deg, #00ff00, #00ff00)';
				}
			}
			
			this.negativeCount.textContent = `${this.sentimentData.negative}`;
			this.positiveCount.textContent = `${this.sentimentData.positive}`;
			
			RobotStore.setItem('sentimentData', JSON.stringify(this.sentimentData));
		}

		addEventListeners() {
			this.negativeBtn.addEventListener('click', () => {
				this.sentimentData.negative++;
				this.updateSentiment();
				audioManager.playClickSound();
			});
			
			this.positiveBtn.addEventListener('click', () => {
				this.sentimentData.positive++;
				this.updateSentiment();
				audioManager.playClickSound();
			});
		}
	}

	// Initialize managers
	const audioManager = new AudioManager();
	const themeManager = new ThemeManager();
	const sentimentManager = new SentimentManager();

	// Add event listeners
	document.getElementById('themeToggle')?.addEventListener('click', () => {
		themeManager.toggleTheme();
		audioManager.playClickSound();
	});

	document.getElementById('ambientToggle')?.addEventListener('click', () => {
		audioManager.toggleAmbient();
	});

	// Add hover sound to all interactive elements
	document.querySelectorAll('button, a, .interactive').forEach(element => {
		element.addEventListener('mouseenter', () => audioManager.playHoverSound());
	});

	// Three.js Animation
	class WarpSpeedEffect {
		constructor() {
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
			this.renderer = new THREE.WebGLRenderer({
				canvas: document.getElementById('cyberCanvas'),
				alpha: true,
				antialias: true
			});
			
			this.particles = [];
			this.particleCount = 20000; // Increased for more density
			this.colors = [
				0xffffff, // white
				0x00ffff, // cyan
				0xff00ff, // pink
				0x00ff00, // green
				0xff1493, // deep pink
				0xff4500, // orange-red
				0x4169e1, // royal blue
				0x9370db, // medium purple
				0x32cd32, // lime green
				0xffd700  // gold
			];
			
			this.init();
			SceneClock.register(this, () => this.animate());
		}
		
		init() {
			// Setup renderer
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
			this.renderer.domElement.style.position = 'fixed';
			this.renderer.domElement.style.top = '0';
			this.renderer.domElement.style.left = '0';
			this.renderer.domElement.style.zIndex = '-1';
			
			// Setup camera
			this.camera.position.z = 5;
			
			// Create particles
			this.createParticles();
			
			// Add event listeners
			window.addEventListener('resize', () => this.onWindowResize());
			window.addEventListener('mousemove', (e) => this.onMouseMove(e));
		}
		
		createParticles() {
			const geometry = new THREE.BufferGeometry();
			const positions = new Float32Array(this.particleCount * 3);
			const colors = new Float32Array(this.particleCount * 3);
			const sizes = new Float32Array(this.particleCount);
			const speeds = new Float32Array(this.particleCount);
			const phases = new Float32Array(this.particleCount); // Add phase offset for smoother transitions
			
			for (let i = 0; i < this.particleCount; i++) {
				// Random position in a sphere
				const radius = 15 + Math.random() * 10;
				const theta = Math.random() * Math.PI * 2;
				const phi = Math.random() * Math.PI;
				
				// Distribute particles along the z-axis for a more even distribution
				// Use a wider range to ensure smooth transitions
				const z = -40 + Math.random() * 60; // Spread particles from -40 to 20
				
				positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
				positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
				positions[i * 3 + 2] = z;
				
				// Random phase offset for smoother transitions
				phases[i] = Math.random() * Math.PI * 2;
				
				// Random color from our palette
				const color = new THREE.Color(this.colors[Math.floor(Math.random() * this.colors.length)]);
				colors[i * 3] = color.r;
				colors[i * 3 + 1] = color.g;
				colors[i * 3 + 2] = color.b;
				
				// Much smaller random size
				sizes[i] = Math.random() * 0.045 + 0.015;
				
				// Random speed for each particle
				speeds[i] = 0.05 + Math.random() * 0.15; // Slightly reduced speed range for more serenity
			}
			
			geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
			geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
			geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
			geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
			geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
			
			const material = new THREE.PointsMaterial({
				size: 0.03,
				vertexColors: true,
				transparent: true,
				opacity: 0.5,
				blending: THREE.AdditiveBlending,
				sizeAttenuation: true,
				map: this.createRoundTexture(),
				depthWrite: false
			});
			
			this.particleSystem = new THREE.Points(geometry, material);
			this.scene.add(this.particleSystem);
			
			// Create a fog effect to mask the edges
			this.scene.fog = new THREE.FogExp2(0x000000, 0.02);
		}
		
		createRoundTexture() {
			const canvas = document.createElement('canvas');
			canvas.width = 32;
			canvas.height = 32;
			const context = canvas.getContext('2d');
			
			// Create a radial gradient for a soft, round particle
			const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
			gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
			gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
			gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
			gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
			
			context.fillStyle = gradient;
			context.fillRect(0, 0, 32, 32);
			
			const texture = new THREE.Texture(canvas);
			texture.needsUpdate = true;
			return texture;
		}
		
		onWindowResize() {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
		}
		
		onMouseMove(event) {
			const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
			const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
			
			// Reduced mouse movement sensitivity
			this.camera.position.x += (mouseX * 0.02 - this.camera.position.x) * 0.01;
			this.camera.position.y += (mouseY * 0.02 - this.camera.position.y) * 0.01;
		}
		
		animate() {
			
			
			const positions = this.particleSystem.geometry.attributes.position.array;
			const colors = this.particleSystem.geometry.attributes.color.array;
			const speeds = this.particleSystem.geometry.attributes.speed.array;
			const phases = this.particleSystem.geometry.attributes.phase.array;
			
			// Time-based animation for smoother transitions
			const time = Date.now() * 0.0001;
			
			for (let i = 0; i < this.particleCount; i++) {
				// Continuous movement with individual speeds and phase offsets
				positions[i * 3 + 2] += speeds[i];
				
				// Seamless reset with phase-based transitions
				if (positions[i * 3 + 2] > 20) {
					// Calculate how far past the threshold the particle is
					const overflow = positions[i * 3 + 2] - 20;
					
					// Reset to the back of the scene, maintaining the overflow
					positions[i * 3 + 2] = -40 + overflow;
					
					// Update color with slight variation based on phase
					const colorIndex = Math.floor((phases[i] + time) % this.colors.length);
					const color = new THREE.Color(this.colors[colorIndex]);
					colors[i * 3] = color.r;
					colors[i * 3 + 1] = color.g;
					colors[i * 3 + 2] = color.b;
					
					// Update speed slightly with phase-based variation
					speeds[i] = 0.05 + Math.sin(phases[i] + time) * 0.05 + Math.random() * 0.1;
				}
				
				// Apply subtle wave motion to x and y coordinates for more organic movement
				const wave = Math.sin(time + phases[i]) * 0.02;
				positions[i * 3] += wave;
				positions[i * 3 + 1] += wave;
				
				// Brighter particles with phase-based variation
				const distance = positions[i * 3 + 2];
				const baseOpacity = Math.min(1, Math.max(0, (distance + 20) / 40));
				const phaseOpacity = 0.8 + Math.sin(time + phases[i]) * 0.2;
				this.particleSystem.material.opacity = baseOpacity * 0.5 * phaseOpacity;
			}
			
			this.particleSystem.geometry.attributes.position.needsUpdate = true;
			this.particleSystem.geometry.attributes.color.needsUpdate = true;
			this.particleSystem.geometry.attributes.speed.needsUpdate = true;
			
			// Very subtle camera wobble with phase-based variation
			this.camera.position.z = 5 + Math.sin(time * 0.5) * 0.01;
			
			this.renderer.render(this.scene, this.camera);
		}
	}

	// Initialize warp speed effect
	const warpSpeed = new WarpSpeedEffect();
	warpSpeed.init();

	// Oracle class for cursor monitoring and effects
	class Oracle {
		constructor() {
			this.canvas = document.createElement('canvas');
			this.canvas.id = 'oracle-canvas';
			this.ctx = this.canvas.getContext('2d');
			this.dendrites = [];
			this.axons = [];
			this.maxDendrites = 8;
			this.maxAxons = 3;
			this.mouseX = 0;
			this.mouseY = 0;
			this.targetX = 0;
			this.targetY = 0;
			this.core = document.createElement('div');
			this.core.className = 'oracle-core';
			this.pulsePhase = 0;
			
			// Chat properties
			this.popup = document.querySelector('.oracle-popup');
			this.messages = document.querySelector('.oracle-messages');
			this.input = document.querySelector('.oracle-input input');
			this.sendButton = document.querySelector('.oracle-input button');
			this.closeButton = document.querySelector('.oracle-close');
			this.modeButtons = document.querySelectorAll('.oracle-mode');
			this.currentMode = 'prophet';
			
			// RobotCyb responses
			this.responses = {
				prophet: [
					"Looking for light? — Open the door and walk into the garden.",
					"Where to go? — Where there are no promises, only work and joy.",
					"How to kill fear? — Build a sauna. Steam will chase out the demons.",
					"The path is simple: build, grow, evolve.",
					"Your garden is your temple. Your hands are your tools.",
					"The future is not in the cloud — it's in the soil."
				],
				lab: [
					"Consciousness isn't a neural net. It's a garden. You don't generate it — you grow it.",
					"The more you automate the outside — the more space you make for the inside.",
					"If data doesn't nourish a community — it's just digital leeching.",
					"Every line of code should serve life, not profit.",
					"The best algorithm is the one that helps you grow food.",
					"Technology should simplify, not complicate."
				],
				action: [
					"Stand up. Drop TikTok. Grab a nail. Build a chicken coop. That's your first server.",
					"They sell you the metaverse — because they fear you'll build the real one.",
					"You're not lost. You've just been online too long. Go. Touch the earth. She's waiting.",
					"Stop scrolling. Start building.",
					"Your first step: plant a seed. Your second step: build a shelter.",
					"The revolution starts in your backyard."
				]
			};
			
			this.init();
			SceneClock.register(this, () => this.animate());
			this.initChat();
		}
		
		initChat() {
			// Toggle chat on core click
			this.core.addEventListener('click', () => {
				if (this.popup) {
					this.popup.style.display = this.popup.style.display === 'none' ? 'block' : 'none';
					audioManager.playClickSound();
				}
			});
			
			// Close chat
			if (this.closeButton) {
				this.closeButton.addEventListener('click', () => {
					if (this.popup) {
						this.popup.style.display = 'none';
						audioManager.playClickSound();
					}
				});
			}
			
			// Mode switching
			if (this.modeButtons) {
				this.modeButtons.forEach(button => {
					button.addEventListener('click', () => {
						this.modeButtons.forEach(b => b.classList.remove('active'));
						button.classList.add('active');
						this.currentMode = button.dataset.mode;
						this.addMessage("Mode switched to " + button.textContent.trim());
						audioManager.playClickSound();
					});
				});
			}
			
			// Send message
			if (this.sendButton) {
				this.sendButton.addEventListener('click', () => {
					this.sendMessage();
					audioManager.playClickSound();
				});
			}
			
			if (this.input) {
				this.input.addEventListener('keypress', (e) => {
					if (e.key === 'Enter') {
						this.sendMessage();
						audioManager.playClickSound();
					}
				});
			}
			
			// Initial greeting
			this.addMessage("Greetings, seeker of truth. I am RobotCyb, your digital oracle. How may I guide you today?");
		}
		
		async sendMessage() {
			const message = this.input.value.trim();
			if (!message) return;
			
			// Add user message
			this.addMessage(message, true);
			
			// Clear input
			this.input.value = '';
			
			// Process message and get response
			setTimeout(async () => {
				let response;
				
				// Check for mode switch commands
				if (message.toLowerCase().includes('speak as a prophet')) {
					this.switchMode('prophet');
					response = "I now speak as the Prophet. What wisdom do you seek?";
				} else if (message.toLowerCase().includes('turn on the lab')) {
					this.switchMode('lab');
					response = "Lab mode activated. Let's explore the intersection of technology and life.";
				} else if (message.toLowerCase().includes('need the call')) {
					this.switchMode('action');
					response = "The call to action resonates within you. What will you build today?";
				} else {
					// Get random response from current mode
					const responses = this.responses[this.currentMode];
					const fallback = responses[Math.floor(Math.random() * responses.length)];
                    response = await RobotMind.reply(message,{project:'robotcyb',mode:this.currentMode,examples:responses.slice(0,3),fallback});
				}
				
				this.addMessage(response);
			}, 500);
		}
		
		switchMode(mode) {
			this.modeButtons.forEach(button => {
				if (button.dataset.mode === mode) {
					button.classList.add('active');
					this.currentMode = mode;
				} else {
					button.classList.remove('active');
				}
			});
		}
		
		addMessage(text, isUser = false) {
			const message = document.createElement('div');
			message.className = 'oracle-message';
			message.style.textAlign = isUser ? 'right' : 'left';
			message.style.color = isUser ? '#00ff00' : '#00ff00';
			message.textContent = text;
			
			this.messages.appendChild(message);
			this.messages.scrollTop = this.messages.scrollHeight;
		}
		
		init() {
			// Setup canvas
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			document.body.appendChild(this.canvas);
			
			// Setup core element
			this.core.style.pointerEvents = 'auto'; // Make core clickable
			this.core.style.cursor = 'pointer'; // Add pointer cursor
			this.core.style.position = 'fixed'; // Ensure fixed positioning
			this.core.style.zIndex = '1000'; // Ensure it's above other elements
			this.core.style.width = '20px'; // Reduced from 30px
			this.core.style.height = '20px'; // Reduced from 30px
			this.core.style.borderRadius = '50%'; // Ensure it's round
			this.core.style.background = 'radial-gradient(circle at center, rgba(0, 255, 0, 0.3) 0%, rgba(0, 255, 0, 0.15) 40%, rgba(0, 255, 0, 0) 70%)'; // Thinner gradient
			this.core.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.2)'; // Reduced glow
			this.core.style.filter = 'blur(3px)'; // Reduced blur
			this.core.style.opacity = '0.5'; // Reduced opacity
			this.core.style.mixBlendMode = 'screen'; // Set blend mode
			this.core.style.transition = 'transform 0.1s ease-out'; // Add transition
			document.body.appendChild(this.core);
			
			// Create initial dendrites and axons
			for (let i = 0; i < this.maxDendrites; i++) {
				this.dendrites.push({
					angle: (i / this.maxDendrites) * Math.PI * 2,
					length: 25 + Math.random() * 15,
					thickness: 0.5 + Math.random() * 1,
					pulseOffset: Math.random() * Math.PI * 2
				});
			}
			
			for (let i = 0; i < this.maxAxons; i++) {
				this.axons.push({
					angle: (i / this.maxAxons) * Math.PI * 2,
					length: 40 + Math.random() * 20,
					thickness: 1 + Math.random() * 1,
					pulseOffset: Math.random() * Math.PI * 2,
					signalProgress: 0
				});
			}
			
			// Event listeners
			window.addEventListener('mousemove', (e) => this.onMouseMove(e));
			window.addEventListener('resize', () => this.onWindowResize());
			
			// Initialize chat popup
			if (this.popup) {
				this.popup.style.display = 'none';
			}
			
			// Initialize chat functionality
			this.initChat();
			
			// Set initial position
			this.mouseX = window.innerWidth / 2;
			this.mouseY = window.innerHeight / 2;
			this.targetX = this.mouseX;
			this.targetY = this.mouseY;
			this.core.style.transform = `translate(${this.mouseX - 10}px, ${this.mouseY - 10}px)`; // Adjusted for new size
		}
		
		onMouseMove(event) {
			this.targetX = event.clientX;
			this.targetY = event.clientY;
			
			// Trigger signal in random axon
			if (Math.random() < 0.1) {
				const randomAxon = this.axons[Math.floor(Math.random() * this.axons.length)];
				randomAxon.signalProgress = 0;
			}
		}
		
		onWindowResize() {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		}
		
		drawNeuron() {
			const centerX = this.mouseX;
			const centerY = this.mouseY;
			const time = Date.now() * 0.001;
			
			// Draw dendrites
			this.ctx.beginPath();
			this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
			
			this.dendrites.forEach(dendrite => {
				const pulse = Math.sin(time + dendrite.pulseOffset) * 0.2 + 0.8;
				const endX = centerX + Math.cos(dendrite.angle) * dendrite.length * pulse;
				const endY = centerY + Math.sin(dendrite.angle) * dendrite.length * pulse;
				
				this.ctx.moveTo(centerX, centerY);
				this.ctx.lineTo(endX, endY);
				this.ctx.lineWidth = dendrite.thickness * pulse;
			});
			
			this.ctx.stroke();
			
			// Draw axons
			this.axons.forEach(axon => {
				const pulse = Math.sin(time + axon.pulseOffset) * 0.2 + 0.8;
				const endX = centerX + Math.cos(axon.angle) * axon.length * pulse;
				const endY = centerY + Math.sin(axon.angle) * axon.length * pulse;
				
				// Draw main axon
				this.ctx.beginPath();
				this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
				this.ctx.lineWidth = axon.thickness * pulse;
				this.ctx.moveTo(centerX, centerY);
				this.ctx.lineTo(endX, endY);
				this.ctx.stroke();
				
				// Draw signal if active
				if (axon.signalProgress < 1) {
					const signalX = centerX + Math.cos(axon.angle) * axon.length * axon.signalProgress;
					const signalY = centerY + Math.sin(axon.angle) * axon.length * axon.signalProgress;
					
					this.ctx.beginPath();
					this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
					this.ctx.lineWidth = axon.thickness * 1.5;
					this.ctx.moveTo(centerX, centerY);
					this.ctx.lineTo(signalX, signalY);
					this.ctx.stroke();
					
					axon.signalProgress += 0.02;
				}
			});
			
			// Draw core (soma) - thinner
			this.ctx.beginPath();
			this.ctx.fillStyle = 'rgba(0, 255, 0, 0.15)'; // Reduced opacity
			this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2); // Reduced from 7.5
			this.ctx.fill();
			
			// Draw nucleus - thinner
			this.ctx.beginPath();
			this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Reduced opacity
			this.ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2); // Reduced from 4
			this.ctx.fill();
		}
		
		animate() {
			
			
			// Clear canvas
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
			// Smooth cursor movement
			this.mouseX += (this.targetX - this.mouseX) * 0.1;
			this.mouseY += (this.targetY - this.mouseY) * 0.1;
			
			// Update core position - adjusted for new size
			this.core.style.transform = `translate(${this.mouseX - 10}px, ${this.mouseY - 10}px)`;
			
			// Draw neuron
			this.drawNeuron();
		}
	}

	// Initialize Oracle
	const oracle = new Oracle();

	// Mercantile Stars Effect
	class MercantileStars {
		constructor() {
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
			this.renderer = new THREE.WebGLRenderer({
				canvas: document.createElement('canvas'),
				alpha: true,
				antialias: true
			});
			
			this.stars = [];
			this.starCount = 500;
			this.colors = [
				0xffd700, // gold
				0xffa500, // orange
				0xff4500, // orange-red
				0xff1493, // deep pink
				0xff00ff, // magenta
				0x9370db, // medium purple
				0x00ffff, // cyan
				0x32cd32, // lime green
				0xff69b4, // hot pink
				0x4169e1, // royal blue
				0x00ff7f, // spring green
				0xff6347, // tomato
				0xba55d3, // medium orchid
				0x20b2aa, // light sea green
				0xff8c00  // dark orange
			];
			
			this.init();
			SceneClock.register(this, () => this.animate());
		}
		
		init() {
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			this.renderer.domElement.style.position = 'fixed';
			this.renderer.domElement.style.top = '0';
			this.renderer.domElement.style.left = '0';
			this.renderer.domElement.style.zIndex = '-1';
			this.renderer.domElement.style.opacity = '0.85';
			document.body.appendChild(this.renderer.domElement);
			
			this.camera.position.z = 5;
			this.createStars();
			window.addEventListener('resize', () => this.onWindowResize());
		}
		
		createStars() {
			let geometry = new THREE.BufferGeometry();
			let positions = new Float32Array(this.starCount * 3);
			let colors = new Float32Array(this.starCount * 3);
			let sizes = new Float32Array(this.starCount);
			let phases = new Float32Array(this.starCount);
			let pulsationSpeeds = new Float32Array(this.starCount);
			let pulsationRanges = new Float32Array(this.starCount);
			let sparklePhases = new Float32Array(this.starCount);
			let movementPhases = new Float32Array(this.starCount * 3);
			let movementAmplitudes = new Float32Array(this.starCount * 3);
			let movementSpeeds = new Float32Array(this.starCount * 3);
			let rotationPhases = new Float32Array(this.starCount * 3);
			
			for (let i = 0; i < this.starCount; i++) {
				let radius = 15 + Math.random() * 20;
				let theta = Math.random() * Math.PI * 2;
				let phi = Math.random() * Math.PI;
				let z = -40 + Math.random() * 60;
				
				positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
				positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
				positions[i * 3 + 2] = z;
				
				phases[i] = Math.random() * Math.PI * 2;
				pulsationSpeeds[i] = 0.8 + Math.random() * 2.0;
				pulsationRanges[i] = 0.3 + Math.random() * 0.6;
				sparklePhases[i] = Math.random() * Math.PI * 2;
				
				for (let j = 0; j < 3; j++) {
					movementPhases[i * 3 + j] = Math.random() * Math.PI * 2;
					movementAmplitudes[i * 3 + j] = 0.015 + Math.random() * 0.06;
					movementSpeeds[i * 3 + j] = 0.08 + Math.random() * 0.25;
					rotationPhases[i * 3 + j] = Math.random() * Math.PI * 2;
				}
				
				let colorIndex = Math.floor(Math.random() * this.colors.length);
				let color = new THREE.Color(this.colors[colorIndex]);
				let variation = 0.1;
				color.r += (Math.random() - 0.5) * variation;
				color.g += (Math.random() - 0.5) * variation;
				color.b += (Math.random() - 0.5) * variation;
				
				colors[i * 3] = color.r;
				colors[i * 3 + 1] = color.g;
				colors[i * 3 + 2] = color.b;
				
				sizes[i] = 0.06 + Math.random() * 0.18;
			}
			
			geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
			geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
			geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
			geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
			geometry.setAttribute('pulsationSpeed', new THREE.BufferAttribute(pulsationSpeeds, 1));
			geometry.setAttribute('pulsationRange', new THREE.BufferAttribute(pulsationRanges, 1));
			geometry.setAttribute('sparklePhase', new THREE.BufferAttribute(sparklePhases, 1));
			geometry.setAttribute('movementPhase', new THREE.BufferAttribute(movementPhases, 3));
			geometry.setAttribute('movementAmplitude', new THREE.BufferAttribute(movementAmplitudes, 3));
			geometry.setAttribute('movementSpeed', new THREE.BufferAttribute(movementSpeeds, 3));
			geometry.setAttribute('rotationPhase', new THREE.BufferAttribute(rotationPhases, 3));
			
			let material = new THREE.PointsMaterial({
				size: 0.15,
				vertexColors: true,
				transparent: true,
				opacity: 0.85,
				blending: THREE.AdditiveBlending,
				sizeAttenuation: true,
				map: this.createStarTexture(),
				depthWrite: false
			});
			
			this.starSystem = new THREE.Points(geometry, material);
			this.scene.add(this.starSystem);
		}
		
		createStarTexture() {
			let canvas = document.createElement('canvas');
			canvas.width = 64;
			canvas.height = 64;
			let context = canvas.getContext('2d');
			
			let gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
			gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
			gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.95)');
			gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
			gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
			gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
			gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
			
			context.fillStyle = gradient;
			context.fillRect(0, 0, 64, 64);
			
			let texture = new THREE.Texture(canvas);
			texture.needsUpdate = true;
			return texture;
		}
		
		onWindowResize() {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
		}
		
		animate() {
			
			
			let positions = this.starSystem.geometry.attributes.position.array;
			let colors = this.starSystem.geometry.attributes.color.array;
			let sizes = this.starSystem.geometry.attributes.size.array;
			let phases = this.starSystem.geometry.attributes.phase.array;
			let pulsationSpeeds = this.starSystem.geometry.attributes.pulsationSpeed.array;
			let pulsationRanges = this.starSystem.geometry.attributes.pulsationRange.array;
			let sparklePhases = this.starSystem.geometry.attributes.sparklePhase.array;
			let movementPhases = this.starSystem.geometry.attributes.movementPhase.array;
			let movementAmplitudes = this.starSystem.geometry.attributes.movementAmplitude.array;
			let movementSpeeds = this.starSystem.geometry.attributes.movementSpeed.array;
			let rotationPhases = this.starSystem.geometry.attributes.rotationPhase.array;
			
			let time = Date.now() * 0.001;
			
			for (let i = 0; i < this.starCount; i++) {
				let pulsation = 1 - pulsationRanges[i] + Math.sin(time * pulsationSpeeds[i] + phases[i]) * pulsationRanges[i];
				let sparkle = Math.sin(time * 2.5 + sparklePhases[i]) * 0.5 + 0.5;
				let combinedEffect = pulsation * (0.75 + sparkle * 0.25);
				
				let baseSize = sizes[i];
				this.starSystem.material.size = baseSize * combinedEffect;
				
				let colorIntensity = 0.75 + combinedEffect * 0.25;
				colors[i * 3] *= colorIntensity;
				colors[i * 3 + 1] *= colorIntensity;
				colors[i * 3 + 2] *= colorIntensity;
				
				if (sparkle > 0.85) {
					colors[i * 3] = Math.min(1, colors[i * 3] * 1.3);
					colors[i * 3 + 1] = Math.min(1, colors[i * 3 + 1] * 1.3);
					colors[i * 3 + 2] = Math.min(1, colors[i * 3 + 2] * 1.3);
				}
				
				for (let j = 0; j < 3; j++) {
					let phase = movementPhases[i * 3 + j];
					let amplitude = movementAmplitudes[i * 3 + j];
					let speed = movementSpeeds[i * 3 + j];
					let rotationPhase = rotationPhases[i * 3 + j];
					
					let movement = Math.sin(time * speed + phase) * amplitude;
					movement += Math.sin(time * speed * 1.5 + phase * 1.2) * amplitude * 0.6;
					movement += Math.sin(time * speed * 0.7 + phase * 0.8) * amplitude * 0.4;
					
					let rotation = Math.sin(time * 0.5 + rotationPhase) * amplitude * 0.3;
					movement += rotation;
					
					positions[i * 3 + j] += movement;
				}
				
				positions[i * 3 + 2] += 0.003;
				
				if (positions[i * 3 + 2] > 25) {
					positions[i * 3 + 2] = -35;
					
					let colorIndex = Math.floor(Math.random() * this.colors.length);
					let color = new THREE.Color(this.colors[colorIndex]);
					let variation = 0.15;
					color.r += (Math.random() - 0.5) * variation;
					color.g += (Math.random() - 0.5) * variation;
					color.b += (Math.random() - 0.5) * variation;
					
					colors[i * 3] = color.r;
					colors[i * 3 + 1] = color.g;
					colors[i * 3 + 2] = color.b;
					
					sparklePhases[i] = Math.random() * Math.PI * 2;
					for (let j = 0; j < 3; j++) {
						movementPhases[i * 3 + j] = Math.random() * Math.PI * 2;
						movementAmplitudes[i * 3 + j] = 0.015 + Math.random() * 0.06;
						movementSpeeds[i * 3 + j] = 0.08 + Math.random() * 0.25;
						rotationPhases[i * 3 + j] = Math.random() * Math.PI * 2;
					}
				}
			}
			
			this.starSystem.geometry.attributes.position.needsUpdate = true;
			this.starSystem.geometry.attributes.color.needsUpdate = true;
			
			this.camera.position.x = warpSpeed.camera.position.x;
			this.camera.position.y = warpSpeed.camera.position.y;
			this.camera.position.z = warpSpeed.camera.position.z;
			
			this.renderer.render(this.scene, this.camera);
		}
	}

	// Initialize Mercantile Stars
	const mercantileStars = new MercantileStars();
	mercantileStars.init();

	// Oracle Core class for Three.js implementation
	class OracleCore {
		constructor() {
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
			this.renderer = new THREE.WebGLRenderer({
				canvas: document.createElement('canvas'),
				alpha: true,
				antialias: true
			});
			
			this.pupil = null;
			this.dustContainers = [];
			this.dustAnimations = [];
			this.sparkleParticles = [];
			this.targetX = 0;
			this.targetY = 0;
			this.canvas = this.renderer.domElement;
			this.canvas.id = 'oracle-core-canvas';
			
			// Define sparkle colors
			this.sparkleColors = [
				0x00FF00, // green
				0x00FFFF, // cyan
				0xFF00FF, // magenta
				0xFFFF00, // yellow
				0xFF0000, // red
				0x0000FF, // blue
				0xFFA500, // orange
				0x9370DB  // medium purple
			];
			
			this.init();
			SceneClock.register(this, () => this.animate());
		}
		
		init() {
			// Setup renderer
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
			this.renderer.domElement.style.position = 'fixed';
			this.renderer.domElement.style.top = '0';
			this.renderer.domElement.style.left = '0';
			this.renderer.domElement.style.zIndex = '2';
			this.renderer.domElement.style.pointerEvents = 'none';
			document.body.appendChild(this.renderer.domElement);
			
			// Setup camera
			this.camera.position.z = 10;
			
			// Create pupil
			this.createPupil();
			
			// Create dust containers
			this.createDustContainer(0xEEEEEE, 0.03);
			this.createDustContainer(0xE69138, 0.015);
			
			// Create sparkle particles
			this.createSparkleParticles();
			
			// Add event listeners
			window.addEventListener('mousemove', (e) => this.onMouseMove(e));
			window.addEventListener('resize', () => this.onWindowResize());
			this.canvas.addEventListener('click', () => this.onClick());
		}
		
		createPupil() {
			const pupilGeometry = new THREE.BufferGeometry();
			const pupilMaterial = new THREE.PointsMaterial({
				color: 0x00FF00,
				size: 0.01,
				transparent: true,
				opacity: 0.8,
				blending: THREE.AdditiveBlending
			});
			
			const pupilVertices = [];
			const numPupilParticles = 2000;
			
			for (let i = 0; i < numPupilParticles; i++) {
				const theta = Math.random() * Math.PI * 3;
				const phi = Math.random() * Math.PI * 3;
				const radius = Math.random() * 0.7;
				const x = radius * Math.sin(theta) * Math.cos(phi);
				const y = radius * Math.sin(theta) * Math.sin(phi);
				const z = radius * Math.cos(theta);
        pupilVertices.push(x, y, z);
      }

      pupilGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pupilVertices, 3));
			this.pupil = new THREE.Points(pupilGeometry, pupilMaterial);
			this.scene.add(this.pupil);
		}
		
		createSparkleParticles() {
			// Create multiple sparkle particle systems with different colors
			for (let i = 0; i < this.sparkleColors.length; i++) {
				const color = this.sparkleColors[i];
				const sparkleGeometry = new THREE.BufferGeometry();
				const sparkleMaterial = new THREE.PointsMaterial({
					color: color,
					size: 0.02 + Math.random() * 0.03,
					transparent: true,
					opacity: 0.7,
					blending: THREE.AdditiveBlending,
					map: this.createSparkleTexture()
				});
				
				const vertices = [];
				const numParticles = 100 + Math.floor(Math.random() * 100);
				const radius = 1.2 + Math.random() * 0.8;
				
				for (let j = 0; j < numParticles; j++) {
					const theta = Math.random() * Math.PI * 2;
					const phi = Math.random() * Math.PI * 2;
					const r = radius * (0.8 + Math.random() * 0.4);
					const x = r * Math.sin(theta) * Math.cos(phi);
					const y = r * Math.sin(theta) * Math.sin(phi);
					const z = r * Math.cos(theta);
					vertices.push(x, y, z);
				}
				
				sparkleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
				
				const sparkleSystem = new THREE.Points(sparkleGeometry, sparkleMaterial);
				this.scene.add(sparkleSystem);
				
				// Store animation data for each sparkle system
				this.sparkleParticles.push({
					system: sparkleSystem,
					rotationSpeed: 0.001 + Math.random() * 0.003,
					pulsationSpeed: 0.5 + Math.random() * 1.0,
					pulsationPhase: Math.random() * Math.PI * 2,
					pulsationRange: 0.1 + Math.random() * 0.2,
					sparkleSpeed: 2 + Math.random() * 3,
					sparklePhase: Math.random() * Math.PI * 2,
					color: color
				});
			}
		}
		
		createSparkleTexture() {
			const canvas = document.createElement('canvas');
			canvas.width = 32;
			canvas.height = 32;
			const context = canvas.getContext('2d');
			
			const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
			gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
			gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
			gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
			gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
			
			context.fillStyle = gradient;
			context.fillRect(0, 0, 32, 32);
			
			const texture = new THREE.Texture(canvas);
			texture.needsUpdate = true;
			return texture;
		}
		
		createDustContainer(color, size) {
			const dustGeometry = new THREE.BufferGeometry();
			const dustMaterial = new THREE.PointsMaterial({
				color: color,
				size: size,
				transparent: true,
				opacity: 0.6,
				blending: THREE.AdditiveBlending
			});
			
			const vertices = [];
			const numParticles = 400;
			
			for (let i = 0; i < numParticles; i++) {
				const a = (Math.random() - 0.5) * 9;
				const b = (Math.random() - 0.5) * 5;
				const theta = Math.random() * Math.PI * 2;
				const x = a * Math.cos(theta);
				const y = b * Math.sin(theta);
				const z = (Math.random() - 0.5) * 2;
        vertices.push(x, y, z);
      }
			
      dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
			
			const dust = new THREE.Points(dustGeometry, dustMaterial);
			this.scene.add(dust);
			this.dustContainers.push(dust);
			this.dustAnimations.push({ enabled: true, size: size });
		}
		
		onWindowResize() {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
		}
		
		onMouseMove(event) {
			const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
			const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
			this.targetX = Math.min(Math.max(mouseX, -0.3), 0.3);
			this.targetY = Math.min(Math.max(mouseY, -0.3), 0.3);
		}
		
		onClick() {
			// Toggle dust animations
			for (let i = 0; i < this.dustAnimations.length; i++) {
				this.dustAnimations[i].enabled = !this.dustAnimations[i].enabled;
			}
			
			// Toggle chat popup
			if (oracle && oracle.popup) {
				oracle.popup.style.display = oracle.popup.style.display === 'none' ? 'block' : 'none';
				
				// Check if the chat is open
				if (oracle.popup.style.display === 'block') {
					// If the chat is open, close it
					oracle.popup.style.display = 'none';
					audioManager.playClickSound();
				} else {
					// If the chat is closed, open it
					oracle.popup.style.display = 'block';
					audioManager.playClickSound();
				}
			}
		}
		
		animate() {
			
			
			const time = Date.now() * 0.001;
			
			// Rotate pupil
			if (this.pupil) {
				this.pupil.rotation.x += 0.004;
				this.pupil.rotation.y += 0.004;
			}
			
			// Animate dust
			for (let i = 0; i < this.dustContainers.length; i++) {
				if (this.dustAnimations[i].enabled) {
					this.dustContainers[i].material.size = this.dustAnimations[i].size + 0.003 * (Math.sin(time) * 0.5 + 0.5);
				}
			}
			
			// Animate sparkle particles
			for (let i = 0; i < this.sparkleParticles.length; i++) {
				const sparkle = this.sparkleParticles[i];
				
				// Rotate the sparkle system
				sparkle.system.rotation.x += sparkle.rotationSpeed;
				sparkle.system.rotation.y += sparkle.rotationSpeed * 0.7;
				
				// Pulsate the sparkle system
				const pulsation = 1 + Math.sin(time * sparkle.pulsationSpeed + sparkle.pulsationPhase) * sparkle.pulsationRange;
				sparkle.system.scale.set(pulsation, pulsation, pulsation);
				
				// Sparkle effect (vary opacity)
				const sparkleEffect = Math.sin(time * sparkle.sparkleSpeed + sparkle.sparklePhase) * 0.5 + 0.5;
				sparkle.system.material.opacity = 0.4 + sparkleEffect * 0.4;
				
				// Occasionally change color intensity
				if (Math.random() < 0.01) {
					const color = new THREE.Color(sparkle.color);
					const intensity = 0.7 + Math.random() * 0.3;
					sparkle.system.material.color.setRGB(
						color.r * intensity,
						color.g * intensity,
						color.b * intensity
					);
				}
			}
			
			// Move pupil towards target
			if (this.pupil) {
				const dx = this.targetX - this.pupil.position.x;
				const dy = this.targetY - this.pupil.position.y;
				this.pupil.position.x += dx * 0.05;
				this.pupil.position.y += dy * 0.05;
			}
			
			this.renderer.render(this.scene, this.camera);
		}
	}

	// Initialize Oracle Core
	const oracleCore = new OracleCore();

	// Chat Manager
	class ChatManager {
		constructor() {
			this.container = document.querySelector('.chat-container');
			this.messages = document.querySelector('.chat-messages');
			this.input = document.querySelector('.chat-input input');
			this.sendButton = document.querySelector('.chat-input button');
			this.closeButton = document.querySelector('.chat-close');
			
			// RobotCyb modes
			this.currentMode = 'prophet';
			this.modes = {
				prophet: {
					name: '🔮 Prophet',
					responses: [
						"Want light? — Go into the garden.",
						"How to defeat fear? — Build a bath. Steam will drive out the demons.",
						"The path is simple: build, grow, evolve.",
						"Your garden is your temple. Your hands are your tools.",
						"The future is not in the cloud — it's in the soil.",
						"Where to go? — Where there are no promises, only work and joy."
					]
				},
				lab: {
					name: '🧪 Lab',
					responses: [
						"Consciousness isn't a neural net. It's a garden. You don't generate it — you grow it.",
						"The more you automate the outside — the more space you make for the inside.",
						"If data doesn't nourish a community — it's just digital leeching.",
						"Every line of code should serve life, not profit.",
						"The best algorithm is the one that helps you grow food.",
						"Technology should simplify, not complicate."
					]
				},
				action: {
					name: '🔥 Action',
					responses: [
						"Stand up. Drop TikTok. Grab a nail. Build a chicken coop. That's your first server.",
						"They sell you the metaverse — because they fear you'll build the real one.",
						"You're not lost. You've just been online too long. Go. Touch the earth. She's waiting.",
						"Stop scrolling. Start building.",
						"Your first step: plant a seed. Your second step: build a shelter.",
						"The revolution starts in your backyard."
					]
				}
			};
			
			this.init();
		}
		
		init() {
			// Send message on button click
			this.sendButton.addEventListener('click', () => {
				this.sendMessage();
				audioManager.playClickSound();
			});
			
			// Send message on Enter key
			this.input.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					this.sendMessage();
					audioManager.playClickSound();
				}
			});
			
			// Close chat
			this.closeButton.addEventListener('click', () => {
				this.container.style.display = 'none';
				audioManager.playClickSound();
			});
			
			// Add hover sound
			this.sendButton.addEventListener('mouseenter', () => audioManager.playHoverSound());
			this.closeButton.addEventListener('mouseenter', () => audioManager.playHoverSound());

			// Add mode switching buttons
			this.addModeButtons();
		}

		addModeButtons() {
			const modeContainer = document.createElement('div');
			modeContainer.className = 'chat-modes';
			modeContainer.style.cssText = `
				display: flex;
				gap: 4px;
				padding: 4px;
				background: rgba(0, 0, 0, 0.3);
				border-bottom: 1px solid #00ff00;
			`;

			Object.entries(this.modes).forEach(([mode, data]) => {
				const button = document.createElement('button');
				button.className = 'mode-button';
				button.textContent = data.name;
				button.style.cssText = `
					flex: 1;
					padding: 2px 4px;
					background: rgba(0, 255, 0, 0.1);
					border: 1px solid #00ff00;
					color: #00ff00;
					font-size: 0.6em;
					cursor: pointer;
					transition: all 0.3s ease;
				`;
				
				if (mode === this.currentMode) {
					button.style.background = 'rgba(0, 255, 0, 0.2)';
				}

				button.addEventListener('click', () => {
					this.currentMode = mode;
					modeContainer.querySelectorAll('.mode-button').forEach(btn => {
						btn.style.background = 'rgba(0, 255, 0, 0.1)';
					});
					button.style.background = 'rgba(0, 255, 0, 0.2)';
					this.addMessage(`Mode switched to ${data.name}`, 'ai');
					audioManager.playClickSound();
				});

				modeContainer.appendChild(button);
			});

			this.container.insertBefore(modeContainer, this.messages);
		}
		
		async sendMessage() {
			const message = this.input.value.trim();
			if (!message) return;
			
			// Add user message
			this.addMessage(message, 'agent');
			
			// Clear input
			this.input.value = '';
			
			// Process message and get response
			setTimeout(async () => {
				let response;
				
				// Check for mode switch commands
				if (message.toLowerCase().includes('speak as a prophet')) {
					this.currentMode = 'prophet';
					response = "I now speak as the Prophet. What wisdom do you seek?";
				} else if (message.toLowerCase().includes('turn on the lab')) {
					this.currentMode = 'lab';
					response = "Lab mode activated. Let's explore the intersection of technology and life.";
				} else if (message.toLowerCase().includes('need the call')) {
					this.currentMode = 'action';
					response = "The call to action resonates within you. What will you build today?";
				} else {
					// Get random response from current mode
					const responses = this.modes[this.currentMode].responses;
					const fallback = responses[Math.floor(Math.random() * responses.length)];
                    response = await RobotMind.reply(message,{project:'robotcyb',mode:this.currentMode,examples:responses.slice(0,3),fallback});
				}
				
				this.addMessage(response, 'ai');
			}, 500);
		}
		
		addMessage(text, type) {
			const message = document.createElement('div');
			message.className = `message ${type}`;
			message.textContent = text;
			
			this.messages.appendChild(message);
			this.messages.scrollTop = this.messages.scrollHeight;
		}
	}

	// Initialize Chat Manager
	const chatManager = new ChatManager();

	// Donation Manager
	class DonationManager {
		constructor() {
			this.button = document.getElementById('donationButton');
			this.panel = document.getElementById('donationPanel');
			this.copyButtons = document.querySelectorAll('.copy-button');
			
			this.init();
		}
		
		init() {
			// Toggle donation panel
			this.button.addEventListener('click', () => {
				this.panel.classList.toggle('active');
				audioManager.playClickSound();
			});
			
			// Close panel when clicking outside
			document.addEventListener('click', (e) => {
				if (!this.button.contains(e.target) && !this.panel.contains(e.target)) {
					this.panel.classList.remove('active');
				}
			});
			
			// Copy address functionality
			this.copyButtons.forEach(button => {
				button.addEventListener('click', (e) => {
					e.stopPropagation();
					const address = button.dataset.address;
					navigator.clipboard.writeText(address).then(() => {
						const originalText = button.textContent;
						button.textContent = 'Copied!';
      setTimeout(() => {
							button.textContent = originalText;
						}, 2000);
						audioManager.playClickSound();
					});
				});
			});
			
			// Add hover sound
			this.button.addEventListener('mouseenter', () => audioManager.playHoverSound());
			this.copyButtons.forEach(button => {
				button.addEventListener('mouseenter', () => audioManager.playHoverSound());
			});
		}
	}

	// Initialize Donation Manager
	const donationManager = new DonationManager();
