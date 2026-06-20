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
const studentTableBody = document.getElementById("studentTableBody");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const currentDocIdInput = document.getElementById("currentDocId");
let allStudents = [];

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

function displayStudents(students) {

  const grouped = {};

  students.forEach(student => {
    const year = student.graduateYear || "ไม่ระบุปี";

    if (!grouped[year]) {
      grouped[year] = [];
    }

    grouped[year].push(student);
  });

  const years = Object.keys(grouped).sort((a,b) => b - a);

  let html = "";

  years.forEach((year,index)=>{

    const panelId = `panel-${index}`;

    html += `
      <div class="year-folder">

        <div class="folder-title"
             onclick="toggleYear('${panelId}')">

          <div>ปีการศึกษา ${year}</div>
          <div>${grouped[year].length} คน</div>

        </div>

        <div id="${panelId}"
             class="folder-content"
             style="display:none;">
    `;

    grouped[year]
      .sort((a,b)=>Number(a.pp1No||0)-Number(b.pp1No||0))
      .forEach(student=>{

        html += `
          <div class="student-card">

            <div class="student-header"
     style="text-align:center; font-weight:600;"
     onclick="toggleStudent('student-${student.id}')">

              <span>
                ${student.prefix || ''} ${student.firstname || ''} ${student.lastname || ''}
              </span>

              <span>▸</span>

            </div>

            <div id="student-${student.id}"
                 class="student-detail-box"
                 style="display:none;">

              <div class="detail-row">
                <span>ปพ.1 ชุดที่</span>
                <strong>${student.pp1Set || '-'}</strong>
              </div>

              <div class="detail-row">
                <span>เลขที่</span>
                <strong>${student.pp1No || '-'}</strong>
              </div>

              <div class="detail-row">
                <span>เลขบัตรประชาชน</span>
                <strong>${student.idCard || '-'}</strong>
              </div>

              <div class="detail-row">
                <span>รหัสนักเรียน</span>
                <strong>${student.studentId || '-'}</strong>
              </div>

              <div class="detail-row">
                <span>ชั้นเรียน</span>
                <strong>${student.classroom || '-'}</strong>
              </div>

              <div class="action-group">

                ${student.imageUrl ? `
                <a href="${student.imageUrl}"
                   target="_blank"
                   class="btn-action btn-view">
                   ดูเอกสาร
                </a>
                ` : ''}

                <button
                  class="btn-action btn-edit btn-edit-action"
                  data-id="${student.id}">
                  แก้ไข
                </button>

                <button
                  class="btn-action btn-delete btn-delete-action"
                  data-id="${student.id}">
                  ลบ
                </button>

              </div>

            </div>

          </div>
        `;
      });

    html += `
        </div>
      </div>
    `;
  });

  adminStudentTableBody.innerHTML = html;

  addTableEventHandlers();
}

