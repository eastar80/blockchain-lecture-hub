/* ============================================================
   lecture/screens.js — 강의 화면 콘텐츠 단일 출처

   원본: materials/lecture.pdf (21페이지)
   화면: L01 ~ L25 (원본 p14 / p16 / p17 / p20 은 가독성을 위해 2화면 분할)

   각 화면 객체는 다음을 가진다.
     id         논리 화면 ID (URL: lecture/index.html#/L05)
     sourcePage 원본 PDF 페이지 — 원본 대비 추적용
     section    목차 Section ID
     type       title | question | concept | experience-entry | summary
     concept    상단 진행 표시기에서 강조할 개념 키 ('intro' | 'all' | key | key[])
     eyebrow    작은 라벨
     title      화면 제목
     kicker     제목 아래 보조 한 줄 (선택)
     body       화면 본문 HTML (아래 helper 로 구성)
     note       화면 하단 원본 마무리 문장 (선택)
     experience 체험도구 연결 정보 (선택)

   원본 문구는 이 파일 안에서만 관리한다.
   화면 컴포넌트 안에 문구를 흩어 두지 않는다.
   ============================================================ */

/* ------------------------------------------------------------
   진행 표시기 개념열 — 원본 하단에 반복되는 개념 목록
   ------------------------------------------------------------ */
const CONCEPTS = [
  { key: 'hash',      label: 'Hash',             short: 'Hash' },
  { key: 'block',     label: 'Block',            short: 'Block' },
  { key: 'chain',     label: 'Chain',            short: 'Chain' },
  { key: 'ledger',    label: 'Distributed Ledger', short: 'Ledger' },
  { key: 'consensus', label: 'Consensus',        short: 'Consensus' },
  { key: 'pow',       label: 'PoW',              short: 'PoW' },
  { key: 'ethereum',  label: 'Ethereum',         short: 'Ethereum' },
  { key: 'contract',  label: 'Smart Contract',   short: 'Contract' },
  { key: 'dapp',      label: 'DApp',             short: 'DApp' }
];

/* ------------------------------------------------------------
   목차 Section — 25개를 한 번에 나열하지 않고 7개 Section 을 먼저 보여준다
   ------------------------------------------------------------ */
const SECTIONS = [
  { id: 'A', label: '도입',                                    from: 'L01', to: 'L02' },
  { id: 'B', label: '장부에 대한 믿음',                        from: 'L03', to: 'L04' },
  { id: 'C', label: 'Hash → Block → Chain',                    from: 'L05', to: 'L09' },
  { id: 'D', label: 'Distributed Ledger → Consensus',          from: 'L10', to: 'L12' },
  { id: 'E', label: 'Proof of Work',                           from: 'L13', to: 'L18' },
  { id: 'F', label: 'Ethereum → Smart Contract → DApp',        from: 'L19', to: 'L22' },
  { id: 'G', label: '정리',                                    from: 'L23', to: 'L25' }
];

/* ------------------------------------------------------------
   Body helper — 화면 데이터가 마크업을 직접 쓰지 않도록 감싼다.
   여기서 만들어지는 class 는 lecture.css 가 담당한다.
   ------------------------------------------------------------ */

/** 큰 리드 문장 */
const lead = text => `<p class="s-lead">${text}</p>`;

/** 파란 강조 핵심 문장 */
const key = text => `<p class="s-key">${text}</p>`;

/** 화면 한가운데 놓는 큰 질문 */
const bigQuestion = text => `<p class="s-question">${text}</p>`;

/** 작은 회색 보조 문장 */
const sub = text => `<p class="s-sub">${text}</p>`;

/**
 * 2열 대비 구조. 모바일에서는 세로로 쌓인다.
 * side: { tag, title, lines[], tone: 'neutral'|'primary'|'warn'|'ok' }
 */
function duo(left, right, middle) {
  const side = (s, pos) => `
    <div class="duo-card duo-${pos} tone-${s.tone || 'neutral'}">
      ${s.tag ? `<p class="duo-tag">${s.tag}</p>` : ''}
      ${s.title ? `<p class="duo-title">${s.title}</p>` : ''}
      ${(s.lines || []).map(l => `<p class="duo-line">${l}</p>`).join('')}
      ${s.foot ? `<p class="duo-foot">${s.foot}</p>` : ''}
    </div>`;
  return `
    <div class="duo">
      ${side(left, 'left')}
      ${middle ? `<div class="duo-mid" aria-hidden="true">${middle}</div>` : '<div class="duo-mid duo-mid-plain" aria-hidden="true">vs</div>'}
      ${side(right, 'right')}
    </div>`;
}

