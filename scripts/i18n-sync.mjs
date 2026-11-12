// 언어 사전 파일(<장치>.<언어>.yaml)을 메뉴 YAML 과 맞춘다.
//   - 메뉴에 새로 생긴 이름은 빈 번역("")으로 추가
//   - 이미 있는 번역은 그대로 유지
//   - 메뉴에서 사라진 이름은 맨 아래 "사용되지 않음" 묶음으로 옮김 (지우지 않음)
// 사용법: npm run i18n -- bs3max en
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { loadDevice, parseMessages } from '../src/lib/loadDevice.js';
import { translatableEntries } from '../src/lib/i18n.js';

const [, , id, locale] = process.argv;
if (!id || !locale) {
  console.log('사용법: npm run i18n -- <장치아이디> <언어코드>   예) npm run i18n -- bs3max en');
  process.exit(1);
}

const DIR = 'src/devices';
const basePath = join(DIR, `${id}.yaml`);
const dictPath = join(DIR, `${id}.${locale}.yaml`);
if (!existsSync(basePath)) {
  console.error(`${basePath} 이(가) 없습니다.`);
  process.exit(1);
}

const data = loadDevice(readFileSync(basePath, 'utf8'), `${id}.yaml`);
if (data.errors.length) {
  console.error('메뉴 YAML 에 오류가 있어 중단합니다. npm run validate 로 확인하세요.');
  process.exit(1);
}

// 기존 번역 (빈 값은 번역 안 된 것으로 보고 다시 "" 로 쓴다)
const existing = new Map();
if (existsSync(dictPath)) {
  const { messages } = parseMessages(readFileSync(dictPath, 'utf8'), dictPath);
  for (const [k, v] of Object.entries(messages)) existing.set(k, v);
}

const line = (k, v) => stringify({ [k]: v ?? '' }, { lineWidth: 0 }).trimEnd();
const section = (where) => where.split(' > ').slice(0, 3).join(' > ');

const out = [
  `# ${data.device.name} — ${locale} 표시 이름 사전`,
  `# 왼쪽: ${id}.yaml 의 원문(${data.device.language}) / 오른쪽: 번역. 비워 두면 원문이 표시됩니다.`,
  `# 같은 원문은 한 번만 번역하면 모든 곳에 적용됩니다.`,
  `# 특정 위치만 다르게 번역하려면 ${id}.yaml 의 해당 항목에 label: { ${locale}: ... } 를 적습니다.`,
  `# 다시 맞추기: npm run i18n -- ${id} ${locale}`,
];

const seen = new Set();
let lastSection = null;
let added = 0;
for (const e of translatableEntries(data)) {
  if (seen.has(e.text)) continue;
  seen.add(e.text);
  const sec = section(e.where);
  if (sec !== lastSection) {
    out.push('', `# ${sec}`);
    lastSection = sec;
  }
  if (!existing.has(e.text)) added += 1;
  out.push(line(e.text, existing.get(e.text)));
}

const unused = [...existing.keys()].filter((k) => !seen.has(k));
if (unused.length) {
  out.push('', '# ── 메뉴에서 사용되지 않는 번역 (확인 후 지워도 됩니다) ──');
  for (const k of unused) out.push(line(k, existing.get(k)));
}

writeFileSync(dictPath, `${out.join('\n')}\n`, 'utf8');
const missing = [...seen].filter((k) => !existing.get(k)).length;
console.log(`${dictPath}: 항목 ${seen.size}개 (새로 추가 ${added}, 번역 필요 ${missing}, 사용되지 않음 ${unused.length})`);
