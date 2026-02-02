import { useFormik } from "formik";
import * as Yup from "yup";
import { courses } from "../data/courses";
import { User, Mail, BookOpen, ArrowRight, Lock, Phone, GraduationCap } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInstructor, setIsInstructor] = useState(false);
  const courseTitle = location.state?.courseTitle;

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      course: "",
      phone: ""
    },
    validationSchema: Yup.object({
      name: Yup.string().required("İsim zorunludur"),
      email: Yup.string().email("Geçersiz email adresi").required("Email zorunludur"),
      password: Yup.string().min(6, "Şifre en az 6 karakter olmalıdır").required("Şifre zorunludur"),
      // Course is no longer required during registration
      course: Yup.string().notRequired(),
      phone: Yup.string().required("Telefon numarası zorunludur"),
    }),
    onSubmit: async (values) => {
      try {
        // Register user
        const response = await fetch('/api/v1/users/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: values.name,
            email: values.email,
            password: values.password,
            passwordConfirm: values.password,
            role: isInstructor ? 'instructor' : 'student', // Set role based on checkbox
            // If student, we might want to enroll them in the course immediately or later.
            // For now, we just register the user. Enrollment logic might be separate.
          }),
        });

        const data = await response.json();

        if (data.status === 'success') {
          alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
          navigate('/login', { state: location.state });
        } else {
          alert(data.message || "Kayıt başarısız.");
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert("Bir hata oluştu.");
      }
    },
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">
            {isInstructor ? "Eğitmen Kaydı" : "Kayıt Ol"}
          </h2>
          <p className="text-gray-600">
            {isInstructor
              ? "Eğitmen olarak aramıza katılın"
              : "Eğitim yolculuğunuza başlamak için bilgilerinizi girin"}
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-2" />
              Ad Soyad
            </label>
            <input
              name="name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Adınız ve soyadınız"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-600 text-sm mt-1 flex items-center">
                {formik.errors.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-2" />
              E-posta Adresi
            </label>
            <input
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="ornek@email.com"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-600 text-sm mt-1 flex items-center">
                {formik.errors.email}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline h-4 w-4 mr-2" />
              Şifre
            </label>
            <input
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="******"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-600 text-sm mt-1 flex items-center">
                {formik.errors.password}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-2" />
              Telefon Numarası
            </label>
            <input
              name="phone"
              type="tel"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="+90 5XX XXX XX XX"
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-red-600 text-sm mt-1 flex items-center">
                {formik.errors.phone}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="isInstructor"
              checked={isInstructor}
              onChange={(e) => setIsInstructor(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="isInstructor" className="text-sm text-gray-700 font-medium cursor-pointer select-none flex items-center">
              <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
              Eğitmen misiniz?
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-200 flex items-center justify-center group"
          >
            {isInstructor ? "Eğitmen Olarak Kayıt Ol" : "Kayıt Ol"}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Giriş Yap
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
