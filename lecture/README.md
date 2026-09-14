# 강의 화면 (lecture/)

원본 `materials/lecture.pdf` 21페이지를 강의 진행용 **25개 HTML 화면**으로 재구성한 화면입니다.
PDF 복사본이 아니라 실제 강의를 진행하는 화면이며, 체험도구와 한 번의 조작으로 왕복합니다.

## 파일

```
lecture/
├─ index.html    화면 셸 (진행 표시기 / 본문 / 하단 Navigation / 목차)
├─ screens.js    25개 화면 콘텐츠 — 원본 문구의 단일 출처
├─ lecture.css   강의 화면 전용 레이아웃 (토큰은 ../shared.css 재사용)
├─ app.js        Router / Renderer / Navigation
└─ qr/           체험 진입 화면에 띄우는 QR (사전 생성한 SVG)
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

`lecture/qr/*.svg` 는 위 URL 을 그대로 담은 QR 입니다. 배포 도메인이 바뀌면 다시 만들어야 합니다.

## 조작

| 입력 | 동작 |
|---|---|
| `→` / `Space` | 다음 화면 |
| `←` | 이전 화면 |
| `Esc` | 목차 열기 / 닫기 |

입력 폼 위에서는 단축키가 동작하지 않습니다. 체험도구에는 강의 단축키를 두지 않습니다.

## 화면 목록

| 화면 | 원본 | Section | 제목 | 유형 | Bridge | 주요 Action |
|---|---:|---|---|---|:-:|---|
| L01 | p1 | 도입 | 블록체인은 왜 ‘블록체인’일까? | title |  | 다음 |
| L02 | p2 | 도입 | 오늘은 조금 단순하게 설명하겠습니다 | concept |  | 다음 |
| L03 | p3 | 장부에 대한 믿음 | 장부에 대한 믿음은 어디에서 오는가? | question |  | 다음 |
| L04 | p4 | 장부에 대한 믿음 | “이게 공식 장부입니다”라고 한 사람이 말할 수 없다면? | concept |  | 다음 |
| L05 | p5 | Hash → Block → Chain | Hash — 기록의 지문 | experience-entry |  | **hash 체험** → L06 복귀 |
| L06 | p6 | Hash → Block → Chain | 왜 Block 일까? | experience-entry | ○ | **block 체험** → L07 복귀 |
| L07 | p7 | Hash → Block → Chain | 왜 Chain 일까? | concept | ○ | 다음 |
| L08 | p8 | Hash → Block → Chain | 하나를 바꾸면? | experience-entry |  | **chain 체험** → L09 복귀 |
| L09 | p9 | Hash → Block → Chain | 그런데 여기까지만이라면? | question | ○ | 다음 |
| L10 | p10 | Distributed Ledger → Consensus | 서버가 여러 대면 분산원장일까? | concept |  | 다음 |
| L11 | p11 | Distributed Ledger → Consensus | 장부가 서로 다르면? | question |  | 다음 |
| L12 | p12 | Distributed Ledger → Consensus | Consensus 에는 여러 방법이 있습니다 | concept |  | **PoW 체험 시작** → L13 |
| L13 | p13 | Proof of Work | ‘00’ 을 먼저 찾아라 | experience-entry |  | **pow 체험** → L14 복귀 |
| L14 | p14 | Proof of Work | 방금 ‘어려운 수학문제’를 풀었을까? | concept | ○ | 다음 |
| L15 | p14 | Proof of Work | 조건을 만족할 때까지 반복해서 시도한다 | concept |  | 다음 |
| L16 | p15 | Proof of Work | 그래서 먼저 찾으면 무엇을 하나? | concept |  | 다음 |
| L17 | p16 | Proof of Work | 제안했다고 끝이 아니다 | concept |  | 다음 |
| L18 | p16 | Proof of Work | 제안 ≠ 인정 | concept |  | 다음 |
| L19 | p17 | Ethereum → Smart Contract → DApp | 장부에 대한 믿음은 어디에서 올까? | summary |  | 다음 |
| L20 | p17 | Ethereum → Smart Contract → DApp | “이 장부에는 송금 기록만 적어야 할까?” | question |  | 다음 |
| L21 | p18 | Ethereum → Smart Contract → DApp | Ethereum 은 왜 World Computer 라고 할까? | concept |  | 다음 |
| L22 | p19 | Ethereum → Smart Contract → DApp | Smart Contract 와 DApp | concept |  | 다음 |
| L23 | p20 | 정리 | 오늘 만든 블록체인 노선도 ① | summary |  | 다음 |
| L24 | p20 | 정리 | 오늘 만든 블록체인 노선도 ② | summary |  | 다음 |
| L25 | p21 | 정리 | 오늘 만든 것은 블록체인의 ‘지하철 노선도’입니다. | summary |  | 강의 홈 / 처음부터 |

## 원본 페이지 ↔ 화면 대응

내용을 줄이는 대신 화면을 나눴습니다. 삭제한 콘텐츠는 없습니다.

| 원본 페이지 | 화면 | 처리 |
|---:|---|---|
| 1 | L01 | 유지 |
| 2 | L02 | 유지 |
| 3 | L03 | 유지 |
| 4 | L04 | 유지 |
| 5 | L05 | 유지 |
| 6 | L06 | 유지 |
| 7 | L07 | 유지 |
| 8 | L08 | 유지 |
| 9 | L09 | 유지 |
| 10 | L10 | 유지 |
| 11 | L11 | 유지 |
| 12 | L12 | 유지 |
| 13 | L13 | 유지 |
| 14 | L14, L15 | 2화면 분할 |
| 15 | L16 | 유지 |
| 16 | L17, L18 | 2화면 분할 |
| 17 | L19, L20 | 2화면 분할 |
| 18 | L21 | 유지 |
| 19 | L22 | 유지 |
| 20 | L23, L24 | 2화면 분할 |
| 21 | L25 | 유지 |

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
| `subwayMap` | L25 | 마지막 기억점 |

## 화면 크기

프로젝터를 1순위로 본다. 큰 글자는 화면 폭과 **높이**를 함께 보고(`min(vw, vh)`),
낮은 해상도에서는 여백만 줄인다. 콘텐츠는 줄이지 않는다.

| 해상도 | 25개 화면 중 세로 스크롤이 생기는 화면 |
|---|---|
| 1920×1080 | 0개 |
| 1366×768 | 0개 |
| 1280×720 | 3개 (L04 · L06 · L14, 최대 34px) |

## 콘텐츠를 고칠 때

원본 문구는 전부 `screens.js` 안에 있습니다. 화면 컴포넌트에는 문구를 두지 않습니다.
새 화면 유형이 필요하면 `screens.js` 상단의 helper(`duo` / `chainDiagram` / `flow` 등)를 늘리고,
스타일은 `lecture.css` 에 같은 이름으로 추가합니다.
