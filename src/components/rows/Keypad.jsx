// 글자 입력 화면 요소: 테두리 있는 입력 칸(textbox)과 화면 키패드(keypad).
// keypad 는 같은 화면의 첫 번째 textbox(없으면 field)에 글자를 넣는다.
import { cx } from '../../lib/cx.js';
import { currentValue } from '../../lib/tree.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './keypad.module.css';

const siblings = (node) => node.parent?.children ?? [];
const findTarget = (keypad) =>
  siblings(keypad).find((n) => n.type === 'textbox') ?? siblings(keypad).find((n) => n.type === 'field');

export function TextBox({ node }) {
  const { values, setValue, select, selected, t } = useMockup();
  const value = currentValue(node, values) ?? t.value(node) ?? '';
  // 입력 칸을 누르면 숨겨 둔 키패드를 다시 연다
  const showKeypads = () => {
    for (const k of siblings(node).filter((n) => n.type === 'keypad')) setValue(k.key, false);
  };
  return (
    <div className={cx(s.boxWrap, node.className)}>
      <input
        className={cx(s.box, selected?.key === node.key && s.selected)}
        value={value}
        placeholder={t.placeholder(node)}
        aria-label={t.label(node)}
        onFocus={() => {
          select(node);
          showKeypads();
        }}
        onClick={showKeypads}
        onChange={(e) => setValue(node.key, e.target.value)}
      />
    </div>
  );
}

// 숫자 키패드 배열 (photo: BioStation 3 ID 입력). 각 칸: 글자 또는 { act, icon, label }
const NUMERIC = [
  ['1', '2', '3', { act: 'backspace', icon: 'key-backspace', label: 'keyBackspace' }],
  ['4', '5', '6', { act: 'space', icon: 'key-space', label: 'keySpace' }],
  ['7', '8', '9', { act: 'hide', icon: 'key-hide', label: 'keyHide' }],
  [{ act: 'lang', text: 'en', label: 'keyLang' }, '0', '.', { act: 'enter', icon: 'key-enter', label: 'keyEnter' }],
];

export function Keypad({ node }) {
  const { values, setValue, select, ui, t } = useMockup();
  if (values[node.key] === true) return null; // 숨김 상태

  const target = findTarget(node);
  const read = () => (target ? currentValue(target, values) ?? t.value(target) ?? '' : '');
  const write = (v) => target && setValue(target.key, v);

  const press = (key) => {
    select(node);
    if (typeof key === 'string') return write(read() + key);
    switch (key.act) {
      case 'backspace':
        return write(read().slice(0, -1));
      case 'space':
        return write(`${read()} `);
      case 'hide':
        return setValue(node.key, true);
      default:
        return undefined; // en(언어 전환)·입력(↵)은 목업에서 동작하지 않음
    }
  };

  return (
    <div className={cx(s.keypad, node.className)} role="group" aria-label={t.label(node)}>
      <div className={s.keys}>
        {NUMERIC.flat().map((key, i) => (
          <button
            key={i}
            type="button"
            className={cx(s.key, typeof key !== 'string' && s.keyFn)}
            onClick={() => press(key)}
            aria-label={typeof key === 'string' ? key : ui(key.label)}
          >
            {typeof key === 'string' ? key : key.icon ? <Icon name={key.icon} className={s.keyIcon} /> : key.text}
          </button>
        ))}
      </div>
    </div>
  );
}
