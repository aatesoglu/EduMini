# 🎓 EduMini – Mini Eğitim Portalı

EduMini; React + TypeScript tabanlı bir **frontend** ve Node.js (Express) tabanlı bir **backend** içeren, eğitim içeriklerinin yönetilebildiği mini bir eğitim portalıdır.  
Proje; kullanıcı yönetimi, kurslar, duyurular, yetkilendirme ve güvenlik (CSRF, JWT) gibi temel özellikleri kapsar.

---

## 🚀 Özellikler

### Frontend
- React + TypeScript
- Vite ile hızlı geliştirme ortamı
- Sayfa yönlendirme (React Router)
- Kullanıcı yetkilendirme (Protected Route)
- Admin & Instructor panelleri
- CSRF korumalı istekler
- Modern ve responsive arayüz

### Backend
- Node.js + Express
- MySQL veritabanı
- JWT tabanlı kimlik doğrulama
- CSRF koruması
- MVC mimari yaklaşımı
- Dosya yükleme altyapısı (upload middleware)
- Modüler controller / route yapısı

---
---

## ⚙️ Kurulum

### 1️⃣ Repoyu klonla
```bash
git clone https://github.com/aatesoglu/EduMini.git
cd EduMini

npm install
npm run dev
cd backend
npm install

---
###🔐 Ortam Değişkenleri (.env)

PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=edumini
DB_PORT=3306

JWT_SECRET=your_jwt_secret

