import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, Tag } from "lucide-react";
import { courses } from "../data/courses";
import PageWrapper from "../components/PageWrapper";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Kurs bulunamadı
          </h1>
          <button
            onClick={() => navigate("/courses")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kurslara Dön
          </button>
        </div>
      </PageWrapper>
    );
  }

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <PageWrapper>
      <div className="px-2 sm:px-4 md:px-8 lg:px-12 w-full py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/courses")}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Kurslara Dön
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Ana İçerik */}
          <div className="lg:col-span-2">
            {/* Kurs Başlığı ve Görsel */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {course.description}
                </p>

                {/* Kurs Bilgileri */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Star className="h-5 w-5 text-yellow-400 fill-current mr-2" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Tag className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">₺{course.price}</span>
                  </div>
                </div>

                <button
                  onClick={handleRegisterClick}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  Kayıt Ol
                </button>
              </div>
            </div>

            {/* Kurs Detayları */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Kurs Hakkında
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Bu kurs, {course.title} konusunda kapsamlı bir eğitim
                  sunmaktadır.
                  {course.duration} süren bu eğitimde, konunun temellerinden
                  ileri seviyeye kadar tüm detayları öğreneceksiniz.
                </p>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Kurs Özellikleri
                  </h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Kapsamlı içerik ve pratik örnekler</li>
                    <li>• Deneyimli eğitmen desteği</li>
                    <li>• Sertifika alımı</li>
                    <li>• Ömür boyu erişim</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Eğitmen Bilgileri */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Eğitmen
                </h2>

                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {course.instructor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {course.instructor}
                  </h3>
                  <p className="text-gray-600 text-sm">Uzman Eğitmen</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Kurs İstatistikleri
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Süre:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ortalama Puan:</span>
                      <span className="font-medium">{course.rating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fiyat:</span>
                      <span className="font-medium">₺{course.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
