import { useState, useEffect } from "react";

export default function Home() {
  const [ascii, setAscii] = useState("");
  const [chars, setChars] = useState("♥");
  const [isProcessing, setIsProcessing] = useState(false);
  const [renderWidth, setRenderWidth] = useState(120);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const isMobile =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
        navigator.userAgent
      );
    if (isMobile) setShowWarning(true);

    const updateWidth = () =>
      setRenderWidth(window.innerWidth <= 768 ? 80 : 120);

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

      const data = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;

      let html = `<div class="ascii-content">`;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = (r + g + b) / 3;

        const index = Math.floor(
          (gray / 255) * (chars.length - 1)
        );
        const char = chars[index] || chars[0];

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

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  background:#0d020d;
  margin:0;
  display:flex;
  justify-content:center;
  align-items:center;
  min-height:100vh;
  color:#ffdae9;
}
.ascii-content {
  background:#000;
  font-family:monospace;
  font-size:${isMobile ? "2.2vw" : "8px"};
  line-height:1;
  white-space:pre;
  padding:25px;
  border-radius:25px;
}
</style>
</head>
<body>${ascii}</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "dream_pixels.html";
    a.click();

    URL.revokeObjectURL(url);
  };

  const buttons = [
    { label: "Сердечки", value: "♥" },
    { label: "Лепестки", value: "%" },
    { label: "Кружево", value: "@#S%?*+;:." }
  ];

  return (
    <div className="app-container">
      {showWarning && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">💻</div>
            <p>Лучше открывать на компьютере</p>
            <button className="modal-btn" onClick={() => setShowWarning(false)}>
              Ок
            </button>
          </div>
        </div>
      )}

      <div className="glass-panel">
        <h1 className="main-title">🌸 DREAM PIXELS</h1>
        <p className="sub-title">магия в каждом пикселе</p>

        <label htmlFor="upload" className="file-label">
          {isProcessing ? "✨ Колдуем..." : "✨ Выбрать фото"}
        </label>
        <input
          id="upload"
          type="file"
          accept="image/*"
          onChange={(e) => processImage(e.target.files[0])}
          hidden
        />

        <div className="controls">
          {buttons.map((b) => (
            <button
              key={b.value}
              className={`btn-glass ${
                chars === b.value ? "active" : ""
              }`}
              onClick={() => setChars(b.value)}
            >
              {b.label}
            </button>
          ))}
        </div>

        {ascii && (
          <>
            <button className="download-btn" onClick={downloadHtml}>
              💾 Скачать HTML
            </button>
            <div className="ascii-scroll-box">
              <div dangerouslySetInnerHTML={{ __html: ascii }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
