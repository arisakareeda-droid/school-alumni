async function uploadImage(file) {
  if (!file) return "";
  const apiKey = '6d207e02198a847aa98d0a2a901485a5';
  const formData = new FormData();
  formData.append('source', file);

  try {
    const response = await fetch(`https://freeimage.host/api/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log("ผลลัพธ์จากเซิร์ฟเวอร์:", result); // <-- สำคัญมาก: เปิด Console (F12) ดูตัวนี้

    if (result.status_code === 200) {
      return result.image.url;
    } else {
      // แจ้งเตือนข้อความที่เซิร์ฟเวอร์ส่งกลับมาจริงๆ
      throw new Error(result.error?.message || "ไม่สามารถอัปโหลดได้");
    }
  } catch (err) {
    console.error("Error:", err);
    Swal.fire({
      icon: 'error',
      title: 'อัปโหลดไม่ผ่าน',
      text: err.message,
      confirmButtonColor: '#166534'
    });
    return "";
  }
}
