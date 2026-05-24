// --- สไตล์มาตรฐานสำหรับ SweetAlert2 ให้เข้ากับธีมโรงเรียน ---
const swalConfig = {
  confirmButtonColor: '#166534', // สีเขียวเข้ม (ธีมโรงเรียน)
  cancelButtonColor: '#64748b',   // สีเทา
};

// 1. ฟังก์ชันโหลดข้อมูลล้มเหลว
async function loadAdminData() {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    allStudents = [];
    adminStudentTableBody.innerHTML = '';
    querySnapshot.forEach((doc) => { allStudents.push({ id: doc.id, ...doc.data() }); });

    if (allStudents.length === 0) {
      adminStudentTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">ยังไม่มีข้อมูลนักเรียนในระบบ</td></tr>`;
      return;
    }

    allStudents.forEach((student) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${student.studentId || '-'}</td>
        <td>${student.prefix || ''}${student.firstname} ${student.lastname}</td>
        <td>${student.classroom || '-'}</td>
        <td>${student.graduateYear}</td>
        <td>
          <button class="btn-edit" data-id="${student.id}" style="background:#eab308; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-right:5px;">แก้ไข</button>
          <button class="btn-delete" data-id="${student.id}" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">ลบ</button>
        </td>
      `;
      adminStudentTableBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', setupEdit));
    document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', handleDelete));
  } catch (error) {
    Swal.fire({ ...swalConfig, icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'โหลดข้อมูลล้มเหลว' });
  }
}

// 2. ฟังก์ชันอัปโหลดรูปภาพ
async function uploadImage(file) {
  if (!file) return "";
  const apiKey = '6d207e02198a847aa98d0a2a901485a5';
  const formData = new FormData();
  formData.append('source', file);
  try {
    const response = await fetch(`https://freeimage.host/api/1/upload?key=${apiKey}`, { method: 'POST', body: formData });
    if (!response.ok) throw new Error();
    const result = await response.json();
    return result.image.url;
  } catch (err) {
    Swal.fire({ ...swalConfig, icon: 'error', title: 'อัปโหลดไม่สำเร็จ', text: 'ระบบฝากรูปขัดข้อง กรุณาลองใหม่อีกครั้ง' });
    return "";
  }
}

// 3. ระบบบันทึกข้อมูล
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.innerText = "กำลังดำเนินการ...";
  submitBtn.disabled = true;

  const file = document.getElementById('diplomaFile').files[0];
  let imageUrl = "";

  if (file) {
    imageUrl = await uploadImage(file);
    if (!imageUrl) { submitBtn.innerText = "บันทึกข้อมูลศิษย์เก่า"; submitBtn.disabled = false; return; }
  }

  const studentData = {
    studentId: document.getElementById('studentId').value,
    prefix: document.getElementById('prefix').value,
    firstname: document.getElementById('firstname').value,
    lastname: document.getElementById('lastname').value,
    graduateYear: document.getElementById('graduateYear').value,
    classroom: document.getElementById('classroom').value,
  };
  if (imageUrl) studentData.imageUrl = imageUrl;

  try {
    const docId = document.getElementById('currentDocId').value;
    if (isEditing) {
      await updateDoc(doc(db, "students", docId), studentData);
      Swal.fire({ ...swalConfig, icon: 'success', title: 'สำเร็จ', text: 'แก้ไขข้อมูลเรียบร้อยแล้ว' });
      resetForm();
    } else {
      await addDoc(collection(db, "students"), studentData);
      Swal.fire({ ...swalConfig, icon: 'success', title: 'สำเร็จ', text: 'เพิ่มข้อมูลศิษย์เก่าเรียบร้อยแล้ว' });
      studentForm.reset();
    }
    loadAdminData();
  } catch (error) {
    Swal.fire({ ...swalConfig, icon: 'error', title: 'ผิดพลาด', text: 'ไม่สามารถบันทึกข้อมูลได้' });
  } finally {
    submitBtn.innerText = "บันทึกข้อมูลศิษย์เก่า";
    submitBtn.disabled = false;
  }
});

// 4. ระบบลบข้อมูล
async function handleDelete(e) {
  const id = e.target.getAttribute('data-id');
  Swal.fire({
    title: 'คุณแน่ใจหรือไม่?',
    text: "ข้อมูลนี้จะถูกลบอย่างถาวร!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626', // สีแดงสำหรับการลบ
    cancelButtonColor: '#64748b',
    confirmButtonText: 'ตกลง, ลบเลย!',
    cancelButtonText: 'ยกเลิก'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "students", id));
        Swal.fire({ ...swalConfig, icon: 'success', title: 'ลบสำเร็จ!', text: 'ข้อมูลถูกลบเรียบร้อยแล้ว' });
        loadAdminData();
      } catch (error) {
        Swal.fire({ ...swalConfig, icon: 'error', title: 'ผิดพลาด', text: 'ไม่สามารถลบข้อมูลได้' });
      }
    }
  });
}
// (ส่วนที่เหลือของฟังก์ชัน resetForm และอื่นๆ คงเดิมได้เลยครับ)
