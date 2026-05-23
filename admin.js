// นำเข้าโมดูล Firebase เฉพาะตัวสำหรับฐานข้อมูล Firestore (เซฟพื้นที่และใช้งานฟรีตลอดชีพ)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDA6VlDShC5-3XMCSdpbVMnkKkLEhGf_xY",
  authDomain: "school-alumni-system-a7ccf.firebaseapp.com",
  projectId: "school-alumni-system-a7ccf",
  storageBucket: "school-alumni-system-a7ccf.firebasestorage.app",
  messagingSenderId: "431697154857",
  appId: "1:431697154857:web:6ee940ad8f899560525d38",
  measurementId: "G-RT50BXY1TP"
};

// เริ่มต้นใช้งาน Firebase Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const studentForm = document.getElementById('studentForm');
const adminStudentTableBody = document.getElementById('adminStudentTableBody');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');

let allStudents = [];
let isEditing = false; // ตัวแปรเช็กว่าตอนนี้กำลังอยู่ในโหมด "แก้ไข" หรือไม่

// 1. ฟังก์ชันดึงข้อมูลจากฐานข้อมูลมาแสดงในตารางหลังบ้าน
async function loadAdminData() {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    allStudents = [];
    adminStudentTableBody.innerHTML = '';
    
    querySnapshot.forEach((doc) => {
      allStudents.push({ id: doc.id, ...doc.data() });
    });

    if (allStudents.length === 0) {
      // 🟢 ปรับให้ช่องcolspanขยายเป็น 5 ช่องให้เต็มหน้าตารางใหม่พอดี
      adminStudentTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">ยังไม่มีข้อมูลนักเรียนในระบบ</td></tr>`;
      return;
    }

    allStudents.forEach((student) => {
      const tr = document.createElement('tr');
      // 🟢 เพิ่มข้อมูลห้องเรียนตารางช่องที่ 3 ตรงนี้เรียบร้อยแล้ว ข้อมูลจะไม่เยื้องแล้วค่ะ
      tr.innerHTML = `
        <td>${student.studentId || '-'}</td>
        <td>${student.prefix || ''}${student.firstname} ${student.lastname}</td>
        <td>${student.classroom || '-'}</td>
        <td>${student.graduateYear}</td>
        <td>
          <button class="btn-edit" data-id="${student.id}" style="background:#eab308; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-right:5px;">✏️ แก้ไข</button>
          <button class="btn-delete" data-id="${student.id}" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">🗑️ ลบ</button>
        </td>
      `;
      adminStudentTableBody.appendChild(tr);
    });

    // ผูกเหตุการณ์คลิกให้กับปุ่มแก้ไขและลบทุกปุ่ม
    document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', setupEdit));
    document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', handleDelete));

  } catch (error) {
    console.error("Error loading admin data: ", error);
    adminStudentTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">โหลดข้อมูลล้มเหลว</td></tr>`;
  }
}

