import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Simulacao from './pages/Simulacao';
import MapaSolar from './pages/MapaSolar';
import Orcamento from './pages/Orcamento';
import KitsSolares from './pages/KitsSolares';
import Financiamento from './pages/Financiamento';
import CalculoArea from './pages/CalculoArea';
import PosicaoSolar from './pages/PosicaoSolar';
import OrcamentoRegional from './pages/OrcamentoRegional';
import Sessoes from './pages/Sessoes';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/simulacao" element={<Simulacao />} />
                <Route path="/mapa" element={<MapaSolar />} />
                <Route path="/orcamento" element={<Orcamento />} />
                <Route path="/kits" element={<KitsSolares />} />
                <Route path="/financiamento" element={<Financiamento />} />
                <Route path="/calculo-area" element={<CalculoArea />} />
                <Route path="/posicao-solar" element={<PosicaoSolar />} />
                <Route path="/orcamento-regional" element={<OrcamentoRegional />} />
                <Route path="/sessoes" element={<Sessoes />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
