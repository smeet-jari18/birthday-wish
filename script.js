(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const state = {
    recipient: 'Vaishnavi Jii',
    sender: 'someone who adores you',
    audio: null,
    melodyTimer: null,
    candleBlown: false,
    nameStarted: false,
    bouquetUnlocked: false,
    revealUnlocked: false,
    heroUnlocked: false,
  };

  const storageKey = 'birthday-surprise-personalization-vaishnavi';
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved.recipient) state.recipient = saved.recipient;
    if (saved.sender) state.sender = saved.sender;
  } catch (_) {
    // The surprise still works if storage is unavailable.
  }

  const recipientNodes = [$('#hero-recipient'), $('#letter-recipient'), $('#start-recipient'), $('#memories-recipient'), ...$$('.name-placeholder'), ...$$('.reveal-name')].filter(Boolean);
  const senderNode = $('#letter-sender');

  function applyPersonalization() {
    const displayName = state.recipient === 'you' ? 'your favorite person' : state.recipient;
    recipientNodes.forEach((node) => { node.textContent = node.classList.contains('name-placeholder') ? displayName : state.recipient; });
    if (senderNode) senderNode.textContent = state.sender;
    const recipientInput = $('#recipient-input');
    const senderInput = $('#sender-input');
    const birthdayName = $('#birthday-name');
    if (recipientInput) recipientInput.value = state.recipient === 'you' ? '' : state.recipient;
    if (senderInput) senderInput.value = state.sender === 'someone who adores you' ? '' : state.sender;
    if (birthdayName && state.recipient !== 'you') birthdayName.value = state.recipient;
  }
  applyPersonalization();

  function showToast(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function celebrate(count = 58) {
    const layer = $('#confetti-layer');
    if (!layer) return;
    const colors = ['#d84b7e', '#ee8eae', '#8751a3', '#e7a73d', '#f8dce6', '#ffffff'];
    const symbols = ['✦', '✧', '♥'];
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement('span');
      const isCircle = Math.random() > .78;
      const isStar = Math.random() > .88;
      piece.className = `confetti-piece${isCircle ? ' circle' : ''}${isStar ? ' star' : ''}`;
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.color = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--x', `${(Math.random() - .5) * 260}px`);
      piece.style.setProperty('--rotate', `${(Math.random() - .5) * 820}deg`);
      piece.style.setProperty('--fall', `${2.7 + Math.random() * 2.5}s`);
      piece.style.animationDelay = `${Math.random() * .35}s`;
      if (isStar) piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      layer.appendChild(piece);
      window.setTimeout(() => piece.remove(), 6200);
    }
  }

  const stageIndex = { start: 0, ganesha: 1, bouquet: 2, reveal: 3, welcome: 3, memories: 3, wish: 3, cake: 3, final: 3 };
  function updateJourney(target) {
    const step = stageIndex[target] ?? 0;
    $$('.progress-pill').forEach((pill) => {
      $$('.progress-dot', pill).forEach((dot, index) => {
        dot.classList.toggle('current', index === step);
        dot.classList.toggle('done', index < step);
      });
    });
  }

  function unlockStage(id) {
    const section = document.getElementById(id);
    if (!section) return;
    section.setAttribute('aria-hidden', 'false');
  }

  function lockStage(id) {
    const section = document.getElementById(id);
    if (!section) return;
    section.setAttribute('aria-hidden', 'true');
    section.classList.remove('unlocked-reveal', 'active-screen');
  }

  function advanceAfterReveal() {
    state.heroUnlocked = true;
    ['welcome', 'memories', 'wish', 'cake', 'final'].forEach(unlockStage);
  }

  function setActiveNav(target) {
    $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.target === target));
  }

  function showScreen(target, options = {}) {
    const section = document.getElementById(target);
    if (!section) return;
    $$('.screen').forEach((screen) => {
      screen.classList.toggle('active-screen', screen === section);
      screen.setAttribute('aria-hidden', screen === section ? 'false' : 'true');
    });
    updateJourney(target);
    setActiveNav(target);
    if (options.reveal) {
      section.classList.remove('section-reveal');
      void section.offsetWidth;
      section.classList.add('section-reveal');
    }
    window.scrollTo({ top: 0, behavior: options.instant ? 'auto' : 'smooth' });
  }

  function goTo(target, options = {}) {
    const section = document.getElementById(target);
    if (!section) return;
    const gatedUntilName = ['ganesha', 'bouquet', 'reveal', 'welcome', 'memories', 'wish', 'cake', 'final'];
    if (target !== 'start' && gatedUntilName.includes(target) && !state.nameStarted) {
      showToast('First add her name to begin the surprise ✨');
      return showScreen('start', { instant: true });
    }
    if (target === 'bouquet' && state.nameStarted && !state.bouquetUnlocked) {
      state.bouquetUnlocked = true;
      unlockStage('bouquet');
    }
    if (target === 'reveal' && !state.bouquetUnlocked) {
      showToast('First reach the flowers, then tap the bouquet 💐');
      return showScreen('ganesha', { instant: true });
    }
    const gatedUntilAfterReveal = ['welcome', 'memories', 'wish', 'cake', 'final'];
    if (gatedUntilAfterReveal.includes(target) && !state.heroUnlocked) {
      showToast(state.revealUnlocked ? 'Tap continue on the birthday wish first ✨' : 'Tap the bouquet to reveal the birthday wish 💐');
      return state.revealUnlocked ? showScreen('reveal', { instant: true }) : showScreen('bouquet', { instant: true });
    }
    showScreen(target, options);
  }

  $$('.nav-item, [data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      if (!target) return;
      if (target === 'bouquet' && state.nameStarted && !state.bouquetUnlocked) {
        state.bouquetUnlocked = true;
        unlockStage('bouquet');
      }
      if (target === 'welcome' && state.revealUnlocked && !state.heroUnlocked) {
        advanceAfterReveal();
      }
      goTo(target, { reveal: !['start', 'ganesha', 'bouquet', 'reveal', 'welcome'].includes(target) });
    });
  });

  const sections = ['start', 'ganesha', 'bouquet', 'reveal', 'welcome', 'memories', 'wish', 'cake', 'final']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        setActiveNav(visible.target.id);
        updateJourney(visible.target.id);
      }
    }, { threshold: [0.25, 0.45, 0.7], rootMargin: '-12% 0px -30% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  // Rotate the devotional blessings automatically, with manual swipe-like controls too.
  const deityCarousel = $('#deity-carousel');
  const deitySlides = deityCarousel ? $$('.deity-slide', deityCarousel) : [];
  const deityDots = $$('.deity-dots button');
  const deityCaption = $('#deity-caption');
  const deityTitle = $('#deity-title');
  const deityBlessing = $('#deity-blessing');
  let deityIndex = 0;
  let deityTimer = null;

  function showDeity(nextIndex) {
    if (!deitySlides.length) return;
    deityIndex = (nextIndex + deitySlides.length) % deitySlides.length;
    deitySlides.forEach((slide, index) => slide.classList.toggle('active', index === deityIndex));
    deityDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === deityIndex);
      dot.setAttribute('aria-current', index === deityIndex ? 'true' : 'false');
    });
    const activeSlide = deitySlides[deityIndex];
    if (deityCaption) deityCaption.textContent = activeSlide.dataset.caption || '';
    if (deityTitle) deityTitle.innerHTML = (activeSlide.dataset.title || '').replace(/(light|everywhere|strength)$/i, '<em>$1</em>');
    if (deityBlessing) deityBlessing.textContent = activeSlide.dataset.blessing || '';
  }

  function startDeityAutoPlay() {
    window.clearInterval(deityTimer);
    if (deitySlides.length > 1) deityTimer = window.setInterval(() => showDeity(deityIndex + 1), 2800);
  }
  function pauseDeityAutoPlay() { window.clearInterval(deityTimer); deityTimer = null; }
  $('#deity-next')?.addEventListener('click', () => { showDeity(deityIndex + 1); startDeityAutoPlay(); });
  $('#deity-prev')?.addEventListener('click', () => { showDeity(deityIndex - 1); startDeityAutoPlay(); });
  deityDots.forEach((dot) => dot.addEventListener('click', () => { showDeity(Number(dot.dataset.deity)); startDeityAutoPlay(); }));
  deityCarousel?.addEventListener('mouseenter', pauseDeityAutoPlay);
  deityCarousel?.addEventListener('mouseleave', startDeityAutoPlay);
  deityCarousel?.addEventListener('focusin', pauseDeityAutoPlay);
  deityCarousel?.addEventListener('focusout', startDeityAutoPlay);
  let touchStartX = null;
  deityCarousel?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
    pauseDeityAutoPlay();
  }, { passive: true });
  deityCarousel?.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const distance = touchEndX - touchStartX;
    if (Math.abs(distance) > 35) showDeity(distance < 0 ? deityIndex + 1 : deityIndex - 1);
    touchStartX = null;
    startDeityAutoPlay();
  }, { passive: true });
  showDeity(0);
  startDeityAutoPlay();

  // The requested story flow begins with her name, then a Ganesh ji blessing, then flowers.
  $('#name-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const enteredName = $('#birthday-name')?.value.trim();
    if (!enteredName) return;
    state.recipient = enteredName;
    state.nameStarted = true;
    applyPersonalization();
    unlockStage('ganesha');
    celebrate(34);
    showToast(`This little surprise is now ready for ${state.recipient} ✨`);
    window.setTimeout(() => goTo('ganesha', { reveal: true }), 350);
  });

  let bouquetIsRevealing = false;
  function revealFromBouquet() {
    if (!state.nameStarted) return goTo('start');
    if (bouquetIsRevealing) return;
    bouquetIsRevealing = true;
    const bouquetPhoto = $('#bouquet-photo');
    bouquetPhoto?.classList.add('bouquet-tapped');
    state.bouquetUnlocked = true;
    state.revealUnlocked = true;
    unlockStage('reveal');
    celebrate(112);
    showToast(`Happy Birthday, ${state.recipient}! Your wish has arrived ✨`);
    window.setTimeout(() => {
      bouquetPhoto?.classList.remove('bouquet-tapped');
      bouquetIsRevealing = false;
      goTo('reveal', { reveal: true });
    }, 760);
  }
  $('#tap-bouquet')?.addEventListener('click', revealFromBouquet);
  $('#bouquet-photo')?.addEventListener('click', revealFromBouquet);
  $('#bouquet-photo')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      revealFromBouquet();
    }
  });

  const openSurprise = $('#open-surprise');
  openSurprise?.addEventListener('click', () => {
    state.journeyOpened = true;
    celebrate(78);
    showToast(`A little magic, made just for ${state.recipient}.`);
    window.setTimeout(() => goTo('memories', { reveal: true }), 280);
  });

  // Secret wish form.
  const wishInput = $('#wish-input');
  const wishCount = $('#wish-count');
  wishInput?.addEventListener('input', () => {
    if (wishCount) wishCount.textContent = `${wishInput.value.length} / 180`;
  });
  $('#wish-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const wishForm = $('#wish-form');
    const wishStatus = $('#wish-status');
    if (!wishInput?.value.trim()) return;
    wishForm.classList.remove('sent');
    void wishForm.offsetWidth;
    wishForm.classList.add('sent');
    if (wishStatus) wishStatus.textContent = 'Your wish is tucked safely among the stars ✦';
    celebrate(36);
    showToast('Wish received. The universe is listening ✦');
    window.setTimeout(() => goTo('cake', { reveal: true }), 900);
  });

  // Birthday candle.
  const blowButton = $('#blow-candle');
  const bigFlame = $('#big-flame');
  const heroFlame = $('#hero-flame');
  const candleMessage = $('#candle-message');
  function resetCandle() {
    state.candleBlown = false;
    bigFlame?.classList.remove('off');
    heroFlame?.classList.remove('off');
    if (candleMessage) candleMessage.textContent = 'Close your eyes. The best is still on its way.';
    if (blowButton) blowButton.innerHTML = '<span aria-hidden="true">✦</span> Blow out the candle';
  }
  blowButton?.addEventListener('click', () => {
    if (state.candleBlown) {
      resetCandle();
      return;
    }
    state.candleBlown = true;
    bigFlame?.classList.add('off');
    heroFlame?.classList.add('off');
    if (candleMessage) candleMessage.textContent = `Wish made, ${state.recipient}. May every beautiful thing find you.`;
    if (blowButton) blowButton.innerHTML = '<span aria-hidden="true">↻</span> Light it again';
    celebrate(94);
    showToast('The candle is out — your wish is on its way ✨');
  });

  // The final blessing is sealed inside a letter. The poster opens in a lightbox; the letter has its own button.
  const letterCard = $('#letter-card');
  const letterContent = $('.letter-content');
  function openBlessingLetter() {
    if (!letterCard) return;
    letterCard.classList.add('is-open');
    letterContent?.setAttribute('aria-hidden', 'false');
    celebrate(42);
    showToast(`A blessing for you, ${state.recipient} ✨`);
  }
  $('#open-letter-button')?.addEventListener('click', openBlessingLetter);

  const photoLightbox = $('#photo-lightbox');
  const lightboxImage = $('#lightbox-image');
  const lightboxCaption = $('#lightbox-caption');
  function openPhotoLightbox(path, alt) {
    if (!photoLightbox || !lightboxImage) return;
    lightboxImage.src = path;
    lightboxImage.alt = alt || 'Vaishnavi Jii photo';
    if (lightboxCaption) lightboxCaption.textContent = `${state.recipient} ✦`;
    photoLightbox.classList.add('open');
    photoLightbox.setAttribute('aria-hidden', 'false');
  }
  function closePhotoLightbox() {
    if (!photoLightbox) return;
    photoLightbox.classList.remove('open');
    photoLightbox.setAttribute('aria-hidden', 'true');
    if (lightboxImage) lightboxImage.src = '';
  }
  $$('[data-lightbox]').forEach((photo) => {
    const open = () => openPhotoLightbox(photo.dataset.lightbox, photo.dataset.photoAlt);
    photo.addEventListener('click', open);
    photo.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
  $('#photo-lightbox-close')?.addEventListener('click', closePhotoLightbox);
  photoLightbox?.addEventListener('click', (event) => {
    if (event.target === photoLightbox) closePhotoLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePhotoLightbox();
  });

  $('#replay-button')?.addEventListener('click', () => {
    resetCandle();
    closePhotoLightbox();
    letterCard?.classList.remove('is-open');
    letterContent?.setAttribute('aria-hidden', 'true');
    if (wishInput) wishInput.value = '';
    if (wishCount) wishCount.textContent = '0 / 180';
    const wishStatus = $('#wish-status');
    if (wishStatus) wishStatus.textContent = '';
    state.nameStarted = false;
    state.bouquetUnlocked = false;
    state.revealUnlocked = false;
    state.heroUnlocked = false;
    ['ganesha', 'bouquet', 'reveal', 'welcome', 'memories', 'wish', 'cake', 'final'].forEach(lockStage);
    showScreen('start', { reveal: true, instant: true });
    celebrate(46);
    showToast('Starting the birthday magic again ✨');
  });

  // Personalization modal.
  const modal = $('#personalize-modal');
  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => $('#recipient-input')?.focus(), 80);
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  $('.profile-button')?.addEventListener('click', openModal);
  $('.modal-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
  $('#personalize-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const recipientValue = $('#recipient-input')?.value.trim();
    const senderValue = $('#sender-input')?.value.trim();
    state.recipient = recipientValue || 'you';
    state.sender = senderValue || 'someone who adores you';
    try { localStorage.setItem(storageKey, JSON.stringify({ recipient: state.recipient, sender: state.sender })); } catch (_) { /* no-op */ }
    applyPersonalization();
    closeModal();
    showToast('Your personal touch has been saved ✨');
  });

  // A tiny, gentle melody made with the browser audio API. It only starts after a user click.
  const melodyButton = $('.melody-toggle');
  const melodyNotes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 392.0];
  function playNote(frequency, startTime, duration = .42) {
    if (!state.audio) return;
    const oscillator = state.audio.createOscillator();
    const gain = state.audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(.055, startTime + .035);
    gain.gain.exponentialRampToValueAtTime(.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(state.audio.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + .03);
  }
  function startMelody() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      showToast('Your browser does not support the melody, but the wishes still work ✦');
      return;
    }
    state.audio = state.audio || new AudioContext();
    state.audio.resume?.();
    let noteIndex = 0;
    const schedule = () => {
      const start = state.audio.currentTime + .04;
      melodyNotes.forEach((note, index) => playNote(note, start + index * .33, .43));
      noteIndex = (noteIndex + melodyNotes.length) % melodyNotes.length;
    };
    schedule();
    state.melodyTimer = window.setInterval(schedule, melodyNotes.length * 330);
    melodyButton?.classList.add('playing');
    melodyButton?.setAttribute('aria-pressed', 'true');
    melodyButton?.setAttribute('aria-label', 'Pause the birthday melody');
  }
  function stopMelody() {
    window.clearInterval(state.melodyTimer);
    state.melodyTimer = null;
    melodyButton?.classList.remove('playing');
    melodyButton?.setAttribute('aria-pressed', 'false');
    melodyButton?.setAttribute('aria-label', 'Play the birthday melody');
  }
  melodyButton?.addEventListener('click', () => {
    if (state.melodyTimer) stopMelody();
    else startMelody();
  });

  // Keep the initial nav state deterministic on reload.
  showScreen('start', { instant: true });
})();
