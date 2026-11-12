import { useEffect, useState } from 'react';
import { assetUrl } from '../../lib/tree.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Hotspot } from './Hotspot.jsx';
import s from './screens.module.css';

// 화면 이미지 + 이미지 위 hotspot. 이미지 폭은 화면 폭과 같으므로 hotspot 좌표는 화면 px 그대로 쓴다.
// image 는 언어별로 다를 수 있다 (image: { ko: a.png, en: a-en.png }).
export function ImageView({ node, hotspots = [] }) {
  const { t, ui } = useMockup();
  const file = t.text(node.image);
  const src = assetUrl(file);
  const [failed, setFailed] = useState(null);
  useEffect(() => setFailed(null), [src]);
  const missing = !src || failed === src;
  const title = t.title(node);

  return (
    <div className={s.imageView}>
      {missing ? (
        <div className={s.placeholder}>
          <strong>{title}</strong>
          <span>{file ? ui('imageMissing', { file }) : ui('imageNotSet')}</span>
        </div>
      ) : (
        <img className={s.image} src={src} alt={title} onError={() => setFailed(src)} />
      )}
      {hotspots.map((h) => (
        <Hotspot key={h.key} node={h} showLabel={missing} />
      ))}
    </div>
  );
}
