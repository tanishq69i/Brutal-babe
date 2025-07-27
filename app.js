// Midnight Bae Pro - Advanced AI Chat Companion
// LLM endpoint placeholder - replace with actual endpoint
const ENDPOINT = 'https://api.example.com/v1/chat/completions';

class MidnightBaePro {
  constructor() {
    // Core data from provided JSON
    this.cultures = [
      { id: "indian", label: "Indian", greeting: "Arre yaar, kya scene hai?", name: "Priya", avatar: "😏" },
      { id: "american", label: "American", greeting: "Hey there, superstar!", name: "Madison", avatar: "✨" },
      { id: "european", label: "European", greeting: "Bonjour, ready to conquer the day?", name: "Elena", avatar: "🌹" },
      { id: "latina", label: "Latina", greeting: "Hola cariño, ¿qué tal?", name: "Isabella", avatar: "🔥" },
      { id: "asian", label: "Asian", greeting: "Hi hi, let's do our best!", name: "Yuki", avatar: "🌸" },
      { id: "african", label: "African", greeting: "Hey champion, rise and shine!", name: "Zara", avatar: "👑" }
    ];

    this.personalities = [
      { id: "sarcastic", label: "Sarcastic Savage", sample: "Really? That's your plan? Bold…" },
      { id: "supportive", label: "Supportive Bestie", sample: "You've totally got this, love!" },
      { id: "drama", label: "Drama Queen", sample: "Oh the suspense! What will you do next?" },
      { id: "chill", label: "Chill Mentor", sample: "Deep breaths, we'll sort it out." },
      { id: "tease", label: "Playful Tease", sample: "Ha! You call that effort?" },
      { id: "coach", label: "Motivational Coach", sample: "Push! Five more reps, let's go!" }
    ];

    // State management
    this.state = {
      culture: 'indian',
      personality: 'sarcastic',
      theme: 'auto',
      offlineJournaling: false,
      messages: [],
      adaptiveLearning: {
        lies: 0,
        promises: 0,
        selfHate: 0,
        toneCoefficient: 1.0
      }
    };

    // Pattern detection
    this.patterns = {
      lies: [
        /i\s*(did|have|had)\s*\d+\s*(pushups?|situps?|workouts?)/i,
        /i\s*already\s*(did|finished|completed)/i,
        /yeah\s*i\s*(totally|definitely)\s*did/i
      ],
      promises: [
        /(tomorrow|definitely|pakka|sure)\s*i\s*will/i,
        /gonna\s*(do|start|begin)/i,
        /i\s*promise\s*i\s*will/i,
        /next\s*(week|month|time)/i
      ],
      selfHate: [
        /(hate\s*myself|i\s*suck|worthless|useless)/i,
        /(i\s*m\s*stupid|i\s*m\s*dumb|i\s*m\s*ugly)/i,
        /(never\s*good\s*enough|failure|pathetic)/i
      ]
    };

    // Element references
    this.elements = {};
    this.currentAbortController = null;
    this.db = null;

    this.init();
  }

  async init() {
    try {
      this.initElements();
      await this.loadState();
      this.setupEventListeners();
      this.setupVirtualKeyboard();
      this.registerServiceWorker();
      this.updateUI();
      await this.showInitialGreeting();
      console.log('Midnight Bae Pro initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  initElements() {
    const elementIds = [
      'companionName', 'cultureLabel', 'personalityLabel', 'avatarEmoji',
      'messages', 'messageInput', 'sendBtn', 'homeBtn', 'settingsBtn',
      'settingsDrawer', 'settingsBackdrop', 'closeSettings',
      'cultureSelect', 'personalitySelect', 'themeSelect', 'offlineJournalingCheck',
      'liesCount', 'promisesCount', 'selfHateCount', 'keyboardFab', 'appHeader'
    ];

    elementIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
      if (!this.elements[id]) {
        console.warn(`Element with id '${id}' not found`);
      }
    });
  }

