import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// -------------------- ตรวจสอบสิทธิ์ --------------------
document.addEventListener("DOMContentLoaded", () => {
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    const currentPage = window.location.pathname;

    if (currentPage.includes('admin.html') && !isAdmin) {
        window.location.href = 'login.html';
    }
});

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

// -------------------- Firebase --------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -------------------- Elements --------------------
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultTitle = document.getElementById('resultTitle');
const resultSection = document.getElementById('resultSection');
let allStudents = [];

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
    if (studentTableBody) {
      studentTableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">ไม่สามารถโหลดข้อมูลได้</td></tr>`;
    }
  }
}

// --- นำโค้ดนี้ไปแทนที่ฟังก์ชัน renderTable เดิมใน script.js ---

function renderTable(data) {
  if (!studentTableBody) return;
  
  if (data.length === 0) {
    studentTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 4rem 1rem;"><strong>ไม่พบรายชื่อที่ค้นหา</strong></td></tr>`;
    return;
  }

  // 1. จัดกลุ่มข้อมูลตามปีการศึกษา
  const grouped = data.reduce((acc, student) => {
    const year = student.graduateYear || "ไม่ระบุปี";
    if (!acc[year]) acc[year] = [];
    acc[year].push(student);
    return acc;
  }, {});

  // 2. เรียงลำดับปีจากมากไปน้อย (ปีล่าสุดขึ้นก่อน)
  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);

  // 3. สร้าง HTML โดยวนลูปตามกลุ่มปีการศึกษา
  let html = '';
  
  sortedYears.forEach(year => {
    // แถวหัวข้อแยกหมวดหมู่
    html += `
      <tr style="background-color: #f1f5f9;">
        <td colspan="6" style="padding: 12px; font-weight: 700; color: #166534; border-bottom: 2px solid #cbd5e1;">
          ปีการศึกษาที่จบ: ${year}
        </td>
      </tr>
    `;

    // รายชื่อนักเรียนในแต่ละปี
    grouped[year].forEach(student => {
      html += `
        <tr>
          <td>${student.idCard || '-'}</td>
          <td>${student.studentId || '-'}</td>
          <td style="text-align: left; padding-left: 20px;">
            ${student.prefix || ''} ${student.firstname || ''} ${student.lastname || ''}
          </td>
          <td>${student.classroom || '-'}</td>
          <td>${student.graduateYear || '-'}</td>
          <td style="text-align:center;">
            ${student.imageUrl ? `<a href="${student.imageUrl}" target="_blank" class="search-custom-btn" style="padding:5px 15px; text-decoration:none; display:inline-block; font-size:13px;">ดูใบจบ</a>` : '-'}
          </td>
        </tr>
      `;
    });
  });

  studentTableBody.innerHTML = html;
}

// -------------------- ค้นหา (แบบช่องเดียวครอบคลุมทุกข้อมูล) --------------------
function handleSearch() {
  // รับค่าจากช่อง searchInput ช่องเดิมที่คุณมีอยู่แล้ว
  const searchText = searchInput.value.toLowerCase().trim();

  const filtered = allStudents.filter(student => {
    // 1. เตรียมข้อมูลสำหรับค้นหา (แปลงเป็นตัวพิมพ์เล็กและข้อความทั้งหมด)
    const fullName = `${student.firstname || ''} ${student.lastname || ''}`.toLowerCase();
    const id = (student.studentId || '').toString();
    const year = (student.graduateYear || '').toString();
    const idCard = (student.idCard || '').toString(); // ดึงเลขบัตรประชาชนมาเทียบด้วย

    // 2. ถ้าช่องว่าง ให้แสดงทั้งหมด (หรือไม่แสดงก็ได้ตามต้องการ)
    if (searchText === "") return true;

    // 3. ตรวจสอบว่าสิ่งที่พิมพ์ ตรงกับข้อมูลส่วนไหนบ้าง
    return (
      fullName.includes(searchText) || // ค้นหาด้วยชื่อหรือนามสกุล
      id.includes(searchText) ||       // ค้นหาด้วยรหัสนักเรียน
      year.includes(searchText) ||     // ค้นหาด้วยปีที่จบ
      idCard.includes(searchText)      // ค้นหาด้วยเลขบัตรประชาชน
    );
  });

  resultTitle.textContent = 'ผลการค้นหาข้อมูลนักเรียน';
  renderTable(filtered);
}

// -------------------- Events --------------------
if (searchBtn && searchInput) {

  searchBtn.addEventListener('click', handleSearch);

  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

}

// -------------------- เริ่มโหลดข้อมูล --------------------
fetchStudents();
