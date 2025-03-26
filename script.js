const video = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvas = canvasElement.getContext('2d');
const loader = document.getElementById('loader');

// Meminta akses ke kamera dengan mode belakang (environment)
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // agar tidak fullscreen di iOS
    video.play();
    loader.innerText = "Arahkan kamera ke QR Code...";
    requestAnimationFrame(tick);
  })
  .catch(err => {
    console.error("Error mengakses kamera:", err);
    loader.innerText = "Tidak dapat mengakses kamera.";
  });

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    loader.style.display = "none";
    
    // Menyesuaikan ukuran canvas dengan video
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    
    // Mengambil data gambar dari canvas
    const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    
    // Deteksi QR Code menggunakan jsQR
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    
    if (code) {
      console.log("QR Code terdeteksi:", code.data);
      // Hentikan stream kamera setelah QR Code terdeteksi
      video.srcObject.getTracks().forEach(track => track.stop());
      // Arahkan browser ke URL yang ada pada data QR
      window.location.href = code.data;
      return;
    }
  }
  requestAnimationFrame(tick);
}
