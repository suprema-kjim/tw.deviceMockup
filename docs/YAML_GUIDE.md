# 장치 메뉴 YAML 작성 가이드

장치 하나는 `src/devices/<장치아이디>.yaml` 파일 하나로 정의합니다.
`npm run dev`를 실행해 둔 상태에서 파일을 저장하면 화면이 바로 바뀌고, 보고 있던 메뉴 위치도 그대로 유지됩니다.

## 파일 구조

```yaml
device: bs3max              # 장치 아이디 (주소 #bs3max 로 열림)
name: BioStation 3 Max      # 화면에 표시할 이름
screen: 800x1280            # 장치 화면 해상도(px). 좌표·테마 크기도 이 px 기준
theme: bs3                  # src/themes/bs3.css 를 사용
docs:                       # refer 경로 앞에 붙는 언어별 문서 주소
  ko: https://docs.supremainc.com
  en: https://docs.supremainc.com/en
# assets: devices/bs3max    # 이미지 폴더 (생략하면 devices/<device>). public/ 아래 경로

screens:                    # goto 로 여는 독립 화면 (닫기 X 버튼이 표시됨)
  addUserWizard:
    title: 사용자 등록 (1/2)
    image: bs3m-add-user1.png

menu:
  - 홈 화면:                 # 최상위는 항목 하나 (보통 type: home)
      type: home
      children:
        - ...
```

## 항목 작성법

모든 메뉴는 `- 이름` 목록으로 작성합니다. 세 가지 방법이 있습니다.

| 방법 | 예시 | 언제 쓰나 |
|---|---|---|
| 이름만 | `- Administrator` | 동작 없는 단순 항목 |
| 한 줄 표기 | `- QR 인증: toggle off` | 도움말·하위 메뉴가 없는 설정 |
| 하위 목록 | `- 이더넷:` 다음 줄에 `- ...` | 하위 메뉴로 들어가는 항목 (type: parent) |
| 펼친 표기 | `- 볼륨:` 다음 줄에 `type: slide 50`, `help: ...` | 도움말 등 속성이 필요할 때 |

```yaml
- 사운드:
    type: category
    children:
      - 음성 안내: toggle off                 # 한 줄 표기
      - 볼륨:                                  # 펼친 표기
          type: slide 50
          help: |
            장치 스피커의 음량을 조절합니다.
            0 이면 소리가 나지 않습니다.
      - 이더넷:                                # 하위 목록 → 누르면 하위 화면
          - DHCP: toggle on
          - IP 주소: string 192.168.1.111
```

### 이름 없는 항목

화면에 이름이 없는 요소(예: 근태 코드 등록의 아이콘)는 이름 없이 속성만 적습니다.
누르면 부모 항목의 도움말이 나오고, 도움말 작성 현황·번역 대상에서는 빠집니다.

```yaml
- 근태 아이콘:
    type: group
    children:
      - { type: choice on, icon: tna-in }
      - { type: choice, icon: meal, badge: in }
```

## 한 줄 표기 (type 값)

| 표기 | 화면 | 비고 |
|---|---|---|
| `toggle on` / `toggle off` | 켜기/끄기 스위치 | |
| `select [보통, *안전, 강함]` | 선택 목록 (팝업) | `*` 표시가 기본값, 없으면 첫 항목 |
| `slide 20` / `slide 5 초` | 슬라이더 팝업 | 숫자 뒤는 단위. 범위는 `min`, `max` 속성 (기본 0~100) |
| `range 30cm~130cm` | 범위 표시 | |
| `string 192.168.1.1` | 오른쪽에 값 표시 | |
| `input 2026/07/20` | 입력 칸 | `placeholder` 로 빈 칸 안내 문구 |
| `parent` | 하위 메뉴 | 하위 항목이 있으면 생략 가능 |
| `item` | 단순 항목 | 생략 가능 |
| `category` | 분류 제목 + 하위 항목 | |
| `popup` | 확인 창 (취소/확인) | 본문은 `value` |
| `bottom-tab` / `top-tab` | 하단 탭 / 상단 탭 | |
| `button` | 아이콘 버튼 | `slot` 으로 위치 지정 |
| `hotspot` | 이미지 위 클릭 영역 | `area` 필요 |
| `home` | 홈(대기) 화면 | |
| `stat 710,956` | 대시보드 원형 수치 | `icon`, `progress`(빨간 호 비율 0~1) |
| `tile` | 대시보드 바로가기 칸 (큰 아이콘 + 이름) | 보통 `goto` 와 함께 |
| `info` | 이름/값 정보 묶음 (제목 없이 회색 패널) | 하위에 `string` 항목 |

