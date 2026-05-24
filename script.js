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
    console.log("ผลลัพธ์การอัปโหลดจาก ImgBB:", result); 
    
    if (result.success) {
      console.log("อัปโหลดสำเร็จ! ลิงก์รูปคือ:", result.data.url);
      return result.data.url; 
    } else {
      console.error("ImgBB ปฏิเสธการอัปโหลด:", result.error.message);
      throw new Error(result.error.message || "อัปโหลดรูปภาพไม่สำเร็จ");
    }
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ ImgBB:", err);
    throw err; 
  }
}

// 3. ดักจับเหตุการณ์ตอนกดปุ่ม "บันทึกข้อมูลศิษย์เก่า"
document.addEventListener("DOMContentLoaded", () => {
  // หาฟอร์มในหน้าเว็บแอดมิน
  const alumniForm = document.querySelector("form") || document.getElementById("alumniForm");

  if (alumniForm) {
    alumniForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // หยุดการรีเฟรชหน้าจอ
      console.log("กำลังเริ่มกระบวนการบันทึกข้อมูล...");

      // ดึงค่าจากช่องอินพุตต่างๆ (อิงตาม ID ของคุณในหน้าจอ)
      const studentId = document.getElementById("studentId")?.value || "";
      const prefix = document.getElementById("title")?.value || ""; // คำนำหน้า เช่น เด็กชาย
      const firstname = document.getElementById("firstname")?.value || document.querySelector("input[placeholder='กรอกชื่อ']")?.value || "";
      const lastname = document.getElementById("lastname")?.value || document.querySelector("input[placeholder='กรอกนามสกุล']")?.value || "";
      const graduateYear = document.getElementById("graduateYear")?.value || document.querySelector("input[placeholder='2566']")?.value || "";
      const classroom = document.getElementById("classroom")?.value || document.querySelector("input[placeholder='ป.6/1']")?.value || "";
      
      // หาช่องเลือกรูปภาพ
      const imageInput = document.querySelector("input[type='file']");    
      const file = imageInput?.files[0];

      if (!file) {
        alert("กรุณาเลือกรูปภาพใบจบการศึกษาก่อนบันทึกครับ");
        return;
      }

      try {
        // แสดงสถานะใน Console ว่ากำลังอัปโหลดรูป
        console.log("กำลังส่งรูปภาพไปเก็บที่ ImgBB...");
        
        // 1. อัปโหลดรูปไป ImgBB ก่อนเพื่อเอาลิงก์ URL
        const imageUrl = await uploadImage(file);

        if (!imageUrl) {
          alert("ไม่สามารถดึงลิงก์รูปภาพจาก ImgBB ได้");
          return;
        }

        // 2. จัดเตรียมโครงสร้างข้อมูลให้ตรงกับฐานข้อมูลเดิมของคุณ
        const studentData = {
          studentId: studentId,
          prefix: prefix,
          firstname: firstname,
          lastname: lastname,
          graduateYear: graduateYear,
          classroom: classroom,
          imageUrl: imageUrl, // ใส่ลิงก์รูปภาพที่อัปโหลดได้จาก ImgBB ลงตรงนี้
          createdAt: new Date()
        };

        console.log("กำลังบันทึกข้อมูลทั้งหมดลง Firebase:", studentData);

        // 3. ยิงข้อมูลทั้งหมดเข้าไปบันทึกในคอลเลกชัน "students" บน Firestore
        await addDoc(collection(db, "students"), studentData);

        console.log("บันทึกข้อมูลศิษย์เก่าลงฐานข้อมูลสำเร็จเรียบร้อย!");
        alert("🎉 บันทึกข้อมูลศิษย์เก่าสำเร็จเรียบร้อยแล้วครับ!");
        
        // ล้างข้อมูลในฟอร์มหลังจากเซฟเสร็จ
        alumniForm.reset();

      } catch (error) {
        console.error("เกิดข้อผิดพลาดในระบบ:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
      }
    });
  } else {
    console.error("ไม่พบแท็ก <form> ในหน้า HTML กรุณาตรวจสอบโครงสร้างหน้าเว็บ");
  }
});
