// 한 줄 표기(shorthand)를 파싱한다.
//   toggle on | toggle off
//   select [옵션1, *기본옵션, 옵션3]
//   slide 20 | slide 5 초
//   range 30cm~130cm
//   string 192.168.1.1 | input 2026/07/20
//   stat 710,956          (대시보드 원형 수치)
//   log fail 2026-11-12 00:48:59   (이벤트 로그 한 줄: 상태 + 시각)
//   field 2 | check on    (입력 화면: 가운데 입력 칸 / 아이콘 선택 칸)
//   image 파일명.png
//   parent | item | category | popup ...
// Node(검증 스크립트)와 브라우저 양쪽에서 쓰므로 순수 JS로 유지한다.

export const NODE_TYPES = [
  'home',
  'bottom-tab',
  'top-tab',
  'category',
  'parent',
  'item',
  'toggle',
  'select',
  'slide',
  'range',
  'string',
  'input',
  'popup',
  'image',
  'button',
  'hotspot',
  'stat',
  'tile',
  'info',
  'section',
  'log',
  'avatar',
  'field',
  'check',
  'action',
  'pad',
  'group',
  'authmode',
  'compose',
  'chip',
  'textbox',
  'keypad',
  'choice',
];

export const LOG_STATUSES = ['info', 'success', 'fail', 'warning'];

const TYPE_SET = new Set(NODE_TYPES);

function splitList(text) {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseShorthand(text) {
  const src = String(text).trim();
  const m = src.match(/^([a-z][a-z-]*)(?:\s+([\s\S]*))?$/);
  if (!m || !TYPE_SET.has(m[1])) {
    throw new Error(`알 수 없는 타입 표기 "${src}" (사용 가능: ${NODE_TYPES.join(', ')})`);
  }
  const type = m[1];
  const arg = (m[2] ?? '').trim();

  switch (type) {
    case 'toggle':
    case 'check':
    case 'choice':
      if (!arg) return { type, default: false };
      if (/^(on|true|켜짐)$/i.test(arg)) return { type, default: true };
      if (/^(off|false|꺼짐)$/i.test(arg)) return { type, default: false };
      throw new Error(`${type} 값은 on 또는 off 여야 합니다: "${src}"`);

    case 'select': {
      if (!arg) return { type };
      const inner = arg.match(/^\[([\s\S]*)\]$/);
      if (!inner) throw new Error(`select 옵션은 [a, *b, c] 형태로 적어야 합니다: "${src}"`);
      let def;
      const options = splitList(inner[1]).map((o) => {
        if (o.startsWith('*')) {
          const name = o.slice(1).trim();
          def = name;
          return name;
        }
        return o;
      });
      return def !== undefined ? { type, options, default: def } : { type, options };
    }

    case 'slide': {
      if (!arg) return { type };
      const n = arg.match(/^(-?\d+(?:\.\d+)?)\s*(.*)$/);
      if (!n) throw new Error(`slide 값은 숫자로 시작해야 합니다: "${src}"`);
      return n[2] ? { type, default: Number(n[1]), unit: n[2] } : { type, default: Number(n[1]) };
    }

    case 'range': {
      const r = arg.match(/^(.+?)\s*~\s*(.+)$/);
      if (!r) throw new Error(`range 값은 "최소~최대" 형태여야 합니다: "${src}"`);
      return { type, min: r[1], max: r[2] };
    }

    case 'stat':
    case 'field':
    case 'textbox':
    case 'string':
    case 'input':
      return arg ? { type, value: arg } : { type };

    case 'image':
      return arg ? { type, image: arg } : { type };

    case 'log': {
      const m = arg.match(/^([a-z]+)(?:\s+(.+))?$/);
      if (!m || !LOG_STATUSES.includes(m[1])) {
        throw new Error(`log 는 "log <상태> <시각>" 형태여야 합니다. 상태: ${LOG_STATUSES.join(', ')} (받은 값: "${src}")`);
      }
      return m[2] ? { type, status: m[1], time: m[2].trim() } : { type, status: m[1] };
    }

    default:
      if (arg) throw new Error(`"${type}" 타입은 값을 받지 않습니다: "${src}"`);
      return { type };
  }
}
