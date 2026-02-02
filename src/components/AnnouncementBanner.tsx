import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Newspaper,
  X,
} from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  image?: string;
  type: "news" | "announcement";
}

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Default announcements - her zaman gösterilecek
  const defaultAnnouncements: Announcement[] = [
    {
      id: 0,
      title: "EduMini'ye Hoş Geldiniz!",
      content:
        "Platformumuz yenilendi. Yeni kurslarımızı incelemeyi unutmayın.",
      type: "announcement" as const,
      image: undefined,
    },
    {
      id: 1,
      title: "Yeni Kurs: Python ile Veri Bilimi",
      content:
        "Veri dünyasına adım atın! Sıfırdan ileri seviyeye Python ve Veri Bilimi kursumuz yayında.",
      type: "news" as const,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/announcements");
        const data = await res.json();
        if (data.status === "success" && data.data && data.data.announcements) {
          // Backend'den gelen duyuruları işle
          const fetchedAnnouncements = data.data.announcements.map(
            (ann: any) => ({
              id: ann.id,
              title: ann.title || "Duyuru",
              content: ann.content || "",
              type: ann.type || "announcement",
              image: ann.image || undefined,
            })
          );
          if (fetchedAnnouncements.length > 0) {
            setAnnouncements(fetchedAnnouncements);
          }
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
        // Hata durumunda default duyurular kullanılacak
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Backend'den gelen duyurular varsa onları kullan, yoksa default'ları göster
  const displayAnnouncements =
    announcements.length > 0 ? announcements : defaultAnnouncements;

  useEffect(() => {
    if (displayAnnouncements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayAnnouncements.length);
      }, 6000); // Rotate every 6 seconds
      return () => clearInterval(interval);
    }
  }, [displayAnnouncements.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayAnnouncements.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + displayAnnouncements.length) % displayAnnouncements.length
    );
  };

  // Loading durumunda da default duyuruları göster
  const current = displayAnnouncements[currentIndex];

  if (!current) return null;

  const getImageUrl = (img: string) => {
    if (img.startsWith("http")) return img;
    // If image already contains the path (saved from backend logic)
    if (img.startsWith("/")) return `http://localhost:5000${img}`;
    // Fallback for just filenames (legacy or manual data)
    return `http://localhost:5000/img/announcements/${img}`;
  };

  // Modal state handlers
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAnnouncement, setModalAnnouncement] =
    useState<Announcement | null>(null);

  const openModal = (ann: Announcement) => {
    setModalAnnouncement(ann);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAnnouncement(null);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  return (
    <>
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gray-900 shadow-xl mb-8">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out">
          {current.image ? (
            <img
              src={getImageUrl(current.image)}
              alt={current.title}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-indigo-900 opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-12">
          <div
            className="max-w-4xl mx-auto transform transition-all duration-500 ease-out translate-y-0 opacity-100 cursor-pointer"
            onClick={() => openModal(current)}
            role="button"
            aria-label={`Open announcement ${current.title}`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-4">
              {current.type === "news" ? (
                <Newspaper size={16} />
              ) : (
                <Megaphone size={16} />
              )}
              <span className="uppercase tracking-wider">
                {current.type === "news" ? "Haber" : "Duyuru"}
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              {current.title}
            </h2>

            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              {current.content}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        {displayAnnouncements.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all border border-white/10 hover:border-white/30 group"
            >
              <ChevronLeft
                size={32}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all border border-white/10 hover:border-white/30 group"
            >
              <ChevronRight
                size={32}
                className="group-hover:scale-110 transition-transform"
              />
            </button>

            {/* Dots Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
              {displayAnnouncements.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {modalOpen && modalAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
          <div className="relative max-w-4xl w-full mx-4 bg-white rounded shadow-lg overflow-hidden">
            <button
              onClick={closeModal}
              className="absolute right-3 top-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 z-20"
              aria-label="Close announcement"
            >
              <X />
            </button>
            {modalAnnouncement.image ? (
              <img
                src={getImageUrl(modalAnnouncement.image)}
                alt={modalAnnouncement.title}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                No image
              </div>
            )}
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">
                {modalAnnouncement.title}
              </h3>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: modalAnnouncement.content }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementBanner;
