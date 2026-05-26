import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. ตรวจสอบสิทธิ์ (ถ้ายังไม่ล็อกอิน ให้ดีดออกไปหน้า login.html)
if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
  window.location.href = 'login.html';
}

const firebaseConfig = {
  apiKey: "AIzaSyDA6VlDShC5-3XMCSdpbVMnkKkLEhGf_xY",
  authDomain: "school-alumni-system-a7ccf.firebaseapp.com",
  projectId: "school-alumni-system-a7ccf",
  storageBucket: "school-alumni-system-a7ccf.firebasestorage.app",
  messagingSenderId: "431697154857",
  appId: "1:431697154857:web:6ee940ad8f899560525d38",
  measurementId: "G-RT50BXY1TP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const studentForm = document.getElementById("studentForm");
const adminStudentTableBody = document.getElementById("adminStudentTableBody");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const currentDocIdInput = document.getElementById("currentDocId");

async function uploadImage(file) {
  if (!file) return "";
  const apiKey = '9104e68e3a436ecc3ab10a3cb31c350a'; 
  const formData = new FormData();
  formData.append('image', file);
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: 'POST', body: formData });
    const result = await response.json();
    if (result.success) return result.data.url;
    throw new Error(result.error.message || "อัปโหลดรูปภาพไม่สำเร็จ");
  } catch (err) { throw err; }
}
async function fetchStudentsAdmin() {
  if (!adminStudentTableBody) return;
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    let html = '';
    
    if (querySnapshot.empty) {
      adminStudentTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">ยังไม่มีข้อมูลนักเรียนในระบบ</td></tr>`;
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const student = docSnap.data();
      const docId = docSnap.id;
      // เพิ่มบรรทัดที่แสดงผล student.idCard ในตาราง
      html += `
        <tr>
          <td>${student.idCard || '-'}</td>
          <td>${student.studentId || '-'}</td>
          <td>${student.prefix || ''}${student.firstname || ''} ${student.lastname || ''}</td>
          <td>${student.classroom || '-'}</td>
          <td>${student.graduateYear || '-'}</td>
          <td style="text-align:center;">
            <div style="display:flex; gap:6px; justify-content:center;">
              ${student.imageUrl ? `<a href="${student.imageUrl}" target="_blank" style="color:#166534; font-weight:600; text-decoration:none; background:#e2f0d9; padding:4px 8px; border-radius:4px;">ดูรูป</a>` : ''}
              <button class="btn-edit-action" data-id="${docId}" style="background-color:#e0f2fe; color:#0369a1; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">แก้ไข</button>
              <button class="btn-delete-action" data-id="${docId}" style="background-color:#fee2e2; color:#b91c1c; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">ลบ</button>
            </div>
          </td>
        </tr>
      `;
    });
    adminStudentTableBody.innerHTML = html;
    addTableEventHandlers();
  } catch (error) {
    adminStudentTableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">ไม่สามารถดึงข้อมูลได้</td></tr>`;
  }
}

function addTableEventHandlers() {
  document.querySelectorAll(".btn-edit-action").forEach(button => {
    button.addEventListener("click", async (e) => {
      const docId = e.target.getAttribute("data-id");
      const docSnap = await getDoc(doc(db, "students", docId));
      if (docSnap.exists()) {
        const s = docSnap.data();
        document.getElementById("studentId").value = s.studentId;
        document.getElementById("idCard").value = s.idCard || ""; // ดึงเลขบัตรมาด้วย
        document.getElementById("prefix").value = s.prefix;
        document.getElementById("firstname").value = s.firstname;
        document.getElementById("lastname").value = s.lastname;
        document.getElementById("graduateYear").value = s.graduateYear;
        document.getElementById("classroom").value = s.classroom;
        currentDocIdInput.value = docId;
        formTitle.innerText = "แก้ไขข้อมูลศิษย์เก่า";
        submitBtn.innerText = "บันทึกการแก้ไขข้อมูล";
        cancelBtn.style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll(".btn-delete-action").forEach(button => {
    button.addEventListener("click", (e) => {
      const docId = e.target.getAttribute("data-id");
      Swal.fire({
        title: 'ยืนยันการลบ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบเลย',
        cancelButtonText: 'ยกเลิก'
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
          await deleteDoc(doc(db, "students", docId));
          Swal.fire({ icon: 'success', title: 'ลบสำเร็จ!', timer: 1500 });
          fetchStudentsAdmin();
        }
      });
    });
  });
}

if (studentForm) {
  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = currentDocIdInput.value;
    const file = document.getElementById("diplomaFile").files[0];

    Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      let imageUrl = "";
      if (file) imageUrl = await uploadImage(file);
      const studentData = {
        studentId: document.getElementById("studentId").value,
        idCard: document.getElementById("idCard").value, // บันทึกเลขบัตร
        prefix: document.getElementById("prefix").value,
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value,
        graduateYear: document.getElementById("graduateYear").value,
        classroom: document.getElementById("classroom").value,
        updatedAt: new Date()
      };
      if (imageUrl) studentData.imageUrl = imageUrl;

      if (docId) {
        await updateDoc(doc(db, "students", docId), studentData);
      } else {
        if (!file) throw new Error("กรุณาเลือกไฟล์รูปภาพใบจบการศึกษา");
        studentData.imageUrl = imageUrl;
        studentData.createdAt = new Date();
        await addDoc(collection(db, "students"), studentData);
      }
      Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ!', timer: 1500 });
      resetFormToInsertMode();
      fetchStudentsAdmin();
    } catch (error) {
      Swal.fire('ผิดพลาด', error.message, 'error');
    }
  });
}

function resetFormToInsertMode() {
  studentForm.reset();
  currentDocIdInput.value = "";
  formTitle.innerText = "เพิ่มข้อมูลนักเรียนใหม่";
  submitBtn.innerText = "บันทึกข้อมูลศิษย์เก่า";
  cancelBtn.style.display = "none";
}

if (cancelBtn) cancelBtn.addEventListener("click", resetFormToInsertMode);
document.addEventListener("DOMContentLoaded", fetchStudentsAdmin);
