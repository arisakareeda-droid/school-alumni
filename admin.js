// 1. นำเข้าโมดูล Firebase สำหรับเชื่อมต่อฐานข้อมูล
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ตั้งค่า Firebase (คอนฟิกประจำโปรเจกต์ของคุณ)
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

// ประกาศตัวแปรสำหรับตารางฝั่งแอดมิน
let studentTableBodyAdmin = null;

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

// 3. ฟังก์ชันดึงข้อมูลจาก Firebase มาแสดงในตารางหน้าแอดมิน (ฝั่งขวา)
async function fetchStudentsAdmin() {
  studentTableBodyAdmin = document.getElementById('studentTableBody') || document.querySelector(".custom-table tbody") || document.querySelector("table tbody");
  
  if (!studentTableBodyAdmin) return;

  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    let html = '';
    
    if (querySnapshot.empty) {
      studentTableBodyAdmin.innerHTML = `<tr><td colspan="5" style="text-align:center;">ยังไม่มีข้อมูลนักเรียนในระบบ</td></tr>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      const student = doc.data();
      html += `
        <tr>
          <td>${student.studentId || '-'}</td>
          <td>${student.prefix || ''}${student.firstname || ''} ${student.lastname || ''}</td>
          <td>${student.classroom || '-'}</td>
          <td>${student.graduateYear || '-'}</td>
          <td style="text-align:center;">
            ${student.imageUrl ? `<a href="${student.imageUrl}" target="_blank" style="color:#166534; font-weight:600; text-decoration:none;">ดูใบจบ</a>` : 'ไม่มีรูป'}
          </td>
        </tr>
      `;
    });
    
    studentTableBodyAdmin.innerHTML = html;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    studentTableBodyAdmin.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">ไม่สามารถดึงข้อมูลจาก Firebase ได้</td></tr>`;
  }
}

// 4. ทำงานเมื่อโหลดหน้าเว็บสำเร็จ
document.addEventListener("DOMContentLoaded", () => {
  // สั่งให้โหลดรายชื่อมาแสดงในตารางฝั่งขวาทันทีเมื่อเปิดหน้าเว็บ
  fetchStudentsAdmin();

  const alumniForm = document.querySelector("form") || document.getElementById("alumniForm");

  if (alumniForm) {
    alumniForm.addEventListener("submit", async (e) => {
      e.preventDefault(); 
      console.log("กำลังเริ่มกระบวนการบันทึกข้อมูล...");

      // ดึงค่าตามลำดับช่องกรอกข้อมูลในหน้าเว็บเพื่อป้องกัน ID ผิดพลาด
      const inputs = alumniForm.querySelectorAll("input");
      const select = alumniForm.querySelector("select");

      const studentId = inputs[0]?.value || "";      
      const prefix = select?.value || "เด็กชาย";       
      const firstname = inputs[1]?.value || "";     
      const lastname = inputs[2]?.value || "";      
      const graduateYear = inputs[3]?.value || "";  
      const classroom = inputs[4]?.value || "";     
      
      const imageInput = alumniForm.querySelector("input[type='file']");    
      const file = imageInput?.files[0];

      if (!file) {
        alert("กรุณาเลือกรูปภาพใบจบการศึกษาก่อนบันทึกครับ");
        return;
      }

      try {
        // เปลี่ยนข้อความปุ่มระหว่างอัปโหลดป้องกันการกดซ้ำ
        const submitBtn = alumniForm.querySelector("button[type='submit']") || alumniForm.querySelector(".btn-submit");
        const originalBtnText = submitBtn ? submitBtn.innerText : "บันทึกข้อมูลศิษย์เก่า";
        if (submitBtn) { submitBtn.innerText = "กำลังบันทึกข้อมูล... กรุณารอสักครู่"; submitBtn.disabled = true; }

        console.log("กำลังส่งรูปภาพไปเก็บที่ ImgBB...");
        const imageUrl = await uploadImage(file);

        if (!imageUrl) {
          alert("ไม่สามารถดึงลิงก์รูปภาพจาก ImgBB ได้");
          if (submitBtn) { submitBtn.innerText = originalBtnText; submitBtn.disabled = false; }
          return;
        }

        // จัดโครงสร้างข้อมูลให้ตรงกับตารางแสดงผล
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

        console.log("กำลังเซฟข้อมูลลง Firebase:", studentData);

        // ยิงข้อมูลเข้าคอลเลกชัน "students"
        await addDoc(collection(db, "students"), studentData);

        alert("🎉 บันทึกข้อมูลศิษย์เก่าและอัปโหลดรูปภาพสำเร็จเรียบร้อยแล้วครับ!");
        
        // ล้างฟอร์มกรอกข้อมูลเดิมออก
        alumniForm.reset();
        
        // คืนค่าปุ่มบันทึก
        if (submitBtn) { submitBtn.innerText = originalBtnText; submitBtn.disabled = false; }

        // สั่งให้ตารางฝั่งขวาอัปเดตข้อมูลดึงรายชื่อใหม่ล่าสุดทันทีโดยไม่ต้องรีเฟรชหน้าจอ!
        fetchStudentsAdmin();

      } catch (error) {
        console.error("เกิดข้อผิดพลาดในระบบ:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
        const submitBtn = alumniForm.querySelector("button[type='submit']");
        if (submitBtn) { submitBtn.disabled = false; }
      }
    });
  }
});
