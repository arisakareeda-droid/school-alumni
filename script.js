// โค้ดสำหรับไฟล์ script.js (หน้าแรก)
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

let allStudents = []; 

// ฟังก์ชันดึงข้อมูลศิษย์เก่ามาแสดง
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
    if(studentTableBody) {
      studentTableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">ไม่สามารถโหลดข้อมูลได้ กรุณาเปิด Rules สิทธิ์การเข้าถึงหลังบ้าน Firebase</td></tr>`;
    }
  }
}

function renderTable(data) {
  if (!studentTableBody) return;
  
  // Empty State: แจ้งเตือนเมื่อไม่พบรายชื่อ
  if (data.length === 0) {
    studentTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 3rem; color: #64748b;">
          <div style="font-size: 2rem; margin-bottom: 10px;">🔍</div>
          <strong>ขออภัย ไม่พบรายชื่อที่ค้นหา</strong><br>
          กรุณาตรวจสอบชื่อ หรือปีที่จบการศึกษาใหม่อีกครั้งครับ
        </td>
      </tr>`;
    return;
  }

  let html = '';
  data.forEach((student) => {
    html += `
      <tr>
        <td>${student.studentId || '-'}</td>
        <td>${student.prefix || ''}${student.firstname || ''} ${student.lastname || ''}</td>
        <td>${student.classroom || '-'}</td>
        <td>${student.graduateYear || '-'}</td>
        <td style="text-align:center;">
          ${student.imageUrl ? `<a href="${student.imageUrl}" target="_blank" class="search-custom-btn" style="padding: 5px 15px; text-decoration:none; display:inline-block; font-size:13px;">ดูใบจบ</a>` : 'ไม่มีรูป'}
        </td>
      </tr>
    `;
  });
  studentTableBody.innerHTML = html;
}

function handleSearch() {
  const searchText = searchInput.value.toLowerCase().trim();
  const filtered = allStudents.filter(student => {
    const fullName = `${student.firstname || ''} ${student.lastname || ''}`.toLowerCase();
    const id = (student.studentId || '').toString();
    const year = (student.graduateYear || '').toString();
    
    return fullName.includes(searchText) || id.includes(searchText) || year.includes(searchText);
  });
  renderTable(filtered);
}

if(searchBtn && searchInput) {
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

fetchStudents();
