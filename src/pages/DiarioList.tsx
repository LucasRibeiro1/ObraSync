import { useState } from 'react';
import { Card, Table, Button, Tag, Space, Typography, Input, Select, DatePicker, Row, Col, Popconfirm, Tooltip } from 'antd';
import {
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  BookOutlined, FilePdfOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDiarioStore, useObrasStore } from '../store';
import type { DiarioObra, CondicaoClimatica, StatusAtividade } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const climaLabel: Record<CondicaoClimatica, string> = {
  ensolarado: '☀️ Ensolarado',
  parcialmente_nublado: '⛅ Parc. Nublado',
  nublado: '☁️ Nublado',
  chuva_leve: '🌦 Chuva Leve',
  chuva_forte: '⛈ Chuva Forte',
  outros: '🌪 Outros',
};

const climaColor: Record<CondicaoClimatica, string> = {
  ensolarado: 'gold',
  parcialmente_nublado: 'cyan',
  nublado: 'default',
  chuva_leve: 'blue',
  chuva_forte: 'geekblue',
  outros: 'purple',
};

const statusColor: Record<StatusAtividade, string> = {
  em_andamento: 'processing',
  concluida: 'success',
  interrompida: 'error',
};

export default function DiarioList() {
  const navigate = useNavigate();
  const { diarios, removeDiario } = useDiarioStore();
  const { obras } = useObrasStore();
  const [search, setSearch] = useState('');
  const [obraFilter, setObraFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const filtered = diarios.filter((d) => {
    const matchSearch = !search ||
      d.obra.toLowerCase().includes(search.toLowerCase()) ||
      d.responsavel.toLowerCase().includes(search.toLowerCase()) ||
      d.numeroRelatorio.toLowerCase().includes(search.toLowerCase());
    const matchObra = !obraFilter || d.obra === obraFilter;
    const matchDate = !dateRange ||
      (dayjs(d.data).isAfter(dateRange[0].subtract(1, 'day')) &&
       dayjs(d.data).isBefore(dateRange[1].add(1, 'day')));
    return matchSearch && matchObra && matchDate;
  });

  const columns = [
    {
      title: 'Nº Relatório', dataIndex: 'numeroRelatorio', key: 'numeroRelatorio', width: 140,
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      title: 'Obra', dataIndex: 'obra', key: 'obra', ellipsis: true,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Data', dataIndex: 'data', key: 'data', width: 110, sorter: (a: DiarioObra, b: DiarioObra) =>
        dayjs(a.data).unix() - dayjs(b.data).unix(),
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    { title: 'Responsável', dataIndex: 'responsavel', key: 'responsavel' },
    {
      title: 'Clima', dataIndex: 'condicaoClimatica', key: 'condicaoClimatica', width: 150,
      render: (v: CondicaoClimatica) => <Tag color={climaColor[v]}>{climaLabel[v]}</Tag>,
    },
    {
      title: 'Atividades', key: 'atividades', width: 100,
      render: (_: unknown, r: DiarioObra) => (
        <Space size={4}>
          {Object.entries(statusColor).map(([status, color]) => {
            const count = r.atividades.filter((a) => a.status === status).length;
            return count > 0 ? <Tag key={status} color={color}>{count}</Tag> : null;
          })}
        </Space>
      ),
    },
    {
      title: 'Equipe', key: 'equipe', width: 80,
      render: (_: unknown, r: DiarioObra) => <Tag>{r.equipe.length} pessoas</Tag>,
    },
    {
      title: 'Ações', key: 'actions', width: 120, fixed: 'right' as const,
      render: (_: unknown, r: DiarioObra) => (
        <Space>
          <Tooltip title="Visualizar"><Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/diario/${r.id}`)} /></Tooltip>
          <Tooltip title="Editar"><Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/diario/${r.id}/editar`)} /></Tooltip>
          <Tooltip title="Remover">
            <Popconfirm title="Remover diário?" onConfirm={() => removeDiario(r.id)}>
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
          <Title level={3} style={{ margin: 0 }}><BookOutlined /> Diário de Obra</Title>
          <Text type="secondary">Histórico completo de registros diários</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/diario/novo')}>
          Novo Registro
        </Button>
      </div>

      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Buscar por obra, responsável ou nº relatório..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="Filtrar por obra"
              style={{ width: 220 }}
              allowClear
              value={obraFilter}
              onChange={setObraFilter}
              options={obras.map((o) => ({ value: o.nome, label: o.nome }))}
            />
          </Col>
          <Col>
            <RangePicker
              format="DD/MM/YYYY"
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            />
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">{filtered.length} registro(s) encontrado(s)</Text>
          <Button icon={<FilePdfOutlined />} disabled>Exportar selecionados</Button>
        </div>
        <Table
          dataSource={filtered.map((d) => ({ ...d, key: d.id }))}
          columns={columns}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
