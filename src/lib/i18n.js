// 화면에 표시할 텍스트를 현재 언어로 고르는 함수 모음 (순수 JS).
//
// 우선순위
//   이름(label): 항목의 label.<언어>  →  <장치>.<언어>.yaml 사전  →  원문 이름
//   help/title/value 같은 문장: { <언어>: ... }  →  원문 언어 값
//
// 상태(선택값, 화면 이동)는 항상 원문 이름/키로 저장하므로 언어를 바꿔도 위치와 값이 유지된다.

export function makeTranslator(data, locale) {
  const source = data.device.language;
  const dict = locale === source ? null : data.messages?.[locale] ?? {};

  // 짧은 단어(옵션 이름, 단위, 표시 값)를 사전으로 바꾼다.
  const word = (s) => {
    if (s === undefined || s === null) return s;
    const str = String(s);
    return (dict && dict[str]) || str;
  };

  // { ko, en } → 현재 언어 값 (없으면 원문)
  const text = (map) => {
    if (!map) return undefined;
    return map[locale] ?? map[source] ?? Object.values(map)[0];
  };

  const hasText = (map) => Boolean(map?.[locale]);

  const label = (node) => {
    if (!node || node.anonymous) return '';
    return node.label?.[locale] ?? word(node.name);
  };

  // 들어간 화면의 제목: title 이 있으면 title, 없으면 이름
  const title = (node) => {
    if (!node) return '';
    if (node.title) return node.title[locale] ?? word(node.title[source] ?? Object.values(node.title)[0]);
    return label(node);
  };

  // string/input/popup 의 값. 원문 값이 사전에 있으면 번역한다.
  const value = (node) => {
    if (!node.value) return undefined;
    return node.value[locale] ?? word(text(node.value));
  };

  // field 의 빈 칸 안내 문구
  const placeholder = (node) => {
    if (!node.placeholder) return undefined;
    return node.placeholder[locale] ?? word(text(node.placeholder));
  };

  return { locale, source, word, text, hasText, label, title, value, placeholder };
}

// 번역이 필요한 원문 텍스트 목록 (사전 동기화·검증용).
// 원문이 영어가 아니면 ASCII 로만 된 값(IP 주소, "SUPREMA", "15°" 제외 숫자 등)은 번역 대상에서 뺀다.
export function translatableEntries(data) {
  const source = data.device.language;
  const needs = (s) => s !== undefined && s !== null && String(s) !== '' && (source === 'en' || /[^\x00-\x7F°]/.test(String(s)));
  const entries = [];
  for (const n of data.index.values()) {
    const where = n.path.join(' > ');
    if (!n.anonymous && needs(n.name)) entries.push({ text: n.name, where, override: n.label });
    if (n.title?.[source] && needs(n.title[source])) entries.push({ text: n.title[source], where, override: n.title });
    if (n.value?.[source] && needs(n.value[source])) entries.push({ text: n.value[source], where, override: n.value });
    if (n.placeholder?.[source] && needs(n.placeholder[source])) entries.push({ text: n.placeholder[source], where, override: n.placeholder });
    if (needs(n.unit)) entries.push({ text: n.unit, where });
  }
  return entries;
}

// locale 로 아직 번역되지 않은 원문 → 처음 나온 경로
export function missingTranslations(data, locale) {
  const dict = data.messages?.[locale] ?? {};
  const missing = new Map();
  for (const e of translatableEntries(data)) {
    if (e.override?.[locale] || dict[e.text]) continue;
    if (!missing.has(e.text)) missing.set(e.text, e.where);
  }
  return missing;
}

// "2026-11-12 00:48:59" → ko: "2026/11/12 오전 00:48:59", en: "2026/11/12 00:48:59 AM"
// (장치 표기를 따라 시는 12시간제지만 0시는 00 으로 표시한다)
export function formatDateTime(raw, u) {
  const m = String(raw ?? '').match(/^(\d{4})[-/](\d{2})[-/](\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return raw;
  const [, y, mo, d, hh, mi, ss = '00'] = m;
  const h = Number(hh);
  const ampm = h < 12 ? u('am') : u('pm');
  const time = `${String(h % 12).padStart(2, '0')}:${mi}:${ss}`;
  const date = `${y}/${mo}/${d}`;
  return u('ampmAfter') ? `${date} ${time} ${ampm}` : `${date} ${ampm} ${time}`;
}