// 2. ฟังก์ชันแอบอัปโหลดรูปภาพไปยัง FreeImage.host ผ่านระบบ API (ฟรี 100% ไม่จำกัดจำนวนรูป)
async function uploadImage(file) {
  if (!file) return "";
  
  const apiKey = '6d207e02198a847aa98d0a2a901485a5'; // รหัส API Key ของคุณอาริสา
  const formData = new FormData();
  formData.append('source', file); // ใช้ 'source' ตามโครงสร้างข้อกำหนดของเว็บ FreeImageHost

  try {
    const response = await fetch(`https://freeimage.host/api/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error("ระบบคลาวด์ฝากรูปรบกวนส่งไฟล์ใหม่อีกครั้ง");
    }

    const result = await response.json();
    return result.image.url; // ส่งลิงก์รูปภาพโดยตรง (Direct URL) กลับไปบันทึกลง Firestore
  } catch (err) {
    console.error("อัปโหลดรูปภาพผิดพลาด: ", err);
    alert("ระบบไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้งค่ะ");
    return "";
  }
}

// 3. ระบบบันทึกข้อมูล (รองรับทั้ง เพิ่มใหม่ และ อัปเดตของเก่า)
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.innerText = "⏳ กำลังอัปโหลดรูปและบันทึกข้อมูล...";
  submitBtn.disabled = true;

  const file = document.getElementById('diplomaFile').files[0];
  let imageUrl = "";

  try {
    // ถ้ารวมถึงระบบกดเลือกรูปภาพ ให้แอบส่งไปเก็บที่คลาวด์ฝากรูปฟรีอัตโนมัติ
    if (file) {
      imageUrl = await uploadImage(file);
    }

    const studentData = {
      studentId: document.getElementById('studentId').value,
      prefix: document.getElementById('prefix').value,
      firstname: document.getElementById('firstname').value,
      lastname: document.getElementById('lastname').value,
      graduateYear: document.getElementById('graduateYear').value,
      classroom: document.getElementById('classroom').value,
    };

    // ถ้ามีการอัปโหลดรูปภาพสำเร็จ ให้บันทึกลิงก์รูปภาพลงไปในตารางข้อความ
    if (imageUrl) {
      studentData.imageUrl = imageUrl;
    }

    const docId = document.getElementById('currentDocId').value;

    if (isEditing) {
      // 🟢 โหมดแก้ไขข้อมูลเก่า
      const docRef = doc(db, "students", docId);
      await updateDoc(docRef, studentData);
      alert("✏️ แก้ไขข้อมูลนักเรียนเรียบร้อยแล้ว!");
      resetForm();
    } else {
      // 🔵 โหมดเพิ่มข้อมูลใหม่
      if (!imageUrl) studentData.imageUrl = ""; // ถ้าไม่ได้แนบรูป ให้มีค่าเป็นค่าว่าง
      await addDoc(collection(db, "students"), studentData);
      alert("🎉 เพิ่มข้อมูลศิษย์เก่าสำเร็จ!");
      studentForm.reset();
    }

    loadAdminData(); // โหลดตารางใหม่เพื่อให้เห็นข้อมูลล่าสุด

  } catch (error) {
    console.error("Error saving data: ", error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  } finally {
    submitBtn.innerText = "💾 บันทึกข้อมูล";
    submitBtn.disabled = false;
  }
});

// 4. ฟังก์ชันเตรียมข้อมูลใส่ฟอร์มเมื่อแอดมินกดปุ่ม "แก้ไข"
function setupEdit(e) {
  const id = e.target.getAttribute('data-id');
  const student = allStudents.find(s => s.id === id);
  
  if (student) {
    isEditing = true;
    formTitle.innerText = "✏️ แก้ไขข้อมูลนักเรียน";
    submitBtn.innerText = "🔄 อัปเดตข้อมูล";
    cancelBtn.style.display = "inline-block";

    // ดึงค่าเก่าจากฐานข้อมูลมาหยอดลงช่องอินพุตในฟอร์ม
    document.getElementById('currentDocId').value = student.id;
    document.getElementById('studentId').value = student.studentId || '';
    document.getElementById('prefix').value = student.prefix || '';
    document.getElementById('firstname').value = student.firstname || '';
    document.getElementById('lastname').value = student.lastname || '';
    document.getElementById('graduateYear').value = student.graduateYear || '';
    document.getElementById('classroom').value = student.classroom || '';
  }
}

// 5. ฟังก์ชันลบข้อมูลเมื่อกดปุ่ม "ลบ"
async function handleDelete(e) {
  const id = e.target.getAttribute('data-id');
  if (confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลศิษย์เก่าคนนี้? หากลบแล้วจะไม่สามารถกู้คืนได้")) {
    try {
      await deleteDoc(doc(db, "students", id));
      alert("🗑️ ลบข้อมูลสำเร็จเรียบร้อย!");
      loadAdminData();
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("ไม่สามารถลบข้อมูลได้");
    }
  }
}

// ฟังก์ชันล้างฟอร์มให้กลับมาเป็นโหมดเพิ่มข้อมูลใหม่
function resetForm() {
  isEditing = false;
  formTitle.innerText = "➕ เพิ่มข้อมูลนักเรียนใหม่";
  submitBtn.innerText = "💾 บันทึกข้อมูล";
  cancelBtn.style.display = "none";
  studentForm.reset();
  document.getElementById('currentDocId').value = "";
}

cancelBtn.addEventListener('click', resetForm);

// สั่งให้โหลดข้อมูลมาแสดงในตารางทันทีที่เปิดหน้าจอแอดมิน
loadAdminData();