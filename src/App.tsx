import { ConfigProvider, theme as antTheme, App as AntApp } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ptBR from 'antd/locale/pt_BR';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import DiarioList from './pages/DiarioList';
import DiarioForm from './pages/DiarioForm';
import DiarioView from './pages/DiarioView';
import SegurancaDashboard from './pages/SegurancaDashboard';
import AcidenteForm from './pages/AcidenteForm';
import IncidenteForm from './pages/IncidenteForm';
import AcaoForm from './pages/AcaoForm';
import RelatoForm from './pages/RelatoForm';
import Usuarios from './pages/Usuarios';
import Obras from './pages/Obras';

const queryClient = new QueryClient();

export default function App() {
  const isDarkMode = useAuthStore((s) => s.isDarkMode);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={ptBR}
        theme={{
          algorithm: isDarkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#1a56db',
            borderRadius: 8,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          },
        }}
      >
        <AntApp>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="obras" element={<Obras />} />
                <Route path="diario" element={<DiarioList />} />
                <Route path="diario/novo" element={<DiarioForm />} />
                <Route path="diario/:id" element={<DiarioView />} />
                <Route path="diario/:id/editar" element={<DiarioForm />} />
                <Route path="seguranca" element={<SegurancaDashboard />} />
                <Route path="seguranca/acidente/novo" element={<AcidenteForm />} />
                <Route path="seguranca/acidente/:id/editar" element={<AcidenteForm />} />
                <Route path="seguranca/incidente/novo" element={<IncidenteForm />} />
                <Route path="seguranca/incidente/:id/editar" element={<IncidenteForm />} />
                <Route path="seguranca/acao/novo" element={<AcaoForm />} />
                <Route path="seguranca/acao/:id/editar" element={<AcaoForm />} />
                <Route path="seguranca/relato/novo" element={<RelatoForm />} />
                <Route path="seguranca/relato/:id/editar" element={<RelatoForm />} />
                <Route path="usuarios" element={<Usuarios />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