/** 번호가 붙은 질문 카드 목록 — 원본 p4 의 5개 질문 */
function numberedCards(items) {
  return `
    <ol class="num-list">
      ${items.map(i => `
        <li class="num-item">
          <span class="num-badge" aria-hidden="true">${i.num}</span>
          <p class="num-question">${i.question}</p>
          <span class="num-answer">${i.answer}</span>
        </li>`).join('')}
    </ol>`;
}

/** 일반 카드 그리드 */
function cards(items, cols) {
  return `
    <ul class="card-grid cols-${cols || items.length}">
      ${items.map(i => `
        <li class="card-item${i.accent ? ' accent' : ''}">
          ${i.tag ? `<p class="card-tag">${i.tag}</p>` : ''}
          <p class="card-title">${i.title}</p>
          ${i.desc ? `<p class="card-desc">${i.desc}</p>` : ''}
        </li>`).join('')}
    </ul>`;
}

/**
 * Block / Chain 도식.
 * blocks: { name, prev, txs[], hash, altTx, altHash, state: 'ok'|'broken' }
 * 모바일에서는 가로 스크롤 대신 세로로 재배치된다.
 */
function chainDiagram(blocks, options) {
  const opt = options || {};
  const one = (b, index) => `
    ${index > 0 ? `<div class="blk-link ${b.state === 'broken' ? 'broken' : ''}" aria-hidden="true">→</div>` : ''}
    <div class="blk ${b.state ? 'blk-' + b.state : ''}">
      <p class="blk-name">${b.name}</p>
      ${b.prev ? `<p class="blk-prev">Previous Hash = <strong>${b.prev}</strong></p>` : ''}
      <ul class="blk-tx">${(b.txs || []).map(t => `<li>${t}</li>`).join('')}</ul>
      ${b.altTx ? `<p class="blk-alt">${b.altTx}</p>` : ''}
      ${b.hash ? `<p class="blk-hash">Hash = <strong>${b.hash}</strong></p>` : ''}
      ${b.altHash ? `<p class="blk-hash blk-hash-alt">Hash = <strong>${b.altHash}</strong></p>` : ''}
      ${b.badge ? `<p class="blk-badge">${b.badge}</p>` : ''}
    </div>`;
  return `<div class="blk-row ${opt.frame ? 'blk-framed' : ''}">
    ${opt.frame ? `<p class="blk-frame-label">${opt.frame}</p>` : ''}
    <div class="blk-track">${blocks.map(one).join('')}</div>
  </div>`;
}

/** 가로 흐름 — 제안 → 검증 → 장부 반영 등 */
function flow(steps) {
  return `
    <ol class="flow">
      ${steps.map((s, i) => `
        ${i > 0 ? '<li class="flow-arrow" aria-hidden="true">→</li>' : ''}
        <li class="flow-step${s.tone ? ' tone-' + s.tone : ''}">
          <span class="flow-text">${s.text}</span>
          ${s.desc ? `<span class="flow-desc">${s.desc}</span>` : ''}
        </li>`).join('')}
    </ol>`;
}

/** 참여 노드 목록 — A / B / C / D */
function nodes(items) {
  return `
    <ul class="node-row">
      ${items.map(n => `
        <li class="node tone-${n.tone || 'neutral'}">
          <span class="node-name">${n.name}</span>
          ${n.hash ? `<span class="node-hash">${n.hash}</span>` : ''}
          <span class="node-state">${n.state}</span>
        </li>`).join('')}
    </ul>`;
}

/** 점검 항목 */
function bullets(items) {
  return `<ul class="bullet-list">${items.map(t => `<li>${t}</li>`).join('')}</ul>`;
}

/** 층으로 쌓이는 구조 — DApp / Smart Contract / 실행 기반 */
function stack(layers) {
  return `
    <ol class="stack">
      ${layers.map(l => `
        <li class="stack-layer tone-${l.tone || 'neutral'}">
          <p class="stack-title">${l.title}</p>
          <p class="stack-desc">${l.desc}</p>
        </li>`).join('')}
    </ol>`;
}