async function fetchStudentsAdmin() {
  if (!adminStudentTableBody) return;

  try {
    const querySnapshot = await getDocs(collection(db, "students"));

    const students = [];

    querySnapshot.forEach((docSnap) => {
      students.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    allStudents = students;

   displayStudents(students);

  } catch (error) {
    console.error(error);
    adminStudentTableBody.innerHTML =
      `<div style="text-align:center;color:red;">โหลดข้อมูลไม่สำเร็จ</div>`;
  }
}
// วางไว้ช่วงนี้ (ก่อนบรรทัดที่ขึ้นต้นด้วย function resetFormToInsertMode)
const diplomaFile = document.getElementById("diplomaFile");

if (diplomaFile) {
  diplomaFile.addEventListener("change", function(e) {

    const file = e.target.files[0];
    const previewContainer =
      document.getElementById("imagePreviewContainer");

    const previewImage =
      document.getElementById("imagePreview");

    if (file) {
      const reader = new FileReader();

      reader.onload = function(event) {
        previewImage.src = event.target.result;
        previewContainer.style.display = "block";
      };

      reader.readAsDataURL(file);

    } else {
      previewContainer.style.display = "none";
    }
  });
}

function addTableEventHandlers() {
  document.querySelectorAll(".btn-edit-action").forEach(button => {
    button.addEventListener("click", async (e) => {
      const docId = e.target.getAttribute("data-id");
      const docSnap = await getDoc(doc(db, "students", docId));
        if (docSnap.exists()) {
          const s = docSnap.data();

          currentDocIdInput.value = docId;

          document.getElementById("studentId").value = s.studentId;
          document.getElementById("idCard").value = s.idCard || "";
          document.getElementById("prefix").value = s.prefix;
          document.getElementById("firstname").value = s.firstname;
          document.getElementById("lastname").value = s.lastname;
          document.getElementById("graduateYear").value = s.graduateYear;
          document.getElementById("classroom").value = s.classroom;
          document.getElementById("pp1Set").value = s.pp1Set || "";
          document.getElementById("pp1No").value = s.pp1No || "";

          // 🔥 ตรงนี้คือสำคัญ
          if (s.imageUrl) {
            studentPhotoPreview.src = s.imageUrl;
            studentPhotoPreviewContainer.style.display = "flex";
            studentPhotoPreview.style.objectFit = "cover";
          } else {
            studentPhotoPreviewContainer.style.display = "none";
          }
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
    const photoFile =
    document.getElementById("studentPhoto").files[0];

    Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      let imageUrl = "";
      if (file) imageUrl = await uploadImage(file);
      let photoUrl = "";

if (photoFile) {
  photoUrl = await uploadImage(photoFile);
}

const studentData = {
  studentId: document.getElementById("studentId").value,
  idCard: document.getElementById("idCard").value,
  prefix: document.getElementById("prefix").value,
  firstname: document.getElementById("firstname").value,
  lastname: document.getElementById("lastname").value,
  graduateYear: document.getElementById("graduateYear").value,
  classroom: document.getElementById("classroom").value,
  pp1Set: document.getElementById("pp1Set").value,
  pp1No: document.getElementById("pp1No").value,

  imageUrl: photoUrl || "",   // 🔥 ใช้ชื่อเดียวกับ Firestore
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
  document.getElementById("pp1Set").value = "";
  document.getElementById("pp1No").value = "";
  currentDocIdInput.value = "";
  formTitle.innerText = "เพิ่มข้อมูลนักเรียนใหม่";
  submitBtn.innerText = "บันทึกข้อมูลศิษย์เก่า";
  formTitle.innerText = "เพิ่มข้อมูลนักเรียนใหม่";
  cancelBtn.style.display = "none";
  document.getElementById("imagePreviewContainer").style.display = "none";
}

if (cancelBtn) cancelBtn.addEventListener("click", resetFormToInsertMode);
document.addEventListener("DOMContentLoaded", fetchStudentsAdmin);

window.toggleYear = function(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.display =
    (el.style.display === "none" || el.style.display === "")
      ? "block"
      : "none";
};

window.toggleStudent = function(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.display =
    el.style.display === "none"
      ? "block"
      : "none";
};

function handleSearch() {

  console.log("ค้นหาแล้ว");

  const keyword = document
    .getElementById("searchInput")
    .value
    .trim()
    .toLowerCase();

  console.log("keyword =", keyword);
  console.log("allStudents =", allStudents);

  const filtered = allStudents.filter(student =>

    (student.firstname || '').toLowerCase().includes(keyword) ||
    (student.lastname || '').toLowerCase().includes(keyword) ||
    (student.idCard || '').includes(keyword) ||
    (student.studentId || '').includes(keyword) ||
    (student.graduateYear || '').includes(keyword)

  );

  displayStudents(filtered);
}

function renderSearchResult(students) {

  const grouped = {};

  students.forEach(student => {
    const year = student.graduateYear || "ไม่ระบุปี";

    if (!grouped[year]) {
      grouped[year] = [];
    }

    grouped[year].push(student);
  });

  const years = Object.keys(grouped).sort((a, b) => b - a);

  let html = "";

  years.forEach((year, index) => {

    const panelId = `search-panel-${index}`;

    html += `
      <div class="year-folder">

        <div class="folder-title"
             onclick="toggleYear('${panelId}')">

          <div>ปีการศึกษา ${year}</div>
          <div>${grouped[year].length} คน ▾</div>

        </div>

        <div id="${panelId}"
             class="folder-content"
             style="display:block;">
    `;

    grouped[year]
      .sort((a, b) => Number(a.pp1No || 0) - Number(b.pp1No || 0))
      .forEach(student => {

        html += `
        <div class="student-card">

  <!-- รูปนักเรียน -->
  <div style="text-align:center;">
  <img ...>
  <div>${student.firstname} ${student.lastname}</div>
</div>
  <div style="text-align:center; padding-top:10px;">
    <img 
      src="${student.photoUrl || 'https://placehold.co/120x120?text=No+Photo'}"
      alt="student photo"
      style="
        width:90px;
        height:90px;
        object-fit:cover;
        border-radius:50%;
        border:3px solid #e5e7eb;
        margin-bottom:10px;
      "
    >
  </div>
          <div id="student-${student.id}"
               class="student-detail-box"
               style="display:none;">

            <div class="detail-row">
              <span>ปพ.1 ชุดที่</span>
              <strong>${student.pp1Set || '-'}</strong>
            </div>

            <div class="detail-row">
              <span>เลขที่</span>
              <strong>${student.pp1No || '-'}</strong>
            </div>

            <div class="detail-row">
              <span>เลขบัตรประชาชน</span>
              <strong>${student.idCard || '-'}</strong>
            </div>

            <div class="detail-row">
              <span>รหัสนักเรียน</span>
              <strong>${student.studentId || '-'}</strong>
            </div>

            <div class="detail-row">
              <span>ชั้นเรียน</span>
              <strong>${student.classroom || '-'}</strong>
            </div>

            <div class="action-group">

              ${student.imageUrl ? `
              <a href="${student.imageUrl}"
                 target="_blank"
                 class="btn-action btn-view">
                 ดูเอกสาร
              </a>
              ` : ''}

              <button class="btn-action btn-edit btn-edit-action"
                      data-id="${student.id}">
                แก้ไข
              </button>

              <button class="btn-action btn-delete btn-delete-action"
                      data-id="${student.id}">
                ลบ
              </button>

            </div>

          </div>

        </div>
        `;
      });

    html += `
        </div>
      </div>
    `;
  });

  if (html === "") {
    html = `
      <div style="
        text-align:center;
        padding:30px;
        color:#64748b;
      ">
        ไม่พบข้อมูลที่ค้นหา
      </div>
    `;
  }

  adminStudentTableBody.innerHTML = html;

  addTableEventHandlers();
}

document.addEventListener("click", (e) => {

  if (e.target.id === "searchBtn") {
    handleSearch();
  }

});

document.addEventListener("DOMContentLoaded", () => {

  fetchStudentsAdmin();

  const searchBtn =
    document.getElementById("searchBtn");

  if (searchBtn) {
    searchBtn.addEventListener("click", handleSearch);
  }

  const searchInput =
    document.getElementById("searchInput");

  if (searchInput) {

    searchInput.addEventListener("keypress", (e) => {

      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }

    });

  }

});
