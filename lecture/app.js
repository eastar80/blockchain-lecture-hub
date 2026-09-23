/* ============================================================
   lecture/app.js — 강의 화면 Router / Renderer / Navigation

   라우팅 원칙
   - 현재 화면은 URL 이 단일 출처다.  lecture/index.html#/L13
   - 화면 이동은 전부 location.hash 변경으로만 일어난다.
     따라서 주소창과 화면이 어긋날 수 없다.
   - 새로고침 / URL 직접 접속 / QR 접속 모두 같은 경로로 들어온다.
   - 허용되지 않은 ID 가 들어오면 L01 로 안전하게 되돌린다.
   - sessionStorage 는 ‘이어서 보기’ 보조 수단으로만 쓴다.
   ============================================================ */

/* ------------------------------------------------------------
   화면 찾기 — 고정 ID 와 화면 번호를 모두 받는다.

   id      'pow-challenge' — 화면의 고정 ID. 번호가 바뀌어도 그대로다.
           체험 복귀, 내부 이동은 전부 이 값으로 연결한다.
   number  'L14' — 화면에 표시하고 주소로 쓰는 번호.

   주소는 지금까지처럼 #/L14 로 유지한다. 이미 나간 링크와 QR 이 그대로 살아 있어야 한다.
   #/pow-challenge 로 들어와도 같은 화면을 열고 주소만 #/L14 로 맞춘다.
   ------------------------------------------------------------ */
const SCREEN_INDEX = new Map();
SCREENS.forEach((s, i) => {
  SCREEN_INDEX.set(s.id, i);
  SCREEN_INDEX.set(s.number, i);
});
const FIRST_ID = SCREENS[0].number;
const STORAGE_KEY = 'lecture:last-screen';

/* 외부에서 들어온 값은 전부 여기를 통과해야 한다. */
function screenOf(value) {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  const index = SCREEN_INDEX.has(raw) ? SCREEN_INDEX.get(raw) : SCREEN_INDEX.get(raw.toUpperCase());
  return index === undefined ? null : SCREENS[index];
}

/** 어떤 형태로 들어오든 주소에 쓸 화면 번호로 바꾼다. 허용되지 않으면 null. */
function toScreenNumber(value) {
  const screen = screenOf(value);
  return screen ? screen.number : null;
}

function isValidScreenId(id) {
  return toScreenNumber(id) !== null;
}

/** URL hash → 화면 번호. 형식이 어긋나면 null. */
function screenIdFromHash() {
  return toScreenNumber(location.hash.replace(/^#\/?/, '').trim());
}

/* ------------------------------------------------------------
   미리보기 모드 — Presenter 안에서 iframe 으로 열릴 때 (?preview=1)

   화면은 실제 프로젝터와 똑같이 그린다. Presenter 가 따로 만든 축소 UI 가
   아니라 같은 Renderer 를 그대로 쓰기 위해서다.
   다만 강의 진행 상태는 건드리지 않는다 — 저장도, 단축키도, 채널 참여도 없다.
   ------------------------------------------------------------ */
const PREVIEW = new URLSearchParams(location.search).has('preview');
if (PREVIEW) document.documentElement.dataset.preview = 'on';

const els = {
  progress: document.querySelector('#progress'),
  stage: document.querySelector('#stage'),
  main: document.querySelector('#screen'),
  counter: document.querySelector('#counter'),
  prev: document.querySelector('#prevButton'),
  next: document.querySelector('#nextButton'),
  tocButton: document.querySelector('#tocButton'),
  tocButtonBottom: document.querySelector('#tocButtonBottom'),
  toc: document.querySelector('#toc'),
  tocList: document.querySelector('#tocList'),
  tocClose: document.querySelector('#tocClose'),
  tocBackdrop: document.querySelector('#tocBackdrop')
};

let currentId = null;

/* ------------------------------------------------------------
   보조 저장 — 실패해도 강의 진행에는 영향이 없어야 한다.
   ------------------------------------------------------------ */
function rememberScreen(id) {
  if (PREVIEW) return;   // 미리보기는 강의 진행 상태를 남기지 않는다
  try { sessionStorage.setItem(STORAGE_KEY, id); } catch { /* 무시 */ }
}
function recallScreen() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return isValidScreenId(saved) ? saved : null;
  } catch { return null; }
}

/* ------------------------------------------------------------
   이동 — 화면 전환은 언제나 hash 를 통해서만 한다.
   ------------------------------------------------------------ */
