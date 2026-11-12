// 사람이 작성한 장치 YAML(파싱된 JS 객체)을 컴포넌트가 쓰는 정규화된 트리로 바꾼다.
// 오류는 던지지 않고 errors / warnings 에 모아서, 화면과 검증 스크립트가 함께 보여줄 수 있게 한다.
import { parseShorthand } from './shorthand.js';

const NODE_KEYS = new Set([
  'type', 'id', 'help', 'icon', 'slot', 'area', 'image', 'title', 'goto',
  'value', 'default', 'min', 'max', 'unit', 'options', 'children', 'class', 'color', 'note', 'label', 'progress', 'layout', 'keepTabs', 'header', 'status', 'time', 'placeholder', 'style', 'readonly', 'combo', 'chip', 'badge', 'refer',
]);
const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;
const SLOTS = new Set(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'bottom', 'header']);
const CONTAINER_ONLY = new Set(['bottom-tab', 'top-tab']);

export const PATH_SEP = ' > ';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// refer: 경로 | URL | { path, title } 또는 그 목록 → [{ path, title }]
// 경로(/device/...)는 장치의 docs 주소 뒤에 붙고, http(s) 로 시작하면 그대로 쓴다.
function normalizeRefer(refer, at, ctx) {
  if (refer === undefined || refer === null) return undefined;
  const list = Array.isArray(refer) ? refer : [refer];
  const out = [];
  for (const r of list) {
    if (typeof r === 'string' && r.trim()) out.push({ path: r.trim() });
    else if (isObject(r) && typeof (r.path ?? r.url) === 'string') {
      out.push({ path: String(r.path ?? r.url).trim(), title: localized(r.title, at, 'refer.title', ctx) });
    } else ctx.warnings.push(`${at}: refer 는 문서 경로 또는 { path, title } 이어야 합니다`);
  }
  return out.length ? out : undefined;
}

function parseScreenSize(screen, ctx) {
  if (isObject(screen) && screen.width && screen.height) {
    return { width: Number(screen.width), height: Number(screen.height) };
  }
  const m = String(screen ?? '').match(/^(\d+)\s*[xX×]\s*(\d+)$/);
  if (m) return { width: Number(m[1]), height: Number(m[2]) };
  ctx.errors.push(`screen 값이 올바르지 않습니다: "${screen}" (예: 800x1280)`);
  return { width: 800, height: 1280 };
}

// 리스트 항목 하나("- 이름" / "- 이름: 값")를 { name, spec } 으로 분해한다.
function splitEntry(entry, where, ctx) {
  if (typeof entry === 'string' || typeof entry === 'number') {
    return { name: String(entry), spec: {} };
  }
  // 이름 없는 항목: "- { type: choice, icon: meal }" 처럼 속성만 적은 것.
  // 화면에 이름이 없는 요소(예: 근태 아이콘)에 쓴다. 도움말은 부모 항목의 것을 보여준다.
  if (isObject(entry) && 'type' in entry) {
    const at = `${where}${PATH_SEP}(이름 없음)`;
    for (const k of Object.keys(entry)) {
      if (!NODE_KEYS.has(k)) ctx.warnings.push(`${at}: 알 수 없는 키 "${k}"`);
    }
    try {
      const sh = parseShorthand(entry.type);
      const { type: _ignored, ...rest } = entry;
      ctx.anonCount += 1;
      return { name: `#${ctx.anonCount}`, spec: { ...sh, ...rest }, anonymous: true };
    } catch (e) {
      ctx.errors.push(`${at}: ${e.message}`);
      return null;
    }
  }
  if (isObject(entry) && Object.keys(entry).length === 1) {
    const name = Object.keys(entry)[0];
    const body = entry[name];
    const at = `${where}${PATH_SEP}${name}`;
    try {
      if (body === null || body === undefined) return { name, spec: {} };
      if (typeof body === 'string') return { name, spec: parseShorthand(body) };
      if (Array.isArray(body)) return { name, spec: { children: body } };
      if (isObject(body)) {
        for (const k of Object.keys(body)) {
          if (!NODE_KEYS.has(k)) ctx.warnings.push(`${at}: 알 수 없는 키 "${k}"`);
        }
        if (body.type !== undefined) {
          const sh = parseShorthand(body.type);
          const { type: _ignored, ...rest } = body;
          return { name, spec: { ...sh, ...rest } };
        }
        return { name, spec: { ...body } };
      }
      ctx.errors.push(`${at}: 값은 타입 표기, 하위 목록, 또는 속성 묶음이어야 합니다 (받은 값: ${JSON.stringify(body)})`);
    } catch (e) {
      ctx.errors.push(`${at}: ${e.message}`);
    }
    return { name, spec: {} };
  }
  ctx.errors.push(`${where}: 항목은 "- 이름" 또는 "- 이름: 값" 형태여야 합니다 (받은 값: ${JSON.stringify(entry)})`);
  return null;
}

