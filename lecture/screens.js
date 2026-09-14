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
function causalFlow(stages) {
  return `
    <ol class="causal">
      ${stages.map((stage, i) => `
        ${i > 0 ? '<li class="causal-arrow" aria-hidden="true">↓</li>' : ''}
        <li class="causal-stage tone-${stage.tone || 'in'}">
          ${stage.tag ? `<p class="causal-tag">${stage.tag}</p>` : ''}
          ${stage.html}
        </li>`).join('')}
    </ol>`;
}

/** 검증 항목 — 체크박스 형태로 ‘검사한다’는 동작을 보이게 한다 */
const checkList = items => `
  <ul class="check-list">
    ${items.map(t => `<li><span class="check-box" aria-hidden="true"></span>${t}</li>`).join('')}
  </ul>`;

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
const treeOrg = ({ tag, root, children, foot }) => `
  <div class="org org-tree">
    ${tag ? `<p class="org-tag">${tag}</p>` : ''}
    <p class="tree-root">${root}</p>
    <ul class="tree-leaves" style="--n:${children.length}">
      ${children.map(c => `<li>${c}</li>`).join('')}
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

/** 다음 화면으로 넘어갈 질문을 미리 걸어둔다 — 분할된 화면 사이의 연결 */
const nextHint = text => `<p class="next-hint"><span>다음 화면</span> ${text}</p>`;

/** 본 도식을 보조하는 작은 흐름 */
const miniFlow = (tag, steps) => `
  <div class="mini-wrap">
    <p class="mini-tag">${tag}</p>
    ${flow(steps)}
  </div>`;

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
      /* 물 예시는 ‘단순화란 무엇인가’를 여는 짧은 예시다. 주 도식보다 앞서지 않게 둔다 */
      recall('단순화의 예', '물은 100℃ 에서 끓는다 &nbsp; <span class="quote-strong">“항상?”</span>'),
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
    body: [
      /* 공식 장부를 선언할 주체가 없는 상태를 먼저 보여준다 */
      sharedNodes({
        items: ['은행 A', '은행 B', '은행 C', '은행 D'],
        chip: '?',
        label: '누구도 “이게 공식 장부입니다”라고 혼자 말할 수 없다',
        tone: 'ask'
      }),
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
    experience: { kind: 'block', returnTo: 'L07', label: 'Block 직접 체험하기' }
  },
  {
    id: 'L07', sourcePage: 7, section: 'C', type: 'concept', concept: 'chain',
    eyebrow: 'CHAIN',
    title: '왜 Chain 일까?',
    /* Block 체험 직후 복귀 화면 */
    bridge: { tag: '방금 한 일', text: '여러 거래를 하나의 Block으로 묶었습니다. 이제 Block과 Block을 연결해 봅니다.' },
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
      /* 거래 변경이 Hash 를 바꾸고, 그 Hash 가 다음 Block 과 어긋나는 순서를 드러낸다 */
      changeTrail([
        { text: '거래를 바꾼다',            value: '10만원 → 100만원',  tone: 'warn' },
        { text: 'Block 1 의 Hash 가 바뀐다', value: 'A72F… → C819…',    tone: 'warn' },
        { text: 'Block 2 의 Previous Hash 와 어긋난다', value: 'C819… ≠ A72F…', tone: 'bad' }
      ]),
      conclusion('바꿀 수 없는 것이 아니라, 바꾸면 연결이 깨진다')
    ].join(''),
    experience: { kind: 'chain', returnTo: 'L09', label: 'Chain 직접 체험하기' }
  },
  {
    id: 'L09', sourcePage: 9, section: 'C', type: 'question', concept: 'ledger',
    eyebrow: 'TRANSITION',
    title: '그런데 여기까지만이라면?',
    /* Chain 체험 직후 복귀 화면 */
    bridge: { tag: '방금 확인한 것', text: '기록을 바꾸면 연결이 깨집니다. 하지만 이것만으로 분산원장이 되는 것은 아닙니다.' },
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
      /* 평면 카드 비교 대신 두 조직 구조 자체를 나란히 보여준다 */
      orgCompare(
        treeOrg({
          tag: '분산된 서버',
          root: '은행',
          children: ['서울 서버', '부산 서버', '백업 서버'],
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
      /* 병렬 카드 3개가 아니라 Consensus 아래로 뻗는 상하 관계로 둔다 */
      branchTree({
        root: 'Consensus',
        branches: [
          { owner: 'Bitcoin',      name: 'Proof of Work',  flag: '오늘 체험할 것 →', accent: true },
          { owner: 'Ethereum',     name: 'Proof of Stake' },
          { owner: '그 밖의 방식', name: '…' }
        ]
      }),
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
    id: 'L14', sourcePage: 14, section: 'E', type: 'concept', concept: 'pow',
    eyebrow: 'PROOF OF WORK',
    title: '방금 ‘어려운 수학문제’를 풀었을까?',
    kicker: '채굴 = 어려운 수학문제를 푼다?',
    /* PoW 체험 직후 복귀 화면 — 방금 한 조작을 먼저 회수한다 */
    bridge: { tag: '방금 한 일', text: '숫자 변경 → Hash 계산 → 조건 확인을 반복했습니다.' },
    body: [
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
      }),
      miniFlow('두 사람이 반복하고 있는 한 번의 시도', [
        { text: '숫자 변경' },
        { text: 'Hash 계산' },
        { text: '조건 확인' },
        { text: '다시 시도' }
      ])
    ].join(''),
    note: '컴퓨팅 파워는 어려운 공식을 푸는 힘이 아니라, 같은 계산을 더 많이 반복하는 능력이다.'
  },
  {
    id: 'L15', sourcePage: 14, section: 'E', type: 'concept', concept: 'pow',
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
    id: 'L18', sourcePage: 16, section: 'E', type: 'concept', concept: 'pow',
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
      /* 여섯 개념을 독립 카드가 아니라 하나의 노선으로 잇고 역할을 함께 둔다 */
      routeWithRoles([
        { name: 'Hash',               role: '변경 확인' },
        { name: 'Block',              role: '기록 묶음' },
        { name: 'Chain',              role: '앞뒤 연결' },
        { name: 'Distributed Ledger', role: '여러 참여자의 장부' },
        { name: 'Consensus',          role: '무엇을 인정할 것인가' },
        { name: 'PoW',                role: 'Bitcoin의 합의 메커니즘' }
      ]),
      conclusion('여섯 가지는 따로 있는 개념이 아니라, 한 장부를 믿을 수 있게 만들기 위해 차례로 이어진 하나의 노선이다.'),
      nextHint('“이 장부에는 송금 기록만 적어야 할까?”')
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
      /* 노드 사이를 실제 선으로 잇고 각 노드 안에 같은 IF 를 둬 ‘공유’를 보이게 한다 */
      sharedNodes({
        items: ['Node 1', 'Node 2', 'Node 3', 'Node 4'],
        chip: 'IF',
        label: '동일한 프로그램 + 동일한 상태'
      }),
      conclusion('여러 노드가 동일한 프로그램과 상태를 공유 → World Computer')
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
      /* 마지막 기억점 — 오늘 지나온 9개 역을 실제 노선 모양으로 되돌려준다 */
      subwayMap(),
      tagCloud(['Bitcoin', 'Ethereum', 'Stablecoin', 'NFT', 'STO', 'RWA', 'DeFi', 'CBDC', 'Web3', '…']),
      conclusion('오늘 만든 노선도의 어디에 있는 이야기인지 먼저 생각해 보세요')
    ].join(''),
    closing: true
  }
];
