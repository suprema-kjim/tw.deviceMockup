import { useMockup } from '../../state/MockupContext.jsx';
import { activeTab, activeTabIndex, partition } from '../../lib/tree.js';
import { TabBar } from '../layout/TabBar.jsx';
import { RowList } from '../rows/RowList.jsx';
import { FloatingButton } from './FloatingButton.jsx';
import { ImageView } from './ImageView.jsx';
import s from './screens.module.css';

// 한 노드의 화면 내용. children 을 하단 탭 / 상단 탭 / 이미지·hotspot / 목록 / 떠 있는 버튼으로 나눠 그린다.
// 탭 안의 내용은 같은 컴포넌트를 재귀로 그린다.
export function MenuScreen({ node }) {
  const { values, ui } = useMockup();
  const { bottomTabs, topTabs, floating, hotspots, rows } = partition(node);

  if (bottomTabs.length > 0) {
    const tab = activeTab(node, 'bottom', values);
    return (
      <div className={s.screen}>
        <div className={s.fill}>{tab && <MenuScreen key={tab.key} node={tab} />}</div>
        <TabBar kind="bottom" tabs={bottomTabs} active={activeTabIndex(node, 'bottom', values)} />
      </div>
    );
  }

  const topTab = activeTab(node, 'top', values);
  const showImage = Boolean(node.image) || hotspots.length > 0;
  const hasContent = showImage || rows.length > 0;

  return (
    <div className={s.screen}>
      {topTabs.length > 0 && (
        <TabBar kind="top" tabs={topTabs} active={activeTabIndex(node, 'top', values)} />
      )}
      {hasContent && (
        <div
          className={[s.content, !topTab && s.fill, node.layout === 'form' && s.form].filter(Boolean).join(' ')}
          style={node.style}
        >
          {showImage && <ImageView node={node} hotspots={hotspots} />}
          <RowList rows={rows} layout={node.layout} />
        </div>
      )}
      {topTab && (
        <div className={s.fill}>
          <MenuScreen key={topTab.key} node={topTab} />
        </div>
      )}
      {!hasContent && !topTab && <div className={`${s.fill} ${s.empty}`}>{ui('noItems')}</div>}
      {floating.map((b) => (
        <FloatingButton key={b.key} node={b} />
      ))}
    </div>
  );
}