function goTo(id, { replace = false } = {}) {
  const target = toScreenNumber(id) || FIRST_ID;
  const nextHash = `#/${target}`;
  if (location.hash === nextHash) {
    render(target);
    return;
  }
  if (replace) {
    history.replaceState(null, '', nextHash);
    render(target);
  } else {
    location.hash = nextHash;   // hashchange 가 render 를 호출한다
  }
}

function goByOffset(offset) {
  const index = SCREEN_INDEX.get(currentId);
  const next = SCREENS[index + offset];
  if (next) goTo(next.number);
}

/* ------------------------------------------------------------
   체험도구 링크
     from   체험 직전 강의 화면 — ‘← 강의로 돌아가기’
     return 체험 후 이어서 진행할 화면 — ‘강의 계속하기 →’
     #kind  실행할 체험 종류
   ------------------------------------------------------------ */
function experienceUrl(screen) {
  const { kind, returnTo, module: moduleName } = screen.experience;
  /* 화면 데이터는 고정 ID 로 적어 두고, 체험도구에 넘길 때만 번호로 바꾼다.
     체험도구의 ?from= / ?return= 형식(L14)은 그대로 유지한다. */
  const from = screen.number;
  const back = toScreenNumber(returnTo) || FIRST_ID;
  /* Ethereum 체험은 기존 4단계 도구의 STEP 5 가 아니라 별도 모듈이다 */
  if (moduleName) {
    return `../experience/${moduleName}/index.html?from=${from}&return=${back}`;
  }
  return `../experience/index.html?from=${from}&return=${back}#${kind}`;
}

/* ------------------------------------------------------------
   상단 개념 진행 표시기
   ------------------------------------------------------------ */
/** 한 노선의 역 목록 */
function progressStops(stops, active, allOn) {
  return stops.map(stop => {
    const on = allOn || active.has(stop.key);
    return `<li class="p-stop${on ? ' on' : ''}"${on ? ' aria-current="step"' : ''}>
      <span class="p-full">${stop.label}</span>
      <span class="p-short">${stop.short}</span>
    </li>`;
  }).join('');
}

/**
 * 상단 진행 표시기.
 * 화면이 어느 노선에 속하는지에 따라 LINE 1 / 환승 / LINE 2 를 보여준다.
 * 하나의 긴 개념열로 두면 'PoW 다음 기술이 Ethereum' 처럼 읽히므로 나눈다.
 */
function renderProgress(screen) {
  const [line1, line2] = LINES;
  const where = screen.line || (screen.concept === 'intro' ? 'intro' : 1);
  const active = new Set(Array.isArray(screen.concept) ? screen.concept : [screen.concept]);
  const allOn = screen.concept === 'all';

  /* 에필로그(L32~L34)는 어느 노선에도 속하지 않는다. 역 이름을 늘어놓지 않는다 */
  if (where === 'epilogue') {
    els.progress.innerHTML = `<ol class="p-list intro">
      <li class="p-stop p-intro on" aria-current="step">EPILOGUE</li>
      <li class="p-line-label">배우고, 해보고, 다시 배우기</li>
    </ol>`;
    return;
  }

  if (where === 'transfer') {
    els.progress.innerHTML = `<ol class="p-list p-transfer-list">
      <li class="p-line-label">${line1.label}</li>
      <li class="p-stop p-transfer on" aria-current="step">환승</li>
      <li class="p-line-label p-line-label-2">${line2.label}</li>
    </ol>`;
    return;
  }

  /* 정리 화면에서는 역 이름을 모두 늘어놓지 않는다.
     본문에 두 노선이 크게 그려져 있으므로 상단은 노선 이름만 남긴다. */
  if (where === 'both') {
    els.progress.innerHTML = `<ol class="p-list p-both">
      <li class="p-line-badge">LINE 1</li>
      <li class="p-line-label">${line1.label.replace('LINE 1 · ', '')}</li>
      <li class="p-line-badge p-line-badge-2">LINE 2</li>
      <li class="p-line-label p-line-label-2">${line2.label.replace('LINE 2 · ', '')}</li>
    </ol>`;
    return;
  }

  const isIntro = where === 'intro';
  const line = where === 2 ? line2 : line1;
  const badge = isIntro
    ? '<li class="p-stop p-intro on">INTRO</li>'
    : `<li class="p-line-badge${line.id === 2 ? ' p-line-badge-2' : ''}">LINE ${line.id}</li>`;

  els.progress.innerHTML = `<ol class="p-list${isIntro ? ' intro' : ''}${allOn ? ' all' : ''}${line.id === 2 ? ' line-2' : ''}">
    ${badge}
    ${progressStops(line.stops, active, allOn)}
  </ol>`;
}

