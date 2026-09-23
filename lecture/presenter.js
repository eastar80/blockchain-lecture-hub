/* ============================================================
   lecture/presenter.js — 강사용 제어화면

   원칙
   - Presenter 가 진행의 主다. 여기서 누르면 Stage 가 따라온다.
     Stage 에서 직접 넘기던 기존 조작도 그대로 살아 있고, 그때는 Presenter 가 따라간다.
   - 상태는 언제나 고정 ID(pow-challenge)로 들고, 화면에는 번호(L14)를 보여준다.
   - 미리보기는 실제 Stage 를 ?preview=1 로 띄운 것이다. 별도의 축소 UI 를 만들지 않는다.
     미리보기 안에서 무엇을 해도 실제 강의는 움직이지 않는다.
   - 대본·다음 화면·시간은 Presenter 에만 있다. 프로젝터에는 절대 나가지 않는다.
   ============================================================ */
(function () {
  'use strict';

  const STAGE_PAGE = './index.html';
  const PREVIEW_PAGE = './index.html?preview=1';

  /* ------------------------------------------------------------
     화면 목록 — 고정 ID 와 번호 양쪽으로 찾는다
     ------------------------------------------------------------ */
  const INDEX = new Map();
  SCREENS.forEach((screen, i) => {
    INDEX.set(screen.id, i);
    INDEX.set(screen.number, i);
  });

  const indexOf = value => (typeof value === 'string' && INDEX.has(value) ? INDEX.get(value) : -1);
  const findScreen = value => {
    const i = indexOf(value);
    return i < 0 ? null : SCREENS[i];
  };

  const notesOf = screen =>
    (screen && typeof PRESENTER_NOTES === 'object' && PRESENTER_NOTES[screen.id]) || null;

  /* 목표 누적시간 — ‘이 화면에 도착했어야 하는 시각’ */
  const CUMULATIVE = [];
  let sumSoFar = 0;
  SCREENS.forEach(screen => {
    CUMULATIVE.push(sumSoFar);
    const notes = notesOf(screen);
    sumSoFar += notes ? notes.targetSeconds : 0;
  });
  const TOTAL_SECONDS = sumSoFar;

  const DEMO = (findScreen('real-network') || {}).demo || null;

  const plain = text =>
    String(text || '').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

  const escapeText = text =>
    String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ------------------------------------------------------------
     상태
     ------------------------------------------------------------ */
  const state = {
    screenId: SCREENS[0].id,
    mode: 'lecture',            // lecture | experience | network-demo
    experience: null,           // { label, returnTo }
    startedAt: null,            // 강의 시작 시각(ms)
    pausedElapsed: 0,           // 일시정지까지 흐른 시간(ms)
    stageSeenAt: 0              // Stage 소식을 마지막으로 들은 시각
  };

  let stageWindow = null;       // [Stage 열기] 로 연 창. 체험·Demo 복귀에 쓴다.

  const el = id => document.getElementById(id);
  const ui = {
    number: el('pNumber'), eyebrow: el('pEyebrow'), stable: el('pStable'), title: el('pTitle'),
    elapsed: el('pElapsed'), total: el('pTotal'), target: el('pTarget'), drift: el('pDrift'),
    timerToggle: el('pTimerToggle'), timerReset: el('pTimerReset'),
    linkState: document.querySelector('.p-link-state'), linkLabel: el('pLinkLabel'), openStage: el('pOpenStage'),
    currentSub: el('pCurrentSub'), currentFrame: el('pCurrentFrame'), currentView: el('pCurrentView'),
    mode: el('pMode'), modeTag: el('pModeTag'), modeTitle: el('pModeTitle'), modeDesc: el('pModeDesc'),
    modeReturn: el('pModeReturn'), modeEnd: el('pModeEnd'),
    nextSub: el('pNextSub'), nextFrame: el('pNextFrame'), nextView: el('pNextView'),
    nextEmpty: el('pNextEmpty'), nextTitle: el('pNextTitle'),
    notes: el('pNotes'), notesSub: el('pNotesSub'),
    prev: el('pPrev'), next: el('pNext'), count: el('pCount'), section: el('pSection'),
    tocButton: el('pTocButton'), experience: el('pExperience'), network: el('pNetwork'),
    toc: el('pToc'), tocList: el('pTocList'), tocClose: el('pTocClose'), tocBackdrop: el('pTocBackdrop')
  };

  /* ------------------------------------------------------------
     Stage 연결
     ------------------------------------------------------------ */
  const sync = createLectureSync(onMessage);

  function onMessage(message) {
    switch (message.type) {
      case 'STAGE_STATE':
        state.stageSeenAt = Date.now();
        if (message.mode === 'experience') {
          /* Stage 쪽에서 직접 체험으로 들어간 경우에도 Presenter 가 따라 붙는다 */
          const back = findScreen(message.returnTo);
          if (back) enterExperience(findScreen(message.from) || currentScreen(), back, { drive: false });
        } else if (message.initial) {
          /* 방금 열린 Stage 다. 위치를 따라가지 않는다 — 곧 오는 READY 에 지금 위치를 알려준다. */
          renderLink();
        } else if (message.screenId && message.screenId !== state.screenId) {
          setScreen(message.screenId, { broadcast: false });
        } else if (message.screenId && state.mode !== 'lecture') {
          setMode('lecture');
          render();
        }
        renderLink();
        break;

      case 'READY':
        /* Stage 가 나중에 열렸다. 지금 위치로 끌어온다. */
        state.stageSeenAt = Date.now();
        if (state.mode === 'lecture') sync.post('STATE_SYNC', { screenId: state.screenId });
        renderLink();
        break;

      default:
        break;
    }
  }

  /* 프로젝터 창을 직접 옮긴다.
     체험도구나 외부 Dashboard 처럼 채널이 닿지 않는 곳으로 보낼 때 쓴다.
     [Stage 열기] 로 연 창이 없으면 같은 이름으로 다시 연다. */
  function driveStage(url) {
    if (stageWindow && !stageWindow.closed) {
      stageWindow.location.href = url;
      stageWindow.focus();
      return true;
    }
    stageWindow = window.open(url, LECTURE_STAGE_WINDOW);
    return Boolean(stageWindow);
  }

  /* ------------------------------------------------------------
     화면 이동
     ------------------------------------------------------------ */
  const currentScreen = () => findScreen(state.screenId) || SCREENS[0];

  function setScreen(value, { broadcast = true, command = 'GOTO' } = {}) {
    const screen = findScreen(value);
    if (!screen) return;
    state.screenId = screen.id;
    if (state.mode !== 'lecture') setMode('lecture');
    lectureWrite(LECTURE_KEYS.screen, screen.id);
    if (broadcast) sync.post(command, { screenId: screen.id });
    render();
  }

  function move(offset) {
    const i = indexOf(state.screenId);
    const next = SCREENS[i + offset];
    if (!next) return;
    /* 이동 명령은 NEXT / PREV 로 보낸다. Stage 가 자기 위치에서 한 칸 움직인다. */
    setScreen(next.id, { command: offset > 0 ? 'NEXT' : 'PREV' });
    /* 이동 버튼을 마우스로 누른 뒤 Space 를 누르면 그 버튼이 다시 눌린다.
       강의 중 Space 는 언제나 ‘다음’이어야 하므로 포커스를 놓아준다. */
    const focused = document.activeElement;
    if (focused === ui.prev || focused === ui.next) focused.blur();
  }

  /* ------------------------------------------------------------
     모드 — 강의 / 체험 / Network Demo
     ------------------------------------------------------------ */
  function setMode(mode, detail) {
    state.mode = mode;
    state.experience = detail || null;
    lectureWrite(LECTURE_KEYS.mode, mode);
  }

  function enterExperience(fromScreen, backScreen, { drive = true } = {}) {
    const screen = fromScreen || currentScreen();
    if (!screen || !screen.experience) return;
    const back = backScreen || findScreen(screen.experience.returnTo);
    setMode('experience', { label: screen.experience.label, returnTo: back ? back.id : null, fromId: screen.id });
    state.screenId = screen.id;

    if (drive) {
      /* 프로젝터를 체험도구로 보낸다. 창 손잡이가 있으면 그 창을, 없으면 채널로 부탁한다. */
      const url = experienceUrlOf(screen);
      if (!(stageWindow && !stageWindow.closed)) sync.post('OPEN_EXPERIENCE', { screenId: screen.id });
      else driveStage(url);
    }
    render();
  }

  function experienceUrlOf(screen) {
    const { kind, returnTo, module: moduleName } = screen.experience;
    const back = findScreen(returnTo);
    const from = screen.number;
    const to = back ? back.number : SCREENS[0].number;
    return moduleName
      ? `../experience/${moduleName}/index.html?from=${from}&return=${to}`
      : `../experience/index.html?from=${from}&return=${to}#${kind}`;
  }

  function enterNetworkDemo() {
    if (!DEMO || !DEMO.url) return;
    const back = findScreen(DEMO.returnTo) || SCREENS[SCREENS.length - 1];
    setMode('network-demo', { label: DEMO.label || '실제 Network 보기', returnTo: back.id });
    /* 프로젝터 화면 자체가 Dashboard 로 바뀐다. 외부 주소라 채널이 닿지 않으므로 창을 직접 옮긴다. */
    if (!driveStage(DEMO.url)) sync.post('OPEN_NETWORK', { screenId: 'real-network' });
    render();
  }

  /** 체험 · Demo 를 끝내고 강의로 돌아온다. */
  function leaveMode() {
    const back = findScreen(state.experience && state.experience.returnTo) || currentScreen();
    setMode('lecture');
    state.screenId = back.id;
    lectureWrite(LECTURE_KEYS.screen, back.id);
    /* 체험도구도 이 명령을 듣고 강의로 돌아온다. 외부 Dashboard 는 듣지 못하므로 창을 직접 옮긴다. */
    sync.post('RETURN_FROM_DEMO', { screenId: back.id });
    if (stageWindow && !stageWindow.closed) driveStage(`${STAGE_PAGE}#/${back.number}`);
    render();
  }

  /* ------------------------------------------------------------
     미리보기 — 실제 Stage 를 그대로 띄운다
     ------------------------------------------------------------ */
  function showPreview(frame, screen) {
    const hash = `#/${screen.number}`;
    /* 이미 띄워져 있으면 hash 만 바꾼다. 다시 읽지 않으니 깜빡이지 않는다. */
    if (frame.dataset.loaded === 'on') {
      try {
        frame.contentWindow.location.hash = hash;
        return;
      } catch { /* 접근이 막히면 아래에서 다시 띄운다 */ }
    }
    frame.src = `${PREVIEW_PAGE}${hash}`;
  }

  [ui.currentView, ui.nextView].forEach(frame => {
    frame.addEventListener('load', () => { frame.dataset.loaded = 'on'; });
  });

  /** 1280×720 으로 그린 화면을 칸 안에 통째로 넣는다. 잘리지 않아야 한다. */
  function fitPreviews() {
    document.querySelectorAll('.p-frame').forEach(box => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (w <= 0 || h <= 0) return;
      const scale = Math.min(w / 1280, h / 720);
      box.style.setProperty('--p-scale', String(scale));
      box.style.setProperty('--p-left', `${Math.round((w - 1280 * scale) / 2)}px`);
      box.style.setProperty('--p-top', `${Math.round((h - 720 * scale) / 2)}px`);
    });
  }

  /* ------------------------------------------------------------
     그리기
     ------------------------------------------------------------ */
  function render() {
    const screen = currentScreen();
    const i = indexOf(screen.id);
    const next = SCREENS[i + 1] || null;
    const section = SECTIONS.find(s => s.id === screen.section);

    ui.number.textContent = screen.number;
    ui.eyebrow.textContent = screen.eyebrow || '';
    ui.stable.textContent = screen.id;
    ui.title.textContent = plain(screen.title) || plain(screen.eyebrow);
    ui.count.textContent = `${i + 1} / ${SCREENS.length}`;
    ui.section.textContent = section ? section.label : '';
    ui.prev.disabled = i === 0;
    ui.next.disabled = i === SCREENS.length - 1;
    document.title = `${screen.number} · Presenter · 블록체인 강의`;

    /* CURRENT — 강의 중에는 미리보기, 체험·Demo 중에는 상태 카드 */
    const inLecture = state.mode === 'lecture';
    ui.currentFrame.hidden = !inLecture;
    ui.mode.hidden = inLecture;
    if (inLecture) {
      showPreview(ui.currentView, screen);
      ui.currentSub.textContent = 'Stage 에 표시 중';
    } else {
      const detail = state.experience || {};
      const back = findScreen(detail.returnTo);
      const demo = state.mode === 'network-demo';
      ui.currentSub.textContent = demo ? 'Dashboard 표시 중' : '체험도구 표시 중';
      ui.modeTag.textContent = demo ? 'NETWORK DEMO' : 'EXPERIENCE';
      ui.modeTitle.textContent = demo ? '실제 Network 보는 중' : `${detail.label || '체험'} 진행 중`;
      ui.modeDesc.textContent = demo
        ? (DEMO && DEMO.url ? DEMO.url.replace(/^https?:\/\//, '') : '')
        : 'Stage 는 체험도구를 띄우고 있습니다. Presenter 는 그대로 둡니다.';
      ui.modeReturn.textContent = back ? `${back.number} ${plain(back.title)}` : '—';
      ui.modeEnd.textContent = demo ? 'Demo 종료 · 강의 계속' : '체험 종료 · 강의 계속';
    }

    /* NEXT — 체험·Demo 중에는 복귀 화면을 미리 보여준다 */
    const preview = inLecture ? next : findScreen(state.experience && state.experience.returnTo);
    ui.nextSub.textContent = inLecture ? '' : '복귀 화면';
    if (preview) {
      ui.nextEmpty.hidden = true;
      ui.nextView.hidden = false;
      showPreview(ui.nextView, preview);
      ui.nextTitle.textContent = `${preview.number} ${plain(preview.title)}`;
    } else {
      ui.nextEmpty.hidden = false;
      ui.nextView.hidden = true;
      ui.nextTitle.textContent = '마지막 화면입니다';
    }

    renderNotes(screen);
    renderActions(screen);
    renderToc(screen);
    renderClock();
    renderLink();
    fitPreviews();
  }

  function noteBlock(tag, text, kind) {
    return `
      <div class="p-note-block${kind === 'caution' ? ' caution' : ''}">
        <p class="p-note-tag">${tag}</p>
        <p class="p-note-${kind}">${escapeText(text)}</p>
      </div>`;
  }

  function renderNotes(screen) {
    /* Demo 중에는 Demo 대본을 보여준다 */
    const demoNotes = state.mode === 'network-demo'
      && typeof PRESENTER_MODES === 'object'
      && PRESENTER_MODES['network-demo'];
    const notes = demoNotes || notesOf(screen);

    if (!notes) {
      ui.notes.innerHTML = '<p class="p-notes-empty">대본이 없는 화면입니다.</p>';
      ui.notesSub.textContent = '';
      return;
    }

    const parts = [];
    if (notes.script) parts.push(noteBlock('SCRIPT', notes.script, 'script'));
    if (notes.cue) parts.push(noteBlock('CUE', notes.cue, 'cue'));
    if (notes.caution) parts.push(noteBlock('CAUTION', notes.caution, 'caution'));
    ui.notes.innerHTML = parts.join('');
    ui.notes.scrollTop = 0;
    ui.notesSub.textContent = notes.targetSeconds ? `이 화면 권장 ${clock(notes.targetSeconds)}` : '';
  }

  function renderActions(screen) {
    const inLecture = state.mode === 'lecture';
    const hasExperience = Boolean(screen.experience);
    ui.experience.hidden = !(inLecture && hasExperience);
    if (hasExperience) ui.experience.textContent = screen.experience.label;

    /* Network Demo 버튼은 real-network 화면에서만 */
    const onDemoScreen = screen.id === 'real-network';
    ui.network.hidden = !(inLecture && onDemoScreen);
    if (onDemoScreen && (!DEMO || !DEMO.url)) {
      ui.network.disabled = true;
      ui.network.textContent = 'Network Demo URL 미설정';
    }
  }

  /* ------------------------------------------------------------
     시간
     ------------------------------------------------------------ */
  function clock(seconds) {
    const total = Math.max(0, Math.round(seconds));
    const m = Math.floor(total / 60);
    return `${String(m).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  function elapsedSeconds() {
    const base = state.pausedElapsed + (state.startedAt ? Date.now() - state.startedAt : 0);
    return Math.floor(base / 1000);
  }

  function renderClock() {
    const elapsed = elapsedSeconds();
    const target = CUMULATIVE[indexOf(state.screenId)] || 0;

    ui.elapsed.textContent = clock(elapsed);
    ui.total.textContent = clock(TOTAL_SECONDS);
    ui.target.textContent = `목표 누적 ${clock(target)}`;

    /* 조금 늦었다고 붉게 경고하지 않는다. 숫자만 차분히 보여준다. */
    if (!state.startedAt && !state.pausedElapsed) {
      ui.drift.textContent = '';
    } else {
      const diff = elapsed - target;
      ui.drift.textContent = `${diff >= 0 ? '+' : '−'}${clock(Math.abs(diff))}`;
      ui.drift.classList.toggle('behind', diff < 0);
    }

    const ticking = Boolean(state.startedAt);
    ui.timerToggle.textContent = ticking ? '일시정지' : (state.pausedElapsed ? '계속' : '강의 시작');
    ui.timerReset.hidden = !(ticking || state.pausedElapsed);
  }

  function toggleTimer() {
    if (state.startedAt) {
      state.pausedElapsed += Date.now() - state.startedAt;
      state.startedAt = null;
    } else {
      state.startedAt = Date.now();
    }
    lectureWrite(LECTURE_KEYS.started, state.startedAt);
    lectureWrite(LECTURE_KEYS.elapsed, state.pausedElapsed);
    renderClock();
  }

  function resetTimer() {
    state.startedAt = null;
    state.pausedElapsed = 0;
    lectureWrite(LECTURE_KEYS.started, null);
    lectureWrite(LECTURE_KEYS.elapsed, null);
    renderClock();
  }

  /* ------------------------------------------------------------
     Stage 연결 표시 — 크게 경고하지 않는다
     ------------------------------------------------------------ */
  function renderLink() {
    const seen = state.stageSeenAt;
    ui.linkState.classList.toggle('on', Boolean(seen));
    if (!seen) {
      ui.linkLabel.textContent = sync.available ? 'Stage 대기 중' : '이 브라우저는 창 연결을 지원하지 않습니다';
      return;
    }
    const ago = Math.round((Date.now() - seen) / 1000);
    ui.linkLabel.textContent = ago < 10 ? 'Stage 연결됨' : `Stage 연결됨 · ${ago < 60 ? `${ago}초 전` : `${Math.floor(ago / 60)}분 전`}`;
  }

  /* ------------------------------------------------------------
     목차
     ------------------------------------------------------------ */
  function renderToc(screen) {
    ui.tocList.innerHTML = SECTIONS.map(section => {
      const items = SCREENS.filter(s => s.section === section.id);
      /* Section 으로 묶어 보여주되 접지 않는다 — 강의 중에는 한 번에 눌러야 한다 */
      return `
        <details class="p-toc-section" open>
          <summary class="p-toc-summary">
            <span>${section.label}</span>
            <span class="p-toc-range">${section.from}–${section.to}</span>
          </summary>
          <ul class="p-toc-screens">
            ${items.map(s => `
              <li>
                <button class="p-toc-screen${s.id === screen.id ? ' current' : ''}" type="button" data-screen="${s.id}">
                  <span class="p-toc-screen-id">${s.number}</span>
                  <span class="p-toc-screen-title">${plain(s.title || s.eyebrow)}</span>
                  <span class="p-toc-screen-flag">${s.experience ? '체험' : ''}</span>
                </button>
              </li>`).join('')}
          </ul>
        </details>`;
    }).join('');
  }

  const tocOpen = () => !ui.toc.hidden;

  function openToc() {
    ui.toc.hidden = false;
    ui.tocBackdrop.hidden = false;
    const current = ui.tocList.querySelector('.p-toc-screen.current');
    (current || ui.tocClose).focus();
  }

  function closeToc() {
    ui.toc.hidden = true;
    ui.tocBackdrop.hidden = true;
  }

  /* ------------------------------------------------------------
     이벤트
     ------------------------------------------------------------ */
  ui.prev.addEventListener('click', () => move(-1));
  ui.next.addEventListener('click', () => move(1));
  ui.tocButton.addEventListener('click', () => (tocOpen() ? closeToc() : openToc()));
  ui.tocClose.addEventListener('click', closeToc);
  ui.tocBackdrop.addEventListener('click', closeToc);
  ui.timerToggle.addEventListener('click', toggleTimer);
  ui.timerReset.addEventListener('click', resetTimer);
  ui.experience.addEventListener('click', () => enterExperience(currentScreen()));
  ui.network.addEventListener('click', enterNetworkDemo);
  ui.modeEnd.addEventListener('click', leaveMode);

  ui.openStage.addEventListener('click', () => {
    const screen = currentScreen();
    stageWindow = window.open(`${STAGE_PAGE}#/${screen.number}`, LECTURE_STAGE_WINDOW);
    if (stageWindow) stageWindow.focus();
  });

  ui.tocList.addEventListener('click', event => {
    const button = event.target.closest('[data-screen]');
    if (!button) return;
    closeToc();
    setScreen(button.dataset.screen);
  });

  /* 강사용 단축키.
     체험 시작에는 단축키를 두지 않는다 — 강의 중 실수로 열리면 안 된다. */
  document.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = (event.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.target.isContentEditable) return;

    if (event.key === 'Escape') {
      if (tocOpen()) closeToc();
      event.preventDefault();
      return;
    }
    if (tocOpen()) return;   // 목차가 열려 있으면 이동 단축키를 쓰지 않는다

    const pressed = event.key.toLowerCase();
    if (event.key === 'ArrowRight') {
      move(1);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      move(-1);
      event.preventDefault();
    } else if (event.key === ' ' || event.key === 'Spacebar') {
      /* 대본을 스크롤하다 Space 로 화면이 넘어가지 않도록, 버튼 위에서는 원래 동작을 살린다 */
      if (tag === 'button' || tag === 'a') return;
      move(1);
      event.preventDefault();
    } else if (pressed === 'g') {
      openToc();
      event.preventDefault();
    } else if (pressed === 'n') {
      if (!ui.network.hidden && !ui.network.disabled) enterNetworkDemo();
      event.preventDefault();
    }
  });

  window.addEventListener('resize', fitPreviews);

  /* ------------------------------------------------------------
     시작
     ------------------------------------------------------------ */
  (function init() {
    /* 새로고침 복구 — 저장된 위치와 시간을 되살린다 */
    const saved = findScreen(lectureRead(LECTURE_KEYS.screen));
    if (saved) state.screenId = saved.id;

    const started = Number(lectureRead(LECTURE_KEYS.started));
    const paused = Number(lectureRead(LECTURE_KEYS.elapsed));
    if (Number.isFinite(paused) && paused > 0) state.pausedElapsed = paused;
    if (Number.isFinite(started) && started > 0) state.startedAt = started;

    render();

    /* Stage 가 이미 열려 있으면 여기에 답한다 */
    sync.post('READY', { role: 'presenter' });

    setInterval(() => {
      renderClock();
      renderLink();
    }, 1000);
  })();
})();
