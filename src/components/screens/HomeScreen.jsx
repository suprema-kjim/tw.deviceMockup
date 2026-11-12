import { useEffect, useState } from 'react';
import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './screens.module.css';

const pad = (n) => String(n).padStart(2, '0');

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function TopButton({ item }) {
  const { activate, selected, t } = useMockup();
  return (
    <button
      type="button"
      className={cx(s.homeTopButton, selected?.key === item.key && s.homeSelected)}
      onClick={() => activate(item)}
      aria-label={t.label(item)}
      title={t.label(item)}
    >
      <Icon name={item.icon} className={s.homeTopIcon} />
    </button>
  );
}

// 홈(대기) 화면: slot 이 top-left/top-right 인 항목은 상단 아이콘, bottom 인 항목은 하단 원형 버튼으로 배치한다.
export function HomeScreen({ node }) {
  const { activate, selected, t, ui } = useMockup();
  const now = useNow();
  const bySlot = (slot) => node.children.filter((c) => c.slot === slot);
  const h = now.getHours();
  const ampm = <span className={s.homeAmpm}>{h < 12 ? ui('am') : ui('pm')}</span>;
  const clock = `${pad(h % 12 || 12)}:${pad(now.getMinutes())}`;

  return (
    <div className={s.home}>
      <div className={s.homeTop}>
        <div>
          {bySlot('top-left').map((item) => (
            <TopButton key={item.key} item={item} />
          ))}
        </div>
        <div>
          {bySlot('top-right').map((item) => (
            <TopButton key={item.key} item={item} />
          ))}
        </div>
      </div>

      <div className={s.homeClock} onClick={() => activate(node)}>
        <div className={s.homeTime}>
          {ui('ampmAfter') ? (
            <>
              {clock}
              {ampm}
            </>
          ) : (
            <>
              {ampm}
              {clock}
            </>
          )}
        </div>
        <div className={s.homeDate}>
          {ui('weekdays')[now.getDay()]}, {pad(now.getMonth() + 1)}/{pad(now.getDate())}
        </div>
      </div>

      <div className={s.homeBottom}>
        {bySlot('bottom').map((item) => (
          <button
            key={item.key}
            type="button"
            className={cx(s.homeBottomItem, selected?.key === item.key && s.homeSelected)}
            onClick={() => activate(item)}
          >
            <span className={s.homeCircle} style={item.color ? { background: item.color } : undefined}>
              <Icon name={item.icon} className={s.homeCircleIcon} />
            </span>
            <span className={s.homeLabel}>{t.label(item)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
