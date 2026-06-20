import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, Space, Progress, Badge } from 'antd';
import {
  BookOutlined, SafetyOutlined, WarningOutlined, CheckCircleOutlined,
  RiseOutlined, BuildOutlined, TeamOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { useDiarioStore, useSegurancaStore, useObrasStore } from '../store';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const COLORS = ['#1a56db', '#52c41a', '#faad14', '#f5222d'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { diarios } = useDiarioStore();
  const { acidentes, incidentes, acoesPreventivas, relatos } = useSegurancaStore();
  const { obras } = useObrasStore();

  const obrasAtivas = obras.filter((o) => o.status === 'ativa').length;

  const monthlyData = [
    { mes: 'Jan', acidentes: 2, incidentes: 5, acoes: 12 },
    { mes: 'Fev', acidentes: 1, incidentes: 3, acoes: 15 },
    { mes: 'Mar', acidentes: 3, incidentes: 7, acoes: 10 },
    { mes: 'Abr', acidentes: 0, incidentes: 4, acoes: 18 },
    { mes: 'Mai', acidentes: 1, incidentes: 2, acoes: 14 },
    { mes: 'Jun', acidentes: 1, incidentes: 1, acoes: 8 },
  ];

  const pieData = [
    { name: 'Acidentes', value: acidentes.length },
    { name: 'Incidentes', value: incidentes.length },
    { name: 'Ações Preventivas', value: acoesPreventivas.length },
    { name: 'Relatos', value: relatos.length },
  ];

  const obraData = obras.map((o) => ({
    nome: o.nome.split(' ').slice(0, 2).join(' '),
    acidentes: acidentes.filter((a) => a.obra === o.nome).length,
    incidentes: incidentes.filter((i) => i.obra === o.nome).length,
  }));

  const recentDiarios = diarios.slice(0, 5).map((d) => ({
    key: d.id,
    obra: d.obra,
    data: dayjs(d.data).format('DD/MM/YYYY'),
    responsavel: d.responsavel,
    atividades: d.atividades.length,
    id: d.id,
  }));

  const diarioColumns = [
    { title: 'Obra', dataIndex: 'obra', key: 'obra', ellipsis: true },
    { title: 'Data', dataIndex: 'data', key: 'data', width: 110 },
    { title: 'Responsável', dataIndex: 'responsavel', key: 'responsavel' },
    {
      title: 'Atividades', dataIndex: 'atividades', key: 'atividades', width: 100,
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '', key: 'action', width: 80,
      render: (_: unknown, r: { id: string }) => (
        <Button size="small" type="link" onClick={() => navigate(`/diario/${r.id}`)}>Ver</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Dashboard Executivo</Title>
          <Text type="secondary">Visão geral — {dayjs().format('DD [de] MMMM [de] YYYY')}</Text>
        </div>
        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => navigate('/diario/novo')}>
            Novo Diário
          </Button>
          <Button icon={<WarningOutlined />} onClick={() => navigate('/seguranca/acidente/novo')}>
            Registrar Acidente
          </Button>
        </Space>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #1a56db 0%, #1a3db5 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Obras Ativas</Text>}
              value={obrasAtivas}
              prefix={<BuildOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 28 }}
              suffix={<Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>/{obras.length}</Text>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Diários Registrados</Text>}
              value={diarios.length}
              prefix={<BookOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Acidentes (mês)</Text>}
              value={acidentes.length}
              prefix={<WarningOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Ações Preventivas</Text>}
              value={acoesPreventivas.length}
              prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={<Space><RiseOutlined /><span>Ocorrências de Segurança — Últimos 6 Meses</span></Space>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="acidentes" stroke="#f5222d" name="Acidentes" strokeWidth={2} dot />
                <Line type="monotone" dataKey="incidentes" stroke="#faad14" name="Incidentes" strokeWidth={2} dot />
                <Line type="monotone" dataKey="acoes" stroke="#52c41a" name="Ações Preventivas" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<Space><SafetyOutlined /><span>Distribuição de Ocorrências</span></Space>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={<Space><BookOutlined /><span>Últimos Diários de Obra</span></Space>}
            bordered={false}
            style={{ borderRadius: 12 }}
            extra={<Button type="link" onClick={() => navigate('/diario')}>Ver todos</Button>}
          >
            <Table
              dataSource={recentDiarios}
              columns={diarioColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<Space><BuildOutlined /><span>Ocorrências por Obra</span></Space>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={obraData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nome" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="acidentes" fill="#f5222d" name="Acidentes" />
                <Bar dataKey="incidentes" fill="#faad14" name="Incidentes" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title={<Space><TeamOutlined /><span>Status das Obras</span></Space>}
            bordered={false}
            style={{ borderRadius: 12, marginTop: 16 }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {obras.map((obra) => (
                <div key={obra.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13 }}>{obra.nome}</Text>
                    <Badge
                      status={obra.status === 'ativa' ? 'processing' : obra.status === 'concluida' ? 'success' : 'warning'}
                      text={obra.status === 'ativa' ? 'Ativa' : obra.status === 'concluida' ? 'Concluída' : 'Paralisada'}
                    />
                  </div>
                  <Progress
                    percent={Math.floor(Math.random() * 40) + 30}
                    size="small"
                    strokeColor={obra.status === 'ativa' ? '#1a56db' : '#52c41a'}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
