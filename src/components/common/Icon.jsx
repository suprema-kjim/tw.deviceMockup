import { cx } from '../../lib/cx.js';
import s from './common.module.css';

// src/icons/*.svg 파일이 곧 아이콘 목록이다. 파일명(확장자 제외)을 YAML 의 icon 값으로 쓴다.
const RAW = import.meta.glob('../../icons/*.svg', { query: '?raw', import: 'default', eager: true });
const ICONS = Object.fromEntries(
  Object.entries(RAW).map(([path, svg]) => [path.replace(/^.*\/|\.svg$/g, ''), svg]),
);

export function Icon({ name, className }) {
  if (!name) return null;
  const svg = ICONS[name];
  if (!svg) {
    return (
      <span className={cx(s.icon, s.missing, className)} title={`아이콘 없음: ${name}`}>
        ?
      </span>
    );
  }
  return <span className={cx(s.icon, className)} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