| `section` | 제목 막대(이름 + 개수 + 오른쪽 아이콘) 아래 목록. 막대는 스크롤해도 위에 고정 | `value` 가 개수, `icon`/`color` 가 오른쪽 원형 아이콘 |
| `log info 2026-11-12 00:49:09` | 이벤트 로그 한 줄 (상태 아이콘 + 이름 + 시각) | 상태: `info`(노랑 i), `success`(파랑 ✓), `fail`(빨강 ✕), `warning` |

| `avatar` | 회색 프로필 실루엣 + 카메라 아이콘 | |
| `field 2` | 가운데 정렬 입력 칸 + 지우기(x) + 밑줄 | `placeholder` 로 빈 칸 안내 문구 |
| `check on` / `check off` | 아이콘 선택 칸 (누르면 켜짐/꺼짐, 켜지면 분홍 원 + 체크) | `icon`. 연달아 적으면 3칸 한 줄 |
| `action` | 화면 맨 아래 큰 버튼 | `goto` 가 없으면 눌러도 이동하지 않음 (도움말만) |
| `group` | 하위 항목을 배경 있는 한 덩어리로 묶음 | `style` 로 묶음 안 테마 변수 변경 (예: `--group-bg`) |
| `authmode` | 인증 모드 한 줄: 인증 수단 칩을 `+`(그리고) `/`(또는)로 연결 + 오른쪽 값 | `combo: [card-qr, +, face, /, pin]`, `value` |
| `compose` | 점선 원 + 버튼 영역. 누르면 하위 `chip` 들을 고르는 팝업 | 하위에 `chip` |
| `chip` | 인증 수단 칩 (compose 팝업에서만 표시) | `chip: face \| card \| qr \| card-qr \| pin \| id \| fingerprint` |
| `textbox` | 테두리 있는 입력 칸 | `placeholder` |
| `keypad` | 화면 맨 아래 숫자 키패드 (1~9, 0, ., ⌫, 띄어쓰기, 숨기기, en, ↵) | 같은 화면의 첫 `textbox`(없으면 `field`)에 입력. ⌨ 로 숨기고 입력 칸을 누르면 다시 표시. en·↵ 는 동작 없음 |
| `choice` / `choice on` | 같은 묶음에서 하나만 고르는 아이콘 칸 (4칸 격자). `on` 이 처음 선택 | `icon`, `badge: in`(↗) / `out`(↘) 모서리 화살표 |
| `pad` | 색 타일 버튼 (아이콘 + 이름). 연달아 적으면 2칸 격자 | `icon`, `color`. 예: 근태 코드 선택 |

입력 화면은 화면에 `layout: form` 을 주고, 들어갈 때마다 입력값이 YAML 기본값으로 돌아갑니다.

```yaml
screens:
  addUserWizard:
    title: 사용자 추가 (1/2)
    header: both          # 뒤로 가기(←) + 닫기(X)
    layout: form
    children:
      - 사진: { type: avatar }
      - 이름: { type: field, placeholder: 이름을 입력하십시오 }
      - 사용자 ID: field 2
      - 얼굴: { type: check on, icon: face }
      - PIN: { type: check off, icon: key }
      - 다음: { type: action }
```

로그 시각은 `YYYY-MM-DD HH:mm:ss`(24시간제)로 적으면 언어에 맞게 바뀝니다 — 한국어 `2026/11/12 오전 00:49:09`, 영어 `2026/11/12 00:49:09 AM`.

```yaml
screens:
  eventLog:
    title: 이벤트 로그
    header: back          # 탭 없는 화면이지만 닫기(X) 대신 뒤로 가기
    children:
      - 검색: { type: button, slot: header, icon: search }
      - 전체 이벤트 로그:
          type: section
          value: "33"
          icon: info
          color: "#c8620a"
          children:
            - 관리자 메뉴: log info 2026-11-12 00:49:09
            - 인증 실패: log fail 2026-11-12 00:48:59
```

연달아 적은 `stat`·`tile` 은 3칸 격자로 묶여 표시됩니다 (칸 수는 테마의 `--dashboard-columns`).
화면에 `layout: list` 를 주면 세로 목록으로 바뀌고, 링 오른쪽에 이름과 `값 / max` 가 표시됩니다.

