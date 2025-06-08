const canvas = document.getElementById("qr-canvas");
const ctx = canvas.getContext("2d");
const resultDiv = document.getElementById("result");

// Tamaño del scanner
canvas.width = 300;
canvas.height = 300;

// URL de tu Apps Script (¡Reemplázala!)
const API_URL = "https://script.google.com/macros/s/AKfycbwFHG4atVX5VUNdMfAAcwIVISn84pUCJ7IpqD4Ev6eUrXRFE2GNyOt3G0Yr_OPUdGsW/exec";

// Iniciar cámara
function initCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      video.play();
      requestAnimationFrame(() => scanFrame(video));
    })
    .catch(err => {
      resultDiv.innerHTML = `⚠️ Error: ${err.message}<br>Usa el campo manual`;
    });
}

// Escanear frames
function scanFrame(video) {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) validateQR(code.data);
  }
  requestAnimationFrame(() => scanFrame(video));
}

// Validar con Google Sheets
function validateQR(qrData) {
  resultDiv.innerHTML = "🔍 Validando...";
  
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrCode: qrData })
  })
  .then(response => response.json())
  .then(data => {
    resultDiv.innerHTML = data.message;
    resultDiv.className = data.success ? "success" : "error";
    if (data.success) setTimeout(() => resultDiv.className = "", 3000);
  })
  .catch(error => {
    resultDiv.innerHTML = `📵 Error de conexión<br>Intenta más tarde`;
    resultDiv.className = "error";
  });
}

// Iniciar
initCamera();
