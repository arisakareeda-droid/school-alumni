import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// ผูก element จากหน้าจอ HTML
const studentForm = document.getElementById("studentForm");
const adminStudentTableBody = document.getElementById("adminStudentTableBody");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const currentDocIdInput = document.getElementById("currentDocId");

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

// 3. ฟังก์ชันดึงรายชื่อมาโชว์ในตารางฝั่งแอดมิน (พร้อมปุ่มแก้ไขและลบ)
async function fetchStudentsAdmin() {
  if (!adminStudentTableBody) return;

  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    let html = '';
    
    if (querySnapshot.empty) {
      adminStudentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">ยังไม่มีข้อมูลนักเรียนในระบบ</td></tr>`;
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const student = docSnap.data();
      const docId = docSnap.id; // ดึง ID ตัวจี๊ดของแถวนั้นจาก Firebase มาเก็บไว้ใช้ลบ/แก้ไข
      
      html += `
        <tr>
          <td>${student.studentId || '-'}</td>
          <td>${student.prefix || ''}${student.firstname || ''} ${student.lastname || ''}</td>
          <td>${student.classroom || '-'}</td>
          <td>${student.graduateYear || '-'}</td>
          <td style="text-align:center;">
            <div style="display:flex; gap:6px; justify-content:center;">
              ${student.imageUrl ? `<a href="${student.imageUrl}" target="_blank" style="color:#166534; font-weight:600; text-decoration:none; background:#e2f0d9; padding:4px 8px; border-radius:4px;">ดูรูป</a>` : ''}
              <button class="btn-edit-action" data-id="${docId}" style="background-color:#e0f2fe; color:#0369a1; border:none; padding:4px 10px; border-radius:4px; font-family:'Sarabun'; font-weight:600; cursor:pointer;">แก้ไข</button>
              <button class="btn-delete-action" data-id="${docId}" style="background-color:#fee2e2; color:#b91c1c; border:none; padding:4px 10px; border-radius:4px; font-family:'Sarabun'; font-weight:600; cursor:pointer;">ลบ</button>
            </div>
          </td>
        </tr>
      `;
    });
    
    adminStudentTableBody.innerHTML = html;

    // ผูกเหตุการณ์เมื่อคลิกปุ่ม แก้ไข หรือ ลบ ในแต่ละแถว
    addTableEventHandlers();

  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    adminStudentTableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">ไม่สามารถดึงข้อมูลจาก Firebase ได้</td></tr>`;
  }
}

// 4. ฟังก์ชันผูกปุ่ม แก้ไข และ ลบ ของตารางเข้ากับระบบงานหลังบ้าน
function addTableEventHandlers() {
  // ดักจับปุ่มแก้ไขข้อมูล
  document.querySelectorAll(".btn-edit-action").forEach(button => {
    button.addEventListener("click", async (e) => {
      const docId = e.target.getAttribute("data-id");
      try {
        const docRef = doc(db, "students", docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const student = docSnap.data();
          
          // นำข้อมูลเก่ามาใส่พ่นลงฟอร์มให้แอดมินเห็น
          document.getElementById("studentId").value = student.studentId || "";
          document.getElementById("prefix").value = student.prefix || "เด็กชาย";
          document.getElementById("firstname").value = student.firstname || "";
          document.getElementById("lastname").value = student.lastname || "";
          document.getElementById("graduateYear").value = student.graduateYear || "";
          document.getElementById("classroom").value = student.classroom || "";
          
          // สลับโหมดฟอร์มให้กลายเป็นโหมด "แก้ไขข้อมูล"
          currentDocIdInput.value = docId;
          formTitle.innerText = "แก้ไขข้อมูลศิษย์เก่า";
          formTitle.parentElement.style.backgroundColor = "#e0f2fe"; 
          formTitle.parentElement.style.borderBottom = "2px solid #bae6fd"; 
          formTitle.style.color = "#0369a1";
          submitBtn.innerText = "บันทึกการแก้ไขข้อมูล";
          submitBtn.style.backgroundColor = "#0284c7";
          cancelBtn.style.display = "block"; // แสดงปุ่มยกเลิก
          
          window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนจอขึ้นหน้าฟอร์มกรอก
        }
      } catch (err) {
        Swal.fire('ผิดพลาด', 'ดึงข้อมูลมาแก้ไขไม่ได้: ' + err.message, 'error');
      }
    });
  });

  // ดักจับปุ่มลบข้อมูล พร้อมเรียกใช้กล่องเตือน SweetAlert2
  document.querySelectorAll(".btn-delete-action").forEach(button => {
    button.addEventListener("click", (e) => {
      const docId = e.target.getAttribute("data-id");
      
      Swal.fire({
        title: 'คุณต้องการลบข้อมูลใช่หรือไม่?',
        text: "หากลบแล้วข้อมูลนี้จะหายไปจากระบบค้นหาทันที!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'ใช่, ฉันต้องการลบ',
        cancelButtonText: 'ยกเลิก'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteDoc(doc(db, "students", docId));
            Swal.fire({
              icon: 'success',
              title: 'ลบข้อมูลสำเร็จ!',
              showConfirmButton: false,
              timer: 1500
            });
            fetchStudentsAdmin(); // สั่งอัปเดตรีเฟรชตารางใหม่ทันที
          } catch (error) {
            Swal.fire('ลบไม่สำเร็จ', error.message, 'error');
          }
        }
      });
    });
  });
}

