# 블록체인 강의 허브

강의 현장에서 QR로 접속해 쓰는 인터랙티브 강의 허브입니다.
수강생이 바로 체험도구로 이동하고 강의자료를 열 수 있도록 만든 정적 사이트입니다.

## 구조

```
/
├─ index.html      강의 허브 Home
├─ shared.css      공통 디자인 토큰 (Home / Experience 공용)
├─ home.css        Home 전용 레이아웃
├─ experience/     체험도구 — HASH → BLOCK → CHAIN → PoW
└─ materials/      강의자료 PDF
```

## 로컬에서 보기

별도 빌드가 없습니다. `index.html`을 브라우저로 열면 그대로 동작합니다.

## 배포

GitHub Pages로 `main` 브랜치 루트를 그대로 서빙합니다.
`.nojekyll`이 있어 Jekyll 처리 없이 파일이 그대로 올라갑니다.

## 메모

- 내부 링크는 모두 상대경로입니다. 도메인이나 경로가 바뀌어도 그대로 동작합니다.
- 체험 단계는 URL 해시로 직접 열 수 있습니다: `experience/index.html#block`
- 검색엔진 노출을 막기 위해 `index.html`에 `noindex`가 걸려 있습니다.
  공개하려면 해당 `<meta name="robots">` 한 줄을 지우면 됩니다.
