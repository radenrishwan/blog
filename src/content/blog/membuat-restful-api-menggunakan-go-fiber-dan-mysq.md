---
title: Membuat Restful API menggunakan GO Fiber dan MySQL
description: "Membuat restfull api menggunakan framework fiber dan mysql di golang"
pubDate: 2023-08-11T07:21:26.139Z
heroImage: "https://raw.githubusercontent.com/radenrishwan/backup-articles/master/articles/Membuat%20Restful%20API%20menggunakan%20GO%20Fiber%20dan%20MySQL/images/thumbnail.jpg"
author: "Raden Mohamad Rishwan"
short: "Go Fiber merupakan salah satu framework yang populer pada bahasa go. framework ini dapat digunakan untuk membuat sebuah restful api dengan mudah sesuai apa yang dikatakan oleh pembuatnya \"Fiber is a Go web framework built on top of Fasthttp, the fastest HTTP engine for Go. It's designed to ease things up for fast development with zero memory allocation and performance in mind.\" Pada artikel ini saya akan coba menunjukan bagaimana membuat sebuah restful api menggunakan GO Fiber."
tags: ["programming", "golang"]
type: default
---

### Apa itu GO Fiber ?
Go Fiber merupakan salah satu framework yang populer pada bahasa go. framework ini dapat digunakan untuk membuat sebuah restful api dengan mudah sesuai apa yang dikatakan oleh pembuatnya

> "Fiber is a Go web framework built on top of Fasthttp, the fastest HTTP engine for Go. It's designed to ease things up for fast development with zero memory allocation and performance in mind."

Pada artikel ini saya akan coba menunjukan bagaimana membuat sebuah restful api menggunakan GO Fiber.

### Langkah 1 : Setup Project
Langkah pertama yang harus dilakukan yaitu setup project. Untuk membuat sebuah project pada golang, kita cukup mengetik perintah dibawah ini pada terminal:

pertama, silahkan buat terlebih dahulu folder yang akan menampung project kita.
~~~bash
$ mkdir go-fiber-mysql
~~~

setelah itu, inisiasi golang modules.
~~~bash
$ go mod init "go-fiber-mysql"
~~~

selanjutnya, yaitu menginstall library yang nanti sekiranya akan kita gunakan

~~~bash
$ go get github.com/gofiber/fiber/v2 # menginstall go fiber
$ go get -u gorm.io/gorm # ORM untk MYSQL
$ go get -u gorm.io/driver/mysql # Driver MYSQL
$ go get github.com/joho/godotenv # Untuk menampung env variable
$ go get github.com/stretchr/testify # Lib bantuan untuk melakukan pengetesan
$ go get github.com/google/uuid # generate uuid
~~~

### Langkah 2: Setup Database
untuk setup database, saya akan menggunakan docker. namun, bagi teman - teman yang belum mengerti atau tidak mengguunakan docker, silahkan ikuti bagian `menggunakan database local` dan tidak perlu mengikuti bagian docker.

#### Menggunakan Database Local
untuk setup database, kita hanya perlu membuat database baru yaitu silahkan masuk terlebih dahulu pada MySQL. kamu dapat mengguakan termnal ata aplikasi seperti DataGrip atau phpmyadmin. disini, saya akan menggunakan terminal untuk membuat databasenya dengan nama `fiber-restful`.
~~~bash
$ mysql -u <USER> -p <PASSWORD> # masuk ke dalam mysql
$ > create database fiber_restful; # membuat database baru
$ > exit # keluar dari mysql
~~~

#### Menggunakan Docker
saya akan menggunakan docker-compose untuk mempermudah dalam setup database. silahkan teman - teman buat file `docker-compose.yml` yaitu dengan cara:

~~~bash
$ touch docker-compose.yml # membuat file docker-compose.yml
~~~

setelah selesai, silahkan masukan kode dibawah ini pada file yang tadi dibuat
~~~yml
# docker-compose.yml
services:
  database:
    container_name: 'go-fiber-mysql' # nama container
    image: mysql:latest
    build:
      context: .
    ports:
      - '3306:3306' # port yang dibuka ke local
    environment:
      MYSQL_ROOT_PASSWORD: root # password root
      MYSQL_DATABASE: fiber_restful # nama database
~~~

setelah memasukan kode diatas, selanjutnya yaitu menjalan perintah docker-compose yang nantinya secara otomatis akan membuat sebuah container dengan nama go-fiber-mysql.
~~~bash
$ docker-compose up -d
~~~


