import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import setupCsrf from './setupCsrf';
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Bir Hata Oluştu</h1>
            <p className="mb-4">Uygulamada bir hata oluştu. Lütfen sayfayı yenileyin.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the application
const initApp = async () => {
  try {
    // Setup CSRF protection
    await setupCsrf();
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found');
    }
    
    const root = createRoot(container);
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Fallback rendering in case of initialization error
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center; font-family: Arial, sans-serif;">
          <h1 style="color: #dc2626;">Uygulama Yüklenirken Hata Oluştu</h1>
          <p>${error.message}</p>
          <p>Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
        </div>
      `;
    }
  }
};

// Start the application
initApp();
