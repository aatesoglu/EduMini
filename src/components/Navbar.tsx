// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Stats from "./Stats";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-xl font-bold hover:text-blue-200 transition-colors duration-200">
          EduMini
        </Link>
        <div className="hidden md:block">
          <Stats />
        </div>
      </div>

      <div className="space-x-4 flex items-center">
        <Link to="/" className="hover:underline">
          Anasayfa
        </Link>
        <Link to="/courses" className="hover:underline">
          Kurslar
        </Link>
        <Link to="/contact" className="hover:underline">
          İletişim
        </Link>

        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin" className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors">
                Admin Panel
              </Link>
            )}
            <Link
              to={user.role === 'admin' ? "/admin" : (user.role === 'instructor' ? "/instructor" : "/profile")}
              className="text-sm hover:underline"
            >
              Merhaba, {user.username}
            </Link>
            <button
              onClick={logout}
              className="hover:underline text-red-200"
            >
              Çıkış
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Giriş
            </Link>
            <Link to="/register" className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors">
              Kayıt
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
