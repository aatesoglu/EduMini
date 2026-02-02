import { useFormik } from "formik";
import * as Yup from "yup";
import PageWrapper from "../components/PageWrapper";
import { User, Mail, MessageSquare, Phone, MapPin, Send } from "lucide-react";
import api from "../utils/api";
import { useSettings } from "../context/SettingsContext";

export default function Contact() {
  const { settings } = useSettings();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    },
    validationSchema: Yup.object({
      name: Yup.string().required("İsim zorunludur"),
      email: Yup.string().email("Geçersiz email adresi").required("Email zorunludur"),
      subject: Yup.string().required("Konu zorunludur"),
      message: Yup.string().required("Mesaj zorunludur"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await api.post('/messages', values);
        const data = response.data as any;
        if (data.status === 'success') {
          alert('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
          resetForm();
        }
      } catch (error: any) {
        console.error('Error sending message:', error);
        alert(error.response?.data?.message || 'Mesaj gönderilirken bir hata oluştu.');
      }
    },
  });

  return (
    <PageWrapper>
      <div className="px-2 sm:px-4 md:px-8 lg:px-12 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
            İletişime Geçin
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Sorularınız için bizimle iletişime geçin. En kısa sürede size dönüş yapacağız.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Mesaj Gönderin</h2>
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
                  <div className="text-red-600 text-sm mt-1">
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
                  <div className="text-red-600 text-sm mt-1">
                    {formik.errors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konu
                </label>
                <input
                  name="subject"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.subject}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Mesajınızın konusu"
                />
                {formik.touched.subject && formik.errors.subject && (
                  <div className="text-red-600 text-sm mt-1">
                    {formik.errors.subject}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="inline h-4 w-4 mr-2" />
                  Mesajınız
                </label>
                <textarea
                  name="message"
                  rows={5}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.message}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
                {formik.touched.message && formik.errors.message && (
                  <div className="text-red-600 text-sm mt-1">
                    {formik.errors.message}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-200 flex items-center justify-center group"
              >
                Mesaj Gönder
                <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </form>
          </div>


          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">İletişim Bilgileri</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">E-posta</h3>
                    <p className="text-gray-600">{settings['contact_email'] || 'info@edumini.com'}</p>
                    <p className="text-gray-600">destek@edumini.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Telefon</h3>
                    <p className="text-gray-600">{settings['contact_phone'] || '+90 212 000 00 00'}</p>
                    <p className="text-gray-600">+90 532 000 00 00</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Adres</h3>
                    <p className="text-gray-600">{settings['contact_address'] || 'İstanbul, Şişli'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Sık Sorulan Sorular</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Kurslara nasıl kayıt olabilirim?</h3>
                  <p className="text-gray-600">Kayıt sayfasından formu doldurarak veya bizimle iletişime geçerek kayıt olabilirsiniz.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Ödeme seçenekleri nelerdir?</h3>
                  <p className="text-gray-600">Kredi kartı, banka havalesi ve taksitli ödeme seçeneklerimiz mevcuttur.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Sertifika alabilir miyim?</h3>
                  <p className="text-gray-600">Evet, kursları başarıyla tamamladığınızda dijital sertifika alırsınız.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Online destek mevcut mu?</h3>
                  <p className="text-gray-600">Evet, tüm kurslarımızda online destek ve mentorluk hizmeti sunuyoruz.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
