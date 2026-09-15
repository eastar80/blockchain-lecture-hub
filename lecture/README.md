# 강의 화면 (lecture/)

최종 강의자료 `블록체인_강의자료_v2.0.pdf` 28페이지를 강의 진행용 **30개 HTML 화면**으로 재구성한 화면입니다.
PDF 복사본이 아니라 실제 강의를 진행하는 화면이며, 체험도구와 한 번의 조작으로 왕복합니다.

## 파일

```
lecture/
├─ index.html    화면 셸 (진행 표시기 / 본문 / 하단 Navigation / 목차)
├─ screens.js    25개 화면 콘텐츠 — 원본 문구의 단일 출처
├─ lecture.css   강의 화면 전용 레이아웃 (토큰은 ../shared.css 재사용)
├─ app.js        Router / Renderer / Navigation
└─ qr/           체험 진입용 QR (현재 화면에서는 쓰지 않음)
```

## 라우팅

화면은 논리 ID `L01 ~ L25` 로 관리하고, URL hash 가 현재 화면의 단일 출처입니다.

```
lecture/index.html#/L13
```

- 화면이 바뀌면 주소의 hash 도 항상 함께 바뀝니다. 주소를 복사하거나 QR로 만들면 같은 위치로 다시 들어옵니다.
- 새로고침 / URL 직접 접속 / QR 접속 모두 해당 화면으로 바로 진입합니다.
- 허용되지 않은 ID(`#/L99` 등)는 `L01` 로 안전하게 되돌립니다.
- `sessionStorage` 는 첫 화면의 `이어서 보기` 를 위한 **보조** 수단일 뿐이며, URL 을 덮어쓰지 않습니다.

## 강의 ↔ 체험 왕복

강의 화면은 다음 형태로 체험도구를 엽니다.

```
experience/index.html?from=L05&return=L06#hash
```

| parameter | 뜻 |
|---|---|
| `#hash` | 실행할 체험 종류 (`hash` / `block` / `chain` / `pow`) |
| 경로 | Ethereum 체험만 별도 모듈이다 — `experience/world-computer/index.html?from=L22&return=L23` (hash 없음) |
| `from` | 체험 직전 강의 화면 → 체험도구의 `← 강의로 돌아가기` |
| `return` | 체험 후 이어서 진행할 강의 화면 → 체험도구의 `강의 계속하기 →` |

- 복귀 위치의 기준값은 URL parameter 입니다.
- `return` / `from` 은 `L01 ~ L25` 만 허용하며, 그 밖의 값(임의 URL 포함)은 무시합니다.
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

| 화면 | 원본 | Section | 제목 | 노선 | Bridge | 주요 Action |
|---|---:|---|---|---|:-:|---|
| L01 | p1 | 도입 | 블록체인은 왜 ‘블록체인’일까? | intro |  | 다음 |
| L02 | p2 | 도입 | 오늘은 조금 단순하게 설명하겠습니다 | intro |  | 다음 |
| L03 | p3 | 장부에 대한 믿음 | 장부에 대한 믿음은 어디에서 오는가? | intro |  | 다음 |
| L04 | p4 | 장부에 대한 믿음 | “이게 공식 장부입니다”라고 말할 수 있는 신뢰있는 존재가 없다면? | intro |  | 다음 |
| L05 | p5 | Hash → Block → Chain | Hash — 기록의 지문 | 1 |  | **hash 체험** → L06 복귀 |
| L06 | p6 | Hash → Block → Chain | 왜 Block 일까? | 1 | ○ | **block 체험** → L07 복귀 |
| L07 | p7 | Hash → Block → Chain | 왜 Chain 일까? | 1 | ○ | 다음 |
| L08 | p8 | Hash → Block → Chain | 하나를 바꾸면? | 1 |  | **chain 체험** → L09 복귀 |
| L09 | p9 | Hash → Block → Chain | 그런데 여기까지만이라면? | 1 | ○ | 다음 |
| L10 | p10 | Distributed Ledger → Consensus | 서버가 여러 대면 분산원장일까? | 1 |  | 다음 |
| L11 | p11 | Distributed Ledger → Consensus | 장부가 서로 다르면? | 1 |  | 다음 |
| L12 | p12 | Distributed Ledger → Consensus | Consensus 에는 여러 방법이 있습니다 | 1 |  | 다음 |
| L13 | p13 | Proof of Work | ‘00’ 을 먼저 찾아라 | 1 |  | **pow 체험** → L14 복귀 |
| L14 | p14 | Proof of Work | 방금 ‘어려운 수학문제’를 풀었을까? | 1 | ○ | 다음 |
| L15 | p14 | Proof of Work | 조건을 만족할 때까지 반복해서 시도한다 | 1 |  | 다음 |
| L16 | p15 | Proof of Work | 그래서 먼저 찾으면 무엇을 하나? | 1 |  | 다음 |
| L17 | p16 | Proof of Work | 제안했다고 끝이 아니다 | 1 |  | 다음 |
| L18 | p16 | Proof of Work | 제안 ≠ 인정 | 1 |  | 다음 |
| L19 | p17 | 첫 번째 노선 회수 · 환승 | 장부에 대한 믿음은 어디에서 올까? | 1 |  | 다음 |
| L20 | p18 | 첫 번째 노선 회수 · 환승 | 기록만 적어야 할까? | transfer |  | 다음 |
| L21 | p19 | Ethereum · World Computer | 컴퓨터가 하는 일을 아주 단순하게 보면 | 2 |  | 다음 |
| L22 | p20 | Ethereum · World Computer | 실습 ③ 디지털 티켓 판매기 | 2 |  | **world-computer 체험** → L23 복귀 |
| L23 | p21 | Ethereum · World Computer | 방금 무엇이 실행되었을까? | 2 | ○ | 다음 |
| L24 | p22 | Ethereum · World Computer | 한 컴퓨터에서 여러 노드로 | 2 |  | 다음 |
| L25 | p23 | Ethereum · World Computer | 그래서 World Computer | 2 |  | 다음 |
| L26 | p24 | Ethereum · World Computer | EVM 을 30 초만 들여다봅시다 | 2 |  | 다음 |
| L27 | p25 | Ethereum · World Computer | 방금 본 것이 Smart Contract 입니다 | 2 |  | 다음 |
| L28 | p26 | Ethereum · World Computer | 그렇다면 DApp 은? | 2 |  | 다음 |
| L29 | p27 | 두 개의 노선도 | 오늘 만든 두 개의 블록체인 노선도 | both |  | 다음 |
| L30 | p28 | 두 개의 노선도 | 오늘 만든 것은 하나의 직선이 아니라 서로 다른 질문에 답하는 두 개의 연결된 지하철 노선도입니다. | both |  | 강의 홈 / 처음부터 |

