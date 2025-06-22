import { useFormik } from "formik";
import * as Yup from "yup";
import { courses } from "../data/courses";
import { User, Mail, BookOpen, ArrowRight } from "lucide-react";

export default function Register() {
  const formik = useFormik({
    initialValues: { 
      name: "", 
      email: "", 
      course: "",
      phone: ""
    },
    validationSchema: Yup.object({
      name: Yup.string().required("İsim zorunludur"),
      email: Yup.string().email("Geçersiz email adresi").required("Email zorunludur"),
      course: Yup.string().required("Kurs seçimi zorunludur"),
      phone: Yup.string().required("Telefon numarası zorunludur"),
    }),
    onSubmit: (values) => {
      alert(`Kayıt başarılı! \n${JSON.stringify(values, null, 2)}`);
    },
  });

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">
            Kursa Kayıt Ol
          </h2>
          <p className="text-gray-600">
            Eğitim yolculuğunuza başlamak için bilgilerinizi girin
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="inline h-4 w-4 mr-2" />
              Kurs Seçimi
            </label>
            <select
              name="course"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.course}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Kurs seçiniz</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            {formik.touched.course && formik.errors.course && (
              <div className="text-red-600 text-sm mt-1 flex items-center">
                {formik.errors.course}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-200 flex items-center justify-center group"
          >
            Kayıt Ol
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </form>
      </div>
    </div>
  );
}
