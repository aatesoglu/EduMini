# EduMini Web Project Sitemap

Bu belge proje içerisindeki tüm sayfaları ve rota (route) yapılarını listeler. Mevcut kod yapısına göre güncellenmiştir.

**Son Güncelleme:** 2024

## 1. Genel Sayfalar (Public Routes)
Herkesin erişebileceği, `Navbar` ve `Footer` içeren ana bölümlerdir. Bu sayfalar `App.tsx` içindeki iç içe `Routes` yapısıyla yönetilir.

- **Ana Sayfa** (`/`)
  - Konum: `src/pages/Home.tsx`
  - Açıklama: Sitenin vitrin sayfası.

- **Kurslar** (`/courses`)
  - Konum: `src/pages/Courses.tsx`
  - Açıklama: Tüm kursların listelendiği sayfa.

- **Kurs Detay** (`/courses/:id`)
  - Konum: `src/pages/CourseDetail.tsx`
  - Açıklama: Tek bir kursun detaylı tanıtım sayfası.

- **Kayıt Ol** (`/register`)
  - Konum: `src/pages/Register.tsx`
  - Açıklama: Yeni kullanıcı üyelik sayfası.

- **Giriş Yap** (`/login`)
  - Konum: `src/pages/Login.tsx`
  - Açıklama: Kullanıcı giriş sayfası.

- **Profil** (`/profile`)
  - Konum: `src/pages/Profile.tsx`
  - Açıklama: Kullanıcı profili ve ayarlarının yapıldığı sayfa.

- **Ödeme** (`/payment/:courseId`)
  - Konum: `src/pages/Payment.tsx`
  - Açıklama: Kurs satın alma işleminin yapıldığı ödeme sayfası.

- **İletişim** (`/contact`)
  - Konum: `src/pages/Contact.tsx`
  - Açıklama: İletişim formu ve bilgileri.

- **Şifremi Unuttum** (`/forgot-password`)
  - Konum: `src/pages/ForgotPassword.tsx`
  - Açıklama: Şifre sıfırlama bağlantısı talep edilen sayfa.

- **Şifre Sıfırlama** (`/reset-password`)
  - Konum: `src/pages/ResetPassword.tsx`
  - Açıklama: Kullanıcıların yeni şifre belirlediği sayfa.

## 2. Yönetici Paneli (Admin Routes)
Sadece yetkili yöneticilerin (admin) erişebildiği korumalı alandır. Tüm admin rotaları `AdminRoute` ile korunur ve `AdminLayout` altında iç içe tanımlanır.

- **Admin Giriş** (`/admin/login`)
  - Konum: `src/pages/admin/AdminLogin.tsx`
  - Açıklama: Yönetim paneline özel giriş kapısı.

- **Gösterge Paneli** (`/admin`)
  - Konum: `src/pages/AdminDashboard.tsx`
  - Açıklama: İstatistikler ve genel özet ekranı.

- **Duyuru Yönetimi** (`/admin/announcements`)
  - Konum: `src/pages/admin/AnnouncementManager.tsx`
  - Açıklama: Duyuru oluşturma, güncelleme ve silme işlemleri.

- **Kullanıcı Yönetimi** (`/admin/users`)
  - Konum: `src/pages/admin/UserManager.tsx`
  - Açıklama: Kullanıcıları listeleme ve yönetme sayfası.

- **Mesajlar** (`/admin/messages`)
  - Konum: `src/pages/admin/AdminMessages.tsx`
  - Açıklama: Gelen iletişim mesajlarını görüntüleme.

- **Kurs Yönetimi** (`/admin/courses`)
  - Konum: `src/pages/admin/AdminCourses.tsx`
  - Açıklama: Kursları admin tarafından yönetme ekranı.

- **Ayarlar** (`/admin/settings`)
  - Konum: `src/pages/admin/AdminSettings.tsx`
  - Açıklama: Site ve yönetici ayarlarının yapılandırıldığı sayfa.

## 3. Eğitmen Paneli (Instructor Routes)
Eğitmen rolüne sahip kullanıcıların erişebildiği alandır. Bu rotalar `InstructorRoute` ile korunur.

- **Eğitmen Paneli** (`/instructor`)
  - Konum: `src/pages/instructor/InstructorDashboard.tsx`
  - Açıklama: Eğitmenlere özel içerik yönetim veya istatistik sayfası.

- **Eğitmen Paneli (Türkçe klavye varyantı)** (`/ınstructor`)
  - Konum: `src/pages/instructor/InstructorDashboard.tsx`
  - Açıklama: Türkçe klavyede yazım hatalarına karşı eklenmiş alternatif rota.

---
*Not: Bu yapı `src/App.tsx` dosyasındaki React Router tanımlarına dayanmaktadır.*
