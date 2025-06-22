export interface Course {
    id: string;
    title: string;
    description: string;
    image: string;
    rating: number;
    price: number;
    duration: string;
    instructor: string;
}

export const courses: Course[] = [
    {
        id: "1",
        title: "React ve TypeScript ile Modern Web Geliştirme",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
        rating: 4.8,
        description: "React ve TypeScript kullanarak modern web uygulamaları geliştirmeyi öğrenin.",
        price: 1299,
        duration: "12 saat",
        instructor: "Ahmet Yılmaz"
    },
    {
        id: "2",
        title: "Python ile Veri Analizi ve Machine Learning",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop",
        rating: 4.9,
        description: "Python ile veri analizi ve makine öğrenmesi tekniklerini keşfedin.",
        price: 1499,
        duration: "15 saat",
        instructor: "Zeynep Kaya"
    },
    {
        id: "3",
        title: "Node.js ile Backend Geliştirme",
        image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=250&fit=crop",
        rating: 4.7,
        description: "Node.js kullanarak backend servisleri oluşturmayı öğrenin.",
        price: 1199,
        duration: "10 saat",
        instructor: "Mehmet Demir"
    },
    {
        id: "4",
        title: "UI/UX Tasarım Temelleri",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
        rating: 4.6,
        description: "Kullanıcı arayüzü ve deneyimi tasarımının temel prensiplerini öğrenin.",
        price: 999,
        duration: "8 saat",
        instructor: "Ayşe Özkan"
    },
    {
        id: "5",
        title: "Mobil Uygulama Geliştirme (React Native)",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
        rating: 4.7,
        description: "React Native ile çapraz platform mobil uygulamalar geliştirin.",
        price: 1399,
        duration: "18 saat",
        instructor: "Can Yıldız"
    },
]; 