  async loadState() {
    try {
      // Load from sessionStorage first (in-memory)
      const saved = sessionStorage.getItem('midnightBaePro');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (error) {
      console.warn('Error loading state:', error);
    }
  }

  async saveState() {
    try {
      // Always save to sessionStorage
      sessionStorage.setItem('midnightBaePro', JSON.stringify(this.state));
    } catch (error) {
      console.warn('Error saving state:', error);
    }
  }

  setupEventListeners() {
    // Send message
    if (this.elements.sendBtn) {
      this.elements.sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }

    if (this.elements.messageInput) {
      this.elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      this.elements.messageInput.addEventListener('input', (e) => {
        this.autoResizeTextarea(e.target);
        this.updateSendButton();
      });

      // Initial focus
      setTimeout(() => {
        this.elements.messageInput.focus();
      }, 500);
    }

    // Home button
    if (this.elements.homeBtn) {
      this.elements.homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.elements.messages) {
          this.elements.messages.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // Settings
    if (this.elements.settingsBtn) {
      this.elements.settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openSettings();
      });
    }

    if (this.elements.closeSettings) {
      this.elements.closeSettings.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeSettings();
      });
    }

    if (this.elements.settingsBackdrop) {
      this.elements.settingsBackdrop.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeSettings();
      });
    }

    // Settings controls
    if (this.elements.cultureSelect) {
      this.elements.cultureSelect.addEventListener('change', (e) => {
        this.state.culture = e.target.value;
        this.updateUI();
        this.saveState();
      });
    }

    if (this.elements.personalitySelect) {
      this.elements.personalitySelect.addEventListener('change', (e) => {
        this.state.personality = e.target.value;
        this.updateUI();
        this.saveState();
      });
    }

    if (this.elements.themeSelect) {
      this.elements.themeSelect.addEventListener('change', (e) => {
        this.state.theme = e.target.value;
        this.applyTheme();
        this.saveState();
      });
    }

    if (this.elements.offlineJournalingCheck) {
      this.elements.offlineJournalingCheck.addEventListener('change', (e) => {
        this.state.offlineJournaling = e.target.checked;
        this.saveState();
      });
    }

    // Auto-focus on page click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.settings-drawer')) {
        setTimeout(() => {
          if (this.elements.messageInput) {
            this.elements.messageInput.focus();
          }
        }, 100);
      }
    });

    // Header hiding on scroll
    let lastScrollY = 0;
    if (this.elements.messages) {
      this.elements.messages.addEventListener('scroll', () => {
        const currentScrollY = this.elements.messages.scrollTop;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down
          if (this.elements.appHeader) {
            this.elements.appHeader.classList.add('hidden');
          }
        } else {
          // Scrolling up
          if (this.elements.appHeader) {
            this.elements.appHeader.classList.remove('hidden');
          }
        }
        
        lastScrollY = currentScrollY;
      });
    }
  }

  setupVirtualKeyboard() {
    // VirtualKeyboard API
    if (navigator.virtualKeyboard) {
      navigator.virtualKeyboard.overlaysContent = true;
      
      navigator.virtualKeyboard.addEventListener('geometrychange', () => {
        const { height } = navigator.virtualKeyboard.boundingRect;
        document.documentElement.style.setProperty('--keyboard-offset', `${height}px`);
      });
    }

    // Fallback using visualViewport
    if (window.visualViewport) {
      const updateKeyboardOffset = () => {
        const offset = Math.max(0, window.innerHeight - window.visualViewport.height);
        document.documentElement.style.setProperty('--keyboard-offset', `${offset}px`);
      };

      window.visualViewport.addEventListener('resize', updateKeyboardOffset);
      updateKeyboardOffset();
    }
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Simple service worker for caching
        const swCode = `
          const CACHE_NAME = 'midnight-bae-pro-v1';
          const urlsToCache = [
            '/',
            '/index.html',
            '/style.css',
            '/app.js'
          ];

          self.addEventListener('install', (event) => {
            event.waitUntil(
              caches.open(CACHE_NAME)
                .then((cache) => cache.addAll(urlsToCache))
            );
          });

          self.addEventListener('fetch', (event) => {
            event.respondWith(
              caches.match(event.request)
                .then((response) => {
                  if (response) {
                    return response;
                  }
                  return fetch(event.request);
                })
            );
          });
        `;

        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        await navigator.serviceWorker.register(swUrl);
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  updateUI() {
    const culture = this.cultures.find(c => c.id === this.state.culture);
    const personality = this.personalities.find(p => p.id === this.state.personality);

    // Update header
    if (culture) {
      if (this.elements.companionName) this.elements.companionName.textContent = culture.name;
      if (this.elements.cultureLabel) this.elements.cultureLabel.textContent = culture.label;
      if (this.elements.avatarEmoji) this.elements.avatarEmoji.textContent = culture.avatar;
    }

    if (personality && this.elements.personalityLabel) {
      this.elements.personalityLabel.textContent = personality.label;
    }

    // Update settings
    if (this.elements.cultureSelect) this.elements.cultureSelect.value = this.state.culture;
    if (this.elements.personalitySelect) this.elements.personalitySelect.value = this.state.personality;
    if (this.elements.themeSelect) this.elements.themeSelect.value = this.state.theme;
    if (this.elements.offlineJournalingCheck) this.elements.offlineJournalingCheck.checked = this.state.offlineJournaling;

    // Update stats
    if (this.elements.liesCount) this.elements.liesCount.textContent = this.state.adaptiveLearning.lies;
    if (this.elements.promisesCount) this.elements.promisesCount.textContent = this.state.adaptiveLearning.promises;
    if (this.elements.selfHateCount) this.elements.selfHateCount.textContent = this.state.adaptiveLearning.selfHate;

    this.applyTheme();
  }

  applyTheme() {
    const body = document.body;
    body.removeAttribute('data-theme');
    
    if (this.state.theme !== 'auto') {
      body.setAttribute('data-theme', this.state.theme);
    }
  }

  async showInitialGreeting() {
    if (this.state.messages.length === 0) {
      await this.delay(800);
      const culture = this.cultures.find(c => c.id === this.state.culture);
      if (culture) {
        this.addMessage('ai', culture.greeting);
      }
    } else {
      // Restore messages
      this.state.messages.forEach(msg => {
        this.displayMessage(msg.sender, msg.content, msg.timestamp, false);
      });
      this.scrollToBottom();
    }
  }

  async sendMessage() {
    const input = this.elements.messageInput;
    if (!input) {
      console.error('Message input not found');
      return;
    }

    const content = input.value.trim();
    if (!content) return;

    console.log('Sending message:', content);

    // Clear input immediately
    input.value = '';
    this.autoResizeTextarea(input);
    this.updateSendButton();

    // Add user message
    this.addMessage('user', content);

    // Analyze patterns
    this.analyzeUserPatterns(content);

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Generate response with delay
      await this.delay(1000 + Math.random() * 1500);
      
      const response = this.generateResponse(content);
      this.hideTypingIndicator();
      
      if (response) {
        this.addMessage('ai', response);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      this.hideTypingIndicator();
      this.addMessage('ai', "Sorry babe, I'm having some technical difficulties. Try again?");
    }
  }

  addMessage(sender, content) {
    const timestamp = Date.now();
    const message = { sender, content, timestamp };
    
    this.state.messages.push(message);
    this.displayMessage(sender, content, timestamp, true);
    
    this.saveState();
    this.scrollToBottom();
  }

  displayMessage(sender, content, timestamp, animate = true) {
    if (!this.elements.messages) {
      console.error('Messages container not found');
      return;
    }

    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}`;

    const time = new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    messageEl.innerHTML = `
      <div class="message-content">
        <div class="bubble">${this.escapeHtml(content)}</div>
        <div class="message-time" style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-4);">${time}</div>
      </div>
    `;

    this.elements.messages.appendChild(messageEl);
    
    if (animate) {
      // Trigger animation
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        messageEl.style.transition = 'all 0.3s ease-out';
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
      });
    }
  }

  showTypingIndicator() {
    const template = document.getElementById('typingTemplate');
    if (!template || !this.elements.messages) return;

    this.hideTypingIndicator(); // Remove any existing typing indicator

    const typingEl = template.content.cloneNode(true);
    const typingMessage = typingEl.querySelector('.typing-message');
    if (typingMessage) {
      typingMessage.id = 'typingIndicator';
      this.elements.messages.appendChild(typingEl);
      this.scrollToBottom();
    }
  }

  hideTypingIndicator() {
    const typingEl = document.getElementById('typingIndicator');
    if (typingEl) {
      typingEl.remove();
    }
  }

  analyzeUserPatterns(content) {
    const learning = this.state.adaptiveLearning;

    // Check for lies
    if (this.patterns.lies.some(pattern => pattern.test(content))) {
      learning.lies++;
    }

    // Check for over-promising
    if (this.patterns.promises.some(pattern => pattern.test(content))) {
      learning.promises++;
    }

    // Check for self-hate
    if (this.patterns.selfHate.some(pattern => pattern.test(content))) {
      learning.selfHate++;
    }

    // Adjust tone coefficient
    const totalNegative = learning.lies + learning.promises + learning.selfHate;
    learning.toneCoefficient = Math.max(0.5, Math.min(2.0, 1.0 + (totalNegative * 0.1)));
  }

  generateResponse(userMessage) {
    const culture = this.cultures.find(c => c.id === this.state.culture);
    const personality = this.personalities.find(p => p.id === this.state.personality);
    const learning = this.state.adaptiveLearning;

    // Generate contextual response
    let response = this.generateContextualResponse(userMessage, personality, culture, learning);
    
    // Apply tone coefficient
    if (learning.toneCoefficient > 1.5) {
      response = this.makeToneBrutal(response);
    } else if (learning.toneCoefficient < 0.8) {
      response = this.makeToneGentle(response);
    }

    return response;
  }

  generateContextualResponse(userMessage, personality, culture, learning) {
    const responses = this.getResponseTemplates(personality.id, culture.id, learning);
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getResponseTemplates(personalityId, cultureId, learning) {
    const base = {
      sarcastic: [
        "Oh wow, another life update. Riveting. Tell me more about this fascinating journey of yours.",
        "Let me guess... this is the part where you tell me how this time it's different?",
        "Uh-huh. And how did that work out for you last time, bestie?",
        "Really? That's your brilliant plan? I'm impressed by your optimism.",
        "So you're telling me... this is news? Groundbreaking stuff right here."
      ],
      supportive: [
        "You know what? I really believe you can do this. You've got more strength than you realize.",
        "Hey, progress isn't always linear. You're doing better than you think, love.",
        "I'm here for you, always. What do you need right now?",
        "That's actually really brave of you to share. I'm proud of you for opening up.",
        "You've totally got this! I can see how much you care, and that matters."
      ],
      drama: [
        "OH. MY. GOD. This is like a whole movie plot! What happens next?!",
        "The DRAMA! The suspense! I am literally on the edge of my seat right now!",
        "This is giving me all the feels! Tell me EVERYTHING!",
        "Stop everything! This is the plot twist I didn't see coming!",
        "I cannot even! The emotional rollercoaster is REAL right now!"
      ],
      chill: [
        "Alright, let's take a deep breath here. What's really going on?",
        "No judgment zone, babe. Just tell me what's on your mind.",
        "Everything's gonna work out. Let's figure this out together, yeah?",
        "Hey, slow down for a sec. Let's break this down piece by piece.",
        "It's all good. We'll sort this out, no stress."
      ],
      tease: [
        "Aww, look at you being all vulnerable. It's actually kind of cute.",
        "Someone's in their feelings today! I'm here for this energy.",
        "Oh, so NOW you want to share? I see how it is...",
        "Ha! You call that effort? I've seen toddlers try harder.",
        "Well well well, look who decided to get real with me today."
      ],
      coach: [
        "Alright champion, let's break this down. What's the game plan?",
        "I see potential here! Let's turn this into action, superstar!",
        "No excuses, no delays. What are we doing RIGHT NOW to fix this?",
        "Push! Five more reps, let's go! You've got this in the bag!",
        "That's what I'm talking about! Now show me what you're made of!"
      ]
    };

    let responses = base[personalityId] || base.supportive;

    // Add cultural flavor
    if (cultureId === 'indian') {
      responses = responses.map(r => r.replace(/babe/g, 'yaar').replace(/love/g, 'beta'));
    } else if (cultureId === 'latina') {
      responses = responses.map(r => Math.random() < 0.3 ? r + ' mi amor' : r);
    }

    // Add learning-based callouts
    if (learning.lies > 3) {
      responses.push("Hold up... I'm starting to notice a pattern with your stories. Just saying.");
    }
    
    if (learning.promises > 3) {
      responses.push("Okay, but real talk - you say 'gonna' a lot. When are we actually DOING this?");
    }
    
    if (learning.selfHate > 3) {
      responses.push("Nah, we're not doing this negative self-talk anymore. I won't let you.");
    }

    return responses;
  }

  makeToneBrutal(response) {
    const b