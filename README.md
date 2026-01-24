# 🎵 Music Player Web - Hệ Thống Nghe Nhạc Trực Tuyến

> **TContributor:** Oleny, Yuri
> **Cập nhật lần cuối:** 24/01/2026

---

## 🛠 Công Nghệ Sử Dụng

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 📖 Mục Lục

1. [Tổng Quan Tính Năng](#-tổng-quan-tính-năng)
2. [Hướng Dẫn Cài Đặt & Sử Dụng](#-hướng-dẫn-cài-đặt--sử-dụng)
3. [Thư Viện & Tài Nguyên](#-thư-viện--tài-nguyên)
4. [Lộ Trình Phát Triển](#-lộ-trình-phát-triển)
5. [Ghi Chú](#-ghi-chú)

---

## 🚀 Tổng Quan Tính Năng

Hệ thống được thiết kế tối ưu cho trải nghiệm nghe nhạc cá nhân và quản trị nội dung.

<table>
  <tr>
    <th width="33%">👤 Người dùng (User)</th>
    <th width="33%">🛡️ Quản Trị Viên (Admin)</th>
    <th width="33%">🔐 Chung (Auth)</th>
  </tr>
  <tr>
    <td valign="top">
      <ul>
        <li>🏠 Trang chủ & Khám phá nhạc</li>
        <li>📻 Trình phát nhạc (Streaming)</li>
        <li>🔍 Tìm kiếm & Gợi ý thông minh</li>
        <li>📜 Album và Playlist (Lyrics)</li>
        <li>📂 Quản lý thư viện cá nhân</li>
      </ul>
    </td>
    <td valign="top">
      <ul>
        <li>🏠 Dashboard thống kê</li>
        <li>📦 Quản lý bài hát & Album</li>
        <li>👥 Quản lý người dùng</li>
        <li>📝 Biên tập lời bài hát</li>
        <li>🖼️ Quản lý Banner/Giao diện</li>
      </ul>
    </td>
    <td valign="top">
      <ul>
        <li>🔑 Đăng nhập/Đăng ký</li>
        <li>🛡️ Xác thực qua JWT</li>
        <li>✅ Phân quyền hệ thống</li>
        <li>👤 Quản lý Profile</li>
      </ul>
    </td>
  </tr>
</table>

---

## 💻 Hướng Dẫn Cài Đặt & Sử Dụng

**1. Cài đặt Backend (Django):**
```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
```
**Chạy backend**
```
python manage.py runserver
``` 
**tạo tài khoản admin dùng**
```
python manage.py createsuperuser
```


**2. Cài đặt Frontend (React + Vite):**

```
cd client
npm install
```
**Chạy Frontend**
```npm run dev```

**3. cài đặt Spotify API**
vào trang [Spotify for Developer](https://developer.spotify.com) để lấy API key và lưu vào file ```server/.env``` dưới dạng
```
SPOTIFY_CLIENT_ID=<Your Client ID>
SPOTIFY_CLIENT_SECRET=<Your Client Secret>
```

**4. cài đặt PhoBERT**

lưu model PhoBERT của bạn vào đường dẫn ```server/data/music_phobert_v1```

link model đã fine tune theo chủ đề nhạc [PhoBERT](https://tinyurl.com/4upsajt3), tải về và giải nén

## 📚 Thư viện

### Core Framework & API
> Django (5.2.7) & djangorestframework (3.16.1): Framework chính cho Backend.

> Spotipy (2.25.2): Thư viện kết nối Spotify API.

> Aiohttp (3.11.18) & Requests (2.32.3): Xử lý các yêu cầu mạng.

### Audio & Image Processing
> FFmpeg: Công cụ xử lý stream và chuyển đổi định dạng audio.

> Mutagen: Thao tác và chỉnh sửa metadata (ID3 tags) cho file nhạc.

> Pillow: Xử lý hình ảnh, ảnh bìa album (Artwork).

### AI & Xử Lý Ngôn Ngữ Tự Nhiên (Vietnamese NLP)
> Torch (2.9.1) & Transformers (5.0.0rc3): Chạy mô hình học sâu PhoBERT.

> Whisper-api: Chuyển đổi âm thanh thành văn bản (hỗ trợ tạo Lyrics tự động).

> Underthesea (8.3.0) & Pyvi (0.1.1): Tách từ và phân tích cú pháp tiếng Việt.

> Unidecode (1.4.0): Chuẩn hóa văn bản tiếng Việt không dấu.

### Tiện ích & Xử lý dữ liệu
> Beautifulsoup4 (4.14.2): Thu thập dữ liệu âm nhạc.

> Numpy (2.3.5), Pandas, Networkx: Xử lý dữ liệu và tính toán số học.

> Tiktoken (0.12.0): Tokenizer hỗ trợ cho các mô hình AI.

