import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Simulacao from './pages/Simulacao';
import MapaSolar from './pages/MapaSolar';
import Orcamento from './pages/Orcamento';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/simulacao" element={<Simulacao />} />
        <Route path="/mapa" element={<MapaSolar />} />
        <Route path="/orcamento" element={<Orcamento />} />
      </Routes>
    </Layout>
  );
}