// 5. จัดการเหตุการณ์ตอนกดปุ่มเซฟส่งฟอร์ม (รองรับทั้งเพิ่มใหม่ และ บันทึกทับตัวเก่า)
if (studentForm) {
  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const docId = currentDocIdInput.value; // ถ้ามีค่าแสดงว่าเป็นงานแก้ไขข้อมูลเดิม
    const submitBtnOriginalText = submitBtn.innerText;
    
    // ดึงค่าตาม ID จากหน้าฟอร์ม
    const studentId = document.getElementById("studentId").value.trim();
    const prefix = document.getElementById("prefix").value;
    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
    const graduateYear = document.getElementById("graduateYear").value.trim();
    const classroom = document.getElementById("classroom").value.trim();
    const fileInput = document.getElementById("diplomaFile");
    const file = fileInput.files[0];

    try {
      submitBtn.innerText = "กำลังดำเนินการ... กรุณารอสักครู่";
      submitBtn.disabled = true;

      let imageUrl = "";
      
      if (file) {
        // ถ้ามีการเลือกรูปภาพใหม่ ให้โหลดขึ้นเว็บ ImgBB
        imageUrl = await uploadImage(file);
      }

      const studentData = {
        studentId: studentId,
        prefix: prefix,
        firstname: firstname,
        lastname: lastname,
        graduateYear: graduateYear,
        classroom: classroom,
        updatedAt: new Date()
      };

      // ถ้ารูปถ่ายอัปโหลดสำเร็จให้ผูกลิงก์ใหม่ลงก้อนข้อมูล
      if (imageUrl) {
        studentData.imageUrl = imageUrl;
      }

      if (docId) {
        // --- ส่วนงานอัปเดตข้อมูลแก้ไขตัวเดิม (UPDATE) ---
        await updateDoc(doc(db, "students", docId), studentData);
        Swal.fire({ icon: 'success', title: 'อัปเดตข้อมูลศิษย์เก่าสำเร็จ!', showConfirmButton: false, timer: 1500 });
        resetFormToInsertMode();
      } else {
        // --- ส่วนงานบันทึกสมาชิกใหม่เพิ่มเข้าฐานข้อมูล (INSERT) ---
        if (!file) {
          Swal.fire('แจ้งเตือน', 'กรุณาแนบรูปใบจบการศึกษาก่อนบันทึกครับ', 'warning');
          submitBtn.innerText = submitBtnOriginalText;
          submitBtn.disabled = false;
          return;
        }
        studentData.imageUrl = imageUrl;
        studentData.createdAt = new Date();
        
        await addDoc(collection(db, "students"), studentData);
        Swal.fire({ icon: 'success', title: 'บันทึกข้อมูลศิษย์เก่าใหม่สำเร็จ!', showConfirmButton: false, timer: 1500 });
        studentForm.reset();
      }

      fetchStudentsAdmin(); // สั่งให้อัปเดตรีเฟรชรายชื่อในตารางฝั่งขวาทันที

    } catch (error) {
      console.error(error);
      Swal.fire('ระบบเกิดข้อผิดพลาด', error.message, 'error');
    } finally {
      submitBtn.innerText = submitBtnOriginalText;
      submitBtn.disabled = false;
    }
  });
}

// ฟังก์ชันล้างฟอร์มกลับเข้าสู่โหมด "เพิ่มนักเรียนใหม่" ปกติ
function resetFormToInsertMode() {
  studentForm.reset();
  currentDocIdInput.value = "";
  formTitle.innerText = "เพิ่มข้อมูลนักเรียนใหม่";
  formTitle.parentElement.style.backgroundColor = "#fef9c3";
  formTitle.parentElement.style.borderBottom = "2px solid #fef08a";
  formTitle.style.color = "#854d0e";
  submitBtn.innerText = "บันทึกข้อมูลศิษย์เก่า";
  submitBtn.style.backgroundColor = "#166534";
  cancelBtn.style.display = "none";
}

// เมื่อกดปุ่มยกเลิกการแก้ไขข้อมูล ให้ดึงกลับมาหน้าเพิ่มข้อมูลใหม่ปกติ
if (cancelBtn) {
  cancelBtn.addEventListener("click", resetFormToInsertMode);
}

// ทำการรันระบบครั้งแรกเมื่อเปิดหน้าเว็บแอดมิน
document.addEventListener("DOMContentLoaded", () => {
  fetchStudentsAdmin();
});