### Membuat Environment Variables
ada baiknya ketika kita membuat sebuah project, kita menyimpan hal yang bersifat rahasia atau dinamis di luar aplikasi. biasanya, kita menggunakan environment variable. supaya lebih mudah dalam membuat sebuah environment variable, maka dari itu saya menggunakan `godotenv`. dimana nantinya semua env akan dimasukan ke file 
.env
pertama, silahkan buat terlebih file .env
~~~bash
$ touch .env
~~~

silahkan isikan env yang nantinya akan digunakan pada project.
~~~env
# .env
MYSQL_USERNAME=root
MYSQL_PASSWORD=root
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=fiber_restful
~~~

### Menghubungkan ke database
Setelah itu, silahkan buka terlebih dahulu project kita dengan IDE atau kode editor. disini saya akan menggunakan Goland sebagai IDE-nya. namun, teman - teman juga bisa menggunakan IDE lain seperti VSCode atau Vim.

selanjutnya, silahkan buat beberapa folder dan file yang nanti akan kita gunakan. dimana, nantinya kira - kira akan seperti dibawah hasilnya:
~~~bash
go-fiber-mysql
├── database
│   └── database.go
├── handler
│   └── article.handler.go
├── model
│   └── article.go
├── repository
│   └── article.repository.go
├── docker-compose.yml
├── .env
└── main.go
~~~

setelah selesai membuat folder dan file, silahkan teman - teman buka folder `database.go`. lalu isikan kode dibawah ini:

~~~go
// database.go
package database

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"os"
)

func NewDB() *gorm.DB {
	username := os.Getenv("MYSQL_USERNAME")
	password := os.Getenv("MYSQL_PASSWORD")
	host := os.Getenv("MYSQL_HOST")
	port := os.Getenv("MYSQL_PORT")
	database := os.Getenv("MYSQL_DATABASE")

	dsn := fmt.Sprintf("%s:%s@udp(%s:%s)/%s", username, password, host, port, database)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	return db
}
~~~

setelah memasukan kode diatas, ada baiknya kita melakukan test terlebih dahulu apakah kode kita berjalan apa tidak. maka dari itu, silahkan buat file dengan nama `database_test.go` pada folder database. lalu masukan kode dibawah.

~~~go
// database_test.go
package database

import (
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"testing"
)

func setUp() {
	err := godotenv.Load("../.env")
	if err != nil {
		panic(err)
	}
}

func TestNewDB(t *testing.T) {
	setUp()

	db := NewDB()

	assert.Nil(t, db.Error)
}

~~~

silahkan jalankan perintah dibawah ini untuk menjalankan testnya.

~~~bash
$ go test ./...
ok      go-fiber-mysql/database 0.011s # OUTPUT
~~~

### Melakukan operasi CRUD ke database
#### Membuat Model
Pertama, silahkan buka file article.go yang ada pada folder model. fungsi dari model ini yaitu untuk mempresentasikan sebuah objek pada database atau aplikasi. misalnya pada database, terdapat tabel dengan nama article yang dimana memiliki kolom id, title, description. dimana nantinya akan dibuatkan sebuah model yang berisi struct yang memiliki variable seperti pada tabel.  *(biasa disebut juga entity atau domain)*

untuk lebih jelasnya langsung kita praktekan saja. silahkan buka file `article.go`. lalu, isikan kode dibawah.

~~~go
// article.go
package model

type Article struct {
	Id          string `gorm:"primaryKey"`
	Title       string
	Description string
}
~~~

