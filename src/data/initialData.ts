import { User, Subject, Exam, Question, ExamSubmission } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_1',
    username: 'admin',
    password: 'admin123',
    name: 'Drs. H. Mulyono, M.M. (Administrator)',
    role: 'admin',
    nipOrNis: '197508122000031001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_guru_1',
    username: 'budi_guru',
    password: 'guru123',
    name: 'Budi Santoso, S.Kom., M.Pd.',
    role: 'guru',
    nipOrNis: '198305142008011012',
    subjectName: 'Informatika & Literasi Digital',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_guru_2',
    username: 'siti_guru',
    password: 'guru123',
    name: 'Siti Rahmawati, S.Pd., M.Si.',
    role: 'guru',
    nipOrNis: '198607212010012015',
    subjectName: 'Ilmu Pengetahuan Alam (IPA)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_siswa_1',
    username: 'ahmad_siswa',
    password: 'siswa123',
    name: 'Ahmad Fauzi Ramadhan',
    role: 'siswa',
    nipOrNis: '20241001',
    classGroup: 'X-IPA-1',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_siswa_2',
    username: 'dewi_siswa',
    password: 'siswa123',
    name: 'Dewi Lestari Kusuma',
    role: 'siswa',
    nipOrNis: '20241002',
    classGroup: 'X-IPA-1',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_siswa_3',
    username: 'budi_siswa',
    password: 'siswa123',
    name: 'Budi Pratama Wijaya',
    role: 'siswa',
    nipOrNis: '20241003',
    classGroup: 'X-IPA-1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_siswa_4',
    username: 'rina_siswa',
    password: 'siswa123',
    name: 'Rina Wulandari Putri',
    role: 'siswa',
    nipOrNis: '20241004',
    classGroup: 'X-IPA-2',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_siswa_5',
    username: 'farhan_siswa',
    password: 'siswa123',
    name: 'Farhan Maulana Hakim',
    role: 'siswa',
    nipOrNis: '20241005',
    classGroup: 'X-IPA-2',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj_inf',
    code: 'INF-10',
    name: 'Informatika & Literasi Digital',
    teacherName: 'Budi Santoso, S.Kom., M.Pd.',
    passingGrade: 75
  },
  {
    id: 'subj_ipa',
    code: 'IPA-10',
    name: 'Ilmu Pengetahuan Alam (IPA)',
    teacherName: 'Siti Rahmawati, S.Pd., M.Si.',
    passingGrade: 75
  },
  {
    id: 'subj_mat',
    code: 'MAT-10',
    name: 'Matematika Umum',
    teacherName: 'Dra. Endang Sulastri',
    passingGrade: 72
  },
  {
    id: 'subj_ind',
    code: 'IND-10',
    name: 'Bahasa Indonesia',
    teacherName: 'Agus Pramono, M.Hum.',
    passingGrade: 75
  },
  {
    id: 'subj_arb',
    code: 'ARB-10',
    name: 'Bahasa Arab & Studi Keagamaan (اللغة العربية)',
    teacherName: 'Ust. Ahmad Fauzi, Lc., M.Pd.I.',
    passingGrade: 75
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam_inf_pts',
    title: 'Penilaian Sumatif Akhir: Keamanan Digital, Jaringan, dan Etika AI',
    subjectId: 'subj_inf',
    subjectName: 'Informatika & Literasi Digital',
    teacherId: 'user_guru_1',
    teacherName: 'Budi Santoso, S.Kom., M.Pd.',
    targetClasses: ['X-IPA-1', 'X-IPA-2', 'XI-IPA-1'],
    durationMinutes: 45,
    totalScore: 100,
    passingScore: 75,
    status: 'active',
    instructions: '1. Kerjakan soal secara mandiri dan jujur.\n2. Layar terkunci (Lockdown Mode). Dilarang beralih tab atau membuka aplikasi lain.\n3. Nilai otomatis dihitung setelah tombol Selesai ditekan.',
    createdAt: '2026-09-18'
  },
  {
    id: 'exam_arb_pts',
    title: 'Asesmen Bahasa Arab & Kaidah Dasar (اختبار اللغة العربية)',
    subjectId: 'subj_arb',
    subjectName: 'Bahasa Arab & Studi Keagamaan (اللغة العربية)',
    teacherId: 'user_guru_1',
    teacherName: 'Ust. Ahmad Fauzi, Lc., M.Pd.I.',
    targetClasses: ['X-IPA-1', 'X-IPA-2', 'XI-IPA-1'],
    durationMinutes: 40,
    totalScore: 100,
    passingScore: 75,
    status: 'active',
    instructions: '1. Perhatikan harakat dan kaidah tata bahasa Arab secara teliti.\n2. Soal dilengkapi fitur gambar visual dan tulisan RTL.',
    createdAt: '2026-09-19'
  },
  {
    id: 'exam_ipa_pts',
    title: 'Asesmen Lingkungan & Perubahan Iklim Global',
    subjectId: 'subj_ipa',
    subjectName: 'Ilmu Pengetahuan Alam (IPA)',
    teacherId: 'user_guru_2',
    teacherName: 'Siti Rahmawati, S.Pd., M.Si.',
    targetClasses: ['X-IPA-1', 'X-IPA-2'],
    durationMinutes: 30,
    totalScore: 100,
    passingScore: 75,
    status: 'active',
    instructions: 'Pilihlah dan jawablah setiap tipe soal sesuai panduan.',
    createdAt: '2026-09-17'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  // Soal 1: Pilihan Ganda Tunggal
  {
    id: 'q_inf_1',
    examId: 'exam_inf_pts',
    type: 'single_choice',
    prompt: 'Perhatikan diagram keamanan berikut. Protokol jaringan terenkripsi yang paling aman digunakan untuk transaksi perbankan dan lalu lintas data sensitif adalah...',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    points: 20,
    options: [
      'HTTP (Hypertext Transfer Protocol standar port 80)',
      'FTP (File Transfer Protocol)',
      'HTTPS (Hypertext Transfer Protocol Secure port 443)',
      'Telnet (Telecommunication Network)',
      'SMTP (Simple Mail Transfer Protocol)'
    ],
    correctSingle: 2, // HTTPS
    explanation: 'HTTPS mengenkripsi seluruh komunikasi data antara browser pengguna dan server menggunakan TLS/SSL untuk mencegah sniffing dan man-in-the-middle attack.'
  },

  // Soal 2: Pilihan Ganda Kompleks (Bisa memilih lebih dari satu)
  {
    id: 'q_inf_2',
    examId: 'exam_inf_pts',
    type: 'multiple_choice',
    prompt: 'Manakah dari praktik berikut yang terbukti EFEKTIF dalam melindungi akun digital dari peretasan kejahatan siber? (Pilihlah semua jawaban yang benar)',
    points: 20,
    options: [
      'Mengaktifkan autentikasi dua faktor (Two-Factor Authentication / 2FA)',
      'Menggunakan kata sandi yang sama di semua media sosial agar mudah diingat',
      'Menggunakan kombinasi huruf kapital, huruf kecil, angka, dan simbol unik',
      'Menyimpan catatan kata sandi di kertas dekat monitor komputer umum',
      'Tidak sembarangan mengklik tautan mencurigakan pada pesan phishing'
    ],
    correctMulti: [0, 2, 4], // 2FA, password kompleks, waspada phishing
    explanation: 'Praktik keamanan digital yang baik meliputi penggunaan 2FA, passphrase yang kuat dan unik, serta kewaspadaan tinggi terhadap rekayasa sosial (phishing).'
  },

  // Soal 3: Soal Benar / Salah (Matrix pernyataan)
  {
    id: 'q_inf_3',
    examId: 'exam_inf_pts',
    type: 'true_false',
    prompt: 'Tentukan kebenaran dari setiap pernyataan berikut terkait Etika Penggunaan Kecerdasan Buatan (AI) di lingkungan sekolah:',
    points: 20,
    trueFalseItems: [
      {
        id: 'tf_1',
        statement: 'Menyalin mentah-mentah karya tulisan hasil AI dan mengklaimnya sebagai tugas orisinil pribadi termasuk tindakan plagiarisme akademis.',
        isCorrect: true // Benar
      },
      {
        id: 'tf_2',
        statement: 'AI selalu menghasilkan informasi yang 100% akurat tanpa kemungkinan terjadi halusinasi data.',
        isCorrect: false // Salah
      },
      {
        id: 'tf_3',
        statement: 'Menggunakan AI sebagai mitra diskusi untuk merancang ide dan memverifikasi sumber fakta merupakan pemanfaatan positif.',
        isCorrect: true // Benar
      },
      {
        id: 'tf_4',
        statement: 'Data pribadi sensitif seperti NIK dan kata sandi aman dibagikan ke sembarang platform AI publik tanpa privasi data.',
        isCorrect: false // Salah
      }
    ],
    explanation: 'AI generatif dapat mengalami halusinasi informasi. Pengguna harus selalu memverifikasi fakta dan mematuhi etika kejujuran akademik serta perlindungan data pribadi.'
  },

  // Soal 4: Soal Menjodohkan (Matching Pair)
  {
    id: 'q_inf_4',
    examId: 'exam_inf_pts',
    type: 'matching',
    prompt: 'Jodohkan istilah perangkat/protokol keamanan jaringan di Kolom Kiri dengan fungsi utamanya yang tepat di Kolom Kanan:',
    points: 20,
    matchingPairs: [
      {
        id: 'm_1',
        left: 'Firewall',
        right: 'Penyaring dan pengontrol lalu lintas data masuk dan keluar jaringan'
      },
      {
        id: 'm_2',
        left: 'VPN (Virtual Private Network)',
        right: 'Membangun terowongan terenkripsi untuk mengamankan koneksi publik'
      },
      {
        id: 'm_3',
        left: 'Antivirus / Anti-Malware',
        right: 'Mendeteksi, mengisolasi, dan menghapus kode program perusak sistem'
      },
      {
        id: 'm_4',
        left: 'Enkripsi Data',
        right: 'Mengubah teks asli (plaintext) menjadi kode acak (ciphertext)'
      }
    ],
    explanation: 'Semua komponen tersebut merupakan pilar pertahanan mendasar dalam arsitektur keamanan siber modern.'
  },

  // Soal 5: Studi Kasus (Case Study dengan stimulus dan analisis)
  {
    id: 'q_inf_5',
    examId: 'exam_inf_pts',
    type: 'case_study',
    prompt: 'Berdasarkan studi kasus insiden keamanan siber di atas, analisislah kesalahan yang dilakukan staf sekolah dan sebutkan minimal 2 langkah mitigasi darurat yang wajib segera dilakukan!',
    points: 20,
    caseContext: 'STUDI KASUS INSIDEN SIBER SMA NUSANTARA:\nPada hari Senin pagi, seorang staf tata usaha sekolah menerima email bernada mendesak yang mengatasnamakan dinas pendidikan dengan subjek "Pemberitahuan Validasi Tunjangan Mendesak.exe.zip". Karena terburu-buru, staf langsung membuka lampiran tersebut di komputer pusat sekolah yang terhubung ke jaringan lokal server nilai siswa.\n\nDalam waktu 15 menit, semua file rapor dan dokumen sekolah terenkripsi dengan ekstensi ".locked", dan muncul pesan di layar meminta tebusan uang kripto dalam 24 jam (Serangan Ransomware). Jaringan sekolah mendadak lumpuh.',
    caseKeywords: ['ransomware', 'phishing', 'isolasi', 'backup', 'putus jaringan', 'disconnect', 'edukasi', 'restore'],
    rubricNotes: 'Penilaian diberikan berdasarkan kemampuan siswa mengidentifikasi phishing/ransomware dan memberikan langkah tanggap darurat seperti mencabut kabel LAN/WiFi dan memulihkan data dari backup offline.'
  },

  // Soal IPA (Tambahan untuk demonstrasi mata pelajaran kedua)
  {
    id: 'q_ipa_1',
    examId: 'exam_ipa_pts',
    type: 'single_choice',
    prompt: 'Gas rumah kaca yang memiliki kontribusi terbesar terhadap fenomena pemanasan global akibat pembakaran bahan bakar fosil adalah...',
    points: 50,
    options: ['Oksigen (O2)', 'Karbon Dioksida (CO2)', 'Nitrogen (N2)', 'Argon (Ar)', 'Helium (He)'],
    correctSingle: 1,
    explanation: 'Emisi CO2 dari aktivitas industri dan transportasi merupakan pendorong utama efek rumah kaca antropogenik.'
  },
  {
    id: 'q_ipa_2',
    examId: 'exam_ipa_pts',
    type: 'multiple_choice',
    prompt: 'Manakah dari langkah berikut yang merupakan upaya mitigasi nyata untuk mereduksi jejak karbon? (Pilih semua yang benar)',
    points: 50,
    options: [
      'Melakukan reboisasi dan penghijauan hutan kota',
      'Membakar sampah plastik di halaman terbuka',
      'Beralih ke transportasi umum dan kendaraan ramah lingkungan',
      'Meningkatkan efisiensi energi dan penggunaan panel surya',
      'Membiarkan peralatan elektronik menyala terus menerus'
    ],
    correctMulti: [0, 2, 3],
    explanation: 'Reboisasi menyerap CO2, sedangkan transportasi umum dan panel surya menurunkan emisi bahan bakar fosil.'
  },

  // Soal Bahasa Arab (Mendemonstrasikan Keyboard Arab & Gambar Opsi)
  {
    id: 'q_arb_1',
    examId: 'exam_arb_pts',
    type: 'single_choice',
    prompt: 'مَا هُوَ مَعْنَى كَلِمَةِ «المَدْرَسَة» فِي اللُّغَةِ الإِنْدُونِيسِيَّة؟',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
    points: 30,
    options: [
      'Sekolah (Tempat belajar mengajar)',
      'Rumah Sakit (Tempat berobat)',
      'Perpustakaan (Tempat membaca buku)',
      'Masjid (Tempat beribadah)'
    ],
    correctSingle: 0,
    explanation: 'كَلِمَةُ «المَدْرَسَة» تَعْنِي فِي اللُّغَةِ الإِنْدُونِيسِيَّة Sekolah.'
  },
  {
    id: 'q_arb_2',
    examId: 'exam_arb_pts',
    type: 'single_choice',
    prompt: 'عَيِّنِ الصُّورَةَ الَّتِي تَدُلُّ عَلَى كَلِمَةِ «كِتَابٌ» (Kitab / Buku Pelajaran):',
    points: 35,
    options: [
      'كِتَابٌ (Buku Bacaan)',
      'قَلَمٌ (Pena Tulis)',
      'حَقِيبَةٌ (Tas Sekolah)',
      'مِمْسَحَةٌ (Penghapus)'
    ],
    optionImages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584697964190-7bb9b81b83d1?w=400&auto=format&fit=crop&q=80'
    ],
    correctSingle: 0,
    explanation: 'الصورة الأولى تمثل كتاباً مفتوحاً للدراسة.'
  },
  {
    id: 'q_arb_3',
    examId: 'exam_arb_pts',
    type: 'multiple_choice',
    prompt: 'اخْتَرْ جَمِيعَ الكَلِمَاتِ الَّتِي تُعْتَبَرُ مِنَ «الأَسْمَاءِ» (Isim / Kata Benda) فِي الخِيَارَاتِ التَّالِيَةِ:',
    points: 35,
    options: [
      'مُحَمَّدٌ (Nama Orang)',
      'يَقْرَأُ (Kata Kerja / Sedang Membaca)',
      'القَلَمُ (Kata Benda Ber-alif lam)',
      'فِي (Huruf Jar)',
      'المَسْجِدُ (Kata Benda Tempat)'
    ],
    correctMulti: [0, 2, 4],
    explanation: 'مُحَمَّدٌ، والقَلَمُ، والمَسْجِدُ كُلُّهَا أَسْمَاءٌ لِوُجُودِ عَلَامَاتِ الاسْمِ كَالتَّنْوِينِ وَالأَلِفِ وَاللَّامِ.'
  }
];

