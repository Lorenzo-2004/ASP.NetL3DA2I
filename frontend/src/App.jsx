import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/admin/Dashboard';
import LoginAdmin from './pages/auth/LoginAdmin';

import GestionEtudiants from './pages/admin/GestionEtudiants';
import GestionProfesseurs from './pages/admin/GestionProfesseurs';
import GestionMentions from './pages/admin/GestionMentions';
import GestionNiveaux from './pages/admin/GestionNiveaux';
import GestionCours from './pages/admin/GestionCours';
import GestionSalles from './pages/admin/GestionSalle';

export default function App() {
  return (
    <Routes>
      {/* 🚀 MODIFICATION : Redirection de "/" vers "/login" */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Pages d'authentification */}
      <Route path="/login" element={<Login />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/register" element={<Register />} />

      {/* Routes connectées (héritent de MainLayout) */}
      <Route path="/admin" element={<MainLayout />}>
        {/* On peut garder une redirection interne ici si besoin */}
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mentions" element={<GestionMentions />} />
        <Route path="niveaux" element={<GestionNiveaux/>} />
        <Route path="cours" element={<GestionCours />}/>
        <Route path="etudiants" element={<GestionEtudiants />} />
        <Route path="professeurs" element={<GestionProfesseurs />} />
        <Route path="salles" element={<GestionSalles />} />
      </Route>

      {/* Redirection automatique vers login si la route n'existe pas */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}