function uniqueKey(base, ctx) {
  if (!ctx.index.has(base)) return base;
  let i = 2;
  while (ctx.index.has(`${base}#${i}`)) i += 1;
  return `${base}#${i}`;
}

// 언어별 텍스트: "문자열"(원문 언어) 또는 { ko: ..., en: ... } → { ko: ..., en: ... }
function localized(raw, at, field, ctx, map = (v) => v) {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'string' || typeof raw === 'number') {
    const v = String(raw).trim();
    return v ? { [ctx.language]: map(v) } : undefined;
  }
  if (isObject(raw)) {
    const out = {};
    for (const [lang, v] of Object.entries(raw)) {
      if (!LOCALE_RE.test(lang)) {
        ctx.warnings.push(`${at}: ${field} 의 "${lang}" 은(는) 언어 코드가 아닙니다 (예: ko, en)`);
        continue;
      }
      if (v !== null && v !== undefined && String(v).trim()) out[lang] = map(String(v).trim());
    }
    return Object.keys(out).length ? out : undefined;
  }
  ctx.errors.push(`${at}: ${field} 는 문자열 또는 { ko: ..., en: ... } 이어야 합니다`);
  return undefined;
}

function countHelp(help, ctx, bucket) {
  if (!help) return;
  for (const lang of Object.keys(help)) bucket[lang] = (bucket[lang] ?? 0) + 1;
}

// style: { --변수: 값 } 만 허용 (화면·묶음 단위로 테마 변수를 덮어쓴다)
function cssVars(raw, at, ctx) {
  if (raw === undefined || raw === null) return undefined;
  if (!isObject(raw)) {
    ctx.errors.push(`${at}: style 은 { --변수: 값 } 묶음이어야 합니다`);
    return undefined;
  }
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!k.startsWith('--')) ctx.warnings.push(`${at}: style 의 "${k}" 는 -- 로 시작하는 테마 변수여야 합니다`);
    else out[k] = String(v);
  }
  return out;
}

