import { currentValue } from '../../lib/tree.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { optionLabel } from '../rows/SelectRow.jsx';
import { formatSlide } from '../rows/SlideRow.jsx';
import s from './layout.module.css';

function Details({ node, values, t, ui }) {
  switch (node.type) {
    case 'toggle':
      return (
        <dl className={s.helpProps}>
          <dt>{ui('default')}</dt>
          <dd>{node.default ? ui('on') : ui('off')}</dd>
          <dt>{ui('current')}</dt>
          <dd>{currentValue(node, values) ? ui('on') : ui('off')}</dd>
        </dl>
      );
    case 'slide':
    case 'range':
      return (
        <dl className={s.helpProps}>
          <dt>{node.type === 'range' ? ui('range') : ui('current')}</dt>
          <dd>{formatSlide(node, values, t)}</dd>
        </dl>
      );
    case 'string': {
      const v = t.value(node);
      return v ? (
        <dl className={s.helpProps}>
          <dt>{ui('shownValue')}</dt>
          <dd>{v}</dd>
        </dl>
      ) : null;
    }
    case 'select': {
      const cur = String(currentValue(node, values));
      return (
        <div className={s.helpOptions}>
          <div className={s.helpSubTitle}>{ui('options')}</div>
          <ul>
            {node.options.map((o) => (
              <li key={o.key}>
                <span className={o.name === cur ? s.helpOptionCurrent : undefined}>{optionLabel(node, o.name, t)}</span>
                {o.name === String(node.default) && <span className={s.helpBadge}>{ui('default')}</span>}
                {o.help && <p>{t.text(o.help)}</p>}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    default:
      return null;
  }
}

// 경로의 각 단계를 현재 언어 이름으로 보여주기 위해 부모를 따라 올라간다.
function breadcrumb(node, data, t) {
  const names = [];
  let cur = node.parent;
  while (cur) {
    names.unshift(t.label(cur));
    cur = cur.parent;
  }
  if (node.isScreen) return '';
  return names.length ? names.join(' › ') : node.path.slice(0, -1).map(t.word).join(' › ');
}

// refer 경로를 현재 언어의 문서 주소로 바꾼다. http(s) 주소는 그대로.
function referUrl(path, data, t) {
  if (/^https?:\/\//.test(path)) return path;
  const base = t.text(data.device.docs);
  if (!base) return path;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

// 선택한 항목(선택지는 부모)의 refer 를 '상호 참조' 링크 목록으로 보여준다.
function ReferSection({ node }) {
  const { data, t, ui } = useMockup();
  const refer = node?.refer ?? (node?.type === 'option' ? node.parent?.refer : undefined);
  if (!refer?.length) return null;
  return (
    <section className={s.refer} lang={t.locale}>
      <h3 className={s.referTitle}>{ui('refer')}</h3>
      <ul>
        {refer.map((r) => {
          const url = referUrl(r.path, data, t);
          return (
            <li key={r.path}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {t.text(r.title) ?? url}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// 도움말 아래에 항상 붙는 안내 문구 (선택한 항목과 관계없이 표시)
function MockupNote({ ui, locale }) {
  return (
    <p className={s.note} role="note" lang={locale}>
      <span className={s.noteIcon} aria-hidden="true">i</span>
      <span>{ui('mockupNote')}</span>
    </p>
  );
}

export function HelpPanel() {
  const { selected, t, ui } = useMockup();
  return (
    <div className={s.helpColumn}>
      {selected && <HelpCard node={selected} />}
      <ReferSection node={selected} />
      <MockupNote ui={ui} locale={t.locale} />
    </div>
  );
}

function HelpCard({ node }) {
  const { values, data, t, ui } = useMockup();
  const helpMap = node.help ?? (node.type === 'option' ? node.parent?.help : undefined);
  const help = t.text(helpMap);
  const isFallback = Boolean(help) && !t.hasText(helpMap);

  return (
    <aside className={s.help} aria-live="polite" lang={t.locale}>
      <nav className={s.helpPath} aria-label={ui('menuPath')}>
        {breadcrumb(node, data, t)}
      </nav>
      <div className={s.helpHead}>
        <h2 className={s.helpTitle}>{t.label(node)}</h2>
        <span className={s.helpType}>{ui('types')[node.type] ?? node.type}</span>
      </div>
      {help ? (
        <>
          {isFallback && <p className={s.helpFallback}>{ui('fallbackHelp')}</p>}
          <p className={s.helpText} lang={isFallback ? t.source : t.locale}>
            {help}
          </p>
        </>
      ) : (
        <p className={s.helpEmpty}>
          {ui('noHelp')}
          <br />
          {ui('noHelpHint')}
        </p>
      )}
      <Details node={node} values={values} t={t} ui={ui} />
    </aside>
  );
}
