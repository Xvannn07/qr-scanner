const video = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvas = canvasElement.getContext('2d');
const loader = document.getElementById('loader');

// Fungsi untuk meminta akses kamera
function requestCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // agar tidak fullscreen di iOS
      video.play();
      loader.innerText = "Arahkan kamera ke QR Code...";
      // Hapus tombol jika sudah ada
      const existingBtn = document.getElementById('openCameraBtn');
      if (existingBtn) existingBtn.remove();
      requestAnimationFrame(tick);
    })
    .catch(err => {
      console.error("Error mengakses kamera:", err);
      if (err.name === "NotAllowedError") {
        loader.innerText = "Akses kamera ditolak. Silakan aktifkan akses kamera di browser Anda.";
        // Jika tombol belum ada, buat tombol untuk membuka kamera
        if (!document.getElementById('openCameraBtn')) {
          const openCameraBtn = document.createElement('button');
          openCameraBtn.id = "openCameraBtn";
          openCameraBtn.innerText = "Buka Kamera";
          openCameraBtn.onclick = requestCamera;
          loader.appendChild(openCameraBtn);
        }
      } else {
        loader.innerText = "Tidak dapat mengakses kamera.";
      }
    });
}

// Panggil fungsi untuk pertama kali
requestCamera();

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    loader.style.display = "none";
    
    // Sesuaikan ukuran canvas dengan video
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    
    // Ambil data gambar dari canvas
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