/* ------------------------------------------------------------
   본문 한 화면
   ------------------------------------------------------------ */
function renderStage(screen) {
  const parts = [];

  /* BridgeStrip — 체험 직후 복귀 화면에서 ‘방금 한 일’을 먼저 회수한다.
     원본 문구를 대체하지 않고 체험과 설명을 잇는 보조 설명이다. */
  if (screen.bridge) {
    parts.push(`
      <p class="bridge">
        <span class="bridge-tag">${screen.bridge.tag}</span>
        <span class="bridge-text">${screen.bridge.text}</span>
      </p>`);
  }

  if (screen.eyebrow) parts.push(`<p class="eyebrow stage-eyebrow">${screen.eyebrow}</p>`);
  if (screen.title) parts.push(`<h1 class="stage-title">${screen.title}</h1>`);
  if (screen.kicker) parts.push(`<p class="stage-kicker">${screen.kicker}</p>`);
  if (screen.body) parts.push(`<div class="stage-body">${screen.body}</div>`);

  /* 체험 진입 — 강의 화면에서 버튼을 눌러 바로 들어간다.
     QR 은 쓰지 않는다(SVG 는 lecture/qr/ 에 남겨 뒀다). */
  if (screen.experience) {
    const url = experienceUrl(screen);
    parts.push(`
      <div class="cta-zone">
        <a class="btn btn-primary cta-button" href="${url}">
          ${screen.experience.label} <span class="arrow" aria-hidden="true">→</span>
        </a>
        <p class="cta-hint">체험을 마치면 <strong>강의 계속하기 →</strong> 로 ${toScreenNumber(screen.experience.returnTo)} 화면에서 이어집니다.</p>
      </div>`);
  }

  /* 체험 예고(L12) 처럼 다음 화면으로 넘기는 Action */
  if (screen.advance) {
    parts.push(`
      <div class="cta-zone cta-zone-simple">
        <button class="btn btn-primary cta-button" type="button" data-goto="${screen.advance.to}">
          ${screen.advance.label} <span class="arrow" aria-hidden="true">→</span>
        </button>
      </div>`);
  }

  if (screen.note) parts.push(`<p class="stage-note">${screen.note}</p>`);

  /* 마지막 화면 */
  if (screen.closing) {
    parts.push(`
      <div class="closing-actions">
        <a class="btn btn-secondary" href="../index.html">강의 홈</a>
        <button class="btn btn-secondary" type="button" data-goto="${FIRST_ID}">처음부터</button>
      </div>`);
  }

  /* 첫 화면에서만 — 보던 위치가 있으면 이어서 볼 수 있게 한다(URL 이 기준이므로 자동 이동은 하지 않는다) */
  if (screen.number === FIRST_ID) {
    const saved = recallScreen();
    if (saved && saved !== FIRST_ID) {
      const savedScreen = screenOf(saved);
      parts.push(`
        <p class="resume-line">
          <button class="resume-button" type="button" data-goto="${saved}">
            이어서 보기 · ${saved} ${savedScreen.eyebrow || ''}
          </button>
        </p>`);
    }
  }

  els.stage.className = `stage type-${screen.type}`;
  els.stage.innerHTML = `<div class="stage-inner">${parts.join('')}</div>`;
}

/* ------------------------------------------------------------
   목차 — Section 을 먼저 보여주고 펼치면 화면으로 바로 이동한다
   ------------------------------------------------------------ */
function renderToc(screen) {
  els.tocList.innerHTML = SECTIONS.map(section => {
    const items = SCREENS.filter(s => s.section === section.id);
    const isOpen = section.id === screen.section;
    return `
      <details class="toc-section"${isOpen ? ' open' : ''}>
        <summary class="toc-summary">
          <span class="toc-section-id">${section.id}</span>
          <span class="toc-section-label">${section.label}</span>
          <span class="toc-section-range">${section.from}–${section.to}</span>
        </summary>
        <ul class="toc-screens">
          ${items.map(s => `
            <li>
              <button class="toc-screen${s.id === screen.id ? ' current' : ''}" type="button" data-goto="${s.id}"${s.id === screen.id ? ' aria-current="true"' : ''}>
                <span class="toc-screen-id">${s.number}</span>
                <span class="toc-screen-title">${(s.title || s.eyebrow).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '')}</span>
                ${s.experience ? '<span class="toc-screen-flag">체험</span>' : ''}
              </button>
            </li>`).join('')}
        </ul>
      </details>`;
  }).join('');
}

