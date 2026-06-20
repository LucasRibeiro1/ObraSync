import { useEffect, useState } from 'react';
import {
  Card, Form, Input, Select, DatePicker, TimePicker, Button, Space, Typography,
  Table, Modal, InputNumber, Tabs, Tag, Divider, Alert, Row, Col, Checkbox, message,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined,
  TeamOutlined, AppstoreOutlined, InboxOutlined, ToolOutlined, WarningOutlined, PaperClipOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDiarioStore, useSegurancaStore, useObrasStore } from '../store';
import type {
  FuncionarioDia, Atividade, Material, Equipamento, Ocorrencia,
  CondicaoClimatica, StatusAtividade,
} from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CLIMA_OPTIONS: { value: CondicaoClimatica; label: string }[] = [
  { value: 'ensolarado', label: '☀️ Ensolarado' },
  { value: 'parcialmente_nublado', label: '⛅ Parcialmente Nublado' },
  { value: 'nublado', label: '☁️ Nublado' },
  { value: 'chuva_leve', label: '🌦 Chuva Leve' },
  { value: 'chuva_forte', label: '⛈ Chuva Forte' },
  { value: 'outros', label: '🌪 Outros' },
];

const STATUS_OPTIONS: { value: StatusAtividade; label: string }[] = [
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'interrompida', label: 'Interrompida' },
];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function DiarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { diarios, addDiario, updateDiario } = useDiarioStore();
  const { acidentes, incidentes } = useSegurancaStore();
  const { obras } = useObrasStore();

  const [form] = Form.useForm();
  const [equipe, setEquipe] = useState<FuncionarioDia[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [modalKey, setModalKey] = useState<string | null>(null);
  const [subForm] = Form.useForm();
  const [segurancaModal, setSegurancaModal] = useState(false);
  const [selectedSeg, setSelectedSeg] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      const d = diarios.find((x) => x.id === id);
      if (d) {
        form.setFieldsValue({
          obra: d.obra,
          data: dayjs(d.data),
          responsavel: d.responsavel,
          horarioInicio: dayjs(d.horarioInicio, 'HH:mm'),
          horarioEncerramento: dayjs(d.horarioEncerramento, 'HH:mm'),
          condicaoClimatica: d.condicaoClimatica,
          observacoesClimaticas: d.observacoesClimaticas,
        });
        setEquipe(d.equipe);
        setAtividades(d.atividades);
        setMateriais(d.materiais);
        setEquipamentos(d.equipamentos);
        setOcorrencias(d.ocorrencias);
      }
    }
  }, [id]);

  const openModal = (key: string) => { subForm.resetFields(); setModalKey(key); };
  const closeModal = () => setModalKey(null);

  const handleSubSave = () => {
    subForm.validateFields().then((vals) => {
      const item = { id: uid(), ...vals };
      if (modalKey === 'equipe') setEquipe((p) => [...p, item]);
      if (modalKey === 'atividade') setAtividades((p) => [...p, item]);
      if (modalKey === 'material') setMateriais((p) => [...p, item]);
      if (modalKey === 'equipamento') setEquipamentos((p) => [...p, item]);
      if (modalKey === 'ocorrencia') setOcorrencias((p) => [...p, item]);
      closeModal();
    });
  };

  const importSeguranca = () => {
    const selected = [
      ...acidentes.filter((a) => selectedSeg.includes(`ac-${a.id}`)).map((a) => ({
        id: uid(),
        descricao: `ACIDENTE: ${a.descricao} — Func.: ${a.funcionario} — Gravidade: ${a.gravidade}`,
        tipo: 'Acidente de Trabalho',
        origem: 'seguranca' as const,
        segurancaId: a.id,
      })),
      ...incidentes.filter((i) => selectedSeg.includes(`in-${i.id}`)).map((i) => ({
        id: uid(),
        descricao: `INCIDENTE: ${i.descricao}`,
        tipo: 'Incidente',
        origem: 'seguranca' as const,
        segurancaId: i.id,
      })),
    ];
    setOcorrencias((p) => [...p, ...selected]);
    setSegurancaModal(false);
    setSelectedSeg([]);
    message.success(`${selected.length} ocorrência(s) de segurança importada(s)`);
  };

  const handleSave = () => {
    form.validateFields().then((vals) => {
      const nextNum = isEdit ? diarios.find((d) => d.id === id)?.numeroRelatorio : `RDO-${dayjs().format('YYYY')}-${String(diarios.length + 1).padStart(3, '0')}`;
      const payload = {
        obra: vals.obra,
        data: vals.data.format('YYYY-MM-DD'),
        responsavel: vals.responsavel,
        horarioInicio: vals.horarioInicio.format('HH:mm'),
        horarioEncerramento: vals.horarioEncerramento.format('HH:mm'),
        condicaoClimatica: vals.condicaoClimatica,
        observacoesClimaticas: vals.observacoesClimaticas ?? '',
        equipe,
        atividades,
        materiais,
        equipamentos,
        ocorrencias,
        anexos: [],
        numeroRelatorio: nextNum ?? 'RDO-0000-000',
        atualizadoEm: new Date().toISOString(),
      };
      if (isEdit && id) {
        updateDiario(id, payload);
        message.success('Diário atualizado com sucesso!');
      } else {
        addDiario({ id: uid(), criadoEm: new Date().toISOString(), ...payload });
        message.success('Diário criado com sucesso!');
      }
      navigate('/diario');
    });
  };

  const equipeColumns = [
    { title: 'Nome', dataIndex: 'nome', key: 'nome' },
    { title: 'Função', dataIndex: 'funcao', key: 'funcao' },
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa' },
    { title: 'Entrada', dataIndex: 'horaEntrada', key: 'horaEntrada', width: 80 },
    { title: 'Saída', dataIndex: 'horaSaida', key: 'horaSaida', width: 80 },
    { title: 'Horas', dataIndex: 'horasTrabalhadas', key: 'horas', width: 70, render: (v: number) => `${v}h` },
    { title: '', key: 'rm', width: 50, render: (_: unknown, r: FuncionarioDia) => <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setEquipe((p) => p.filter((x) => x.id !== r.id))} /> },
  ];

  const atividadesColumns = [
    { title: 'Descrição', dataIndex: 'descricao', key: 'descricao', ellipsis: true },
    { title: 'Local', dataIndex: 'local', key: 'local' },
    { title: 'Qtd', dataIndex: 'quantidade', key: 'quantidade', width: 70 },
    { title: 'Un.', dataIndex: 'unidade', key: 'unidade', width: 60 },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 130,
      render: (v: StatusAtividade) => <Tag color={v === 'concluida' ? 'success' : v === 'em_andamento' ? 'processing' : 'error'}>{STATUS_OPTIONS.find((s) => s.value === v)?.label}</Tag>,
    },
    { title: '', key: 'rm', width: 50, render: (_: unknown, r: Atividade) => <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setAtividades((p) => p.filter((x) => x.id !== r.id))} /> },
  ];

  const materiaisColumns = [
    { title: 'Material', dataIndex: 'material', key: 'material' },
    { title: 'Quantidade', dataIndex: 'quantidade', key: 'quantidade', width: 100 },
    { title: 'Unidade', dataIndex: 'unidade', key: 'unidade', width: 80 },
    { title: 'Fornecedor', dataIndex: 'fornecedor', key: 'fornecedor' },
    { title: '', key: 'rm', width: 50, render: (_: unknown, r: Material) => <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setMateriais((p) => p.filter((x) => x.id !== r.id))} /> },
  ];

  const equipamentosColumns = [
    { title: 'Equipamento', dataIndex: 'equipamento', key: 'equipamento' },
    { title: 'Operador', dataIndex: 'operador', key: 'operador' },
    { title: 'Horas', dataIndex: 'horasUtilizacao', key: 'horas', width: 70, render: (v: number) => `${v}h` },
    { title: 'Situação', dataIndex: 'situacao', key: 'situacao' },
    { title: '', key: 'rm', width: 50, render: (_: unknown, r: Equipamento) => <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setEquipamentos((p) => p.filter((x) => x.id !== r.id))} /> },
  ];

  const ocorrenciasColumns = [
    { title: 'Descrição', dataIndex: 'descricao', key: 'descricao', ellipsis: true },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 160, render: (v: string, r: Ocorrencia) => <Tag color={r.origem === 'seguranca' ? 'red' : 'default'}>{v}</Tag> },
    { title: '', key: 'rm', width: 50, render: (_: unknown, r: Ocorrencia) => <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setOcorrencias((p) => p.filter((x) => x.id !== r.id))} /> },
  ];

  const tabItems = [
    {
      key: 'equipe', label: <Space><TeamOutlined />Equipe <Tag>{equipe.length}</Tag></Space>,
      children: (
        <div>
          <Button icon={<PlusOutlined />} onClick={() => openModal('equipe')} style={{ marginBottom: 12 }}>Adicionar Funcionário</Button>
          <Table dataSource={equipe.map((e) => ({ ...e, key: e.id }))} columns={equipeColumns} size="small" pagination={false} />
        </div>
      ),
    },
    {
      key: 'atividades', label: <Space><AppstoreOutlined />Atividades <Tag>{atividades.length}</Tag></Space>,
      children: (
        <div>
          <Button icon={<PlusOutlined />} onClick={() => openModal('atividade')} style={{ marginBottom: 12 }}>Adicionar Atividade</Button>
          <Table dataSource={atividades.map((a) => ({ ...a, key: a.id }))} columns={atividadesColumns} size="small" pagination={false} />
        </div>
      ),
    },
    {
      key: 'materiais', label: <Space><InboxOutlined />Materiais <Tag>{materiais.length}</Tag></Space>,
      children: (
        <div>
          <Button icon={<PlusOutlined />} onClick={() => openModal('material')} style={{ marginBottom: 12 }}>Adicionar Material</Button>
          <Table dataSource={materiais.map((m) => ({ ...m, key: m.id }))} columns={materiaisColumns} size="small" pagination={false} />
        </div>
      ),
    },
    {
      key: 'equipamentos', label: <Space><ToolOutlined />Equipamentos <Tag>{equipamentos.length}</Tag></Space>,
      children: (
        <div>
          <Button icon={<PlusOutlined />} onClick={() => openModal('equipamento')} style={{ marginBottom: 12 }}>Adicionar Equipamento</Button>
          <Table dataSource={equipamentos.map((e) => ({ ...e, key: e.id }))} columns={equipamentosColumns} size="small" pagination={false} />
        </div>
      ),
    },
    {
      key: 'ocorrencias', label: <Space><WarningOutlined />Ocorrências <Tag>{ocorrencias.length}</Tag></Space>,
      children: (
        <div>
          <Space style={{ marginBottom: 12 }}>
            <Button icon={<PlusOutlined />} onClick={() => openModal('ocorrencia')}>Adicionar Ocorrência</Button>
            <Button icon={<WarningOutlined />} onClick={() => setSegurancaModal(true)}>Importar de Segurança</Button>
          </Space>
          {ocorrencias.some((o) => o.origem === 'seguranca') && (
            <Alert message="Ocorrências de segurança vinculadas automaticamente" type="warning" showIcon style={{ marginBottom: 12 }} />
          )}
          <Table dataSource={ocorrencias.map((o) => ({ ...o, key: o.id }))} columns={ocorrenciasColumns} size="small" pagination={false} />
        </div>
      ),
    },
    {
      key: 'anexos', label: <Space><PaperClipOutlined />Anexos</Space>,
      children: (
        <Alert message="Upload de arquivos disponível na versão com backend integrado." type="info" showIcon />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/diario')} style={{ marginBottom: 4 }}>Voltar</Button>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? 'Editar Diário de Obra' : 'Novo Diário de Obra'}</Title>
        </div>
        <Button type="primary" icon={<SaveOutlined />} size="large" onClick={handleSave}>Salvar Diário</Button>
      </div>

      {/* Informações Gerais */}
      <Card title="Informações Gerais" bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="obra" label="Obra" rules={[{ required: true, message: 'Selecione a obra' }]}>
                <Select placeholder="Selecione a obra" options={obras.map((o) => ({ value: o.nome, label: o.nome }))} showSearch />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="data" label="Data" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" defaultValue={dayjs()} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="responsavel" label="Responsável" rules={[{ required: true }]}>
                <Input placeholder="Nome do responsável" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="horarioInicio" label="Horário de Início" rules={[{ required: true }]}>
                <TimePicker style={{ width: '100%' }} format="HH:mm" defaultValue={dayjs('07:00', 'HH:mm')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="horarioEncerramento" label="Horário de Encerramento" rules={[{ required: true }]}>
                <TimePicker style={{ width: '100%' }} format="HH:mm" defaultValue={dayjs('17:00', 'HH:mm')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="condicaoClimatica" label="Condição Climática" rules={[{ required: true }]}>
                <Select options={CLIMA_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="observacoesClimaticas" label="Obs. Climáticas">
                <Input placeholder="Observações sobre o clima" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Tabs */}
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Tabs items={tabItems} type="card" />
      </Card>

      {/* Modal Equipe */}
      <Modal title="Adicionar Funcionário" open={modalKey === 'equipe'} onOk={handleSubSave} onCancel={closeModal} okText="Adicionar" cancelText="Cancelar">
        <Form form={subForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="nome" label="Nome" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="funcao" label="Função/Cargo" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="empresa" label="Empresa" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="horaEntrada" label="Entrada" rules={[{ required: true }]}><Input placeholder="07:00" /></Form.Item></Col>
            <Col span={8}><Form.Item name="horaSaida" label="Saída" rules={[{ required: true }]}><Input placeholder="17:00" /></Form.Item></Col>
            <Col span={8}><Form.Item name="horasTrabalhadas" label="Horas" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} max={24} /></Form.Item></Col>
          </Row>
          <Form.Item name="observacoes" label="Observações"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Modal Atividade */}
      <Modal title="Adicionar Atividade" open={modalKey === 'atividade'} onOk={handleSubSave} onCancel={closeModal} okText="Adicionar" cancelText="Cancelar">
        <Form form={subForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="descricao" label="Descrição" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="local" label="Local" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="quantidade" label="Quantidade" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={6}><Form.Item name="unidade" label="Unidade" rules={[{ required: true }]}><Input placeholder="m², m, unid" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="equipe" label="Equipe Responsável" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="Status" rules={[{ required: true }]}><Select options={STATUS_OPTIONS} /></Form.Item></Col>
          </Row>
          <Form.Item name="observacoes" label="Observações"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Modal Material */}
      <Modal title="Adicionar Material" open={modalKey === 'material'} onOk={handleSubSave} onCancel={closeModal} okText="Adicionar" cancelText="Cancelar">
        <Form form={subForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="material" label="Material" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="quantidade" label="Quantidade" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={12}><Form.Item name="unidade" label="Unidade" rules={[{ required: true }]}><Input placeholder="sacos, m³, unid" /></Form.Item></Col>
          </Row>
          <Form.Item name="fornecedor" label="Fornecedor"><Input /></Form.Item>
          <Form.Item name="observacoes" label="Observações"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Modal Equipamento */}
      <Modal title="Adicionar Equipamento" open={modalKey === 'equipamento'} onOk={handleSubSave} onCancel={closeModal} okText="Adicionar" cancelText="Cancelar">
        <Form form={subForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="equipamento" label="Equipamento" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="operador" label="Operador Responsável" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="horasUtilizacao" label="Horas de Utilização" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} max={24} /></Form.Item></Col>
            <Col span={12}><Form.Item name="situacao" label="Situação" rules={[{ required: true }]}><Input placeholder="Bom estado, Manutenção..." /></Form.Item></Col>
          </Row>
          <Form.Item name="observacoes" label="Observações"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Modal Ocorrência */}
      <Modal title="Adicionar Ocorrência" open={modalKey === 'ocorrencia'} onOk={handleSubSave} onCancel={closeModal} okText="Adicionar" cancelText="Cancelar">
        <Form form={subForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="tipo" label="Tipo de Ocorrência" rules={[{ required: true }]}>
            <Select options={[
              { value: 'Problema', label: 'Problema encontrado' },
              { value: 'Atraso', label: 'Atraso' },
              { value: 'Material', label: 'Falta de material' },
              { value: 'Interferência', label: 'Interferência externa' },
              { value: 'Solicitação', label: 'Solicitação do cliente' },
              { value: 'Alteração', label: 'Alteração de projeto' },
              { value: 'Decisão', label: 'Decisão em reunião' },
              { value: 'Pendência', label: 'Pendência' },
              { value: 'Outro', label: 'Outro' },
            ]} />
          </Form.Item>
          <Form.Item name="descricao" label="Descrição" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      {/* Modal Importar Segurança */}
      <Modal
        title="Importar Ocorrências de Segurança"
        open={segurancaModal}
        onOk={importSeguranca}
        onCancel={() => { setSegurancaModal(false); setSelectedSeg([]); }}
        okText="Importar selecionados"
        cancelText="Cancelar"
        width={640}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Selecione as ocorrências de segurança que deseja vincular a este diário.
        </Text>
        {acidentes.length === 0 && incidentes.length === 0 ? (
          <Alert message="Nenhuma ocorrência de segurança registrada." type="info" showIcon />
        ) : (
          <div>
            {acidentes.length > 0 && (
              <>
                <Divider style={{ margin: '8px 0' }} plain>Acidentes de Trabalho</Divider>
                {acidentes.map((a) => (
                  <div key={a.id} style={{ marginBottom: 8, padding: '8px 12px', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                    <Checkbox
                      checked={selectedSeg.includes(`ac-${a.id}`)}
                      onChange={(e) => setSelectedSeg((p) => e.target.checked ? [...p, `ac-${a.id}`] : p.filter((x) => x !== `ac-${a.id}`))}
                    >
                      <Space>
                        <Tag color="red">{a.gravidade}</Tag>
                        <Text>{a.funcionario} — {a.descricao.slice(0, 80)}...</Text>
                      </Space>
                    </Checkbox>
                  </div>
                ))}
              </>
            )}
            {incidentes.length > 0 && (
              <>
                <Divider style={{ margin: '8px 0' }} plain>Incidentes</Divider>
                {incidentes.map((i) => (
                  <div key={i.id} style={{ marginBottom: 8, padding: '8px 12px', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                    <Checkbox
                      checked={selectedSeg.includes(`in-${i.id}`)}
                      onChange={(e) => setSelectedSeg((p) => e.target.checked ? [...p, `in-${i.id}`] : p.filter((x) => x !== `in-${i.id}`))}
                    >
                      <Text>{i.descricao.slice(0, 100)}</Text>
                    </Checkbox>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
