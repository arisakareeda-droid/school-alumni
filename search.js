import { db } from './firebase-config.js';

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allStudents = [];

async function loadStudents(){

  const querySnapshot = await getDocs(collection(db, "students"));

  querySnapshot.forEach((docSnap)=>{

    allStudents.push(docSnap.data());

  });

}

loadStudents();

document.getElementById("searchBtn")
.addEventListener("click", ()=>{

  const input = document
  .getElementById("searchInput")
  .value
  .trim();

  const student = allStudents.find(
    s => s.idCard === input
  );

  const tbody = document.getElementById("studentTableBody");

  if(student){

    tbody.innerHTML = `
    <tr>

      <td>
        ${student.prefix}
        ${student.firstname}
        ${student.lastname}
      </td>

      <td>${student.classroom}</td>

      <td>${student.graduateYear}</td>

    </tr>
    `;

  } else {

    tbody.innerHTML = `
    <tr>
      <td colspan="3">
        ไม่พบข้อมูล
      </td>
    </tr>
    `;
  }

});