pada variable Id, terdapat sebuah tag `gorm`. hal ini berfungsi untuk memberi tahu gorm bahwa field Id digunakan sebagai primary key. untuk referensi lainnya dapat kamu baca di [dokumentasi resmi gorm](https://gorm.io/docs/models.html)

#### Melakukan Query ke database menggunakan GORM
untuk query ke database, semua kode akan disimpan pada folder repository, hal ini dilakukan supaya nanti pada handler kita hanya perlu memanggil repository untuk melakukan query. *(biasa disebut juga dengan DTO (Data Transfer Object)*

silahkan ketik kode dibawah pada file `article.repository.go`.
~~~go
// article.repository,go
package repository

import (
	"errors"
	"go-fiber-mysql/model"
	"gorm.io/gorm"
)

type ArticleRepository interface {
	Create(article model.Article) (model.Article, error)
	FindById(model.Article) (model.Article, error)
	Update(model.Article)
	Delete(model.Article)
}

type articleRepository struct {
	*gorm.DB
}

func NewArticleRepository(DB *gorm.DB) ArticleRepository {
	return &articleRepository{DB: DB}
}

func (repository *articleRepository) Create(article model.Article) (model.Article, error) {
	repository.DB.Create(&article)

	return article, nil
}

func (repository *articleRepository) FindById(article model.Article) (model.Article, error) {
	result := repository.DB.Where("id = ?", article.Id).First(&article)

	if result.RowsAffected < 1 {
		return article, errors.New("article not found")
	}

	return article, nil
}

func (repository *articleRepository) Update(article model.Article) {
	repository.DB.Where("id = ?", article.Id).Updates(&article)
}

func (repository *articleRepository) Delete(article model.Article) {
	repository.DB.Where("id = ?", article.Id).Delete(&article)
}
~~~

selanjutnya yaitu melakukan test. silahkan buat file baru dengan nama `article.repository_test.go` lalu isikan kode dibawah ini.

~~~go
// article.repository_test.go
package repository

import (
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"go-fiber-mysql/database"
	"go-fiber-mysql/model"
	"gorm.io/gorm"
	"testing"
)

type ArticleRepositorySuite struct {
	suite.Suite
	*gorm.DB
	ArticleRepository
}

func (suite *ArticleRepositorySuite) SetupTest() {
	err := godotenv.Load("../.env")
	if err != nil {
		panic(err)
	}

	suite.DB = database.NewDB()

	err = suite.DB.AutoMigrate(&model.Article{})
	if err != nil {
		panic(err)
	}

	suite.ArticleRepository = NewArticleRepository(suite.DB)

	suite.DB.Exec("delete from articles")
}

func (suite *ArticleRepositorySuite) TestCreate() {
	result := suite.ArticleRepository.Create(model.Article{
		Id:          uuid.NewString(),
		Title:       "What is React JS ?",
		Description: "React. js is an open-source JavaScript library that is used for building user interfaces specifically for single-page applications",
	})

	article, err := suite.ArticleRepository.FindById(result)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), result, article)
}

func (suite *ArticleRepositorySuite) TestUpdate() {
	result := suite.ArticleRepository.Create(model.Article{
		Id:          uuid.NewString(),
		Title:       "What is React JS ?",
		Description: "React. js is an open-source JavaScript library that is used for building user interfaces specifically for single-page applications",
	})

	suite.ArticleRepository.Update(model.Article{
		Id:          result.Id,
		Title:       "What is Go Fiber ?",
		Description: "Fiber is a Go web framework built on top of Fasthttp, the fastest HTTP engine for Go. It's designed to ease things up for fast development with zero memory allocation and performance in mind.",
	})

	article, err := suite.ArticleRepository.FindById(result)

	assert.Nil(suite.T(), err)
	assert.NotEqual(suite.T(), result, article)
}

func (suite *ArticleRepositorySuite) TestDelete() {
	result := suite.ArticleRepository.Create(model.Article{
		Id:          uuid.NewString(),
		Title:       "What is React JS ?",
		Description: "React. js is an open-source JavaScript library that is used for building user interfaces specifically for single-page applications",
	})

	suite.ArticleRepository.Delete(result)

	_, err := suite.ArticleRepository.FindById(result)

	assert.NotNil(suite.T(), err)
}

func (suite *ArticleRepositorySuite) TearDownSuite() {
	suite.DB.Exec("delete from urls")
}

func TestArticleRepsitory(t *testing.T) {
	suite.Run(t, new(ArticleRepositorySuite))
}
~~~

lalu jalankan test dengan command dibawah.

~~~bash
$ go test ./repository/...
ok      go-fiber-mysql/repository       (cached) # OUTPUT
~~~

Setelah kita membuat repository yang dimana isinya merupakan query ke database. selanjutnya yaitu membuat handler. dimana pada bagian ini kita akan melakukan routing dimana nantinya menjadi sebagai berikut:

endpoint: `{application_url}/articles`

|     description    | method |  url |
| ------------------ | ------ | ---- |
| create new article | POST   | /    |
| get article by id  | GET    | /    |
| update article     | PUT    | /    |
| delete article     | DELETE | /    |

### Membuat Web Response
Sebelum membuat handler, kita akan membuat terlebih dahulu sebuah struct untuk web response. mengapa berbeda dengan model ?. web response berbeda dengan model. karena, sewaktu - waktu kita tidak ingin mengekspose beberapa data dalam table.

Misalnya pada tabel product, terdapat kolom id, price, stock, owner, dll. pada kasus ini, kita hanya ingin memberikan sebuah response hanya data id price dan stok saja. maka dari itu, lebih baik memisahkan antara web response dan juga model.

