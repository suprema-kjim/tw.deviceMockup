import { activeTabIndex, hasBottomTabs, tabsOf } from '../../lib/tree.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Header } from '../layout/Header.jsx';
import { TabBar } from '../layout/TabBar.jsx';
import { PopupLayer } from '../popups/PopupLayer.jsx';
import { HomeScreen } from './HomeScreen.jsx';
import { MenuScreen } from './MenuScreen.jsx';
import s from './screens.module.css';

// keepTabs 화면이면, 스택 아래쪽에서 하단 탭을 가진 화면(예: 모든 메뉴)을 찾는다.
function findTabHost(stack, current) {
  if (!current.keepTabs) return null;
  for (let i = stack.length - 2; i >= 0; i -= 1) {
    if (hasBottomTabs(stack[i])) return stack[i];
  }
  return null;
}

// 장치 화면 전체: 스택 맨 위 노드를 홈 화면 또는 (헤더 + 메뉴 화면)으로 그리고, 팝업을 겹친다.
export function DeviceScreen() {
  const { current, stack, values, popTo, activate, ui } = useMockup();
  if (!current) return <div className={s.empty}>{ui('emptyMenu')}</div>;
  const tabHost = findTabHost(stack, current);

  return (
    <div className={s.device}>
      {current.type === 'home' ? (
        <HomeScreen node={current} />
      ) : (
        <>
          <Header />
          <div className={s.fill}>
            <MenuScreen key={current.key} node={current} />
          </div>
          {tabHost && (
            <TabBar
              kind="bottom"
              tabs={tabsOf(tabHost, 'bottom')}
              active={activeTabIndex(tabHost, 'bottom', values)}
              onSelect={(tab) => {
                // 탭을 누르면 탭 화면으로 돌아간 뒤 그 탭을 연다
                popTo(tabHost);
                activate(tab);
              }}
            />
          )}
        </>
      )}
      <PopupLayer />
    </div>
  );
}
