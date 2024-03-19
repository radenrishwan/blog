---
title: Bikin script buat download lebih kenceng kaya IDM
description: ""
pubDate: 2024-03-19T10:40:47.884Z
heroImage: "https://i.ibb.co/ys99jjt/Salinan-dari-Belajar-Go-1-Bikin-Chatapp.png"
author: Raden Mohamad Rishwan
short: Siapa sih yang gatau IDM?. kayanya aplikasi ini terkenal banget bagi orang - orang yang kerjaanya download di warnet tau aplikasi ini 😅. Aplikasi ini punya banyak fitur kaya `download resume`, bisa download file kaya video youtube langsung, bisa ganti - ganti proxy, dll.
tags:
    - programming
    - golang
type: default
slug: bikin-script-buat-download-lebih-kenceng-kaya-idm
---

Siapa sih yang gatau IDM?. kayanya aplikasi ini terkenal banget bagi orang - orang yang kerjaanya download di warnet tau aplikasi ini 😅. Aplikasi ini punya banyak fitur kaya `download resume`, bisa download file kaya video youtube langsung, bisa ganti - ganti proxy, dll.

Tapi, bukan itu fitur yang sebenernya diincer penggunanya, atau mungkin saya doang. Salah satu fitur yang sebenarnya dicari yaitu kecepatan downloadnya yang lebih cepet kalau dibandingin pake browser. Dari banyak fitur yang ditawarin, sayangnya aplikasi ini berbayar yang sebenernya ga terlalu mahal sekitar 400rb-an kalau beli lisensi lifetimenya (*harga sewaktu artikel ditulis). Tapi, 400rb itu bukan duit yang kecil bagi saya sewaktu kecil dan duitnya malah abis kepake buat bayar sewa nya.

Pernah penasaran ga sih kenapa kalau download di IDM itu lebih cepet ?. Sewaktu masih sering ke warnet, pertanyaan ini pernah keluar beberapa kali tapi gak pernah cari tau karena emang gak ngerti 😆. Nah karena sekarang seenggaknya udah ngerti ngoding dikit - dikit, saya cari tau caranya.

# Gimana sih IDM bikin kenceng speed downloadnya ?
Sebenarnya, caranya cukup simpel yaitu dengan cara mendownloadnya dari server tapi bedanya downloadnya dipisah dari beberapa part dan dilakuin bareng - bareng. Misalnya download file 1GB dipisah jadi 4 part jadi setiap partnya itu download 25MB. Kalau gitu, bukannya sama aja?. Sebenernya sama aja, malah bikin nambah prosesnya yaitu nyatuin filenya. Tapi, yang bikin lebih kenceng itu kadang ada server yang ngelimit kecepatan downloadnya. Hal itu biasanya dilakuin supaya terhindar dari DDoS atau serangan lainnya.

# Gimana caranya ?
Setelah tau cara kerjanya, terus gimana caranya ngebagi part nya?. Caranya cukup simpel, yaitu dengan manfaatin header yaitu `Range` dan `Content-Lenght`. Misalnya, kalau download 1GB, berarti nanti ada 4 proses download yang setiap proses berbeda header `Range`-nya berarti isinya yaitu `Range: bytes=0-25000000`, `Range: bytes=25000000-50000000`, dst. Nah buat tau batas rangenya, bisa manfaatin header `Content-Lenght`. Kira - kira kaya gini stepnya.

