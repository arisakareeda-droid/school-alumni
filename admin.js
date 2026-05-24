// 1. นำเข้าโมดูล Firebase สำหรับเชื่อมต่อฐานข้อมูล
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ตั้งค่า Firebase (ใช้คอนฟิกเดิมของคุณ)
const firebaseConfig = {
  apiKey: "AIzaSyDA6VlDShC5-3XMCSdpbVMnkKkLEhGf_xY",
  authDomain: "school-alumni-system-a7ccf.firebaseapp.com",
  projectId: "school-alumni-system-a7ccf",
  storageBucket: "school-alumni-system-a7ccf.firebasestorage.app",
  messagingSenderId: "431697154857",
  appId: "1:431697154857:web:6ee940ad8f899560525d38",
  measurementId: "G-RT50BXY1TP"
};

// เริ่มต้นใช้งาน Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. ฟังก์ชันอัปโหลดรูปภาพผ่าน ImgBB
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
    if (result.success) {
      return result.data.url; 
    } else {
      throw new Error(result.error.message || "อัปโหลดรูปภาพไม่สำเร็จ");
    }
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ ImgBB:", err);
    throw err; 
  }
}

// 3. ดักจับเหตุการณ์ตอนกดปุ่ม "บันทึกข้อมูลศิษย์เก่า"
document.addEventListener("DOMContentLoaded", () => {
  const alumniForm = document.querySelector("form") || document.getElementById("alumniForm");

  if (alumniForm) {
    alumniForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // หยุดการรีเฟรชหน้าจอ
      console.log("กำลังเริ่มกระบวนการบันทึกข้อมูล...");

      // --- วิธีใหม่: ดึงตามลำดับช่องกรอกในหน้าเว็บตรงๆ เพื่อป้องกันเรื่อง ID ไม่ตรง ---
      const inputs = alumniForm.querySelectorAll("input");
      const select = alumniForm.querySelector("select");

      // ดึงค่าตามลำดับที่ปรากฏบนหน้าจอเว็บของคุณ
      const studentId = inputs[0]?.value || "";      // ช่องที่ 1: รหัสนักเรียน
      const prefix = select?.value || "เด็กชาย";       // ช่อง Dropdown เลือกคำนำหน้า
      const firstname = inputs[1]?.value || "";     // ช่องที่ 2: ชื่อ
      const lastname = inputs[2]?.value || "";      // ช่องที่ 3: นามสกุล
      const graduateYear = inputs[3]?.value || "";  // ช่องที่ 4: ปีที่จบการศึกษา
      const classroom = inputs[4]?.value || "";     // ช่องที่ 5: ห้องเรียน
      
      // ช่องเลือกไฟล์รูปภาพ (อันสุดท้าย)
      const imageInput = alumniForm.querySelector("input[type='file']");    
      const file = imageInput?.files[0];

      if (!file) {
        alert("กรุณาเลือกรูปภาพใบจบการศึกษาก่อนบันทึกครับ");
        return;
      }

      try {
        console.log("กำลังส่งรูปภาพไปเก็บที่ ImgBB...");
        const imageUrl = await uploadImage(file);

        if (!imageUrl) {
          alert("ไม่สามารถดึงลิงก์รูปภาพจาก ImgBB ได้");
          return;
        }

        // จัดเตรียมโครงสร้างข้อมูลให้ตรงเป๊ะกับหน้าแสดงผลตารางศิษย์เก่าของคุณ
        const studentData = {
          studentId: studentId.trim(),
          prefix: prefix,
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          graduateYear: graduateYear.trim(),
          classroom: classroom.trim(),
          imageUrl: imageUrl, 
          createdAt: new Date()
        };

        console.log("กำลังเซฟข้อมูลทั้งหมดลง Firebase:", studentData);

        // ยิงข้อมูลเข้า Firestore ตัวจริงคอลเลกชัน "students"
        await addDoc(collection(db, "students"), studentData);

        alert("🎉 บันทึกข้อมูลศิษย์เก่าและอัปโหลดรูปภาพสำเร็จเรียบร้อยแล้วครับ!");
        alumniForm.reset(); // ล้างฟอร์มกรอกใหม่ได้เลย

      } catch (error) {
        console.error("เกิดข้อผิดพลาดในระบบ:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
      }
    });
  } else {
    console.error("ไม่พบฟอร์มบนหน้า HTML");
  }
});