/** 질문 ↔ 답 묶음 — 원본 p20 정리 */
function qaList(items) {
  return `
    <dl class="qa-grid">
      ${items.map(i => `
        <div class="qa">
          <dt>${i.q}</dt>
          <dd>${i.a}</dd>
        </div>`).join('')}
    </dl>`;
}

/** 노선도 — 정리 화면에서 개념열을 크게 보여준다 */
function routeMap(activeKeys) {
  const active = new Set(activeKeys);
  return `
    <ol class="route-map">
      ${CONCEPTS.map(c => `
        <li class="route-stop${active.has(c.key) ? ' on' : ''}">
          <span class="route-dot" aria-hidden="true"></span>
          <span class="route-label">${c.label}</span>
        </li>`).join('')}
    </ol>`;
}

/** 키워드 나열 */
const tagCloud = items => `<ul class="tag-cloud">${items.map(t => `<li>${t}</li>`).join('')}</ul>`;

/* ------------------------------------------------------------
   25개 화면
   ------------------------------------------------------------ */
const SCREENS = [
  /* ===== Section A. 도입 ===== */
  {
    id: 'L01', sourcePage: 1, section: 'A', type: 'title', concept: 'intro',
    eyebrow: 'BLOCKCHAIN LECTURE',
    title: '블록체인은 왜<br /><em class="accent-block">‘블록</em><em class="accent-chain">체인’</em>일까?',
    body: [
      chainDiagram([
        { name: 'GENESIS', hash: 'A72F…' },
        { name: 'PREV ✓',  hash: '93B1…' },
        { name: 'PREV ✓',  hash: 'E04C…' }
      ]),
      `<p class="s-title-sub">왜 Block 인가? &nbsp; 왜 Chain 인가? &nbsp; 왜 Distributed 인가?</p>`,
      `<p class="s-presenter">김동규 · 서강대학교 블록체인 과정 이전 기수 강의</p>`
    ].join('')
  },
  {
    id: 'L02', sourcePage: 2, section: 'A', type: 'concept', concept: 'intro',
    eyebrow: 'INTRO',
    title: '오늘은 조금 단순하게 설명하겠습니다',
    body: [
      duo(
        { tag: '물은 100℃ 에서', title: '끓는다', lines: ['<span class="quote-strong">“항상?”</span>'], tone: 'neutral' },
        { tag: '지하철 노선도', title: '실제 지도가 아니어도 목적지에는 도착한다', lines: [], tone: 'primary' },
        '≠'
      ),
      duo(
        { tag: '실제 지도', title: '모든 것이 정확하지만 복잡하다', lines: [], tone: 'neutral' },
        { tag: '지하철 노선도', title: '필요한 연결만 남긴다', lines: [], tone: 'primary' },
        '→'
      )
    ].join(''),
    note: '오늘의 목표는 위성사진이 아니라 ‘블록체인 지하철 노선도’를 만드는 것입니다.'
  },

  /* ===== Section B. 장부에 대한 믿음 ===== */
  {
    id: 'L03', sourcePage: 3, section: 'B', type: 'question', concept: 'intro',
    eyebrow: 'QUESTION',
    title: '장부에 대한 믿음은 어디에서 오는가?',
    kicker: '왜 은행 장부의 100만원은 믿을까?',
    body: [
      duo(
        { tag: '은행 장부', title: '잔액 1,000,000 원', lines: [], tone: 'primary' },
        { tag: '내 노트',   title: '잔액 2,000,000 원', lines: [], tone: 'warn' },
        '?'
      ),
      key('왜 왼쪽은 믿고<br />오른쪽은 믿지 않을까?')
    ].join(''),
    note: '중앙화된 장부 = 공식 장부를 관리하고 최종 판단하는 주체가 있다'
  },
  {
    id: 'L04', sourcePage: 4, section: 'B', type: 'concept', concept: 'intro',
    eyebrow: 'ROADMAP',
    title: '“이게 공식 장부입니다”라고<br />한 사람이 말할 수 없다면?',
    kicker: '은행 A · B · C · D',
    body: numberedCards([
      { num: 1, question: '기록이 바뀌지는 않았는가?',                  answer: 'Hash' },
      { num: 2, question: '기록을 어떻게 묶을까?',                      answer: 'Block' },
      { num: 3, question: '과거와 현재를 어떻게 연결할까?',             answer: 'Chain' },
      { num: 4, question: '여러 참여자가 같은 장부를 어떻게 공유할까?', answer: 'Distributed Ledger' },
      { num: 5, question: '서로 다르면 무엇을 진짜라고 할까?',          answer: 'Consensus' }
    ]),
    note: '이 다섯 개의 질문이 오늘 강의의 노선도입니다.'
  },

  /* ===== Section C. Hash → Block → Chain ===== */
  {
    id: 'L05', sourcePage: 5, section: 'C', type: 'experience-entry', concept: 'hash',
    eyebrow: 'HASH',
    title: 'Hash — 기록의 지문',
    kicker: '첫 번째 실습 · 스마트폰으로 QR을 스캔해 직접 해시를 계산해 보세요',
    body: [
      `<div class="hash-rows">
        <p class="hash-row"><span class="hash-in">철수가 영희에게 <strong>10000</strong>원을 보냄</span><span class="hash-op">HASH →</span><span class="hash-out">?</span></p>
        <p class="hash-row"><span class="hash-in">철수가 영희에게 <strong>10001</strong>원을 보냄</span><span class="hash-op">HASH →</span><span class="hash-out">?</span></p>
      </div>`,
      key('숫자 하나만 바꾸면?'),
      lead('Hash = 데이터의 디지털 지문')
    ].join(''),
    note: '“오늘은 이렇게 이해하겠습니다.” · 암호화(숨기기)가 아니라 변경 확인용 지문',
    experience: { kind: 'hash', returnTo: 'L06', label: 'Hash 직접 체험하기' }
  },
  {
    id: 'L06', sourcePage: 6, section: 'C', type: 'experience-entry', concept: 'block',
    eyebrow: 'BLOCK',
    title: '왜 Block 일까?',
    body: [
      duo(
        {
          tag: '흩어진 거래',
          lines: ['A → B &nbsp; 10만원', 'C → D &nbsp; 5만원', 'E → F &nbsp; 20만원', 'G → H &nbsp; 3만원'],
          tone: 'neutral'
        },
        {
          tag: 'BLOCK',
          lines: ['A → B &nbsp; 10만원', 'C → D &nbsp; 5만원', 'E → F &nbsp; 20만원', 'G → H &nbsp; 3만원'],
          foot: 'Hash: 8F3A…',
          tone: 'primary'
        },
        '묶기 →'
      ),
      key('여러 기록을 일정한 단위로 묶는다')
    ].join(''),
    experience: { kind: 'block', returnTo: 'L07', label: 'Block 직접 체험하기' }
  },
  {
    id: 'L07', sourcePage: 7, section: 'C', type: 'concept', concept: 'chain',
    eyebrow: 'CHAIN',
    title: '왜 Chain 일까?',
    body: [
      chainDiagram([
        { name: 'BLOCK 1', txs: ['A → B : 10만원', 'C → D : 5만원'], hash: 'A72F…' },
        { name: 'BLOCK 2', prev: 'A72F…', txs: ['E → F : 20만원'],   hash: '93B1…' },
        { name: 'BLOCK 3', prev: '93B1…', txs: ['G → H : 3만원'],    hash: 'E04C…' }
      ]),
      key('같은 값 → 앞뒤가 연결된다')
    ].join(''),
    note: '다음 Block이 이전 Block의 Hash를 기억한다'
  },
  {
    id: 'L08', sourcePage: 8, section: 'C', type: 'experience-entry', concept: 'chain',
    eyebrow: 'CHAIN',
    title: '하나를 바꾸면?',
    body: [
      chainDiagram([
        {
          name: 'BLOCK 1',
          txs: ['<s>A → B : 10만원</s>'],
          altTx: 'A → B : <strong>100만원</strong>',
          hash: '<s>A72F…</s>',
          altHash: 'C819…',
          state: 'broken'
        },
        { name: 'BLOCK 2', prev: 'A72F…', txs: ['E → F : 20만원'], hash: '93B1…', badge: '✕ &nbsp;Mismatch<br />C819… ≠ A72F…', state: 'broken' },
        { name: 'BLOCK 3', prev: '93B1…', txs: ['G → H : 3만원'],  hash: 'E04C…' }
      ]),
      key('바꿀 수 없는 것이 아니라, 바꾸면 연결이 깨진다')
    ].join(''),
    experience: { kind: 'chain', returnTo: 'L09', label: 'Chain 직접 체험하기' }
  },
  {
    id: 'L09', sourcePage: 9, section: 'C', type: 'question', concept: 'ledger',
    eyebrow: 'TRANSITION',
    title: '그런데 여기까지만이라면?',
    body: [
      chainDiagram([
        { name: 'BLOCK 1', hash: 'A72F…' },
        { name: 'BLOCK 2', hash: '93B1…' },
        { name: 'BLOCK 3', hash: 'E04C…' }
      ], { frame: '은행 서버' }),
      bigQuestion('“이것도 은행 서버에서<br />만들 수 있지 않을까?”')
    ].join(''),
    note: '다시 질문: 누가 이 장부를 가지고, 누가 공식 기록을 결정하는가?'
  },

  /* ===== Section D. Distributed Ledger → Consensus ===== */
  {
    id: 'L10', sourcePage: 10, section: 'D', type: 'concept', concept: 'ledger',
    eyebrow: 'DISTRIBUTED LEDGER',
    title: '서버가 여러 대면 분산원장일까?',
    body: [
      duo(
        {
          tag: '분산된 서버',
          title: '은행',
          lines: ['서울 서버 &nbsp;·&nbsp; 부산 서버 &nbsp;·&nbsp; 백업 서버'],
          foot: '관리자 = 은행',
          tone: 'neutral'
        },
        {
          tag: '분산원장',
          title: '기관 A &nbsp; 기관 B<br />기관 C &nbsp; 기관 D',
          lines: [],
          foot: '공통 규칙으로 보유·검증·인정',
          tone: 'primary'
        },
        '≠'
      ),
      key('서버가 어디에 있는가 &nbsp;≠&nbsp; 누가 장부를 결정하는가')
    ].join('')
  },
  {
    id: 'L11', sourcePage: 11, section: 'D', type: 'question', concept: 'consensus',
    eyebrow: 'CONSENSUS',
    title: '장부가 서로 다르면?',
    body: [
      duo(
        { tag: 'A', title: 'A의 장부', lines: ['철수 → 영희 &nbsp; 1만원'], tone: 'neutral' },
        { tag: 'B', title: 'B의 장부', lines: ['철수 → 영희 &nbsp; 2만원'], tone: 'warn' },
        '누가 맞을까?'
      ),
      key('Consensus')
    ].join(''),
    note: '한 참여자가 단독으로 정답을 선언하지 않는다면, 공통 규칙이 필요하다'
  },
  {
    id: 'L12', sourcePage: 12, section: 'D', type: 'concept', concept: 'consensus',
    eyebrow: 'CONSENSUS',
    title: 'Consensus 에는 여러 방법이 있습니다',
    body: [
      cards([
        { tag: 'Bitcoin',  title: 'Proof of Work',  desc: '오늘 체험할 것 →', accent: true },
        { tag: 'Ethereum', title: 'Proof of Stake', desc: '' },
        { tag: '',         title: '그 밖의 방식 …', desc: '' }
      ], 3),
      key('📱 이제 다시 스마트폰을 꺼내주세요.')
    ].join(''),
    /* 6.5 — L12 는 예고, 실제 체험 진입은 L13 */
    advance: { to: 'L13', label: 'PoW 체험 시작' }
  },

  /* ===== Section E. Proof of Work ===== */
  {
    id: 'L13', sourcePage: 13, section: 'E', type: 'experience-entry', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '‘00’ 을 먼저 찾아라',
    body: [
      `<div class="target-line"><span class="target-badge">00</span><span class="target-desc">으로 시작하는 Hash</span></div>`,
      `<ul class="candidate-list"><li>Blockchain 1</li><li>Blockchain 2</li><li>Blockchain 3</li><li>…</li></ul>`,
      key('Hash 앞 두 자리가 00 인 숫자를 먼저 찾으세요.')
    ].join(''),
    note: '먼저 찾은 사람은 손을 들어 주세요 · “설명하지 않을 테니 일단 해보겠습니다.”',
    experience: { kind: 'pow', returnTo: 'L14', label: 'PoW 직접 체험하기' }
  },
  {
    id: 'L14', sourcePage: 14, section: 'E', type: 'question', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '방금 ‘어려운 수학문제’를 풀었을까?',
    kicker: '채굴 = 어려운 수학문제를 푼다?',
    body: [
      duo(
        { tag: 'A', title: '초당 10회',        lines: [], tone: 'neutral' },
        { tag: 'B', title: '초당 1,000,000회', lines: [], tone: 'primary' },
        'vs'
      ),
      key('누가 먼저 찾을 가능성이 높을까?')
    ].join('')
  },
  {
    id: 'L15', sourcePage: 14, section: 'E', type: 'concept', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '조건을 만족할 때까지 반복해서 시도한다',
    body: [
      flow([
        { text: '숫자 변경' },
        { text: 'Hash 계산' },
        { text: '00인가?', desc: '예 → 성공 &nbsp;/&nbsp; 아니오 → 다시 숫자 변경' },
        { text: '성공', tone: 'ok' }
      ]),
      sub('아니오 인 동안에는 숫자 변경 → Hash 계산 을 계속 반복한다')
    ].join(''),
    note: '실제 Bitcoin에서는 ‘00’의 개수가 아니라 Hash가 Target보다 작은지를 판단'
  },
  {
    id: 'L16', sourcePage: 15, section: 'E', type: 'concept', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '그래서 먼저 찾으면 무엇을 하나?',
    kicker: '“00 을 찾았습니다. 그래서요?”',
    body: [
      nodes([
        { name: 'A', hash: 'a1c7…', state: '…계산 중' },
        { name: 'B', hash: '',      state: '성공!', tone: 'ok' },
        { name: 'C', hash: 'f09e…', state: '…계산 중' },
        { name: 'D', hash: '7b22…', state: '…계산 중' }
      ]),
      chainDiagram([
        { name: 'NEW BLOCK', prev: 'E04C…', hash: '00A7…', state: 'new' }
      ]),
      key('“이 Block을 다음 Block으로 제안합니다.”')
    ].join(''),
    note: 'PoW → 다음 Block을 ‘제안’할 기회와 연결'
  },
  {
    id: 'L17', sourcePage: 16, section: 'E', type: 'concept', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '제안했다고 끝이 아니다',
    body: [
      chainDiagram([
        { name: 'B가 제안한 BLOCK', prev: 'E04C…', hash: '00A7…', state: 'new' }
      ]),
      nodes([
        { name: 'A', state: '✓', tone: 'ok' },
        { name: 'C', state: '✓', tone: 'ok' },
        { name: 'D', state: '✓', tone: 'ok' }
      ]),
      bullets([
        '거래가 규칙에 맞는가?',
        'Previous Hash가 맞는가?',
        'PoW 조건을 만족했는가?'
      ])
    ].join(''),
    note: '검증 항목은 모두 공통 규칙이다'
  },
  {
    id: 'L18', sourcePage: 16, section: 'E', type: 'concept', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '제안 &nbsp;≠&nbsp; 인정',
    body: [
      flow([
        { text: '제안' },
        { text: '검증', desc: '공통 규칙으로 검증 · A B C D' },
        { text: '장부 반영', desc: '각자의 장부에 동일한 Block 추가', tone: 'ok' }
      ]),
      key('먼저 찾았다고 마음대로 장부를 쓸 수 없다')
    ].join(''),
    note: '먼저 찾았다고 마음대로 장부를 쓸 수 없다 · 다른 노드가 공통 규칙으로 검증한다'
  },

  /* ===== Section F. Ethereum → Smart Contract → DApp ===== */
  {
    id: 'L19', sourcePage: 17, section: 'F', type: 'summary',
    concept: ['hash', 'block', 'chain', 'ledger', 'consensus', 'pow'],
    eyebrow: 'SUMMARY',
    title: '장부에 대한 믿음은 어디에서 올까?',
    body: [
      duo(
        { tag: '중앙화된 장부', title: '관리주체가 공식 장부를 결정', lines: [], tone: 'neutral' },
        { tag: '분산원장',     title: '공통 규칙에 따라 보유·검증·합의', lines: [], tone: 'primary' },
        '↔'
      ),
      cards([
        { tag: 'Hash',               title: '변경 확인' },
        { tag: 'Block',              title: '기록 묶음' },
        { tag: 'Chain',              title: '앞뒤 연결' },
        { tag: 'Distributed Ledger', title: '여러 참여자의 장부' },
        { tag: 'Consensus',          title: '무엇을 인정할 것인가' },
        { tag: 'PoW',                title: 'Bitcoin의 합의 메커니즘' }
      ], 3)
    ].join('')
  },
  {
    id: 'L20', sourcePage: 17, section: 'F', type: 'question', concept: 'ethereum',
    eyebrow: 'TRANSITION',
    title: '',
    body: bigQuestion('“이 장부에는<br />송금 기록만 적어야 할까?”'),
    note: '여기에서 Ethereum 이야기가 시작됩니다.'
  },
  {
    id: 'L21', sourcePage: 18, section: 'F', type: 'concept', concept: 'ethereum',
    eyebrow: 'ETHEREUM',
    title: 'Ethereum 은 왜 World Computer 라고 할까?',
    body: [
      duo(
        { tag: '기존 장부', title: 'A → B &nbsp; 1만원', lines: [], tone: 'neutral' },
        { tag: '“기록 말고 규칙도 넣으면?”', title: 'IF &nbsp; 조건 충족<br />THEN 자산 이전', lines: [], tone: 'primary' },
        '→'
      ),
      nodes([
        { name: 'Node 1', state: 'IF' },
        { name: 'Node 2', state: 'IF' },
        { name: 'Node 3', state: 'IF' },
        { name: 'Node 4', state: 'IF' }
      ]),
      key('여러 노드가 동일한 프로그램과 상태를 공유 → World Computer')
    ].join(''),
    note: '“한 대의 거대한 컴퓨터라는 뜻은 아니다.”'
  },
  {
    id: 'L22', sourcePage: 19, section: 'F', type: 'concept', concept: ['contract', 'dapp'],
    eyebrow: 'SMART CONTRACT · DAPP',
    title: 'Smart Contract 와 DApp',
    body: [
      stack([
        { title: 'DApp',                   desc: '사용자가 그 프로그램을 이용하는 애플리케이션', tone: 'primary' },
        { title: 'Smart Contract',         desc: '블록체인 위에서 실행되는 프로그램' },
        { title: 'Ethereum / Blockchain',  desc: '프로그램이 실행되는 기반' }
      ]),
      sub('사용자 ↓ 화면·앱 &nbsp;/&nbsp; 프로그램 ↓ 실행 기반')
    ].join('')
  },

  /* ===== Section G. 정리 ===== */
  {
    id: 'L23', sourcePage: 20, section: 'G', type: 'summary',
    concept: ['hash', 'block', 'chain', 'ledger', 'consensus'],
    eyebrow: 'SUMMARY ①',
    title: '오늘 만든 블록체인 노선도 ①',
    body: [
      routeMap(['hash', 'block', 'chain', 'ledger', 'consensus']),
      qaList([
        { q: '왜 Block?',       a: '기록을 묶기 위해' },
        { q: '왜 Chain?',       a: '기록을 연결하기 위해' },
        { q: '왜 Distributed?', a: '한 중앙 장부에만 의존하지 않고 여러 참여자가 보유·검증하기 위해' },
        { q: '왜 Consensus?',   a: '무엇을 올바른 기록으로 인정할지 결정하기 위해' }
      ])
    ].join('')
  },
  {
    id: 'L24', sourcePage: 20, section: 'G', type: 'summary',
    concept: ['pow', 'ethereum', 'contract', 'dapp'],
    eyebrow: 'SUMMARY ②',
    title: '오늘 만든 블록체인 노선도 ②',
    body: [
      routeMap(['pow', 'ethereum', 'contract', 'dapp']),
      qaList([
        { q: '왜 PoW에 컴퓨팅 파워가 필요한가?', a: '조건을 만족하는 값을 찾기 위해 반복 계산하기 때문에' },
        { q: 'Smart Contract?',                  a: '블록체인 위에서 실행되는 프로그램' },
        { q: 'DApp?',                            a: '그 프로그램을 사용하는 애플리케이션' }
      ])
    ].join('')
  },
  {
    id: 'L25', sourcePage: 21, section: 'G', type: 'summary', concept: 'all',
    eyebrow: 'CLOSING',
    title: '오늘 만든 것은<br />블록체인의 ‘지하철 노선도’입니다.',
    body: [
      tagCloud(['Bitcoin', 'Ethereum', 'Stablecoin', 'NFT', 'STO', 'RWA', 'DeFi', 'CBDC', 'Web3', '…']),
      key('오늘 만든 노선도의 어디에 있는 이야기인지 먼저 생각해 보세요')
    ].join(''),
    closing: true
  }
];
