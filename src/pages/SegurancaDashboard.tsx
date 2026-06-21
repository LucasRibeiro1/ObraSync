import {
  Card, Row, Col, Statistic, Typography, Table, Tag, Button, Space,
  Tabs, Badge, Alert, Tooltip, Popconfirm,
} from 'antd';
import {
  WarningOutlined, AlertOutlined, CheckCircleOutlined, MessageOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useSegurancaStore, useObrasStore } from '../store';
import type { AcidenteTrabalho, Incidente, AcaoPreventiva, RelatoSeguranca, GravidadeAcidente } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const COLORS = ['#f5222d', '#faad14', '#52c41a', '#1a56db'];

const gravidadeColor: Record<GravidadeAcidente, string> = {
  leve: 'green', moderada: 'orange', grave: 'red',
};

const tipoAcaoLabel: Record<string, string> = {
  dds: 'DDS', treinamento: 'Treinamento', fiscalizacao: 'Fiscalização',
  inspecao: 'Inspeção', campanha: 'Campanha', outro: 'Outro',
};

export default function SegurancaDashboard() {
  const navigate = useNavigate();
  const { acidentes, incidentes, acoesPreventivas, relatos, removeAcidente, removeIncidente, removeAcaoPreventiva, removeRelato } = useSegurancaStore();
  const { obras } = useObrasStore();

  const obraData = obras.map((o) => ({
    nome: o.nome.split(' ').slice(0, 2).join(' '),
    acidentes: acidentes.filter((a) => a.obra === o.nome).length,
    incidentes: incidentes.filter((i) => i.obra === o.nome).length,
    acoes: acoesPreventivas.filter((a) => a.obra === o.nome).length,
  }));

  const pieData = [
    { name: 'Acidentes', value: acidentes.length },
    { name: 'Incidentes', value: incidentes.length },
    { name: 'Ações Preventivas', value: acoesPreventivas.length },
    { name: 'Relatos', value: relatos.length },
  ];

  const gravData = [
    { name: 'Leve', value: acidentes.filter((a) => a.gravidade === 'leve').length },
    { name: 'Moderada', value: acidentes.filter((a) => a.gravidade === 'moderada').length },
    { name: 'Grave', value: acidentes.filter((a) => a.gravidade === 'grave').length },
  ];

  const acidenteColumns = [
    { title: 'Data', dataIndex: 'data', key: 'data', width: 110, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Obra', dataIndex: 'obra', key: 'obra', ellipsis: true },
    { title: 'Funcionário', dataIndex: 'funcionario', key: 'funcionario' },
    { title: 'Local', dataIndex: 'local', key: 'local', ellipsis: true },
    {
      title: 'Gravidade', dataIndex: 'gravidade', key: 'gravidade', width: 100,
      render: (v: GravidadeAcidente) => <Tag color={gravidadeColor[v]}>{v.charAt(0).toUpperCase() + v.slice(1)}</Tag>,
    },
    { title: 'Afastamento', dataIndex: 'necessidadeAfastamento', key: 'afastamento', width: 100, render: (v: boolean) => <Badge status={v ? 'error' : 'success'} text={v ? 'Sim' : 'Não'} /> },
    {
      title: 'Ações', key: 'actions', width: 100,
      render: (_: unknown, r: AcidenteTrabalho) => (
        <Space>
          <Tooltip title="Editar"><Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/seguranca/acidente/${r.id}/editar`)} /></Tooltip>
          <Popconfirm title="Remover acidente?" onConfirm={() => removeAcidente(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const incidenteColumns = [
    { title: 'Data', dataIndex: 'data', key: 'data', width: 110, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Obra', dataIndex: 'obra', key: 'obra', ellipsis: true },
    { title: 'Local', dataIndex: 'local', key: 'local' },
    { title: 'Descrição', dataIndex: 'descricao', key: 'descricao', ellipsis: true },
    {
      title: 'Ações', key: 'actions', width: 100,
      render: (_: unknown, r: Incidente) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/seguranca/incidente/${r.id}/editar`)} />
          <Popconfirm title="Remover incidente?" onConfirm={() => removeIncidente(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const acaoColumns = [
    { title: 'Data', dataIndex: 'data', key: 'data', width: 110, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Obra', dataIndex: 'obra', key: 'obra', ellipsis: true },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 120, render: (v: string) => <Tag color="green">{tipoAcaoLabel[v] ?? v}</Tag> },
    { title: 'Responsável', dataIndex: 'responsavel', key: 'responsavel' },
    { title: 'Descrição', dataIndex: 'descricao', key: 'descricao', ellipsis: true },
    {
      title: 'Ações', key: 'actions', width: 100,
      render: (_: unknown, r: AcaoPreventiva) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/seguranca/acao/${r.id}/editar`)} />
          <Popconfirm title="Remover?" onConfirm={() => removeAcaoPreventiva(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const relatoColumns = [
    { title: 'Data', dataIndex: 'data', key: 'data', width: 110, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Obra', dataIndex: 'obra', key: 'obra', ellipsis: true },
    { title: 'Funcionário', dataIndex: 'funcionario', key: 'funcionario' },
    { title: 'Relato', dataIndex: 'relato', key: 'relato', ellipsis: true },
    {
      title: 'Ações', key: 'actions', width: 100,
      render: (_: unknown, r: RelatoSeguranca) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/seguranca/relato/${r.id}/editar`)} />
          <Popconfirm title="Remover?" onConfirm={() => removeRelato(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'acidentes',
      label: <Space><WarningOutlined /><span>Acidentes</span><Tag color="red">{acidentes.length}</Tag></Space>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button type="primary" danger icon={<PlusOutlined />} onClick={() => navigate('/seguranca/acidente/novo')}>
              Registrar Acidente
            </Button>
          </div>
          {acidentes.length === 0 ? (
            <Alert message="Nenhum acidente registrado. Mantenha assim!" type="success" showIcon />
          ) : (
            <Table dataSource={acidentes.map((a) => ({ ...a, key: a.id }))} columns={acidenteColumns} pagination={{ pageSize: 8 }} scroll={{ x: 800 }} />
          )}
        </div>
      ),
    },
    {
      key: 'incidentes',
      label: <Space><AlertOutlined /><span>Incidentes</span><Tag color="orange">{incidentes.length}</Tag></Space>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/seguranca/incidente/novo')}>
              Registrar Incidente
            </Button>
          </div>
          {incidentes.length === 0 ? (
            <Alert message="Nenhum incidente registrado." type="info" showIcon />
          ) : (
            <Table dataSource={incidentes.map((i) => ({ ...i, key: i.id }))} columns={incidenteColumns} pagination={{ pageSize: 8 }} scroll={{ x: 700 }} />
          )}
        </div>
      ),
    },
    {
      key: 'acoes',
      label: <Space><CheckCircleOutlined /><span>Ações Preventivas</span><Tag color="green">{acoesPreventivas.length}</Tag></Space>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/seguranca/acao/novo')}>
              Nova Ação Preventiva
            </Button>
          </div>
          <Table dataSource={acoesPreventivas.map((a) => ({ ...a, key: a.id }))} columns={acaoColumns} pagination={{ pageSize: 8 }} scroll={{ x: 750 }} />
        </div>
      ),
    },
    {
      key: 'relatos',
      label: <Space><MessageOutlined /><span>Relatos</span><Tag color="blue">{relatos.length}</Tag></Space>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/seguranca/relato/novo')}>
              Novo Relato
            </Button>
          </div>
          <Table dataSource={relatos.map((r) => ({ ...r, key: r.id }))} columns={relatoColumns} pagination={{ pageSize: 8 }} scroll={{ x: 700 }} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}><SafetyOutlined /> Segurança do Trabalho</Title>
        <Text type="secondary">Gestão de acidentes, incidentes, ações preventivas e relatos</Text>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #f5222d' }}>
            <Statistic title="Acidentes" value={acidentes.length} prefix={<WarningOutlined style={{ color: '#f5222d' }} />} valueStyle={{ color: '#f5222d' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {acidentes.filter((a) => a.necessidadeAfastamento).length} com afastamento
            </Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #faad14' }}>
            <Statistic title="Incidentes" value={incidentes.length} prefix={<AlertOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>Sem vítimas</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
            <Statistic title="Ações Preventivas" value={acoesPreventivas.length} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #1a56db' }}>
            <Statistic title="Relatos de Segurança" value={relatos.length} prefix={<MessageOutlined style={{ color: '#1a56db' }} />} valueStyle={{ color: '#1a56db' }} />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Ocorrências por Obra" bordered={false} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={obraData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nome" width={120} tick={{ fontSize: 12 }} />
                <RTooltip />
                <Legend />
                <Bar dataKey="acidentes" fill="#f5222d" name="Acidentes" />
                <Bar dataKey="incidentes" fill="#faad14" name="Incidentes" />
                <Bar dataKey="acoes" fill="#52c41a" name="Ações" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card title="Distribuição Geral" bordered={false} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ value }) => value}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card title="Acidentes por Gravidade" bordered={false} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={gravData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  <Cell fill="#52c41a" />
                  <Cell fill="#faad14" />
                  <Cell fill="#f5222d" />
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Tabs items={tabItems} type="card" />
      </Card>
    </div>
  );
}
