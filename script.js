import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// -------------------- Firebase Config --------------------
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

// -------------------- Elements --------------------
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultTitle = document.getElementById('resultTitle');
let allStudents = [];

// -------------------- Render ฟังก์ชันใหม่ --------------------
function renderTable(data) {

  const container = document.getElementById("studentTableBody");

  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:30px;color:#64748b;">
        ไม่พบข้อมูลที่ค้นหา
      </div>
    `;
    return;
  }

  const grouped = {};

  data.forEach(student => {

    const year = student.graduateYear || "ไม่ระบุปี";

    if (!grouped[year]) {
      grouped[year] = [];
    }

    grouped[year].push(student);

  });

  const years = Object.keys(grouped).sort((a,b)=>{
  if(isNaN(a)) return 1;
  if(isNaN(b)) return -1;
  return Number(b)-Number(a);
  });

  let html = "";

  years.forEach((year,index)=>{

    const panelId = `panel-${index}`;

          html += `
            <div class="alumni-year-folder">

<div class="alumni-folder-title"
     onclick="toggleYear('${panelId}')">

    <div class="alumni-year-label">
        ปีการศึกษา ${year}
    </div>

    <div class="alumni-count-label">
        ${grouped[year].length} คน
    </div>

</div>

<div id="${panelId}"
     class="alumni-folder-content"
     style="display:none;">
          `;

          grouped[year]
            .sort((a,b)=>Number(a.pp1No||0)-Number(b.pp1No||0))
            .forEach(student=>{

              html += `
      <div class="student-card">

          <div class="student-header"
              onclick="toggleStudent('student-${student.id}')">

              <div class="student-name-section">

                  <div class="student-avatar">
                    ${
                      student.photoUrl
                      ? `<img src="${student.photoUrl}" alt="รูปนักเรียน">`
                      : `👨‍🎓`
                    }
                </div>

                  <div>

                      <div class="student-name">
                          ${student.prefix || ''} ${student.firstname || ''} ${student.lastname || ''}
                      </div>

                  </div>

              </div>

              <span class="arrow">▾</span>

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

              ${
                student.imageUrl
                ? `
                <div class="action-group">
                  <a href="${student.imageUrl}"
                    target="_blank"
                    class="btn-action btn-view">
                    ดูเอกสาร
                  </a>
                </div>
                `
                : ""
              }

          </div>

      </div>
      `;
      });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// -------------------- โหลดข้อมูล --------------------
async function fetchStudents() {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    allStudents = [];
    querySnapshot.forEach((doc) => {
      allStudents.push({ id: doc.id, ...doc.data() });
    });
    renderTable(allStudents);
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    if (studentTableBody) studentTableBody.innerHTML = `<p style="color:red; text-align:center;">ไม่สามารถโหลดข้อมูลได้</p>`;
  }
}

// -------------------- ค้นหา --------------------
function handleSearch() {
  const searchText = searchInput.value.toLowerCase().trim();
  const filtered = allStudents.filter(student => {
    const fullName = `${student.firstname || ''} ${student.lastname || ''}`.toLowerCase();
    const classroom = (student.classroom || '').toLowerCase();
    const id = (student.studentId || '').toString();
    const year = (student.graduateYear || '').toString();
    const idCard = (student.idCard || '').toString();
    if (searchText === "") return true;
    return (
    fullName.includes(searchText) ||
    id.includes(searchText) ||
    year.includes(searchText) ||
    idCard.includes(searchText) ||
    classroom.includes(searchText)
);
  });
  resultTitle.textContent = 'ผลการค้นหาข้อมูลนักเรียน';
  renderTable(filtered);
}

if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleSearch(); });
}

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

fetchStudents();
