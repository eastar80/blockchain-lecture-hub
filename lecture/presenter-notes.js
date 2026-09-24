/* ============================================================
   lecture/presenter-notes.js — 강의자용 대본 · 진행 시간

   출처: 강의 마스터 데이터(lecture-data.js) v1.0
   화면 구조(고정 ID · 번호 · 순서 · 체험 연결)는 screens.js 가 단일 출처다.
   이 파일은 그 위에 얹히는 강의자용 정보만 가진다. 고정 ID 로 연결한다.

   지금 강의 화면(lecture/index.html)은 이 파일을 불러오지 않는다.
   다음 단계의 Presenter View 가 붙을 때 그대로 쓰면 된다.

   목표 시간 합계 4575초 (약 76분) + Network Demo 120초
   ============================================================ */

const PRESENTER_NOTES = {
  'lecture-title': {
    number: 'L01',
    targetSeconds: 60,
    script: "안녕하세요. 김동규입니다.\n\n저는 한국증권금융에서 디지털혁신팀을 맡고 있고 AI와 디지털자산 관련 업무를 담당하고 있습니다.\n\n오늘은 Bitcoin 가격이나 코인 투자 이야기를 하려는 것은 아닙니다.\n오히려 제목 그대로 아주 기초적인 질문부터 시작해보려고 합니다.\n\n왜 Block이고, 왜 그것을 Chain으로 연결하고, 왜 여러 참여자가 같은 장부를 가지고 있어야 할까요?\n\n오늘 한 시간이 끝났을 때 블록체인의 모든 것을 아는 것이 목표는 아닙니다.\n대신 앞으로 Bitcoin, Ethereum, Stablecoin, STO, RWA 같은 말을 들었을 때\n“아, 이 이야기가 대략 어디에 붙는 이야기인지 알겠다.”\n정도만 되어도 충분합니다.",
    cue: "약 1분 안에 넘어간다. 이 화면에서는 체험도구나 AI 이야기를 꺼내지 않는다."
  },
  'why-me': {
    number: 'L02',
    targetSeconds: 90,
    script: "본격적으로 시작하기 전에 제가 왜 오늘 이 이야기를 드리는지 잠깐 말씀드리겠습니다.\n\n저는 블록체인을 오랫동안 연구해온 학자나 블록체인 전문 개발자는 아닙니다.\n대신 금융회사에서 이 기술을 실제 업무로 접하고 있고, 공부하다 잘 이해되지 않는 부분은 직접 만들어보면서 확인해왔습니다.\n\nHash도 직접 계산해보고, Block과 Chain도 만들어보고, 여러 개의 Node를 띄워 실제 분산원장 네트워크도 운영해봤습니다.\n\n지금 보이는 화면이 그 네트워크입니다.\n지금은 조금 복잡해 보이실 수 있습니다.\n오늘 강의가 끝날 때쯤에는 이 화면에 있는 것들이 지금보다 훨씬 많이 보이실 겁니다.\n\n저도 이 길을 처음부터 잘 알았던 것은 아닙니다.\n대신 여러분보다 조금 먼저 직접 걸어봤습니다.\n오늘은 제가 처음 공부할 때 잘 연결되지 않았던 부분을 중심으로 길을 조금 덜 헤맬 수 있는 지도 하나를 같이 만들어보겠습니다.",
    cue: "Dashboard 캡처를 5~10초 보여준다. 실제 Network Demo로 들어가지는 않는다.",
    caution: "‘전문가가 아닙니다’에 오래 머무르지 말고 현업 + 직접 구축 경험으로 빠르게 전환한다."
  },
  'simplify-first': {
    number: 'L03',
    targetSeconds: 180,
    script: "오늘은 정확성보다 먼저 이해를 선택하겠습니다.\n\n우리는 어릴 때 “물은 100℃에서 끓는다”고 배웠습니다.\n정확히 말하면 항상 그런 것은 아닙니다. 기압에 따라 달라집니다.\n\n그런데 처음부터 기압과 포화증기압까지 설명하는 것이 항상 더 좋은 입문 설명은 아닙니다.\n\n지하철 노선도도 비슷합니다.\n실제 지도와 비교하면 거리도 방향도 다르지만, 지하철을 타기 위해서는 오히려 노선도가 훨씬 편합니다.\n\n오늘도 블록체인의 위성사진을 그리기보다 먼저 지하철 노선도를 하나 만들어보겠습니다.",
    cue: "마지막에 잠시 멈춘 뒤 ‘그럼 첫 번째 질문입니다.’라고 하고 넘어간다."
  },
  'ledger-trust': {
    number: 'L04',
    targetSeconds: 210,
    script: "은행 장부에 100만원이 있다고 적혀 있는 것과 제가 노트에 200만원이 있다고 적은 것은 왜 다르게 받아들일까요?\n\n우리가 믿는 것은 숫자가 적혀 있다는 사실 자체가 아닙니다.\n공식 장부를 관리하고 책임지는 주체가 있다는 점이 중요합니다.\n\n중앙화된 시스템에서는 은행이 어떤 기록이 공식 기록인지 최종적으로 판단할 수 있습니다.",
    cue: "은행 장부와 개인 메모를 보여준 뒤 학생에게 먼저 이유를 물어본다.",
    caution: "처음부터 ‘블록체인은 중앙기관 없이 신뢰를 만든다’라고 정의하지 않는다."
  },
  'no-central-authority': {
    number: 'L05',
    targetSeconds: 120,
    script: "그렇다면 한 사람이 “이게 공식 장부입니다”라고 말할 수 없는 환경에서는 무엇이 필요할까요?\n\n기록이 바뀌지는 않았는지,\n기록을 어떻게 묶을지,\n과거와 현재를 어떻게 연결할지,\n여러 참여자가 장부를 어떻게 나눠 가질지,\n서로 다르면 무엇을 인정할지.\n\n오늘 배울 기술은 각각 따로 떨어진 용어가 아니라 이 질문에 차례로 답해가는 과정입니다.",
    cue: "A/B/C/D 참여자 → 질문 → Hash→Block→Chain→Distributed Ledger→Consensus 순으로 시선을 유도한다."
  },
  'hash-question': {
    number: 'L06',
    targetSeconds: 240,
    script: "기록이 아주 길다고 생각해보겠습니다.\n기록 중 일부가 바뀌었는지 확인하기 위해 전체를 매번 한 글자씩 비교하는 것은 번거롭습니다.\n\n여기서 Hash라는 도구를 사용해볼 수 있습니다.\nHash가 무엇인지 제가 먼저 길게 정의하지 않겠습니다.\n직접 입력값을 조금 바꿔보겠습니다.\n\n— 학생 안내 —\n오늘 중간중간 간단한 체험이 있습니다.\nQR은 지금 한 번만 찍으시면 됩니다.\n들어가시면 오늘 사용할 체험들을 자유롭게 이동할 수 있습니다.\n\n모든 체험을 꼭 따라 하실 필요는 없습니다. 궁금한 것은 직접 해보셔도 됩니다.\n다만 조금 뒤 PoW 체험은 모두 같이 한번 해보겠습니다.\n\n체험 후에는 이렇게 보겠습니다.\n입력은 거의 바뀌지 않았는데 결과는 완전히 달라졌습니다.\n오늘은 Hash를 ‘데이터의 디지털 지문’ 정도로 이해하겠습니다.",
    cue: "QR 은 오늘 여기 한 번만 보여준다. 학생이 접속하면 그 페이지를 강의 끝까지 열어두게 한다.\nL07 · L09 · L14 · L23 에서는 QR 을 다시 띄우지 않는다.",
    caution: "Hash를 ‘암호화해서 데이터를 숨기는 것’이라고 설명하지 않는다."
  },
  'block': {
    number: 'L07',
    targetSeconds: 150,
    script: "방금 확인한 것은 데이터가 바뀌면 Hash도 달라진다는 점이었습니다.\n\n그런데 거래는 한 건만 생기지 않습니다.\n계속 발생하는 여러 기록을 일정한 단위로 묶어서 다루면 어떨까요?\n\n여러 기록을 하나의 묶음으로 만든 것이 Block입니다.\n그리고 그 묶음 전체에 하나의 Hash를 만들 수 있습니다.",
    cue: "흩어진 거래들이 하나의 Block 안으로 들어가는 구조를 보여준다.\nBlock 체험은 강사가 프로젝터에서 시연한다. 학생 참여를 기다리지 않는다.\n원하는 학생은 아까 접속한 체험 페이지에서 BLOCK 을 눌러 따라볼 수 있다."
  },
  'chain': {
    number: 'L08',
    targetSeconds: 150,
    script: "방금 여러 거래를 하나의 Block으로 묶었습니다.\n이제 Block과 Block을 연결해보겠습니다.\n\n다음 Block이 이전 Block의 Hash를 기억하도록 합니다.\n그러면 각각 독립된 상자가 아니라 앞뒤 관계를 가진 기록이 됩니다.\n\n이 연결 때문에 Block들이 Chain을 이룹니다.",
    cue: "Block Hash와 다음 Block의 Previous Hash가 같은 값을 가리키는 점을 강조한다."
  },
  'tamper': {
    number: 'L09',
    targetSeconds: 180,
    script: "그럼 과거 Block 안의 기록 하나를 바꾸면 어떻게 될까요?\n\n거래가 바뀌면 Block Hash가 바뀝니다.\n그런데 다음 Block은 여전히 예전 Hash를 Previous Hash로 기억하고 있습니다.\n그래서 연결이 맞지 않게 됩니다.\n\n중요한 표현은 이것입니다.\n\n바꿀 수 없는 것이 아니라,\n바꾸면 연결이 깨집니다.",
    cue: "거래 변경 → Hash 변경 → 다음 Block Previous Hash mismatch를 한 흐름으로 보여준다.\nChain 체험도 강사 시연 중심이다. 학생 참여를 기다리지 않는다.",
    caution: "‘블록체인은 절대 수정할 수 없다’라고 단정하지 않는다."
  },
  'centralized-chain': {
    number: 'L10',
    targetSeconds: 90,
    script: "방금 확인한 것은 과거 기록을 바꾸면 뒤의 연결이 깨진다는 점입니다.\n\n그런데 여기서 중요한 반전이 하나 있습니다.\nHash, Block, Chain 자체는 은행 서버 안에서도 만들 수 있습니다.\n\n그렇다면 블록체인과 기존 중앙 시스템의 핵심 차이는 어디에 있을까요?\n\n다시 질문해보겠습니다.\n누가 이 장부를 가지고,\n누가 공식 기록을 결정할까요?",
    cue: "Chain이 은행 서버 안으로 들어가는 그림을 보여준다."
  },
  'distributed-vs-servers': {
    number: 'L11',
    targetSeconds: 210,
    script: "은행이 서울, 부산, 제주에 서버를 100대 가지고 있다고 해도 공식 장부를 결정하는 주체는 여전히 은행입니다.\n\n분산원장에서 중요한 질문은 서버가 어디에 몇 대 있느냐보다\n누가 장부를 가지고,\n누가 검증하고,\n무엇을 유효한 기록으로 인정하는가입니다.\n\n서버가 어디에 있는가와 누가 장부를 결정하는가는 다른 문제입니다.",
    cue: "좌측 중앙 관리자→여러 서버 트리, 우측 여러 기관 네트워크를 비교한다."
  },
  'consensus-question': {
    number: 'L12',
    targetSeconds: 150,
    script: "여러 참여자가 장부를 가지고 있다면 새로운 문제가 생깁니다.\n\nA의 장부에는 철수→영희 1만원,\nB의 장부에는 철수→영희 2만원이라고 적혀 있다면 어느 것이 맞을까요?\n\n은행이 있다면 공식 장부를 확인하면 됩니다.\n하지만 한 참여자가 혼자 정답을 선언하지 않는다면,\n무엇을 진짜 기록이라고 인정할지 공통된 규칙이 필요합니다.\n\n이 문제가 Consensus입니다.",
    cue: "질문을 던진 뒤 잠시 기다리고 Consensus를 공개한다.",
    caution: "Consensus를 단순히 ‘다수결’이라고 정의하지 않는다."
  },
  'consensus-methods': {
    number: 'L13',
    targetSeconds: 120,
    script: "Consensus에는 여러 방법이 있습니다.\nBitcoin은 Proof of Work를 사용하고, Ethereum은 현재 Proof of Stake를 사용합니다.\n\n오늘 모든 합의 방식을 배우지는 않겠습니다.\n\n그런데 Bitcoin 채굴을 설명할 때\n“컴퓨터가 어려운 수학문제를 푼다.”\n라는 말을 많이 들어보셨을 겁니다.\n\n그런데 대체 무슨 문제를 푼다는 걸까요?",
    cue: "마지막 질문 뒤 2초 정도 기다린 후 L14로 이동한다.",
    caution: "Consensus = PoW처럼 들리지 않도록 상위 개념과 하위 방식을 구조적으로 보여준다."
  },
  'pow-challenge': {
    number: 'L14',
    targetSeconds: 240,
    script: "그 느낌을 직접 한번 확인해보겠습니다.\n\n아까 접속해두신 체험 화면에서 PoW 를 눌러주세요.\n이번에는 다 같이 해보겠습니다.\n\n숫자를 바꿔가면서 Hash 앞 자리가 조건에 맞는 값을 찾아보세요.\n먼저 찾은 분은 손을 들어주시면 됩니다.\n\n너무 금방 찾으시면 조건을 00 으로 올려서 한 번 더 해보겠습니다.",
    cue: "여기서는 강의를 잠시 멈추고 모두 함께 한다.\nQR 을 다시 띄우지 않는다 — “아까 접속해둔 화면에서 PoW 를 눌러주세요.”\n난이도 0 으로 시작해 Nonce 를 직접 입력하게 하고, 너무 빨리 찾으면 00 으로 올린다.",
    caution: "아직 PoW의 의미를 미리 설명하지 않는다."
  },
  'pow-interpret': {
    number: 'L15',
    targetSeconds: 180,
    script: "방금 어려운 수학 공식을 푸셨나요?\n그렇지는 않았습니다.\n\n우리가 한 것은 숫자를 바꾸고, Hash를 계산하고, 조건에 맞는지 확인하고, 아니면 다시 시도하는 일이었습니다.\n\n즉 어려운 방정식을 푼다기보다\n조건을 만족하는 값이 나올 때까지 반복 계산하는 것에 가깝습니다.\n\n그러면 컴퓨터가 초당 10번 계산하는 것과 초당 100만 번 계산하는 것은 차이가 있겠죠.\n누가 조건을 먼저 만족할 가능성이 높을까요?",
    cue: "체험 직후 ‘숫자 변경 → Hash 계산 → 조건 확인 → 반복’ 흐름을 먼저 회수한다."
  },
  'pow-repeat': {
    number: 'L16',
    targetSeconds: 120,
    script: "컴퓨팅 파워가 중요한 이유는 복잡한 공식을 더 잘 푸는 힘이라기보다 더 많은 후보를 더 빠르게 반복 계산할 수 있기 때문입니다.\n\n숫자 변경,\nHash 계산,\n조건 확인,\n실패하면 다시 숫자 변경.\n\n이 과정을 조건을 만족할 때까지 반복합니다.\n\n실제 Bitcoin에서는 00의 개수를 세는 것이 아니라 Hash가 Target보다 작은지를 판단합니다.",
    cue: "L15의 초당 계산 횟수 비교를 화면 상단에서 작게 회수한 뒤 반복 루프를 보여준다.",
    caution: "00 prefix는 교육용 단순화임을 짧게 보정한다."
  },
  'pow-proposal': {
    number: 'L17',
    targetSeconds: 150,
    script: "그럼 조건을 먼저 만족한 사람은 무엇을 할까요?\n\n마음대로 장부를 확정하는 것이 아닙니다.\n다음 Block을 제안할 기회와 연결됩니다.\n\n“이 Block을 다음 Block으로 제안합니다.”\n\n이 표현이 중요합니다.\n결정이 아니라 제안입니다.",
    cue: "성공한 참여자 B가 NEW BLOCK을 들고 제안하는 흐름을 보여준다.",
    caution: "‘승자가 다음 Block을 결정한다’고 표현하지 않는다."
  },
  'pow-verification': {
    number: 'L18',
    targetSeconds: 150,
    script: "B가 Block을 제안했다고 끝이 아닙니다.\n\n다른 Node들이 그 Block을 확인합니다.\n\n거래가 규칙에 맞는가,\nPrevious Hash가 맞는가,\nPoW 조건을 만족했는가.\n\n즉 먼저 찾았다고 마음대로 장부를 쓸 수는 없습니다.",
    cue: "후보 Block → A/C/D 검증 → 공통 규칙 흐름으로 보여준다."
  },
  'pow-ledger-commit': {
    number: 'L19',
    targetSeconds: 150,
    script: "검증을 통과하면 여러 참여자의 장부에 같은 Block이 반영됩니다.\n\n그래서 핵심 흐름은\n제안 → 검증 → 장부 반영입니다.\n\n아까 00을 찾을 때는 왜 이런 일을 하는지 잘 모르셨을 겁니다.\n그런데 Block 제안과 검증까지 연결하고 나니 아까 했던 행동의 의미가 뒤늦게 보이기 시작합니다.",
    cue: "A/B/C/D 각 장부에 같은 Block이 추가되는 것을 시각적으로 보여준다.",
    caution: "PoW 자체를 Consensus 전체와 동일시하지 않는다."
  },
  'ledger-line-recap': {
    number: 'L20',
    targetSeconds: 180,
    script: "이제 처음 질문으로 다시 돌아가보겠습니다.\n\n중앙화된 장부에서는 관리주체에 대한 신뢰가 중요한 역할을 했습니다.\n\n분산원장에서는 Hash, Block, Chain, 여러 참여자의 장부, Consensus,\n그리고 Bitcoin의 경우 PoW 같은 메커니즘이 서로 연결되어 장부를 이어갑니다.\n\n여기까지가 첫 번째 노선입니다.\n\n그런데 이 장부에는 송금 기록만 적어야 할까요?",
    cue: "Hash→Block→Chain→Distributed Ledger→Consensus→PoW 노선을 왼쪽에서 오른쪽으로 천천히 가리킨다."
  },
  'ethereum-transition': {
    number: 'L21',
    targetSeconds: 60,
    script: "지금까지 우리는 블록체인을 공유된 장부라는 관점으로 봤습니다.\n\n그런데 그 공유된 시스템 위에서 기록만 저장하는 것이 아니라 프로그램을 실행할 수도 있다면 어떨까요?\n\n여기서 관점을 조금 바꿔보겠습니다.\n\nShared Ledger에서 Shared State로.",
    cue: "질문 자체를 크게 보여주고 다음 화면으로 빠르게 연결한다.",
    caution: "Bitcoin vs Ethereum을 ‘기록 vs 계산’처럼 이분법적으로 설명하지 않는다."
  },
  'state-model': {
    number: 'L22',
    targetSeconds: 120,
    script: "컴퓨터가 하는 일을 오늘 아주 단순하게 보면\n현재 State가 있고,\nInput이 들어오고,\nProgram이 실행되고,\n그 결과 새로운 State가 만들어집니다.\n\nState는 어렵게 생각하지 마시고\n‘지금 시스템이 기억하고 있는 현재 상태’라고 생각하시면 됩니다.\n\n예를 들어 티켓이 두 장 남아 있고 가격이 1,000원이라면 이것도 State입니다.",
    cue: "Current State → Input → Program → New State 순서대로 보여준다."
  },
  'state-experience': {
    number: 'L23',
    targetSeconds: 240,
    script: "지금 본 State + Input → Program → New State 구조를 실제로 한번 실행해보겠습니다.\n\n가격이 1,000원이고 티켓이 두 장 남아 있습니다.\n\n500원을 넣었을 때,\n1,000원을 넣었을 때,\n그리고 티켓이 다 팔린 뒤 다시 1,000원을 넣었을 때\n결과가 어떻게 달라지는지만 관찰해보세요.",
    cue: "buy(500) → buy(1000) → buy(1000) → buy(1000) 순서를 안내한다.\n강사가 프로젝터에서 시연한다. 원하는 학생은 체험 페이지에서 STATE 를 눌러 따라볼 수 있다.",
    caution: "체험의 목적은 ‘먼저 해보기’가 아니라 State Transition 구조 확인이다."
  },
  'state-interpret': {
    number: 'L24',
    targetSeconds: 120,
    script: "방금 우리는 장부에 “티켓을 샀다”는 기록 한 줄만 추가한 것이 아닙니다.\n\nInput이 들어왔고,\nProgram이 현재 State를 읽었고,\n조건을 확인했고,\n조건을 만족했을 때 State가 바뀌었습니다.\n\n그리고 같은 buy(1000)이더라도 현재 State가 다르면 결과가 달라질 수 있었습니다.\n\n이것이 State Transition입니다.",
    cue: "Input → Program 조건 확인 → State Transition 순으로 체험을 해석한다."
  },
  'multi-node-execution': {
    number: 'L25',
    targetSeconds: 120,
    script: "그런데 방금 체험은 제 컴퓨터 한 대에서 실행한 프로그램일 뿐입니다.\n이게 왜 Ethereum일까요?\n\nEthereum에서는 네트워크가 이어갈 Block이 정해지고,\n그 Block 안에는 실행할 Transaction과 순서가 들어 있습니다.\n\n실행 Node들은 같은 규칙으로 그 Transaction들을 실행하고 검증합니다.\n그래서 같은 유효한 Chain을 따라가는 Node들은 같은 State Transition을 재구성할 수 있습니다.",
    cue: "Consensus → Transaction 순서 → 여러 Node의 동일 규칙 실행 → 같은 State Transition 흐름을 보여준다.",
    caution: "‘Node들이 State 값을 직접 합의한다’고 말하지 않는다."
  },
  'world-computer': {
    number: 'L26',
    targetSeconds: 120,
    script: "Program이 있고,\nInput을 받고,\n실제로 실행해서 State를 바꾸고,\n여러 Node가 그 결과를 공통된 규칙으로 검증합니다.\n\n그래서 Ethereum을 World Computer라고 표현합니다.\n\n물론 전 세계 컴퓨터가 하나의 거대한 CPU처럼 병렬 계산한다는 뜻은 아닙니다.\n\n오늘은\n프로그램과 State를 여러 참여자가 공통된 규칙으로 검증하며 이어가는\n프로그래밍 가능한 분산 상태 시스템\n정도로 이해하겠습니다.",
    cue: "여기까지가 Ethereum 핵심 개념 설명이다. 이후에는 새 개념을 깊게 확장하지 않는다.",
    caution: "‘모든 노드가 언제나 모든 프로그램을 똑같이 실행한다’는 식의 과도한 단순화는 피한다."
  },
  'smart-contract-name': {
    number: 'L27',
    targetSeconds: 60,
    script: "이제 새로운 개념을 하나 더 배우는 것이 아닙니다.\n\n아까부터 우리가 직접 실행해왔던 프로그램을 다시 보겠습니다.\n결제금액을 확인했고,\n남은 티켓을 확인했고,\n조건을 만족하면 State를 바꿨습니다.\n\n먼저 실행해봤고 State가 어떻게 달라지는지도 확인했습니다.\n\n이제 우리가 방금 했던 것에 이름을 붙이는 겁니다.\n\nEthereum 위에서 실행되는 이런 프로그램을 Smart Contract라고 부릅니다.\nSmart Contract는 방금 우리가 실행했던 바로 그 프로그램입니다.",
    cue: "티켓 판매 규칙을 다시 보여준 뒤 Smart Contract 라벨을 공개한다."
  },
  'dapp-reveal': {
    number: 'L28',
    targetSeconds: 60,
    script: "그렇다면 사용자는 이런 Smart Contract를 어떻게 이용할까요?\n\n우리가 프로그램 코드를 직접 입력하면서 사용하는 것은 아닙니다.\n아까 여러분이 사용했던 티켓 판매기처럼 화면이나 애플리케이션을 통해 이용합니다.\n\n사용자가 Smart Contract 같은 블록체인 기능과 상호작용할 수 있게 만든 애플리케이션을 DApp이라고 부릅니다.\n\n오늘만 놓고 아주 단순하게 보면,\n여러분이 본 티켓 판매 화면은 DApp,\n그 뒤에서 실행된 프로그램은 Smart Contract라고 생각하셔도 됩니다.",
    cue: "사용자 → DApp → Smart Contract → Ethereum의 흐름을 단순하게 보여준다.",
    caution: "Wallet, Gas, 서명으로 확장하지 않는다. DApp의 모든 로직이 Smart Contract 안에만 있다는 인상도 피한다."
  },
  'evm-boundary': {
    number: 'L29',
    targetSeconds: 60,
    script: "여기까지 오니까 Ethereum 안쪽에 EVM이라는 용어가 하나 보입니다.\nEthereum Virtual Machine입니다.\n\n사실 이게 무엇인지 제대로 설명하기 시작하면 프로그램이 내부에서 어떤 형태로 바뀌는지,\n명령이 어떻게 실행되는지,\n메모리와 저장공간은 어떻게 다른지,\nGas는 왜 필요한지 같은 이야기로 들어가야 합니다.\n\n여기부터는 오늘 우리가 만들려고 했던 지하철 노선도를 조금 벗어나기 시작합니다.\n\n쉽게 설명하겠다고 여기까지 왔는데 어느새 역 내부의 배선도까지 들여다볼 지점에 온 셈입니다.\n그래서 오늘은 여기서 멈추겠습니다.\n\n앞으로 EVM이라는 말을 만나시면\n“Smart Contract가 실제로 실행되는 Ethereum의 조금 더 안쪽 구조에 관한 이야기구나.”\n정도만 기억해두시면 충분합니다.\n\n오늘 우리의 목적은 역 내부를 뜯어보는 것이 아니라 전체 노선이 어떻게 연결되는지를 보는 것이었습니다.\n이제 마지막으로 그 노선도를 한번 보겠습니다.",
    cue: "EVM을 설명하려 하지 않는다. 30초~1분 이내로 끝내고 바로 전체 노선도로 돌아간다.",
    caution: "Opcode, PUSH/ADD, Stack, Bytecode, Memory/Storage, Gas 구조 등의 심화 설명으로 들어가지 않는다."
  },
  'two-lines-map': {
    number: 'L30',
    targetSeconds: 120,
    script: "오늘 만든 지도를 한번 보겠습니다.\n\n첫 번째 노선의 질문은\n“여러 참여자가 어떻게 믿을 수 있는 장부를 만들고 이어갈까?”\n였습니다.\n\nHash에서 시작해 Block, Chain, Distributed Ledger, Consensus로 이어졌고,\nBitcoin에서는 PoW도 살펴봤습니다.\n\n두 번째 노선의 질문은\n“그 공유된 시스템에서 프로그램까지 실행할 수 있다면?”\n이었습니다.\n\nState가 있고, Input이 들어오고, Program이 실행되고, State가 바뀌었습니다.\n여러 Node가 공통된 규칙으로 그 결과를 검증했습니다.\n\n우리는 그것을 World Computer라는 관점에서 봤고,\n직접 실행했던 Program에는 Smart Contract라는 이름을 붙였습니다.\n그 Smart Contract를 사용하는 화면과 애플리케이션을 DApp이라고 불렀습니다.\n\n그리고 EVM이라는 더 안쪽 영역의 입구까지만 잠깐 보고 돌아왔습니다.",
    cue: "LINE 1 → TRANSFER → LINE 2 순서로 설명한다.",
    caution: "PoW→State→Ethereum 같은 기술 발전 순서처럼 보이지 않게 한다."
  },
  'blockchain-close': {
    number: 'L31',
    targetSeconds: 90,
    script: "오늘 만든 지도는 실제 블록체인의 모든 것을 담은 지도가 아닙니다.\n하지만 처음 길을 찾기 위한 지도는 될 수 있습니다.\n\n앞으로 Bitcoin, Ethereum, Stablecoin, NFT, STO, RWA, DeFi, CBDC, Web3 같은 새로운 개념을 만나면\n\n“이건 어느 노선의 어떤 질문에 답하는 이야기일까?”\n\n라고 생각해보시면 좋겠습니다.\n\n중요한 것은 기술의 순서를 외우는 것이 아니라\n각각이 어떤 질문에 답하기 위해 등장했는지를 이해하는 것입니다.\n\n여기까지가 오늘 준비한 블록체인 이야기입니다.",
    cue: "마지막 문장 후 잠시 멈춘 뒤 에필로그로 톤을 전환한다."
  },
  'learning-to-building': {
    number: 'L32',
    targetSeconds: 150,
    script: "마지막으로 잠깐만 블록체인 자체가 아니라 오늘 우리가 이것을 배웠던 방법에 대해 말씀드리겠습니다.\n\n오늘 모든 내용을 똑같은 방식으로 배우지는 않았습니다.\n어떤 것은 설명을 먼저 듣고 확인했고,\n어떤 것은 질문부터 시작했고,\n어떤 것은 직접 해본 뒤에 의미를 붙였습니다.\n\n새로운 기술을 공부할 때도 비슷하다고 생각합니다.\n어떤 것은 먼저 알아둬야 하고,\n어떤 것은 직접 해봐야 보입니다.\n\n이해와 실행 사이를 오가면서 조금씩 더 정확하게 알게 됩니다.\n\n그리고 사실 오늘 사용하신 체험도구도 제가 AI와 함께 만들었습니다.\n\n제가 AI 이야기를 드리는 이유는\n“모든 걸 모르더라도 무조건 만들어보세요.”\n라는 뜻은 아닙니다.\n\n제가 느끼는 가장 큰 변화는 공부와 실행 사이를 왕복하는 비용이 굉장히 낮아졌다는 것입니다.\n\n궁금하면 물어보고,\n조금 이해하면 해보고,\n막히면 다시 물어보고,\n공부하고,\n고치고,\n다시 실행할 수 있습니다.\n\n그래서 저는 AI를 공부를 다 끝낸 다음 사용하는 도구라기보다\n공부와 실행을 빠르게 오갈 수 있게 해주는 도구라고 느끼고 있습니다.",
    cue: "Hash/Block/Chain/PoW/State 체험 화면 일부를 작게 회수해 보여준다.",
    caution: "‘일단 만들고 보자’는 메시지로 들리지 않도록 이해와 실행의 왕복을 강조한다."
  },
  'real-network': {
    number: 'L33',
    targetSeconds: 90,
    script: "그래서 저도 공부하면서 조금 더 큰 것을 하나 만들어봤습니다.\n\n강의 처음에 잠깐 보여드렸던 화면입니다.\n\n처음보다...\n뭐가 좀 보이시나요?\n\nNode가 있고,\nBlock이 계속 만들어지고,\nTransaction이 들어오고,\nValidator들이 네트워크를 유지하고 있습니다.\n\n오늘 따로 배웠던 개념들이 실제 하나의 시스템 안에서 움직이고 있습니다.",
    cue: "질문 후 2~3초 기다린다. 필요하면 Presenter의 [실제 Network 보기] 버튼으로 Demo Mode에 들어간다."
  },
  'closing': {
    number: 'L34',
    targetSeconds: 45,
    script: "제가 마지막으로 드리고 싶은 이야기는 하나입니다.\n\n새로운 분야를 만났을 때\n“이걸 완전히 이해하고 나서 시작해야지.”\n라고 너무 오래 기다리지는 않으셨으면 좋겠습니다.\n\n그렇다고 아무것도 모르면서 무조건 시작하라는 뜻도 아닙니다.\n\n배우고,\n해보고,\n다시 배우면 됩니다.\n\n지금은 그 과정을 예전보다 훨씬 쉽게 반복할 수 있습니다.\n그리고 그 과정을 같이할 수 있는 AI도 생겼습니다.",
    cue: "마지막 문장 뒤 2초 정도 멈추고 종료한다."
  }
};

