/* ============================================================
   lecture/lecture-sync.js — Presenter ↔ Stage 연결

   같은 PC 에서 띄운 두 창을 잇는 것이 전부다.
     강사 노트북 ─┬─ Presenter  강사 화면
                  └─ Stage      프로젝터 화면 (확장 디스플레이)

   외부 서버도 WebSocket 도 쓰지 않는다. BroadcastChannel 하나와
   새로고침 복구용 localStorage 몇 칸이면 충분하다.

   주고받는 명령
     NEXT / PREV / GOTO   화면 이동            Presenter → Stage
     OPEN_EXPERIENCE      체험도구 열기        Presenter → Stage
     OPEN_NETWORK         실제 Network 열기    Presenter → Stage
     RETURN_FROM_DEMO     체험·Demo 끝내고 복귀 Presenter → Stage/체험도구
     READY                창이 열렸다           양쪽
     STATE_SYNC           지금 여기다           Presenter → Stage
     STAGE_STATE          지금 이것을 띄우고 있다 Stage/체험도구 → Presenter

   명령에는 화면 번호(L14)가 아니라 고정 ID(pow-challenge)를 싣는다.
   번호가 바뀌어도 연결이 깨지지 않아야 하기 때문이다.
   ============================================================ */

const LECTURE_CHANNEL_NAME = 'blockchain-lecture';

/** Presenter 가 여는 프로젝터 창의 이름. 같은 이름으로 다시 열면 그 창이 바뀐다. */
const LECTURE_STAGE_WINDOW = 'lecture-stage';

/* 새로고침 복구용. 채널이 살아 있으면 언제나 채널이 우선이다. */
const LECTURE_KEYS = {
  screen: 'lecture:current-screen',   // 고정 ID
  started: 'lecture:started-at',      // 강의 시작 시각(ms)
  elapsed: 'lecture:paused-elapsed',  // 일시정지까지의 경과(ms)
  mode: 'lecture:mode'                // lecture | experience | network-demo
};

/** localStorage 는 막혀 있을 수 있다. 실패해도 강의는 그대로 진행된다. */
function lectureRead(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function lectureWrite(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, String(value));
  } catch { /* 무시 */ }
}

/**
 * 채널을 연다. BroadcastChannel 이 없는 브라우저면 조용히 꺼둔 채로 돌려준다.
 * 이 경우에도 각 창은 혼자서 정상 동작한다 — 서로 따라가지 않을 뿐이다.
 */
function createLectureSync(onMessage) {
  let channel = null;
  try { channel = new BroadcastChannel(LECTURE_CHANNEL_NAME); } catch { channel = null; }

  if (channel && typeof onMessage === 'function') {
    channel.addEventListener('message', event => {
      const message = event.data;
      if (message && typeof message.type === 'string') onMessage(message);
    });
  }

  return {
    available: Boolean(channel),
    post(type, payload) {
      if (!channel) return false;
      channel.postMessage({ type, at: Date.now(), ...(payload || {}) });
      return true;
    }
  };
}
