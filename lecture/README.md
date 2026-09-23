# 강의 화면 (lecture/)

최종 강의자료 `블록체인_강의자료_v2.1.pdf` 28페이지를 강의 진행용 **34개 HTML 화면**으로 재구성한 화면입니다.
PDF 복사본이 아니라 실제 강의를 진행하는 화면이며, 체험도구와 한 번의 조작으로 왕복합니다.

원본에 없는 신규 화면이 넷 있습니다 — L02(강사 포지셔닝), L32~L34(에필로그).

## 파일

```
lecture/
├─ index.html    화면 셸 (진행 표시기 / 본문 / 하단 Navigation / 목차)
├─ screens.js    34개 화면 콘텐츠 — 원본 문구의 단일 출처
├─ presenter.html   강사용 제어화면 (Presenter View)
├─ presenter.css    Presenter 전용 레이아웃
├─ presenter.js     Presenter 로직 — 상태 · 미리보기 · 대본 · 시간
├─ presenter-notes.js  강의자용 대본 · 목표 시간 (Presenter 만 읽는다)
├─ lecture-sync.js  Presenter ↔ Stage 연결 (BroadcastChannel + localStorage)
├─ lecture.css   강의 화면 전용 레이아웃 (토큰은 ../shared.css 재사용)
├─ app.js        Router / Renderer / Navigation
└─ qr/           체험 진입용 QR (현재 화면에서는 쓰지 않음)
```

## 화면 ID — 고정 ID 와 화면 번호

화면마다 두 개의 값을 가집니다.

| 값 | 예 | 쓰는 곳 |
|---|---|---|
| `id` | `pow-challenge` | **고정 ID.** 화면 번호가 바뀌어도 그대로입니다. 체험 복귀·목차 이동·Presenter 연결은 전부 이 값 기준입니다. |
| `number` | `L14` | 화면에 표시하고 주소로 쓰는 번호. 강의 중 "지금 몇 번" 을 말하기 위한 값입니다. |

내부 연결에 번호를 쓰지 않기 때문에, 화면을 중간에 끼워 넣어 번호가 밀려도
체험 왕복과 목차가 깨지지 않습니다. (v2.2 에서 화면 4개가 늘었고 Ethereum 후반 순서가 바뀌었습니다.)

```js
{ id: 'pow-challenge', number: 'L14', … }
experience: { kind: 'pow', returnTo: 'pow-interpret', … }   // 번호가 아니라 고정 ID
```

## 라우팅

URL hash 가 현재 화면의 단일 출처입니다.

```
lecture/index.html#/L14            화면 번호 — 평소 쓰는 주소
lecture/index.html#/pow-challenge  고정 ID — 같은 화면을 열고 주소를 #/L14 로 정리한다
```

- 화면이 바뀌면 주소의 hash 도 항상 함께 바뀝니다. 주소를 복사하거나 QR로 만들면 같은 위치로 다시 들어옵니다.
- 새로고침 / URL 직접 접속 / QR 접속 모두 해당 화면으로 바로 진입합니다.
- 허용되지 않은 ID(`#/L99` 등)는 `L01` 로 안전하게 되돌립니다.
- 검증은 `SCREEN_INDEX` 한 곳에서만 합니다. 화면 목록에 없는 값은 어디서도 통과하지 못합니다.
- `<html data-screen="L14" data-screen-id="pow-challenge">` 로 현재 화면을 노출합니다. (Presenter 연결용)
- `sessionStorage` 는 첫 화면의 `이어서 보기` 를 위한 **보조** 수단일 뿐이며, URL 을 덮어쓰지 않습니다.

## 강의 ↔ 체험 왕복

강의 화면은 다음 형태로 체험도구를 엽니다.

```
experience/index.html?from=L06&return=L07#hash
```