/* Network Demo — 번호가 붙은 강의 화면이 아니라 Presenter 의 모드다.
   real-network(L33)에서 들어가고 끝나면 closing(L34)으로 돌아온다.
   실제 주소는 screens.js 의 real-network 화면 demo.url 에 있다. */
const PRESENTER_MODES = {
  'network-demo': {
    title: "Network Demo",
    from: 'real-network',
    returnTo: 'closing',
    targetSeconds: 120,
    script: "1. Node\n“먼저 Node입니다. 지금 네 개의 Node가 같은 네트워크에 참여하고 있습니다.”\n\n2. Block\n“그리고 Block이 계속 만들어지고 있습니다.”\n\n3. Block Height\n“이 숫자가 현재 Chain이 어디까지 이어졌는지를 보여줍니다.”\n\n4. Transaction\n“Transaction이 들어오면 Block에 포함됩니다.”\n\n5. Validator\n“이 네트워크에서는 Validator들이 Block 생성과 검증 과정에 참여합니다.”\n\n6. 회수\n“강의 앞부분에서는 따로따로 배웠는데 실제 시스템에서는 이 요소들이 이렇게 같이 움직입니다.”",
    cue: "최대 2분. Demo 종료 후 closing으로 복귀한다.",
    caution: "RP 업무, Token, DvP, Smart Contract 코드, 서버/Cloud 구조로 확장하지 않는다."
  }
};
