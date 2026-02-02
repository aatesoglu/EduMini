const { User } = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        // 1. Admin User
        const adminEmail = 'admin@edumini.com';
        const adminPassword = 'admin123';
        const admin = await User.findOne({ where: { email: adminEmail } });
        if (!admin) {
            await User.create({
                username: 'Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log('✅ Admin user created: admin@edumini.com / admin123');
        } else {
            console.log('ℹ️ Admin user already exists.');
        }

        // 2. Generic Instructor User (Keep for generic login)
        const instructorEmail = 'instructor@edumini.com';
        const instructorPassword = 'instructor123';
        let genericInstructor = await User.findOne({ where: { email: instructorEmail } });
        if (!genericInstructor) {
            genericInstructor = await User.create({
                username: 'Eğitmen',
                email: instructorEmail,
                password: instructorPassword,
                role: 'instructor'
            });
            console.log('✅ Generic Instructor user created: instructor@edumini.com / instructor123');
        } else {
            console.log('ℹ️ Generic Instructor user already exists.');
        }

        // 3. Specific Instructors from Frontend
        const specificInstructorsData = [
            { name: "Ahmet Yılmaz", email: "ahmet@edumini.com" },
            { name: "Zeynep Kaya", email: "zeynep@edumini.com" },
            { name: "Mehmet Demir", email: "mehmet@edumini.com" },
            { name: "Ayşe Özkan", email: "ayse@edumini.com" },
            { name: "Can Yıldız", email: "can@edumini.com" }
        ];

        const instructorMap = {}; // Name -> ID mapping

        for (const info of specificInstructorsData) {
            let instr = await User.findOne({ where: { email: info.email } });
            if (!instr) {
                instr = await User.create({
                    username: info.name,
                    email: info.email,
                    password: 'password123',
                    role: 'instructor'
                });
                console.log(`✅ Specific Instructor created: ${info.name} (${info.email})`);
            }
            instructorMap[info.name] = instr.id;
        }

        // 4. Student User
        const studentEmail = 'student@edumini.com';
        const studentPassword = 'student123';
        const student = await User.findOne({ where: { email: studentEmail } });
        if (!student) {
            await User.create({
                username: 'Öğrenci',
                email: studentEmail,
                password: studentPassword,
                role: 'student'
            });
            console.log('✅ Student user created: student@edumini.com / student123');
        } else {
            console.log('ℹ️ Student user already exists.');
        }

        // 5. Default Announcements
        const { Announcement } = require('../models');
        const announcementCount = await Announcement.count();
        if (announcementCount === 0) {
            await Announcement.bulkCreate([
                {
                    title: "EduMini'ye Hoş Geldiniz!",
                    content: "Platformumuz yenilendi. Yeni kurslarımızı incelemeyi unutmayın.",
                    type: "announcement",
                    active: true
                },
                {
                    title: "Yeni Kurs: Python ile Veri Bilimi",
                    content: "Veri dünyasına adım atın! Sıfırdan ileri seviyeye Python ve Veri Bilimi kursumuz yayında.",
                    type: "news",
                    active: true,
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                }
            ]);
            console.log('✅ Default announcements created.');
        } else {
            console.log('ℹ️ Default announcements already exist.');
        }

        // 6. Seed Courses
        const { Course } = require('../models');
        const courseCount = await Course.count();

        if (courseCount === 0) {
            const courses = [
                {
                    title: "React ve TypeScript ile Modern Web Geliştirme",
                    description: "React ve TypeScript kullanarak modern web uygulamaları geliştirmeyi öğrenin.",
                    price: 1299,
                    duration: 12,
                    category: 'web',
                    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
                    rating: 4.8,
                    isPublished: true,
                    instructorId: instructorMap["Ahmet Yılmaz"] || genericInstructor.id
                },
                {
                    title: "Python ile Veri Analizi ve Machine Learning",
                    description: "Python ile veri analizi ve makine öğrenmesi tekniklerini keşfedin.",
                    price: 1499,
                    duration: 15,
                    category: 'veri-bilimi',
                    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop",
                    rating: 4.9,
                    isPublished: true,
                    instructorId: instructorMap["Zeynep Kaya"] || genericInstructor.id
                },
                {
                    title: "Node.js ile Backend Geliştirme",
                    description: "Node.js kullanarak backend servisleri oluşturmayı öğrenin.",
                    price: 1199,
                    duration: 10,
                    category: 'web',
                    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=250&fit=crop",
                    rating: 4.7,
                    isPublished: true,
                    instructorId: instructorMap["Mehmet Demir"] || genericInstructor.id
                },
                {
                    title: "UI/UX Tasarım Temelleri",
                    description: "Kullanıcı arayüzü ve deneyimi tasarımının temel prensiplerini öğrenin.",
                    price: 999,
                    duration: 8,
                    category: 'diger',
                    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
                    rating: 4.6,
                    isPublished: true,
                    instructorId: instructorMap["Ayşe Özkan"] || genericInstructor.id
                },
                {
                    title: "Mobil Uygulama Geliştirme (React Native)",
                    description: "React Native ile çapraz platform mobil uygulamalar geliştirin.",
                    price: 1399,
                    duration: 18,
                    category: 'mobil',
                    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
                    rating: 4.7,
                    isPublished: true,
                    instructorId: instructorMap["Can Yıldız"] || genericInstructor.id
                }
            ];

            await Course.bulkCreate(courses);
            console.log('✅ Default courses created with specific instructors.');
        } else {
            console.log('ℹ️ Courses already exist.');
        }

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
};

module.exports = seedData;
