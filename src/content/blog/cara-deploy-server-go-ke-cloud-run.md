---
title: Cara Deploy Server Go ke Cloud Run
description: "Deploy aplikasi server go ke gcp"
pubDate: 2023-07-08T07:39:15.516Z
heroImage: "https://thingstoday-3f186.web.app/assets/img/thumbnail/cara-deploy-server-go-ke-cloud-run.png"
author: "Raden Mohamad Rishwan"
short: "Cloud Run adalah layanan yang disediakan oleh Google Cloud Platform (GCP) yang memungkinkan Anda menjalankan kontainer Docker secara serverless. Dalam konteks serverless, Anda tidak perlu mengelola infrastruktur server secara langsung. Salah satu fitur utama Cloud Run adalah skalabilitas horizontal otomatis. Ini berarti Cloud Run akan secara otomatis menangani peningkatan atau penurunan permintaan dengan menambah atau mengurangi jumlah instance kontainer yang dijalankan. Anda hanya akan membayar untuk sumber daya yang digunakan selama eksekusi kode, berdasarkan durasi dan jumlah permintaan yang diterima."
tags: ["gcp", "golang", "programming"]
type: default
---

Cloud Run adalah layanan yang disediakan oleh Google Cloud Platform (GCP) yang memungkinkan Anda menjalankan kontainer Docker secara serverless. Dalam konteks serverless, Anda tidak perlu mengelola infrastruktur server secara langsung. Salah satu fitur utama Cloud Run adalah skalabilitas horizontal otomatis. Ini berarti Cloud Run akan secara otomatis menangani peningkatan atau penurunan permintaan dengan menambah atau mengurangi jumlah instance kontainer yang dijalankan. Anda hanya akan membayar untuk sumber daya yang digunakan selama eksekusi kode, berdasarkan durasi dan jumlah permintaan yang diterima.

Cloud Run juga mendukung skalabilitas nol, yang berarti aplikasi Anda tidak akan menerima lalu lintas jika tidak ada permintaan yang aktif. Ini membantu mengurangi biaya saat aplikasi tidak digunakan. Selain itu, Clour Run juga punya free tier sebelum membayar sesuai dengan penggunaan. Untuk free tier, kamu bisa lihat di sini.

Tanpa basa-basi lagi, mari kita mulai cara deploy server Go ke Cloud Run.

