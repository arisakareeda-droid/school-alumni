// 1. ฟังก์ชันอัปโหลดรูปภาพผ่าน ImgBB
async function uploadImage(file) {
  if (!file) return "";
  
  const apiKey = '9104e68e3a436ecc3ab10a3cb31c350a'; 
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log("ผลลัพธ์การอัปโหลดจาก ImgBB:", result); 
    
    if (result.success) {
      console.log("อัปโหลดสำเร็จ! ลิงก์รูปคือ:", result.data.url);
      return result.data.url; 
    } else {
      console.error("ImgBB ปฏิเสธการอัปโหลด:", result.error.message);
      throw new Error(result.error.message || "อัปโหลดไม่สำเร็จ");
    }
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ ImgBB:", err);
    throw err; 
  }
}

// 2. ดักจับเหตุการณ์ตอนกดปุ่ม "บันทึกข้อมูลศิษย์เก่า"
document.addEventListener("DOMContentLoaded", () => {
  // หาฟอร์มในหน้าเว็บ (แก้ ID ให้ตรงกับฟอร์มใน HTML ของคุณ ถ้าใช้ชื่ออื่น)
  const alumniForm = document.querySelector("form") || document.getElementById("alumniForm");

  if (alumniForm) {
    alumniForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // หยุดการรีเฟรชหน้าจอ เค้าจะดึงข้อมูลเอง!
      console.log("กำลังเริ่มกระบวนการบันทึกข้อมูล...");

      // ดึงค่าจาก input ต่างๆ ในหน้าเว็บ
      const studentId = document.getElementById("studentId")?.value || ""; // ไอดีรหัสนักเรียน
      const title = document.getElementById("title")?.value || "";         // คำนำหน้า
      const imageInput = document.querySelector("input[type='file']");    // ช่องเลือกรูปภาพ
      const file = imageInput?.files[0];

      if (!file) {
        alert("กรุณาเลือกรูปภาพก่อนบันทึกครับ");
        return;
      }

      try {
        // เริ่มอัปโหลดรูปไป ImgBB
        console.log("กำลังอัปโหลดไฟล์รูปภาพ...");
        const imageUrl = await uploadImage(file);

        if (!imageUrl) {
          alert("ไม่สามารถดึงลิงก์รูปภาพได้");
          return;
        }

        // เตรียมข้อมูลบันทึกส่งต่อให้ Firebase (อิงตามฟิลด์เดิมที่คุณเคยทำไว้)
        const alumniData = {
          studentId: studentId,
          title: title,
          imageUrl: imageUrl, // ได้ลิงก์รูปภาพจาก ImgBB เรียบร้อย
          createdAt: new Date()
        };

        console.log("ข้อมูลที่จะถูกบันทึกลง Firebase:", alumniData);

        // หมายเหตุ: บรรทัดนี้ใช้เรียกฟังก์ชันบันทึก Firebase เดิมของคุณ (เช่น db.collection หรือ addDoc)
        // หากคุณเชื่อมต่อ Firebase ไว้ในไฟล์อื่น ให้ส่งข้อมูล alumniData นี้ไปบันทึกต่อได้เลยครับ
        alert("อัปโหลดรูปภาพสำเร็จแล้ว! ลิงก์รูปคือ: " + imageUrl);

      } catch (error) {
        console.error("เกิดข้อผิดพลาดในระบบ:", error);
        alert("บันทึกข้อมูลไม่สำเร็จ: " + error.message);
      }
    });
  } else {
    console.error("ไม่พบฟอร์มกรอกข้อมูลบนหน้า HTML กรุณาเช็คปุ่มและแท็กฟอร์มอีกครั้ง");
  }
});