| parameter | 뜻 |
|---|---|
| `#hash` | 실행할 체험 종류 (`hash` / `block` / `chain` / `pow`) |
| 경로 | Ethereum 체험만 별도 모듈이다 — `experience/world-computer/index.html?from=L23&return=L24` (hash 없음) |
| `from` | 체험 직전 강의 화면 → 체험도구의 `← 강의로 돌아가기` |
| `return` | 체험 후 이어서 진행할 강의 화면 → 체험도구의 `강의 계속하기 →` |

- 복귀 위치의 기준값은 URL parameter 입니다.
- `return` / `from` 은 `L01 ~ L34` 만 허용하며, 그 밖의 값(임의 URL 포함)은 무시합니다.
- `return` 이 없으면 체험도구 상단바를 표시하지 않습니다. (체험도구에 직접 접속한 경우)
- `from` 이 없으면 `return` 바로 앞 화면으로 보정합니다.

체험 연결은 다음 다섯 곳입니다. 화면 데이터에는 고정 ID 로 적고, 체험도구에 넘길 때만 번호로 바꿉니다.

| 진입 화면 | 체험 | 복귀 화면 |
|---|---|---|
| L06 `hash-question` Hash — 기록의 지문 | `hash` | L07 `block` |
| L07 `block` 왜 Block 일까? | `block` | L08 `chain` |
| L09 `tamper` 하나를 바꾸면? | `chain` | L10 `centralized-chain` |
| L14 `pow-challenge` ‘00’ 을 먼저 찾아라 | `pow` | L15 `pow-interpret` |
| L23 `state-experience` 실습 ③ 디지털 티켓 판매기 | `world-computer` (별도 모듈) | L24 `state-interpret` |

Ethereum 체험만 별도 모듈이다 — `experience/world-computer/index.html?from=L23&return=L24` (hash 없음) |
| `from` | 체험 직전 강의 화면 → 체험도구의 `← 강의로 돌아가기` |
| `return` | 체험 후 이어서 진행할 강의 화면 → 체험도구의 `강의 계속하기 →` |

- 복귀 위치의 기준값은 URL parameter 입니다.
- `return` / `from` 은 `L01 ~ L34` 만 허용하며, 그 밖의 값(임의 URL 포함)은 무시합니다.
- `return` 이 없으면 체험도구 상단바를 표시하지 않습니다. (체험도구에 직접 접속한 경우)
- `from` 이 없으면 `return` 바로 앞 화면으로 보정합니다.

체험 연결은 다음 네 곳입니다.

| 진입 화면 | 체험 | 복귀 화면 |
|---|---|---|
| L05 Hash — 기록의 지문 | `hash` | L06 왜 Block 일까? |
| L06 왜 Block 일까? | `block` | L07 왜 Chain 일까? |
| L08 하나를 바꾸면? | `chain` | L09 그런데 여기까지만이라면? |
| L13 ‘00’ 을 먼저 찾아라 | `pow` | L14 방금 ‘어려운 수학문제’를 풀었을까? |
| L22 실습 ③ 디지털 티켓 판매기 | `world-computer` (별도 모듈) | L23 방금 무엇이 실행되었을까? |

Ethereum 체험만 별도 모듈(`experience/world-computer/`)이고 나머지 넷은 한 도구의 STEP 1~4 입니다.

체험 진입은 화면의 버튼 하나로 합니다. QR 은 쓰지 않습니다.
`lecture/qr/*.svg` 에 사전 생성한 QR 이 남아 있으니 다시 쓰려면 `app.js` 의 체험 CTA 에 되살리면 됩니다.
(배포 도메인이 바뀌면 QR 은 다시 만들어야 합니다.)

## 조작

| 입력 | 동작 |
|---|---|
| `→` / `Space` | 다음 화면 |
| `←` | 이전 화면 |
| `Esc` | 목차 열기 / 닫기 |

입력 폼 위에서는 단축키가 동작하지 않습니다. 체험도구에는 강의 단축키를 두지 않습니다.

## 화면 목록

