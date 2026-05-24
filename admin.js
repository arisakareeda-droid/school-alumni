// ฟังก์ชันบันทึกข้อมูล (แทนที่ตัวเดิมได้เลย)
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.innerText = "กำลังประมวลผลรูป...";
  submitBtn.disabled = true;

  const fileInput = document.getElementById('diplomaFile');
  const file = fileInput.files[0];
  
  // ฟังก์ชันอ่านไฟล์เป็น Base64
  const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  let base64Image = "";
  if (file) {
    try {
      base64Image = await getBase64(file);
    } catch (err) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถอ่านไฟล์รูปได้', 'error');
      submitBtn.innerText = "บันทึกข้อมูลศิษย์เก่า";
      submitBtn.disabled = false;
      return;
    }
  }

  const studentData = {
    studentId: document.getElementById('studentId').value,
    prefix: document.getElementById('prefix').value,
    firstname: document.getElementById('firstname').value,
    lastname: document.getElementById('lastname').value,
    graduateYear: document.getElementById('graduateYear').value,
    classroom: document.getElementById('classroom').value,
    imageUrl: base64Image // เก็บรูปในรูปแบบรหัสข้อความ
  };

  try {
    const docId = document.getElementById('currentDocId').value;
    if (isEditing) {
      await updateDoc(doc(db, "students", docId), studentData);
      Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
    } else {
      await addDoc(collection(db, "students"), studentData);
      Swal.fire('สำเร็จ', 'เพิ่มข้อมูลศิษย์เก่าเรียบร้อยแล้ว', 'success');
    }
    studentForm.reset();
    loadAdminData();
  } catch (error) {
    Swal.fire('ผิดพลาด', 'บันทึกข้อมูลล้มเหลว', 'error');
  } finally {
    submitBtn.innerText = "บันทึกข้อมูลศิษย์เก่า";
    submitBtn.disabled = false;
  }
});
