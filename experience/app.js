const encoder = new TextEncoder();

function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(text) {
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(text));
    return bytesToHex(new Uint8Array(digest));
  }
  return sha256Fallback(text);
}

function sha256Fallback(ascii) {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = "length";
  let i, j;
  let result = "";
  const words = [];
  const asciiBitLength = unescape(encodeURIComponent(ascii))[lengthProperty] * 8;
  const baseHash = sha256Fallback.h = sha256Fallback.h || [];
  const k = sha256Fallback.k = sha256Fallback.k || [];
  let primeCounter = k[lengthProperty];
  const isComposite = {};
  const asciiBytes = unescape(encodeURIComponent(ascii));

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      baseHash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  const hash = baseHash.slice(0);
  let message = asciiBytes + "\x80";
  while (message[lengthProperty] % 64 - 56) message += "\x00";
  for (i = 0; i < message[lengthProperty]; i++) {
    j = message.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash.slice(0);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + ((e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7))
        + ((e & hash[5]) ^ (~e & hash[6]))
        + k[i]
        + (w[i] = i < 16 ? w[i] : (
          w[i - 16]
          + ((w15 >>> 7 | w15 << 25) ^ (w15 >>> 18 | w15 << 14) ^ (w15 >>> 3))
          + w[i - 7]
          + ((w2 >>> 17 | w2 << 15) ^ (w2 >>> 19 | w2 << 13) ^ (w2 >>> 10))
        ) | 0);
      const temp2 = ((a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash.unshift((temp1 + temp2) | 0);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = hash[i] >> (j * 8) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

const BLOCK_DEFAULTS = Object.freeze({
  transactions: [
    { from: "철수", to: "영희", amount: 10000 },
    { from: "영희", to: "민수", amount: 3000 },
    { from: "민수", to: "철수", amount: 5000 }
  ],
  previousHash: "0".repeat(64),
  nonce: 0
});

const CHAIN_TRANSACTIONS = Object.freeze([
  BLOCK_DEFAULTS.transactions,
  [
    { from: "영희", to: "지수", amount: 7000 },
    { from: "준호", to: "민수", amount: 12000 },
    { from: "철수", to: "준호", amount: 2500 }
  ],
  [
    { from: "지수", to: "철수", amount: 4000 },
    { from: "민수", to: "영희", amount: 6500 },
    { from: "준호", to: "지수", amount: 8000 }
  ]
]);

const POW_TRANSACTIONS = Object.freeze([
  { from: "철수", to: "지수", amount: 9000 },
  { from: "영희", to: "준호", amount: 4500 },
  { from: "민수", to: "철수", amount: 3000 }
]);

function serializeBlock({ transactions, previousHash, nonce }) {
  return JSON.stringify({ transactions, previousHash, nonce });
}

async function calculateBlockHash(block) {
  return sha256(serializeBlock(block));
}

const els = {
  heroEyebrow: document.querySelector("#heroEyebrow"),
  heroTitle: document.querySelector("#heroTitle"),
  heroCopy: document.querySelector("#heroCopy"),
  hashExperience: document.querySelector("#hashExperience"),
  blockExperience: document.querySelector("#blockExperience"),
  chainExperience: document.querySelector("#chainExperience"),
  powExperience: document.querySelector("#powExperience"),
  compareToggle: document.querySelector("#compareToggle"),
  singleMode: document.querySelector("#singleMode"),
  compareMode: document.querySelector("#compareMode"),
  inputA: document.querySelector("#inputA"),
  hashA: document.querySelector("#hashA"),
  changeOneChar: document.querySelector("#changeOneChar"),
  inputCompareA: document.querySelector("#inputCompareA"),
  inputCompareB: document.querySelector("#inputCompareB"),
  hashCompareA: document.querySelector("#hashCompareA"),
  hashCompareB: document.querySelector("#hashCompareB"),
  comparisonSummary: document.querySelector(".comparison-summary"),
  differenceTitle: document.querySelector("#differenceTitle"),
  differenceText: document.querySelector("#differenceText"),
  amountInputs: ["#amount1", "#amount2", "#amount3"].map(id => document.querySelector(id)),
  previousHash: document.querySelector("#previousHash"),
  blockNonce: document.querySelector("#blockNonce"),
  blockHash: document.querySelector("#blockHash"),
  blockCard: document.querySelector("#blockCard"),
  blockChangeBadge: document.querySelector("#blockChangeBadge"),
  blockInsight: document.querySelector("#blockInsight"),
  changeAmount: document.querySelector("#changeAmount"),
  resetBlock: document.querySelector("#resetBlock"),
  chainAmount1: document.querySelector("#chainAmount1"),
  changeChainAmount: document.querySelector("#changeChainAmount"),
  resetChain: document.querySelector("#resetChain"),
  chainStatus: document.querySelector("#chainStatus"),
  chainBlocks: ["#chainBlock1", "#chainBlock2", "#chainBlock3"].map(id => document.querySelector(id)),
  chainBadges: ["#chainBadge1", "#chainBadge2", "#chainBadge3"].map(id => document.querySelector(id)),
  chainPrevs: ["#chainPrev1", "#chainPrev2", "#chainPrev3"].map(id => document.querySelector(id)),
  chainHashes: ["#chainHash1", "#chainHash2", "#chainHash3"].map(id => document.querySelector(id)),
  chainLink12: document.querySelector("#chainLink12"),
  chainLink23: document.querySelector("#chainLink23"),
  chainLink12Text: document.querySelector("#chainLink12Text"),
  chainLink23Text: document.querySelector("#chainLink23Text"),
  manualPowPreviousHash: document.querySelector("#manualPowPreviousHash"),
  manualNonce: document.querySelector("#manualNonce"),
  manualPowHash: document.querySelector("#manualPowHash"),
  manualPowHashState: document.querySelector("#manualPowHashState"),
  manualPowStatus: document.querySelector("#manualPowStatus"),
  manualPowBlockCard: document.querySelector("#manualPowBlockCard"),
  manualPowBadge: document.querySelector("#manualPowBadge"),
  manualPowTarget: document.querySelector("#manualPowTarget"),
  manualDifficultyInputs: Array.from(document.querySelectorAll('input[name="manualDifficulty"]')),
  powPreviousHash: document.querySelector("#powPreviousHash"),
  powNonce: document.querySelector("#powNonce"),
  powHash: document.querySelector("#powHash"),
  powAttempts: document.querySelector("#powAttempts"),
  powElapsed: document.querySelector("#powElapsed"),
  powGoalPrefix: document.querySelector("#powGoalPrefix"),
  powTarget: document.querySelector("#powTarget"),
  powHashState: document.querySelector("#powHashState"),
  powStatus: document.querySelector("#powStatus"),
  powBlockCard: document.querySelector("#powBlockCard"),
  powBlockBadge: document.querySelector("#powBlockBadge"),
  mineButton: document.querySelector("#mineButton"),
  resetPow: document.querySelector("#resetPow"),
  difficultyInputs: Array.from(document.querySelectorAll('input[name="powDifficulty"]')),
  toast: document.querySelector("#toast"),
  returnBar: document.querySelector("#returnBar"),
  returnBack: document.querySelector("#returnBack"),
  returnNext: document.querySelector("#returnNext"),
  homeLink: document.querySelector(".home-link")
};

let renderToken = 0;
let blockRenderToken = 0;
let chainRenderToken = 0;
let toastTimer;
let lastBlockHash = "";
let defaultBlockHash = "";
let chainBase = null;
let miningSession = 0;
let isMining = false;

async function renderSingle() {
  const token = ++renderToken;
  const hash = await sha256(els.inputA.value);
  if (token === renderToken) els.hashA.textContent = hash;
}

function countHexDifferences(a, b) {
  let count = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) count++;
  return count;
}

async function renderCompare() {
  const token = ++renderToken;
  const [hashA, hashB] = await Promise.all([sha256(els.inputCompareA.value), sha256(els.inputCompareB.value)]);
  if (token !== renderToken) return;
  els.hashCompareA.textContent = hashA;
  els.hashCompareB.textContent = hashB;
  const same = els.inputCompareA.value === els.inputCompareB.value;
  els.comparisonSummary.classList.toggle("same", same);
  if (same) {
    els.differenceTitle.textContent = "같은 입력은 같은 Hash를 만듭니다.";
    els.differenceText.textContent = "두 입력이 같기 때문에 두 SHA-256 결과도 정확히 같습니다.";
  } else {
    const diff = countHexDifferences(hashA, hashB);
    els.differenceTitle.textContent = "작은 입력 차이가 큰 Hash 차이를 만듭니다.";
    els.differenceText.textContent = `두 Hash의 64자리 16진수 중 ${diff}자리가 서로 다릅니다.`;
  }
}

function setCompareMode(enabled) {
  els.singleMode.classList.toggle("hidden", enabled);
  els.compareMode.classList.toggle("hidden", !enabled);
  els.compareMode.setAttribute("aria-hidden", String(!enabled));
  if (enabled) renderCompare(); else renderSingle();
}

function normalizeAmount(input) {
  const value = Number.parseInt(input.value, 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function getCurrentBlock() {
  return {
    transactions: BLOCK_DEFAULTS.transactions.map((tx, index) => ({ ...tx, amount: normalizeAmount(els.amountInputs[index]) })),
    previousHash: BLOCK_DEFAULTS.previousHash,
    nonce: BLOCK_DEFAULTS.nonce
  };
}

function isDefaultBlock(block) {
  return block.transactions.every((tx, index) => tx.amount === BLOCK_DEFAULTS.transactions[index].amount);
}

async function renderBlock({ animate = true } = {}) {
  const token = ++blockRenderToken;
  const currentBlock = getCurrentBlock();
  const hash = await calculateBlockHash(currentBlock);
  if (token !== blockRenderToken) return;

  const hashChanged = lastBlockHash && lastBlockHash !== hash;
  els.blockHash.textContent = hash;
  if (hashChanged && animate) {
    els.blockHash.classList.remove("flash");
    void els.blockHash.offsetWidth;
    els.blockHash.classList.add("flash");
  }
  lastBlockHash = hash;

  const isDefault = isDefaultBlock(currentBlock);
  els.amountInputs.forEach((input, index) => input.closest(".transaction-row")?.classList.toggle("changed", normalizeAmount(input) !== BLOCK_DEFAULTS.transactions[index].amount));

  if (!isDefault) {
    const diff = defaultBlockHash ? countHexDifferences(defaultBlockHash, hash) : null;
    els.blockCard.classList.add("changed");
    els.blockChangeBadge.className = "state-badge changed";
    els.blockChangeBadge.textContent = "거래 변경됨";
    els.blockInsight.classList.add("changed");
    els.blockInsight.querySelector(".insight-icon").textContent = "↻";
    els.blockInsight.querySelector("strong").textContent = "거래 한 건이 바뀌자 Block Hash 전체가 다시 계산됐습니다.";
    els.blockInsight.querySelector("p").textContent = diff == null ? "작은 거래 변화도 Block 전체의 지문을 바꿉니다." : `처음 Hash와 비교하면 64자리 중 ${diff}자리가 달라졌습니다.`;
  } else {
    els.blockCard.classList.remove("changed");
    els.blockChangeBadge.className = "state-badge stable";
    els.blockChangeBadge.textContent = "현재 상태";
    els.blockInsight.classList.remove("changed");
    els.blockInsight.querySelector(".insight-icon").textContent = "✓";
    els.blockInsight.querySelector("strong").textContent = "세 거래를 포함한 Block 전체의 지문입니다.";
    els.blockInsight.querySelector("p").textContent = "거래 하나의 금액만 바꿔도 이 값이 즉시 달라집니다.";
  }
}

async function buildInitialChain() {
  const blocks = [];
  let previousHash = "0".repeat(64);
  for (const transactions of CHAIN_TRANSACTIONS) {
    const block = { transactions: transactions.map(tx => ({ ...tx })), previousHash, nonce: 0 };
    const hash = await calculateBlockHash(block);
    blocks.push({ ...block, hash });
    previousHash = hash;
  }
  return blocks;
}

function compactHash(hash) {
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

async function renderChain() {
  if (!chainBase) return;
  const token = ++chainRenderToken;
  const amount = normalizeAmount(els.chainAmount1);
  const block1 = {
    transactions: CHAIN_TRANSACTIONS[0].map((tx, index) => ({ ...tx, amount: index === 2 ? amount : tx.amount })),
    previousHash: chainBase[0].previousHash,
    nonce: 0
  };
  const hash1 = await calculateBlockHash(block1);
  if (token !== chainRenderToken) return;

  const hash2 = chainBase[1].hash;
  const hash3 = chainBase[2].hash;
  const hashes = [hash1, hash2, hash3];
  const prevs = [chainBase[0].previousHash, chainBase[1].previousHash, chainBase[2].previousHash];
  const link12 = hash1 === prevs[1];
  const link23 = hash2 === prevs[2];
  const wholeChainValid = link12 && link23;
  const block1Changed = amount !== CHAIN_TRANSACTIONS[0][2].amount;

  els.chainPrevs.forEach((el, i) => {
    el.textContent = compactHash(prevs[i]);
    el.title = prevs[i];
  });
  els.chainHashes.forEach((el, i) => {
    el.textContent = compactHash(hashes[i]);
    el.title = hashes[i];
  });

  els.chainBlocks[0].className = `chain-block ${block1Changed ? "changed" : "ok"}`;
  els.chainBadges[0].className = `chain-badge ${block1Changed ? "changed" : "ok"}`;
  els.chainBadges[0].textContent = block1Changed ? "Hash 변경" : "정상";

  els.chainBlocks[1].className = `chain-block ${link12 ? "ok" : "broken"}`;
  els.chainBadges[1].className = `chain-badge ${link12 ? "ok" : "broken"}`;
  els.chainBadges[1].textContent = link12 ? "정상" : "연결 끊김";

  const block3ConnectedToWholeChain = link12 && link23;
  els.chainBlocks[2].className = `chain-block ${block3ConnectedToWholeChain ? "ok" : "downstream"}`;
  els.chainBadges[2].className = `chain-badge ${block3ConnectedToWholeChain ? "ok" : "downstream"}`;
  els.chainBadges[2].textContent = block3ConnectedToWholeChain ? "정상" : "앞 연결 영향";

  els.chainLink12.className = `chain-link ${link12 ? "ok" : "broken"}`;
  els.chainLink12Text.textContent = link12 ? "일치" : "불일치";
  els.chainLink23.className = `chain-link ${link23 && link12 ? "ok" : "downstream"}`;
  els.chainLink23Text.textContent = link23 ? (link12 ? "일치" : "값은 일치 · 앞에서 끊김") : "불일치";

  els.chainStatus.className = `chain-status ${wholeChainValid ? "valid" : "broken"}`;
  const icon = els.chainStatus.querySelector(".chain-status-icon");
  const title = els.chainStatus.querySelector("strong");
  const copy = els.chainStatus.querySelector("p");
  if (wholeChainValid) {
    icon.textContent = "✓";
    title.textContent = "정상 Chain입니다.";
    copy.textContent = "각 Block이 바로 앞 Block의 Hash를 정확히 기억하고 있습니다.";
  } else {
    icon.textContent = "!";
    title.textContent = "Chain이 끊어졌습니다.";
    copy.textContent = `Block #1의 Hash는 ${compactHash(hash1)}로 바뀌었지만, Block #2의 Previous Hash는 ${compactHash(prevs[1])} 그대로입니다.`;
  }
}

function getPowDifficulty() {
  const checked = els.difficultyInputs.find(input => input.checked);
  return Number.parseInt(checked?.value || "3", 10);
}

function getPowBlock(nonce) {
  return {
    transactions: POW_TRANSACTIONS.map(tx => ({ ...tx })),
    previousHash: chainBase?.[2]?.hash || "0".repeat(64),
    nonce
  };
}

function calculatePowHashSync(nonce) {
  return sha256Fallback(serializeBlock(getPowBlock(nonce)));
}

function getManualPowDifficulty() {
  const checked = els.manualDifficultyInputs.find(input => input.checked);
  return Number.parseInt(checked?.value || "1", 10);
}

function normalizeManualNonce() {
  if (!els.manualNonce) return null;
  const digitsOnly = els.manualNonce.value.replace(/\D/g, "");
  if (digitsOnly !== els.manualNonce.value) {
    els.manualNonce.value = digitsOnly;
  }
  if (digitsOnly === "") return null;
  const value = Number.parseInt(digitsOnly, 10);
  return Math.min(10000, Math.max(0, value));
}

function setManualPowStatus(kind, icon, title, copy) {
  els.manualPowStatus.className = `manual-pow-status ${kind}`;
  els.manualPowStatus.querySelector(".manual-status-icon").textContent = icon;
  els.manualPowStatus.querySelector("strong").textContent = title;
  els.manualPowStatus.querySelector("p").textContent = copy;
}

function renderManualPow() {
  if (!chainBase || !els.manualNonce) return;
  const difficulty = getManualPowDifficulty();
  const prefix = "0".repeat(difficulty);
  const nonce = normalizeManualNonce();
  els.manualPowPreviousHash.textContent = compactHash(chainBase[2].hash);
  els.manualPowPreviousHash.title = chainBase[2].hash;
  els.manualPowTarget.textContent = `${prefix}…`;

  if (nonce === null) {
    els.manualPowHash.textContent = "Nonce를 입력하면 Hash가 즉시 계산됩니다.";
    els.manualPowHash.className = "hash-output pow-hash-output";
    els.manualPowHashState.className = "length-badge pending";
    els.manualPowHashState.textContent = "Nonce 입력 대기";
    els.manualPowBlockCard.className = "manual-pow-card";
    els.manualPowBadge.className = "chain-badge changed";
    els.manualPowBadge.textContent = "찾는 중";
    setManualPowStatus("idle", "?", "Nonce를 입력해 보세요.", `Hash가 ${prefix}으로 시작하면 성공입니다.`);
    return;
  }

  if (String(nonce) !== els.manualNonce.value && els.manualNonce.value !== "") {
    els.manualNonce.value = String(nonce);
  }
  const hash = calculatePowHashSync(nonce);
  const success = hash.startsWith(prefix);
  els.manualPowHash.textContent = hash;
  els.manualPowHash.className = `hash-output pow-hash-output${success ? " success" : ""}`;
  els.manualPowHashState.className = `length-badge ${success ? "success" : "pending"}`;
  els.manualPowHashState.textContent = success ? `${prefix} 조건 충족` : "조건 불충족";
  els.manualPowBlockCard.className = `manual-pow-card${success ? " success" : ""}`;
  els.manualPowBadge.className = `chain-badge ${success ? "ok" : "changed"}`;
  els.manualPowBadge.textContent = success ? "성공" : "찾는 중";

  if (success) {
    setManualPowStatus(
      "success",
      "✓",
      "찾았습니다!",
      `Nonce ${nonce.toLocaleString("ko-KR")}에서 Hash가 ${prefix}으로 시작합니다.${difficulty === 1 ? " 너무 쉬웠다면 00 난이도로 올려보세요." : ""}`
    );
  } else {
    setManualPowStatus("idle", "→", "다른 Nonce를 넣어보세요.", `현재 Hash는 ${prefix}으로 시작하지 않습니다.`);
  }
}

function resetManualPow() {
  els.manualDifficultyInputs.forEach(input => { input.checked = input.value === "1"; });
  els.manualNonce.value = "0";
  renderManualPow();
}

function formatElapsed(milliseconds) {
  return `${(milliseconds / 1000).toFixed(2)}초`;
}

function setDifficultyDisabled(disabled) {
  els.difficultyInputs.forEach(input => input.disabled = disabled);
}

function setPowStatus(kind, icon, title, copy) {
  els.powStatus.className = `pow-status ${kind}`;
  els.powStatus.querySelector(".pow-status-icon").textContent = icon;
  els.powStatus.querySelector("strong").textContent = title;
  els.powStatus.querySelector("p").textContent = copy;
}

function updatePowTarget() {
  const difficulty = getPowDifficulty();
  const prefix = "0".repeat(difficulty);
  els.powGoalPrefix.textContent = prefix;
  els.powTarget.textContent = `${prefix}…`;
  return prefix;
}

function renderPowIdle() {
  if (!chainBase) return;
  const prefix = updatePowTarget();
  const hash = calculatePowHashSync(0);
  els.powPreviousHash.textContent = compactHash(chainBase[2].hash);
  els.powPreviousHash.title = chainBase[2].hash;
  els.powNonce.textContent = "0";
  els.powHash.textContent = hash;
  els.powAttempts.textContent = "0";
  els.powElapsed.textContent = "0.00초";
  els.powHash.className = "hash-output pow-hash-output";
  els.powHashState.className = "length-badge pending";
  els.powHashState.textContent = hash.startsWith(prefix) ? "우연히 조건 충족" : "조건 불충족";
  els.powBlockCard.className = "pow-block-card";
  els.powBlockBadge.className = "chain-badge changed";
  els.powBlockBadge.textContent = "아직 미완성";
  els.mineButton.className = "mine-button";
  els.mineButton.textContent = "Mining 시작";
  setPowStatus("idle", "→", "아직 Mining을 시작하지 않았습니다.", "버튼을 누르면 Nonce를 하나씩 바꾸며 SHA-256을 반복 계산합니다.");
}

function stopMining({ message = true } = {}) {
  if (!isMining) return;
  miningSession++;
  isMining = false;
  setDifficultyDisabled(false);
  els.mineButton.className = "mine-button";
  els.mineButton.textContent = "Mining 시작";
  els.powBlockBadge.className = "chain-badge changed";
  els.powBlockBadge.textContent = "중지됨";
  if (message) setPowStatus("stopped", "■", "Mining을 중지했습니다.", "다시 시작하면 Nonce 0부터 조건을 찾습니다.");
}

function nextAnimationFrame() {
  return new Promise(resolve => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 0);
  });
}

async function startMining() {
  if (isMining) {
    stopMining();
    return;
  }
  if (!chainBase) return;

  const session = ++miningSession;
  const prefix = updatePowTarget();
  let nonce = 0;
  let attempts = 0;
  let lastHash = calculatePowHashSync(0);
  const startedAt = performance.now();
  const batchSize = 256;

  isMining = true;
  setDifficultyDisabled(true);
  els.mineButton.className = "mine-button mining";
  els.mineButton.textContent = "Mining 중지";
  els.powBlockCard.className = "pow-block-card mining";
  els.powBlockBadge.className = "chain-badge changed";
  els.powBlockBadge.textContent = "Mining 중";
  els.powHash.className = "hash-output pow-hash-output working";
  els.powHashState.className = "length-badge pending";
  els.powHashState.textContent = "조건 탐색 중";
  setPowStatus("working", "↻", "Nonce를 바꾸며 Hash를 계산하고 있습니다.", `목표는 ${prefix}으로 시작하는 Hash입니다.`);

  while (session === miningSession) {
    let displayNonce = nonce;
    let found = false;

    for (let i = 0; i < batchSize && session === miningSession; i++) {
      displayNonce = nonce;
      lastHash = calculatePowHashSync(nonce);
      attempts++;
      if (lastHash.startsWith(prefix)) {
        found = true;
        break;
      }
      nonce++;
    }

    const elapsed = performance.now() - startedAt;
    els.powNonce.textContent = displayNonce.toLocaleString("ko-KR");
    els.powHash.textContent = lastHash;
    els.powAttempts.textContent = attempts.toLocaleString("ko-KR");
    els.powElapsed.textContent = formatElapsed(elapsed);

    if (found) {
      isMining = false;
      setDifficultyDisabled(false);
      els.powBlockCard.className = "pow-block-card success";
      els.powBlockBadge.className = "chain-badge ok";
      els.powBlockBadge.textContent = "Mining 완료";
      els.powHash.className = "hash-output pow-hash-output success";
      els.powHashState.className = "length-badge success";
      els.powHashState.textContent = `${prefix} 조건 충족`;
      els.mineButton.className = "mine-button success";
      els.mineButton.textContent = "다시 Mining";
      setPowStatus("success", "✓", "조건을 만족하는 Hash를 찾았습니다!", `Nonce ${displayNonce.toLocaleString("ko-KR")}에서 ${attempts.toLocaleString("ko-KR")}번 계산한 끝에 성공했습니다.`);
      return;
    }

    await nextAnimationFrame();
  }
}

function resetPow({ showMessage = false } = {}) {
  miningSession++;
  isMining = false;
  setDifficultyDisabled(false);
  renderPowIdle();
  if (showMessage) showToast("Proof of Work를 초기 상태로 되돌렸습니다.");
}

function updateStepUI(step) {
  document.querySelectorAll("[data-step]").forEach(button => {
    const isActive = button.dataset.step === step && button.classList.contains("step");
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "step");
    else if (button.classList.contains("step")) button.removeAttribute("aria-current");
  });

  const sections = { hash: els.hashExperience, block: els.blockExperience, chain: els.chainExperience, pow: els.powExperience };
  Object.entries(sections).forEach(([name, section]) => {
    const active = name === step;
    section.classList.toggle("hidden", !active);
    section.setAttribute("aria-hidden", String(!active));
  });

  if (step === "hash") {
    els.heroEyebrow.textContent = "BLOCKCHAIN EXPERIENCE · STEP 1";
    els.heroTitle.textContent = "SHA-256 Hash 체험";
    els.heroCopy.textContent = "문장을 입력하고 한 글자만 바꿔보세요. 입력은 거의 같아도 Hash는 전혀 다른 값이 됩니다.";
    if (els.compareToggle.checked) renderCompare(); else renderSingle();
  } else if (step === "block") {
    els.heroEyebrow.textContent = "BLOCKCHAIN EXPERIENCE · STEP 2";
    els.heroTitle.textContent = "Block 체험";
    els.heroCopy.textContent = "여러 기록을 하나의 Block으로 묶어봅니다. 거래 한 건만 바꿔도 Block Hash 전체가 달라집니다.";
    renderBlock({ animate: false });
  } else if (step === "chain") {
    els.heroEyebrow.textContent = "BLOCKCHAIN EXPERIENCE · STEP 3";
    els.heroTitle.textContent = "Chain 체험";
    els.heroCopy.textContent = "앞 Block의 Hash를 다음 Block이 기억합니다. 앞의 기록을 바꾸면 연결이 어떻게 깨지는지 직접 확인해보세요.";
    renderChain();
  } else {
    els.heroEyebrow.textContent = "BLOCKCHAIN EXPERIENCE · STEP 4";
    els.heroTitle.textContent = "Proof of Work 체험";
    els.heroCopy.textContent = "Nonce를 바꾸며 특정 조건을 만족하는 Hash를 직접 찾아봅니다. 조건이 어려울수록 더 많은 계산이 필요합니다.";
    if (!isMining) renderPowIdle();
  }

  /* 학생 화면에서는 단계 번호를 쓰지 않는다 */
  if (document.body.classList.contains("participant")) {
    els.heroEyebrow.textContent = "오늘의 블록체인 체험";
  }
}

function navigateToStep(step, { updateHash = true } = {}) {
  if (!["hash", "block", "chain", "pow"].includes(step)) return;
  if (step !== "pow" && isMining) stopMining({ message: false });
  updateStepUI(step);
  if (updateHash) history.replaceState(null, "", `#${step}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 1500);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
}

els.inputA.addEventListener("input", renderSingle);
els.inputCompareA.addEventListener("input", renderCompare);
els.inputCompareB.addEventListener("input", renderCompare);
els.compareToggle.addEventListener("change", event => setCompareMode(event.target.checked));
els.changeOneChar.addEventListener("click", () => {
  els.inputA.value = els.inputA.value.endsWith("!") ? els.inputA.value.slice(0, -1) : `${els.inputA.value}!`;
  els.inputA.focus();
  renderSingle();
});
els.amountInputs.forEach(input => input.addEventListener("input", () => renderBlock()));
els.changeAmount.addEventListener("click", () => {
  const input = els.amountInputs[2];
  input.value = normalizeAmount(input) === 5000 ? "5001" : "5000";
  input.focus();
  renderBlock();
});
els.resetBlock.addEventListener("click", () => {
  els.amountInputs.forEach((input, index) => input.value = String(BLOCK_DEFAULTS.transactions[index].amount));
  renderBlock();
  showToast("Block을 초기 상태로 되돌렸습니다.");
});
els.chainAmount1.addEventListener("input", renderChain);
els.changeChainAmount.addEventListener("click", () => {
  els.chainAmount1.value = normalizeAmount(els.chainAmount1) === 5000 ? "5001" : "5000";
  els.chainAmount1.focus();
  renderChain();
});
els.resetChain.addEventListener("click", () => {
  els.chainAmount1.value = "5000";
  renderChain();
  showToast("Chain을 정상 상태로 되돌렸습니다.");
});

els.manualNonce.addEventListener("input", renderManualPow);
els.manualDifficultyInputs.forEach(input => input.addEventListener("change", renderManualPow));
els.mineButton.addEventListener("click", startMining);
els.resetPow.addEventListener("click", () => {
  resetManualPow();
  resetPow({ showMessage: true });
});
els.difficultyInputs.forEach(input => input.addEventListener("change", () => resetPow()));

document.addEventListener("click", async event => {
  const stepButton = event.target.closest("[data-step]");
  if (stepButton && !stepButton.hasAttribute("aria-disabled")) {
    navigateToStep(stepButton.dataset.step);
    return;
  }
  const copyButton = event.target.closest("[data-copy-target]");
  if (!copyButton) return;
  const target = document.getElementById(copyButton.dataset.copyTarget);
  await copyText(target.textContent);
  showToast("Hash를 복사했습니다.");
});

window.addEventListener("hashchange", () => {
  const step = location.hash.replace("#", "");
  if (["hash", "block", "chain", "pow"].includes(step)) updateStepUI(step);
});

/* ============================================================
   ReturnToLecture — 강의 ↔ 체험 왕복

   강의 화면은 다음 형태로 이 도구를 연다.
     experience/index.html?from=L05&return=L06#hash

     #hash    실행할 체험 종류
     from     체험 직전 강의 화면  → "← 강의로 돌아가기"
     return   체험 후 이어서 진행할 강의 화면 → "강의 계속하기 →"

   복귀 위치의 기준값은 URL parameter 다. sessionStorage 는 from 이
   빠졌을 때를 메우는 보조 수단으로만 쓰고, URL 값을 덮어쓰지 않는다.
   허용 값은 L01~L34 뿐이며, 그 밖의 값은 무시한다(임의 URL 복귀 금지).
   ============================================================ */

/* 강의 화면 수. lecture/screens.js 에 화면을 추가하면 이 값만 올리면 된다.
   (예전에는 L01~L25 가 정규식에 박혀 있어 새 화면이 막혔다.
       화면 수가 바뀌면 아래 상수 하나만 고치면 된다) */
const LECTURE_SCREEN_COUNT = 34;
const LECTURE_SCREEN_FORM = /^L(\d{2})$/;
const LECTURE_PATH = "../lecture/index.html";
const LECTURE_CONTEXT_KEY = "lecture:experience-context";

function validLectureScreen(value) {
  if (typeof value !== "string") return null;
  const matched = LECTURE_SCREEN_FORM.exec(value);
  if (!matched) return null;
  const number = Number(matched[1]);
  return number >= 1 && number <= LECTURE_SCREEN_COUNT ? value : null;
}

/** 강의 화면 URL. 잘못된 값이면 기본 강의 화면으로 보낸다. */
function lectureUrl(screenId) {
  const id = validLectureScreen(screenId) || "L01";
  return `${LECTURE_PATH}#/${id}`;
}

/** L06 → L05. from 이 없을 때 체험 직전 화면을 추정하는 보조 계산. */
function previousLectureScreen(screenId) {
  const number = Number(screenId.slice(1));
  return number > 1 ? `L${String(number - 1).padStart(2, "0")}` : "L01";
}

function readStoredContext() {
  try {
    const raw = sessionStorage.getItem(LECTURE_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeContext(context) {
  try {
    sessionStorage.setItem(LECTURE_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    /* 저장에 실패해도 URL 만으로 동작해야 하므로 무시한다. */
  }
}

/* ------------------------------------------------------------
   오늘의 체험 — QR 로 직접 들어온 학생 화면

   강의에서 연 경우(?from=&return=)는 지금까지와 똑같다. 강사용 경로다.
   QR 로 들어온 학생에게는 STEP 1~4 라는 번호 대신 오늘 쓸 체험 목록을 보여준다.
   순서대로 해야 하는 과정처럼 보이지 않게 하고, 함께 참여하는 PoW 만 표시한다.
   학생 화면은 강사가 원격으로 바꾸지 않는다 — 학생이 직접 눌러서 이동한다.
   ------------------------------------------------------------ */
const PARTICIPANT_ITEMS = [
  { step: "hash",  label: "HASH",  note: "선택" },
  { step: "block", label: "BLOCK", note: "선택" },
  { step: "chain", label: "CHAIN", note: "선택" },
  { step: "pow",   label: "PoW",   note: "함께 참여", together: true },
  { href: "./world-computer/index.html", label: "STATE", note: "선택" }
];

function setupParticipant() {
  document.body.classList.add("participant");

  const path = document.querySelector(".learning-path");
  if (!path) return;
  path.setAttribute("aria-label", "오늘의 체험");
  path.innerHTML = PARTICIPANT_ITEMS.map(item => {
    const inside = `<strong>${item.label}</strong><em class="step-note">${item.together ? "★ " : ""}${item.note}</em>`;
    return item.href
      ? `<a class="step available" href="${item.href}">${inside}</a>`
      : `<button class="step available${item.together ? " together" : ""}" type="button" data-step="${item.step}">${inside}</button>`;
  }).join("");
}

function setupReturnBar() {
  const params = new URLSearchParams(location.search);
  const returnTo = validLectureScreen(params.get("return"));

  /* 강의를 거치지 않고 직접 들어온 경우에는 상단바 대신 학생용 목록을 쓴다. */
  if (!returnTo) {
    setupParticipant();
    return;
  }

  const stored = readStoredContext();
  const from = validLectureScreen(params.get("from"))
    || (stored && stored.returnTo === returnTo ? validLectureScreen(stored.from) : null)
    || previousLectureScreen(returnTo);

  storeContext({ from, returnTo });

  els.returnBack.href = lectureUrl(from);
  els.returnNext.href = lectureUrl(returnTo);
  els.returnBar.hidden = false;
  document.body.classList.add("has-return-bar");

  connectPresenter({ from, returnTo });
}

/* ------------------------------------------------------------
   Presenter 연결 — 체험 내용에는 손대지 않는다.

   강사가 Presenter 에서 [체험 종료 · 강의 계속] 을 누르면 이 창이 강의로 돌아간다.
   체험도구가 열렸다는 사실과 복귀 위치만 알리고, 그 밖의 명령은 듣지 않는다.
   ------------------------------------------------------------ */
const LECTURE_ID_FORM = /^[A-Za-z][A-Za-z0-9-]{1,40}$/;

function connectPresenter(lecture) {
  if (typeof createLectureSync !== "function") return;   // 연결 스크립트가 없으면 그냥 지나간다
  const sync = createLectureSync(message => {
    if (message.type !== "RETURN_FROM_DEMO" && message.type !== "GOTO") return;
    const target = LECTURE_ID_FORM.test(message.screenId || "") ? message.screenId : lecture.returnTo;
    window.location.href = `${LECTURE_PATH}#/${target}`;
  });
  const kind = location.hash.replace("#", "") || "hash";
  sync.post("STAGE_STATE", { mode: "experience", kind, from: lecture.from, returnTo: lecture.returnTo });
}

async function init() {
  els.previousHash.textContent = BLOCK_DEFAULTS.previousHash;
  els.blockNonce.textContent = String(BLOCK_DEFAULTS.nonce);
  defaultBlockHash = await calculateBlockHash({
    transactions: BLOCK_DEFAULTS.transactions.map(tx => ({ ...tx })),
    previousHash: BLOCK_DEFAULTS.previousHash,
    nonce: BLOCK_DEFAULTS.nonce
  });
  chainBase = await buildInitialChain();
  await Promise.all([renderSingle(), renderBlock({ animate: false }), renderChain()]);
  renderManualPow();
  renderPowIdle();
  /* 학생용 목록을 먼저 세운 뒤 화면을 그린다. 그래야 첫 화면부터 단계 번호가 아니라
     오늘의 체험 목록으로 보인다. */
  setupReturnBar();
  const requestedStep = location.hash.replace("#", "");
  navigateToStep(["hash", "block", "chain", "pow"].includes(requestedStep) ? requestedStep : "hash", { updateHash: false });
}

init();