| 화면 | 고정 ID | 원본 | Section | 제목 | 노선 | Bridge | 주요 Action |
|---|---|---:|---|---|---|:-:|---|
| L01 | `lecture-title` | 1 | 도입 | 블록체인은 왜 ‘블록 체인’ 일까? | intro |  | 다음 |
| L02 | `why-me` | — | 도입 | 제가 오늘 이 이야기를 드리는 이유 | intro |  | 다음 |
| L03 | `simplify-first` | 2 | 도입 | 오늘은 조금 단순하게 설명하겠습니다 | intro |  | 다음 |
| L04 | `ledger-trust` | 3 | 장부에 대한 믿음 | 장부에 대한 믿음은 어디에서 오는가? | intro |  | 다음 |
| L05 | `no-central-authority` | 4 | 장부에 대한 믿음 | “이게 공식 장부입니다”라고 말할 수 있는 신뢰있는 존재가 없다면? | intro |  | 다음 |
| L06 | `hash-question` | 5 | Hash → Block → Chain | Hash — 기록의 지문 | 1 |  | **hash 체험** → block 복귀 |
| L07 | `block` | 6 | Hash → Block → Chain | 왜 Block 일까? | 1 | ○ | **block 체험** → chain 복귀 |
| L08 | `chain` | 7 | Hash → Block → Chain | 왜 Chain 일까? | 1 | ○ | 다음 |
| L09 | `tamper` | 8 | Hash → Block → Chain | 하나를 바꾸면? | 1 |  | **chain 체험** → centralized-chain 복귀 |
| L10 | `centralized-chain` | 9 | Hash → Block → Chain | 그런데 여기까지만이라면? | 1 | ○ | 다음 |
| L11 | `distributed-vs-servers` | 10 | Distributed Ledger → Consensus | 서버가 여러 대면 분산원장일까? | 1 |  | 다음 |
| L12 | `consensus-question` | 11 | Distributed Ledger → Consensus | 장부가 서로 다르면? | 1 |  | 다음 |
| L13 | `consensus-methods` | 12 | Distributed Ledger → Consensus | Consensus 에는 여러 방법이 있습니다 | 1 |  | 다음 |
| L14 | `pow-challenge` | 13 | Proof of Work | ‘00’ 을 먼저 찾아라 | 1 |  | **pow 체험** → pow-interpret 복귀 |
| L15 | `pow-interpret` | 14 | Proof of Work | 방금 ‘어려운 수학문제’를 풀었을까? | 1 | ○ | 다음 |
| L16 | `pow-repeat` | 14 | Proof of Work | 조건을 만족할 때까지 반복해서 시도한다 | 1 |  | 다음 |
| L17 | `pow-proposal` | 15 | Proof of Work | 그래서 먼저 찾으면 무엇을 하나? | 1 |  | 다음 |
| L18 | `pow-verification` | 16 | Proof of Work | 제안했다고 끝이 아니다 | 1 |  | 다음 |
| L19 | `pow-ledger-commit` | 16 | Proof of Work | 제안 ≠ 인정 | 1 |  | 다음 |
| L20 | `ledger-line-recap` | 17 | 첫 번째 노선 회수 · 환승 | 장부에 대한 믿음은 어디에서 올까? | 1 |  | 다음 |
| L21 | `ethereum-transition` | 18 | 첫 번째 노선 회수 · 환승 | 기록만 적어야 할까? | transfer |  | 다음 |
| L22 | `state-model` | 19 | Ethereum · World Computer | 컴퓨터가 하는 일을 아주 단순하게 보면 | 2 |  | 다음 |
| L23 | `state-experience` | 20 | Ethereum · World Computer | 실습 ③ 디지털 티켓 판매기 | 2 |  | **world-computer 체험** → state-interpret 복귀 |
| L24 | `state-interpret` | 21 | Ethereum · World Computer | 방금 무엇이 실행되었을까? | 2 | ○ | 다음 |
| L25 | `multi-node-execution` | 22 | Ethereum · World Computer | 한 컴퓨터에서 여러 노드로 | 2 |  | 다음 |
| L26 | `world-computer` | 23 | Ethereum · World Computer | 그래서 World Computer | 2 |  | 다음 |
| L27 | `smart-contract-name` | 25 | Ethereum · World Computer | 방금 본 것이 Smart Contract 입니다 | 2 |  | 다음 |
| L28 | `dapp-reveal` | 26 | Ethereum · World Computer | 그렇다면 DApp 은? | 2 |  | 다음 |
| L29 | `evm-boundary` | 24 | Ethereum · World Computer | 여기서 지도를 조금 더 확대하면… | 2 |  | 다음 |
| L30 | `two-lines-map` | 27 | 두 개의 노선도 | 오늘 만든 두 개의 블록체인 노선도 | both |  | 다음 |
| L31 | `blockchain-close` | 28 | 두 개의 노선도 | 오늘 만든 것은 블록체인의 ‘지하철 노선도’입니다 | both |  | 다음 |
| L32 | `learning-to-building` | — | 에필로그 · 배우고, 해보고, 다시 배우기 | From Learning to Building | epilogue |  | 다음 |
| L33 | `real-network` | — | 에필로그 · 배우고, 해보고, 다시 배우기 | 처음보다 뭐가 좀 보이시나요? | epilogue | ○ | 다음 |
| L34 | `closing` | — | 에필로그 · 배우고, 해보고, 다시 배우기 | 완벽히 이해할 때까지 기다리지는 마세요. | epilogue |  | 강의 홈 / 처음부터 |

