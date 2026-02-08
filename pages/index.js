import { useState, useEffect } from "react";

export default function Home() {
  const [ascii, setAscii] = useState("");
  const [chars, setChars] = useState("♥");
  const [isProcessing, setIsProcessing] = useState(false);
  const [renderWidth, setRenderWidth] = useState(120);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Проверка устройства для предупреждения и настройки детализации
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileDevice) setShowWarning(true);

    const updateWidth = () => setRenderWidth(window.innerWidth <= 768 ? 80 : 120);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const processImage = (file) => {
    if (!file) return;
    setIsProcessing(true);
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const heightScale = 2; 
      const aspect = img.height / img.width / heightScale;
      canvas.width = renderWidth;
      canvas.height = Math.floor(renderWidth * aspect);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let html = `<div class="ascii-content">`;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = (r + g + b) / 3;
        const char = chars[Math.floor((gray / 255) * (chars.length - 1))] || chars[0];

        html += `<span style="color: rgb(${r},${g},${b})">${char}</span>`;
        if ((i / 4 + 1) % canvas.width === 0) html += "<br/>";
      }
      html += "</div>";
      setAscii(html);
      setIsProcessing(false);
      URL.revokeObjectURL(img.src);
    };
  };

  const downloadHtml = () => {
    if (!ascii) return;
    const isMobile = window.innerWidth <= 768;
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { background: #0d020d; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; color: #ffdae9; font-family: monospace; padding: 20px; }
          .ascii-content { background: #000; font-size: ${isMobile ? '2.2vw' : '8px'}; line-height: 1; white-space: pre; padding: 25px; border: 1px solid #ff69b4; border-radius: 25px; box-shadow: 0 0 40px rgba(255, 20, 147, 0.3); overflow-x: auto; max-width: 95vw; }
          h2 { font-family: sans-serif; letter-spacing: 4px; text-shadow: 0 0 10px #ff1493; }
        </style>
      </head>
      <body><h2>🌸 SAKURA ART</h2>${ascii}</body>
      </html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sakura_art.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      {showWarning && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">💻</div>
            <h3>Для лучшего опыта</h3>
            <p>Мы советуем использовать <b>компьютер</b>. На больших экранах магия лепестков выглядит детальнее!</p>
            <button className="modal-btn" onClick={() => setShowWarning(false)}>Продолжить</button>
          </div>
        </div>
      )}

      <div className="glass-panel">
        <h1 className="main-title">🌸 DREAM PIXELS</h1>
        <p className="sub-title">магия сакуры в каждом пикселе</p>

        <label htmlFor="upload" className="file-label">
          {isProcessing ? "✨ Колдуем..." : "✨ Выбрать фото"}
        </label>
        <input id="upload" type="file" accept="image/*" onChange={e => processImage(e.target.files[0])} style={{ display: "none" }} />

        <div className="controls">
          {[{l: "Сердечки", v: "♥"}, {l: "Лепестки", v: "%"}, {l: "Кружево", v: "@#S%?*+;:."}].map((btn) => (
            <button key={btn.v} className={`btn-glass ${chars === btn.v ? "active" : ""}`} onClick={() => setChars(btn.v)}>
              <span className="btn-text-desktop">{btn.l}</span>
              <span className="btn-text-mobile">{btn.v[0]}</span>
            </button>
          ))}
        </div>

        {ascii && (
          <div className="result-area">
            <button className="download-btn" onClick={downloadHtml}>💾 Скачать .HTML</button>
            <div className="ascii-scroll-box">
               <div dangerouslySetInnerHTML={{ __html: ascii }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}