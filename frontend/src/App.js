import React from 'react'
import './App.css'
import './root.css'

// Layouts
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import DashboardLayout from './components/DashboardLayout/DashboardLayout.jsx'

// Páginas públicas
import MainContent from './components/MainContent/MainContent'
import Services from './components/Services/Services'
import Contact from './components/Contact/Contact'
import AboutUs from './components/AboutUs/AboutUs'
import TermsAndConditions from './components/TermsAndConditions/TermsAndConditions'
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy'
import FormSubmissionStatus from './components/FormSubmissionStatus/FormSubmissionStatus.jsx'
import Login from './components/Login/Login.jsx'
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
  Route,
  Routes,
  useLocation
} from 'react-router-dom'

function AppContent() {
  const location = useLocation()
  useGtagPageView()

  return (
    <div className="App">
      <Navbar />
      <main>
        <NotificationProvider>
          <Routes>
            {/* 🌐 Rutas públicas */}
            <Route path="/" element={<MainContent />} />
            <Route path="/nosotros" element={<AboutUs />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/reparacion-electrodomesticos" element={<Services />} />
            <Route path="/confirmacion" element={<FormSubmissionStatus />} />
            <Route path="/terminos-condiciones" element={<TermsAndConditions />} />
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/manager" element={<Login />} />
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
                  <DashboardLayout><Perfil /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cotizaciones"
              element={
                <ProtectedRoute>
                  <DashboardLayout><Cotizaciones /></DashboardLayout>
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
                  <DashboardLayout><Clients /></DashboardLayout>
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
                  <DashboardLayout><Servicios /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios/nuevo"
              element={
                <ProtectedRoute>
                  <DashboardLayout><NuevoServicio /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios/:code/editar"
              element={
                <ProtectedRoute>
                  <DashboardLayout><EditarServicio /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios/:code"
              element={
                <ProtectedRoute>
                  <DashboardLayout><ServiceDetail /></DashboardLayout>
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
                  <DashboardLayout><Estadisticas /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/whatsapp"
              element={
                <ProtectedRoute>
                  <DashboardLayout><WhatsAppDashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* ❌ No encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </main>

      {location.pathname !== '/reparacion-electrodomesticos' && <Footer />}
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