## 원본 페이지 ↔ 화면 대응

내용을 줄이는 대신 화면을 나눴습니다. 삭제한 콘텐츠는 없습니다.

| 원본 페이지 | 화면 |
|---:|---|
| 1 | L01 |
| 2 | L03 |
| 3 | L04 |
| 4 | L05 |
| 5 | L06 |
| 6 | L07 |
| 7 | L08 |
| 8 | L09 |
| 9 | L10 |
| 10 | L11 |
| 11 | L12 |
| 12 | L13 |
| 13 | L14 |
| 14 | L15, L16 |
| 15 | L17 |
| 16 | L18, L19 |
| 17 | L20 |
| 18 | L21 |
| 19 | L22 |
| 20 | L23 |
| 21 | L24 |
| 22 | L25 |
| 23 | L26 |
| 24 | L29 |
| 25 | L27 |
| 26 | L28 |
| 27 | L30 |
| 28 | L31 |
| — (신규) | L02, L32, L33, L34 |

p24(EVM)은 v2.2 에서 화면 위치가 L29 로 내려갔습니다.
World Computer → Smart Contract → DApp 을 먼저 지나고 마지막에 EVM 경계를 긋습니다.

## 설명 구조 표현 요소

원본 PDF 의 비교·인과·공간 관계를 살리기 위한 표현들이다. 모든 것을 흰 카드로 만들지 않는다.

| helper | 쓰는 곳 | 표현하는 관계 |
|---|---|---|
| `conclusion` | 원본 하단 결론 | 결론을 작은 note 가 아니라 본문급으로 |
| `bridge`(화면 필드) | L07 · L08 · L10 · L15 · L24 · L33 | 체험 직후 `방금 한 일` 회수 |
| `recall` | L03 · L16 · L19 · L29 | 앞 화면 맥락 회수 |
| `nextHint` | L18 · L20 | 다음 화면 질문 예고 |
| `converge` | L15 | 두 갈래 → 하나의 결과 |
| `loopFlow` | L16 | 조건을 만족할 때까지 되돌아가는 반복 |
| `causalFlow` + `checkList` | L18 | 입력 → 검사 → 결과 |
| `ledgerCopies` | L19 | 같은 Block 이 각자의 장부에 |
| `routeWithRoles` | L05 · L20 · L30 | 개념을 잇는 노선 + 각 역의 역할 |
| `treeOrg` / `meshOrg` / `orgCompare` | L11 | 중앙 트리 ↔ 분산 네트워크 |
| `gather` | L07 | 흩어진 거래가 Block 안으로 |
| `branchTree` | L13 | 상위 개념 → 하위 방식 |
| `sharedNodes` | L05 · L22 | 노드들이 같은 것을 공유 |
| `changeTrail` | L09 | 변경이 어디까지 번지는가 |
| `mapCompare` | L03 | 같은 역을 실제 지도 ↔ 노선도로 두 번 그려 대비 |
| `simplifyExample` | L03 | ‘단순화란 무엇인가’를 여는 예시와 되묻는 질문 |
| `closingMessage` | L31 | 키워드 나열과 당부를 한 흐름으로 |
| `presenterCard` | L02 | 누가 이 이야기를 하는가 |
| `networkPreview` | L02 · L33 | 실제 분산원장 화면 — 처음에 보여주고 마지막에 회수 |
| `toolThumbs` | L32 | 오늘 쓴 체험도구를 한눈에 |
| `cycleFlow` | L32 | 배운다 → 해본다 → 막힌다 → 다시 배운다 |
| `boundaryStack` | L29 | 층을 쌓다가 오늘 강의의 경계에서 멈춘다 |