function resolveAsset(file, ctx) {
  if (!file) return undefined;
  if (/^(https?:)?\/\//.test(file) || file.startsWith('/') || file.startsWith('data:')) return file;
  return `${ctx.assets.replace(/\/$/, '')}/${file}`;
}

function normalizeOptions(raw, node, ctx) {
  const at = node.path.join(PATH_SEP);
  if (!Array.isArray(raw)) {
    ctx.errors.push(`${at}: options 는 목록이어야 합니다`);
    return [];
  }
  return raw
    .map((o) => {
      let name;
      let help;
      let label;
      if (typeof o === 'string' || typeof o === 'number') name = String(o);
      else if (isObject(o) && Object.keys(o).length === 1) {
        name = Object.keys(o)[0];
        const v = o[name];
        // - 이름: 도움말   /   - 이름: { ko: .., en: .. }   /   - 이름: { help: .., label: { en: .. } }
        const isFull = isObject(v) && ('help' in v || 'label' in v);
        help = localized(isFull ? v.help : v, `${at}${PATH_SEP}${name}`, 'help', ctx);
        if (isFull) label = localized(v.label, `${at}${PATH_SEP}${name}`, 'label', ctx);
      } else {
        ctx.errors.push(`${at}: 옵션 형식이 올바르지 않습니다 ${JSON.stringify(o)}`);
        return null;
      }
      const key = `${node.key}${PATH_SEP}${name}`;
      const opt = { key, name, label, type: 'option', help, path: [...node.path, name], parent: node };
      ctx.index.set(key, opt);
      ctx.stats.options += 1;
      if (opt.help?.[ctx.language]) ctx.stats.optionsWithHelp += 1;
      countHelp(help, ctx, ctx.stats.optionHelpByLang);
      return opt;
    })
    .filter(Boolean);
}

function buildNode(name, spec, parentPath, ctx, anonymous = false) {
  const path = [...parentPath, name];
  const at = path.join(PATH_SEP);
  const key = uniqueKey(at, ctx);
  const childrenRaw = spec.children;
  const type =
    spec.type ?? (childrenRaw?.length || spec.image || spec.goto ? 'parent' : 'item');

  const node = {
    key,
    name,
    path,
    type,
    id: spec.id,
    label: localized(spec.label, at, 'label', ctx),
    help: localized(spec.help, at, 'help', ctx),
    icon: spec.icon,
    slot: spec.slot,
    area: spec.area,
    image: localized(spec.image, at, 'image', ctx, (f) => resolveAsset(f, ctx)),
    title: localized(spec.title, at, 'title', ctx),
    goto: spec.goto,
    value: localized(spec.value, at, 'value', ctx),
    default: spec.default,
    min: spec.min,
    max: spec.max,
    unit: spec.unit,
    progress: spec.progress,
    layout: spec.layout,          // 'grid'(기본) | 'list' : stat 배치 방식
    keepTabs: spec.keepTabs === true, // 들어간 화면에서도 아래 하단 탭 바를 유지
    header: spec.header,          // screens: 'close'(기본, X) | 'back'(뒤로 가기) | 'both'(둘 다)
    placeholder: localized(spec.placeholder, at, 'placeholder', ctx), // field: 빈 칸 안내 문구
    readonly: spec.readonly === true, // field: 지우기 버튼 없이 회색 글자
    combo: Array.isArray(spec.combo) ? spec.combo.map(String) : undefined, // authmode: [card-qr, +, face, /, pin]
    badge: spec.badge,            // choice: 아이콘 모서리 작은 화살표 in(↗, 왼쪽 아래) | out(↘, 오른쪽 아래)
    chip: spec.chip,              // chip: face | card | qr | card-qr | pin | id | fingerprint
    style: cssVars(spec.style, at, ctx), // 이 화면/묶음에만 적용할 테마 변수 { --row-height: 120px }
    status: spec.status,          // log: info | success | fail | warning
    time: spec.time,              // log: 2026-11-12 00:48:59
    className: spec.class,
    color: spec.color,
    note: spec.note,
    refer: normalizeRefer(spec.refer, at, ctx), // 상호 참조 문서 [{ path, title }]
    children: [],
    options: [],
  };
  ctx.index.set(key, node);
  if (node.id) {
    if (ctx.ids.has(node.id)) ctx.errors.push(`${at}: id "${node.id}" 가 중복됩니다`);
    ctx.ids.set(node.id, node);
  }

  node.anonymous = anonymous;
  // 이름 없는 항목은 도움말을 부모에 쓰므로 작성 현황 집계에서 뺀다
  if (!anonymous) {
    ctx.stats.nodes += 1;
    if (node.help?.[ctx.language]) ctx.stats.nodesWithHelp += 1;
    countHelp(node.help, ctx, ctx.stats.helpByLang);
  }

  if (node.slot && !SLOTS.has(node.slot)) {
    ctx.warnings.push(`${at}: 알 수 없는 slot "${node.slot}" (사용 가능: ${[...SLOTS].join(', ')})`);
  }
  if (type === 'hotspot') {
    const ok = Array.isArray(node.area) && node.area.length === 4 && node.area.every((n) => typeof n === 'number');
    if (!ok) ctx.errors.push(`${at}: hotspot 은 area: [x, y, 폭, 높이] 가 필요합니다`);
  }
  if (node.progress !== undefined && !(typeof node.progress === 'number' && node.progress >= 0 && node.progress <= 1)) {
    ctx.warnings.push(`${at}: progress 는 0 ~ 1 사이 숫자여야 합니다 (예: 0.15)`);
  }
  if (node.goto) ctx.gotos.push(node);
  if (node.icon) ctx.icons.push(node);

  if (type === 'select') {
    if (spec.options) node.options = normalizeOptions(spec.options, node, ctx);
    if (childrenRaw) ctx.warnings.push(`${at}: select 의 선택지는 children 이 아니라 options 에 적어야 합니다`);
    if (node.options.length === 0) ctx.warnings.push(`${at}: select 에 options 가 없습니다`);
    if (node.default === undefined && node.options[0]) node.default = node.options[0].name;
    if (node.default !== undefined && !node.options.some((o) => o.name === String(node.default))) {
      ctx.warnings.push(`${at}: 기본값 "${node.default}" 이(가) options 에 없습니다`);
    }
  } else if (childrenRaw !== undefined) {
    if (!Array.isArray(childrenRaw)) {
      ctx.errors.push(`${at}: children 은 목록이어야 합니다`);
    } else {
      node.children = buildChildren(childrenRaw, path, ctx);
    }
  }

  for (const child of node.children) {
    child.parent = node;
    if (CONTAINER_ONLY.has(child.type) && type === 'category') {
      ctx.warnings.push(`${child.path.join(PATH_SEP)}: 탭은 category 안에 둘 수 없습니다`);
    }
  }
  return node;
}

function buildChildren(list, parentPath, ctx) {
  const where = parentPath.join(PATH_SEP) || '(menu)';
  const out = [];
  for (const entry of list) {
    const parts = splitEntry(entry, where, ctx);
    if (parts) out.push(buildNode(parts.name, parts.spec, parentPath, ctx, parts.anonymous));
  }
  return out;
}

export function normalizeDevice(doc, { file = '' } = {}) {
  const ctx = {
    errors: [],
    warnings: [],
    index: new Map(),
    ids: new Map(),
    gotos: [],
    icons: [],
    assets: '',
    anonCount: 0,
    language: 'ko',
    stats: { nodes: 0, nodesWithHelp: 0, options: 0, optionsWithHelp: 0, helpByLang: {}, optionHelpByLang: {} },
  };

  if (!isObject(doc)) {
    return { file, errors: ['YAML 최상위는 속성 묶음이어야 합니다'], warnings: [] };
  }

  const id = String(doc.device ?? file.replace(/^.*[\\/]/, '').replace(/\.ya?ml$/, ''));
  ctx.assets = doc.assets ?? `devices/${id}`;
  ctx.language = doc.language ?? 'ko';
  const device = {
    id,
    name: doc.name ?? id,
    screen: parseScreenSize(doc.screen, ctx),
    theme: doc.theme ?? 'default',
    assets: ctx.assets,
    language: ctx.language, // YAML 원문(이름·help 문자열)의 언어
    docs: localized(doc.docs, 'docs', 'docs', ctx), // refer 경로 앞에 붙는 언어별 문서 주소
  };

  // 메뉴 트리
  let root = null;
  if (!Array.isArray(doc.menu) || doc.menu.length === 0) {
    ctx.errors.push('menu 는 항목이 하나 이상인 목록이어야 합니다');
  } else {
    if (doc.menu.length > 1) ctx.warnings.push('menu 최상위에는 항목 하나(보통 홈 화면)만 두세요. 첫 항목만 사용합니다.');
    const [first] = buildChildren([doc.menu[0]], [], ctx);
    root = first ?? null;
  }

  // 기능 화면(screens): goto 로 이동하는 독립 화면
  const screens = {};
  if (doc.screens !== undefined) {
    if (!isObject(doc.screens)) ctx.errors.push('screens 는 "아이디: 속성" 묶음이어야 합니다');
    else {
      for (const [sid, body] of Object.entries(doc.screens)) {
        const spec = isObject(body) ? { ...body } : {};
        // 화면 이름은 원문 언어 제목을 쓰고, 다른 언어 제목은 label 로 넘긴다.
        const titles = isObject(spec.title) ? spec.title : { [ctx.language]: spec.title ?? sid };
        const name = String(titles[ctx.language] ?? sid);
        delete spec.title;
        spec.label = { ...titles, ...(isObject(spec.label) ? spec.label : {}) };
        const node = buildNode(name, { type: 'parent', ...spec }, ['기능 화면'], ctx);
        node.screenId = sid;
        node.isScreen = true;
        screens[sid] = node;
      }
    }
  }

  for (const n of ctx.gotos) {
    if (n.goto !== 'home' && n.goto !== 'back' && !screens[n.goto]) {
      ctx.errors.push(`${n.path.join(PATH_SEP)}: goto 대상 "${n.goto}" 이(가) screens 에 없습니다`);
    }
  }

  return {
    file,
    device,
    root,
    screens,
    index: ctx.index,
    iconRefs: ctx.icons,
    errors: ctx.errors,
    warnings: ctx.warnings,
    stats: ctx.stats,
  };
}
