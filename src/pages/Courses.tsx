import { Star, Clock, Tag, Plus, Search } from "lucide-react";
import PageWrapper from "../components/PageWrapper";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { courses as staticCourses } from "../data/courses"; // Fallback/Initial specific logic if needed

interface Course {
  id: string;
  title: string;
  image: string;
  slug?: string;
  rating: number;
  price: number;
  duration: string;
  instructor: string;
  description: string;
}

export default function Courses() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        if (response.data.status === "success") {
          const apiCourses = response.data.data.courses.map((c: any) => {
            // Görsel URL'ini düzelt (path ise tam URL'ye çevir)
            let imageUrl =
              c.image ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop";
            if (
              imageUrl &&
              !imageUrl.startsWith("http") &&
              imageUrl.startsWith("/")
            ) {
              imageUrl = `http://localhost:5000${imageUrl}`;
            }
            return {
              id: String(c.id),
              title: c.title,
              slug: c.slug,
              image: imageUrl,
              rating: c.rating || c.ratingsAverage || 0,
              price: c.price,
              duration: c.duration
                ? c.duration.toString().includes("saat")
                  ? c.duration
                  : `${c.duration} saat`
                : "N/A",
              instructor: c.instructor?.username || "Eğitmen",
              description: c.description,
              reviewCount: c.reviewCount || 0,
            };
          });
          setCourses(apiCourses);
        } else {
          setCourses(staticCourses); // Fallback to static if API format unexpected? Or empty.
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        // Fallback to static courses if API fails (e.g. valid strategy for demo smoothness)
        setCourses(staticCourses);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleRegisterClick = (course: any) => {
    if (!user) {
      navigate("/login", {
        state: {
          from: { pathname: `/payment/${course.id}` },
          courseTitle: course.title,
        },
      });
    } else {
      navigate(`/payment/${course.id}`);
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="px-2 sm:px-4 md:px-8 lg:px-12 w-full">
        <div className="text-center mb-12 relative">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
            Tüm Kurslarımız
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Kapsamlı kurs koleksiyonumuzla kariyerinizi geliştirin
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all duration-200"
              placeholder="Kurs ara (örn: Python, React)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {user?.role === "instructor" && (
            <button
              onClick={() => navigate("/instructor")}
              className="absolute right-0 top-0 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Yeni Kurs Ekle
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Kurslar yükleniyor...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Sonuç Bulunamadı
            </h3>
            <p className="mt-2 text-gray-500">
              "{searchTerm}" araması için herhangi bir kurs bulunamadı.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-blue-600 hover:text-blue-500 font-medium"
            >
              Aramayı Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {course.title}
                  </h3>
                  {course.slug && (
                    <div className="text-sm text-gray-500 mb-2 font-mono">
                      {course.slug}
                    </div>
                  )}
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium text-gray-700">
                        Eğitmen:
                      </span>
                      <span className="ml-1">{course.instructor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold text-gray-900">
                          {course.rating || 0}
                        </span>
                        {(course.reviewCount || 0) > 0 && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({course.reviewCount})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-blue-600" />
                        <span className="ml-1 font-bold text-blue-600">
                          ₺{course.price}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegisterClick(course);
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      Satın Al
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