`networkPreview` 는 실제 Dashboard(`repo.mrdion.kim` · Phase 2 Repo Settlement Dashboard)의 구성을
그대로 옮겨 그립니다. 캡처 이미지가 아니라 화면으로 그리는 이유는 프로젝터에서 글자가 살아 있어야 하기 때문입니다.
표시 값(거래 수·최근 거래 줄)은 `screens.js` 의 `NETWORK_SNAPSHOT` 한 곳에 있고, 고치면 L02·L33 에 함께 반영됩니다.

## Presenter View — 강사용 제어화면

```
lecture/presenter.html     강사 노트북 화면
lecture/index.html         프로젝터 화면 (Stage)
```

Windows 디스플레이를 **확장(Extend)** 으로 두고, Presenter 는 노트북에,
Stage 는 프로젝터 쪽 창에 둡니다. Presenter 의 `[Stage 열기]` 를 누르면
Stage 가 새 창으로 열립니다. 그 창을 프로젝터로 옮기고 전체화면(F11)으로 쓰면 됩니다.

### 한 화면에서 보는 것

| 자리 | 내용 |
|---|---|
| 위 | 지금 화면 번호·제목 · 경과시간 / 목표 누적 / 차이 · Stage 연결 상태 |
| 가운데 왼쪽 | **CURRENT** — 실제 Stage 를 그대로 축소한 미리보기 |
| 가운데 오른쪽 | **NEXT** — 다음 화면 미리보기 (마지막에서는 ‘강의 종료’) |
| 가운데 아래 | **SPEAKER NOTES** — SCRIPT / CUE / CAUTION |
| 아래 | 이전 · 현재 위치 · 다음 · 목차 · 체험 · Network |

미리보기는 별도로 만든 축소 UI 가 아니라 **실제 Stage 를 `?preview=1` 로 띄운 것**입니다.
그래서 프로젝터에 나갈 화면과 언제나 같습니다.
미리보기 안에서는 저장·단축키·연결이 모두 꺼져 있어, 눌러도 실제 강의가 움직이지 않습니다.

대본·다음 화면·시간·강사용 버튼은 Presenter 에만 있습니다. 프로젝터에는 나가지 않습니다.

### 단축키

| 입력 | 동작 |
|---|---|
| `→` / `Space` | 다음 |
| `←` | 이전 |
| `G` | 목차 |
| `N` | 실제 Network 보기 (L33 에서만) |
| `Esc` | 목차 닫기 |

체험 시작에는 단축키를 두지 않았습니다. 강의 중 실수로 열리면 안 되기 때문입니다.

### 두 창을 잇는 방법

`lecture-sync.js` 의 `BroadcastChannel('blockchain-lecture')` 하나가 전부입니다.
외부 서버도 WebSocket 도 쓰지 않습니다.

