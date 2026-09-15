(() => {
  "use strict";

  const INITIAL_STATE = Object.freeze({ price: 1000, tickets: 2, sales: 0 });
  const GUIDED_STEPS = [
    {
      amount: 500,
      title: "먼저 500원을 보내보세요.",
      text: "결제금액이 부족하면 Program이 어디에서 실행을 멈추는지 확인합니다."
    },
    {
      amount: 1000,
      title: "이번에는 1,000원을 보내보세요.",
      text: "두 조건을 모두 통과하면 State가 어떻게 바뀌는지 확인합니다."
    },
    {
      amount: 1000,
      title: "같은 Input을 한 번 더 보내보세요.",
      text: "앞선 실행 결과가 다음 실행의 현재 State가 됩니다."
    },
    {
      amount: 1000,
      title: "마지막으로 같은 buy(1000)을 다시 실행해보세요.",
      text: "Input은 같지만 State가 달라지면 결과도 달라지는지 확인합니다."
    }
  ];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, prefersReducedMotion() ? 20 : ms));
  const formatNumber = (value) => Number(value).toLocaleString("ko-KR");

  const els = {
    introPanel: $("#introPanel"), experiencePanel: $("#experiencePanel"), startButton: $("#startButton"),
    progressBadge: $("#progressBadge"), resetButton: $("#resetButton"), restartButton: $("#restartButton"),
    guideNumber: $("#guideNumber"), guideTitle: $("#guideTitle"), guideText: $("#guideText"),
    inputCard: $("#inputCard"), programCard: $("#programCard"), stateCard: $("#stateCard"),
    inputStatus: $("#inputStatus"), programStatus: $("#programStatus"), stateStatus: $("#stateStatus"),
    paymentInput: $("#paymentInput"), callPreview: $("#callPreview"), executeButton: $("#executeButton"), inputCoach: $("#inputCoach"),
    conditionPrice: $("#conditionPrice"), conditionStock: $("#conditionStock"),
    priceState: $("#priceState"), ticketState: $("#ticketState"), salesState: $("#salesState"),
    priceValue: $("#priceValue"), ticketValue: $("#ticketValue"), salesValue: $("#salesValue"),
    stateTransition: $("#stateTransition"), resultBar: $("#resultBar"), resultIcon: $("#resultIcon"),
    resultTitle: $("#resultTitle"), resultText: $("#resultText"), advanceButton: $("#advanceButton"),
    completionPanel: $("#completionPanel"), showBridgeButton: $("#showBridgeButton"), nodeBridge: $("#nodeBridge"),
    continueLectureButton: $("#continueLectureButton"), returnLectureTop: $("#returnLectureTop"), toast: $("#toast")
  };

  let state = { ...INITIAL_STATE };
  let stepIndex = 0;
  let running = false;
  let execution = null;
  let toastTimer = null;

  function setStatus(el, mode, text) {
    el.className = `card-status ${mode}`;
    el.textContent = text;
  }

  function setCardMode(el, mode = "") {
    el.classList.remove("active", "success", "failure");
    if (mode) el.classList.add(mode);
  }

  function setCondition(el, mode, formula, result) {
    el.className = `condition-row ${mode}`;
    el.querySelector(".condition-icon").textContent = mode === "pass" ? "✓" : mode === "fail" ? "✕" : mode === "checking" ? "…" : mode === "skipped" ? "—" : "○";
    el.querySelector("p").textContent = formula;
    el.querySelector(".condition-result").textContent = result;
  }

  function setTransition(mode, title, text, icon) {
    els.stateTransition.className = `state-transition ${mode}`;
    els.stateTransition.querySelector(".transition-icon").textContent = icon;
    els.stateTransition.querySelector("strong").textContent = title;
    els.stateTransition.querySelector("p").textContent = text;
  }

  function setResult(mode, title, text, icon) {
    els.resultBar.className = `result-bar ${mode}`;
    els.resultIcon.textContent = icon;
    els.resultTitle.textContent = title;
    els.resultText.textContent = text;
  }

  function setAdvance(label = "", visible = false, disabled = false) {
    els.advanceButton.classList.toggle("hidden", !visible);
    els.advanceButton.disabled = disabled;
    if (visible) els.advanceButton.innerHTML = `${label} <span aria-hidden="true">→</span>`;
  }

  function setStateRead(row, active) {
    row.classList.toggle("reading", active);
  }

  function clearStateReads() {
    setStateRead(els.priceState, false);
    setStateRead(els.ticketState, false);
  }

  function renderState() {
    els.priceValue.textContent = `${formatNumber(state.price)}원`;
    els.ticketValue.textContent = `${state.tickets}장`;
    els.salesValue.textContent = `${state.sales}장`;
  }

  function updateInputUI() {
    const amount = Math.max(0, Number(els.paymentInput.value || 0));
    els.callPreview.textContent = `buy(${amount})`;
    els.executeButton.textContent = `buy(${amount}) 실행`;
    $$(".value-chip").forEach((button) => button.classList.toggle("active", Number(button.dataset.value) === amount));
  }

  function updateGuide() {
    if (stepIndex >= GUIDED_STEPS.length) return;
    const step = GUIDED_STEPS[stepIndex];
    els.progressBadge.textContent = `${stepIndex + 1} / 4`;
    els.guideNumber.textContent = stepIndex + 1;
    els.guideTitle.textContent = step.title;
    els.guideText.textContent = step.text;
    els.paymentInput.value = String(step.amount);
    updateInputUI();
    els.inputCoach.textContent = "";
  }

  function resetConditionUI() {
    setCondition(els.conditionPrice, "pending", "—", "대기");
    setCondition(els.conditionStock, "pending", "—", "대기");
    clearStateReads();
    els.ticketState.classList.remove("changing");
    els.salesState.classList.remove("changing");
  }

  function prepareForNext() {
    execution = null;
    setAdvance("", false);
    setCardMode(els.inputCard, "");
    setCardMode(els.programCard, "");
    setCardMode(els.stateCard, "");
    setStatus(els.inputStatus, "idle", "입력 준비");
    setStatus(els.programStatus, "idle", "실행 대기");
    setStatus(els.stateStatus, "idle", "현재 상태");
    resetConditionUI();
    setTransition("idle", "다음 실행을 기다립니다.", "같은 Program이 현재 State를 다시 읽습니다.", "→");
    setResult("idle", "다음 Input을 보내보세요.", "buy 실행 후에는 각 조건을 직접 눌러 하나씩 확인합니다.", "→");
    els.executeButton.classList.remove("running");
    els.executeButton.disabled = false;
    els.paymentInput.disabled = false;
    $$(".value-chip").forEach((b) => b.disabled = false);
    updateGuide();
  }

  function resetExperience({ scroll = false } = {}) {
    state = { ...INITIAL_STATE };
    stepIndex = 0;
    running = false;
    execution = null;
    renderState();
    resetConditionUI();
    setCardMode(els.inputCard, "");
    setCardMode(els.programCard, "");
    setCardMode(els.stateCard, "");
    setStatus(els.inputStatus, "idle", "입력 준비");
    setStatus(els.programStatus, "idle", "실행 대기");
    setStatus(els.stateStatus, "idle", "현재 상태");
    setTransition("idle", "아직 실행 전입니다.", "Program이 성공하면 이곳에서 State 변화가 보입니다.", "→");
    setResult("idle", "Input을 보내면 실행 과정이 여기 표시됩니다.", "buy 실행 후 각 조건을 하나씩 눌러 확인해보세요.", "→");
    setAdvance("", false);
    els.completionPanel.classList.add("hidden");
    els.completionPanel.setAttribute("aria-hidden", "true");
    els.nodeBridge.classList.add("hidden");
    els.nodeBridge.setAttribute("aria-hidden", "true");
    els.showBridgeButton.disabled = false;
    els.executeButton.disabled = false;
    els.paymentInput.disabled = false;
    els.executeButton.classList.remove("running");
    $$(".value-chip").forEach((b) => b.disabled = false);
    updateGuide();
    if (scroll) els.experiencePanel.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }

  function validateGuidedAmount(amount) {
    const expected = GUIDED_STEPS[stepIndex]?.amount;
    if (amount === expected) return true;
    const formatted = formatNumber(expected);
    els.inputCoach.textContent = `이번 ${stepIndex + 1}번째 실행에서는 ${formatted}원을 입력해 주세요. 네 번의 비교 순서를 그대로 체험합니다.`;
    els.paymentInput.focus();
    return false;
  }

  async function animateStateChange(before) {
    els.ticketState.classList.add("changing");
    els.salesState.classList.add("changing");
    els.ticketValue.innerHTML = `<span class="old-value">${before.tickets}장</span><span class="transition-arrow">→</span>${state.tickets}장`;
    els.salesValue.innerHTML = `<span class="old-value">${before.sales}장</span><span class="transition-arrow">→</span>${state.sales}장`;
    await sleep(430);
    renderState();
    els.ticketState.classList.remove("changing");
    els.salesState.classList.remove("changing");
  }

  function executeCurrentStep() {
    if (running || stepIndex >= GUIDED_STEPS.length) return;
    const amount = Number(els.paymentInput.value || 0);
    if (!validateGuidedAmount(amount)) return;

    running = true;
    els.inputCoach.textContent = "";
    els.executeButton.disabled = true;
    els.paymentInput.disabled = true;
    $$(".value-chip").forEach((b) => b.disabled = true);
    els.executeButton.classList.add("running");
    resetConditionUI();

    const before = { ...state };
    const call = `buy(${amount})`;
    execution = {
      amount,
      before,
      call,
      pricePass: amount >= state.price,
      stockPass: state.tickets > 0,
      phase: "input"
    };

    setCardMode(els.inputCard, "active");
    setCardMode(els.programCard, "");
    setCardMode(els.stateCard, "");
    setStatus(els.inputStatus, "success", "Input 전송 완료");
    setStatus(els.programStatus, "idle", "실행 대기");
    setStatus(els.stateStatus, "idle", "현재 상태");
    setResult("idle", `${call} Input을 보냈습니다.`, "여기서 잠시 멈춥니다. 다음 버튼을 눌러 Program의 첫 번째 조건을 확인하세요.", "→");
    setAdvance("다음: 가격 조건 확인", true);
  }

  function showPriceCheck() {
    const { amount, pricePass } = execution;
    setCardMode(els.inputCard, "");
    setCardMode(els.programCard, "active");
    setStatus(els.programStatus, pricePass ? "success" : "failure", "1번째 조건 확인");
    clearStateReads();
    setStateRead(els.priceState, true);
    setCondition(
      els.conditionPrice,
      pricePass ? "pass" : "fail",
      `${formatNumber(amount)} ≥ ${formatNumber(state.price)}`,
      pricePass ? "통과" : "실패"
    );
    if (!pricePass) setCondition(els.conditionStock, "skipped", "아직 확인하지 않음", "대기");
    setResult(
      pricePass ? "success" : "failure",
      pricePass ? "첫 번째 조건을 통과했습니다." : "첫 번째 조건에서 실패했습니다.",
      pricePass
        ? `결제금액 ${formatNumber(amount)}원은 현재 State의 가격 ${formatNumber(state.price)}원 이상입니다.`
        : `결제금액 ${formatNumber(amount)}원은 현재 State의 가격 ${formatNumber(state.price)}원보다 작습니다.`,
      pricePass ? "✓" : "✕"
    );
    execution.phase = "price";
    setAdvance(pricePass ? "다음: 재고 조건 확인" : "다음: 결과 확인", true);
  }

  function showStockCheck() {
    const { stockPass } = execution;
    clearStateReads();
    setStateRead(els.ticketState, true);
    setStatus(els.programStatus, stockPass ? "success" : "failure", "2번째 조건 확인");
    setCondition(els.conditionStock, stockPass ? "pass" : "fail", `${state.tickets} > 0`, stockPass ? "통과" : "실패");
    setResult(
      stockPass ? "success" : "failure",
      stockPass ? "두 번째 조건도 통과했습니다." : "두 번째 조건에서 실패했습니다.",
      stockPass
        ? `현재 State의 남은 티켓은 ${state.tickets}장입니다. 이제 State Transition이 가능합니다.`
        : "결제금액은 충분하지만 현재 State의 남은 티켓이 0장입니다.",
      stockPass ? "✓" : "✕"
    );
    execution.phase = "stock";
    setAdvance(stockPass ? "다음: State 변화 확인" : "다음: 결과 확인", true);
  }

  async function showFinalResult() {
    const { before, call, pricePass, stockPass } = execution;
    clearStateReads();
    setAdvance("", false);

    if (!pricePass) {
      setCardMode(els.programCard, "failure");
      setStatus(els.programStatus, "failure", "조건 실패");
      setCardMode(els.stateCard, "failure");
      setStatus(els.stateStatus, "failure", "변화 없음");
      setCondition(els.conditionStock, "skipped", "확인하지 않음", "건너뜀");
      setTransition("failure", "State 변화 없음", `티켓 ${before.tickets}장 · 판매량 ${before.sales}장 그대로 유지`, "✕");
      setResult("failure", "구매 실패 — 결제금액이 부족합니다.", "Input은 실행됐지만 첫 번째 조건을 통과하지 못해 State는 바뀌지 않았습니다.", "✕");
    } else if (!stockPass) {
      setCardMode(els.programCard, "failure");
      setStatus(els.programStatus, "failure", "조건 실패");
      setCardMode(els.stateCard, "failure");
      setStatus(els.stateStatus, "failure", "변화 없음");
      setTransition("failure", "State 변화 없음", `같은 ${call}이어도 남은 티켓이 0장이므로 현재 State가 유지됩니다.`, "✕");
      setResult("failure", "구매 실패 — 남은 티켓이 없습니다.", "두 번째 실행과 같은 Input이지만 현재 State가 달라 결과가 달라졌습니다.", "✕");
    } else {
      setCardMode(els.programCard, "success");
      setStatus(els.programStatus, "success", "조건 모두 통과");
      state.tickets -= 1;
      state.sales += 1;
      setCardMode(els.stateCard, "active");
      setStatus(els.stateStatus, "working", "State Transition");
      setTransition("success", "State Transition", `남은 티켓 ${before.tickets} → ${state.tickets} · 판매량 ${before.sales} → ${state.sales}`, "✓");
      els.advanceButton.disabled = true;
      await animateStateChange(before);
      setCardMode(els.stateCard, "success");
      setStatus(els.stateStatus, "success", "새 State");
      setResult("success", "구매 성공 — 티켓이 발급되었습니다.", `Program 실행 결과 남은 티켓은 ${state.tickets}장, 판매량은 ${state.sales}장이 되었습니다.`, "✓");
    }

    execution.phase = "result";
    const last = stepIndex === GUIDED_STEPS.length - 1;
    setAdvance(last ? "체험 결과 정리하기" : "다음 실행으로", true);
  }

  async function advanceExecution() {
    if (!running || !execution || els.advanceButton.disabled) return;

    if (execution.phase === "input") {
      showPriceCheck();
      return;
    }

    if (execution.phase === "price") {
      if (execution.pricePass) showStockCheck();
      else await showFinalResult();
      return;
    }

    if (execution.phase === "stock") {
      await showFinalResult();
      return;
    }

    if (execution.phase === "result") {
      finishStep();
    }
  }

  function finishStep() {
    stepIndex += 1;
    running = false;
    execution = null;
    setAdvance("", false);

    if (stepIndex >= GUIDED_STEPS.length) {
      els.progressBadge.textContent = "4 / 4 완료";
      els.executeButton.disabled = true;
      els.paymentInput.disabled = true;
      $$(".value-chip").forEach((b) => b.disabled = true);
      els.executeButton.classList.remove("running");
      setStatus(els.inputStatus, "success", "체험 완료");
      els.completionPanel.classList.remove("hidden");
      els.completionPanel.setAttribute("aria-hidden", "false");
      els.completionPanel.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      return;
    }

    prepareForNext();
  }

  function revealBridge() {
    els.nodeBridge.classList.remove("hidden");
    els.nodeBridge.setAttribute("aria-hidden", "false");
    els.showBridgeButton.disabled = true;
    els.nodeBridge.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("show");
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
  }

  /* ------------------------------------------------------------
     강의 화면과의 왕복

     Hash / Block / Chain / PoW 체험과 같은 규약을 쓴다.
       ?from=L22   체험 직전 강의 화면 → '강의로 돌아가기'
       ?return=L23 체험 후 이어서 볼 화면 → '강의에서 계속 보기'

     복귀 주소를 통째로 받지 않고 화면 ID 만 받는다.
     임의 URL 이 들어와도 다른 곳으로 보내지 않기 위해서다.
     ------------------------------------------------------------ */

  const LECTURE_SCREEN_COUNT = 30;   // lecture/screens.js 의 화면 수
  const LECTURE_SCREEN_FORM = /^L(\d{2})$/;
  const LECTURE_PATH = "../../lecture/index.html";

  function validLectureScreen(value) {
    if (typeof value !== "string") return null;
    const matched = LECTURE_SCREEN_FORM.exec(value);
    if (!matched) return null;
    const number = Number(matched[1]);
    return number >= 1 && number <= LECTURE_SCREEN_COUNT ? value : null;
  }

  function lectureContext() {
    const params = new URLSearchParams(window.location.search);
    const returnTo = validLectureScreen(params.get("return"));
    if (!returnTo) return null;              // 강의를 거치지 않고 직접 들어온 경우
    const number = Number(returnTo.slice(1));
    const fallbackFrom = number > 1 ? `L${String(number - 1).padStart(2, "0")}` : "L01";
    return { from: validLectureScreen(params.get("from")) || fallbackFrom, returnTo };
  }

  function goToLecture(screenId) {
    window.location.href = `${LECTURE_PATH}#/${screenId}`;
  }

  els.startButton.addEventListener("click", () => {
    els.introPanel.classList.add("hidden");
    els.experiencePanel.classList.remove("hidden");
    els.experiencePanel.setAttribute("aria-hidden", "false");
    resetExperience();
    els.experiencePanel.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  });

  els.paymentInput.addEventListener("input", () => {
    els.inputCoach.textContent = "";
    updateInputUI();
  });

  $$(".value-chip").forEach((button) => {
    button.addEventListener("click", () => {
      els.paymentInput.value = button.dataset.value;
      els.inputCoach.textContent = "";
      updateInputUI();
      els.paymentInput.focus();
    });
  });

  els.executeButton.addEventListener("click", executeCurrentStep);
  els.advanceButton.addEventListener("click", advanceExecution);
  els.paymentInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (running) advanceExecution();
      else executeCurrentStep();
    }
  });
  els.resetButton.addEventListener("click", () => resetExperience({ scroll: true }));
  els.restartButton.addEventListener("click", () => resetExperience({ scroll: true }));
  els.showBridgeButton.addEventListener("click", revealBridge);
  /* 강의에서 들어왔을 때만 복귀 버튼을 살린다 */
  const lecture = lectureContext();
  if (lecture) {
    els.returnLectureTop.addEventListener("click", () => goToLecture(lecture.from));
    els.continueLectureButton.addEventListener("click", () => goToLecture(lecture.returnTo));
  } else {
    els.returnLectureTop.classList.add("hidden");
    els.continueLectureButton.classList.add("hidden");
  }

  renderState();
  updateGuide();
  updateInputUI();
})();