Sekarang, silahkan buat folder dengan nama `web`. lalu, buat file dengan nama `common.response.go` dan juga `article.response.go`. kira - kira seperti ini hasilnya nanti.
~~~bash
go-fiber-mysql
├── database
│   └── database.go
├── handler
│   └── article.handler.go
├── model
│   └── article.go
├── repository
│   └── article.repository.go
├── web
|   ├── common.response.go
│   └── article.response.go
├── docker-compose.yml
├── .env
└── main.go
~~~

pada hal ini, file `common.response.go` digunakan sebagai standard response kita. lalu, untuk `article.response.go` digunakan untuk response ketika user ingin mengambil data article. namun, kali ini karena kebetulan model dan juga responsenya sama, maka isinya pun akan sama.

silahkan buka kedua file yang dibuat tadi. lalu, isikan kode dibawah
~~~go
// common.response.go
package web

type CommonResponse[T any] struct {
	Message string `json:"message"`
	Data    T      `json:"data"`
}
~~~

~~~go
// article.response.go
package web

type ArticleResponse struct {
	Id          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`

}
~~~

pada file ini, dapat dilihat ada sebuah tag dengan nama `json`. hal ini dipakai sebagai penanda nanti untuk response jsonnya. kita juga perlu menambahkan tag json pada model kita, karena nanti akan kita gunakan sebagai requestnya. silahkan buka file `article.go` lalu edit menjadi seperti: 

~~~go
// article.go
package model

type Article struct {
	Id          string `gorm:"primaryKey" json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}
~~~

### Membuat Handler
Selanjutnya, silahkan buka file `article.handler.go`. lalu isikan kode dibawah

~~~go
// article.handler.go
package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"go-fiber-mysql/model"
	"go-fiber-mysql/repository"
	"go-fiber-mysql/web"
	"net/http"
)

type ArticleHandler interface {
	Create(ctx *fiber.Ctx) error
	FindById(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
	Bind(app *fiber.App)
}

type articleHandler struct {
	repository.ArticleRepository
}

func NewArticleHandler(articleRepository repository.ArticleRepository) ArticleHandler {
	return &articleHandler{ArticleRepository: articleRepository}
}

func (handler *articleHandler) Create(ctx *fiber.Ctx) error {
	var article model.Article

	err := ctx.BodyParser(&article)
	if err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(web.CommonResponse[any]{
			Message: "Bad Request",
			Data:    nil,
		})
	}

	article.Id = uuid.NewString()

	result := handler.ArticleRepository.Create(article)

	return ctx.Status(http.StatusCreated).JSON(web.CommonResponse[web.ArticleResponse]{
		Message: "201 Created",
		Data: web.ArticleResponse{
			Id:          result.Id,
			Title:       result.Title,
			Description: result.Description,
		},
	})
}

func (handler *articleHandler) FindById(ctx *fiber.Ctx) error {
	id := ctx.Query("id", "")

	result, err := handler.ArticleRepository.FindById(model.Article{
		Id: id,
	})

	if err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(web.CommonResponse[any]{
			Message: "Article Not Found",
			Data:    nil,
		})
	}

	return ctx.Status(http.StatusCreated).JSON(web.CommonResponse[web.ArticleResponse]{
		Message: "201 Created",
		Data: web.ArticleResponse{
			Id:          result.Id,
			Title:       result.Title,
			Description: result.Description,
		},
	})
}

func (handler *articleHandler) Update(ctx *fiber.Ctx) error {
	var article model.Article

	err := ctx.BodyParser(&article)
	if err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(web.CommonResponse[any]{
			Message: "Bad Request",
			Data:    nil,
		})
	}

	_, err = handler.ArticleRepository.FindById(model.Article{
		Id: article.Id,
	})

	if err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(web.CommonResponse[any]{
			Message: "Article Not Found",
			Data:    nil,
		})
	}

	handler.ArticleRepository.Update(article)

	return ctx.Status(http.StatusOK).JSON(web.CommonResponse[web.ArticleResponse]{
		Message: "200 OK",
		Data: web.ArticleResponse{
			Id:          article.Id,
			Title:       article.Title,
			Description: article.Description,
		},
	})
}

func (handler *articleHandler) Delete(ctx *fiber.Ctx) error {
	id := ctx.Query("id", "")

	_, err := handler.ArticleRepository.FindById(model.Article{
		Id: id,
	})

	if err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(web.CommonResponse[any]{
			Message: "Article Not Found",
			Data:    nil,
		})
	}

	handler.ArticleRepository.Delete(model.Article{
		Id: id,
	})

	return ctx.Status(http.StatusOK).JSON(web.CommonResponse[string]{
		Message: "200 OK",
		Data:    "Delete Successfully",
	})
}

