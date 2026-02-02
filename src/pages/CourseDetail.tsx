import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Star, Clock, Tag, MessageSquare, User as UserIcon, Send } from "lucide-react";
import PageWrapper from "../components/PageWrapper";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { courses } from "../data/courses"; // Import static data

interface Review {
  id: number;
  review: string;
  rating: number;
  created_at: string;
  User: {
    username: string;
    email: string;
  };
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Course State
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;

      // 1. Try static data first (optimization)
      const staticCourse = courses.find((c) => String(c.id) === String(id));
      if (staticCourse) {
        setCourse(staticCourse);
        setLoading(false);
        // We still continue to check enrollment
      } else {
        // 2. Fetch from Backend
        try {
          const response = await api.get(`/courses/${id}`);
          if (response.data.status === 'success') {
            const apiCourse = response.data.data.course;
            // Adapt API response to UI model
            // Görsel URL'ini düzelt
            let imageUrl = apiCourse.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop";
            if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
              imageUrl = `http://localhost:5000${imageUrl}`;
            }
            setCourse({
              id: apiCourse.id,
              title: apiCourse.title,
              description: apiCourse.description,
              image: imageUrl,
              rating: apiCourse.rating || apiCourse.ratingsAverage || 0,
              price: apiCourse.price,
              duration: apiCourse.duration ? (apiCourse.duration.toString().includes('saat') ? apiCourse.duration : `${apiCourse.duration} saat`) : 'N/A',
              instructor: apiCourse.instructor?.username || 'Eğitmen',
              reviewCount: apiCourse.reviewCount || 0
            });
          }
        } catch (err) {
          console.error('Error fetching course:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCourseDetails();
  }, [id]);

  useEffect(() => {
    // Check enrollment and fetch reviews (kept dynamic as they depend on user/backend interactions, 
    // but course details are now static as requested)
    const checkEnrollment = async () => {
      if (!user || !id) return;

      try {
        const response = await api.get('/users/me/courses');
        if (response.data.status === 'success') {
          // Note: Backend might use number IDs. 
          const enrolled = response.data.data.courses.some((c: any) => String(c.id) === String(id));
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error('Error checking enrollment:', err);
      }
    };

    const fetchReviews = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/reviews/course/${id}`);
        if (response.data.status === 'success') {
          setReviews(response.data.data.reviews);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    if (id) {
      checkEnrollment();
      fetchReviews();
    }
  }, [user, id]);

  const handleRegisterClick = async () => {
    if (isEnrolled) {
      alert("Ders içerikleri yakında eklenecektir.");
      return;
    }

    if (!user) {
      navigate("/login", {
        state: {
          from: location,
          courseTitle: course?.title
        }
      });
      return;
    }

    // Redirect to payment page instead of direct enrollment
    navigate(`/payment/${id}`);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const response = await api.post('/reviews', {
        review: newReviewText,
        rating: newReviewRating,
        courseId: id
      });

      if (response.data.status === 'success') {
        setReviews([response.data.data.review, ...reviews]);
        setNewReviewText("");
        setNewReviewRating(5);
        // Refresh reviews
        const refreshResponse = await api.get(`/reviews/course/${id}`);
        if (refreshResponse.data.status === 'success') {
          setReviews(refreshResponse.data.data.reviews);
        }
        // Refresh course to get updated rating and review count
        const courseResponse = await api.get(`/courses/${id}`);
        if (courseResponse.data.status === 'success') {
          const apiCourse = courseResponse.data.data.course;
          setCourse((prev: any) => ({
            ...prev,
            rating: apiCourse.rating || apiCourse.ratingsAverage || 0,
            reviewCount: apiCourse.reviewCount || reviews.length + 1
          }));
        }
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(err.response?.data?.message || 'Yorum gönderilirken bir hata oluştu.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageWrapper>
    );
  }

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
                    <span className="font-medium">{course.rating || 0}</span>
                    {(course.reviewCount !== undefined ? course.reviewCount : reviews.length) > 0 && (
                      <span className="ml-1 text-sm text-gray-500">
                        ({course.reviewCount !== undefined ? course.reviewCount : reviews.length} değerlendirme)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Tag className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">₺{course.price}</span>
                  </div>
                </div>

                <button
                  onClick={handleRegisterClick}
                  className={`w-full py-3 rounded-lg transition-colors font-medium text-lg ${isEnrolled
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                  {isEnrolled ? "Derse Başla" : (user ? "Satın Al" : "Giriş Yap ve Katıl")}
                </button>
              </div>
            </div>

            {/* Kurs Detayları */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
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

            {/* Yorumlar Bölümü */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="mr-2" size={24} />
                  Öğrenci Yorumları ({reviews.length})
                </h2>

                {/* Yorum Yapma Formu */}
                {isEnrolled && (
                  <div className="mb-8 bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-3">Yorum Yap</h3>
                    <form onSubmit={handleSubmitReview}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Puanınız</label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                size={24}
                                className={`${star <= newReviewRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yorumunuz</label>
                        <textarea
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Bu kurs hakkındaki düşünceleriniz..."
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                      >
                        {submittingReview ? 'Gönderiliyor...' : (
                          <>
                            <Send size={18} className="mr-2" />
                            Gönder
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Yorum Listesi */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-gray-200 p-2 rounded-full mr-3">
                              <UserIcon size={20} className="text-gray-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{review.User?.username || 'Kullanıcı'}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2 pl-12">{review.review}</p>
                      </div>
                    ))
                  )}
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
                      {course.instructor.split(" ").map((n: string) => n[0]).join("")}
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
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ortalama Puan:</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{course.rating || 0}/5</span>
                        {(course.reviewCount !== undefined ? course.reviewCount : reviews.length) > 0 && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({course.reviewCount !== undefined ? course.reviewCount : reviews.length})
                          </span>
                        )}
                      </div>
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