## 원본 페이지 ↔ 화면 대응

내용을 줄이는 대신 화면을 나눴습니다. 삭제한 콘텐츠는 없습니다.

| 원본 페이지 | 화면 |
|---:|---|
| 1 | L01 |
| 2 | L02 |
| 3 | L03 |
| 4 | L04 |
| 5 | L05 |
| 6 | L06 |
| 7 | L07 |
| 8 | L08 |
| 9 | L09 |
| 10 | L10 |
| 11 | L11 |
| 12 | L12 |
| 13 | L13 |
| 14 | L14, L15 |
| 15 | L16 |
| 16 | L17, L18 |
| 17 | L19 |
| 18 | L20 |
| 19 | L21 |
| 20 | L22 |
| 21 | L23 |
| 22 | L24 |
| 23 | L25 |
| 24 | L26 |
| 25 | L27 |
| 26 | L28 |
| 27 | L29 |
| 28 | L30 |

## 설명 구조 표현 요소

원본 PDF 의 비교·인과·공간 관계를 살리기 위한 표현들이다. 모든 것을 흰 카드로 만들지 않는다.

| helper | 쓰는 곳 | 표현하는 관계 |
|---|---|---|
| `conclusion` | 원본 하단 결론 | 결론을 작은 note 가 아니라 본문급으로 |
| `bridge`(화면 필드) | L06 · L07 · L09 · L14 | 체험 직후 `방금 한 일` 회수 |
| `recall` | L02 · L15 · L18 | 앞 화면 맥락 회수 |
| `nextHint` | L17 · L19 | 다음 화면 질문 예고 |
| `converge` | L14 | 두 갈래 → 하나의 결과 |
| `loopFlow` | L15 | 조건을 만족할 때까지 되돌아가는 반복 |
| `causalFlow` + `checkList` | L17 | 입력 → 검사 → 결과 |
| `ledgerCopies` | L18 | 같은 Block 이 각자의 장부에 |
| `routeWithRoles` | L04 · L19 | 개념을 잇는 노선 + 각 역의 역할 |
| `treeOrg` / `meshOrg` / `orgCompare` | L10 | 중앙 트리 ↔ 분산 네트워크 |
| `gather` | L06 | 흩어진 거래가 Block 안으로 |
| `branchTree` | L12 | 상위 개념 → 하위 방식 |
| `sharedNodes` | L04 · L21 | 노드들이 같은 것을 공유 |
| `changeTrail` | L08 | 변경이 어디까지 번지는가 |
| `mapCompare` | L02 | 같은 역을 실제 지도 ↔ 노선도로 두 번 그려 대비 |
| `simplifyExample` | L02 | ‘단순화란 무엇인가’를 여는 예시와 되묻는 질문 |
| `closingMessage` | L25 | 키워드 나열과 당부를 한 흐름으로 |
| `subwayMap` | L25 | 마지막 기억점 |

## 화면 크기

프로젝터를 1순위로 본다. 큰 글자는 화면 폭과 **높이**를 함께 보고(`min(vw, vh)`),
낮은 해상도에서는 여백만 줄인다. 콘텐츠는 줄이지 않는다.

| 해상도 | 25개 화면 중 세로 스크롤이 생기는 화면 |
|---|---|
| 1920×1080 | 0개 |
| 1366×768 | 0개 |
| 1280×720 | 1개 (L28, 27px) |

## 콘텐츠를 고칠 때

원본 문구는 전부 `screens.js` 안에 있습니다. 화면 컴포넌트에는 문구를 두지 않습니다.
새 화면 유형이 필요하면 `screens.js` 상단의 helper(`duo` / `chainDiagram` / `flow` 등)를 늘리고,
스타일은 `lecture.css` 에 같은 이름으로 추가합니다.