```yaml
screens:
  listUsers:
    title: 사용자 등록현황
    keepTabs: true    # 하단 탭 바 유지 + 헤더에 뒤로 가기 (기본은 탭 없이 닫기 X)
    layout: list
    children:
      - 사용자 수: { type: stat 1, max: "100,000", icon: stat-user, progress: 0 }
```

```yaml
- 대시보드:
    type: bottom-tab
    children:
      - 사용자: { type: stat 1, icon: stat-user, progress: 0 }
      - 메모리: { type: "stat 710,956", icon: memory, progress: 0.12 }   # 쉼표가 있으면 따옴표
      - 사용자 등록 마법사: { type: tile, icon: add-user-scan, goto: addUserWizard }
      - 장치 요약:
          type: info
          children:
            - 모델명: string BS3M-OAPB
```

> ⚠ 중괄호 한 줄 형태(`{ ... }`) 안에서는 `[`, `*` 가 YAML 문법과 겹칩니다. 따옴표로 감싸세요.
> `- 위조 얼굴 검출: { type: "select [보통, *안전]", help: 설명 }`

## 속성

| 속성 | 설명 |
|---|---|
| `help` | **도움말.** 항목을 누르면 오른쪽 패널에 표시. 여러 줄은 `help: |`, 언어별은 `help: { ko: .., en: .. }` |
| `label` | 이 위치에서만 쓸 다른 언어 이름 `label: { en: ... }` |
| `children` | 하위 항목 목록 |
| `options` | select 선택지 (선택지별 도움말이 필요할 때) — 아래 예시 |
| `default` | 기본값 (toggle: true/false, select: 선택지 이름, slide: 숫자) |
| `value` | string/input 의 표시 값, popup 의 본문 |
| `min`, `max`, `unit` | slide 범위와 단위. stat 의 `max` 는 목록형에서 `값 / max` 로 표시 |
| `progress` | stat 링의 빨간 호 비율 (0~1). 생략하고 `max` 가 있으면 값/max 로 자동 계산 (값이 0 이면 호 없음) |
| `header` | screens 의 헤더 버튼: `close`(기본, X) / `back`(뒤로 가기) / `both`(둘 다) |
| `placeholder` | field 가 비었을 때 안내 문구 (언어별 가능) |
| `readonly` | field 를 지우기 버튼 없는 회색 글자로 (수정 불가) |
| `style` | 화면 또는 group 에만 적용할 테마 변수 `{ --row-height: 112px, --screen-bg: "#e9ecf0" }` |
| `color` | (string) 값 글자색. `accent` 는 테마 강조색 |

헤더 버튼(`slot: header`)에 `icon` 이 없으면 이름이 둥근 글자 버튼으로 표시됩니다 (예: `- OK: { type: button, slot: header }`).
avatar 의 `icon` 으로 실루엣 모양을 바꿀 수 있습니다 (기본 `avatar`, 사용자 편집은 `avatar-filled`).
| `layout` | 화면 안 stat 배치: `grid`(기본, 3칸 격자) / `list`(세로 목록) |
| `keepTabs` | `true` 면 들어간 화면에서도 하단 탭 바를 유지하고 뒤로 가기를 표시 |
| `image` | 화면 이미지 파일. 누르면 이 이미지가 보이는 화면으로 이동 |
| `title` | 들어간 화면의 제목 (이름과 다를 때) |
| `goto` | `home`(홈으로), `back`(뒤로), 또는 `screens` 아이디 |
| `icon` | 아이콘 이름 = `src/icons/<이름>.svg` |
| `slot` | 위치: `header`(타이틀 바), `top-left`, `top-right`, `bottom-left`, `bottom-right`, `bottom`(홈 하단) |
| `area` | hotspot 영역 `[x, y, 폭, 높이]` — 이미지 기준 px (이미지 폭 = 화면 폭) |
| `color` | 버튼 배경색 (홈 하단 원형 버튼 등) |
| `id` | 고유 아이디 (선택) |
| `class` | 추가 CSS 클래스 (선택) |
| `note` | 작성자 메모. 화면에 표시되지 않음 |
| `refer` | 도움말 아래 **상호 참조** 링크. 문서 경로(`/device/biostation_3_max/admin-menu`)를 적으면 장치의 `docs` 주소 중 현재 언어 것이 앞에 붙음. `https://...` 는 그대로. 여러 개는 목록, 링크 글자를 바꾸려면 `{ path: ..., title: { ko: .., en: .. } }` |

선택지마다 도움말을 달려면 `options` 를 씁니다.

