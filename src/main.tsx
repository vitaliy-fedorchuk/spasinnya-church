import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.scss";

// Windows (ClearType/DirectWrite) малює світлий текст на темному фоні товстішим,
// ніж Figma. CSS-властивості згладжування там не діють, тому стилі можуть
// підлаштувати вагу шрифту через цей клас.
if (navigator.userAgent.includes("Windows")) {
  document.documentElement.classList.add("is-windows");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Старт анімації першого екрана (див. HeroSection.scss).
// Чекаємо першого кадру (React уже відрендерив, браузер почав вантажити шрифти),
// потім самі шрифти — щоб текст не «перескакував» із запасного шрифту.
// Подвійний rAF: спершу браузер малює початковий стан, потім вмикаємо перехід.
// Таймаут — запасний варіант, якщо шрифти зависли.
requestAnimationFrame(() => {
  const fontsOrTimeout = Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  fontsOrTimeout.then(() =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.documentElement.classList.add("is-loaded")),
    ),
  );
});
