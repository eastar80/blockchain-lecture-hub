/* ============================================================
   lecture/screens.js — 강의 화면 콘텐츠 단일 출처

   원본: materials/lecture.pdf — 블록체인_강의자료_v2.1 (28페이지)
   화면: L01 ~ L34
          원본 p14 / p16 / p17 / p20 은 가독성을 위해 2화면으로 나눴고,
          L02(강사 포지셔닝)·L32~L34(에필로그)는 원본에 없는 신규 화면이다.

   각 화면 객체는 다음을 가진다.
     id         화면의 고정 ID. 번호가 바뀌어도 이 값은 바뀌지 않는다 ('pow-challenge')
                체험 복귀·내부 이동은 전부 이 값을 기준으로 연결한다.
     number     화면에 표시하고 주소로 쓰는 번호 ('L14' → lecture/index.html#/L14)
                #/pow-challenge 로 들어와도 같은 화면이 열린다.
     sourcePage 원본 PDF 페이지 — 원본 대비 추적용 (신규 화면에는 없다)
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
   진행 표시기 — 두 개의 노선

   오늘 강의는 하나의 직선이 아니라 서로 다른 질문에 답하는
   두 개의 연결된 노선이다. 상단 표시기도 그렇게 보여야
   'PoW 다음 기술이 Ethereum' 처럼 읽히지 않는다.

   LINE 1  여러 참여자가 어떻게 믿을 수 있는 장부를 만들고 이어갈까?
   환승     공유된 장부 → 공유된 State
   LINE 2  그 공유된 시스템에서 Program 까지 실행할 수 있다면?
   ------------------------------------------------------------ */
const LINES = [
  {
    id: 1,
    label: 'LINE 1 · 공유된 장부',
    question: '여러 참여자가 어떻게 믿을 수 있는 장부를 만들고 이어갈까?',
    stops: [
      { key: 'hash',      label: 'Hash',               short: 'Hash' },
      { key: 'block',     label: 'Block',              short: 'Block' },
      { key: 'chain',     label: 'Chain',              short: 'Chain' },
      { key: 'ledger',    label: 'Distributed Ledger', short: 'Ledger' },
      { key: 'consensus', label: 'Consensus',          short: 'Consensus' },
      { key: 'pow',       label: 'PoW',                short: 'PoW' }
    ]
  },
  {
    id: 2,
    label: 'LINE 2 · 공유된 State',
    question: '그 공유된 시스템에서 Program 까지 실행할 수 있다면?',
    stops: [
      { key: 'state',      label: 'State',            short: 'State' },
      { key: 'program',    label: 'Input · Program',  short: 'Program' },
      { key: 'transition', label: 'State Transition', short: 'Transition' },
      { key: 'verify',     label: '노드 검증',         short: '검증' },
      { key: 'world',      label: 'World Computer',   short: 'World' },
      { key: 'contract',   label: 'Smart Contract',   short: 'Contract' },
      { key: 'dapp',       label: 'DApp',             short: 'DApp' },
      /* EVM 은 노선의 핵심 역이 아니다. 오늘 잠깐 들여다보는 심화영역 입구로 둔다 */
      { key: 'evm',        label: 'EVM',              short: 'EVM', edge: true }
    ]
  }
];

const TRANSFER_LABEL = '환승 · 공유된 장부 → 공유된 State';

/* ------------------------------------------------------------
   목차 Section — 34개를 한 번에 나열하지 않고 9개 Section 을 먼저 보여준다
   ------------------------------------------------------------ */
