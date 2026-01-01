# ⚔️ Samehadaku API (Unofficial)

> REST API powerful untuk scraping konten anime dari situs **Samehadaku**. Dibangun dengan **TypeScript**, **Express**, dan teknik scraping canggih untuk bypass proteksi Cloudflare & resolve link streaming.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Express](https://img.shields.io/badge/Express-4.18+-white?style=for-the-badge&logo=express)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

---

## 🔥 Fitur Utama

*   **⚡ Bypass Cloudflare/403**: Menggunakan teknik *Curl Impersonation* untuk menembus proteksi anti-bot.
*   **🎥 Streaming Link Resolver**: Otomatis melakukan *AJAX Request* untuk mendapatkan link video asli (`iframe`) dari server player (Wibufile, dll).
*   **🔍 Search & Pagination**: Mendukung pencarian anime dan navigasi halaman.
*   **📦 Batch Support**: Scraping daftar batch anime.
*   **🚀 Lightweight**: Menggunakan `Cheerio` yang jauh lebih ringan dibanding Puppeteer/Selenium.
*   **🛡️ Type-Safe**: Full TypeScript codebase.

---

## 🛠️ Instalasi

Pastikan kamu sudah menginstall **Node.js** dan **Curl** di sistem operasi kamu.

1.  **Clone Repository**
    ```bash
    git clone https://github.com/username/samehadaku-api.git
    cd samehadaku-api
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Build Project**
    ```bash
    npm run build
    ```

4.  **Jalankan Server**
    ```bash
    npm start
    ```
    *Server akan berjalan di `http://localhost:3000`*

    > Untuk mode development (auto-reload):
    > ```bash
    > npm run dev
    > ```

---

## 📚 Dokumentasi API

Base URL: `http://localhost:3000/api`

### 🏠 Home & Lists

| Method | Endpoint | Deskripsi | Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/home` | Mendapatkan data halaman utama (Episode Terbaru & Anime Rilis) | - |
| `GET` | `/anime/recent` | Daftar episode anime terbaru (Pagination) | `?page=1` |
| `GET` | `/anime/list` | Daftar seluruh anime (Pagination) | `?page=1` |
| `GET` | `/batch` | Daftar batch anime (Pagination) | `?page=1` |

### 🔍 Search

| Method | Endpoint | Deskripsi | Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/search` | Cari anime berdasarkan judul | `?q=Naruto&page=1` |

### 📄 Detail & Streaming

| Method | Endpoint | Deskripsi | Parameter |
| :--- | :--- | :--- | :--- |
| `GET` | `/anime/:slug` | Detail lengkap anime (Sinopsis, Genre, List Episode) | `slug`: Judul dari URL (cth: `one-piece`) |
| `GET` | `/episode/:slug` | Link streaming (iframe) & download per quality | `slug`: Judul episode (cth: `one-piece-episode-1155`) |

---

## ⚡ Contoh Response

### Get Episode Streaming (`/api/episode/:slug`)

```json
{
  "title": "One Piece Episode 1155 Sub Indo",
  "release_time": "4 days yang lalu",
  "server_list": [
    { "name": "Wibufile 480p", "post": "47615", "nume": "1", "type": "schtml" }
  ],
  "stream_url": "https://api.wibufile.com/embed/f350aa...",
  "download_links": [
    {
      "quality": "1080p",
      "links": [
        { "host": "Gofile", "url": "https://gofile.io/..." },
        { "host": "Krakenfiles", "url": "..." }
      ]
    }
  ]
}
```

---

## ⚠️ Disclaimer

Project ini dibuat hanya untuk tujuan **pembelajaran & edukasi** tentang teknik scraping web.
*   Developer tidak berafiliasi dengan Samehadaku.
*   Gunakan API ini dengan bijak. Jangan melakukan spam request yang membebani server target.
*   Segala risiko penggunaan ditanggung oleh pengguna.

---

## 👨‍💻 Author

Dibuat dengan ☕ dan TypeScript oleh **David**.

---
**Happy Coding!** 🚀