# Sebelum Memulai
Ada beberap hal yang perlu dipersiapkan sebelum memulai. Pertama, pastikan kamu sudah punya akun Google Cloud Platform (GCP). Jika belum, kamu bisa daftar [di sini](https://cloud.google.com/). Selanjutnya, pastikan kamu sudah menginstall [Google Cloud SDK](https://cloud.google.com/sdk/docs/install). Selain itu, kamu juga perlu mengerti terlebih dahulu tentang [Docker](https://www.docker.com/). Jika sudah, mari kita mulai.

# Membuat Project
Sebagai contoh, disini saya akan membuat project golang sederhana dengan perintah berikut:

```go
go mod init github.com/radenrishwan/go-cloud-run
```

# Membuat Server
Selanjutnya, buat file `main.go` dengan isi sebagai berikut:

```go
package main

import (
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello World"))
	})

	http.ListenAndServe(":"+port, mux)
}
```

Sedikit penjelasan, kode di atas akan membuat server yang akan berjalan di port yang diambil dari environment variable `PORT`. Jika kamu menjalankan server di local, maka port yang digunakan adalah `8080`. Namun, jika kamu menjalankan server di Cloud Run, maka port yang digunakan adalah `PORT` yang diambil dari environment variable.
Selanjutnya coba run server dengan perintah berikut lau buka di browser:

```bash
export PORT=8080 && go run main.go
```

![https://i.ibb.co/p4W5DBG/2023-07-08-16-10.png](https://i.ibb.co/p4W5DBG/2023-07-08-16-10.png)

# Membuat Dockerfile
Untuk melakukan deploy ke Cloud Run, kita perlu membuat image Docker terlebih dahulu. Untuk membuat image Docker, kita perlu membuat file `Dockerfile` dengan isi sebagai berikut:

```Dockerfile
FROM golang:alpine

WORKDIR /app
COPY . .
RUN go build -o main .

ENV PORT=8080

EXPOSE 8080

CMD ./main
```

Berikut penjelasan dari setiap baris kode di atas:
- `FROM golang:alpine` : Menggunakan image golang:alpine sebagai base image.
- `WORKDIR /app` : Membuat direktori /app sebagai working directory.
- `COPY . .` : Menyalin semua file ke working directory.
- `RUN go build -o main .` : Build aplikasi Go menjadi binary dengan nama main.
- `ENV PORT=8080` : Menambahkan environment variable PORT dengan nilai 8080.
- `EXPOSE 8080` : Membuka port 8080. Ini cuman dokumentasi port yang dibuka, tidak ada pengaruh ke aplikasi.
- `CMD ./main` : Menjalankan aplikasi dengan perintah ./main.

Selanjutnya coba build image Docker dengan perintah berikut. Dimana `server:v1.0` adalah nama image yang akan dibuat.

```bash
docker build . -t server:v1.0          
```

lalu coba run image Docker dengan perintah berikut:

```bash 
docker run -it -p 8080:8080 -e PORT=8080 server:v1.0
```

Sedikit penjelasan dari perintah diatas dimana `8080:8080` adalah `port` yang akan di expose ke host. Sedangkan `-e PORT=8080` adalah environment variable yang akan digunakan oleh aplikasi.

Selanjutnya buka di browser dengan url `localhost:8080` dan hasilnya akan sama seperti sebelumnya.

# Tips membuat docker image pada go
Sebenernya, kamu tidak perlu lagi memerlukan golang pada server jika sudah memiliki binary file yang sudah dibuild. Hal ini dapat membuat image kamu menjadi lebih kecil dibanding sebelumnya. Untuk melakukannya, silahkan ubah kode Dockerfile menjadi seperti berikut:

```Dockerfile
FROM golang:alpine AS builder

WORKDIR /app
COPY . .
RUN go build -o main .

FROM alpine
WORKDIR /app

ENV PORT=8080

EXPOSE 8080

COPY --from=builder /app/main /app
CMD ./main
```

Berikut beberapa penjelasan dari kode di atas:
- `FROM golang:alpine AS builder` : Menggunakan image golang:alpine sebagai base image dengan alias builder.
- `COPY --from=builder /app/main /app` : Menyalin binary file dari image builder ke image alpine.
- `FROM alpine` : Menggunakan image alpine sebagai base image.
- `COPY --from=builder /app/main /app` : Menyalin binary file dari image builder ke image alpine.
- `CMD ./main` : Menjalankan aplikasi dengan perintah ./main.

silahkan build ulang image docker seperti sebelumnya. Kamu juga bisa merubah versi image docker dengan mengubah tag nya. Namun, pada tutorial ini saya akan menggunakan tag v1.0 untuk selanjutnya.

# Push Image ke Artifact Registry
Lagkah selanjutnya adalah push image Docker yang sudah dibuat ke Artifact Registry. Artifact Registry adalah layanan yang disediakan oleh GCP untuk menyimpan image Docker. Untuk melakukan push image Docker, kita perlu membuat repository terlebih dahulu pada GCP. Jika kamu belum mebuat project, silahkan buat project terlebih dahulu lewat [console GCP](https://console.cloud.google.com/). Jika sudah, selanjutnya kita harus melakukan authentikasi ke artifact registry dengan perintah berikut:

```bash
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

Penjelasan mengenai perintah di atas adalah `asia-southeast1` adalah region yang digunakan. Kamu bisa mengganti region sesuai dengan kebutuhan. Untuk melihat region yang tersedia, kamu bisa lihat [di sini](https://cloud.google.com/artifact-registry/docs/repositories/repo-locations).

Selanjutnya buat repository dengan perintah berikut:

```bash
gcloud artifacts repositories create article --repository-format=docker --location=asia-southeast1 --description="example repository for article"
Berikut penjelasan dari perintah di atas:
```

article adalah nama repository yang akan dibuat.
- `--repository-format=docker` adalah format repository yang akan dibuat. Disini kita membuat repository untuk menyimpan image Docker.
- `--location=asia-southeast1` adalah region yang digunakan untuk menyimpan repository. Kamu bisa mengganti region sesuai dengan kebutuhan.
- `--description="example repository for article"` adalah deskripsi dari repository yang akan dibuat.
  
Setelah repository berhasil dibuat, selanjutnya buat tag image dengan perintah berikut:

```bash
gcloud artifacts repositories create article --repository-format=docker --location=asia-southeast1 --description="example repository for article"
```

Berikut penjelasan dari perintah di atas:
- `article` adalah nama repository yang akan dibuat.
- `--repository-format=docker` adalah format repository yang akan dibuat. Disini kita membuat repository untuk menyimpan image Docker.
- `--location=asia-southeast1` adalah region yang digunakan untuk menyimpan repository. Kamu bisa mengganti region sesuai dengan kebutuhan.
- `--description="example repository for article"` adalah deskripsi dari repository yang akan dibuat.

Setelah repository berhasil dibuat, selanjutnya buat tag image dengan perintah berikut:
```bash
docker tag [SOURCE_IMAGE] [HOSTNAME]/[PROJECT-ID]/[REPOSITORY]/[IMAGE]:[TAG]
```
Berikut penjelasan dari perintah di atas:

- `SOURCE_IMAGE` adalah nama image yang akan di push.
- `HOSTNAME` adalah hostname dari repository yang sudah dibuat.
- `PROJECT`-ID adalah id project yang sudah dibuat. Kamu bisa melihat id project di sini.
- `REPOSITORY` adalah nama repository yang sudah dibuat.
- `IMAGE` adalah nama image yang akan di push.
- `TAG` adalah tag dari image yang akan di push.
- 
Jika kamu mengikuti langkah-langkah di atas, maka perintahnya akan menjadi seperti ini:

```bash
docker tag server:v1.0 asia-southeast1-docker.pkg.dev/article-392205/article/server:v1.0
```

untuk project id sesuaikan dengan project id yang kamu buat pada GCP. Jika sudah, selanjutnya push image Docker dengan perintah berikut:

```bash
docker push asia-southeast1-docker.pkg.dev/article-392205/article/server:v1.0
```

pastikan nama image yang kamu push sama dengan nama image yang sudah dibuat sebelumnya.

# Deploy ke Cloud Run
Langkah terakhir sekaligus yang paling ditunggu adalah deploy aplikasi ke Cloud Run. Dimana disini saya akan melakukan deploy lewat [console GCP](https://console.cloud.google.com/). Kamu juga bisa menggunakan GCP SDK untuk melakukan deploy. Tapi itu untuk lain waktu ehehe.

Pertama, buka [console GCP](https://console.cloud.google.com/) lalu pilih Cloud Run pada menu di sebelah kiri. Selanjutnya silahkan ikuti pada gambar dibawah.

![console GCP](https://i.ibb.co/yfNH2Z5/2023-07-08-16-42.png)

Jika sudah dibuka, silahkan tekan tombol create service yang ada pada bagian atas. Selanjutnya silahkan ikuti pada gambar dibawah.

![console GCP](https://i.ibb.co/hV96D05/2023-07-08-16-45.png)

Jika kamu mengikut tutorial ini, maka kamu akan mendapatkan tampilan seperti gambar diatas. Dimana container image akan muncul di bagian artifact registry. Jika sudah, silahkan pilih image yang akan di deploy. Selanjutnya silahkan ikuti pada gambar dibawah.

![console GCP](https://i.ibb.co/tCH2ftV/2023-07-08-16-48.png)

Berikut penjelasan dari gambar di atas:
- `Service name` : Nama service yang akan dibuat.
- `Region` : Region yang akan digunakan untuk deploy service. Kamu bisa mengganti region sesuai dengan kebutuhan.
- `CPU Allocation` : CPU yang akan dialokasikan untuk service. dimana disini saya memilih CPU is only allocated during request processing yang artinya CPU hanya - dialokasikan ketika ada request yang masuk. Hal ini bisa menghemat biaya karena instance tidak akan berjalan ketika tidak ada request yang masuk. Namun, memang - memerlukan waktu untuk menjalankan service ketika ada request yang masuk.
- `Autoscaling` : disini saya mengisi 0 pada minimum instance dan 10 pada maximum instance. Artinya service akan berjalan minimal 0 instance dan maksimal 10 instance.
- `Ingress Control` : disini saya memilih Allow all traffic yang artinya semua traffic akan diizinkan untuk mengakses service. Kamu bisa mengganti sesuai dengan kebutuhan.
- `Authentication` : disini saya memilih Allow unauthenticated invocations yang artinya service bisa diakses tanpa perlu authentikasi.

Jika sudah, silahkan tekan tombol create. Jika berhasil, maka kamu akan mendapatkan tampilan seperti gambar dibawah.

![console GCP](https://i.ibb.co/T4s58kv/2023-07-08-16-54-1.png)

Untuk memastikan service sudah berjalan, silahkan buka url yang ada pada bagian service URL. Jika berhasil, maka kamu akan mendapatkan tampilan seperti gambar dibawah.

![hasil](https://i.ibb.co/RSnDw34/2023-07-08-16-56.png)

# Conclusion
Sekian tutorial kali ini. untuk source code bisa dilihat pada github saya disini. [https://github.com/radenrishwan/go-cloud-run](https://github.com/radenrishwan/go-cloud-run)