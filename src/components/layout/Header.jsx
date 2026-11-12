import { cx } from '../../lib/cx.js';
import { hasBottomTabs, headerItems, titleNode } from '../../lib/tree.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './layout.module.css';

// 상단 타이틀 바: [뒤로] 제목 [헤더 아이콘들 | 닫기]
export function Header() {
  const { current, stack, values, pop, activate, selected, t, ui } = useMockup();
  // keepTabs 이거나 header: back 인 화면은 닫기(X) 대신 뒤로 가기를, header: both 는 둘 다 쓴다.
  const showClose = current.isScreen && !current.keepTabs && current.header !== 'back';
  const canGoBack =
    stack.length > 1 && !hasBottomTabs(current) && (!showClose || current.header === 'both');
  const actions = showClose ? [] : headerItems(current, values);

  return (
    <div className={s.header}>
      {canGoBack ? (
        <button type="button" className={s.headerButton} onClick={pop} aria-label={ui('back')}>
          <Icon name="back" className={s.headerIcon} />
        </button>
      ) : (
        <span className={s.headerSpacer} />
      )}
      <span className={s.headerTitle}>{t.title(titleNode(current, values))}</span>
      <div className={s.headerActions}>
        {showClose ? (
          <button type="button" className={s.headerButton} onClick={pop} aria-label={ui('close')}>
            <Icon name="close" className={s.headerIcon} />
          </button>
        ) : (
          actions.map((item) => (
            <button
              key={item.key}
              type="button"
              className={cx(item.icon ? s.headerButton : s.headerPill, selected?.key === item.key && s.headerSelected)}
              onClick={() => activate(item)}
              aria-label={t.label(item)}
              title={t.label(item)}
            >
              {/* 아이콘이 없으면 이름을 둥근 글자 버튼으로 (예: OK) */}
              {item.icon ? <Icon name={item.icon} className={s.headerIcon} /> : t.label(item)}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
