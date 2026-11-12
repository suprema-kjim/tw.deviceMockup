import { useEffect, useState } from 'react';
import s from './layout.module.css';

// 장치 화면을 실제 해상도(screen.width x screen.height px)로 그린 뒤, 창 크기에 맞게 통째로 축소한다.
// 그래서 YAML 의 좌표·테마 크기는 모두 장치 px 로 적으면 된다.
function useFitScale(width, height) {
  const compute = () => {
    if (typeof window === 'undefined') return 0.5;
    const maxH = window.innerHeight - 120;
    const maxW = window.innerWidth > 1000 ? window.innerWidth * 0.55 : window.innerWidth - 32;
    return Math.min(1, maxH / height, maxW / width);
  };
  const [scale, setScale] = useState(compute);
  useEffect(() => {
    const onResize = () => setScale(compute());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);
  return scale;
}

export function DeviceFrame({ screen, theme, children }) {
  const bezel = Math.round(Math.min(screen.width, screen.height) * 0.035);
  const outerW = screen.width + bezel * 2;
  const outerH = screen.height + bezel * 2;
  const scale = useFitScale(outerW, outerH);

  return (
    <div className={s.frameBox} style={{ width: outerW * scale, height: outerH * scale }}>
      <div
        className={`${s.frame} mockup-screen`}
        data-theme={theme}
        style={{ width: outerW, height: outerH, padding: bezel, transform: `scale(${scale})` }}
      >
        <div className={s.screen} style={{ width: screen.width, height: screen.height }}>
          {children}
        </div>
      </div>
    </div>
  );
}