const SECTIONS = [
  { id: 'A', label: '도입',                                    from: 'L01', to: 'L03' },
  { id: 'B', label: '장부에 대한 믿음',                        from: 'L04', to: 'L05' },
  { id: 'C', label: 'Hash → Block → Chain',                    from: 'L06', to: 'L10' },
  { id: 'D', label: 'Distributed Ledger → Consensus',          from: 'L11', to: 'L13' },
  { id: 'E', label: 'Proof of Work',                           from: 'L14', to: 'L19' },
  { id: 'F', label: '첫 번째 노선 회수 · 환승',                from: 'L20', to: 'L21' },
  { id: 'G', label: 'Ethereum · World Computer',               from: 'L22', to: 'L29' },
  { id: 'H', label: '두 개의 노선도',                          from: 'L30', to: 'L31' },
  { id: 'I', label: '에필로그 · 배우고, 해보고, 다시 배우기',   from: 'L32', to: 'L34' }
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
function duo(left, right, middle, variant) {
  const side = (s, pos) => `
    <div class="duo-card duo-${pos} tone-${s.tone || 'neutral'}">
      ${s.tag ? `<p class="duo-tag">${s.tag}</p>` : ''}
      ${s.title ? `<p class="duo-title">${s.title}</p>` : ''}
      ${(s.lines || []).map(l => `<p class="duo-line">${l}</p>`).join('')}
      ${s.html || ''}
      ${s.foot ? `<p class="duo-foot">${s.foot}</p>` : ''}
    </div>`;
  return `
    <div class="duo${variant ? ' duo-' + variant : ''}">
      ${side(left, 'left')}
      ${middle ? `<div class="duo-mid" aria-hidden="true">${middle}</div>` : '<div class="duo-mid duo-mid-plain" aria-hidden="true">vs</div>'}
      ${side(right, 'right')}
    </div>`;
}

/** 번호가 붙은 질문 카드 목록 — 원본 p4 의 5개 질문 */
function numberedCards(items, layout) {
  return `
    <ol class="num-list${layout === 'row' ? ' num-row' : ''}">
      ${items.map(i => `
        <li class="num-item">
          <span class="num-badge" aria-hidden="true">${i.num}</span>
          <p class="num-question">${i.question}</p>
          <span class="num-answer">${i.answer}</span>
        </li>`).join('')}
    </ol>`;
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
  return `<div class="blk-row ${opt.frame ? 'blk-framed' : ''} ${opt.size === 'lg' ? 'blk-lg' : ''}">
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


/* ------------------------------------------------------------
   2차 고도화 helper
   원본 PDF 의 비교·인과·공간 관계를 되살리기 위한 표현들.
   카드로 평탄화하지 않고 의미에 맞는 구조를 쓴다.
   ------------------------------------------------------------ */

/**
 * ConclusionStrip — 원본 하단 한 줄 결론을 본문급으로 올린다.
 * 이 문장들은 장표의 핵심인 경우가 많아 작은 note 로 두지 않는다.
 */
const conclusion = (text, tag) => `
  <div class="s-conclusion">
    ${tag ? `<span class="s-conclusion-tag">${tag}</span>` : ''}
    <p class="s-conclusion-text">${text}</p>
  </div>`;

/**
 * RecallStrip — 앞 화면의 맥락을 작게 회수한다.
 * 원본 한 장을 두 화면으로 나누면서 끊긴 인과를 잇는 용도.
 */
const recall = (label, text) => `
  <div class="recall">
    <span class="recall-tag">${label}</span>
    <span class="recall-text">${text}</span>
  </div>`;

/**
 * Converge — 두 갈래가 하나의 결과로 모이는 구조.
 * A/B 계산 속도가 같은 결론으로 수렴하는 L14 에서 쓴다.
 */
const converge = ({ question, via, result }) => `
  <div class="converge">
    <div class="converge-arms" aria-hidden="true"></div>
    ${question ? `<p class="converge-question">${question}</p>` : ''}
    <p class="converge-via">${via}</p>
    <p class="converge-drop" aria-hidden="true">↓</p>
    <p class="converge-result">${result}</p>
  </div>`;

/**
 * LoopFlow — 조건을 만족할 때까지 되돌아가는 반복 구조.
 * 되돌아가는 선을 실제로 그려서 ‘반복’이 보이게 한다.
 */
function loopFlow({ steps, decision, noLabel, yes }) {
  const body = [
    ...steps.map(t => `<li class="loop-step">${t}</li>`),
    `<li class="loop-step loop-decide">
       <span class="loop-decide-q">${decision.text}</span>
       ${decision.desc ? `<span class="loop-decide-desc">${decision.desc}</span>` : ''}
     </li>`,
    `<li class="loop-yes"><span class="loop-yes-tag">예</span>${yes}</li>`
  ];
  /* 되돌아가는 괄호는 ‘숫자 변경 ~ 조건 확인’ 행만 덮는다.
     암시적 그리드에서는 음수 행 번호가 해석되지 않으므로 span 으로 지정한다. */
  const backSpan = steps.length + 1;
  return `
    <ol class="loop">
      <li class="loop-back" style="grid-row: 1 / span ${backSpan};">
        <span class="loop-back-label">${noLabel}</span>
      </li>
      ${body.join('')}
    </ol>`;
}

/**
 * CausalFlow — 입력 → 검사 → 결과를 하나의 세로 흐름으로 연결한다.
 * stage: { tag, tone: 'in'|'check'|'out', html }
 */
function causalFlow(stages, options) {
  const opt = options || {};
  return `
    <ol class="causal${opt.row ? ' causal-row' : ''}">
      ${stages.map((stage, i) => `
        ${i > 0 ? '<li class="causal-arrow" aria-hidden="true">↓</li>' : ''}
        <li class="causal-stage tone-${stage.tone || 'in'}">
          ${stage.tag ? `<p class="causal-tag">${stage.tag}</p>` : ''}
          ${stage.html}
        </li>`).join('')}
    </ol>`;
}

/** 검증 항목 — 체크박스 형태로 ‘검사한다’는 동작을 보이게 한다 */
const checkList = (items, options) => {
  const done = options && options.done;
  return `
  <ul class="check-list${done ? ' check-done' : ''}">
    ${items.map(t => `<li><span class="check-box" aria-hidden="true">${done ? '✓' : ''}</span>${t}</li>`).join('')}
  </ul>`;
};

/**
 * LedgerCopies — 같은 Block 이 각자의 장부에 똑같이 추가되는 모습.
 * ‘장부 반영’을 문장이 아니라 그림으로 보여준다.
 */
const ledgerCopies = (owners, entry) => `
  <ul class="ledgers">
    ${owners.map(o => `
      <li class="ledger">
        <p class="ledger-name">${o} 장부</p>
        <p class="ledger-old">… 이전 Block</p>
        <p class="ledger-add">+ ${entry}</p>
      </li>`).join('')}
  </ul>`;

/**
 * RouteWithRoles — 개념열을 노선으로 잇고 각 역의 역할을 함께 보여준다.
 * 개념이 독립 카드가 아니라 ‘하나의 문제를 푸는 연결선’으로 읽히게 한다.
 */
const routeWithRoles = items => `
  <ol class="route-roles">
    ${items.map((i, n) => `
      ${n > 0 ? '<li class="route-roles-link" aria-hidden="true"></li>' : ''}
      <li class="route-roles-stop">
        <span class="route-roles-dot" aria-hidden="true"></span>
        <span class="route-roles-name">${i.name}</span>
        <span class="route-roles-role">${i.role}</span>
      </li>`).join('')}
  </ol>`;

/**
 * TreeOrg — 중앙 관리 구조(한 주체 → 여러 서버)
 * children 수에 맞춰 가로 연결선이 자동으로 맞춰진다.
 */
const treeOrg = ({ tag, root, rootNote, children, foot }) => `
  <div class="org org-tree">
    ${tag ? `<p class="org-tag">${tag}</p>` : ''}
    <p class="tree-root">
      <span class="tree-root-name">${root}</span>
      ${rootNote ? `<span class="tree-root-note">${rootNote}</span>` : ''}
    </p>
    <ul class="tree-leaves" style="--n:${children.length}">
      ${children.map(c => `
        <li>
          <span class="tree-leaf-name">${c.name}</span>
          ${c.note ? `<span class="tree-leaf-note">${c.note}</span>` : ''}
        </li>`).join('')}
    </ul>
    ${foot ? `<p class="org-foot">${foot}</p>` : ''}
  </div>`;

/**
 * MeshOrg — 분산 구조(참여자끼리 서로 연결)
 * 노드 사이 연결선을 SVG 로 그려 ‘서로 보유·검증’ 관계를 남긴다.
 */
const meshOrg = ({ tag, nodes: list, foot }) => `
  <div class="org org-mesh">
    ${tag ? `<p class="org-tag">${tag}</p>` : ''}
    <div class="mesh">
      <svg class="mesh-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="25" y1="25" x2="75" y2="25" /><line x1="25" y1="75" x2="75" y2="75" />
        <line x1="25" y1="25" x2="25" y2="75" /><line x1="75" y1="25" x2="75" y2="75" />
        <line x1="25" y1="25" x2="75" y2="75" /><line x1="75" y1="25" x2="25" y2="75" />
      </svg>
      <ul class="mesh-grid">${list.map(n => `<li class="mesh-node">${n}</li>`).join('')}</ul>
    </div>
    ${foot ? `<p class="org-foot">${foot}</p>` : ''}
  </div>`;

/** 두 조직 구조를 나란히 놓고 비교한다 */
const orgCompare = (left, right, middle) => `
  <div class="org-compare">
    ${left}
    <div class="org-vs" aria-hidden="true">${middle || '≠'}</div>
    ${right}
  </div>`;

/**
 * Gather — 흩어진 기록이 하나의 Block 안으로 모이는 공간 변화.
 * 2개 카드 비교가 아니라 ‘들어간다’가 보이게 한다.
 */
const gather = ({ looseTag, items, actionLabel, blockName, blockHash }) => `
  <div class="gather">
    <div class="gather-loose">
      <p class="gather-tag">${looseTag}</p>
      <ul class="gather-tickets">${items.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>
    <p class="gather-action" aria-hidden="true">${actionLabel}</p>
    <div class="gather-block">
      <p class="gather-block-name">${blockName}</p>
      <ul class="gather-inside">${items.map(t => `<li>${t}</li>`).join('')}</ul>
      <p class="gather-hash">${blockHash}</p>
    </div>
  </div>`;

/**
 * BranchTree — 상위 개념에서 하위 방식으로 뻗는 구조.
 * Consensus 아래에 여러 합의 방식이 있다는 상하 관계를 살린다.
 */
const branchTree = ({ root, branches }) => `
  <div class="branch">
    <p class="branch-root">${root}</p>
    <div class="branch-body">
      <div class="branch-spine" aria-hidden="true"></div>
      <ul class="branch-list">
        ${branches.map(b => `
          <li class="branch-item${b.accent ? ' accent' : ''}">
            <span class="branch-owner">${b.owner}</span>
            <span class="branch-arrow" aria-hidden="true">→</span>
            <span class="branch-name">${b.name}</span>
            ${b.flag ? `<span class="branch-flag">${b.flag}</span>` : ''}
          </li>`).join('')}
      </ul>
    </div>
  </div>`;

/**
 * SharedNodes — 여러 노드가 같은 것을 공유한다는 연결 구조.
 * 노드 사이를 실제 선으로 잇고 각 노드 안에 같은 표시를 둔다.
 */
const sharedNodes = ({ items, chip, label, tone }) => {
  const row = items.map((n, i) =>
    (i > 0 ? '<li class="shared-link" aria-hidden="true"></li>' : '') +
    `<li class="shared-node"><span class="shared-name">${n}</span><span class="shared-chip">${chip}</span></li>`
  ).join('');
  return `
    <div class="shared tone-${tone || 'share'}">
      <ul class="shared-row">${row}</ul>
      ${label ? `<p class="shared-label">${label}</p>` : ''}
    </div>`;
};

/**
 * ChangeTrail — 변경이 어디까지 번지는지 단계로 보여준다.
 * L08 의 ‘거래 변경 → Hash 변경 → 앞뒤 연결 불일치’ 전파용.
 */
const changeTrail = steps => `
  <ol class="trail">
    ${steps.map((s, i) => `
      ${i > 0 ? '<li class="trail-arrow" aria-hidden="true">→</li>' : ''}
      <li class="trail-step tone-${s.tone || 'neutral'}">
        <span class="trail-order" aria-hidden="true">${i + 1}</span>
        <span class="trail-text">${s.text}</span>
        <span class="trail-value">${s.value}</span>
      </li>`).join('')}
  </ol>`;

/* ------------------------------------------------------------
   MapCompare — 실제 지도 ↔ 지하철 노선도

   같은 역(망원·합정·상수·광흥창·대흥·공덕 / 홍대입구·신촌·이대·충정로)을
   두 번 그린다. 왼쪽은 실제 위치대로 구부러지게, 오른쪽은 직선과 45°로.
   역이 같다는 것을 보여야 ‘무엇을 버렸는가’가 드러난다.
   외부 이미지를 쓰지 않고 SVG 로 그려 정적 사이트에서 그대로 동작한다.
   ------------------------------------------------------------ */

const LINE_GREEN = '#3aa14a';   /* 2호선 */
const LINE_BROWN = '#9a5b28';   /* 6호선 */

/** 역 표시 + 이름 */
function mapStop(x, y, name, color, place) {
  const pos = {
    up:    { dx: 0,   dy: -3.4, anchor: 'middle' },
    down:  { dx: 0,   dy: 5.4,  anchor: 'middle' },
    left:  { dx: -3,  dy: 1.2,  anchor: 'end' },
    right: { dx: 3,   dy: 1.2,  anchor: 'start' }
  }[place];
  return `
    <circle cx="${x}" cy="${y}" r="1.7" fill="#fff" stroke="${color}" stroke-width="1.2" />
    <text x="${x + pos.dx}" y="${y + pos.dy}" text-anchor="${pos.anchor}" class="map-label">${name}</text>`;
}

/** 환승역 — 두 색 점을 가진 흰 캡슐 */
function mapTransfer(x, y, name, place) {
  const pos = place === 'left'
    ? { dx: -6, dy: 1.2, anchor: 'end' }
    : { dx: 0, dy: 7, anchor: 'middle' };
  return `
    <rect x="${x - 4.6}" y="${y - 2.6}" width="9.2" height="5.2" rx="2.6"
          fill="#fff" stroke="#1f2937" stroke-width="0.9" />
    <circle cx="${x - 1.9}" cy="${y}" r="1.05" fill="${LINE_GREEN}" />
    <circle cx="${x + 1.9}" cy="${y}" r="1.05" fill="${LINE_BROWN}" />
    <text x="${x + pos.dx}" y="${y + pos.dy}" text-anchor="${pos.anchor}" class="map-label map-label-strong">${name}</text>`;
}

/** 왼쪽 — 실제 지도. 강과 길이 있고 노선이 구부러진다. */
const realMapSvg = () => `
  <svg class="map-svg" viewBox="0 0 100 54" role="img"
       aria-label="실제 지도: 한강과 도로 위에 망원·합정·상수·광흥창·대흥·공덕, 홍대입구·신촌·이대·충정로가 실제 위치대로 구부러진 선으로 이어져 있다">
    <rect width="100" height="54" fill="#fbfaf7" />
    <path d="M -2 37 Q 18 42 34 48.6 Q 48 54 64 56.3 L 64 60 L -2 60 Z" fill="#dbe7f3" />
    <g stroke="#e7e3dc" stroke-width="1.3" fill="none" stroke-linecap="round">
      <path d="M 0 23 Q 26 18.5 44 24 T 100 21" />
      <path d="M 22 0 Q 26 15.4 20 30.8 T 26 54" />
      <path d="M 60 0 Q 56 17 64 29.3 T 58 54" />
      <path d="M 0 44.7 Q 30 38.6 52 43.2 T 100 35.5" />
      <path d="M 84 0 Q 80 20 88 33.9" />
    </g>
    <path d="M 16 29.3 Q 22 17 33 9.3 Q 43 9.3 52 17 Q 60 18.5 67 13.9 Q 78 12.3 88 7.7"
          fill="none" stroke="${LINE_GREEN}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 6 15.4 Q 10 23 16 29.3 Q 22 33.2 29 33.9 Q 36 36.2 43 36.2 Q 50 36.2 57 35.5 Q 66 36.2 72 40.1"
          fill="none" stroke="${LINE_BROWN}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    ${mapStop(6, 15.4, '망원', LINE_BROWN, 'up')}
    ${mapStop(29, 33.9, '상수', LINE_BROWN, 'down')}
    ${mapStop(43, 36.2, '광흥창', LINE_BROWN, 'down')}
    ${mapStop(57, 35.5, '대흥', LINE_BROWN, 'down')}
    ${mapStop(72, 40.1, '공덕', LINE_BROWN, 'down')}
    ${mapStop(33, 9.3, '홍대입구', LINE_GREEN, 'up')}
    ${mapStop(52, 17, '신촌', LINE_GREEN, 'down')}
    ${mapStop(67, 13.9, '이대', LINE_GREEN, 'up')}
    ${mapStop(88, 7.7, '충정로', LINE_GREEN, 'up')}
    ${mapTransfer(16, 29.3, '합정', 'left')}
    <text x="8" y="50.9" class="map-caption">한강</text>
  </svg>`;

/** 오른쪽 — 지하철 노선도. 지형을 버리고 직선과 등간격만 남긴다. */
const schematicMapSvg = () => `
  <svg class="map-svg" viewBox="0 0 100 54" role="img"
       aria-label="지하철 노선도: 같은 역들이 직선과 등간격으로 정리되어, 합정에서 갈아탈 수 있다는 연결만 남아 있다">
    <rect width="100" height="54" fill="#ffffff" />
    <path d="M 20 40.1 L 20 20 Q 20 13.9 26 13.9 L 88 13.9"
          fill="none" stroke="${LINE_GREEN}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 8 40.1 L 76 40.1"
          fill="none" stroke="${LINE_BROWN}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    ${mapStop(8, 40.1, '망원', LINE_BROWN, 'down')}
    ${mapStop(34, 40.1, '상수', LINE_BROWN, 'down')}
    ${mapStop(48, 40.1, '광흥창', LINE_BROWN, 'down')}
    ${mapStop(62, 40.1, '대흥', LINE_BROWN, 'down')}
    ${mapStop(76, 40.1, '공덕', LINE_BROWN, 'down')}
    ${mapStop(20, 27.8, '홍대입구', LINE_GREEN, 'right')}
    ${mapStop(40, 13.9, '신촌', LINE_GREEN, 'up')}
    ${mapStop(58, 13.9, '이대', LINE_GREEN, 'up')}
    ${mapStop(84, 13.9, '충정로', LINE_GREEN, 'up')}
    ${mapTransfer(20, 40.1, '합정', 'down')}
  </svg>`;

const mapCompare = (left, right) => `
  <div class="map-compare">
    <figure class="map-panel">
      <figcaption class="map-tag">${left.tag}</figcaption>
      ${realMapSvg()}
      <p class="map-title">${left.title}</p>
      <p class="map-note">${left.note}</p>
    </figure>
    <p class="map-arrow" aria-hidden="true">→</p>
    <figure class="map-panel is-schematic">
      <figcaption class="map-tag">${right.tag}</figcaption>
      ${schematicMapSvg()}
      <p class="map-title">${right.title}</p>
      <p class="map-note">${right.note}</p>
    </figure>
  </div>`;

/**
 * SimplifyExample — ‘단순화란 무엇인가’를 여는 예시.
 * 원본에서 한 줄로 지나가지만 강의에서는 질문을 던지는 자리라 크게 잡는다.
 */
const simplifyExample = (tag, statement, ask) => `
  <div class="simplify">
    <p class="simplify-tag">${tag}</p>
    <p class="simplify-statement">${statement}</p>
    <p class="simplify-ask">${ask}</p>
  </div>`;

/**
 * ClosingMessage — 마지막 화면의 키워드와 당부를 한 흐름으로 읽히게 한다.
 * 키워드 나열과 문장이 따로 놓이면 연결이 끊긴다.
 */
const closingMessage = (items, text) => `
  <div class="closing-message">
    <ul class="tag-cloud">${items.map(t => `<li>${t}</li>`).join('')}</ul>
    <p class="closing-text">${text}</p>
  </div>`;

/* ------------------------------------------------------------
   Ethereum · 공유된 State 파트 helper
   ------------------------------------------------------------ */

/** IF / THEN 규칙 블록 — 티켓 판매 프로그램 */
const ruleBlock = ({ tag, ifLines, thenLines }) => `
  <div class="rule">
    ${tag ? `<p class="rule-tag">${tag}</p>` : ''}
    <div class="rule-body">
      <p class="rule-kw">IF</p>
      <ul class="rule-lines">${ifLines.map(l => `<li>${l}</li>`).join('')}</ul>
      <p class="rule-kw rule-kw-then">THEN</p>
      <ul class="rule-lines">${thenLines.map(l => `<li>${l}</li>`).join('')}</ul>
    </div>
  </div>`;

/** State 상자 — 가격 / 남은 티켓 / 판매량 */
const stateBox = ({ tag, rows, tone }) => `
  <div class="statebox tone-${tone || 'neutral'}">
    <p class="statebox-tag">${tag}</p>
    <dl class="statebox-rows">
      ${rows.map(r => `<div class="statebox-row"><dt>${r.k}</dt><dd>${r.v}</dd></div>`).join('')}
    </dl>
  </div>`;

/**
 * StateFlow — 현재 State + Input → Program → 새로운 State
 * 강의 전체에서 이 네 칸의 순서를 똑같이 반복해 같은 Mental Model 을 유지한다.
 */
const stateFlow = ({ current, input, program, next }) => `
  <div class="stateflow">
    ${stateBox(current)}
    <div class="stateflow-mid">
      <div class="stateflow-cell">
        <p class="stateflow-tag">INPUT</p>
        <p class="stateflow-input">${input}</p>
      </div>
      <p class="stateflow-arrow" aria-hidden="true">↓</p>
      <div class="stateflow-cell">
        <p class="stateflow-tag">PROGRAM</p>
        <ul class="stateflow-checks">${program.map(l => `<li>${l}</li>`).join('')}</ul>
      </div>
    </div>
    ${stateBox(next)}
  </div>`;

/**
 * IpsPanels — INPUT | PROGRAM | STATE 세 영역.
 * 체험도구와 같은 구조로 보여 화면이 바뀌어도 같은 Mental Model 을 유지한다.
 */
const ipsPanels = ({ input, program, state }) => `
  <div class="ips">
    <div class="ips-panel">
      <p class="ips-tag">INPUT</p>
      ${input}
    </div>
    <div class="ips-panel ips-program">
      <p class="ips-tag">PROGRAM</p>
      ${program}
    </div>
    <div class="ips-panel ips-state">
      <p class="ips-tag">STATE</p>
      ${state}
    </div>
  </div>`;

/** 실행 순서 — 학생이 직접 눌러볼 순서 */
const runOrder = (tag, items) => `
  <div class="runorder">
    <p class="runorder-tag">${tag}</p>
    <ol class="runorder-list">
      ${items.map((t, i) => `<li><span class="runorder-num">${i + 1}</span>${t}</li>`).join('')}
    </ol>
  </div>`;

/** 네 번의 실행 결과 표 — 같은 Input 도 State 에 따라 결과가 달라진다 */
const runTable = (tag, rows) => `
  <div class="runtable">
    <p class="runtable-tag">${tag}</p>
    <ol class="runtable-rows">
      ${rows.map((r, i) => `
        <li class="runtable-row tone-${r.ok ? 'ok' : 'fail'}">
          <span class="runtable-num">${i + 1}</span>
          <span class="runtable-call">${r.call}</span>
          <span class="runtable-why">${r.why}</span>
          <span class="runtable-result">${r.result}</span>
        </li>`).join('')}
    </ol>
  </div>`;

/* EVM 내부 실행 예시(evmSteps)는 강의 범위 밖이라 화면과 함께 뺐다.
   lecture.css 의 .evm* 규칙은 남아 있지만 지금은 아무 화면도 쓰지 않는다. */

/** 환승 표시 — 노선이 바뀌는 지점 */
const transferMark = (from, to, note) => `
  <div class="transfer">
    <p class="transfer-tag">환승</p>
    <p class="transfer-line">
      <span class="transfer-from">${from}</span>
      <span class="transfer-arrow" aria-hidden="true">→</span>
      <span class="transfer-to">${to}</span>
    </p>
    ${note ? `<p class="transfer-note">${note}</p>` : ''}
  </div>`;

/**
 * TwoLines — 오늘 만든 두 개의 노선도.
 * 하나의 직선으로 보이지 않도록 두 Line 을 나누고 사이에 환승역을 둔다.
 */
const twoLines = ({ line1, transfer, line2 }) => `
  <div class="lines">
    <section class="line line-1">
      <p class="line-badge">LINE 1</p>
      <p class="line-question">${line1.question}</p>
      ${routeWithRoles(line1.stops)}
    </section>

    <div class="line-transfer">
      <p class="line-transfer-badge">환승</p>
      <p class="line-transfer-title">${transfer.title}</p>
      <p class="line-transfer-note">${transfer.note}</p>
      <p class="line-transfer-warn">${transfer.warn}</p>
    </div>

    <section class="line line-2">
      <p class="line-badge line-badge-2">LINE 2</p>
      <p class="line-question">${line2.question}</p>
      ${routeWithRoles(line2.stops)}
    </section>
  </div>`;

/** 짧은 설명 항목 */
const bullets = items => `<ul class="bullet-list">${items.map(t => `<li>${t}</li>`).join('')}</ul>`;

/** 다음 화면으로 넘어갈 질문을 미리 걸어둔다 — 분할된 화면 사이의 연결 */
const nextHint = text => `<p class="next-hint"><span>다음 화면</span> ${text}</p>`;

/**
 * SubwayMap — 마지막 화면의 기억점.
 * 오늘 지나온 9개 개념을 실제 노선 모양으로 되돌려준다.
 */
const subwayMap = () => `
  <div class="subway" role="img" aria-label="오늘 지나온 개념 노선: ${CONCEPTS.map(c => c.label).join(' · ')}">
    <ol class="subway-line">
      ${CONCEPTS.map(c => `
        <li class="subway-stop">
          <span class="subway-dot" aria-hidden="true"></span>
          <span class="subway-name">${c.short}</span>
        </li>`).join('')}
    </ol>
  </div>`;

/* ------------------------------------------------------------
   34개 화면
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   도입 · 에필로그 helper
   강사 소개(L02)와 실제 분산원장 회수(L33)는 원본 PDF 에 없는 화면이다.
   ------------------------------------------------------------ */

/** 강사 카드 — 누가 이 이야기를 하는가 */
const presenterCard = ({ name, role, tags, points }) => `
  <div class="presenter">
    <div class="presenter-who">
      <p class="presenter-name">${name}</p>
      <p class="presenter-role">${role}</p>
      <ul class="presenter-tags">${tags.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>
    <ul class="presenter-points">
      ${points.map(pt => `<li><strong>${pt.title}</strong><span>${pt.desc}</span></li>`).join('')}
    </ul>
  </div>`;

/**
 * NetworkPreview — 실제로 돌아가는 분산원장 화면(repo.mrdion.kim).
 *
 * 실제 Dashboard 의 구성을 그대로 옮겨 그린다.
 *   상단 현황 5칸 · 최근 거래 표 · 체인 시각
 * 캡처 이미지 대신 화면으로 그리는 이유는 프로젝터에서 글자가 살아 있어야 하기 때문이다.
 * L02(강의 처음)와 L33(강의 끝)이 같은 화면을 써야 회수가 된다. 두 곳 모두 이 helper 를 쓴다.
 * 숫자를 바꾸려면 아래 NETWORK_SNAPSHOT 하나만 고치면 두 화면에 함께 반영된다.
 */
const NETWORK_SNAPSHOT = {
  url: 'repo.mrdion.kim',
  title: 'Phase 2 · Repo Settlement Dashboard',
  badge: 'PoC · 조회 전용',
  clock: '체인 시각 2026-09-23 22:59:32 KST',
  stats: [
    { k: '전체 거래',    v: '8' },
    { k: '운용 중',      v: '1', s: 'ACTIVE' },
    { k: '만기 처리 중', v: '0', s: 'MATURITY_PENDING' },
    { k: '종료',         v: '7', s: 'CLOSED' },
    { k: '조치 필요',    v: '0', s: 'OPEN attention' }
  ],
  deals: [
    { id: 'RP-REV-0001',  who: 'KSF → PD-A', cash: '100,000', back: '100,500', due: '2026-09-28', state: 'ACTIVE' },
    { id: 'RP-OCI-0007',  who: 'KSF → PD-A', cash: '100,000', back: '100,500', due: '2026-09-15', state: 'CLOSED' },
    { id: 'RP-OCI-0006',  who: 'KSF → PD-A', cash: '100,000', back: '100,500', due: '2026-09-15', state: 'CLOSED' }
  ]
};

const networkPreview = ({ tag, callouts = [], foot }) => `
  <figure class="np">
    ${tag ? `<figcaption class="np-tag">${tag}</figcaption>` : ''}
    <div class="np-shot" role="img" aria-label="${NETWORK_SNAPSHOT.title} 화면 — 거래 현황과 최근 거래 목록">
      <div class="np-bar">
        <span class="np-dots" aria-hidden="true"></span>
        <span class="np-url">${NETWORK_SNAPSHOT.url}</span>
      </div>
      <div class="np-page">
        <div class="np-head">
          <p class="np-title">${NETWORK_SNAPSHOT.title}</p>
          <p class="np-badge">${NETWORK_SNAPSHOT.badge}</p>
          <p class="np-clock">${NETWORK_SNAPSHOT.clock}</p>
        </div>
        <ul class="np-stats">
          ${NETWORK_SNAPSHOT.stats.map(c => `
            <li><span class="np-k">${c.k}</span><strong class="np-v">${c.v}</strong>${c.s ? `<em class="np-s">${c.s}</em>` : ''}</li>`).join('')}
        </ul>
        <table class="np-table">
          <thead>
            <tr><th>거래</th><th>Seller → Buyer</th><th>개시 현금</th><th>환매금액</th><th>만기</th><th>상태</th></tr>
          </thead>
          <tbody>
            ${NETWORK_SNAPSHOT.deals.map(d => `
              <tr>
                <td class="np-id">${d.id}</td>
                <td>${d.who}</td>
                <td class="np-num">${d.cash}</td>
                <td class="np-num">${d.back}</td>
                <td>${d.due}</td>
                <td><span class="np-state np-state-${d.state.toLowerCase()}">${d.state}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    ${callouts.length ? `<ul class="np-callouts">${callouts.map(c => `<li><strong>${c.name}</strong><span>${c.desc}</span></li>`).join('')}</ul>` : ''}
    ${foot ? `<p class="np-foot">${foot}</p>` : ''}
  </figure>`;

/** 오늘 쓴 체험도구를 작게 늘어놓는다 */
const toolThumbs = (tag, items) => `
  <div class="thumbs">
    <p class="thumbs-tag">${tag}</p>
    <ul class="thumb-list">
      ${items.map(i => `<li class="thumb"><span class="thumb-name">${i.name}</span><span class="thumb-desc">${i.desc}</span></li>`).join('')}
    </ul>
  </div>`;

/** 배운다 → 해본다 → 막힌다 → 다시 배운다. 끝나지 않고 돌아오는 고리 */
const cycleFlow = (steps, note) => `
  <div class="cycle">
    <ol class="cycle-list">
      ${steps.map((t, i) => `
        ${i > 0 ? '<li class="cycle-arrow" aria-hidden="true"></li>' : ''}
        <li class="cycle-step">${t}</li>`).join('')}
      <li class="cycle-back" aria-hidden="true">↺</li>
    </ol>
    ${note ? `<p class="cycle-note">${note}</p>` : ''}
  </div>`;

/**
 * BoundaryStack — 층을 쌓다가 오늘 강의의 경계에서 멈춘다.
 * EVM 화면(L29)은 EVM 을 설명하는 자리가 아니라 여기까지라고 말하는 자리다.
 */
const boundaryStack = ({ layers, edgeLabel, beyond }) => `
  <div class="boundary">
    ${stack(layers)}
    <p class="boundary-edge"><span>${edgeLabel}</span></p>
    <p class="boundary-beyond">${beyond}</p>
  </div>`;

const SCREENS = [
  /* ===== Section A. 도입 ===== */
  {
    id: 'lecture-title', number: 'L01', sourcePage: 1, section: 'A', type: 'title', concept: 'intro',
    eyebrow: 'BLOCKCHAIN LECTURE',
    title: '블록체인은 왜<br /><em class="accent-block">‘블록</em><em class="accent-chain">체인’</em>일까?',
    body: [
      chainDiagram([
        { name: 'GENESIS', hash: 'A72F…' },
        { name: 'PREV ✓',  hash: '93B1…' },
        { name: 'PREV ✓',  hash: 'E04C…' }
      ]),
      `<p class="s-title-sub">왜 Block 인가? &nbsp; 왜 Chain 인가? &nbsp; 왜 Distributed 인가?</p>`
    ].join('')
    /* 발표자 표기는 잠시 가려둔다. PDF v2.1 에서도 p1 에서 빠졌다.
       다시 띄우려면 아래 한 줄의 주석만 풀면 된다.
       (발표자 표기는 강의 내용이 아니므로 화면 맨 아래에 둔다)
    , note: '김동규 · 서강대학교 블록체인 과정 이전 기수 강의'
    */
  },
  {
    /* 신규 — 강사 포지셔닝. 원본 PDF 에는 없는 화면이다.
       L33(real-network)에서 같은 Dashboard 를 다시 꺼내 회수한다 */
    id: 'why-me', number: 'L02', section: 'A', type: 'concept', concept: 'intro',
    eyebrow: 'WHY ME',
    title: '제가 오늘 이 이야기를 드리는 이유',
    body: [
      presenterCard({
        name: '김동규',
        role: '한국증권금융 디지털혁신팀장',
        tags: ['AI', '디지털자산'],
        points: [
          { title: '금융 현업',           desc: '제도와 실무가 맞물리는 자리에서 일합니다' },
          { title: 'AI · 디지털자산 업무', desc: '새로 들어오는 기술을 업무에 붙여 봅니다' },
          { title: '분산원장 직접 구축',   desc: '문서로만 읽지 않고 직접 만들어 돌려 봤습니다' }
        ]
      }),
      networkPreview({
        tag: '직접 구축해 운영 중인 분산원장',
        foot: '“지금은 조금 복잡해 보이실 수 있습니다. 강의가 끝날 때쯤에는 이 화면에서 지금보다 훨씬 많은 것이 보이실 겁니다.”'
      }),
      sub('오늘의 역할 · 어려운 기술을 조금 먼저 걸어본 사람이 지도를 보여드리는 것'),
      conclusion('먼저 걸어본 사람이 보여드리는 지도')
    ].join('')
  },
  {
    id: 'simplify-first', number: 'L03', sourcePage: 2, section: 'A', type: 'concept', concept: 'intro',
    eyebrow: 'INTRO',
    title: '오늘은 조금 단순하게 설명하겠습니다',
    body: [
      /* 물 예시는 ‘단순화란 무엇인가’를 여는 질문이다. 한 줄로 흘리지 않고 자리를 준다 */
      simplifyExample('단순화의 예', '물은 100℃ 에서 끓는다', '“항상?”'),
      /* 같은 역을 두 번 그려 ‘무엇을 버렸는가’를 보이게 한다 */
      mapCompare(
        { tag: '실제 지도', title: '있는 그대로', note: '모든 것이 정확하다 · 그래서 복잡하다' },
        { tag: '지하철 노선도', title: '단순하게', note: '필요한 연결만 남긴다 · 그래도 목적지에는 도착한다' }
      ),
      conclusion('오늘의 목표는 위성사진이 아니라 ‘블록체인 지하철 노선도’를 만드는 것입니다.')
    ].join('')
  },

  /* ===== Section B. 장부에 대한 믿음 ===== */
  {
    id: 'ledger-trust', number: 'L04', sourcePage: 3, section: 'B', type: 'question', concept: 'intro',
    eyebrow: 'QUESTION',
    title: '장부에 대한 믿음은 어디에서 오는가?',
    kicker: '왜 은행 장부의 100만원은 믿을까?',
    body: [
      duo(
        { tag: '은행 장부', title: '잔액', lines: ['1,000,000 원'], tone: 'primary' },
        { tag: '내 노트',   title: '잔액', lines: ['2,000,000 원'], tone: 'warn' },
        '?',
        'ledger'
      ),
      key('왜 왼쪽은 믿고 오른쪽은 믿지 않을까?'),
      /* 이 화면의 결론이다. 작은 note 로 두지 않는다 */
      conclusion('중앙화된 장부 = 공식 장부를 관리하고 최종 판단하는 주체가 있다')
    ].join('')
  },
  {
    id: 'no-central-authority', number: 'L05', sourcePage: 4, section: 'B', type: 'concept', concept: 'intro',
    eyebrow: 'ROADMAP',
    title: '“이게 공식 장부입니다”라고 말할 수 있는 신뢰있는 존재가 없다면?',
    body: [
      lead('아래 다섯 가지 질문에 대한 답이 필요합니다'),
      numberedCards([
        { num: 1, question: '기록이 바뀌지는 않았는가?',                  answer: 'Hash' },
        { num: 2, question: '기록을 어떻게 묶을까?',                      answer: 'Block' },
        { num: 3, question: '과거와 현재를 어떻게 연결할까?',             answer: 'Chain' },
        { num: 4, question: '여러 참여자가 같은 장부를 어떻게 공유할까?', answer: 'Distributed Ledger' },
        { num: 5, question: '서로 다르면 무엇을 진짜라고 할까?',          answer: 'Consensus' }
      ], 'row'),
      /* 다섯 질문이 곧 오늘의 노선이라는 것을 노선 모양으로 보여준다 */
      routeWithRoles([
        { name: 'Hash',               role: '① 변경 확인' },
        { name: 'Block',              role: '② 묶기' },
        { name: 'Chain',              role: '③ 연결' },
        { name: 'Distributed Ledger', role: '④ 공유' },
        { name: 'Consensus',          role: '⑤ 인정' }
      ]),
      conclusion('한 사람이 공식 장부를 결정하지 못한다면, 이 다섯 가지 질문을 차례로 풀어야 한다.')
    ].join('')
  },

  /* ===== Section C. Hash → Block → Chain ===== */
  {
    id: 'hash-question', number: 'L06', sourcePage: 5, section: 'C', type: 'experience-entry', concept: 'hash',
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
    note: 'Hash는 암호화(숨기기)가 아니라 변경을 쉽게 확인하기 위한 도구',
    experience: { kind: 'hash', returnTo: 'block', label: 'Hash 직접 체험하기' }
  },
  {
    id: 'block', number: 'L07', sourcePage: 6, section: 'C', type: 'experience-entry', concept: 'block',
    eyebrow: 'BLOCK',
    title: '왜 Block 일까?',
    /* Hash 체험 직후 복귀 화면 */
    bridge: { tag: '방금 확인한 것', text: '데이터가 바뀌면 Hash도 달라집니다. 그렇다면 여러 기록은 어떤 단위로 다룰까요?' },
    body: [
      /* 카드 2개 비교가 아니라 거래가 Block 안으로 ‘들어가는’ 구조로 보여준다 */
      gather({
        looseTag: '흩어진 거래',
        items: ['A → B &nbsp; 10만원', 'C → D &nbsp; 5만원', 'E → F &nbsp; 20만원', 'G → H &nbsp; 3만원'],
        actionLabel: '묶기 →',
        blockName: 'BLOCK',
        blockHash: 'Hash: 8F3A…'
      }),
      conclusion('여러 기록을 일정한 단위로 묶는다')
    ].join(''),
    experience: { kind: 'block', returnTo: 'chain', label: 'Block 직접 체험하기' }
  },
  {
    id: 'chain', number: 'L08', sourcePage: 7, section: 'C', type: 'concept', concept: 'chain',
    eyebrow: 'CHAIN',
    title: '왜 Chain 일까?',
    /* Block 체험 직후 복귀 화면 */
    bridge: { tag: '방금 한 일', text: '여러 거래를 하나의 Block으로 묶었습니다. 이제 Block과 Block을 연결해 봅니다.' },
    body: [
      chainDiagram([
        { name: 'BLOCK 1', txs: ['A → B : 10만원', 'C → D : 5만원'], hash: 'A72F…' },
        { name: 'BLOCK 2', prev: 'A72F…', txs: ['E → F : 20만원'],   hash: '93B1…' },
        { name: 'BLOCK 3', prev: '93B1…', txs: ['G → H : 3만원'],    hash: 'E04C…' }
      ], { size: 'lg' }),
      conclusion('같은 값 → 앞뒤가 연결된다')
    ].join(''),
    note: '다음 Block이 이전 Block의 Hash를 기억한다'
  },
  {
    id: 'tamper', number: 'L09', sourcePage: 8, section: 'C', type: 'experience-entry', concept: 'chain',
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
      /* 거래 변경이 Hash 를 바꾸고, 그 Hash 가 다음 Block 과 어긋나는 순서를 드러낸다 */
      changeTrail([
        { text: '거래를 바꾼다',            value: '10만원 → 100만원',  tone: 'warn' },
        { text: 'Block 1 의 Hash 가 바뀐다', value: 'A72F… → C819…',    tone: 'warn' },
        { text: 'Block 2 의 Previous Hash 와 어긋난다', value: 'C819… ≠ A72F…', tone: 'bad' }
      ]),
      conclusion('바꿀 수 없는 것이 아니라, 바꾸면 연결이 깨진다')
    ].join(''),
    experience: { kind: 'chain', returnTo: 'centralized-chain', label: 'Chain 직접 체험하기' }
  },
  {
    id: 'centralized-chain', number: 'L10', sourcePage: 9, section: 'C', type: 'question', concept: 'ledger',
    eyebrow: 'TRANSITION',
    title: '그런데 여기까지만이라면?',
    /* Chain 체험 직후 복귀 화면 */
    bridge: { tag: '방금 확인한 것', text: '기록을 바꾸면 연결이 깨집니다. 하지만 이것만으로 분산원장이 되는 것은 아닙니다.' },
    body: [
      chainDiagram([
        { name: 'BLOCK 1', hash: 'A72F…' },
        { name: 'BLOCK 2', hash: '93B1…' },
        { name: 'BLOCK 3', hash: 'E04C…' }
      ], { frame: '은행 서버', size: 'lg' }),
      bigQuestion('“이것도 은행 서버에서<br />만들 수 있지 않을까?”')
    ].join(''),
    note: '다시 질문: 누가 이 장부를 가지고, 누가 공식 기록을 결정하는가?'
  },

  /* ===== Section D. Distributed Ledger → Consensus ===== */
  {
    id: 'distributed-vs-servers', number: 'L11', sourcePage: 10, section: 'D', type: 'concept', concept: 'ledger',
    eyebrow: 'DISTRIBUTED LEDGER',
    title: '서버가 여러 대면 분산원장일까?',
    body: [
      /* 평면 카드 비교 대신 두 조직 구조 자체를 나란히 보여준다 */
      orgCompare(
        treeOrg({
          tag: '분산된 서버',
          root: '은행',
          rootNote: '한 주체가 결정한다',
          children: [
            { name: '서울 서버', note: '같은 장부' },
            { name: '부산 서버', note: '같은 장부' },
            { name: '백업 서버', note: '같은 장부' }
          ],
          foot: '관리자 = 은행'
        }),
        meshOrg({
          tag: '분산원장',
          nodes: ['기관 A', '기관 B', '기관 C', '기관 D'],
          foot: '공통 규칙으로 보유·검증·인정'
        }),
        '≠'
      ),
      conclusion('서버가 어디에 있는가 &nbsp;≠&nbsp; 누가 장부를 결정하는가')
    ].join('')
  },
  {
    id: 'consensus-question', number: 'L12', sourcePage: 11, section: 'D', type: 'question', concept: 'consensus',
    eyebrow: 'CONSENSUS',
    title: '장부가 서로 다르면?',
    body: [
      duo(
        { tag: 'A의 장부', title: '철수 → 영희', lines: ['1만원'], tone: 'neutral' },
        { tag: 'B의 장부', title: '철수 → 영희', lines: ['2만원'], tone: 'warn' },
        '누가 맞을까?',
        'ledger'
      ),
      conclusion('Consensus')
    ].join(''),
    note: '한 참여자가 단독으로 정답을 선언하지 않는다면, 공통 규칙이 필요하다'
  },
  {
    id: 'consensus-methods', number: 'L13', sourcePage: 12, section: 'D', type: 'concept', concept: 'consensus',
    eyebrow: 'CONSENSUS',
    title: 'Consensus 에는 여러 방법이 있습니다',
    body: [
      /* 병렬 카드 3개가 아니라 Consensus 아래로 뻗는 상하 관계로 둔다 */
      branchTree({
        root: 'Consensus',
        branches: [
          { owner: 'Bitcoin',      name: 'Proof of Work',  flag: '오늘 체험할 것 →', accent: true },
          { owner: 'Ethereum',     name: 'Proof of Stake' },
          { owner: '그 밖의 방식', name: '…' }
        ]
      }),
      conclusion('오늘 체험할 것은 Bitcoin 의 Proof of Work 입니다'),
      /* PoW 체험(L14)으로 넘어가는 질문. ‘어려운 수학문제’라는 말에서 출발한다 */
      sub('비트코인 채굴을 설명할 때 “컴퓨터가 어려운 수학문제를 푼다”고 많이 이야기합니다.'),
      bigQuestion('대체 무슨 문제를 푼다는 걸까요?')
    ].join('')
  },

  /* ===== Section E. Proof of Work ===== */
  {
    id: 'pow-challenge', number: 'L14', sourcePage: 13, section: 'E', type: 'experience-entry', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '‘00’ 을 먼저 찾아라',
    body: [
      `<div class="target-line"><span class="target-badge">00</span><span class="target-desc">으로 시작하는 Hash</span></div>`,
      `<ul class="candidate-list"><li>Blockchain 1</li><li>Blockchain 2</li><li>Blockchain 3</li><li>…</li></ul>`,
      key('Hash 앞 두 자리가 00 인 숫자를 먼저 찾으세요.')
    ].join(''),
    note: '먼저 찾은 사람은 손을 들어 주세요 · “그 느낌을 직접 한번 확인해보겠습니다.”',
    experience: { kind: 'pow', returnTo: 'pow-interpret', label: 'PoW 직접 체험하기' }
  },
  {
    id: 'pow-interpret', number: 'L15', sourcePage: 14, section: 'E', type: 'concept', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '방금 ‘어려운 수학문제’를 풀었을까?',
    kicker: '채굴 = 어려운 수학문제를 푼다?',
    /* PoW 체험 직후 복귀 화면 — 방금 한 조작을 먼저 회수한다 */
    bridge: { tag: '방금 한 일', text: '조건을 만족할 때까지 같은 일을 반복했습니다.' },
    body: [
      /* 방금 체험에서 실제로 한 동작을 먼저 그대로 회수한다 */
      flow([
        { text: '숫자 변경' },
        { text: 'Hash 계산' },
        { text: '조건 확인' },
        { text: '실패하면 반복' }
      ]),
      duo(
        { tag: 'A', title: '초당 10회',        lines: ['1초에 시도하는 Hash 계산 횟수'], tone: 'neutral' },
        { tag: 'B', title: '초당 1,000,000회', lines: ['1초에 시도하는 Hash 계산 횟수'], tone: 'primary' },
        'vs'
      ),
      /* 속도 차이가 왜 결과 차이가 되는지를 같은 화면에서 잇는다 */
      converge({
        question: '누가 먼저 찾을 가능성이 높을까?',
        via: '더 많은 Hash 시도',
        result: '조건을 먼저 만족할 가능성이 높아진다'
      })
    ].join(''),
    note: '컴퓨팅 파워는 어려운 공식을 푸는 힘이 아니라, 같은 계산을 더 많이 반복하는 능력이다.'
  },
  {
    id: 'pow-repeat', number: 'L16', sourcePage: 14, section: 'E', type: 'concept', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '조건을 만족할 때까지 반복해서 시도한다',
    body: [
      /* 앞 화면(L14)의 속도 비교를 회수한 상태에서 반복 구조를 설명한다 */
      recall('앞 화면', 'A 초당 10회 &nbsp;·&nbsp; B 초당 1,000,000회 — 더 많이 반복할 수 있는 쪽이 조건을 먼저 만족한다'),
      loopFlow({
        steps: ['숫자 변경', 'Hash 계산'],
        decision: { text: '00인가?', desc: 'Hash 앞 두 자리가 00 으로 시작하는가' },
        noLabel: '아니오 · 숫자를 바꿔 다시',
        yes: '성공'
      }),
      conclusion('조건을 만족할 때까지 반복해서 시도한다')
    ].join(''),
    note: '실제 Bitcoin에서는 ‘00’의 개수가 아니라 Hash가 Target보다 작은지를 판단'
  },
  {
    id: 'pow-proposal', number: 'L17', sourcePage: 15, section: 'E', type: 'concept', concept: 'pow',
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
    id: 'pow-verification', number: 'L18', sourcePage: 16, section: 'E', type: 'concept', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '제안했다고 끝이 아니다',
    body: [
      /* 후보 Block → 다른 노드의 검사 → 결과 를 하나의 세로 인과로 잇는다 */
      causalFlow([
        {
          tag: '제안된 Block',
          tone: 'in',
          html: chainDiagram([
            { name: 'B가 제안한 BLOCK', prev: 'E04C…', hash: '00A7…', state: 'new' }
          ])
        },
        {
          tag: '다른 노드가 무엇을 보는가',
          tone: 'check',
          html: nodes([
            { name: 'A', state: '✓', tone: 'ok' },
            { name: 'C', state: '✓', tone: 'ok' },
            { name: 'D', state: '✓', tone: 'ok' }
          ]) + checkList([
            '거래가 규칙에 맞는가?',
            'Previous Hash가 맞는가?',
            'PoW 조건을 만족했는가?'
          ])
        },
        { tag: '결과', tone: 'out', html: conclusion('다른 노드가 공통 규칙으로 검증한다') }
      ]),
      nextHint('검증을 통과하면 무엇이 달라질까?')
    ].join('')
  },
  {
    id: 'pow-ledger-commit', number: 'L19', sourcePage: 16, section: 'E', type: 'concept', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '제안 &nbsp;≠&nbsp; 인정',
    body: [
      /* L17 의 후보 Block 과 검증 결과를 이어받는다 */
      recall('앞 화면', 'B가 제안한 Block <strong>00A7…</strong> → A · C · D 가 공통 규칙으로 검증 ✓'),
      /* 같은 Block 이 각자의 장부에 똑같이 들어간다는 것을 그림으로 보여준다 */
      ledgerCopies(['A', 'B', 'C', 'D'], 'Block 00A7…'),
      flow([
        { text: '제안' },
        { text: '검증', desc: '공통 규칙으로 검증 · A B C D' },
        { text: '장부 반영', desc: '각자의 장부에 동일한 Block 추가', tone: 'ok' }
      ]),
      conclusion('먼저 찾았다고 마음대로 장부를 쓸 수 없다')
    ].join('')
  },

  /* ===== Section F. 첫 번째 노선 회수 · 환승 ===== */
  {
    id: 'ledger-line-recap', number: 'L20', sourcePage: 17, section: 'F', type: 'summary',
    concept: ['hash', 'block', 'chain', 'ledger', 'consensus', 'pow'],
    eyebrow: 'SUMMARY',
    title: '장부에 대한 믿음은 어디에서 올까?',
    body: [
      duo(
        { tag: '중앙화된 장부', title: '관리주체가 공식 장부를 결정', lines: [], tone: 'neutral' },
        { tag: '분산원장',     title: '공통 규칙에 따라 보유·검증·합의', lines: [], tone: 'primary' },
        '↔'
      ),
      /* 여섯 개념을 독립 카드가 아니라 하나의 노선으로 잇고 역할을 함께 둔다 */
      routeWithRoles([
        { name: 'Hash',               role: '변경 확인' },
        { name: 'Block',              role: '기록 묶음' },
        { name: 'Chain',              role: '앞뒤 연결' },
        { name: 'Distributed Ledger', role: '여러 참여자의 장부' },
        { name: 'Consensus',          role: '무엇을 인정할 것인가' },
        { name: 'PoW',                role: 'Bitcoin의 합의 메커니즘' }
      ]),
      conclusion('여섯 가지는 따로 있는 개념이 아니라, 한 장부를 믿을 수 있게 만들기 위해 차례로 이어진 하나의 노선이다.')
    ].join('')
  },
  {
    /* PDF p18 — Bitcoin 중심의 ‘공유된 장부’에서 ‘공유된 State’로 시야를 넓히는 환승 */
    id: 'ethereum-transition', number: 'L21', sourcePage: 18, section: 'F', type: 'concept', line: 'transfer',
    eyebrow: 'TRANSFER',
    title: '기록만 적어야 할까?',
    body: [
      key('“이 장부에는 기록만 적어야 할까?”'),
      duo(
        { tag: '지금까지의 장부', title: 'A → B : 1만원', lines: [], tone: 'neutral' },
        {
          tag: '“기록 말고 규칙도 넣을 수 있다면?”',
          html: ruleBlock({
            ifLines: ['결제금액 ≥ 1,000원', '재고 > 0'],
            thenLines: ['재고 -1', '판매량 +1']
          }),
          tone: 'primary'
        },
        '→'
      ),
      transferMark('LINE 1 · 공유된 장부 (Shared Ledger)', 'LINE 2 · 공유된 State (Shared State)'),
      conclusion('블록체인은 기록을 저장하는 것보다 더 많은 일을 할 수도 있다')
    ].join('')
  },

  /* ===== Section G. Ethereum · World Computer ===== */
  {
    /* PDF p19 */
    id: 'state-model', number: 'L22', sourcePage: 19, section: 'G', type: 'concept', line: 2, concept: 'state',
    eyebrow: 'STATE',
    title: '컴퓨터가 하는 일을 아주 단순하게 보면',
    body: [
      stateFlow({
        current: {
          tag: 'CURRENT STATE',
          rows: [{ k: '가격', v: '1,000원' }, { k: '남은 티켓', v: '2장' }, { k: '판매량', v: '0장' }]
        },
        input: 'buy(1000)',
        program: ['금액 ≥ 가격 ?', '남은 티켓 > 0 ?'],
        next: {
          tag: 'NEW STATE',
          tone: 'ok',
          rows: [{ k: '가격', v: '1,000원' }, { k: '남은 티켓', v: '1장' }, { k: '판매량', v: '1장' }]
        }
      }),
      conclusion('현재 State + Input &nbsp;→&nbsp; Program &nbsp;→&nbsp; 새로운 State')
    ].join(''),
    note: 'State = 지금 시스템이 기억하고 있는 현재 상태'
  },
  {
    /* PDF p20 — Ethereum 파트의 메인 체험. 설명하기 전에 먼저 실행한다 */
    id: 'state-experience', number: 'L23', sourcePage: 20, section: 'G', type: 'experience-entry', line: 2, concept: 'program',
    eyebrow: 'EXPERIENCE',
    title: '실습 ③ &nbsp;디지털 티켓 판매기',
    body: [
      ipsPanels({
        input: `
          <p class="ips-choice">결제금액 선택 &nbsp;<strong>500원</strong> / <strong>1,000원</strong></p>
          <p class="ips-call">buy(1000)</p>`,
        program: ruleBlock({
          ifLines: ['결제금액 ≥ 가격 ?', '남은 티켓 > 0 ?'],
          thenLines: ['남은 티켓 -1', '판매량 +1', '티켓 발급']
        }),
        state: stateBox({
          tag: '',
          rows: [{ k: '가격', v: '1,000원' }, { k: '남은 티켓', v: '2장' }, { k: '판매량', v: '0장' }]
        })
      }),
      runOrder('직접 할 순서', ['buy(500)', 'buy(1000)', 'buy(1000)', 'buy(1000)'])
    ].join(''),
    note: '“지금 본 State + Input → Program → New State 구조를 실제로 한번 실행해보겠습니다.”',
    experience: { module: 'world-computer', returnTo: 'state-interpret', label: '디지털 티켓 판매기 직접 실행해보기' }
  },
  {
    /* PDF p21 — 체험 직후 복귀 화면. 단순 Before/After 가 아니라 실행 과정을 해석한다 */
    id: 'state-interpret', number: 'L24', sourcePage: 21, section: 'G', type: 'concept', line: 2, concept: 'transition',
    eyebrow: 'STATE TRANSITION',
    title: '방금 무엇이 실행되었을까?',
    bridge: {
      tag: '방금 한 일',
      text: '단순히 기록 한 줄만 추가한 것이 아니라, 프로그램을 실행했고 그 결과 State가 바뀌었습니다.'
    },
    body: [
      causalFlow([
        { tag: 'INPUT', tone: 'in', html: `<p class="ips-call">buy(1000)</p>` },
        { tag: 'PROGRAM', tone: 'check', html: checkList(['가격 조건 확인', '재고 조건 확인'], { done: true }) },
        {
          tag: 'STATE TRANSITION',
          tone: 'out',
          html: `<p class="transition-line">남은 티켓 <strong>2 → 1</strong><br />판매량 <strong>0 → 1</strong></p>`
        }
      ], { row: true }),
      runTable('4번의 실행 결과', [
        { call: 'buy(500)',  why: '금액 부족',   result: 'State 변화 없음',        ok: false },
        { call: 'buy(1000)', why: '조건 만족',   result: '재고 2→1 · 판매량 0→1', ok: true },
        { call: 'buy(1000)', why: '조건 만족',   result: '재고 1→0 · 판매량 1→2', ok: true },
        { call: 'buy(1000)', why: '재고 없음',   result: 'State 변화 없음',        ok: false }
      ]),
      conclusion('Program이 현재 State를 읽고, 실행 결과에 따라 State를 바꾼다')
    ].join(''),
    note: '같은 buy(1000)인데 결과가 다르다 → 현재 State가 다르기 때문'
  },
  {
    /* PDF p22 — Consensus 가 State 값을 직접 투표로 정하는 것처럼 보이지 않게 한다 */
    id: 'multi-node-execution', number: 'L25', sourcePage: 22, section: 'G', type: 'concept', line: 2, concept: 'verify',
    eyebrow: 'NODES',
    title: '한 컴퓨터에서 여러 노드로',
    body: [
      causalFlow([
        {
          tag: '① Consensus',
          tone: 'in',
          html: `<p class="node-note">어떤 Block 을 이어갈지 합의<br />합의된 Block 안에는 실행할 Transaction 과 그 순서가 들어 있다</p>`
        },
        {
          tag: '② Transaction 순서',
          tone: 'in',
          html: `<ol class="txlist"><li>buy(1000)</li><li>…</li><li>…</li></ol>
                 <p class="node-note">실행 노드는 Block 에 정해진 순서대로 실행</p>`
        },
        {
          tag: '③ EVM 실행·검증',
          tone: 'check',
          html: nodes([
            { name: 'A', state: '✓', tone: 'ok' },
            { name: 'B', state: '✓', tone: 'ok' },
            { name: 'C', state: '✓', tone: 'ok' },
            { name: 'D', state: '✓', tone: 'ok' }
          ]) + `<p class="transition-line">남은 티켓 / 판매량<br /><strong>2 / 0 → 1 / 1</strong></p>
                <p class="node-note">같은 EVM 규칙으로 실행하고 State Transition 을 검증</p>`
        },
        {
          tag: '④ Ethereum State',
          tone: 'out',
          html: stateBox({ tag: 'SHARED STATE', tone: 'ok', rows: [{ k: '남은 티켓', v: '1' }, { k: '판매량', v: '1' }] })
                + `<p class="node-note">같은 유효한 Chain 을 따르는 노드는 같은 State 를 이어간다</p>`
        }
      ], { row: true }),
      conclusion('합의된 Block·Tx 순서 + 공통 EVM 규칙 &nbsp;→&nbsp; 같은 State Transition &nbsp;→&nbsp; 같은 Ethereum State')
    ].join('')
  },
  {
    /* PDF p23 — World Computer 를 먼저 정의하지 않고 체험 결과에서 회수한다 */
    id: 'world-computer', number: 'L26', sourcePage: 23, section: 'G', type: 'concept', line: 2, concept: 'world',
    eyebrow: 'WORLD COMPUTER',
    title: '그래서 World Computer',
    body: [
      flow([
        { text: 'Program' },
        { text: 'Transaction / Input' },
        { text: 'Execution' },
        { text: 'State → New State' },
        { text: 'Many Nodes Verify', tone: 'ok' }
      ]),
      `<p class="brandline"><span>Ethereum</span><strong>World Computer</strong></p>`,
      conclusion('프로그램과 상태를 여러 참여자가 공통된 규칙으로 검증하며 공유할 수 있는 ‘프로그래밍 가능한 분산 상태 시스템’'),
      sub('“전 세계 컴퓨터가 하나의 거대한 CPU처럼 병렬 계산한다”는 뜻은 아니다')
    ].join('')
  },
  {
    /* PDF p25 — 새 개념을 정의하는 것이 아니라 방금 실행한 그 프로그램에 이름을 붙인다 */
    id: 'smart-contract-name', number: 'L27', sourcePage: 25, section: 'G', type: 'concept', line: 2, concept: 'contract',
    eyebrow: 'SMART CONTRACT',
    title: '방금 본 것이 Smart Contract 입니다',
    body: [
      ruleBlock({
        tag: '체험에서 실행한 프로그램',
        ifLines: ['결제금액 ≥ 가격', '남은 티켓 > 0'],
        thenLines: ['남은 티켓 -1', '판매량 +1']
      }),
      /* 설명을 더하는 것이 아니라 이름을 붙이는 과정을 그대로 보여준다 */
      flow([
        { text: '아까 실행했던 티켓 판매 프로그램' },
        { text: '이 프로그램에 이름을 붙이면' },
        { text: 'Smart Contract', tone: 'ok' }
      ]),
      conclusion('Smart Contract = Ethereum 위에서 실행되는 프로그램')
    ].join(''),
    note: '새로운 개념을 하나 더 배우는 것이 아니라, 아까부터 직접 실행해본 이 프로그램에 이름을 붙이는 것'
  },
  {
    /* PDF p26 — 학생이 본 티켓 구매 화면에서 출발한다 */
    id: 'dapp-reveal', number: 'L28', sourcePage: 26, section: 'G', type: 'concept', line: 2, concept: 'dapp',
    eyebrow: 'DAPP',
    title: '그렇다면 DApp 은?',
    body: [
      duo(
        {
          tag: '학생이 본 화면',
          html: `
            <div class="mockapp">
              <p class="mockapp-title">디지털 티켓 판매기</p>
              <p class="mockapp-field">구매금액 입력 <strong>1000</strong></p>
              <p class="mockapp-button">BUY</p>
              <p class="mockapp-state">남은 티켓 2장</p>
            </div>`,
          tone: 'neutral'
        },
        {
          tag: '그 뒤의 구조',
          html: `<div class="stack-sm">${stack([
            { title: '사용자', desc: '화면을 보고 값을 입력한다', tone: 'primary' },
            { title: 'DApp', desc: '입력창 · 버튼 · 결과 표시' },
            { title: 'Smart Contract', desc: '실행할 Program' },
            { title: 'Ethereum', desc: 'Program 이 실행되고 State 가 바뀌는 곳' }
          ])}</div>`,
          tone: 'primary'
        },
        '↓'
      ),
      bullets([
        'DApp = 사용자가 Smart Contract 등 블록체인 기능과 상호작용하도록 만든 애플리케이션',
        '모든 로직이 Smart Contract 안에만 있어야 하는 것은 아님'
      ]),
      conclusion('내가 누른 화면은 DApp이고, 뒤에서 Smart Contract가 실행될 수 있다')
    ].join('')
  },
  {
    /* PDF p24 자리 — 그러나 EVM 을 설명하는 화면이 아니라 오늘 강의의 경계선을 긋는 화면이다.
       Opcode / Stack / PUSH·ADD 예시는 강의 범위 밖이라 전부 뺐다 */
    id: 'evm-boundary', number: 'L29', sourcePage: 24, section: 'G', type: 'concept', line: 2, concept: 'evm',
    eyebrow: 'EVM · ETHEREUM VIRTUAL MACHINE',
    title: '여기서 지도를 조금 더 확대하면…',
    body: [
      /* 강의 처음의 ‘노선도를 만들겠습니다’를 여기서 회수한다 */
      recall('강의 처음', '“오늘은 실제 지도가 아니라 지하철 노선도를 만들겠습니다.”'),
      boundaryStack({
        layers: [
          { title: 'DApp',           desc: '사용자가 보는 화면' },
          { title: 'Smart Contract', desc: '실행되는 Program' },
          { title: 'EVM',            desc: 'Ethereum Virtual Machine · Program 이 실행되는 환경', tone: 'primary' }
        ],
        edgeLabel: '오늘 강의의 경계',
        beyond: 'Ethereum 의 더 안쪽 구조'
      }),
      conclusion('오늘은 여기까지만 보겠습니다.'),
      sub('여기부터는 ‘노선도’보다 역 내부 구조에 가까운 이야기입니다.')
    ].join('')
  },

  /* ===== Section H. 두 개의 노선도 ===== */
  {
    /* PDF p27 — 하나의 직선으로 보이면 안 된다. 두 Line 과 환승역 */
    id: 'two-lines-map', number: 'L30', sourcePage: 27, section: 'H', type: 'summary', line: 'both',
    eyebrow: 'TWO LINES',
    title: '오늘 만든 두 개의 블록체인 노선도',
    body: [
      twoLines({
        line1: {
          question: '여러 참여자가 어떻게 믿을 수 있는 장부를 만들고 이어갈까?',
          stops: [
            { name: 'Hash',               role: '기록의 변경 확인' },
            { name: 'Block',              role: '기록 묶기' },
            { name: 'Chain',              role: '앞뒤 기록 연결' },
            { name: 'Distributed Ledger', role: '여러 참여자가 보유·검증' },
            { name: 'Consensus',          role: '무엇을 인정할 것인가' },
            { name: 'PoW',                role: 'Bitcoin 예시 · Consensus 메커니즘의 하나' }
          ]
        },
        transfer: {
          title: '공유된 장부 → 공유된 State',
          note: '“기록을 공유하는 것에서, 현재 State 와 Program Execution 까지 시야를 넓혀보면?”',
          warn: '새 기술 세대로 ‘넘어가는’ 것이 아니다. Ethereum도 Block·Chain·Consensus를 쓴다.'
        },
        line2: {
          question: '그 공유된 시스템에서 Program까지 실행할 수 있다면? &nbsp;·&nbsp; Ethereum · World Computer',
          /* 오늘 강의에서 실제로 걸어온 순서 그대로 적는다.
             EVM 은 이 노선의 핵심 역이 아니라 마지막에 잠깐 들여다본 심화영역 입구다 */
          /* 역이 8개다. 역할 설명은 한 줄로 읽히도록 짧게 쓴다 */
          stops: [
            { name: 'State',            role: '지금 기억하는 상태' },
            { name: 'Input',            role: '실행을 요청하는 Input' },
            { name: 'Program',          role: '실행되는 규칙' },
            { name: 'State Transition', role: 'State 가 바뀌는 과정' },
            { name: '여러 Node',         role: '같은 규칙으로 검증' },
            { name: 'World Computer',   role: '공유되는 상태 시스템' },
            { name: 'Smart Contract',   role: 'Program 의 이름' },
            { name: 'DApp',             role: '사용자 화면' }
          ]
        }
      })
    ].join(''),
    note: '하나의 직선이 아니라, 서로 다른 질문에 답하는 두 개의 연결된 노선 · EVM 은 방금 잠깐 들여다본 심화영역 입구'
  },
  {
    /* PDF p28 */
    id: 'blockchain-close', number: 'L31', sourcePage: 28, section: 'H', type: 'summary', line: 'both',
    eyebrow: 'CLOSING',
    title: '오늘 만든 것은 블록체인의 ‘지하철 노선도’입니다',
    body: [
      lead('중요한 것은 기술의 순서를 외우는 것이 아니라, 각각이 어떤 질문에 답하기 위해 등장했는지를 이해하는 것입니다.'),
      closingMessage(
        ['Bitcoin', 'Ethereum', 'Stablecoin', 'NFT', 'STO', 'RWA', 'DeFi', 'CBDC', 'Web3', '…'],
        '“이건 어느 노선의 어떤 질문에 답하는 이야기일까?”'
      ),
      /* 여기서 블록체인 강의는 한 번 완전히 끝난다. 다음 화면부터는 에필로그다 */
      conclusion('여기까지가 오늘 준비한 블록체인 이야기입니다.')
    ].join('')
  },

  /* ===== Section I. 에필로그 — 배우고, 해보고, 다시 배우기 ===== */
  {
    /* 신규 — 블록체인 강의는 앞 화면에서 한 번 끝났다. 여기서부터는 에필로그다 */
    id: 'learning-to-building', number: 'L32', section: 'I', type: 'concept', line: 'epilogue',
    eyebrow: 'FROM LEARNING TO BUILDING',
    title: 'From Learning to Building',
    kicker: '배우는 것과 해보는 것 사이',
    body: [
      toolThumbs('오늘 사용한 체험도구', [
        { name: 'Hash',  desc: '지문 계산' },
        { name: 'Block', desc: '기록 묶기' },
        { name: 'Chain', desc: '앞뒤 연결' },
        { name: 'PoW',   desc: '00 찾기' },
        { name: 'State', desc: '티켓 판매기' }
      ]),
      cycleFlow(['배운다', '해본다', '막힌다', '다시 배운다'], '막히는 지점이 다음에 무엇을 배워야 하는지 알려준다'),
      conclusion('오늘 사용한 체험도구도 AI와 함께 만들었습니다'),
      sub('AI는 공부를 끝낸 다음 사용하는 도구라기보다, 공부와 실행을 빠르게 왕복할 수 있게 해주는 도구다.')
    ].join('')
  },
  {
    /* 신규 — L02 에서 보여준 그 화면을 강의 끝에서 다시 본다.
       강사용 [실제 Network 보기] 는 Presenter 쪽에서 붙인다. 화면에는 강사용 control 을 두지 않는다 */
    id: 'real-network', number: 'L33', section: 'I', type: 'question', line: 'epilogue',
    eyebrow: 'REAL NETWORK',
    title: '처음보다 뭐가 좀 보이시나요?',
    bridge: { tag: '처음 화면', text: '강의를 시작할 때 보여드린 그 분산원장 화면입니다.' },
    body: [
      networkPreview({
        tag: '실제로 돌아가고 있는 분산원장',
        /* 화면에 실제로 보이는 자리에만 이름을 붙인다.
           오늘 만든 두 노선의 단어가 그대로 하나씩 대응된다 */
        callouts: [
          { name: 'Node · 참여자',      desc: 'KSF → PD-A · 같은 장부를 함께 보는 쪽' },
          { name: 'Chain · 체인 시각',  desc: '기록이 여기까지 이어져 있다' },
          { name: 'Transaction · 거래', desc: 'RP-… 실행을 요청한 Input' },
          { name: 'State · 상태',       desc: 'ACTIVE / CLOSED · 실행 결과로 바뀐 상태' }
        ]
      }),
      conclusion('같은 화면인데, 이제 각각이 어떤 질문에 답하는 것인지 보입니다')
    ].join(''),
    /* Network Demo 연결 지점. 화면에는 버튼을 노출하지 않는다.
       Presenter 가 OPEN_NETWORK 를 보내면 url 로 나가고, RETURN_FROM_DEMO 면 returnTo 로 돌아온다.
       실제 Dashboard 주소가 정해지면 url 만 채우면 된다. */
    demo: { name: 'network', url: 'https://repo.mrdion.kim', returnTo: 'closing' }
  },
  {
    /* 신규 — 마지막 메시지. 요소를 더 넣지 않는다 */
    id: 'closing', number: 'L34', section: 'I', type: 'title', line: 'epilogue',
    eyebrow: 'LAST MESSAGE',
    title: '완벽히 이해할 때까지<br />기다리지는 마세요.',
    body: [
      lead('배우고, 해보고, 다시 배우면 됩니다.'),
      conclusion('지금은 그 과정을 AI와 함께할 수 있습니다.')
    ].join(''),
    closing: true
  }
];
