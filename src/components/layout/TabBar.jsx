import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './layout.module.css';

// kind="bottom": 아이콘 + 이름의 하단 탭, kind="top": 이름만 있는 상단 탭
// onSelect 를 주면 기본 동작(activate) 대신 그것을 부른다.
export function TabBar({ kind, tabs, active, onSelect }) {
  const { activate, selected, t } = useMockup();
  const bottom = kind === 'bottom';
  return (
    <div className={bottom ? s.bottomTabs : s.topTabs} role="tablist">
      {tabs.map((tab, i) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={i === active}
          className={cx(
            bottom ? s.bottomTab : s.topTab,
            i === active && s.tabActive,
            // 하단 탭은 선택(활성) 색만으로 충분하므로 도움말 선택 표시(노란 띠)를 붙이지 않는다
            !bottom && selected?.key === tab.key && s.tabSelected,
          )}
          onClick={() => (onSelect ? onSelect(tab) : activate(tab))}
          title={t.label(tab)}
        >
          {bottom && tab.icon && <Icon name={tab.icon} className={s.bottomTabIcon} />}
          <span>{t.label(tab)}</span>
        </button>
      ))}
    </div>
  );
}
