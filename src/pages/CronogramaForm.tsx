import { useEffect, useState } from 'react';
import {
  Card, Form, Input, Select, DatePicker, Button, Typography, Row, Col,
  Table, Space, Tag, Modal, InputNumber, message, Popconfirm, Progress,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useCronogramaStore, useObrasStore } from '../store';
import type {
  CronogramaObra, ProcessoCronograma,
  FaseCronograma, CategoriaCronograma, StatusProcesso, StatusCronograma,
} from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const faseOptions = [
  { value: 'inicio', label: '🟣 Início' },
  { value: 'meio', label: '🔵 Meio' },
  { value: 'fim', label: '🟢 Fim' },
];

const categoriaOptions: { value: CategoriaCronograma; label: string }[] = [
  { value: 'servicos_preliminares', label: 'Serviços Preliminares' },
  { value: 'fundacao', label: 'Fundações' },
  { value: 'estrutura', label: 'Estrutura' },
  { value: 'alvenaria', label: 'Alvenaria' },
  { value: 'cobertura', label: 'Cobertura' },
  { value: 'instalacoes_eletricas', label: 'Instalações Elétricas' },
  { value: 'instalacoes_hidraulicas', label: 'Instalações Hidráulicas' },
  { value: 'gas', label: 'Instalações de Gás' },
  { value: 'impermeabilizacao', label: 'Impermeabilização' },
  { value: 'revestimento_interno', label: 'Revestimento Interno' },
  { value: 'revestimento_externo', label: 'Revestimento Externo' },
  { value: 'esquadrias', label: 'Esquadrias' },
  { value: 'pisos', label: 'Pisos e Revestimentos' },
  { value: 'pintura', label: 'Pintura' },
  { value: 'instalacoes_complementares', label: 'Instalações Complementares' },
  { value: 'paisagismo', label: 'Paisagismo e Área Externa' },
  { value: 'limpeza_entrega', label: 'Limpeza Final e Entrega' },
  { value: 'outro', label: 'Outro' },
];

