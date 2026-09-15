# Ethereum · World Computer 체험도구

LECTURE-06-02 설계안에 따라 만든 정적 HTML/CSS/JavaScript 체험도구입니다.
강의 화면(`lecture/`)의 L22 에서 진입하고 L23 으로 복귀합니다.

## 실행

`index.html`을 브라우저에서 열면 동작합니다. 별도 서버나 패키지 설치가 필요 없습니다.

## 파일

- `index.html` — 화면 구조
- `styles.css` — 기존 블록체인 체험도구의 색상·카드·Radius·Shadow를 계승한 스타일
- `app.js` — 4회 Guided Sequence, 클릭형 단계 진행, 조건 검사, State Transition, Aha Moment, Node Bridge

## Guided Sequence

1. `buy(500)` → 결제금액 조건 실패 → State 변화 없음
2. `buy(1000)` → 성공 → 티켓 2→1 / 판매량 0→1
3. `buy(1000)` → 성공 → 티켓 1→0 / 판매량 1→2
4. `buy(1000)` → 재고 조건 실패 → State 변화 없음

교육 흐름이 깨지지 않도록 각 단계에서 기준 입력값을 사용해야 다음 실행이 진행됩니다. 입력창과 Quick Chip을 모두 제공하여 학생은 값을 선택/입력한 뒤 `buy(...) 실행`을 누릅니다.

`buy(...) 실행` 이후에는 자동으로 결과까지 넘어가지 않습니다. `Input 전송 → 가격 조건 확인 → 재고 조건 확인 → State 변화/결과`를 **다음 버튼을 눌러 한 단계씩 진행**합니다. 첫 번째 조건에서 실패하면 재고 조건은 건너뛰고 결과 확인으로 이동합니다. 각 결과 화면에서도 다음 실행으로 넘어가기 전에 한 번 멈춥니다.

## 강의 화면과의 왕복

Hash / Block / Chain / PoW 체험과 같은 규약을 씁니다. 복귀 주소를 통째로 받지 않고
**강의 화면 ID 만** 받습니다. 임의 URL 이 들어와도 다른 곳으로 보내지 않기 위해서입니다.

```text
experience/world-computer/index.html?from=L22&return=L23
```

| parameter | 뜻 | 연결된 버튼 |
|---|---|---|
| `from` | 체험 직전 강의 화면 | `강의로 돌아가기` |
| `return` | 체험 후 이어서 볼 화면 | `강의에서 계속 보기` |

- 허용 값은 `L01` ~ `L30` 뿐입니다. 그 밖의 값(전체 URL 포함)은 무시합니다.
- `return` 이 없으면 강의를 거치지 않고 직접 들어온 것으로 보고 두 복귀 버튼을 감춥니다.
- `from` 이 없으면 `return` 바로 앞 화면으로 보정합니다.
- 화면이 늘어나면 `app.js` 의 `LECTURE_SCREEN_COUNT` 한 값만 맞추면 됩니다.

강의에서의 자리는 다음과 같습니다.

```text
L22 실습 ③ 디지털 티켓 판매기   ← 체험 진입
  ↓
[ 이 체험도구 ]
  ↓
L23 방금 무엇이 실행되었을까?   ← 체험 복귀
```

체험 후에는 진입 화면(L22)이 아니라 **해석 화면(L23)** 으로 돌아갑니다.

## 구현 범위에서 의도적으로 제외한 것

- 실제 Ethereum RPC
- Wallet / MetaMask 연결
- 실제 Transaction
- Gas / Address / Transaction Hash
- Solidity / 실제 Smart Contract 배포
- Validator / PoS / Consensus Simulation
- EVM Opcode

이번 도구의 목적은 `Input → Program → State Read → Condition → State Transition` 체험에 집중하는 것입니다.