function openToc() {
  els.toc.hidden = false;
  els.tocBackdrop.hidden = false;
  els.tocButton.setAttribute('aria-expanded', 'true');
  els.tocButtonBottom.setAttribute('aria-expanded', 'true');
  els.tocClose.focus();
}

function closeToc({ restoreFocus = true } = {}) {
  if (els.toc.hidden) return;
  els.toc.hidden = true;
  els.tocBackdrop.hidden = true;
  els.tocButton.setAttribute('aria-expanded', 'false');
  els.tocButtonBottom.setAttribute('aria-expanded', 'false');
  if (restoreFocus) els.tocButton.focus();
}

function toggleToc() {
  if (els.toc.hidden) openToc(); else closeToc();
}

/* ------------------------------------------------------------
   렌더
   ------------------------------------------------------------ */
function render(id) {
  const index = SCREEN_INDEX.get(id);
  const screen = SCREENS[index];
  if (!screen) return;

  currentId = screen.number;
  document.documentElement.dataset.screen = screen.number;
  document.documentElement.dataset.screenId = screen.id;   // Presenter 연결용 고정 ID

  renderProgress(screen);
  renderStage(screen);
  renderToc(screen);

  els.counter.textContent = `${index + 1} / ${SCREENS.length}`;
  els.prev.disabled = index === 0;
  els.next.disabled = index === SCREENS.length - 1;

  const plainTitle = (screen.title || screen.eyebrow || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  document.title = `${screen.number} · ${plainTitle} · 블록체인 강의`;

  rememberScreen(screen.number);
  if (!PREVIEW) {
    lectureWrite(LECTURE_KEYS.screen, screen.id);   // 새로고침 복구용 — 고정 ID 로 남긴다
    lectureWrite(LECTURE_KEYS.mode, 'lecture');
    announceStage();                                // Presenter 가 따라오도록 알린다
  }
  window.scrollTo({ top: 0, behavior: 'auto' });

  /* 새 화면 본문으로 포커스를 옮긴다.
     - 보조기술이 바뀐 화면을 읽을 수 있게 한다.
     - ‘이전’ 버튼을 마우스로 누른 뒤 Space 를 누르면 그 버튼이 다시 눌려
       뒤로 가버리던 문제를 막는다. (강의 중 Space = 다음 화면) */
  /* 미리보기(iframe)에서는 포커스를 가져오지 않는다.
     가져가면 Presenter 창의 키보드 입력이 미리보기 안으로 빨려 들어간다. */
  if (!PREVIEW) els.main.focus({ preventScroll: true });
}

/* ------------------------------------------------------------
   이벤트
   ------------------------------------------------------------ */
els.prev.addEventListener('click', () => goByOffset(-1));
els.next.addEventListener('click', () => goByOffset(1));
els.tocButton.addEventListener('click', toggleToc);
els.tocButtonBottom.addEventListener('click', toggleToc);
els.tocClose.addEventListener('click', () => closeToc());
els.tocBackdrop.addEventListener('click', () => closeToc());

/* data-goto 를 가진 요소는 모두 화면 이동 버튼이다 */
document.addEventListener('click', event => {
  const target = event.target.closest('[data-goto]');
  if (!target) return;
  closeToc({ restoreFocus: false });
  goTo(target.dataset.goto);
});

/* 강의자 편의 단축키. 입력 요소 위에서는 동작하지 않는다. */
document.addEventListener('keydown', event => {
  if (PREVIEW) return;   // 미리보기는 조작하지 않는다
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const tag = (event.target.tagName || '').toLowerCase();
  const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || event.target.isContentEditable;
  if (isTyping) return;

  if (event.key === 'Escape') {
    toggleToc();
    event.preventDefault();
    return;
  }

  if (!els.toc.hidden) return;   // 목차가 열려 있으면 화면 이동 단축키를 쓰지 않는다

  if (event.key === 'ArrowLeft') {
    goByOffset(-1);
    event.preventDefault();
  } else if (event.key === 'ArrowRight') {
    goByOffset(1);
    event.preventDefault();
  } else if (event.key === ' ' || event.key === 'Spacebar') {
    /* Space 는 버튼/링크 위에서는 원래 동작을 살린다 */
    if (tag === 'button' || tag === 'a') return;
    goByOffset(1);
    event.preventDefault();
  }
});

window.addEventListener('hashchange', () => {
  const id = screenIdFromHash();
  /* 고정 ID(#/pow-challenge)로 들어왔으면 주소를 번호(#/L14)로 정리한다.
     이미 번호면 goTo 가 render 만 한다 — 기록이 두 번 쌓이지 않는다. */
  goTo(id || FIRST_ID, { replace: true });   // 잘못된 ID → 기본 화면
});

/* ------------------------------------------------------------
   Network Demo 연결 지점 — 이번 단계에서는 자리만 만들어 둔다.

   강의 화면에는 강사용 control 을 노출하지 않는다.
   다음 단계의 Presenter 가 아래 명령을 보내면 여기서 처리한다.

     OPEN_NETWORK      real-network 화면의 demo.url(https://repo.mrdion.kim)로 나간다
     RETURN_FROM_DEMO  demo.returnTo — 즉 closing 화면으로 돌아온다

   강의자용 대본과 목표 시간은 presenter-notes.js 에 고정 ID 로 들어 있다.
   BroadcastChannel / localStorage 동기화는 다음 단계에서 붙인다.
   ------------------------------------------------------------ */
const LECTURE_COMMANDS = {
  OPEN_NETWORK() {
    const demo = (screenOf('real-network') || {}).demo;
    if (!demo || !demo.url) return false;   // 주소가 아직 없으면 아무 일도 하지 않는다
    /* 프로젝터 화면이 그대로 Dashboard 로 바뀐다. 새 창을 띄우지 않는다. */
    lectureWrite(LECTURE_KEYS.mode, 'network-demo');
    location.href = demo.url;
    return true;
  },
  RETURN_FROM_DEMO() {
    const demo = (screenOf('real-network') || {}).demo;
    goTo((demo && demo.returnTo) || FIRST_ID);
    return true;
  }
};

/** Presenter 없이 콘솔 등에서 쓸 수 있는 입구. 화면 쪽에서 먼저 호출하지 않는다. */
window.lectureCommand = name =>
  Object.prototype.hasOwnProperty.call(LECTURE_COMMANDS, name) ? LECTURE_COMMANDS[name]() : false;

/* ------------------------------------------------------------
   Presenter 연결

   Stage 는 스스로 판단하지 않는다. 명령을 받아 움직이고,
   움직인 결과를 알려주기만 한다. 진행의 主는 Presenter 다.
   Stage 에서 직접 넘기던 기존 조작(버튼·단축키·목차)은 그대로 살아 있다.
   ------------------------------------------------------------ */
const sync = PREVIEW ? null : createLectureSync(onSyncMessage);

/* 창을 연 직후의 첫 알림은 ‘내가 열렸다’는 뜻일 뿐이다.
   Presenter 가 이미 진행 중이라면 그 위치를 따라가야지, Presenter 를 첫 화면으로
   끌고 오면 안 된다. 그래서 첫 알림에는 initial 표시를 붙인다. */
let firstAnnounce = true;

/** 지금 무엇을 띄우고 있는지 알린다. render() 끝에서 부른다. */
function announceStage() {
  if (!sync) return;
  const screen = screenOf(currentId);
  sync.post('STAGE_STATE', {
    mode: 'lecture',
    initial: firstAnnounce,
    screenId: screen ? screen.id : null,
    number: screen ? screen.number : null
  });
  firstAnnounce = false;
}

function onSyncMessage(message) {
  switch (message.type) {
    case 'NEXT':
      goByOffset(1);
      break;
    case 'PREV':
      goByOffset(-1);
      break;
    case 'GOTO':
    case 'STATE_SYNC':          // Presenter 가 이미 진행 중인 위치로 따라간다
    case 'RETURN_FROM_DEMO':
      if (message.screenId) goTo(message.screenId);
      break;
    case 'OPEN_EXPERIENCE': {
      const screen = screenOf(message.screenId || currentId);
      if (screen && screen.experience) location.href = experienceUrl(screen);
      break;
    }
    case 'OPEN_NETWORK':
      LECTURE_COMMANDS.OPEN_NETWORK();
      break;
    case 'READY':               // Presenter 가 나중에 열렸다 — 지금 위치를 알려준다
      announceStage();
      break;
    default:
      break;
  }
}

/* ------------------------------------------------------------
   시작
   ------------------------------------------------------------ */
(function init() {
  const requested = screenIdFromHash();
  goTo(requested || FIRST_ID, { replace: true });
  /* Stage 가 나중에 열렸을 수 있다. Presenter 가 현재 위치를 알려주면 따라간다. */
  if (sync) sync.post('READY', { role: 'stage' });
})();
