import React from 'react'
import './App.css'
import './root.css'

// Layouts
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import DashboardLayout from './components/DashboardLayout/DashboardLayout.jsx'
import DemoShowcase from './components/DemoShowcase/DemoShowcase.jsx'

// Páginas públicas
import MainContent from './components/MainContent/MainContent'
import Services from './components/Services/Services'
import Contact from './components/Contact/Contact'
import AboutUs from './components/AboutUs/AboutUs'
import TermsAndConditions from './components/TermsAndConditions/TermsAndConditions'
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy'
import FormSubmissionStatus from './components/FormSubmissionStatus/FormSubmissionStatus.jsx'
import TicketViewer from './components/TicketViewer/TicketViewer.jsx'

// Dashboard y autenticación
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'

// Vistas protegidas
import Dashboard from './components/Dashboard/Dashboard.jsx'
import Cotizaciones from './components/Cotizaciones/Cotizaciones.jsx'
import QuoteDetail from './components/QuoteDetail/QuoteDetail.jsx'
import Perfil from './components/Perfil/Perfil.jsx'
import Clients from './components/Clients/Clients.jsx'
import ClientDetail from './components/ClientDetail/ClientDetail.jsx'
import Servicios from './components/Servicios/Servicios.jsx'
import NuevoServicio from './components/NuevoServicio/NuevoServicio.jsx'
import EditarServicio from './components/EditarServicio/EditarServicio.jsx'
import ServiceDetail from './components/ServiceDetail/ServiceDetail.jsx'
import WorkOrderViewer from './components/WorkOrderViewer/WorkOrderViewer.jsx'
import WhatsAppDashboard from './components/WhatsAppDashboard/WhatsAppDashboard.jsx'
import Estadisticas from './components/Estadisticas/Estadisticas.jsx'
import { NotificationProvider } from './Context/NotificationContext.jsx'

// Otros
import NotFound from './components/NotFound/NotFound.jsx'
import useGtagPageView from './utils/useGtagPageView.js'

import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation
} from 'react-router-dom'

function AppContent() {
  const location = useLocation()
  useGtagPageView()
  const businessRoutes = [
    '/dashboard',
    '/perfil',
    '/cotizaciones',
    '/clientes',
    '/servicios',
    '/orden',
    '/estadisticas',
    '/whatsapp'
  ]
  const isBusinessRoute = businessRoutes.some(path => location.pathname.startsWith(path))

  return (
    <div className={`App ${isBusinessRoute ? 'App--dashboard' : ''}`}>
      {!isBusinessRoute && <Navbar />}
      <main>
        <NotificationProvider>
          <Routes>
            {/* 🌐 Rutas públicas */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/demo-showcase" element={<DemoShowcase />} />
            <Route path="/inicio" element={<MainContent />} />
            <Route path="/nosotros" element={<AboutUs />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/reparacion-electrodomesticos" element={<Services />} />
            <Route path="/confirmacion" element={<FormSubmissionStatus />} />
            <Route path="/terminos-condiciones" element={<TermsAndConditions />} />
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/manager" element={<Navigate to="/dashboard" replace />} />
            <Route path="/ticket/:publicId" element={<TicketViewer />} />

            {/* 🔒 Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout><Dashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cotizaciones"
              element={
                <ProtectedRoute>
                  <Cotizaciones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cotizaciones/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout><QuoteDetail /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout><ClientDetail /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios"
              element={
                <ProtectedRoute>
                  <Servicios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios/nuevo"
              element={
                <ProtectedRoute>
                  <NuevoServicio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios/:code/editar"
              element={
                <ProtectedRoute>
                  <EditarServicio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios/:code"
              element={
                <ProtectedRoute>
                  <ServiceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orden/:publicId"
              element={
                <ProtectedRoute>
                  <DashboardLayout><WorkOrderViewer /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/estadisticas"
              element={
                <ProtectedRoute>
                  <Estadisticas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/whatsapp"
              element={
                <ProtectedRoute>
                  <WhatsAppDashboard />
                </ProtectedRoute>
              }
            />

            {/* ❌ No encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </main>

      {!isBusinessRoute && !['/', '/reparacion-electrodomesticos'].includes(location.pathname) && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
