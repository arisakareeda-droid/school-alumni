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

// -------------------- ฉีด CSS เข้าไปให้หน้าเว็บโดยไม่ต้องแก้ HTML --------------------
const style = document.createElement('style');
style.innerHTML = `
  .folder-container { display: flex; flex-direction: column; gap: 20px; margin-top: 10px; }
  .year-folder { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border-left: 8px solid #166534; }
  .folder-title { background: #f1f5f9; padding: 15px 20px; font-size: 1.1rem; font-weight: 700; color: #166534; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; }
  .student-item { padding: 15px 20px; border-bottom: 1px solid #f8fafc; display: flex; justify-content: space-between; align-items: center; }
  .student-item:last-child { border-bottom: none; }
`;
document.head.appendChild(style);

// -------------------- Render ฟังก์ชันใหม่ --------------------
function renderTable(data) {
    const container = document.getElementById('studentTableBody');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:20px;">ไม่พบข้อมูลศิษย์เก่า</p>`;
        return;
    }

    // จัดกลุ่มตามปี
    const grouped = data.reduce((acc, student) => {
        const year = student.graduateYear || "ไม่ระบุปี";
        if (!acc[year]) acc[year] = [];
        acc[year].push(student);
        return acc;
    }, {});

    const sortedYears = Object.keys(grouped).sort((a, b) => b - a);

    let html = '<div class="folder-container">';
    sortedYears.forEach(year => {
        html += `
            <div class="year-folder">
                <div class="folder-title">📁 ปีการศึกษาที่จบ: ${year}</div>
                ${grouped[year].map(student => `
                    <div class="student-item">
                        <div>
                            <strong>${student.prefix || ''}${student.firstname || ''} ${student.lastname || ''}</strong><br>
                            <small style="color:#64748b;">รหัส: ${student.studentId || '-'} | ชั้น: ${student.classroom || '-'} | เลขบัตร: ${student.idCard || '-'}</small>
                        </div>
                        ${student.imageUrl ? `<a href="${student.imageUrl}" target="_blank" class="search-custom-btn" style="padding:6px 12px; font-size:12px; text-decoration:none;">ดูใบจบ</a>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    });
    html += '</div>';
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
    const id = (student.studentId || '').toString();
    const year = (student.graduateYear || '').toString();
    const idCard = (student.idCard || '').toString();
    if (searchText === "") return true;
    return fullName.includes(searchText) || id.includes(searchText) || year.includes(searchText) || idCard.includes(searchText);
  });
  resultTitle.textContent = 'ผลการค้นหาข้อมูลนักเรียน';
  renderTable(filtered);
}

if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleSearch(); });
}

fetchStudents();