```yaml
- 언어:
    type: select
    default: 한국어
    help: 메뉴에 표시할 언어를 고릅니다.
    options:
      - 한국어: 메뉴를 한국어로 표시합니다.
      - English: 메뉴를 영어로 표시합니다.
      - 사용자 정의
```

## 화면 배치 규칙

한 화면의 하위 항목은 종류에 따라 자동으로 배치됩니다.

- `bottom-tab` → 하단 탭 바 (아이콘 + 이름)
- `top-tab` → 상단 탭 바
- `slot: header` → 타이틀 바 오른쪽 아이콘
- `slot: top-right` 등 모서리 → 화면 위에 떠 있는 버튼 (`+`, `i` 등)
- `hotspot` → 화면 이미지 위 클릭 영역
- 나머지 → 위에서부터 목록

홈 화면(`type: home`)에서는 `slot: top-left/top-right` 가 상단 아이콘, `slot: bottom` 이 하단 원형 버튼이 됩니다.

## 여러 언어 (한국어 / 영어 …)

메뉴 구조는 `<장치>.yaml` 하나만 유지하고, 언어별로 다른 부분만 따로 적습니다.
화면 위쪽의 언어 버튼이나 주소 `#bs3max/en` 으로 바꿀 수 있습니다. 언어를 바꿔도 보던 화면과 설정값은 그대로입니다.

```yaml
# bs3max.yaml
language: ko          # 이 파일에 적은 이름·help 의 원문 언어 (기본 ko)
languages: [ko, en]   # 화면에서 고를 수 있는 언어 (생략하면 사전 파일이 있는 언어 자동)
```

| 무엇 | 어디에 | 예시 |
|---|---|---|
| 메뉴·선택지 이름, 단위, 표시 값 | `<장치>.<언어>.yaml` 사전 | `보안 등급: Security Level` |
| 도움말 | 항목의 `help` 에 언어별로 | `help: { ko: ..., en: ... }` |
| 특정 위치만 다른 번역 | 항목의 `label` | `label: { en: Server }` |
| 언어별 스크린샷 | 항목의 `image` 에 언어별로 | `image: { ko: a.png, en: a-en.png }` |
| 화면 제목, 확인 창 문구 | `title`, `value` 에 언어별로 | `title: { ko: 사용자 등록, en: Add User }` |

```yaml
- 보안 등급:
    type: select [*보통, 안전, 가장 안전]
    help:
      ko: 인증 보안 수준을 정합니다.
      en: Sets the security level for authentication.
```

**이름 사전 (`bs3max.en.yaml`)**

```yaml
보안 등급: Security Level
보통: Normal
10 초: 10 sec
```

- 같은 원문은 한 번만 번역하면 모든 메뉴에 적용됩니다 (예: `보통` 이 여러 select 에 있어도 한 줄).
- 비워 둔 항목(`""`)은 원문이 그대로 표시됩니다.
- 메뉴를 고친 뒤 `npm run i18n -- bs3max en` 을 실행하면 새 이름은 빈 칸으로 추가되고, 기존 번역은 유지되며, 사라진 이름은 맨 아래로 모입니다.
- 원문이 한국어일 때 영문·숫자로만 된 값(`192.168.1.1`, `SUPREMA`)은 번역 대상에서 빠집니다.

**도움말이 없는 언어**에서는 원문 도움말을 보여주고 "아직 번역되지 않음" 안내를 붙입니다.
버튼·도움말 패널 같은 고정 문구는 `src/i18n/ui.js` 에 있습니다. 새 언어를 추가할 때는 이 파일에도 묶음을 추가하세요.

## 새 장치 추가

1. `src/devices/<아이디>.yaml` 작성 (`sample-landscape.yaml` 참고)
2. 화면 모양이 다르면 `src/themes/<테마>.css` 를 만들고 YAML 에 `theme: <테마>`
3. 이미지는 `public/devices/<아이디>/` 에 넣기
4. `npm run validate` 로 확인

## 테마

`src/themes/_base.css` 에 모든 변수의 기본값이 있습니다.
새 테마 파일에서는 바꿀 변수만 덮어씁니다. 크기는 장치 px 기준입니다.

```css
.mockup-screen[data-theme='my-device'] {
  --accent: #0f766e;
  --font-size: 22px;
  --header-height: 72px;
}
```

## 검증

```bash
npm run validate              # 오류·경고·언어별 도움말 작성률·번역 누락 수
npm run validate -- --missing # 도움말·번역이 없는 항목 목록까지
npm run validate -- bs3max    # 특정 장치만
```
