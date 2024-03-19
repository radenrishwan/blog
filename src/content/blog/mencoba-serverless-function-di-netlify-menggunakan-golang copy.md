---
title: Mencoba Serverless Function di Netlify Menggunakan Golang
description: ""
pubDate: 2023-01-31T06:23:57.784Z
heroImage: "https://raw.githubusercontent.com/radenrishwan/backup-articles/master/articles/Mencoba%20Serverless%20Function%20di%20Netlify%20Menggunakan%20Golang/images/Mencoba%20Serverless%20Function%20di%20Netlify%20Menggunakan%20Golang.jpg"
author: "Raden Mohamad Rishwan"
short: "Netlify merupakan salah satu website yang menyediakan layanan gratis seperti hosting untuk web statis, serverless function, user authentications, dll. dimana netlify ini menyediakannya gratis. namun, tentu ada limit penggunaanya. kamu dapat melihatnya disini. dimana pada kali ini saya akan membahasa mengenai serverless function di netlify yang dapat kamu coba secara gratis."
tags: ["netlify", "programming", "golang"]
type: default
slug: mencoba-serverless-function-di-netlify-menggunakan-golang-4
---

### Apa itu Netlify ?
Netlify merupakan salah satu website yang menyediakan layanan gratis seperti hosting untuk web statis, serverless function, user authentications, dll. dimana netlify ini menyediakannya gratis. namun, tentu ada limit penggunaanya. kamu dapat melihatnya [disini](https://www.netlify.com/pricing/). dimana pada kali ini saya akan membahasa mengenai serverless function di netlify yang dapat kamu coba secara gratis.

### Apa Itu Serverless Function ?
Serverless Function merupakan salah satu cara untuk membuat aplikasi tanpa dedicated server yang dimana nantinya akan dijalankan ketika ada trigger yang masuk. dimana pada netify ini kita membuat sebuah trigger nya dengan memanggil api.

Secara default, dimana nantinya function yang telah kita buat akan dideploy ke server AWS dan memiliki limit 10 detik untuk limit eksekusi  synchronous function sedangkan untuk background function selama 15 menit. 

#### Apa Perbedaan Antara Syncronous Function dan  Background Function ?
Syncronous Function nantinya akan berjalan secara berurutan. misalnya ketika kita menulis data ke database, maka kita akan menunggu prosesnya terlebih dahulu hingga selesai. Setelah selesai, nantinya baru menjalankan proses selanjutnya.

Sedangkan Background Function ini nanti berjalan secara Asynchronous dimana nanti prosesnya tidak perlu menunggu lagi operasi sebelumnya untuk menjalankan operasi selanjutnya.

Pada netify, saat ini hanya support  3 bahasa saja yaitu Golang, Javascript, dan Typescript. dimana pada kali ini saya akan menggnakan Golang untutk mendemokannya.

### Membuat Serverless Function
sebelum membuat function, kita akan menginstall sebuah CLI dari netlify untuk mempermudah melakukan deploy dan melakukan pengetasan. kamu perlu menginstall nodejs dan npm untuk menjalankan dan menginstallnya. dimana menginstallnya cukup mudah yaitu dengan cara:

~~~shell
$ npm install netlify-cli --save-dev 
~~~

setelah selesai, selanjutnya yaitu login ke netlify dengan cara menjalankan perintah dibawah. lalu, nantinya akan ada tab baru terbuka pada browser. kamu harus daftar terlebih dahulu untuk melanjutkan.

~~~shell
$ netlify login
~~~

Setelah selesai login, selanjutnya yaitu setup project.  dimana kamu dapat membuat sebuah folder baru. lalu membukanya dengan code editor atau ide.

Setelah membuat project baru, selanjutnya menginisiasi project dengan cara dibawah. silahkan menyesuaikan untuk beberapa opsi misalnya nama websitenya nanti yang akan digunakan sebagai endpoint.
~~~bash
$ netlify init
No git remote was found, would you like to set one up?

It is recommended that you initialize a site that has a remote repository in GitHub.

This will allow for Netlify Continuous deployment to build branch & PR previews.

For more details on Netlify CI checkout the docs: http://bit.ly/2N0Jhy5

? Do you want to create a Netlify site without a git repository? Yes, creat
e and deploy site manually
? Team: <NAMA_TEAM>
Choose a unique site name (e.g. netlify-thinks-radenrishwan-is-great.netlify.app) or leave it blank for a random name. You can update the site name later.
? Site name (optional): <NAMA_WEBSITE>

Site Created

Admin URL: <ADMIN_URL>
URL:       <URL_WEBSITE>
Site ID:   <ID_WEBSITE>

Linked to netlify-thinks-radenrishwan-is-great in /home/seior/Files/Development/Golang/Tutorial/netlify-functions/.netlify/state.json
"<NAMA_WEBSITE>" site was created

To deploy to this site. Run your site build and then netlify deploy
~~~

setelah selesai, selanjutnya yaitu membuat sebuah function. Dimana secara default, netlify akan mendeteksi di foler `YOUR_BASE_DIRECTORY/netlify/functions`. Kamu juga dapat mencustom direktorinya. Disini saya akan menggunakan pengaturan default. Namun, jika kamu ingin silahkan kunjungi [link disini](https://docs.netlify.com/functions/optional-configuration/?fn-language=go).

selain membuat secara manual, kamu bisa membuatnya dengan menggunakan CLI, pastikan kam memilih opsi sesuai dibawah ini. yaitu dengan cara dibawah:
~~~bash
$ netlify functions:create
? Select the type of function you like to create Serverless function (Node/Go)
◈ functions directory not specified in netlify.toml or UI settings
? Enter the path, relative to your site’s base directory in your repository, where your functions should live: netlify/functions
◈ updating site settings with netlify/functions
◈ functions directory netlify/functions updated in site settings
◈ functions directory netlify/functions does not exist yet, creating it...
◈ functions directory netlify/functions created
? Select the language of your function Go
? Pick a template go-hello-world
? Name your function: users # nama function 
◈ Creating function users
◈ Created netlify/functions/users/go.mod
◈ Created netlify/functions/users/go.sum
◈ Created netlify/functions/users/main.go
~~~

Sebelum menjalakannya, silahkan terlebih dahulu menignstall dependency yang diperlukan oleh functions nanti. yaitu silahkan buka folder function yang dibuat dan install depedency.
~~~bash
$ cd netlify/functions/users
$ go get github.com/aws/aws-lambda-go
~~~

Setelah selesai membuat function. kamu dapat mencobanya secara lokal dengan cara `netlify dev`. tetapi pastikan bahwa kamu berada pada folder project bukan folder function yang tadi. silahkan kembali terlebih dahulu
~~~bash
$ cd ../../.. # jika kamu masih ada di folder function. silahkan kembali
$ netlify dev
 Netlify Dev ◈
◈ Ignored general context env var: LANG (defined in process)
◈ No app server detected. Using simple static server
◈ Unable to determine public folder to serve files from. Using current working directory
◈ Setup a netlify.toml file with a [dev] section to specify your dev server settings.
◈ See docs at: https://cli.netlify.com/netlify-dev#project-detection
◈ Running static server from "netlify-functions"
◈ Loaded function users http://localhost:8888/.netlify/functions/users.
◈ Functions server is listening on 33761

◈ Static server listening to 3999

   ┌─────────────────────────────────────────────────┐
   │                                                 │
   │   ◈ Server now ready on http://localhost:8888   │
   │                                                 │
   └─────────────────────────────────────────────────┘
~~~

Silahkan kunjungi url berikut pada browser atau menggunakan curl
~~~bash
curl -v http://localhost:8888/.netlify/functions/users
~~~

Dimana kira - kira akan muncul seperti dibawah
![browser](https://raw.githubusercontent.com/radenrishwan/backup-articles/master/articles/Mencoba%20Serverless%20Function%20di%20Netlify%20Menggunakan%20Golang/images/2022-08-12_14-14.png)

Selanjutnya saya akan mencoba merubah kode pada function. Misalnya merubah responsenya menjadi json yaitu silahkan buka file main.go yang terdapat pada folder function. lalu edit menjadi seperti dibawah.
~~~go
package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type User struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	fmt.Println("This message will show up in the CLI console.")

	body, err := json.Marshal(User{
		Id:       "askdhasldjkhask",
		Username: "radenrishwan",
		Password: "netlify-function-example",
	})

	if err != nil {
		panic(err)
	}

	return &events.APIGatewayProxyResponse{
		StatusCode:      200,
		Headers:         map[string]string{"Content-Type": "application/json"},
		Body:            string(body),
		IsBase64Encoded: false,
	}, nil
}

func main() {
	lambda.Start(handler)
}
~~~

Silahkan buka browser, lalu reload url yang tadi dibuka, maka hasilnya seperti dibawah:
![browser](https://raw.githubusercontent.com/radenrishwan/backup-articles/master/articles/Mencoba%20Serverless%20Function%20di%20Netlify%20Menggunakan%20Golang/images/2022-08-12_14-22.png)

Selanjutnya yaitu kita akan mendeploy functions yang telah kita buat. yaitu dengan cara.
~~~bash
$ netlify deploy --prod
Please provide a publish directory (e.g. "public" or "dist" or "."):
/home/seior/Files/Development/Golang/Tutorial/netlify-functions
? Publish directory /home/seior/Files/Development/Golang/Tutorial/netlify-functions
Deploy path:    /home/seior/Files/Development/Golang/Tutorial/netlify-functions
Functions path: /home/seior/Files/Development/Golang/Tutorial/netlify-functions/netlify/functions
Deploying to main site URL...
✔ No cached functions were found
✔ Finished hashing 3 files and 1 functions
✔ CDN requesting 0 files and 0 functions
✔ Finished uploading 0 assets
✔ Deploy is live!

Logs:             <URL_TO_LOGS>
Unique Deploy URL: <UNIQUE_DEPLOY_URL>
Website URL:       <WEBSITE_URL>
~~~

setelah itu, silahkan kamu kunjungi website url yang ada pada terminal setelah kamu menjalankan perintah `netlify deploy --prod`. kira - kira url akan menjadi seperti dibawah. dimana nanti hasilnya akan sama seperti yang ada pada localhost kita sebelumnya.
~~~bash
<WEBSITE_URL>/.netlify/functions/users
~~~

Jadi itulah cara membuat serverless function menggunakan netilfy. Kamu dapat melakukan berbagai hal dengan menggunakan serverless function ini. misalnya seperti membuat RESTFul API, dll. 

### Hasil Project
[https://github.com/radenrishwan/netlify-functions-example](https://github.com/radenrishwan/netlify-functions-example)

Apa selanjutnya ?
[Membuat RESTFul API menggunakan netilfy dan firestore ]()
[Membaut Youtube Downloader API menggunaakn netlify]()

### Referensi
[https://docs.netlify.com/](https://docs.netlify.com/)