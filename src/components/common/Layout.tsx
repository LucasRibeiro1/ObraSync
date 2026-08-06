import { useState } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Badge, Space, Typography, Switch, Drawer, Grid } from 'antd';
import {
  DashboardOutlined, BookOutlined, SafetyOutlined, UserOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, SettingOutlined,
  BulbOutlined, BankOutlined, BellOutlined, BuildOutlined, CalendarOutlined,
  FileTextOutlined, SolutionOutlined, DollarOutlined,
  DatabaseOutlined, ToolOutlined, WalletOutlined, FileProtectOutlined, ControlOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import type { UserRole } from '../../types';

const { Sider, Header, Content } = AntLayout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  engenheiro: 'Engenheiro',
  encarregado: 'Encarregado',
  tecnico_seguranca: 'Técnico de Segurança',
  consulta: 'Consulta',
};

const roleColors: Record<UserRole, string> = {
  admin: '#f50',
  engenheiro: '#1a56db',
  encarregado: '#52c41a',
  tecnico_seguranca: '#faad14',
  consulta: '#8c8c8c',
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isDarkMode, toggleTheme } = useAuthStore();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    {
      key: 'mod-cadastros',
      icon: <DatabaseOutlined />,
      label: 'Cadastros',
      children: [
        { key: '/obras', icon: <BuildOutlined />, label: 'Obras' },
      ],
    },
    {
      key: 'mod-gestao-obras',
      icon: <ToolOutlined />,
      label: 'Gestão de Obras',
      children: [
        { key: '/cronograma', icon: <CalendarOutlined />, label: 'Cronograma' },
        { key: '/diario', icon: <BookOutlined />, label: 'Diário de Obra' },
        { key: '/seguranca', icon: <SafetyOutlined />, label: 'Segurança do Trabalho' },
      ],
    },
    {
      key: 'mod-financeiro',
      icon: <WalletOutlined />,
      label: 'Gestão Financeira',
      children: [
        { key: '/notas', icon: <FileTextOutlined />, label: 'Notas Fiscais' },
        { key: '/financeiro', icon: <DollarOutlined />, label: 'Financeiro', disabled: true },
      ],
    },
    {
      key: 'mod-contratos',
      icon: <FileProtectOutlined />,
      label: 'Gestão de Contratos',
      children: [
        { key: '/contratos', icon: <SolutionOutlined />, label: 'Contratos', disabled: true },
      ],
    },
    ...(currentUser?.role === 'admin'
      ? [{
          key: 'mod-admin',
          icon: <ControlOutlined />,
          label: 'Administração',
          children: [
            { key: '/usuarios', icon: <UserOutlined />, label: 'Usuários' },
          ],
        }]
      : []),
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/diario')) return '/diario';
    if (path.startsWith('/cronograma')) return '/cronograma';
    if (path.startsWith('/notas')) return '/notas';
    if (path.startsWith('/seguranca')) return '/seguranca';
    if (path.startsWith('/obras')) return '/obras';
    if (path.startsWith('/usuarios')) return '/usuarios';
    if (path.startsWith('/contratos')) return '/contratos';
    if (path.startsWith('/financeiro')) return '/financeiro';
    return path;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
      if (isMobile) setDrawerOpen(false);
    }
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Meu Perfil' },
      { key: 'settings', icon: <SettingOutlined />, label: 'Configurações' },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Sair', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') navigate('/');
    },
  };

  const siderBg = isDarkMode ? '#141414' : '#001529';

  const siderContent = (
    <>
      <div style={{
        padding: collapsed && !isMobile ? '16px 8px' : '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 8,
        transition: 'all 0.2s',
      }}>
        <BankOutlined style={{ fontSize: 24, color: '#1a56db', flexShrink: 0 }} />
        {(!collapsed || isMobile) && (
          <div>
            <Text strong style={{ color: '#fff', fontSize: 16, display: 'block', lineHeight: 1.2 }}>
              ObraSync
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              Gestão de Obras
            </Text>
          </div>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        defaultOpenKeys={['mod-cadastros', 'mod-gestao-obras', 'mod-financeiro', 'mod-contratos', 'mod-admin']}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ background: 'transparent', border: 'none' }}
      />
    </>
  );

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={240}
          style={{
            background: siderBg,
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            overflow: 'auto',
          }}
        >
          {siderContent}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={240}
          styles={{
            body: { padding: 0, background: siderBg, overflowX: 'hidden' },
            header: { display: 'none' },
            mask: { background: 'rgba(0,0,0,0.45)' },
          }}
        >
          {siderContent}
        </Drawer>
      )}

      <AntLayout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 240), transition: 'margin-left 0.2s' }}>
        <Header style={{
          padding: '0 16px',
          background: isDarkMode ? '#1f1f1f' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 64,
        }}>
          <Button
            type="text"
            icon={isMobile
              ? <MenuUnfoldOutlined />
              : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setDrawerOpen(!drawerOpen) : setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          <Space size="middle">
            <Switch
              checkedChildren={<BulbOutlined />}
              unCheckedChildren={<BulbOutlined />}
              checked={isDarkMode}
              onChange={toggleTheme}
              size="small"
            />
            <Badge count={2} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>
            <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  style={{ backgroundColor: roleColors[currentUser?.role ?? 'consulta'] }}
                  size={34}
                >
                  {currentUser?.nome?.charAt(0) ?? 'U'}
                </Avatar>
                {!isMobile && (
                  <div style={{ lineHeight: 1.3 }}>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>
                      {currentUser?.nome ?? 'Usuário'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {roleLabels[currentUser?.role ?? 'consulta']}
                    </Text>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          margin: isMobile ? '16px 12px' : '24px',
          minHeight: 'calc(100vh - 112px)',
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
