import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// ประกาศตัวแปร Global
let allStudents = [];
const studentForm = document.getElementById("studentForm");
const adminStudentTableBody = document.getElementById("adminStudentTableBody");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const currentDocIdInput = document.getElementById("currentDocId");

// ฟังก์ชันอัปโหลดรูปภาพ
async function uploadImage(file) {
  if (!file) return "";
  const apiKey = '9104e68e3a436ecc3ab10a3cb31c350a'; 
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: 'POST', body: formData });
  const result = await response.json();
  if (result.success) return result.data.url;
  throw new Error("อัปโหลดรูปภาพไม่สำเร็จ");
}

// ฟังก์ชันดึงข้อมูลและอัปเดตสถิติ
async function fetchStudentsAdmin() {
  if (!adminStudentTableBody) return;
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    allStudents = [];
    let html = '';
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      allStudents.push({ id: docSnap.id, ...data });
      html += `
        <tr>
          <td>${data.studentId || '-'}</td>
          <td>${data.prefix || ''}${data.firstname || ''} ${data.lastname || ''}</td>
          <td>${data.classroom || '-'}</td>
          <td>${data.graduateYear || '-'}</td>
          <td style="text-align:center;">
            <button class="btn-edit-action" data-id="${docSnap.id}">แก้ไข</button>
            <button class="btn-delete-action" data-id="${docSnap.id}">ลบ</button>
          </td>
        </tr>`;
    });

    // อัปเดตสถิติ Dashboard
    document.getElementById('totalStudents').innerText = allStudents.length + " คน";
    const years = allStudents.map(s => parseInt(s.graduateYear) || 0);
    document.getElementById('latestYear').innerText = years.length > 0 ? Math.max(...years) : "-";

    adminStudentTableBody.innerHTML = html || '<tr><td colspan="5" style="text-align:center;">ไม่มีข้อมูล</td></tr>';
    addTableEventHandlers();
  } catch (error) {
    console.error(error);
  }
}

// ฟังก์ชันส่งออก CSV
window.exportToCSV = function() {
  let csv = 'รหัสนักเรียน,ชื่อ,นามสกุล,ชั้น,ปีที่จบ\n';
  allStudents.forEach(s => {
    csv += `${s.studentId},${s.firstname},${s.lastname},${s.classroom},${s.graduateYear}\n`;
  });
  const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'alumni_data.csv';
  a.click();
};

// จัดการเหตุการณ์ในตาราง
function addTableEventHandlers() {
  document.querySelectorAll(".btn-edit-action").forEach(btn => btn.addEventListener("click", async (e) => {
    const s = allStudents.find(x => x.id === e.target.dataset.id);
    document.getElementById("studentId").value = s.studentId;
    document.getElementById("firstname").value = s.firstname;
    document.getElementById("lastname").value = s.lastname;
    document.getElementById("graduateYear").value = s.graduateYear;
    document.getElementById("classroom").value = s.classroom;
    currentDocIdInput.value = s.id;
    formTitle.innerText = "แก้ไขข้อมูลศิษย์เก่า";
    cancelBtn.style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }));

  document.querySelectorAll(".btn-delete-action").forEach(btn => btn.addEventListener("click", async (e) => {
    const docId = e.target.dataset.id;
    if (confirm("ยืนยันการลบ?")) {
      await deleteDoc(doc(db, "students", docId));
      fetchStudentsAdmin();
    }
  }));
}

studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
  try {
    const file = document.getElementById("diplomaFile").files[0];
    let imageUrl = file ? await uploadImage(file) : "";
    
    const data = {
      studentId: document.getElementById("studentId").value,
      firstname: document.getElementById("firstname").value,
      lastname: document.getElementById("lastname").value,
      graduateYear: document.getElementById("graduateYear").value,
      classroom: document.getElementById("classroom").value
    };
    if (imageUrl) data.imageUrl = imageUrl;

    if (currentDocIdInput.value) {
      await updateDoc(doc(db, "students", currentDocIdInput.value), data);
    } else {
      await addDoc(collection(db, "students"), { ...data, createdAt: new Date() });
    }
    Swal.close();
    resetFormToInsertMode();
    fetchStudentsAdmin();
  } catch (err) {
    Swal.fire('ผิดพลาด', err.message, 'error');
  }
});

function resetFormToInsertMode() {
  studentForm.reset();
  currentDocIdInput.value = "";
  formTitle.innerText = "เพิ่มข้อมูลนักเรียนใหม่";
  cancelBtn.style.display = "none";
  document.getElementById("imagePreviewContainer").style.display = "none";
}

cancelBtn.addEventListener("click", resetFormToInsertMode);
document.addEventListener("DOMContentLoaded", fetchStudentsAdmin);
