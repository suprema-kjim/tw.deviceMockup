import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { ui } from '../i18n/ui.js';
import { makeTranslator } from '../lib/i18n.js';
import { hasBottomTabs, isOpenable, tabValueKey, tabsOf } from '../lib/tree.js';

// 화면 이동 스택과 선택 항목은 노드 key 로 저장한다.
// 그래서 YAML 을 고쳐 데이터가 다시 만들어져도(HMR) 보던 화면이 유지된다.
const MockupContext = createContext(null);

export const useMockup = () => useContext(MockupContext);

function reducer(state, action) {
  switch (action.type) {
    case 'push': {
      const values = { ...state.values, ...action.resetValues };
      return { ...state, stack: [...state.stack, action.key], values };
    }
    case 'pop':
      return state.stack.length > 1 ? { ...state, stack: state.stack.slice(0, -1), popup: null } : state;
    case 'popTo': {
      const i = state.stack.lastIndexOf(action.key);
      return i >= 0 ? { ...state, stack: state.stack.slice(0, i + 1), popup: null } : state;
    }
    case 'home':
      return { ...state, stack: state.stack.slice(0, 1), popup: null };
    case 'select':
      return { ...state, selected: action.key };
    case 'set':
      return { ...state, values: { ...state.values, [action.key]: action.value } };
    case 'popup':
      return { ...state, popup: action.popup };
    default:
      return state;
  }
}

export function MockupProvider({ data, locale, children }) {
  const rootKey = data.root?.key;
  const [state, dispatch] = useReducer(reducer, null, () => ({
    stack: [rootKey],
    selected: rootKey,
    values: {},
    popup: null,
  }));

  const resolve = useCallback((key) => data.index.get(key), [data]);

  // 데이터가 바뀌어 사라진 화면은 스택에서 빼고 본다.
  const stack = state.stack.map(resolve).filter(Boolean);
  if (stack.length === 0 && data.root) stack.push(data.root);
  const current = stack[stack.length - 1];
  const selected = resolve(state.selected) ?? current;

  const api = useMemo(() => {
    const push = (node) => {
      const resetValues = hasBottomTabs(node) ? { [tabValueKey(node, 'bottom')]: 0 } : {};
      // 입력 화면은 들어갈 때마다 처음 상태(YAML 기본값)로 되돌린다
      if (node.layout === 'form') {
        for (const child of node.children) resetValues[child.key] = undefined;
      }
      dispatch({ type: 'push', key: node.key, resetValues });
    };
    // 이름 없는 항목을 누르면 부모 항목의 도움말을 보여준다
    const select = (node) => dispatch({ type: 'select', key: (node.anonymous && node.parent ? node.parent : node).key });
    const setValue = (key, value) => dispatch({ type: 'set', key, value });
    const openPopup = (kind, node) => dispatch({ type: 'popup', popup: { kind, key: node.key } });
    const closePopup = () => dispatch({ type: 'popup', popup: null });
    const pop = () => dispatch({ type: 'pop' });
    const goHome = () => dispatch({ type: 'home' });
    const popTo = (node) => dispatch({ type: 'popTo', key: node.key });

    // 항목을 눌렀을 때의 공통 동작: 도움말 선택 → goto → 타입별 동작 → 하위 화면 진입
    const activate = (node) => {
      closePopup();
      select(node);
      if (node.goto === 'home') return goHome();
      if (node.goto === 'back') return pop();
      if (node.goto) {
        const screen = data.screens[node.goto];
        return screen && push(screen);
      }
      switch (node.type) {
        case 'select':
          return openPopup('select', node);
        case 'slide':
        case 'range':
          return openPopup('slide', node);
        case 'popup':
          return openPopup('message', node);
        case 'compose':
          return openPopup('picker', node);
        case 'bottom-tab':
        case 'top-tab': {
          const kind = node.type === 'bottom-tab' ? 'bottom' : 'top';
          const index = tabsOf(node.parent, kind).indexOf(node);
          return setValue(tabValueKey(node.parent, kind), index);
        }
        default:
          if (isOpenable(node)) push(node);
      }
    };

    return { push, pop, popTo, goHome, select, setValue, openPopup, closePopup, activate };
  }, [data]);

  // 언어가 바뀌어도 상태(스택·값·선택)는 그대로 두고 표시 텍스트만 바꾼다.
  const t = useMemo(() => makeTranslator(data, locale ?? data.device.language), [data, locale]);
  const u = useMemo(() => ui(t.locale), [t.locale]);

  const popupNode = state.popup ? resolve(state.popup.key) : null;
  const value = {
    data,
    t,
    ui: u,
    stack,
    current,
    selected,
    values: state.values,
    popup: popupNode ? { kind: state.popup.kind, node: popupNode } : null,
    ...api,
  };

  return <MockupContext.Provider value={value}>{children}</MockupContext.Provider>;
}