| 명령 | 방향 | 뜻 |
|---|---|---|
| `NEXT` / `PREV` / `GOTO` | Presenter → Stage | 화면 이동 |
| `OPEN_EXPERIENCE` | Presenter → Stage | 체험도구 열기 |
| `OPEN_NETWORK` | Presenter → Stage | 실제 Network 열기 |
| `RETURN_FROM_DEMO` | Presenter → Stage·체험도구 | 체험·Demo 끝내고 복귀 |
| `READY` | 양쪽 | 창이 열렸다 |
| `STATE_SYNC` | Presenter → Stage | 지금 여기다 |
| `STAGE_STATE` | Stage·체험도구 → Presenter | 지금 이것을 띄우고 있다 |

명령에는 번호가 아니라 **고정 ID** 를 싣습니다.

- 늦게 열린 쪽이 상대 위치를 따라갑니다. Stage 를 나중에 열면 Presenter 위치로 맞춰집니다.
- Stage 에서 직접 넘겨도(버튼·단축키·목차) Presenter 가 따라옵니다.
- 새로고침하면 `localStorage` 의 `lecture:current-screen` 등으로 위치와 시간을 되살립니다.
  채널이 살아 있으면 언제나 채널이 우선입니다.
- 체험도구도 이 채널을 듣습니다. Presenter 의 `[체험 종료 · 강의 계속]` 한 번으로 강의로 돌아옵니다.
  체험 내용 자체는 건드리지 않았습니다.
- 외부 Dashboard 는 우리 코드가 아니라 채널이 닿지 않습니다. 그래서 Demo 복귀는
  `[Stage 열기]` 로 연 창 손잡이로 처리합니다. Stage 를 직접 연 경우에는
  `[Demo 종료]` 가 Stage 창을 새로 열 수 있습니다.

### 시간

`presenter-notes.js` 의 `targetSeconds` 를 누적해 **이 화면에 도착했어야 하는 시각**을 계산합니다.
전체 목표는 76:15 입니다. 조금 늦어도 붉은 경고나 깜빡임을 쓰지 않습니다 — `+01:12` 처럼만 적습니다.
`[강의 시작]` 을 눌러야 시계가 갑니다. `[일시정지]` / `[초기화]` 는 보조입니다.

### 화면 크기

1920×1080 · 1600×900 · 1366×768 에서 스크롤 없이 들어갑니다.
Presenter 는 강의용 PC 전용 화면입니다. 모바일 대응은 하지 않았습니다(Stage 는 그대로 대응합니다).

## Network Demo

강의 화면에는 강사용 control 을 두지 않습니다. Demo 는 Presenter 에서만 시작합니다.

- 실제 Dashboard 는 `https://repo.mrdion.kim` 입니다. `screens.js` 의 `real-network` 화면
  `demo.url` 에 들어 있고, 비우면 Presenter 가 `Network Demo URL 미설정` 으로 표시합니다.
- Presenter 없이 확인할 때는 콘솔에서 아래를 쓸 수 있습니다.

```js
window.lectureCommand('OPEN_NETWORK')       // 프로젝터 화면이 Dashboard 로 바뀐다
window.lectureCommand('RETURN_FROM_DEMO')   // demo.returnTo — closing 화면으로 돌아온다
```

- Demo 대본(Node → Block → Block Height → Transaction → Validator → 회수)과 2분 제한은
  `presenter-notes.js` 의 `PRESENTER_MODES['network-demo']` 에 있습니다.

## 화면 크기

프로젝터를 1순위로 본다. 큰 글자는 화면 폭과 **높이**를 함께 보고(`min(vw, vh)`),
낮은 해상도에서는 여백만 줄인다. 콘텐츠는 줄이지 않는다.

| 해상도 | 34개 화면 중 세로 스크롤이 생기는 화면 |
|---|---|
| 1920×1080 | 0개 |
| 1366×768 | 0개 |
| 1280×720 | 0개 |

## 콘텐츠를 고칠 때

원본 문구는 전부 `screens.js` 안에 있습니다. 화면 컴포넌트에는 문구를 두지 않습니다.
새 화면 유형이 필요하면 `screens.js` 상단의 helper(`duo` / `chainDiagram` / `flow` 등)를 늘리고,
스타일은 `lecture.css` 에 같은 이름으로 추가합니다.
