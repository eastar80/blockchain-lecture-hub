# 블록체인 강의 허브

강의 현장에서 QR로 접속해 쓰는 인터랙티브 강의 허브입니다.
수강생이 바로 체험도구로 이동하고 강의자료를 열 수 있도록 만든 정적 사이트입니다.

## 구조

```
/
├─ index.html      강의 허브 Home
├─ shared.css      공통 디자인 토큰 (Home / Lecture / Experience 공용)
├─ home.css        Home 전용 레이아웃
├─ lecture/        강의 화면 — 최종 강의자료를 34개 화면으로 재구성
│                  presenter.html 은 강사용 제어화면(Presenter View)
├─ experience/     체험도구 — HASH → BLOCK → CHAIN → PoW
│  └─ world-computer/   Ethereum · World Computer 체험 (별도 모듈)
└─ materials/      lecture.pdf — 34화면 PDF (수강생 배포용 겸 강사 백업)
```

## 로컬에서 보기

별도 빌드가 없습니다. `index.html`을 브라우저로 열면 그대로 동작합니다.

## 배포

GitHub Pages로 `main` 브랜치 루트를 그대로 서빙합니다.
`.nojekyll`이 있어 Jekyll 처리 없이 파일이 그대로 올라갑니다.

## 메모

- 내부 링크는 모두 상대경로입니다. 도메인이나 경로가 바뀌어도 그대로 동작합니다.
- 체험 단계는 URL 해시로 직접 열 수 있습니다: `experience/index.html#block`
- 강의 화면도 같은 방식으로 직접 열 수 있습니다: `lecture/index.html#/L13`
- 강의 화면 ↔ 체험도구 왕복 규칙과 원본 대응표는 `lecture/README.md` 에 있습니다.
- 강의 허브 Home은 표지와 상단 메뉴만 담당합니다. 체험·강의 화면·강의자료로 가는 길은 상단 메뉴 하나뿐입니다.
- `lecture/qr/*.svg` 는 사전 생성한 QR이지만 현재 화면에서는 쓰지 않습니다. 다시 쓰려면 도메인 확인 후 재생성이 필요합니다.
- 검색엔진 노출을 막기 위해 `index.html`에 `noindex`가 걸려 있습니다.
  공개하려면 해당 `<meta name="robots">` 한 줄을 지우면 됩니다.
