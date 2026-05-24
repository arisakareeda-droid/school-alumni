// ฟังก์ชันอัปโหลดรูปภาพผ่าน ImgBB (เวอร์ชันตรวจสอบสถานะได้)
async function uploadImage(file) {
  if (!file) return "";
  
  // *** ใส่ API Key ของคุณที่นี่ (เปลี่ยนจากข้อความนี้เป็น Key จริงของคุณ) ***
  const apiKey = '9104e68e3a436ecc3ab10a3cb31c350a'; 
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    // --- จุดตรวจสอบ ---
    console.log("ผลลัพธ์การอัปโหลดจาก ImgBB:", result); 
    
    if (result.success) {
      console.log("อัปโหลดสำเร็จ! ลิงก์รูปคือ:", result.data.url);
      return result.data.url; 
    } else {
      console.error("ImgBB ปฏิเสธการอัปโหลด:", result.error.message);
      throw new Error(result.error.message || "อัปโหลดไม่สำเร็จ");
    }
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ:", err);
    throw err; 
  }
}
