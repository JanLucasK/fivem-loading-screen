(() => {
  'use strict';
  const config = window.NEOV_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const preview = new URLSearchParams(location.search).get('preview') === '1'
    && ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const fallbackImage = 'media/life-city.jpg';
  const duration = Math.max(4000, Number(config.slideDuration) || 10000);
  const fallbackStory = { category: 'WILLKOMMEN AUF NEO V', label: 'Deine Geschichte', title: ['Eine Stadt.', 'Deine Geschichte.'], description: 'Dein nächstes Kapitel beginnt in Los Santos.', image: fallbackImage, imageAlt: 'Los Santos bei Nacht', meta: 'NEO V ROLEPLAY', footnote: 'Willkommen zu Hause' };
  const stories = Array.isArray(config.stories) && config.stories.some(item => item && typeof item === 'object')
    ? config.stories.filter(item => item && typeof item === 'object').map(item => ({ ...fallbackStory, ...item })) : [fallbackStory];
  const stage = $('#story-stage');
  const tabs = $('#story-tabs');
  let current = 0, elapsed = 0, lastFrame = 0, frameId = 0;
  let paused = reducedMotion.matches, closing = false;
  let progress = 0, previewTimer = 0;
  const mediaPath = (value) => {
    if (typeof value !== 'string' || !value.trim()) return '';
    // Restrict configurable resources to local assets or HTTPS media.
    try {
      const url = new URL(value, location.href);
      return url.origin === location.origin || url.protocol === 'https:' ? url.href : '';
    } catch { return ''; }
  };
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    return node;
  };
  const image = (src, className, alt, fallback = '') => {
    const node = element('img', className);
    node.alt = alt || '';
    node.draggable = false;
    node.addEventListener('error', () => {
      if (fallback && node.dataset.fallback !== 'true') {
        node.dataset.fallback = 'true'; node.src = fallback;
      } else { node.hidden = true; }
    });
    node.src = mediaPath(src) || fallback;
    return node;
  };
  const safeHomepage = mediaPath(config.homepage);
  if (safeHomepage) $('.brand').href = safeHomepage;

  const socials = [...(safeHomepage ? [{ label: 'Homepage', url: safeHomepage }] : []), ...(Array.isArray(config.socials) ? config.socials : [])];
  socials.filter(item => item && typeof item.label === 'string').forEach(item => {
    const placeholder = item.url === '#';
    let url = placeholder ? '#' : '';
    try {
      const target = new URL(item.url);
      if (target.protocol === 'https:' && !target.username && !target.password) url = target.href;
    } catch { /* Unconfigured destinations are never turned into dummy links. */ }
    if (!url && !preview) return;
    const link = element(url ? 'a' : 'span', 'social-link');
    const top = element('span', 'social-link-top');
    top.append(element('span', 'social-name', item.label));
    const arrow = element('span', 'social-arrow', url ? '↗' : '');
    arrow.setAttribute('aria-hidden', 'true');
    top.append(arrow);
    link.append(top);
    if (url) {
      link.href = url;
      if (placeholder) {
        link.addEventListener('click', event => event.preventDefault());
        link.setAttribute('aria-label', `${item.label} (Platzhalter)`);
        link.setAttribute('aria-disabled', 'true');
        link.classList.add('is-unconfigured');
      } else {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${item.label} öffnen (neuer Tab)`);
      }
    } else {
      link.classList.add('is-unconfigured');
      link.setAttribute('aria-disabled', 'true');
      link.title = 'Design-Vorschau: Kanal-Link noch nicht hinterlegt';
    }
    $('#social-links').append(link);
  });
  const hasSocials = $('#social-links').childElementCount > 0;
  $('.social-footer').hidden = !hasSocials;
  $('.screen').classList.toggle('has-socials', hasSocials);


  stories.forEach((story, index) => {
    const article = element('article', 'story');
    article.id = `story-${index}`;
    article.setAttribute('role', 'group');
    article.setAttribute('aria-roledescription', 'Folie');
    article.setAttribute('aria-label', `${index + 1} von ${stories.length}: ${story.label}`);
    article.append(image(story.image, 'story-image', story.imageAlt, fallbackImage));
    if (mediaPath(story.logo)) article.append(image(story.logo, 'story-logo', story.logoAlt || story.label));
    const copy = element('div', 'story-copy');
    const category = element('div', 'story-category');
    if (mediaPath(story.icon)) category.append(image(story.icon, 'story-icon', ''));
    category.append(element('span', '', story.category));
    const title = element('h3');
    (Array.isArray(story.title) ? story.title : [story.title]).forEach((line, i) => {
      const mask = element('span', 'title-line');
      const text = element('span', 'title-word', line);
      text.style.setProperty('--line-index', String(i));
      mask.append(text);
      title.append(mask);
    });
    const meta = element('div', 'story-meta');
    meta.append(element('span', '', story.meta), element('span', '', story.footnote));
    copy.append(category, title, element('p', 'story-description', story.description), meta);
    article.append(copy);
    stage.append(article);
    const tab = element('button', 'story-tab');
    tab.type = 'button';
    tab.setAttribute('aria-controls', article.id);
    tab.setAttribute('aria-label', `Meldung ${index + 1}: ${story.label}`);
    tab.append(element('span', 'tab-number', String(index + 1).padStart(2, '0')), element('span', 'tab-title', story.label));
    tab.addEventListener('click', () => show(index));
    tabs.append(tab);
  });

  let transitionAnimations = [];
  function show(index) {
    const previous = current;
    const next = (index + stories.length) % stories.length;
    const direction = index < current ? -1 : 1;
    current = next;
    elapsed = 0;
    lastFrame = performance.now();
    tabs.style.setProperty('--cycle', '0');
    transitionAnimations.forEach(animation => animation.cancel());
    transitionAnimations = [];
    [...stage.children].forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.classList.toggle('is-outgoing', i === previous && previous !== current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    [...tabs.children].forEach((tab, i) => {
      tab.setAttribute('aria-current', String(i === current));
      tab.classList.toggle('is-complete', i < current);
    });
    $('#slide-counter').textContent = `${String(current + 1).padStart(2, '0')} / ${String(stories.length).padStart(2, '0')}`;
    if (!reducedMotion.matches && previous !== current) {
      const incoming = stage.children[current];
      const outgoing = stage.children[previous];
      // A single angled aperture, echoing the mark. Cancellation makes rapid input safe.
      const cut = direction > 0
        ? 'polygon(118% 0, 118% 0, 100% 100%, 100% 100%)'
        : 'polygon(0 0, 0 0, -18% 100%, -18% 100%)';
      const reveal = incoming.animate([
        { clipPath: cut },
        { clipPath: 'polygon(0 0, 118% 0, 100% 100%, -18% 100%)' }
      ], { duration: 1050, easing: 'cubic-bezier(.76,0,.24,1)' });
      transitionAnimations.push(reveal);
      transitionAnimations.push(outgoing.animate([
        { transform: 'translateX(0)', opacity: 1 },
        { transform: `translateX(${-direction * 3}%)`, opacity: .55 }
      ], { duration: 1050, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }));
      reveal.finished.then(() => outgoing.classList.remove('is-outgoing')).catch(() => {});
    }
  }
  function updatePause() {
    $('#toggle-rotation').setAttribute('aria-pressed', String(paused));
    $('#toggle-rotation').setAttribute('aria-label', paused ? 'Automatischen Wechsel fortsetzen' : 'Automatischen Wechsel pausieren');
    $('#pause-glyph').textContent = paused ? '▷' : 'Ⅱ';
    stage.setAttribute('aria-live', paused ? 'polite' : 'off');
    $('#cycle-status').textContent = stories.length < 2 ? 'Aktuell' : paused ? 'Pausiert' : 'Automatisch';
    $('#toggle-rotation').title = paused ? 'Automatischen Wechsel fortsetzen' : 'Automatischen Wechsel pausieren';
    lastFrame = performance.now();
  }
  $('#previous').addEventListener('click', () => show(current - 1));
  $('#next').addEventListener('click', () => show(current + 1));
  $('#toggle-rotation').addEventListener('click', () => { paused = !paused; updatePause(); });
  [$('#previous'), $('#next'), $('#toggle-rotation')].forEach(button => { button.disabled = stories.length < 2; });
  // Pointer focus is not a pause signal. Keyboard users get an explicit pause,
  // which the play button can resume even while it retains focus.
  $('.stories').addEventListener('focusin', (event) => {
    if (event.target.matches(':focus-visible')) { paused = true; updatePause(); }
  });
  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.code === 'Space' && event.target === document.body) {
      event.preventDefault(); paused = !paused; updatePause();
    }
  });

  const portalVideo = $('#portal-video');
  const portalImage = $('#portal-image');
  let videoGeneration = 0;
  function setPortal(poster, video) {
    const source = mediaPath(video);
    const generation = ++videoGeneration;
    portalImage.src = mediaPath(poster) || fallbackImage;
    portalVideo.pause();
    portalVideo.hidden = true;
    portalVideo.oncanplay = null;
    portalVideo.removeAttribute('src');
    if (source && !reducedMotion.matches) {
      portalVideo.src = source;
      portalVideo.oncanplay = () => {
        if (generation !== videoGeneration || closing || document.hidden) return;
        portalVideo.play().then(() => {
          if (generation === videoGeneration) portalVideo.hidden = false;
        }).catch(() => { portalVideo.hidden = true; });
      };
    }
    portalVideo.load();
  }
  portalVideo.addEventListener('error', () => { portalVideo.hidden = true; });
  portalImage.addEventListener('error', () => {
    if (portalImage.getAttribute('src') !== fallbackImage) portalImage.src = fallbackImage;
  });
  setPortal(config.portal?.image, config.portal?.video);

  function tick(time) {
    if (closing) return;
    const delta = lastFrame ? Math.max(0, time - lastFrame) : 0;
    lastFrame = time;
    if (!paused && stories.length > 1) {
      elapsed += delta;
      if (elapsed >= duration) show(current + 1);
      tabs.style.setProperty('--cycle', String(elapsed / duration));
    }
    frameId = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frameId);
    lastFrame = 0;
    if (document.hidden) portalVideo.pause();
    else if (!closing) {
      frameId = requestAnimationFrame(tick);
      if (portalVideo.getAttribute('src') && !reducedMotion.matches) portalVideo.play().catch(() => {});
    }
  });
  reducedMotion.addEventListener('change', () => {
    paused = reducedMotion.matches;
    updatePause();
    transitionAnimations.forEach(animation => animation.cancel());
    stage.querySelectorAll('.is-outgoing').forEach(slide => slide.classList.remove('is-outgoing'));
    setPortal(config.portal?.image, config.portal?.video);
  });

  function setProgress(fraction) {
    if (typeof fraction !== 'number' || !Number.isFinite(fraction)) return;
    progress = Math.max(progress, Math.min(1, Math.max(0, fraction)));
    const percent = Math.round(progress * 100);
    $('#progress-label').textContent = String(percent).padStart(2, '0');
    $('#progress-fill').style.width = `${percent}%`;
    $('.loading').setAttribute('aria-valuenow', String(percent));
    // Trace both original paths as one continuous total, weighted by actual length.
    const paths = [...document.querySelectorAll('.logo-progress')];
    const lengths = paths.map(path => path.getTotalLength());
    const total = lengths.reduce((sum, length) => sum + length, 0);
    let traced = progress * total;
    paths.forEach((path, i) => {
      path.style.strokeDashoffset = String(100 * (1 - Math.min(1, Math.max(0, traced / lengths[i]))));
      traced -= lengths[i];
    });
    if (percent === 100) $('#loading-detail').textContent = 'Warte auf die Freigabe der Spielwelt.';
  }
  function shutdown() {
    if (closing) return;
    closing = true;
    clearInterval(previewTimer);
    cancelAnimationFrame(frameId);
    portalVideo.pause();
    transitionAnimations.forEach(animation => animation.cancel());
    setProgress(1);
    $('#status-text').textContent = 'Deine Geschichte beginnt jetzt.';
    $('#connection-label').textContent = 'WILLKOMMEN IN LOS SANTOS';
    document.body.classList.add('fade-out');
    setTimeout(() => {
      if (preview) return;
      const resource = typeof GetParentResourceName === 'function' ? GetParentResourceName() : 'fivem-loading-screen';
      fetch(`https://${resource}/shutdownLoadingScreenNui`, {
        method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: '{}'
      }).catch(() => { /* client.lua also closes the NUI after 1000ms. */ });
    }, reducedMotion.matches ? 0 : 600);
  }
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object' || closing) return;
    switch (data.eventName) {
      case 'loadProgress': setProgress(data.loadFraction); break;
      case 'beginMap':
      case 'performMapLoadFunction': $('#status-text').textContent = 'Los Santos erwacht'; break;
      case 'startDataFileEntries': $('#status-text').textContent = 'Inhalte werden geladen'; break;
      case 'startInitFunction': $('#status-text').textContent = 'Deine Spielwelt wird vorbereitet'; break;
      case 'onScriptConnecting': $('#status-text').textContent = 'Verbindung wird hergestellt'; break;
      case 'onScriptConnected':
        $('#status-text').textContent = 'Verbindung hergestellt';
        $('#connection-label').textContent = 'MIT NEO V VERBUNDEN'; break;
      case 'shutdownLoadingScreen': shutdown(); break;
    }
  });
  show(0);
  updatePause();
  setProgress(0);
  frameId = requestAnimationFrame(tick);
  if (preview) {
    $('#preview-label').hidden = false;
    $('#connection-label').textContent = 'NEO V · DESIGN-VORSCHAU';
    $('#status-text').textContent = 'Los Santos erwacht';
    setProgress(.37);
    previewTimer = setInterval(() => {
      if (progress < .94) setProgress(progress + .003);
    }, 1500);
  }
  window.addEventListener('pagehide', () => { clearInterval(previewTimer); cancelAnimationFrame(frameId); portalVideo.pause(); });
})();