![download process](https://i.ibb.co/dD6MJJ5/diagram.png)

# Nulis Kode
Disini, saya bakalan buat kodingannya pake Go karena saya emang suka ngoding pake Go. Bagi yang ga tau atau ga familiar, sebenernya ga masalah karena emang step nya simpel.

Pertama, saya bakalan buat struct buat nampung data yang bakalan dipake.

```go
// [DownloadMetaData] is a struct that contains metadata of a url to be downloaded
type DownloadMetaData struct {
	Url string
	// Length is the size of the file in bytes
	Length uint64
	// FileName is the name of the file
	FileName string
	// ContentType is the type of the file
	ContentType string
}
```

Nah, karena udah tau apa aja yang diperluin, disini saya buat 1 function buat data yang diperluin.

```go
// [GetMetaData] is a function to get metadata of a url to be downloaded
func GetMetaData(url string) (DownloadMetaData, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return DownloadMetaData{}, err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return DownloadMetaData{}, err
	}

	defer resp.Body.Close()

	if resp.StatusCode > 300 {
		return DownloadMetaData{}, errors.New("could not get metadata, maybe the URL is wrong?")
	}

	contentLength, err := strconv.Atoi(resp.Header.Get("Content-Length"))
	if err != nil {
		return DownloadMetaData{}, errors.New("could not get metadata, maybe the URL is wrong?")
	}

	filename := resp.Header.Get("Content-Disposition")
	contentType := resp.Header.Get("Content-Type")

	if filename == "" {
		filename = time.Now().String() + "." + contentType
	}

	return DownloadMetaData{
		Url:         url,
		Length:      uint64(contentLength),
		FileName:    filename,
		ContentType: contentType,
	}, nil
}
```

Sekarang, kita bakalan tes kalau kodenya jalan. Buat tes, disini saya bakalan buat `http server`. yang nantinya bakalan dibuat 1 url download. Buat contoh, disini saya pakai file `.gif`. Kira - kira kaya gini. Pastiin kalau kamu juga udah nyimpen filenya di folder dummy.

```go
// main.go
package main

import (
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/download", DownloadHandler)

	err := http.ListenAndServe(":3000", mux)
	if err != nil {
		log.Fatalln("Failed to start server", err)
	}
}

func DownloadHandler(w http.ResponseWriter, r *http.Request) {
	filename := "demo.gif"
	mimetype := "text/plain"

	w.Header().Set("Content-Disposition", "attachment; filename="+filename)
	w.Header().Set("Content-Type", mimetype)

	http.ServeFile(w, r, "dummy/"+filename)
}
```

Silahkan jalanin lalu coba tes pake `curl`. Kalau berhasil hasilnya kaya gini.

```bash
$ curl -v -r 3000-5000 localhost:3000/download -O
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0*   Trying [::1]:3000...
* Connected to localhost (::1) port 3000
> GET /download HTTP/1.1
> Host: localhost:3000
> Range: bytes=3000-5000
> User-Agent: curl/8.4.0
> Accept: */*
> 
< HTTP/1.1 206 Partial Content
< Accept-Ranges: bytes
< Content-Disposition: attachment; filename=demo.gif
< Content-Length: 2001
< Content-Range: bytes 3000-5000/11279314
< Content-Type: text/plain
< Last-Modified: Fri, 26 Jan 2024 01:50:15 GMT
< Date: Tue, 19 Mar 2024 21:09:08 GMT
< 
{ [2001 bytes data]
100  2001  100  2001    0     0  1041k      0 --:--:-- --:--:-- --:--:-- 1954k
* Connection #0 to host localhost left intact
```

Nah sekarang, saya buat lagi file `main.go` lagi buat testnya. Silahkan buat dan isi kode dibawah. abis itu running 2 file main.go nya
```go
package main

import (
	"log"

	downloadmanager "github.com/radenrishwan/download-manager"
)

func main() {
	data, err := downloadmanager.GetMetaData("http://localhost:3000/download")
	if err != nil {
		log.Panicln("Failed to get metadata", err)
	}

	log.Println(data)
}
```

```bash
$ go run cmd/main.go                                                                                                                   1 ↵
2024/03/20 04:14:00 {http://localhost:3000/download 11279314 attachment; filename=demo.gif text/plain}
```

Sampe sini, kita udah dapet metadata dari url yang kita pake. Sekarang, kita buat function buat download. dimana isinya yaitu ngelakuin looping buat ngebagi tugas downloadnya nanti yaitu dengan cara nambahin header `Range`-nya. Abis itu, buat file dummy nya yang nantinya dipake buat nampung data per-partnya. nah abis itu, bakalan running function `download` pake goroutine per-part. Setelah selesai download file per-partnya, filenya bakalan di merge.

```go
type rangeHeader struct {
	Start uint64
	End   uint64
}

// [DownloadFile] is a function to download a file from a url
func DownloadFile(metadata DownloadMetaData, parrarel int) error {
	var header []rangeHeader
	var currentPart uint64 = 0

	for i := 0; i < parrarel; i++ {
		fileSize := metadata.Length / uint64(parrarel)
		header = append(header, rangeHeader{
			Start: currentPart,
			End:   currentPart + fileSize - 1,
		})

		if i == parrarel-1 {
			fileSize += metadata.Length % uint64(parrarel)

			header[i].End += metadata.Length % uint64(parrarel)
		}

		currentPart += fileSize
	}

	filename := make(chan string, parrarel)
	var res []string
	for i := 0; i < parrarel; i++ {
		go download(filename, metadata, header[i], i)
	}

	// get all the file names from the channel
	for v := range filename {
		res = append(res, v)
		if len(res) == parrarel {
			sort.Strings(res)
			break
		}
	}

	f, err := os.OpenFile(strings.Split(metadata.FileName, "=")[1], os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	for _, v := range res {
		log.Println("merging file", v)
		file, err := os.Open(v)
		if err != nil {
			return err
		}

		_, err = io.Copy(f, file)
		if err != nil {
			return err
		}

		file.Close()
		os.Remove(v)
	}

	return nil
}
```

Untuk function `download`, saya pake function `io.TeeReader` supaya nantinya saya bisa lihat proses download dari per-partnya. Setelah selesai download, bakalan ngembaliin string filename buat ngasih tau kalau file partnya udah selesai di download.

```go
type writeCounter struct {
	Filename string
	Total    uint64
}

// Write implements the io.Writer interface.
//
// Always completes and never returns an error.
func (wc *writeCounter) Write(p []byte) (int, error) {
	n := len(p)
	wc.Total += uint64(n)
	fmt.Printf("Read %d bytes for a total of %d for %s\n", n, wc.Total, wc.Filename)
	return n, nil
}

func download(result chan<- string, metadata DownloadMetaData, header rangeHeader, part int) error {
	req, err := http.NewRequest("GET", metadata.Url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Range", "bytes="+strconv.Itoa(int(header.Start))+"-"+strconv.Itoa(int(header.End)))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	if resp.StatusCode > 299 {
		return errors.New("could not download file, maybe the URL is wrong?")

	}

	filename := strings.Split(metadata.FileName, "=")[1] + ".part" + strconv.Itoa(part) + ".🔥"

	file, err := os.Create(filename)
	if err != nil {
		return err
	}

	src := io.TeeReader(resp.Body, &writeCounter{
		Filename: filename,
	})

	// write file
	_, err = io.Copy(file, src)
	if err != nil {
		return err
	}

	result <- filename

	defer file.Close()
	defer resp.Body.Close()
	return nil
}
```

Sekarang silahkan update file `main.go` nya jadi kaya gini.

```go
package main

import (
	"log"

	downloadmanager "github.com/radenrishwan/download-manager"
)

func main() {
	data, err := downloadmanager.GetMetaData("http://localhost:3000/download")
	if err != nil {
		log.Panicln("Failed to get metadata", err)
	}

	err = downloadmanager.DownloadFile(data, 5)
	if err != nil {
		log.Panicln("Failed to download file", err)
	}
}
```

Sebagai contoh, disini saya bakalan bagi filenya jadi 5 part yang artinya nanti bakalan ada 5 proses download yang jalan bareng. Silahkan running lagi programmnya. Kalau berhasil outputnya bakalan kaya gini dan file hasil download nya gak rusak/break.

![result](https://s12.gifyu.com/images/SUyvR.gif)

Sekarang kita udah berhasil buat script downloadnya. Sebenarnya, masih banyak yang bisa diimprove misalnya bisa ganti proxy, bikin support resume download dengan maenin range-nya, atau mungkin dibuat aplikasi GUI nya 😃, mungkin nanti bakalan saya buat lanjutannya kalau lagi niat. Untuk link reponya silahkan lihat dibawah.

[https://github.com/radenrishwan/download-manager](https://github.com/radenrishwan/download-manager)