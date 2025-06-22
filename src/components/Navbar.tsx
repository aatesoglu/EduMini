// src/components/Navbar.tsx
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50">
    <Link to="/" className="text-xl font-bold hover:text-blue-200 transition-colors duration-200">
      EduMini
    </Link>
    <div className="space-x-4">
      <Link to="/" className="hover:underline">
        Anasayfa
      </Link>
      <Link to="/courses" className="hover:underline">
        Kurslar
      </Link>
      <Link to="/register" className="hover:underline">
        Kayıt
      </Link>
      <Link to="/contact" className="hover:underline">
        İletişim
      </Link>
    </div>
  </nav>
);

export default Navbar;