func (handler *articleHandler) Bind(app *fiber.App) {
	app.Post("api/article", handler.Create)
	app.Get("api/article", handler.FindById)
	app.Put("api/article", handler.Update)
	app.Delete("api/article", handler.Delete)
}
~~~

Setelah selesai, silahkan buka file main.go untuk menginject semua file yang telah kita buat. namun, baiknya kita menggunakan depedency injector untuk melakukannya. tetapi, kali ini saya tidak akan menggunakannnya karena file yang digunakan masih sedikit. Jadi, kita akan menginjectnya secara manual.

silahkan buka file `main.go` lalu ketik kode seperti dibawah.

~~~go
// main.go
package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"go-fiber-mysql/database"
	"go-fiber-mysql/handler"
	"go-fiber-mysql/model"
	"go-fiber-mysql/repository"
	"go-fiber-mysql/web"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	app := fiber.New()

	app.Use(logger.New())  // digunakan untuk menampilkan log app
	app.Use(recover.New()) // digunakan untuk recover app jika break pada app

	// DB
	db := database.NewDB()

	err = db.AutoMigrate(&model.Article{}) // database migration
	if err != nil {
		panic(err)
	}

	// repository
	articleRepository := repository.NewArticleRepository(db)

	// handler
	handler.NewArticleHandler(articleRepository).Bind(app)

	app.Get("/", func(ctx *fiber.Ctx) error {
		return ctx.JSON(web.CommonResponse[string]{
			Data:    "200 OK",
			Message: "Hello, World!",
		})
	})

	err = app.Listen(":8080")
	if err != nil {
		panic(err)
	}
}
~~~

### Melakukan Pengetesan Manual
untuk melakukan test, kamu bisa menggunakan postman atau aplikasi lain. jika kamu menggunakan vscode, kamu dapat menggunakan plugin thunder client atau jika pada goland dapat menggunakan file .http. namun, disini saya akan menggunakan postman untuk melakukan pengetesan

Silahkan buka terminal lalu jalankan aplikasi dengan cara `go run main.go`. dimana outputnya akan seperti dibawah.
~~~bash
$ go run main.go
 ┌───────────────────────────────────────────────────┐
 │                   Fiber v2.36.0                   │ 
 │               http://127.0.0.1:8080               │ 
 │       (bound on host 0.0.0.0 and port 8080)       │ 
 │                                                   │ 
 │ Handlers ............. 9  Processes ........... 1 │ 
 │ Prefork ....... Disabled  PID ............. 32418 │ 
 └───────────────────────────────────────────────────┘ 
~~~

Selanjutnya, buka terminal baru. lalu jalankan:
~~~bash
$ curl localhost:8080
{"message":"Hello, World!","data":"200 OK"} // outpt
~~~

Jika output nya seperti diatas, maka berarti aplikasi berjalan. selanjutnya silahkan coba satu - satu handler yang telah kita buat. silahkan buka postman, lalu buat request baru dengan cara:

##### Buat article baru
![create article](https://raw.githubusercontent.com/radenrishwan/backup-articles/master/articles/Membuat%20Restful%20API%20menggunakan%20GO%20Fiber%20dan%20MySQL/images/2022-08-11_21-39.png)

##### Cari article berdasarkan id
![find article](https://github.com/radenrishwan/backup-articles/blob/master/articles/Membuat%20Restful%20API%20menggunakan%20GO%20Fiber%20dan%20MySQL/images/2022-08-11_21-42.png?raw=true)

##### Update article
![update article](https://github.com/radenrishwan/backup-articles/blob/master/articles/Membuat%20Restful%20API%20menggunakan%20GO%20Fiber%20dan%20MySQL/images/2022-08-11_21-47_1.png?raw=true)

##### Delete article
![delete article](https://github.com/radenrishwan/backup-articles/blob/master/articles/Membuat%20Restful%20API%20menggunakan%20GO%20Fiber%20dan%20MySQL/images/2022-08-11_21-48.png?raw=true)

Sebenarnya, sampai sini kita sudah selesai membuat restful api. namun, ada beberapa kekurangan pada aplikasi yang kita buat. misalnya validasi, membuat custom error handler, dll.

Untuk hasilnya, kamu dapat mendapatkannya di [sini](https://github.com/radenrishwan/go-fiber-mysql)