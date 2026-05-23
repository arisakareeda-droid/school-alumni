// นำเข้าโมดูล Firebase สำหรับเชื่อมต่อฐานข้อมูล
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

let allStudents = []; // กล่องสำหรับเก็บข้อมูลนักเรียนทั้งหมดที่ดึงมาจากฐานข้อมูล

// ฟังก์ชันดึงข้อมูลจาก Firebase Firestore
async function fetchStudents() {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    allStudents = [];
    
    querySnapshot.forEach((doc) => {
      allStudents.push({ id: doc.id, ...doc.data() });
    });
    
    renderTable(allStudents);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    studentTableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบการตั้งค่าฐานข้อมูล</td></tr>`;
  }
}

// ฟังก์ชันนำข้อมูลไปเขียนแสดงผลในตารางบนหน้าเว็บ
function renderTable(data) {
  if (data.length === 0) {
    studentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">ไม่พบข้อมูลศิษย์เก่าที่ค้นหา</td></tr>`;
    return;
  }

  let html = '';
  data.forEach((student) => {
    html += `
      <tr>
        <td>${student.studentId || '-'}</td>
        <td>${student.prefix || ''}${student.firstname} ${student.lastname}</td>
        <td>${student.graduateYear}</td>
        <td>${student.classroom || '-'}</td>
        <td>
          ${student.imageUrl ? `<a href="${student.imageUrl}" target="_blank" class="btn-view">ดูใบจบ</a>` : 'ไม่มีรูป'}
        </td>
      </tr>
    `;
  });
  studentTableBody.innerHTML = html;
}

// ระบบพิมพ์ค้นหาข้อมูลแบบทันใจ (ค้นหาจาก ชื่อ, นามสกุล, รหัส หรือปีที่จบ ได้หมด)
function handleSearch() {
  const searchText = searchInput.value.toLowerCase().trim();
  const filtered = allStudents.filter(student => {
    const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
    const id = (student.studentId || '').toString();
    const year = student.graduateYear.toString();
    
    return fullName.includes(searchText) || id.includes(searchText) || year.includes(searchText);
  });
  renderTable(filtered);
}

// ผูกเหตุการณ์คลิกปุ่มค้นหา และการกดปุ่ม Enter
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') handleSearch();
});

// ให้ระบบเริ่มดึงข้อมูลทันทีที่เปิดหน้าเว็บ
fetchStudents();
