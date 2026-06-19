import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { AdminProvider } from './contexts/AdminContext';
import { LandingPage } from './views/Landing/LandingPage';
import { AuthContainer } from './views/Auth/AuthContainer';
import { BookingWizard } from './views/Booking/BookingWizard';
import { ClientPanelContainer } from './views/ClientPanel/ClientPanelContainer';
import { AdminPanelContainer } from './views/AdminPanel/AdminPanelContainer';
import { SaaSRegistration } from './views/SaaS/SaaSRegistration';
import { SaaSCheckout } from './views/SaaS/SaaSCheckout';
import './App.css';

export interface RouteState {
  path: string;
  params: Record<string, string>;
}

function parseLocation(): RouteState {
  const path = window.location.pathname || '/';
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 2 && segments[1] === 'planos') {
    return { path: '/:slug/planos', params: { slug: segments[0] } };
  }
  if (segments.length === 2 && segments[1] === 'checkout') {
    return { path: '/:slug/checkout', params: { slug: segments[0] } };
  }
  if (segments.length === 2 && segments[1] === 'booking') {
    return { path: '/:slug/booking', params: { slug: segments[0] } };
  }
  if (segments.length === 2 && segments[0] === 'agendar') {
    return { path: '/:slug/booking', params: { slug: segments[1] } };
  }
  if (path === '/cadastro' || path === '/register') {
    return { path: '/cadastro', params: {} };
  }
  if (path === '/login') {
    return { path: '/login', params: {} };
  }
  if (path === '/admin-panel') {
    return { path: '/admin-panel', params: {} };
  }
  if (path === '/client-panel') {
    return { path: '/client-panel', params: {} };
  }
  
  return { path: '/', params: {} };
}

function AppContent() {
  const [route, setRoute] = useState<RouteState>(parseLocation());

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setRoute(parseLocation());
    window.scrollTo(0, 0);
  };

  // Backwards compatibility with the existing pages
  const handleLegacyNavigate = (page: string) => {
    if (page === 'landing') navigateTo('/');
    else if (page === 'login') navigateTo('/login');
    else if (page === 'register') navigateTo('/cadastro');
    else if (page === 'client-panel') navigateTo('/client-panel');
    else if (page === 'admin-panel') navigateTo('/admin-panel');
    else if (page === 'booking') {
      const saasUser = localStorage.getItem('saas_user');
      const slug = saasUser ? JSON.parse(saasUser).slug : 'pe-de-anjo';
      navigateTo(`/${slug}/booking`);
    } else {
      navigateTo('/');
    }
  };

  const renderRoute = () => {
    switch (route.path) {
      case '/':
        return <LandingPage onNavigateTo={navigateTo} />;
      case '/cadastro':
        return <SaaSRegistration onNavigateTo={navigateTo} />;
      case '/login':
        return <AuthContainer onNavigate={handleLegacyNavigate} initialMode="login" />;
      case '/:slug/planos':
        return <LandingPage onNavigateTo={navigateTo} scrollToPlans={true} />;
      case '/:slug/checkout':
        return <SaaSCheckout slug={route.params.slug} onNavigateTo={navigateTo} />;
      case '/:slug/booking':
        return <BookingWizard onNavigate={handleLegacyNavigate} />;
      case '/admin-panel':
        return <AdminPanelContainer onNavigate={handleLegacyNavigate} />;
      case '/client-panel':
        return <ClientPanelContainer onNavigate={handleLegacyNavigate} />;
      default:
        return <LandingPage onNavigateTo={navigateTo} />;
    }
  };

  return (
    <div className="app-container">
      {renderRoute()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AdminProvider>
          <AppContent />
        </AdminProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;

