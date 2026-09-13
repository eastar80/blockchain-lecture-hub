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

const SCREEN_INDEX = new Map(SCREENS.map((s, i) => [s.id, i]));
const FIRST_ID = SCREENS[0].id;
const STORAGE_KEY = 'lecture:last-screen';

/* ------------------------------------------------------------
   화면 ID 검증 — 외부에서 들어온 값은 전부 여기를 통과해야 한다.
   ------------------------------------------------------------ */
function isValidScreenId(id) {
  return typeof id === 'string' && SCREEN_INDEX.has(id);
}

/** URL hash → 화면 ID. 형식이 어긋나면 null. */
function screenIdFromHash() {
  const raw = location.hash.replace(/^#\/?/, '').trim().toUpperCase();
  return isValidScreenId(raw) ? raw : null;
}

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
  const target = isValidScreenId(id) ? id : FIRST_ID;
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
  if (next) goTo(next.id);
}

/* ------------------------------------------------------------
   체험도구 링크
     from   체험 직전 강의 화면 — ‘← 강의로 돌아가기’
     return 체험 후 이어서 진행할 화면 — ‘강의 계속하기 →’
     #kind  실행할 체험 종류
   ------------------------------------------------------------ */
function experienceUrl(screen) {
  const { kind, returnTo } = screen.experience;
  return `../experience/index.html?from=${screen.id}&return=${returnTo}#${kind}`;
}

/* ------------------------------------------------------------
   상단 개념 진행 표시기
   ------------------------------------------------------------ */
function renderProgress(screen) {
  const concept = screen.concept;
  const isIntro = concept === 'intro';
  const isAll = concept === 'all';
  const active = new Set(Array.isArray(concept) ? concept : [concept]);

  const stops = CONCEPTS.map(c => {
    const on = isAll || active.has(c.key);
    return `<li class="p-stop${on ? ' on' : ''}"${on ? ' aria-current="step"' : ''}>
      <span class="p-full">${c.label}</span>
      <span class="p-short">${c.short}</span>
    </li>`;
  }).join('');

  els.progress.innerHTML = `<ol class="p-list${isIntro ? ' intro' : ''}${isAll ? ' all' : ''}">
    ${isIntro ? '<li class="p-stop p-intro on">INTRO</li>' : ''}${stops}
  </ol>`;
}

/* ------------------------------------------------------------
   본문 한 화면
   ------------------------------------------------------------ */
function renderStage(screen) {
  const parts = [];

  if (screen.eyebrow) parts.push(`<p class="eyebrow stage-eyebrow">${screen.eyebrow}</p>`);
  if (screen.title) parts.push(`<h1 class="stage-title">${screen.title}</h1>`);
  if (screen.kicker) parts.push(`<p class="stage-kicker">${screen.kicker}</p>`);
  if (screen.body) parts.push(`<div class="stage-body">${screen.body}</div>`);

  /* 체험 진입 — QR 은 이 화면에서만 크게 노출한다(모바일에서는 숨김) */
  if (screen.experience) {
    const url = experienceUrl(screen);
    parts.push(`
      <div class="cta-zone">
        <figure class="qr-panel">
          <img class="qr-image" src="./qr/${screen.experience.kind}.svg" alt="" width="132" height="132" />
          <figcaption>스마트폰으로<br />체험하기</figcaption>
        </figure>
        <div class="cta-main">
          <a class="btn btn-primary cta-button" href="${url}">
            ${screen.experience.label} <span class="arrow" aria-hidden="true">→</span>
          </a>
          <p class="cta-hint">체험을 마치면 <strong>강의 계속하기 →</strong> 로 ${screen.experience.returnTo} 화면에서 이어집니다.</p>
        </div>
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
  if (screen.id === FIRST_ID) {
    const saved = recallScreen();
    if (saved && saved !== FIRST_ID) {
      const savedScreen = SCREENS[SCREEN_INDEX.get(saved)];
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
                <span class="toc-screen-id">${s.id}</span>
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

  currentId = id;
  document.documentElement.dataset.screen = id;

  renderProgress(screen);
  renderStage(screen);
  renderToc(screen);

  els.counter.textContent = `${index + 1} / ${SCREENS.length}`;
  els.prev.disabled = index === 0;
  els.next.disabled = index === SCREENS.length - 1;

  const plainTitle = (screen.title || screen.eyebrow || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  document.title = `${id} · ${plainTitle} · 블록체인 강의`;

  rememberScreen(id);
  window.scrollTo({ top: 0, behavior: 'auto' });

  /* 새 화면 본문으로 포커스를 옮긴다.
     - 보조기술이 바뀐 화면을 읽을 수 있게 한다.
     - ‘이전’ 버튼을 마우스로 누른 뒤 Space 를 누르면 그 버튼이 다시 눌려
       뒤로 가버리던 문제를 막는다. (강의 중 Space = 다음 화면) */
  els.main.focus({ preventScroll: true });
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
  if (id) render(id);
  else goTo(FIRST_ID, { replace: true });   // 잘못된 ID → 기본 화면
});

/* ------------------------------------------------------------
   시작
   ------------------------------------------------------------ */
(function init() {
  const requested = screenIdFromHash();
  goTo(requested || FIRST_ID, { replace: true });
})();
