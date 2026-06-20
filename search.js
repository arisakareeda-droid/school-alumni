import { db } from './firebase-config.js';

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allStudents = [];

async function loadStudents() {

    const querySnapshot = await getDocs(collection(db, "students"));

    querySnapshot.forEach((docSnap) => {
        allStudents.push(docSnap.data());
    });

}

loadStudents();

document.getElementById("searchBtn")
.addEventListener("click", () => {

    const input = document
        .getElementById("searchInput")
        .value
        .trim();

    const tbody = document.getElementById("studentTableBody");

    if (input === "") {

        tbody.innerHTML = `
        <div class="search-result-card">
            <div class="search-result-name" style="color:#dc2626;">
                ❌ กรุณากรอกข้อมูลที่ต้องการค้นหา
            </div>
        </div>
        `;

        return;
    }

    const results = allStudents.filter(s =>
        s.idCard?.includes(input) ||
        s.firstname?.includes(input) ||
        s.lastname?.includes(input) ||
        s.graduateYear?.toString().includes(input)
    );

    if (results.length > 0) {

        tbody.innerHTML = results.map(student => `
        <div class="search-result-card">

            <div class="search-result-name">

            <div class="student-photo">

                ${
                    student.photoUrl
                    ? `<img src="${student.photoUrl}" alt="">`
                    : `👤`
                }

            </div>

            <div>

                ${student.prefix || ""}
                ${student.firstname || ""}
                ${student.lastname || ""}

            </div>

           </div>

            <div class="search-result-row">
                🪪 เลขบัตรประชาชน : ${student.idCard || "-"}
            </div>

            <div class="search-result-row">
                🏫 ชั้นเรียน : ${student.classroom || "-"}
            </div>

            <div class="search-result-row">
                🎓 ปีที่จบ : ${student.graduateYear || "-"}
            </div>

        </div>
        `).join("");

    } else {

        tbody.innerHTML = `
        <div class="search-result-card">

            <div class="search-result-name" style="color:#dc2626;">
                ❌ ไม่พบข้อมูล
            </div>

            <div class="search-result-row">
                ไม่พบข้อมูลที่ค้นหาในระบบ
            </div>

        </div>
        `;
    }

});
