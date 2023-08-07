# Course Selector - Memaksimalkan IP dengan Dynamic Programming
## Deskripsi Program
Course Selector adalah sebuah program yang menggunakan teknik dynamic programming untuk membantu mahasiswa dalam memilih mata kuliah yang akan diambil di semester ini dengan tujuan memaksimalkan Indeks Prestasi (IP) mereka. Program ini akan memberikan rekomendasi kombinasi mata kuliah yang memungkinkan mahasiswa mendapatkan IP terbaik, sambil juga mempertimbangkan Beban SKS (Satuan Kredit Semester) yang dapat diambil sebanyak mungkin. Mata kuliah yang dipilih harus memenuhi syarat minimum semesternya dan diajarkan di fakultas yang sama.

Sebagai contoh, seorang mahasiswa dari program studi Teknik Informatika dapat mengambil mata kuliah yang diajarkan di fakultas yang relevan seperti Teknik Elektro, STEI, dan lainnya.

## Teknologi dan Framework
Program ini dibangun dengan menggunakan teknologi dan framework berikut:

Backend: Bahasa pemrograman GO digunakan sebagai bahasa utama untuk mengembangkan bagian backend dari aplikasi. Database MySQL digunakan untuk menyimpan informasi mengenai mata kuliah, syarat minimum, dan informasi lain yang diperlukan.

Frontend: Antarmuka pengguna dibangun menggunakan framework React, yang memberikan pengalaman pengguna yang interaktif dan responsif.

## Pengujian
1. Tidak Ada Mata Kuliah Valid
![Tidak Ada Mata Kuliah Valid](doc/image.png)

2. Ada Mata Kuliah Yang Valid (Semester Minimum, Fakultas, dst)
![Ada Mata Kuliah Yang Valid](doc/image-2.png)

3. Mengurangi SKS karena ada yang bisa mengurangi indeks.
![Mengurangi SKS](doc/image-3.png)

4. Mengambil course sebanyak-banyaknya selama IP setinggi mungkin.
![Mengambil Course](doc/image-4.png)

5. Terpaksa mengambil IP < 4 karena batasan minimal SKS
![IP < 4](doc/image-5.png)

6. Minimal SKS terlalu tinggi
![Minimal SKS Terlalu Tinggi](doc/image-6.png)

## Bonus 
1. Hubungan fakultas-course
![Hubungan Fakultas-Course](doc/image-7.png)

2. Semua matkul di bawah 1 fakultas dapat diambil
![Semua Matkul Di Bawah 1 Fakultas](doc/image-9.png)

## Cara Menjalankan Aplikasi (docker-compose up -d)
docker-compose up -d
![Cara Menjalankan Aplikasi](doc/imagee.png)

## Referensi Belajar
1. https://legacy.reactjs.org/tutorial/tutorial.html
2. Youtube, Imre Nagi, Docker