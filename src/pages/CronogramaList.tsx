import { Card, Table, Button, Tag, Space, Typography, Row, Col, Statistic, Progress, Popconfirm } from 'antd';
import {
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCronogramaStore } from '../store';
import type { CronogramaObra, StatusCronograma } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusLabel: Record<StatusCronograma, string> = {
  rascunho: 'Rascunho',
  ativo: 'Em Andamento',
  concluido: 'Concluído',
  paralisado: 'Paralisado',
};

const statusColor: Record<StatusCronograma, string> = {
  rascunho: 'default',
  ativo: 'blue',
  concluido: 'success',
  paralisado: 'warning',
};

function calcProgress(c: CronogramaObra) {
  if (!c.processos.length) return 0;
  const total = c.processos.reduce((sum, p) => sum + p.percentualConcluido, 0);
  return Math.round(total / c.processos.length);
}

function calcOrcamentoExecutado(c: CronogramaObra) {
  return c.processos.reduce((sum, p) => {
    const o = p.orcamento;
    return sum + o.maoDeObraExecutada + o.materiaisExecutado + o.equipamentosExecutado + o.outrosExecutado;
  }, 0);
}

export default function CronogramaList() {
  const navigate = useNavigate();
  const { cronogramas, removeCronograma } = useCronogramaStore();

  const ativos = cronogramas.filter((c) => c.status === 'ativo').length;
  const concluidos = cronogramas.filter((c) => c.status === 'concluido').length;
  const comAtraso = cronogramas.filter((c) =>
    c.processos.some((p) => p.status === 'atrasado')
  ).length;

  const columns = [
    {
      title: 'Cronograma', key: 'nome',
      render: (_: unknown, r: CronogramaObra) => (
        <div>
          <Text strong style={{ display: 'block' }}>{r.obraNome}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.descricao?.slice(0, 60)}{r.descricao && r.descricao.length > 60 ? '…' : ''}</Text>
        </div>
      ),
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 130,
      responsive: ['sm'] as ('sm')[],
      render: (v: StatusCronograma) => <Tag color={statusColor[v]}>{statusLabel[v]}</Tag>,
    },
    {
      title: 'Período', key: 'periodo', width: 200,
      responsive: ['md'] as ('md')[],
      render: (_: unknown, r: CronogramaObra) => (
        <Text style={{ fontSize: 12 }}>
          {dayjs(r.dataInicioProgramada).format('DD/MM/YYYY')} → {dayjs(r.dataFimProgramada).format('DD/MM/YYYY')}
        </Text>
      ),
    },
    {
      title: 'Progresso', key: 'progresso', width: 160,
      responsive: ['sm'] as ('sm')[],
      render: (_: unknown, r: CronogramaObra) => {
        const pct = calcProgress(r);
        return (
          <div style={{ minWidth: 120 }}>
            <Progress percent={pct} size="small" strokeColor={pct === 100 ? '#52c41a' : '#1a56db'} />
          </div>
        );
      },
    },
    {
      title: 'Processos', key: 'processos', width: 100,
      responsive: ['md'] as ('md')[],
      render: (_: unknown, r: CronogramaObra) => {
        const conc = r.processos.filter((p) => p.status === 'concluido').length;
        return <Text>{conc}/{r.processos.length}</Text>;
      },
    },
    {
      title: 'Responsável', dataIndex: 'responsavelGeral', key: 'resp', width: 150,
      responsive: ['lg'] as ('lg')[],
      ellipsis: true,
    },
    {
      title: 'Ações', key: 'actions', width: 110,
      render: (_: unknown, r: CronogramaObra) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/cronograma/${r.id}`)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/cronograma/${r.id}/editar`)} />
          <Popconfirm title="Remover cronograma?" onConfirm={() => removeCronograma(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}><CalendarOutlined /> Cronograma de Obras</Title>
          <Text type="secondary">Acompanhamento de processos, prazos e orçamentos</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cronograma/novo')}>
          Novo Cronograma
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Total" value={cronogramas.length} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Em Andamento" value={ativos} valueStyle={{ color: '#1a56db' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Concluídos" value={concluidos} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Com Atraso" value={comAtraso} valueStyle={{ color: '#f5222d' }} prefix={<WarningOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          dataSource={cronogramas.map((c) => ({ ...c, key: c.id }))}
          columns={columns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          expandable={{
            expandedRowRender: (r: CronogramaObra) => {
              const exec = calcOrcamentoExecutado(r);
              const pct = r.orcamentoTotal > 0 ? Math.round((exec / r.orcamentoTotal) * 100) : 0;
              return (
                <Row gutter={16} style={{ padding: '8px 0' }}>
                  <Col xs={24} sm={8}>
                    <Text type="secondary">Orçamento total:</Text>
                    <br />
                    <Text strong>R$ {r.orcamentoTotal.toLocaleString('pt-BR')}</Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text type="secondary">Executado:</Text>
                    <br />
                    <Text strong style={{ color: exec > r.orcamentoTotal ? '#f5222d' : '#52c41a' }}>
                      R$ {exec.toLocaleString('pt-BR')} ({pct}%)
                    </Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text type="secondary">Responsável geral:</Text>
                    <br />
                    <Text strong>{r.responsavelGeral}</Text>
                  </Col>
                </Row>
              );
            },
          }}
        />
      </Card>
    </div>
  );
}
