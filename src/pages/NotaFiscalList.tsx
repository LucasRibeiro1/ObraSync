import { Card, Table, Button, Tag, Space, Typography, Row, Col, Statistic, Popconfirm, Tooltip } from 'antd';
import {
  PlusOutlined, EyeOutlined, DeleteOutlined, FileTextOutlined,
  CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, LinkOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotaFiscalStore } from '../store';
import type { NotaFiscal } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusLabel: Record<NotaFiscal['status'], string> = {
  importada: 'Importada',
  parcialmente_vinculada: 'Parc. Vinculada',
  vinculada: 'Vinculada',
};
const statusColor: Record<NotaFiscal['status'], string> = {
  importada: 'default',
  parcialmente_vinculada: 'warning',
  vinculada: 'success',
};

function fmtCNPJ(v: string) {
  const d = v.replace(/\D/g, '');
  return d.length === 14 ? d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : v;
}

function fmtMoney(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function NotaFiscalList() {
  const navigate = useNavigate();
  const { notasFiscais, removeNotaFiscal } = useNotaFiscalStore();

  const valorTotal = notasFiscais.reduce((s, nf) => s + nf.valorTotal, 0);
  const totalItens = notasFiscais.reduce((s, nf) => s + nf.itens.length, 0);
  const itensVinculados = notasFiscais.reduce((s, nf) => s + nf.itens.filter((i) => i.processoId).length, 0);
  const nfsPendentes = notasFiscais.filter((nf) => nf.status !== 'vinculada').length;

  const columns = [
    {
      title: 'Nota Fiscal',
      key: 'nf',
      render: (_: unknown, r: NotaFiscal) => (
        <div>
          <Text strong>NF {r.numero} — Série {r.serie}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{r.fornecedorNome}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>CNPJ: {fmtCNPJ(r.fornecedorCNPJ)}</Text>
        </div>
      ),
    },
    {
      title: 'Emissão',
      dataIndex: 'dataEmissao',
      key: 'data',
      width: 110,
      responsive: ['sm'] as ('sm')[],
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Valor Total',
      dataIndex: 'valorTotal',
      key: 'valor',
      width: 130,
      render: (v: number) => <Text strong>{fmtMoney(v)}</Text>,
    },
    {
      title: 'Itens',
      key: 'itens',
      width: 120,
      responsive: ['sm'] as ('sm')[],
      render: (_: unknown, r: NotaFiscal) => {
        const vinc = r.itens.filter((i) => i.processoId).length;
        return (
          <Tooltip title={`${vinc} vinculados de ${r.itens.length}`}>
            <Space size={4}>
              <LinkOutlined style={{ color: vinc > 0 ? '#52c41a' : '#d9d9d9' }} />
              <Text style={{ fontSize: 12 }}>{vinc}/{r.itens.length}</Text>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      responsive: ['md'] as ('md')[],
      render: (v: NotaFiscal['status']) => <Tag color={statusColor[v]}>{statusLabel[v]}</Tag>,
    },
    {
      title: 'Importado em',
      dataIndex: 'importadoEm',
      key: 'importado',
      width: 130,
      responsive: ['lg'] as ('lg')[],
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_: unknown, r: NotaFiscal) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/notas/${r.id}`)} />
          <Popconfirm title="Remover nota fiscal?" onConfirm={() => removeNotaFiscal(r.id)}>
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
          <Title level={3} style={{ margin: 0 }}><FileTextOutlined /> Notas Fiscais</Title>
          <Text type="secondary">Entrada de materiais via XML NF-e com vinculação ao cronograma</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/notas/importar')}>
          Importar XML
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Total de NFs" value={notasFiscais.length} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Valor Importado" value={valorTotal} prefix="R$" formatter={(v) => Number(v).toLocaleString('pt-BR')} valueStyle={{ color: '#1a56db' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Itens Vinculados"
              value={`${itensVinculados}/${totalItens}`}
              prefix={<CheckCircleOutlined style={{ color: itensVinculados === totalItens && totalItens > 0 ? '#52c41a' : '#1a56db' }} />}
              valueStyle={{ color: itensVinculados === totalItens && totalItens > 0 ? '#52c41a' : '#1a56db' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Com Pendências"
              value={nfsPendentes}
              prefix={<ClockCircleOutlined style={{ color: nfsPendentes > 0 ? '#faad14' : '#52c41a' }} />}
              valueStyle={{ color: nfsPendentes > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {notasFiscais.length === 0 ? (
        <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center', padding: 48 }}>
          <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16, display: 'block' }} />
          <Title level={4} type="secondary">Nenhuma nota fiscal importada</Title>
          <Text type="secondary">Importe o arquivo XML da NF-e para controlar a entrada de materiais.</Text>
          <br />
          <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 16 }} onClick={() => navigate('/notas/importar')}>
            Importar primeiro XML
          </Button>
        </Card>
      ) : (
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Table
            dataSource={notasFiscais.map((nf) => ({ ...nf, key: nf.id }))}
            columns={columns}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            expandable={{
              expandedRowRender: (r: NotaFiscal) => (
                <div style={{ padding: '8px 0' }}>
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Text type="secondary">Natureza da operação:</Text>
                      <br />
                      <Text strong>{r.naturezaOperacao || '—'}</Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text type="secondary">Destinatário:</Text>
                      <br />
                      <Text strong>{r.destinatarioNome || '—'}</Text>
                      {r.destinatarioCNPJ && <><br /><Text style={{ fontSize: 11 }}>{fmtCNPJ(r.destinatarioCNPJ)}</Text></>}
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text type="secondary">Chave de acesso:</Text>
                      <br />
                      <Text style={{ fontSize: 10, wordBreak: 'break-all' }}>{r.chaveAcesso || '—'}</Text>
                    </Col>
                  </Row>
                </div>
              ),
            }}
          />
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Space>
              <DollarOutlined />
              <Text strong>Total das {notasFiscais.length} NFs: {fmtMoney(valorTotal)}</Text>
            </Space>
          </div>
        </Card>
      )}
    </div>
  );
}
