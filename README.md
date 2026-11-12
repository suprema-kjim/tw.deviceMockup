# 장치 목업 도움말

슈프리마 장치 화면을 웹에서 재현하고, 메뉴를 누르면 오른쪽에 도움말을 보여주는 페이지입니다.
메뉴 구조는 장치별 YAML 파일로 작성합니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173/#bs3max
npm run build      # dist/ 에 정적 파일 생성 (어느 웹 서버에나 올릴 수 있음)
npm run validate   # YAML 검증 + 언어별 도움말·번역 현황
npm run i18n -- bs3max en   # 영어 이름 사전(bs3max.en.yaml)을 메뉴와 맞춤
```

언어는 화면 위쪽 버튼이나 주소(`#bs3max/en`)로 바꿉니다. 자세한 작성법은 [docs/YAML_GUIDE.md](docs/YAML_GUIDE.md)의 "여러 언어" 절을 보세요.

## 폴더 구조

```
src/
  devices/       장치별 메뉴 YAML  ← 주로 편집하는 곳 (docs/YAML_GUIDE.md)
                 <장치>.yaml = 메뉴, <장치>.<언어>.yaml = 그 언어의 이름 사전
  i18n/ui.js     버튼·도움말 패널 등 고정 문구의 언어별 사전
  themes/        장치별 테마 CSS (_base.css 가 기본값)
  icons/         아이콘 SVG (파일명 = YAML 의 icon 값)
  lib/           YAML 파싱·정규화 (shorthand.js, normalize.js), 트리 유틸, 번역(i18n.js)
  state/         화면 이동·값·선택 상태 (MockupContext)
  components/
    DeviceMockup.jsx   조립
    layout/      장치 틀, 헤더, 탭 바, 도움말 패널
    screens/     홈 화면, 메뉴 화면, 이미지·hotspot, 떠 있는 버튼
    rows/        타입별 행 (Row.jsx 의 rowComponents 에 등록)
    popups/      선택·슬라이더·확인 팝업
public/devices/<장치>/   화면 이미지
scripts/
  validate.mjs     검증
  i18n-sync.mjs    언어 사전 파일을 메뉴와 맞춤
  json-to-yaml.mjs 기존 Docusaurus JSON → YAML 이전 도구 (일회성)
```

## 새 항목 타입 추가

1. `src/lib/shorthand.js` 의 `NODE_TYPES` 에 타입 이름 추가 (값 파싱이 필요하면 `parseShorthand` 에 case 추가)
2. `src/components/rows/` 에 행 컴포넌트 작성
3. `src/components/rows/Row.jsx` 의 `rowComponents` 표에 등록
4. 누를 때 특별한 동작이 있으면 `src/state/MockupContext.jsx` 의 `activate` 에 추가
