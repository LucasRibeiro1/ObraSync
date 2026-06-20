import { useState } from 'react';
import {
  Card, Table, Button, Tag, Space, Typography, Modal, Form, Input,
  Select, Switch, Avatar, Tooltip, Popconfirm, Row, Col, Statistic,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useUsersStore } from '../store';
import type { User, UserRole } from '../types';

const { Title, Text } = Typography;

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  engenheiro: 'Engenheiro',
  encarregado: 'Encarregado',
  tecnico_seguranca: 'Técnico de Segurança',
  consulta: 'Consulta',
};

const roleColors: Record<UserRole, string> = {
  admin: 'red',
  engenheiro: 'blue',
  encarregado: 'green',
  tecnico_seguranca: 'orange',
  consulta: 'default',
};

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function Usuarios() {
  const { users, addUser, updateUser, removeUser } = useUsersStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (user: User) => { setEditing(user); form.setFieldsValue(user); setModalOpen(true); };

  const handleSave = () => {
    form.validateFields().then((vals) => {
      if (editing) {
        updateUser(editing.id, vals);
      } else {
        addUser({ id: uid(), criadoEm: new Date().toISOString(), ativo: true, ...vals } as User);
      }
      setModalOpen(false);
    });
  };

  const ativos = users.filter((u) => u.ativo).length;
  const admins = users.filter((u) => u.role === 'admin').length;

  const columns = [
    {
      title: 'Usuário', key: 'usuario',
      render: (_: unknown, r: User) => (
        <Space>
          <Avatar style={{ backgroundColor: roleColors[r.role] === 'default' ? '#8c8c8c' : undefined, background: `var(--ant-color-${roleColors[r.role]})` }}>
            {r.nome.charAt(0)}
          </Avatar>
          <div>
            <Text strong style={{ display: 'block' }}>{r.nome}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Perfil', dataIndex: 'role', key: 'role',
      render: (v: UserRole) => <Tag color={roleColors[v]}>{roleLabels[v]}</Tag>,
    },
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa' },
    {
      title: 'Status', dataIndex: 'ativo', key: 'ativo',
      render: (v: boolean, r: User) => (
        <Switch size="small" checked={v} onChange={(checked) => updateUser(r.id, { ativo: checked })} />
      ),
    },
    {
      title: 'Ações', key: 'actions', width: 100,
      render: (_: unknown, r: User) => (
        <Space>
          <Tooltip title="Editar"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Tooltip title="Remover">
            <Popconfirm title="Remover usuário?" onConfirm={() => removeUser(r.id)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}><TeamOutlined /> Gerenciamento de Usuários</Title>
          <Text type="secondary">Controle de acesso e permissões do sistema</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Novo Usuário</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card bordered={false} style={{ borderRadius: 12 }}><Statistic title="Total de Usuários" value={users.length} prefix={<UserOutlined />} /></Card></Col>
        <Col span={6}><Card bordered={false} style={{ borderRadius: 12 }}><Statistic title="Usuários Ativos" value={ativos} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card bordered={false} style={{ borderRadius: 12 }}><Statistic title="Administradores" value={admins} valueStyle={{ color: '#f5222d' }} /></Card></Col>
        <Col span={6}><Card bordered={false} style={{ borderRadius: 12 }}><Statistic title="Inativos" value={users.length - ativos} valueStyle={{ color: '#8c8c8c' }} /></Card></Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table dataSource={users.map((u) => ({ ...u, key: u.id }))} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editing ? 'Editar Usuário' : 'Novo Usuário'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={520}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="nome" label="Nome Completo" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="E-mail" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="empresa" label="Empresa"><Input /></Form.Item>
          <Form.Item name="role" label="Perfil de Acesso" rules={[{ required: true }]}>
            <Select>
              {(Object.entries(roleLabels) as [UserRole, string][]).map(([value, label]) => (
                <Select.Option key={value} value={value}><Tag color={roleColors[value]}>{label}</Tag></Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="ativo" label="Usuário Ativo" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
