import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './themes/_base.css';
import './page.css';

// src/themes/*.css 를 모두 불러온다. 새 테마는 파일만 추가하면 된다.
import.meta.glob('./themes/*.css', { eager: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
