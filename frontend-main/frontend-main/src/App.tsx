import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css'
import { ToastProvider } from '@/contexts/ToastProvider';
import MainLayout from '@/layouts/MainLayout';
import { LiveFeedWatchlistProvider } from "@/contexts/LiveFeedWatchlistContext";
import Overview from '@/pages/overview';
import Login from '@/pages/login';
import { AuthDataProvider } from './contexts/AuthProvider';
import IHR from '@/pages/ihr';
import StarData from './pages/stardata';
import Readiness from './pages/readiness';
import CHWDistribution from './pages/chw';
import AlertsManagement from './pages/alerts';
import AlertSignalPage from '@/pages/alerts-signals';
import { NewsProvider } from './contexts/NewsProvider';

function App() {
  return (
    <AuthDataProvider>
      <ToastProvider>
        <NewsProvider>
          <LiveFeedWatchlistProvider>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/' element={<MainLayout />}>
                <Route index element={<Overview />} />
                <Route path="chw" element={<CHWDistribution />} />
                <Route path="ihr" element={<IHR />} />
                <Route path="readiness" element={<Readiness />} />
                <Route path="star_tracker" element={<StarData />} />
                <Route path="alerts" element={<AlertsManagement />} />
                <Route path="alerts-signals" element={<AlertSignalPage />} />
                <Route path="reports" element={<h1>Reports</h1>} />
              </Route>
            </Routes>
          </LiveFeedWatchlistProvider>
        </NewsProvider>
      </ToastProvider>
    </AuthDataProvider>
  )
}

export default App
