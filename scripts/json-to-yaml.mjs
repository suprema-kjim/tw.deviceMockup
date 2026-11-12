// 기존 Docusaurus 용 JSON(_reference/bs3max.json)을 새 YAML 형식으로 한 번 옮기는 이전(migration) 도구.
// 사용법: node scripts/json-to-yaml.mjs <입력.json> [출력.yaml]
// 생성된 YAML 은 출발점일 뿐이다. 아이콘·색상·hotspot 좌표 등은 사람이 다듬는다.
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { stringify } from 'yaml';

const [, , input = '_reference/bs3max.json', output] = process.argv;
const src = JSON.parse(readFileSync(input, 'utf8'));

const fileName = (p) => (p ? basename(p) : undefined);
const SAFE_OPTION = /^[^,\[\]*]+$/;

function mapType(n) {
  const pos = n.position;
  if (n.type === 'home') return 'home';
  if ((n.type === 'tab' || n.type === 'list') && pos === 'bottom') return 'bottom-tab';
  if (n.type === 'tab' && pos === 'top') return 'top-tab';
  if (n.type === 'list' || n.type === 'title') return 'parent';
  if (n.type === 'icon') return n.coords && n.area !== 'header' && pos === 'bottom-right' ? 'button' : 'button';
  if (n.type === 'function') return n.className === 'func-add-user' ? 'hotspot' : 'button';
  return n.type;
}

function mapSlot(n) {
  if (n.area === 'header') return 'header';
  if (n.className === 'func-float-icon') return 'bottom-right';
  if (n.className === 'func-float-status-info') return 'top-right';
  if (n.type === 'icon' || n.type === 'function') return n.position;
  return undefined;
}

function convertChildren(children) {
  const out = [];
  for (const c of children ?? []) {
    // 값 표시 항목(string 등)에 붙어 있던 하위 항목(예: (+) 버튼)은 같은 화면의 형제로 끌어올린다.
    const hoisted = c.type === 'string' && c.children?.length ? c.children : [];
    out.push(convertNode(hoisted.length ? { ...c, children: [] } : c));
    for (const h of hoisted) out.push(convertNode(h));
  }
  return out;
}

function convertNode(n) {
  const type = mapType(n);
  const spec = {};
  if (n.id) spec.id = n.id;

  let children = n.children ?? [];

  // 하위가 이미지 하나뿐이면 이미지로 접는다 (메모리 정보 → 이미지 화면).
  if (children.length === 1 && children[0].type === 'image') {
    const img = children[0];
    spec.image = fileName(img.content);
    if (img.name !== n.name) spec.title = img.name;
    children = [];
  }
  if (n['content-type'] === 'image' && n.content) spec.image = fileName(n.content);

  const slot = mapSlot(n);
  if (slot) spec.slot = slot;
  if (n.destFunc) spec.goto = n.destFunc;
  if (n.target === 'home') spec.goto = 'home';
  if (type === 'hotspot') spec.area = [0, 600, 800, 140];
  if (n.description) spec.help = n.description;
  if (n.note) spec.note = n.note;

  let shorthand;
  switch (type) {
    case 'toggle':
      shorthand = `toggle ${n.default ? 'on' : 'off'}`;
      break;
    case 'select': {
      const opts = children;
      children = [];
      const allSafe = opts.every((o) => SAFE_OPTION.test(o.name) && !o.description);
      if (allSafe) {
        shorthand = `select [${opts.map((o) => (o.default ? `*${o.name}` : o.name)).join(', ')}]`;
      } else {
        shorthand = 'select';
        spec.options = opts.map((o) => (o.description ? { [o.name]: o.description } : o.name));
        const def = opts.find((o) => o.default);
        if (def) spec.default = def.name;
      }
      break;
    }
    case 'slide':
      if (n.range) shorthand = `range ${n.default.min}~${n.default.max}`;
      else shorthand = `slide ${n.default ?? 0}`;
      break;
    case 'string':
    case 'input':
      shorthand = n.value ? `${type} ${n.value}` : type;
      break;
    default:
      shorthand = type;
  }

  if (children.length) spec.children = convertChildren(children);

  const extraKeys = Object.keys(spec);
  const inferable = type === 'item' || (type === 'parent' && (spec.children || spec.image || spec.goto));
  if (extraKeys.length === 0) {
    return type === 'item' ? n.name : { [n.name]: shorthand };
  }
  if (extraKeys.length === 1 && spec.children && type === 'parent') {
    return { [n.name]: spec.children };
  }
  const body = inferable ? {} : { type: shorthand };
  return { [n.name]: { ...body, ...spec } };
}

const screens = {};
for (const f of src.functions ?? []) {
  screens[f.id] = { title: f.name, image: fileName(f.content) };
}

const doc = {
  device: src.device,
  name: src['device-name'],
  screen: src['screen-size'],
  theme: 'bs3',
  screens,
  menu: [convertNode(src.menu)],
};

const text = stringify(doc, { lineWidth: 0 });
if (output) {
  writeFileSync(output, text, 'utf8');
  console.log(`작성 완료: ${output}`);
} else {
  process.stdout.write(text);
}
