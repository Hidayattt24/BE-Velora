-- Sample Data for Velora Database
-- Run this AFTER running the main schema.sql
-- This will insert sample articles and initial data

-- Sample articles (system-generated, no specific author)
INSERT INTO articles (title, content, excerpt, category, published, read_time) VALUES
('Tips Mengatasi Mual Morning Sickness', 
 'Morning sickness adalah kondisi yang sangat umum dialami oleh ibu hamil, terutama pada trimester pertama. Kondisi ini ditandai dengan rasa mual dan muntah yang biasanya terjadi di pagi hari, meskipun bisa juga terjadi kapan saja sepanjang hari.

Berikut adalah beberapa tips efektif untuk mengatasi morning sickness:

1. **Makan dalam Porsi Kecil tapi Sering**
   Hindari makan dalam porsi besar yang dapat memicu mual. Lebih baik makan dalam porsi kecil 5-6 kali sehari.

2. **Konsumsi Jahe**
   Jahe telah terbukti secara ilmiah dapat mengurangi rasa mual. Anda bisa mengonsumsinya dalam bentuk teh jahe atau permen jahe.

3. **Hindari Makanan Pemicu**
   Identifikasi makanan atau aroma yang memicu mual dan hindari sebisa mungkin.

4. **Tetap Terhidrasi**
   Minum air putih dalam jumlah cukup, terutama jika Anda sering muntah.

5. **Istirahat yang Cukup**
   Kelelahan dapat memperburuk morning sickness, jadi pastikan Anda mendapat istirahat yang cukup.',
 'Cara alami dan efektif untuk mengurangi rasa mual di trimester pertama kehamilan.',
 'Trimester 1',
 true,
 '5 min read'),

('Panduan Nutrisi untuk Ibu Hamil Trimester 2', 
 'Trimester kedua kehamilan adalah periode emas dimana sebagian besar ibu hamil merasa lebih berenergi dan morning sickness mulai berkurang. Ini adalah waktu yang tepat untuk fokus pada nutrisi yang optimal.

**Kebutuhan Nutrisi Penting:**

1. **Protein** - 75-100g per hari
   - Daging tanpa lemak
   - Ikan (rendah merkuri)
   - Telur
   - Kacang-kacangan
   - Produk susu

2. **Asam Folat** - 600-800 mcg per hari
   - Sayuran hijau gelap
   - Jeruk dan buah sitrus
   - Kacang-kacangan
   - Sereal yang diperkaya

3. **Zat Besi** - 27mg per hari
   - Daging merah tanpa lemak
   - Ayam
   - Ikan
   - Bayam
   - Kacang-kacangan

4. **Kalsium** - 1000mg per hari
   - Susu dan produk susu
   - Sayuran hijau
   - Ikan dengan tulang lunak
   - Tahu

5. **DHA** - 200-300mg per hari
   - Ikan salmon
   - Sarden
   - Suplemen minyak ikan',
 'Panduan lengkap nutrisi seimbang untuk mendukung pertumbuhan janin di trimester kedua.',
 'Nutrisi',
 true,
 '7 min read'),

('Olahraga Aman untuk Ibu Hamil', 
 'Olahraga selama kehamilan memberikan banyak manfaat untuk kesehatan ibu dan janin. Namun, penting untuk memilih jenis olahraga yang aman dan sesuai dengan kondisi kehamilan.

**Manfaat Olahraga untuk Ibu Hamil:**
- Meningkatkan stamina dan kekuatan
- Mengurangi nyeri punggung
- Meningkatkan kualitas tidur
- Mengurangi risiko diabetes gestasional
- Mempersiapkan tubuh untuk persalinan

**Olahraga yang Direkomendasikan:**

1. **Jalan Kaki**
   - Olahraga paling aman untuk semua trimester
   - Mulai dengan 15-20 menit per hari
   - Tingkatkan secara bertahap

2. **Berenang**
   - Sangat baik untuk semua trimester
   - Mengurangi beban pada sendi
   - Melatih seluruh tubuh

3. **Yoga Prenatal**
   - Meningkatkan fleksibilitas
   - Mengurangi stres
   - Membantu persiapan persalinan

4. **Senam Hamil**
   - Dirancang khusus untuk ibu hamil
   - Dipandu oleh instruktur berpengalaman

**Yang Harus Dihindari:**
- Olahraga kontak fisik
- Aktivitas dengan risiko jatuh
- Olahraga intensitas tinggi
- Scuba diving',
 'Panduan olahraga yang aman dan bermanfaat untuk ibu hamil di setiap trimester.',
 'Olahraga',
 true,
 '6 min read'),