export const INITIAL_SUBMISSIONS: ExamSubmission[] = [
  {
    id: 'sub_1',
    examId: 'exam_inf_pts',
    examTitle: 'Penilaian Sumatif Akhir: Keamanan Digital, Jaringan, dan Etika AI',
    subjectName: 'Informatika & Literasi Digital',
    studentId: 'user_siswa_2',
    studentName: 'Dewi Lestari Kusuma',
    studentClass: 'X-IPA-1',
    answers: {
      q_inf_1: 2,
      q_inf_2: [0, 2, 4],
      q_inf_3: { tf_1: true, tf_2: false, tf_3: true, tf_4: false },
      q_inf_4: { m_1: 'Penyaring dan pengontrol lalu lintas data masuk dan keluar jaringan', m_2: 'Membangun terowongan terenkripsi untuk mengamankan koneksi publik', m_3: 'Mendeteksi, mengisolasi, dan menghapus kode program perusak sistem', m_4: 'Mengubah teks asli (plaintext) menjadi kode acak (ciphertext)' },
      q_inf_5: 'Kesalahan: Membuka lampiran email phishing tanpa verifikasi. Mitigasi: 1. Segera putuskan koneksi internet dan kabel LAN untuk isolasi ransomware. 2. Restore file menggunakan sistem backup offline.'
    },
    earnedScore: 95,
    totalScore: 100,
    percentage: 95,
    passed: true,
    violationCount: 0,
    startedAt: '2026-09-19T08:00:00.000Z',
    submittedAt: '2026-09-19T08:32:00.000Z',
    evaluatedAnswers: {
      q_inf_1: { earned: 20, max: 20, isCorrect: true },
      q_inf_2: { earned: 20, max: 20, isCorrect: true },
      q_inf_3: { earned: 20, max: 20, isCorrect: true },
      q_inf_4: { earned: 20, max: 20, isCorrect: true },
      q_inf_5: { earned: 15, max: 20, isCorrect: true, feedback: 'Analisis tepat sasaran dan langkah isolasi jaringan benar.' }
    }
  },
  {
    id: 'sub_2',
    examId: 'exam_inf_pts',
    examTitle: 'Penilaian Sumatif Akhir: Keamanan Digital, Jaringan, dan Etika AI',
    subjectName: 'Informatika & Literasi Digital',
    studentId: 'user_siswa_3',
    studentName: 'Budi Pratama Wijaya',
    studentClass: 'X-IPA-1',
    answers: {
      q_inf_1: 2,
      q_inf_2: [0, 2],
      q_inf_3: { tf_1: true, tf_2: true, tf_3: true, tf_4: false },
      q_inf_4: { m_1: 'Penyaring dan pengontrol lalu lintas data masuk dan keluar jaringan', m_2: 'Membangun terowongan terenkripsi untuk mengamankan koneksi publik', m_3: 'Mendeteksi, mengisolasi, dan menghapus kode program perusak sistem', m_4: 'Mengubah teks asli (plaintext) menjadi kode acak (ciphertext)' },
      q_inf_5: 'Staf tidak teliti mengklik exe file virus ransomware. Harus cabut kabel jaringan.'
    },
    earnedScore: 78,
    totalScore: 100,
    percentage: 78,
    passed: true,
    violationCount: 1,
    startedAt: '2026-09-19T08:05:00.000Z',
    submittedAt: '2026-09-19T08:42:00.000Z'
  },
  {
    id: 'sub_3',
    examId: 'exam_inf_pts',
    examTitle: 'Penilaian Sumatif Akhir: Keamanan Digital, Jaringan, dan Etika AI',
    subjectName: 'Informatika & Literasi Digital',
    studentId: 'user_siswa_4',
    studentName: 'Rina Wulandari Putri',
    studentClass: 'X-IPA-2',
    answers: {
      q_inf_1: 0,
      q_inf_2: [0, 1],
      q_inf_3: { tf_1: true, tf_2: false, tf_3: true, tf_4: true },
      q_inf_4: { m_1: 'Penyaring dan pengontrol lalu lintas data masuk dan keluar jaringan' },
      q_inf_5: 'Kena virus'
    },
    earnedScore: 50,
    totalScore: 100,
    percentage: 50,
    passed: false,
    violationCount: 2,
    startedAt: '2026-09-19T09:00:00.000Z',
    submittedAt: '2026-09-19T09:35:00.000Z'
  },
  {
    id: 'sub_4',
    examId: 'exam_inf_pts',
    examTitle: 'Penilaian Sumatif Akhir: Keamanan Digital, Jaringan, dan Etika AI',
    subjectName: 'Informatika & Literasi Digital',
    studentId: 'user_siswa_5',
    studentName: 'Farhan Maulana Hakim',
    studentClass: 'X-IPA-2',
    answers: {
      q_inf_1: 2,
      q_inf_2: [0, 2, 4],
      q_inf_3: { tf_1: true, tf_2: false, tf_3: true, tf_4: false },
      q_inf_4: { m_1: 'Penyaring dan pengontrol lalu lintas data masuk dan keluar jaringan', m_2: 'Membangun terowongan terenkripsi untuk mengamankan koneksi publik', m_3: 'Mendeteksi, mengisolasi, dan menghapus kode program perusak sistem', m_4: 'Mengubah teks asli (plaintext) menjadi kode acak (ciphertext)' },
      q_inf_5: 'Kesalahan: membuka lampiran berekstensi ganda .exe.zip. Mitigasi: Isolasi perangkat dari LAN/WIFI dan scan dengan software antimalware serta pulihkan dari backup cloud.'
    },
    earnedScore: 92,
    totalScore: 100,
    percentage: 92,
    passed: true,
    violationCount: 0,
    startedAt: '2026-09-19T09:05:00.000Z',
    submittedAt: '2026-09-19T09:40:00.000Z'
  }
];
