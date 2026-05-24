import { db } from './firebase-config.js';

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTableBody");

let allStudents = [];

async function loadStudents(){

  const querySnapshot = await getDocs(collection(db, "students"));

  allStudents = [];

  querySnapshot.forEach((docSnap)=>{

    allStudents.push({
      id: docSnap.id,
      ...docSnap.data()
    });

  });

  renderTable();
}

function renderTable(){

  let html = "";

  allStudents.forEach(student => {

    html += `
    <tr>

      <td>${student.studentId}</td>

      <td>
        ${student.prefix}
        ${student.firstname}
        ${student.lastname}
      </td>

      <td>${student.classroom}</td>

      <td>${student.graduateYear}</td>

      <td>

        <button onclick="editStudent('${student.id}')">
          แก้ไข
        </button>

        <button onclick="deleteStudentData('${student.id}')">
          ลบ
        </button>

      </td>

    </tr>
    `;

  });

  tableBody.innerHTML = html;
}

form.addEventListener("submit", async (e)=>{

  e.preventDefault();

  const studentData = {

    idCard: document.getElementById("idCard").value,

    studentId: document.getElementById("studentId").value,

    prefix: document.getElementById("prefix").value,

    firstname: document.getElementById("firstname").value,

    lastname: document.getElementById("lastname").value,

    classroom: document.getElementById("classroom").value,

    graduateYear: document.getElementById("graduateYear").value

  };

  const docId = document.getElementById("docId").value;

  if(docId){

    await updateDoc(doc(db, "students", docId), studentData);

  } else {

    await addDoc(collection(db, "students"), studentData);

  }

  form.reset();

  loadStudents();

});

window.editStudent = function(id){

  const student = allStudents.find(s => s.id === id);

  document.getElementById("docId").value = student.id;
  document.getElementById("idCard").value = student.idCard;
  document.getElementById("studentId").value = student.studentId;
  document.getElementById("prefix").value = student.prefix;
  document.getElementById("firstname").value = student.firstname;
  document.getElementById("lastname").value = student.lastname;
  document.getElementById("classroom").value = student.classroom;
  document.getElementById("graduateYear").value = student.graduateYear;
}

window.deleteStudentData = async function(id){

  await deleteDoc(doc(db, "students", id));

  loadStudents();
}

loadStudents();
