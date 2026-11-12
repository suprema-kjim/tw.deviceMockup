// 정규화된 트리를 다루는 순수 함수들. 화면 상태(values)는 인자로 받는다.

export const TAB_TYPE = { bottom: 'bottom-tab', top: 'top-tab' };
export const FLOATING_SLOTS = new Set(['top-left', 'top-right', 'bottom-left', 'bottom-right']);

export const tabsOf = (node, kind) => (node?.children ?? []).filter((c) => c.type === TAB_TYPE[kind]);
export const tabValueKey = (node, kind) => `${node.key}::${kind}-tab`;

export function activeTabIndex(node, kind, values) {
  const tabs = tabsOf(node, kind);
  if (!tabs.length) return -1;
  const i = values[tabValueKey(node, kind)] ?? 0;
  return Math.min(Math.max(i, 0), tabs.length - 1);
}

export function activeTab(node, kind, values) {
  const i = activeTabIndex(node, kind, values);
  return i < 0 ? null : tabsOf(node, kind)[i];
}

// 현재 화면에서 탭 선택을 따라 내려간 노드 목록 [화면, 하단 탭, 상단 탭, ...]
export function activeChain(node, values) {
  const chain = [node];
  let cur = node;
  for (;;) {
    const next = activeTab(cur, 'bottom', values) ?? activeTab(cur, 'top', values);
    if (!next) return chain;
    chain.push(next);
    cur = next;
  }
}

export const hasBottomTabs = (node) => tabsOf(node, 'bottom').length > 0;

// 눌렀을 때 새 화면으로 들어가는 항목인가
export const isOpenable = (node) =>
  node.type !== 'select' && (node.children.length > 0 || Boolean(node.image));

// 헤더 제목으로 쓸 노드 (하단 탭이 있으면 선택된 탭)
export function titleNode(node, values) {
  return activeTab(node, 'bottom', values) ?? node;
}

export function headerItems(node, values) {
  return activeChain(node, values).flatMap((n) => n.children.filter((c) => c.slot === 'header'));
}

// 한 화면의 children 을 배치 영역별로 나눈다.
export function partition(node) {
  const groups = { bottomTabs: [], topTabs: [], floating: [], hotspots: [], rows: [] };
  for (const c of node.children) {
    if (c.type === 'bottom-tab') groups.bottomTabs.push(c);
    else if (c.type === 'top-tab') groups.topTabs.push(c);
    else if (c.slot === 'header') continue;
    else if (c.type === 'hotspot') groups.hotspots.push(c);
    else if (FLOATING_SLOTS.has(c.slot)) groups.floating.push(c);
    else groups.rows.push(c);
  }
  return groups;
}

export function currentValue(node, values) {
  // input/string 의 기본 표시 값은 언어별이므로 호출하는 쪽에서 t.value(node) 로 채운다.
  if (values[node.key] !== undefined) return values[node.key];
  if (node.type === 'input' || node.type === 'string') return undefined;
  return node.default;
}

export function assetUrl(path) {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('/')) return path;
  return `${import.meta.env?.BASE_URL ?? '/'}${path}`;
}
