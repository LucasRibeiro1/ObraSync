import { useState } from 'react';
import {
  Card, Button, Typography, Space, Table, Tag, Descriptions, Row, Col,
  Statistic, Alert, Progress, Form, Select, Checkbox, Modal, message,
  Popconfirm, Tooltip, Badge,
} from 'antd';
import {
  ArrowLeftOutlined, LinkOutlined, DisconnectOutlined, CheckCircleOutlined,
  ClockCircleOutlined, DollarOutlined, FileTextOutlined, BuildOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotaFiscalStore, useCronogramaStore } from '../store';
import type { ItemNotaFiscal } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function fmtCNPJ(v: string) {
  const d = v.replace(/\D/g, '');
  return d.length === 14 ? d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : v;
}

function fmtMoney(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const statusLabel = { importada: 'Importada', parcialmente_vinculada: 'Parc. Vinculada', vinculada: 'Totalmente Vinculada' };
const statusColor = { importada: 'default', parcialmente_vinculada: 'warning', vinculada: 'success' };

export default function NotaFiscalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notasFiscais, vincularItem, desvincularItem } = useNotaFiscalStore();
  const { cronogramas, updateProcesso } = useCronogramaStore();
  const [vincModal, setVincModal] = useState(false);
  const [vincItem, setVincItem] = useState<ItemNotaFiscal | null>(null);
  const [vincForm] = Form.useForm();
  const [selectedCronograma, setSelectedCronograma] = useState<string | null>(null);
  const [addAsMaterial, setAddAsMaterial] = useState(true);

  const nf = notasFiscais.find((n) => n.id === id);

  if (!nf) {
    return (
      <Alert
        message="Nota fiscal não encontrada"
        type="error"
        showIcon
        action={<Button onClick={() => navigate('/notas')}>Voltar</Button>}
      />
    );
  }

  const itensVinculados = nf.itens.filter((i) => i.processoId).length;
  const valorVinculado = nf.itens.filter((i) => i.processoId).reduce((s, i) => s + i.valorTotal, 0);
  const valorPendente = nf.itens.filter((i) => !i.processoId).reduce((s, i) => s + i.valorTotal, 0);
  const percentVinculado = nf.itens.length > 0 ? Math.round((itensVinculados / nf.itens.length) * 100) : 0;

  // Opções de cronograma para o Select
  const cronogramaOpts = cronogramas.map((c) => ({
    value: c.id,
    label: `${c.obraNome} (${c.status === 'ativo' ? 'Em andamento' : c.status})`,
  }));

  // Processos do cronograma selecionado
  const processosOpts = selectedCronograma
    ? (cronogramas.find((c) => c.id === selectedCronograma)?.processos ?? []).map((p) => ({
        value: p.id,
        label: `${p.ordem}. ${p.nome} [${p.fase === 'inicio' ? 'Início' : p.fase === 'meio' ? 'Meio' : 'Fim'}]`,
      }))
    : [];

  function openVincular(item: ItemNotaFiscal) {
    setVincItem(item);
    setSelectedCronograma(null);
    setAddAsMaterial(true);
    vincForm.resetFields();
    setVincModal(true);
  }

  function handleVincular() {
    vincForm.validateFields().then((vals) => {
      if (!vincItem) return;
      const cron = cronogramas.find((c) => c.id === vals.cronogramaId);
      const proc = cron?.processos.find((p) => p.id === vals.processoId);
      if (!cron || !proc) return;

      vincularItem(nf.id, vincItem.id, {
        cronogramaId: cron.id,
        processoId: proc.id,
        obraNome: cron.obraNome,
        processoNome: proc.nome,
      });

      if (addAsMaterial) {
        const novoMaterial = {
          id: uid(),
          nome: vincItem.descricao,
          especificacao: `Cód: ${vincItem.codigo}${vincItem.ncm ? ' | NCM: ' + vincItem.ncm : ''}`,
          unidade: vincItem.unidade,
          quantidadePrevista: vincItem.quantidade,
          quantidadeUtilizada: vincItem.quantidade,
          valorUnitarioPrevisto: vincItem.valorUnitario,
          valorUnitarioReal: vincItem.valorUnitario,
          fornecedor: nf.fornecedorNome,
          statusAquisicao: 'entregue' as const,
        };
        updateProcesso(cron.id, proc.id, {
          materiais: [...proc.materiais, novoMaterial],
        });
        message.success(`Item vinculado a "${proc.nome}" e adicionado como material no processo!`);
      } else {
        message.success(`Item vinculado ao processo "${proc.nome}".`);
      }

      setVincModal(false);
    });
  }

  function handleDesvincular(itemId: string) {
    desvincularItem(nf.id, itemId);
    message.success('Vínculo removido.');
  }

  const columns = [
    { title: '#', dataIndex: 'nItem', key: 'n', width: 45 },
    {
      title: 'Produto/Material',
      key: 'prod',
      render: (_: unknown, r: ItemNotaFiscal) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.descricao}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Cód: {r.codigo}
            {r.ncm && ` | NCM: ${r.ncm}`}
            {r.cfop && ` | CFOP: ${r.cfop}`}
          </Text>
        </div>
      ),
    },
    { title: 'Un.', dataIndex: 'unidade', key: 'un', width: 60 },
    {
      title: 'Qtd.',
      dataIndex: 'quantidade',
      key: 'qtd',
      width: 80,
      render: (v: number) => v.toLocaleString('pt-BR'),
    },
    {
      title: 'V. Unit.',
      dataIndex: 'valorUnitario',
      key: 'vunit',
      width: 110,
      responsive: ['sm'] as ('sm')[],
      render: (v: number) => fmtMoney(v),
    },
    {
      title: 'V. Total',
      dataIndex: 'valorTotal',
      key: 'vtot',
      width: 120,
      render: (v: number) => <Text strong>{fmtMoney(v)}</Text>,
    },
    {
      title: 'Processo vinculado',
      key: 'vinculo',
      render: (_: unknown, r: ItemNotaFiscal) => {
        if (r.processoId && r.processoNome) {
          return (
            <div>
              <Badge status="success" text={<Text style={{ fontSize: 12 }} strong>{r.processoNome}</Text>} />
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>{r.obraNome}</Text>
            </div>
          );
        }
        return <Badge status="default" text={<Text type="secondary" style={{ fontSize: 12 }}>Não vinculado</Text>} />;
      },
    },
    {
      title: 'Ação',
      key: 'act',
      width: 110,
      render: (_: unknown, r: ItemNotaFiscal) => {
        if (r.processoId) {
          return (
            <Popconfirm title="Remover vínculo?" onConfirm={() => handleDesvincular(r.id)}>
              <Button size="small" icon={<DisconnectOutlined />} danger>
                Desvincular
              </Button>
            </Popconfirm>
          );
        }
        return (
          <Button size="small" type="primary" icon={<LinkOutlined />} onClick={() => openVincular(r)}>
            Vincular
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/notas')} />
          <Title level={3} style={{ margin: 0 }}>
            <FileTextOutlined /> NF-e {nf.numero}
          </Title>
          <Space size={8}>
            <Text type="secondary">{nf.fornecedorNome}</Text>
            <Tag color={statusColor[nf.status]}>{statusLabel[nf.status]}</Tag>
          </Space>
        </div>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Valor Total NF"
              value={nf.valorTotal}
              prefix="R$"
              formatter={(v) => Number(v).toLocaleString('pt-BR')}
              valueStyle={{ color: '#1a56db' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Itens Vinculados"
              value={`${itensVinculados}/${nf.itens.length}`}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={percentVinculado} size="small" showInfo={false} strokeColor="#52c41a" style={{ marginTop: 4 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Valor Vinculado"
              value={valorVinculado}
              prefix="R$"
              formatter={(v) => Number(v).toLocaleString('pt-BR')}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Valor Pendente"
              value={valorPendente}
              prefix="R$"
              formatter={(v) => Number(v).toLocaleString('pt-BR')}
              valueStyle={{ color: valorPendente > 0 ? '#faad14' : '#52c41a' }}
              prefix={<ClockCircleOutlined style={{ color: valorPendente > 0 ? '#faad14' : '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Dados da NF */}
      <Card bordered={false} style={{ borderRadius: 12, marginBottom: 16 }} title="Dados da Nota Fiscal">
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Número">{nf.numero}</Descriptions.Item>
          <Descriptions.Item label="Série">{nf.serie}</Descriptions.Item>
          <Descriptions.Item label="Data de Emissão">{dayjs(nf.dataEmissao).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Fornecedor (Emitente)">{nf.fornecedorNome}</Descriptions.Item>
          <Descriptions.Item label="CNPJ Emitente">{fmtCNPJ(nf.fornecedorCNPJ)}</Descriptions.Item>
          {nf.naturezaOperacao && <Descriptions.Item label="Natureza">{nf.naturezaOperacao}</Descriptions.Item>}
          {nf.destinatarioNome && <Descriptions.Item label="Destinatário">{nf.destinatarioNome}</Descriptions.Item>}
          {nf.destinatarioCNPJ && <Descriptions.Item label="CNPJ Destinatário">{fmtCNPJ(nf.destinatarioCNPJ)}</Descriptions.Item>}
          <Descriptions.Item label="Importado em">{dayjs(nf.importadoEm).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
          {nf.chaveAcesso && (
            <Descriptions.Item label="Chave de Acesso" span={3}>
              <Text style={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>{nf.chaveAcesso}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Itens */}
      <Card
        bordered={false}
        style={{ borderRadius: 12 }}
        title={`Itens da Nota (${nf.itens.length})`}
        extra={
          <Tooltip title="Vincule cada item ao processo do cronograma para controlar o custo por processo">
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        }
      >
        {nf.itens.some((i) => !i.processoId) && (
          <Alert
            type="warning"
            showIcon
            message={`${nf.itens.filter((i) => !i.processoId).length} item(ns) ainda não vinculado(s) a nenhum processo do cronograma.`}
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          dataSource={nf.itens.map((i) => ({ ...i, key: i.id }))}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ x: 900 }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5}>
                <Text strong>Total</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text strong>{fmtMoney(nf.valorTotal)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} colSpan={2}>
                <Space size={16}>
                  <Text style={{ fontSize: 12 }} type="success">Vinculado: {fmtMoney(valorVinculado)}</Text>
                  {valorPendente > 0 && <Text style={{ fontSize: 12 }} type="warning">Pendente: {fmtMoney(valorPendente)}</Text>}
                </Space>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      {/* Modal de vinculação */}
      <Modal
        title={
          <Space>
            <LinkOutlined />
            <span>Vincular ao Processo</span>
          </Space>
        }
        open={vincModal}
        onOk={handleVincular}
        onCancel={() => setVincModal(false)}
        okText="Vincular"
        cancelText="Cancelar"
        width={520}
        style={{ maxWidth: '95vw' }}
      >
        {vincItem && (
          <>
            <Card
              size="small"
              style={{ background: '#f5f5f5', marginBottom: 16, borderRadius: 8 }}
            >
              <Text strong style={{ display: 'block' }}>{vincItem.descricao}</Text>
              <Space size={16} style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <DollarOutlined /> {fmtMoney(vincItem.valorTotal)}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {vincItem.quantidade} {vincItem.unidade}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Cód: {vincItem.codigo}
                </Text>
              </Space>
            </Card>

            <Form form={vincForm} layout="vertical">
              <Form.Item
                name="cronogramaId"
                label={<Space><BuildOutlined />Cronograma de Obra</Space>}
                rules={[{ required: true, message: 'Selecione o cronograma' }]}
              >
                <Select
                  options={cronogramaOpts}
                  placeholder="Selecione o cronograma..."
                  showSearch
                  optionFilterProp="label"
                  onChange={(val) => {
                    setSelectedCronograma(val);
                    vincForm.setFieldValue('processoId', undefined);
                  }}
                />
              </Form.Item>

              <Form.Item
                name="processoId"
                label="Processo"
                rules={[{ required: true, message: 'Selecione o processo' }]}
              >
                <Select
                  options={processosOpts}
                  placeholder={selectedCronograma ? 'Selecione o processo...' : 'Selecione um cronograma primeiro'}
                  disabled={!selectedCronograma}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>

              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '10px 14px' }}>
                <Checkbox
                  checked={addAsMaterial}
                  onChange={(e) => setAddAsMaterial(e.target.checked)}
                >
                  <Text strong>Adicionar automaticamente como material no processo</Text>
                </Checkbox>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4, marginLeft: 24 }}>
                  O item será incluído na lista de materiais do processo com qtd, valor e fornecedor preenchidos automaticamente.
                </Text>
              </div>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}