('Persiapan Persalinan: Checklist Lengkap', 
 'Memasuki trimester ketiga, saatnya mempersiapkan segala sesuatu untuk persalinan. Persiapan yang matang akan membantu mengurangi kecemasan dan memastikan proses persalinan berjalan lancar.

**Checklist Tas Rumah Sakit (untuk Ibu):**
- Baju tidur/daster yang nyaman untuk menyusui
- Underwear disposable
- Pembalut nifas
- Sandal anti slip
- Toiletries (sikat gigi, sampo, sabun)
- Camilan sehat
- Bantal favorit
- Hiburan (buku, musik, tablet)

**Checklist untuk Bayi:**
- Baju bayi newborn (3-4 stel)
- Bedong/selimut bayi
- Topi bayi
- Kaos kaki bayi
- Popok newborn
- Car seat (wajib untuk perjalanan pulang)

**Dokumen Penting:**
- KTP dan KK
- Kartu BPJS/asuransi kesehatan
- Buku kontrol kehamilan
- Hasil lab terakhir
- Birth plan (jika ada)

**Persiapan di Rumah:**
- Nomor telepon darurat
- Rute ke rumah sakit
- Backup plan transportasi
- Persiapan untuk anak lain (jika ada)
- Stok makanan dan keperluan rumah tangga',
 'Checklist lengkap persiapan persalinan untuk memastikan semua kebutuhan tercukupi.',
 'Trimester 3',
 true,
 '8 min read'),

('Mengatasi Kecemasan Selama Kehamilan', 
 'Kecemasan selama kehamilan adalah hal yang normal dialami oleh sebagian besar ibu hamil. Namun, kecemasan yang berlebihan dapat berdampak negatif pada kesehatan ibu dan janin.

**Penyebab Umum Kecemasan Kehamilan:**
- Kekhawatiran tentang kesehatan janin
- Perubahan tubuh yang drastis
- Tekanan finansial
- Perubahan hubungan dengan pasangan
- Pengalaman trauma sebelumnya

**Cara Mengatasi Kecemasan:**

1. **Edukasi Diri**
   - Baca buku tentang kehamilan dari sumber terpercaya
   - Ikuti kelas persiapan persalinan
   - Konsultasi rutin dengan dokter

2. **Teknik Relaksasi**
   - Latihan pernapasan dalam
   - Meditasi
   - Yoga prenatal
   - Musik yang menenangkan

3. **Dukungan Sosial**
   - Berbagi dengan pasangan
   - Bergabung dengan komunitas ibu hamil
   - Konseling dengan psikolog jika diperlukan

4. **Gaya Hidup Sehat**
   - Olahraga ringan teratur
   - Pola makan seimbang
   - Tidur yang cukup
   - Hindari kafein berlebihan

5. **Journaling**
   - Tulis perasaan dan kekhawatiran
   - Catat hal-hal positif tentang kehamilan
   - Buat daftar hal yang disyukuri

**Kapan Harus Mencari Bantuan Profesional:**
- Kecemasan mengganggu aktivitas sehari-hari
- Sulit tidur atau makan
- Pikiran negatif yang terus menerus
- Gejala depresi',
 'Tips praktis untuk mengatasi kecemasan dan menjaga kesehatan mental selama kehamilan.',
 'Kesehatan Mental',
 true,
 '6 min read');

-- You can add more sample data here as needed