const statusOptions: { value: StatusProcesso; label: string }[] = [
  { value: 'nao_iniciado', label: 'Não Iniciado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'atrasado', label: 'Atrasado' },
  { value: 'paralisado', label: 'Paralisado' },
];

const statusColor: Record<StatusProcesso, string> = {
  nao_iniciado: 'default',
  em_andamento: 'processing',
  concluido: 'success',
  atrasado: 'error',
  paralisado: 'warning',
};

const orcVazio = {
  maoDeObraPrevista: 0, maoDeObraExecutada: 0,
  materiaisPrevisto: 0, materiaisExecutado: 0,
  equipamentosPrevisto: 0, equipamentosExecutado: 0,
  outrosPrevisto: 0, outrosExecutado: 0,
};

export default function CronogramaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { cronogramas, addCronograma, updateCronograma } = useCronogramaStore();
  const { obras } = useObrasStore();

  const [form] = Form.useForm();
  const [processos, setProcessos] = useState<ProcessoCronograma[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState<ProcessoCronograma | null>(null);
  const [procForm] = Form.useForm();

  useEffect(() => {
    if (isEdit && id) {
      const c = cronogramas.find((x) => x.id === id);
      if (c) {
        form.setFieldsValue({
          obraNome: c.obraNome,
          descricao: c.descricao,
          responsavelGeral: c.responsavelGeral,
          dataInicioProgramada: dayjs(c.dataInicioProgramada),
          dataFimProgramada: dayjs(c.dataFimProgramada),
          status: c.status,
          orcamentoTotal: c.orcamentoTotal,
        });
        setProcessos(c.processos);
      }
    }
  }, [id]);

  const handleSave = () => {
    form.validateFields().then((vals) => {
      const payload: CronogramaObra = {
        id: isEdit && id ? id : uid(),
        obraNome: vals.obraNome,
        descricao: vals.descricao,
        responsavelGeral: vals.responsavelGeral,
        dataInicioProgramada: vals.dataInicioProgramada.format('YYYY-MM-DD'),
        dataFimProgramada: vals.dataFimProgramada.format('YYYY-MM-DD'),
        status: vals.status ?? 'rascunho',
        orcamentoTotal: vals.orcamentoTotal ?? 0,
        processos: processos.map((p, i) => ({ ...p, ordem: i + 1 })),
        criadoEm: isEdit ? (cronogramas.find((c) => c.id === id)?.criadoEm ?? new Date().toISOString()) : new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };
      if (isEdit && id) {
        updateCronograma(id, payload);
        message.success('Cronograma atualizado!');
      } else {
        addCronograma(payload);
        message.success('Cronograma criado!');
      }
      navigate(`/cronograma/${payload.id}`);
    });
  };

  const openAddProcesso = () => {
    setEditingProcesso(null);
    procForm.resetFields();
    setModalOpen(true);
  };

  const openEditProcesso = (p: ProcessoCronograma) => {
    setEditingProcesso(p);
    procForm.setFieldsValue({
      ...p,
      dataInicioProgramada: dayjs(p.dataInicioProgramada),
      dataFimProgramada: dayjs(p.dataFimProgramada),
      dataInicioReal: p.dataInicioReal ? dayjs(p.dataInicioReal) : undefined,
      dataFimReal: p.dataFimReal ? dayjs(p.dataFimReal) : undefined,
    });
    setModalOpen(true);
  };

  const handleSaveProcesso = () => {
    procForm.validateFields().then((vals) => {
      const cronId = isEdit && id ? id : 'pending';
      const novo: ProcessoCronograma = {
        id: editingProcesso?.id ?? uid(),
        cronogramaId: cronId,
        nome: vals.nome,
        descricao: vals.descricao,
        fase: vals.fase,
        categoria: vals.categoria,
        ordem: editingProcesso?.ordem ?? processos.length + 1,
        dataInicioProgramada: vals.dataInicioProgramada.format('YYYY-MM-DD'),
        dataFimProgramada: vals.dataFimProgramada.format('YYYY-MM-DD'),
        dataInicioReal: vals.dataInicioReal?.format('YYYY-MM-DD'),
        dataFimReal: vals.dataFimReal?.format('YYYY-MM-DD'),
        status: vals.status ?? 'nao_iniciado',
        percentualConcluido: vals.percentualConcluido ?? 0,
        responsavel: vals.responsavel,
        observacoes: vals.observacoes,
        equipe: editingProcesso?.equipe ?? [],
        materiais: editingProcesso?.materiais ?? [],
        ferramentas: editingProcesso?.ferramentas ?? [],
        orcamento: {
          maoDeObraPrevista: vals.maoDeObraPrevista ?? 0,
          maoDeObraExecutada: vals.maoDeObraExecutada ?? 0,
          materiaisPrevisto: vals.materiaisPrevisto ?? 0,
          materiaisExecutado: vals.materiaisExecutado ?? 0,
          equipamentosPrevisto: vals.equipamentosPrevisto ?? 0,
          equipamentosExecutado: vals.equipamentosExecutado ?? 0,
          outrosPrevisto: vals.outrosPrevisto ?? 0,
          outrosExecutado: vals.outrosExecutado ?? 0,
        },
        requisitosSafety: vals.requisitosSafety ?? [],
        vinculosSeguranca: editingProcesso?.vinculosSeguranca ?? [],
        criadoEm: editingProcesso?.criadoEm ?? new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };
      if (editingProcesso) {
        setProcessos((prev) => prev.map((p) => (p.id === editingProcesso.id ? novo : p)));
      } else {
        setProcessos((prev) => [...prev, novo]);
      }
      setModalOpen(false);
    });
  };

  const removeProcesso = (pid: string) => {
    setProcessos((prev) => prev.filter((p) => p.id !== pid));
  };

  const procColumns = [
    {
      title: '#', dataIndex: 'ordem', key: 'ordem', width: 40,
      render: (_: unknown, __: unknown, i: number) => i + 1,
    },
    {
      title: 'Processo', key: 'nome',
      render: (_: unknown, p: ProcessoCronograma) => (
        <div>
          <Tag color={p.fase === 'inicio' ? 'purple' : p.fase === 'meio' ? 'blue' : 'green'} style={{ marginBottom: 2 }}>
            {p.fase === 'inicio' ? 'Início' : p.fase === 'meio' ? 'Meio' : 'Fim'}
          </Tag>
          <br />
          <span style={{ fontWeight: 600 }}>{p.nome}</span>
        </div>
      ),
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 130,
      responsive: ['sm'] as ('sm')[],
      render: (v: StatusProcesso) => <Tag color={statusColor[v]}>{statusOptions.find((s) => s.value === v)?.label}</Tag>,
    },
    {
      title: '%', dataIndex: 'percentualConcluido', key: 'pct', width: 90,
      responsive: ['sm'] as ('sm')[],
      render: (v: number) => <Progress percent={v} size="small" />,
    },
    {
      title: 'Datas', key: 'datas', width: 200,
      responsive: ['md'] as ('md')[],
      render: (_: unknown, p: ProcessoCronograma) => (
        <div style={{ fontSize: 11 }}>
          <div>Prev: {dayjs(p.dataInicioProgramada).format('DD/MM/YY')} → {dayjs(p.dataFimProgramada).format('DD/MM/YY')}</div>
          {p.dataInicioReal && <div style={{ color: '#52c41a' }}>Real: {dayjs(p.dataInicioReal).format('DD/MM/YY')} → {p.dataFimReal ? dayjs(p.dataFimReal).format('DD/MM/YY') : 'em aberto'}</div>}
        </div>
      ),
    },
    {
      title: 'Responsável', dataIndex: 'responsavel', key: 'resp',
      responsive: ['lg'] as ('lg')[],
    },
    {
      title: 'Ações', key: 'actions', width: 90,
      render: (_: unknown, p: ProcessoCronograma) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditProcesso(p)} />
          <Popconfirm title="Remover processo?" onConfirm={() => removeProcesso(p.id)}>
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
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/cronograma')}>Voltar</Button>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? 'Editar' : 'Novo'} Cronograma de Obra</Title>
        </div>
        <Button type="primary" icon={<SaveOutlined />} size="large" onClick={handleSave}>Salvar Cronograma</Button>
      </div>

      {/* Informações gerais */}
      <Card title="Informações Gerais" bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="obraNome" label="Obra" rules={[{ required: true }]}>
                <Select
                  showSearch
                  placeholder="Selecione ou digite o nome da obra"
                  options={obras.map((o) => ({ value: o.nome, label: o.nome }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="responsavelGeral" label="Responsável Geral" rules={[{ required: true }]}>
                <Input placeholder="Eng. Nome Sobrenome" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="descricao" label="Descrição">
            <Input.TextArea rows={2} placeholder="Descreva brevemente a obra e o escopo do cronograma..." />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="dataInicioProgramada" label="Início Programado" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="dataFimProgramada" label="Fim Programado" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="status" label="Status" initialValue="rascunho">
                <Select options={[
                  { value: 'rascunho', label: 'Rascunho' },
                  { value: 'ativo', label: 'Em Andamento' },
                  { value: 'concluido', label: 'Concluído' },
                  { value: 'paralisado', label: 'Paralisado' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="orcamentoTotal" label="Orçamento Total (R$)">
                <InputNumber style={{ width: '100%' }} min={0} step={1000} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={(v) => Number(`${v}`.replace(/\./g, ''))} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Processos */}
      <Card
        title={`Processos (${processos.length})`}
        bordered={false}
        style={{ borderRadius: 12 }}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAddProcesso}>Adicionar Processo</Button>}
      >
        {processos.length === 0
          ? <div style={{ textAlign: 'center', padding: '32px 0', color: '#8c8c8c' }}>Nenhum processo cadastrado. Clique em "Adicionar Processo" para começar.</div>
          : (
            <Table
              dataSource={processos.map((p, i) => ({ ...p, key: p.id, _index: i }))}
              columns={procColumns}
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          )
        }
      </Card>

      {/* Modal de processo */}
      <Modal
        title={editingProcesso ? 'Editar Processo' : 'Novo Processo'}
        open={modalOpen}
        onOk={handleSaveProcesso}
        onCancel={() => setModalOpen(false)}
        width={720}
        style={{ maxWidth: '95vw' }}
        okText="Salvar"
        cancelText="Cancelar"
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        <Form form={procForm} layout="vertical" style={{ marginTop: 12 }}>
          {/* Identificação */}
          <Row gutter={12}>
            <Col xs={24} sm={14}>
              <Form.Item name="nome" label="Nome do Processo" rules={[{ required: true }]}>
                <Input placeholder="Ex: Estrutura — pilares, vigas e lajes" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={5}>
              <Form.Item name="fase" label="Fase" rules={[{ required: true }]}>
                <Select options={faseOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={5}>
              <Form.Item name="categoria" label="Categoria" rules={[{ required: true }]}>
                <Select options={categoriaOptions} showSearch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="descricao" label="Descrição">
            <Input.TextArea rows={2} placeholder="Descreva o escopo deste processo..." />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="responsavel" label="Responsável" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="status" label="Status" initialValue="nao_iniciado">
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="percentualConcluido" label="% Concluído" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} suffix="%" />
              </Form.Item>
            </Col>
          </Row>

          {/* Datas */}
          <Row gutter={12}>
            <Col xs={24} sm={6}>
              <Form.Item name="dataInicioProgramada" label="Início Programado" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="dataFimProgramada" label="Fim Programado" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="dataInicioReal" label="Início Real">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="dataFimReal" label="Fim Real">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          {/* Orçamento */}
          <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Orçamento (R$) — Previsto × Executado</div>
            <Row gutter={12}>
              {[
                { prevKey: 'maoDeObraPrevista', execKey: 'maoDeObraExecutada', label: 'Mão de Obra' },
                { prevKey: 'materiaisPrevisto', execKey: 'materiaisExecutado', label: 'Materiais' },
                { prevKey: 'equipamentosPrevisto', execKey: 'equipamentosExecutado', label: 'Equipamentos' },
                { prevKey: 'outrosPrevisto', execKey: 'outrosExecutado', label: 'Outros' },
              ].map(({ prevKey, execKey, label }) => (
                <>
                  <Col xs={12} sm={3} key={`${prevKey}_prev`}>
                    <Form.Item name={prevKey} label={`${label} Prev.`} initialValue={0}>
                      <InputNumber style={{ width: '100%' }} min={0} step={100} size="small" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={3} key={`${execKey}_exec`}>
                    <Form.Item name={execKey} label={`${label} Real`} initialValue={0}>
                      <InputNumber style={{ width: '100%' }} min={0} step={100} size="small" />
                    </Form.Item>
                  </Col>
                </>
              ))}
            </Row>
          </div>

          {/* Requisitos de segurança */}
          <Form.Item name="requisitosSafety" label="Requisitos de Segurança (EPIs / NRs aplicáveis)">
            <Select mode="tags" placeholder="Adicione itens como: NR-35 — Trabalho em altura, EPI capacete, etc." />
          </Form.Item>

          <Form.Item name="observacoes" label="Observações">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
