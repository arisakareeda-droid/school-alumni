<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ค้นหาข้อมูลส่วนตัวศิษย์เก่า</title>

    <link rel="icon" type="image/png" href="logo.png">
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Sarabun', sans-serif;
            background: linear-gradient(135deg, #f0fdf4, #ecfeff);
            margin: 0;
            color: #1e293b;
        }

        /* ================= HEADER ================= */
        .school-header {
            background: linear-gradient(135deg, #166534, #14532d);
            padding: 20px 18px;
            color: white;
            border-bottom: 4px solid #facc15;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .header-container {
            max-width: 1200px;
            margin: auto;
            display: flex;
            align-items: center;
            gap: 18px;
        }

        .school-logo {
            width: 120px;
            height: 120px;
            object-fit: contain;
            background: white;
            padding: 8px;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .title-area h1 {
            margin: 5px 0 0;
            font-size: 30px;
            font-weight: 700;
            line-height: 1.3;
        }

        .title-area h2 {
            margin: 0 0 12px;
            font-size: 18px;
            font-weight: 600;
            color: #fde68a;
            letter-spacing: 0.3px;
        }

        .title-area p {
            margin: 5px 0 0;
            opacity: 0.95;
            font-size: 13px;
        }

        /* ================= MAIN ================= */
        .main-container {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 35px 18px;
        }

        /* ================= CARD ================= */
        .card-section {
            width: 100%;
            max-width: 980px;
            background: white;
            border-radius: 22px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            border: 1px solid #dbeafe;
        }

        .card-header {
            background: linear-gradient(135deg, #166534, #15803d);
            padding: 20px 28px;
        }

        .card-header h3 {
            margin: 0;
            color: white;
            font-size: 21px;
            font-weight: 700;
            text-align: center;
        }

        .card-body {
            padding: 35px;
        }

        /* ================= SEARCH BOX ================= */
        .search-box {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 14px;
            width: 100%;
        }

        .search-custom-input {
            flex: 1;
            max-width: 700px;
            padding: 14px 16px;
            border: 2px solid #dbe4ee;
            border-radius: 14px;
            font-size: 15px;
            transition: 0.25s;
            background: #f8fafc;
            color: #1e293b;
        }

        .search-custom-input::placeholder {
            color: #94a3b8;
        }

        .search-custom-input:focus {
            outline: none;
            border-color: #16a34a;
            background: white;
            box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.10);
        }

        /* ================= BUTTON ================= */
        .search-custom-btn {
            padding: 14px 24px;
            background: linear-gradient(135deg, #166534, #16a34a);
            color: white;
            border: none;
            border-radius: 14px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.25s;
            box-shadow: 0 6px 15px rgba(22, 101, 52, 0.18);
            white-space: nowrap;
        }

        .search-custom-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 18px rgba(22, 101, 52, 0.22);
        }

        /* ================= BACK BUTTON ================= */
        .bottom-action {
            text-align: center;
            margin-top: 25px;
        }

        .back-home-btn {
            display: inline-block;
            padding: 12px 22px;
            background: #e2e8f0;
            color: #334155;
            text-decoration: none;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 600;
            transition: 0.25s;
            border: 1px solid #cbd5e1;
        }

        .back-home-btn:hover {
            background: #cbd5e1;
            transform: translateY(-2px);
        }

        /* ================= INFO TEXT ================= */
        .empty-text {
            color: #64748b;
            text-align: center;
            margin-top: 18px;
            font-size: 14px;
        }

        /* ================= RESULT ================= */
        .result-card {
            margin-top: 25px;
            padding: 28px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid #dbeafe;
            animation: fadeIn 0.3s ease;
        }

        .result-card h3 {
            margin-top: 0;
            margin-bottom: 18px;
            color: #166534;
            font-size: 24px;
        }

        .result-card p {
            margin: 10px 0;
            font-size: 15px;
            line-height: 1.8;
            word-break: break-word;
        }

        .result-card img {
            width: 100%;
            margin-top: 18px;
            border-radius: 14px;
            border: 1px solid #dbeafe;
        }

        .result-link-btn {
            display: block;
            width: 100%;
            margin-top: 18px;
            padding: 14px;
            background: linear-gradient(135deg, #166534, #16a34a);
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 14px;
            font-size: 15px;
            font-weight: 700;
            transition: 0.25s;
        }

        .result-link-btn:hover {
            transform: translateY(-2px);
        }

        /* ================= ANIMATION ================= */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ================= MOBILE ================= */
        @media(max-width: 768px) {
            .header-container { flex-direction: column; text-align: center; }
            .school-logo { width: 80px; height: 80px; }
            .title-area h1 { font-size: 24px; }
            .title-area h2 { font-size: 16px; }
            .title-area p { font-size: 12px; }
            .card-header h3 { font-size: 18px; }
            .card-body { padding: 24px; }
            .search-box { flex-direction: column; }
            .search-custom-input { width: 100%; font-size: 14px; padding: 14px; }
            .search-custom-btn { width: 100%; font-size: 14px; padding: 14px; }
            .result-card { padding: 20px; }
            .result-card h3 { font-size: 20px; }
            .result-card p { font-size: 14px; }
        }
    </style>
</head>

<body>

    <header class="school-header">
        <div class="header-container">
            <img src="logo.png"
                 alt="โลโก้โรงเรียนบ้านน้ำเค็ม"
                 class="school-logo"
                 onerror="this.src='https://placehold.co/100x100/15803d/ffffff?text=Logo'">
            <div class="title-area">
                <h2 style="margin-top: 12px; margin-bottom: 20px;">ระบบบริการค้นหาข้อมูลศิษย์เก่าออนไลน์</h2>
                <h1 style="margin-bottom: 8px; margin-top: 4px;">โรงเรียนบ้านน้ำเค็ม</h1>
                <p style="margin-bottom: 4px;">ตำบลบ้านนา อำเภอจะนะ จังหวัดสงขลา</p>
                <p style="margin-bottom: 4px;">สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสงขลา เขต 3</p>
            </div>
        </div>
    </header>

    <main class="main-container">
        <section class="card-section">
            <div class="card-header">
                <h3>ค้นหาข้อมูลส่วนตัวศิษย์เก่า</h3>
            </div>
            <div class="card-body">
                <div class="search-box">
                    <input type="text" id="idCardInput" class="search-custom-input" placeholder="กรอกเลขบัตรประชาชน 13 หลัก">
                    <button id="searchBtn" class="search-custom-btn">ค้นหาข้อมูล</button>
                </div>

                <p class="empty-text">กรุณากรอกเลขบัตรประชาชนเพื่อค้นหาข้อมูล</p>

                <div id="result"></div>

                <div class="bottom-action">
                    <a href="index.html" class="back-home-btn">กลับหน้าหลัก</a>
                </div>
            </div>
        </section>
    </main>

    <script type="module">
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

        document.getElementById("searchBtn").addEventListener("click", async () => {
            const inputId = document.getElementById("idCardInput").value.trim();
            const result = document.getElementById("result");

            if (inputId.length !== 13) {
                result.innerHTML = `
                <div class="result-card" style="text-align:center;">
                    <h3 style="color:#dc2626;">ข้อมูลไม่ถูกต้อง</h3>
                    <p>กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก</p>
                </div>`;
                return;
            }

            const snap = await getDocs(collection(db, "students"));
            const student = snap.docs.map(doc => doc.data()).find(s => s.idCard === inputId);

            if (student) {
                // แสดงเฉพาะข้อมูลที่เป็นข้อความเท่านั้น
                result.innerHTML = `
                <div class="result-card">
                    <h3>${student.prefix || ''} ${student.firstname || ''} ${student.lastname || ''}</h3>
                    <p><strong>รหัสนักเรียน :</strong> ${student.studentId || '-'}</p>
                    <p><strong>ชั้น :</strong> ${student.classroom || '-'}</p>
                    <p><strong>ปีที่จบ :</strong> ${student.graduateYear || '-'}</p>
                </div>`;
            } else {
                result.innerHTML = `
                <div class="result-card" style="text-align:center;">
                    <h3 style="color:#dc2626;">ไม่พบข้อมูล</h3>
                    <p>ไม่พบข้อมูลศิษย์เก่าในระบบ</p>
                </div>`;
            }
        });
    </script>
</body>
</html>
