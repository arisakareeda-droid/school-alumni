import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = { /* ใส่ค่า config ของคุณ */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allStudents = [];
async function loadData() {
  const querySnapshot = await getDocs(collection(db, "students"));
  querySnapshot.forEach(doc => allStudents.push(doc.data()));
}
loadData();

document.getElementById('searchBtn').addEventListener('click', () => {
  const input = document.getElementById('searchInput').value.trim();
  const student = allStudents.find(s => s.idCard === input);
  const tbody = document.getElementById('studentTableBody');
  
  if (student) {
    tbody.innerHTML = `<tr><td>${student.firstname} ${student.lastname}</td><td>${student.classroom}</td><td><a href="${student.imageUrl}" target="_blank">ดูใบจบ</a></td></tr>`;
  } else {
    Swal.fire('ไม่พบข้อมูล', 'โปรดตรวจสอบเลขบัตรประชาชน', 'error');
  }
});
