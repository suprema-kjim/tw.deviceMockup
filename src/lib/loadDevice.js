import { parse } from 'yaml';
import { normalizeDevice } from './normalize.js';

const emptyStats = () => ({
  nodes: 0, nodesWithHelp: 0, options: 0, optionsWithHelp: 0, helpByLang: {}, optionHelpByLang: {},
});

// 파일 이름 규칙:  <장치>.yaml = 메뉴 정의,  <장치>.<언어>.yaml = 그 언어의 표시 이름 사전
export function parseDeviceFileName(file) {
  const base = file.replace(/^.*[\\/]/, '');
  const m = base.match(/^(.+?)(?:\.([a-z]{2}(?:-[A-Z]{2})?))?\.ya?ml$/);
  return m ? { id: m[1], locale: m[2] ?? null } : null;
}

// YAML 문자열 → 정규화된 장치 데이터. YAML 문법 오류도 errors 로 돌려준다.
export function loadDevice(text, file = '') {
  let doc;
  try {
    doc = parse(text, { prettyErrors: true });
  } catch (e) {
    const id = parseDeviceFileName(file)?.id ?? file;
    return {
      file,
      device: { id, name: id, screen: { width: 800, height: 1280 }, theme: 'default', assets: '', language: 'ko' },
      root: null,
      screens: {},
      index: new Map(),
      iconRefs: [],
      messages: {},
      languages: ['ko'],
      errors: [`YAML 문법 오류: ${e.message}`],
      warnings: [],
      stats: emptyStats(),
    };
  }
  const data = normalizeDevice(doc, { file });
  data.messages = {};
  data.declaredLanguages = Array.isArray(doc?.languages) ? doc.languages.map(String) : null;
  data.languages = data.declaredLanguages ?? [data.device.language];
  return data;
}

// 언어 사전 파일: "원문 이름: 번역" 묶음. 값이 비어 있으면 번역 안 된 것으로 본다.
export function parseMessages(text, file = '') {
  const messages = {};
  const errors = [];
  let doc;
  try {
    doc = parse(text, { prettyErrors: true }) ?? {};
  } catch (e) {
    return { messages, errors: [`${file}: YAML 문법 오류: ${e.message}`] };
  }
  if (typeof doc !== 'object' || Array.isArray(doc)) {
    return { messages, errors: [`${file}: "원문: 번역" 묶음이어야 합니다`] };
  }
  for (const [src, dst] of Object.entries(doc)) {
    if (dst === null || dst === undefined || String(dst).trim() === '') continue;
    if (typeof dst === 'object') errors.push(`${file}: "${src}" 의 번역은 문자열이어야 합니다`);
    else messages[src] = String(dst).trim();
  }
  return { messages, errors };
}

// 장치 YAML 과 언어 사전 파일들을 묶는다. { 경로: 내용 } 을 받아 장치 목록을 돌려준다.
export function loadDevices(sources) {
  const devices = new Map();
  const dictionaries = [];
  for (const [file, text] of Object.entries(sources)) {
    const info = parseDeviceFileName(file);
    if (!info) continue;
    if (info.locale) dictionaries.push({ ...info, file, text });
    else devices.set(info.id, loadDevice(text, file.replace(/^.*[\\/]/, '')));
  }
  for (const d of dictionaries) {
    const data = devices.get(d.id);
    const name = d.file.replace(/^.*[\\/]/, '');
    if (!data) {
      console.warn(`${name}: 짝이 되는 ${d.id}.yaml 이 없습니다`);
      continue;
    }
    const { messages, errors } = parseMessages(d.text, name);
    data.messages[d.locale] = messages;
    data.errors.push(...errors);
    if (!data.declaredLanguages && !data.languages.includes(d.locale)) data.languages.push(d.locale);
  }
  return [...devices.values()];
}
