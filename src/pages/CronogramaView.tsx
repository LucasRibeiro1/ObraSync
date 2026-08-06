import { useRef, useState } from 'react';
import {
  Card, Row, Col, Statistic, Typography, Button, Tag, Space, Tabs, Progress,
  Drawer, Descriptions, Table, Badge, Alert, Tooltip, Popconfirm, Timeline,
  Form, Input, Select, DatePicker, InputNumber, Modal, message,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, TeamOutlined, InboxOutlined, ToolOutlined,
  CalendarOutlined, DollarOutlined, SafetyOutlined, WarningOutlined,
  CheckCircleOutlined, ClockCircleOutlined, FilePdfOutlined,
  PlusOutlined, DeleteOutlined, LinkOutlined, SaveOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useCronogramaStore, useSegurancaStore } from '../store';
import type {
  ProcessoCronograma, StatusProcesso, FaseCronograma,
  MembroEquipeCronograma, MaterialCronograma, FerramentaCronograma,
  VinculoSeguranca, CronogramaObra,
} from '../types';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { Title, Text } = Typography;

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function fmt(n: number) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }

const statusLabel: Record<StatusProcesso, string> = {
  nao_iniciado: 'Não Iniciado', em_andamento: 'Em Andamento',
  concluido: 'Concluído', atrasado: 'Atrasado', paralisado: 'Paralisado',
};
const statusColor: Record<StatusProcesso, string> = {
  nao_iniciado: '#d9d9d9', em_andamento: '#1a56db',
  concluido: '#52c41a', atrasado: '#f5222d', paralisado: '#faad14',
};
const statusTagColor: Record<StatusProcesso, string> = {
  nao_iniciado: 'default', em_andamento: 'processing',
  concluido: 'success', atrasado: 'error', paralisado: 'warning',
};
const faseLabel: Record<FaseCronograma, string> = { inicio: 'Início', meio: 'Meio', fim: 'Fim' };
const faseColor: Record<FaseCronograma, string> = { inicio: '#722ed1', meio: '#1a56db', fim: '#52c41a' };
const tipoSegColor: Record<string, string> = { acidente: 'red', incidente: 'orange', acao_preventiva: 'green', relato: 'blue' };
const tipoSegLabel: Record<string, string> = { acidente: 'Acidente', incidente: 'Incidente', acao_preventiva: 'Ação Preventiva', relato: 'Relato' };

function orcTotal(p: ProcessoCronograma, campo: 'Previsto' | 'Executado') {
  const o = p.orcamento;
  return campo === 'Previsto'
    ? o.maoDeObraPrevista + o.materiaisPrevisto + o.equipamentosPrevisto + o.outrosPrevisto
    : o.maoDeObraExecutada + o.materiaisExecutado + o.equipamentosExecutado + o.outrosExecutado;
}

// ── Gantt ─────────────────────────────────────────────────────────────────────

function GanttTimeline({ processos, projetoInicio, projetoFim }: {
  processos: ProcessoCronograma[];
  projetoInicio: string;
  projetoFim: string;
}) {
  const start = dayjs(projetoInicio);
  const end = dayjs(projetoFim);
  const totalDays = end.diff(start, 'day');

  const months: dayjs.Dayjs[] = [];
  let cur = start.startOf('month');
  while (cur.isBefore(end) || cur.isSame(end, 'month')) { months.push(cur); cur = cur.add(1, 'month'); }

  function bar(a: string, b: string) {
    const s = Math.max(0, dayjs(a).diff(start, 'day'));
    const e = Math.min(totalDays, dayjs(b).diff(start, 'day'));
    return { left: `${(s / totalDays) * 100}%`, width: `${Math.max(0.5, ((e - s) / totalDays) * 100)}%` };
  }

  return (
    <Card bordered={false} style={{ borderRadius: 12, marginBottom: 16 }} title={<Space><CalendarOutlined />Linha do Tempo</Space>}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 640 }}>
          <div style={{ display: 'flex', position: 'relative', height: 28, marginBottom: 4, paddingLeft: 160 }}>
            {months.map((m, i) => (
              <div key={i} style={{ position: 'absolute', left: `calc(160px + ${(m.diff(start, 'day') / totalDays) * 100}%)`, fontSize: 10, color: '#8c8c8c', whiteSpace: 'nowrap' }}>
                {m.format('MMM/YY')}
              </div>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            {processos.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ width: 150, flexShrink: 0, paddingRight: 8 }}>
                  <Text style={{ fontSize: 11 }} ellipsis>{p.nome}</Text>
                </div>
                <div style={{ flex: 1, position: 'relative', height: 18, background: '#f5f5f5', borderRadius: 4 }}>
                  <div style={{ position: 'absolute', height: '100%', borderRadius: 4, border: `2px ${p.dataInicioReal ? 'solid' : 'dashed'} ${statusColor[p.status]}`, opacity: 0.45, boxSizing: 'border-box', ...bar(p.dataInicioProgramada, p.dataFimProgramada) }} />
                  {p.dataInicioReal && (
                    <div style={{ position: 'absolute', height: '60%', top: '20%', borderRadius: 4, backgroundColor: statusColor[p.status], ...bar(p.dataInicioReal, p.dataFimReal ?? dayjs().format('YYYY-MM-DD')) }} />
                  )}
                </div>
                <div style={{ width: 36, textAlign: 'right', flexShrink: 0 }}><Text style={{ fontSize: 10 }}>{p.percentualConcluido}%</Text></div>
              </div>
            ))}
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: 1, background: '#f5222d', opacity: 0.6, left: `calc(160px + ${Math.min(100, (dayjs().diff(start, 'day') / totalDays) * 100)}%)`, pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Space size={4}><div style={{ width: 20, height: 4, border: '2px dashed #888', borderRadius: 2 }} /><Text style={{ fontSize: 11 }}>Planejado</Text></Space>
        <Space size={4}><div style={{ width: 20, height: 8, background: '#1a56db', borderRadius: 2 }} /><Text style={{ fontSize: 11 }}>Executado</Text></Space>
        <Space size={4}><div style={{ width: 2, height: 14, background: '#f5222d' }} /><Text style={{ fontSize: 11 }}>Hoje</Text></Space>
      </div>
    </Card>
  );
}

// ── ProcessoDrawer ─────────────────────────────────────────────────────────────

function ProcessoDrawer({ processo: initialProcesso, onClose, onUpdate }: {
  processo: ProcessoCronograma;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<ProcessoCronograma>) => void;
}) {
  const { acidentes, incidentes, acoesPreventivas, relatos } = useSegurancaStore();
  const [processo, setProcesso] = useState<ProcessoCronograma>(initialProcesso);

  // ── state dos modais internos ──────────────────────────────────────────────
  const [equipeModal, setEquipeModal] = useState(false);
  const [editingMembro, setEditingMembro] = useState<MembroEquipeCronograma | null>(null);
  const [equipeForm] = Form.useForm();

  const [matModal, setMatModal] = useState(false);
  const [editingMat, setEditingMat] = useState<MaterialCronograma | null>(null);
  const [matForm] = Form.useForm();

  const [ferrModal, setFerrModal] = useState(false);
  const [editingFerr, setEditingFerr] = useState<FerramentaCronograma | null>(null);
  const [ferrForm] = Form.useForm();

  const [vincModal, setVincModal] = useState(false);
  const [vincForm] = Form.useForm();

  const [orcForm] = Form.useForm();
  const [geralForm] = Form.useForm();
  const [editingGeral, setEditingGeral] = useState(false);

  // ── helper de update ───────────────────────────────────────────────────────
  function applyUpdate(data: Partial<ProcessoCronograma>) {
    const updated = { ...processo, ...data, atualizadoEm: new Date().toISOString() };
    setProcesso(updated);
    onUpdate(processo.id, data);
  }

  // ── Geral ──────────────────────────────────────────────────────────────────
  const diasPlanejados = dayjs(processo.dataFimProgramada).diff(dayjs(processo.dataInicioProgramada), 'day');
  const diasReais = processo.dataInicioReal
    ? dayjs(processo.dataFimReal ?? dayjs()).diff(dayjs(processo.dataInicioReal), 'day')
    : null;

  function openEditGeral() {
    geralForm.setFieldsValue({
      responsavel: processo.responsavel,
      percentualConcluido: processo.percentualConcluido,
      status: processo.status,
      dataInicioReal: processo.dataInicioReal ? dayjs(processo.dataInicioReal) : null,
      dataFimReal: processo.dataFimReal ? dayjs(processo.dataFimReal) : null,
      observacoes: processo.observacoes,
    });
    setEditingGeral(true);
  }

  function saveGeral() {
    geralForm.validateFields().then((vals) => {
      applyUpdate({
        responsavel: vals.responsavel,
        percentualConcluido: vals.percentualConcluido,
        status: vals.status,
        dataInicioReal: vals.dataInicioReal?.format('YYYY-MM-DD'),
        dataFimReal: vals.dataFimReal?.format('YYYY-MM-DD'),
        observacoes: vals.observacoes,
      });
      setEditingGeral(false);
      message.success('Informações gerais atualizadas!');
    });
  }

  // ── Equipe ─────────────────────────────────────────────────────────────────
  function openAddEquipe() { setEditingMembro(null); equipeForm.resetFields(); setEquipeModal(true); }
  function openEditEquipe(m: MembroEquipeCronograma) { setEditingMembro(m); equipeForm.setFieldsValue(m); setEquipeModal(true); }

  function saveEquipe() {
    equipeForm.validateFields().then((vals) => {
      const novo: MembroEquipeCronograma = { id: editingMembro?.id ?? uid(), ...vals };
      const equipe = editingMembro
        ? processo.equipe.map((e) => (e.id === editingMembro.id ? novo : e))
        : [...processo.equipe, novo];
      applyUpdate({ equipe });
      setEquipeModal(false);
      message.success(editingMembro ? 'Membro atualizado!' : 'Membro adicionado!');
    });
  }

  function removeEquipe(id: string) {
    applyUpdate({ equipe: processo.equipe.filter((e) => e.id !== id) });
    message.success('Membro removido.');
  }

  // ── Materiais ──────────────────────────────────────────────────────────────
  function openAddMat() { setEditingMat(null); matForm.resetFields(); setMatModal(true); }
  function openEditMat(m: MaterialCronograma) { setEditingMat(m); matForm.setFieldsValue(m); setMatModal(true); }

  function saveMat() {
    matForm.validateFields().then((vals) => {
      const novo: MaterialCronograma = { id: editingMat?.id ?? uid(), quantidadeUtilizada: 0, valorUnitarioReal: 0, ...vals };
      const materiais = editingMat
        ? processo.materiais.map((m) => (m.id === editingMat.id ? novo : m))
        : [...processo.materiais, novo];
      applyUpdate({ materiais });
      setMatModal(false);
      message.success(editingMat ? 'Material atualizado!' : 'Material adicionado!');
    });
  }

  function removeMat(id: string) {
    applyUpdate({ materiais: processo.materiais.filter((m) => m.id !== id) });
    message.success('Material removido.');
  }

  // ── Ferramentas ─────────────────────────────────────────────────────────────
  function openAddFerr() { setEditingFerr(null); ferrForm.resetFields(); setFerrModal(true); }
  function openEditFerr(f: FerramentaCronograma) { setEditingFerr(f); ferrForm.setFieldsValue(f); setFerrModal(true); }

  function saveFerr() {
    ferrForm.validateFields().then((vals) => {
      const novo: FerramentaCronograma = { id: editingFerr?.id ?? uid(), horasReais: 0, custoReal: 0, ...vals };
      const ferramentas = editingFerr
        ? processo.ferramentas.map((f) => (f.id === editingFerr.id ? novo : f))
        : [...processo.ferramentas, novo];
      applyUpdate({ ferramentas });
      setFerrModal(false);
      message.success(editingFerr ? 'Ferramenta atualizada!' : 'Ferramenta adicionada!');
    });
  }

  function removeFerr(id: string) {
    applyUpdate({ ferramentas: processo.ferramentas.filter((f) => f.id !== id) });
    message.success('Ferramenta removida.');
  }

  // ── Orçamento ──────────────────────────────────────────────────────────────
  function saveOrcamento() {
    orcForm.validateFields().then((vals) => {
      applyUpdate({ orcamento: { ...vals } });
      message.success('Orçamento atualizado!');
    });
  }

  // ── Vínculos de segurança ──────────────────────────────────────────────────
  function saveVinculo() {
    vincForm.validateFields().then((vals) => {
      const label = vals.tipo === 'acidente' ? acidentes.find((a) => a.id === vals.referenciaId)?.descricao
        : vals.tipo === 'incidente' ? incidentes.find((i) => i.id === vals.referenciaId)?.descricao
        : vals.tipo === 'acao_preventiva' ? acoesPreventivas.find((a) => a.id === vals.referenciaId)?.descricao
        : relatos.find((r) => r.id === vals.referenciaId)?.relato ?? '';
      const novo: VinculoSeguranca = { tipo: vals.tipo, referenciaId: vals.referenciaId, descricao: vals.descricao || label?.slice(0, 100) || '' };
      applyUpdate({ vinculosSeguranca: [...processo.vinculosSeguranca, novo] });
      setVincModal(false);
      vincForm.resetFields();
      message.success('Ocorrência vinculada!');
    });
  }

  function removeVinculo(i: number) {
    applyUpdate({ vinculosSeguranca: processo.vinculosSeguranca.filter((_, idx) => idx !== i) });
    message.success('Vínculo removido.');
  }

  const segOpcoes = (tipo: string) => {
    if (tipo === 'acidente') return acidentes.map((a) => ({ value: a.id, label: `${dayjs(a.data).format('DD/MM/YY')} — ${a.funcionario}: ${a.descricao.slice(0, 60)}` }));
    if (tipo === 'incidente') return incidentes.map((i) => ({ value: i.id, label: `${dayjs(i.data).format('DD/MM/YY')} — ${i.descricao.slice(0, 60)}` }));
    if (tipo === 'acao_preventiva') return acoesPreventivas.map((a) => ({ value: a.id, label: `${dayjs(a.data).format('DD/MM/YY')} — ${a.descricao.slice(0, 60)}` }));
    return relatos.map((r) => ({ value: r.id, label: `${dayjs(r.data).format('DD/MM/YY')} — ${r.relato.slice(0, 60)}` }));
  };

  const [vincTipo, setVincTipo] = useState<string>('acidente');

  // ── Colunas das tabelas ────────────────────────────────────────────────────
  const equipeColumns = [
    { title: 'Nome', dataIndex: 'nome', key: 'nome' },
    { title: 'Função', dataIndex: 'funcao', key: 'funcao', responsive: ['sm'] as ('sm')[] },
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa', responsive: ['md'] as ('md')[] },
    { title: 'H. Prev.', dataIndex: 'horasPrevistas', key: 'hp', width: 75, render: (v: number) => `${v}h` },
    {
      title: 'H. Reais', dataIndex: 'horasReais', key: 'hr', width: 75,
      render: (v: number, r: MembroEquipeCronograma) => v > 0
        ? <Text type={v > r.horasPrevistas ? 'danger' : 'success'}>{v}h</Text>
        : <Text type="secondary">—</Text>,
    },
    {
      title: '', key: 'act', width: 70,
      render: (_: unknown, r: MembroEquipeCronograma) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditEquipe(r)} />
          <Popconfirm title="Remover?" onConfirm={() => removeEquipe(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const matColumns = [
    { title: 'Material', dataIndex: 'nome', key: 'nome', ellipsis: true },
    { title: 'Un.', dataIndex: 'unidade', key: 'un', width: 50 },
    { title: 'Qtd Prev.', dataIndex: 'quantidadePrevista', key: 'qp', width: 85 },
    { title: 'Qtd Real', dataIndex: 'quantidadeUtilizada', key: 'qr', width: 85, render: (v: number, r: MaterialCronograma) => v > 0 ? <Text type={v > r.quantidadePrevista ? 'danger' : 'success'}>{v}</Text> : '—' },
    { title: 'V. Unit.', dataIndex: 'valorUnitarioPrevisto', key: 'vup', width: 90, responsive: ['md'] as ('md')[], render: (v: number) => fmt(v) },
    { title: 'Fornecedor', dataIndex: 'fornecedor', key: 'forn', responsive: ['lg'] as ('lg')[], ellipsis: true },
    {
      title: 'Aquisição', dataIndex: 'statusAquisicao', key: 'sta', width: 100,
      render: (v: string) => {
        const c: Record<string, string> = { pendente: 'default', adquirido: 'blue', entregue: 'cyan', utilizado: 'success' };
        const l: Record<string, string> = { pendente: 'Pendente', adquirido: 'Adquirido', entregue: 'Entregue', utilizado: 'Utilizado' };
        return <Tag color={c[v]}>{l[v]}</Tag>;
      },
    },
    {
      title: '', key: 'act', width: 70,
      render: (_: unknown, r: MaterialCronograma) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditMat(r)} />
          <Popconfirm title="Remover?" onConfirm={() => removeMat(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const ferrColumns = [
    { title: 'Nome', dataIndex: 'nome', key: 'nome', ellipsis: true },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 110, responsive: ['sm'] as ('sm')[], render: (v: string) => { const l: Record<string, string> = { ferramenta_manual: 'Manual', equipamento_eletrico: 'Elétrico', maquinario: 'Maquinário', veiculo: 'Veículo' }; return <Tag>{l[v] ?? v}</Tag>; } },
    { title: 'Responsável', dataIndex: 'responsavel', key: 'resp', responsive: ['md'] as ('md')[] },
    { title: 'Próprio', dataIndex: 'proprio', key: 'prop', width: 80, render: (v: boolean) => <Badge status={v ? 'success' : 'warning'} text={v ? 'Próprio' : 'Locado'} /> },
    { title: 'H. Prev.', dataIndex: 'horasPrevistas', key: 'hp', width: 75, render: (v: number) => `${v}h` },
    { title: 'Custo Est.', dataIndex: 'custoEstimado', key: 'ce', width: 100, responsive: ['md'] as ('md')[], render: (v: number) => v > 0 ? fmt(v) : '—' },
    {
      title: '', key: 'act', width: 70,
      render: (_: unknown, r: FerramentaCronograma) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditFerr(r)} />
          <Popconfirm title="Remover?" onConfirm={() => removeFerr(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const previsto = orcTotal(processo, 'Previsto');
  const executado = orcTotal(processo, 'Executado');

  // ── Abas do drawer ─────────────────────────────────────────────────────────
  const drawerTabs = [
    {
      key: 'geral',
      label: <Space><CalendarOutlined />Geral</Space>,
      children: editingGeral ? (
        <Form form={geralForm} layout="vertical">
          <Row gutter={12}>
            <Col xs={24} sm={12}><Form.Item name="responsavel" label="Responsável" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} sm={6}><Form.Item name="status" label="Status"><Select options={Object.entries(statusLabel).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
            <Col xs={24} sm={6}><Form.Item name="percentualConcluido" label="% Concluído"><InputNumber style={{ width: '100%' }} min={0} max={100} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={6}><Form.Item name="dataInicioReal" label="Início Real"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
            <Col xs={24} sm={6}><Form.Item name="dataFimReal" label="Fim Real"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
          </Row>
          <Form.Item name="observacoes" label="Observações"><Input.TextArea rows={2} /></Form.Item>
          <Space>
            <Button type="primary" icon={<SaveOutlined />} onClick={saveGeral}>Salvar</Button>
            <Button onClick={() => setEditingGeral(false)}>Cancelar</Button>
          </Space>
        </Form>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button icon={<EditOutlined />} onClick={openEditGeral}>Editar</Button>
          </div>
          <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Fase"><Tag color={faseColor[processo.fase]}>{faseLabel[processo.fase]}</Tag></Descriptions.Item>
            <Descriptions.Item label="Status"><Tag color={statusTagColor[processo.status]}>{statusLabel[processo.status]}</Tag></Descriptions.Item>
            <Descriptions.Item label="Responsável">{processo.responsavel}</Descriptions.Item>
            <Descriptions.Item label="% Concluído"><Progress percent={processo.percentualConcluido} size="small" /></Descriptions.Item>
            <Descriptions.Item label="Início Programado">{dayjs(processo.dataInicioProgramada).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Fim Programado">{dayjs(processo.dataFimProgramada).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Início Real">{processo.dataInicioReal ? dayjs(processo.dataInicioReal).format('DD/MM/YYYY') : '—'}</Descriptions.Item>
            <Descriptions.Item label="Fim Real">{processo.dataFimReal ? dayjs(processo.dataFimReal).format('DD/MM/YYYY') : '—'}</Descriptions.Item>
            <Descriptions.Item label="Prazo Planejado">{diasPlanejados} dias</Descriptions.Item>
            <Descriptions.Item label="Prazo Real">
              {diasReais !== null
                ? <Text type={diasReais > diasPlanejados ? 'danger' : 'success'}>{diasReais} dias {diasReais > diasPlanejados ? `(+${diasReais - diasPlanejados}d de atraso)` : '(no prazo)'}</Text>
                : '—'}
            </Descriptions.Item>
          </Descriptions>
          {processo.descricao && <Card size="small" title="Descrição" style={{ marginBottom: 12 }}><Text>{processo.descricao}</Text></Card>}
          {processo.observacoes && <Alert message="Observações" description={processo.observacoes} type="info" showIcon />}
        </div>
      ),
    },
    {
      key: 'equipe',
      label: <Space><TeamOutlined />Equipe ({processo.equipe.length})</Space>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddEquipe}>Adicionar Membro</Button>
          </div>
          {processo.equipe.length === 0
            ? <Alert message="Nenhum membro cadastrado." type="info" showIcon />
            : (
              <>
                <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                  <Col xs={12} sm={6}><Statistic title="Membros" value={processo.equipe.length} /></Col>
                  <Col xs={12} sm={6}><Statistic title="H. Previstas" value={processo.equipe.reduce((s, e) => s + e.horasPrevistas, 0)} suffix="h" /></Col>
                  <Col xs={12} sm={6}><Statistic title="H. Reais" value={processo.equipe.reduce((s, e) => s + e.horasReais, 0)} suffix="h" /></Col>
                </Row>
                <Table dataSource={processo.equipe.map((e) => ({ ...e, key: e.id }))} columns={equipeColumns} size="small" pagination={false} scroll={{ x: 'max-content' }} />
              </>
            )}
        </div>
      ),
    },
    {
      key: 'materiais',
      label: <Space><InboxOutlined />Materiais ({processo.materiais.length})</Space>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddMat}>Adicionar Material</Button>
          </div>
          {processo.materiais.length === 0
            ? <Alert message="Nenhum material cadastrado." type="info" showIcon />
            : (
              <>
                <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                  <Col xs={24} sm={8}><Statistic title="Mat. Previsto" value={processo.orcamento.materiaisPrevisto} prefix="R$" formatter={(v) => Number(v).toLocaleString('pt-BR')} /></Col>
                  <Col xs={24} sm={8}><Statistic title="Mat. Executado" value={processo.orcamento.materiaisExecutado} prefix="R$" formatter={(v) => Number(v).toLocaleString('pt-BR')} valueStyle={{ color: processo.orcamento.materiaisExecutado > processo.orcamento.materiaisPrevisto ? '#f5222d' : '#52c41a' }} /></Col>
                </Row>
                <Table dataSource={processo.materiais.map((m) => ({ ...m, key: m.id }))} columns={matColumns} size="small" pagination={false} scroll={{ x: 700 }} />
              </>
            )}
        </div>
      ),
    },
    {
      key: 'ferramentas',
      label: <Space><ToolOutlined />Ferramentas ({processo.ferramentas.length})</Space>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddFerr}>Adicionar Ferramenta</Button>
          </div>
          {processo.ferramentas.length === 0
            ? <Alert message="Nenhuma ferramenta cadastrada." type="info" showIcon />
            : <Table dataSource={processo.ferramentas.map((f) => ({ ...f, key: f.id }))} columns={ferrColumns} size="small" pagination={false} scroll={{ x: 700 }} />}
        </div>
      ),
    },
    {
      key: 'orcamento',
      label: <Space><DollarOutlined />Orçamento</Space>,
      children: (
        <div>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={6}><Statistic title="Total Previsto" value={previsto} prefix="R$" formatter={(v) => Number(v).toLocaleString('pt-BR')} /></Col>
            <Col xs={12} sm={6}><Statistic title="Total Executado" value={executado} prefix="R$" formatter={(v) => Number(v).toLocaleString('pt-BR')} valueStyle={{ color: executado > previsto ? '#f5222d' : '#52c41a' }} /></Col>
            <Col xs={12} sm={6}><Statistic title="Variação" value={Math.abs(executado - previsto)} prefix={executado > previsto ? '+R$' : '-R$'} formatter={(v) => Number(v).toLocaleString('pt-BR')} valueStyle={{ color: executado > previsto ? '#f5222d' : '#52c41a' }} /></Col>
            <Col xs={12} sm={6}><Statistic title="% Consumido" value={previsto > 0 ? Math.round((executado / previsto) * 100) : 0} suffix="%" valueStyle={{ color: executado > previsto ? '#f5222d' : '#1a56db' }} /></Col>
          </Row>
          <Form
            form={orcForm}
            layout="vertical"
            initialValues={processo.orcamento}
            onFinish={saveOrcamento}
          >
            <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 16px', marginBottom: 12 }}>
              <Row gutter={12}>
                {[
                  { prevKey: 'maoDeObraPrevista', execKey: 'maoDeObraExecutada', label: 'Mão de Obra' },
                  { prevKey: 'materiaisPrevisto', execKey: 'materiaisExecutado', label: 'Materiais' },
                  { prevKey: 'equipamentosPrevisto', execKey: 'equipamentosExecutado', label: 'Equipamentos' },
                  { prevKey: 'outrosPrevisto', execKey: 'outrosExecutado', label: 'Outros' },
                ].map(({ prevKey, execKey, label }) => (
                  <>
                    <Col xs={12} sm={3} key={prevKey}>
                      <Form.Item name={prevKey} label={`${label} Prev. (R$)`}>
                        <InputNumber style={{ width: '100%' }} min={0} step={500} size="small" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={3} key={execKey}>
                      <Form.Item name={execKey} label={`${label} Real (R$)`}>
                        <InputNumber style={{ width: '100%' }} min={0} step={500} size="small" />
                      </Form.Item>
                    </Col>
                  </>
                ))}
              </Row>
            </div>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Salvar Orçamento</Button>
          </Form>
        </div>
      ),
    },
    {
      key: 'seguranca',
      label: <Space><SafetyOutlined />Segurança ({processo.vinculosSeguranca.length})</Space>,
      children: (
        <div>
          {/* Requisitos editáveis */}
          <Card size="small" title="Requisitos de Segurança (EPIs / NRs)" style={{ marginBottom: 16 }}>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              value={processo.requisitosSafety}
              onChange={(vals) => applyUpdate({ requisitosSafety: vals })}
              placeholder="Digite e pressione Enter para adicionar: NR-35, EPI capacete, etc."
            />
            {processo.requisitosSafety.length > 0 && (
              <Timeline style={{ marginTop: 12 }} items={processo.requisitosSafety.map((r) => ({ color: 'blue', children: <Text style={{ fontSize: 13 }}>{r}</Text> }))} />
            )}
          </Card>

          {/* Vínculos com ocorrências */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>Ocorrências vinculadas</Text>
            <Button icon={<LinkOutlined />} onClick={() => { vincForm.resetFields(); setVincTipo('acidente'); setVincModal(true); }}>
              Vincular Ocorrência
            </Button>
          </div>
          {processo.vinculosSeguranca.length === 0
            ? <Alert message="Nenhuma ocorrência vinculada." type="info" showIcon />
            : processo.vinculosSeguranca.map((v, i) => (
              <div key={i} style={{ padding: '10px 16px', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 8, borderLeft: `4px solid ${tipoSegColor[v.tipo]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Space><Tag color={tipoSegColor[v.tipo]}>{tipoSegLabel[v.tipo]}</Tag></Space>
                  <br />
                  <Text style={{ fontSize: 13 }}>{v.descricao}</Text>
                </div>
                <Popconfirm title="Remover vínculo?" onConfirm={() => removeVinculo(i)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={
          <Space>
            <Tag color={faseColor[processo.fase]}>{faseLabel[processo.fase]}</Tag>
            <span>{processo.nome}</span>
            <Tag color={statusTagColor[processo.status]}>{statusLabel[processo.status]}</Tag>
          </Space>
        }
        open
        onClose={onClose}
        width={760}
        styles={{ body: { padding: '12px 24px' } }}
        extra={
          <Space>
            <Progress type="circle" percent={processo.percentualConcluido} size={40} strokeColor={statusColor[processo.status]} />
            <Select
              size="small"
              value={processo.status}
              style={{ width: 140 }}
              onChange={(val) => applyUpdate({ status: val as StatusProcesso })}
              options={Object.entries(statusLabel).map(([v, l]) => ({ value: v, label: l }))}
            />
          </Space>
        }
      >
        <Tabs items={drawerTabs} />
      </Drawer>

      {/* Modal Equipe */}
      <Modal title={editingMembro ? 'Editar Membro' : 'Adicionar Membro'} open={equipeModal} onOk={saveEquipe} onCancel={() => setEquipeModal(false)} okText="Salvar" cancelText="Cancelar" style={{ maxWidth: '95vw' }}>
        <Form form={equipeForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="nome" label="Nome" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col xs={24} sm={12}><Form.Item name="funcao" label="Função/Cargo" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="empresa" label="Empresa" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={12}><Form.Item name="horasPrevistas" label="Horas Previstas" initialValue={0}><InputNumber style={{ width: '100%' }} min={0} suffix="h" /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="horasReais" label="Horas Reais" initialValue={0}><InputNumber style={{ width: '100%' }} min={0} suffix="h" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal Material */}
      <Modal title={editingMat ? 'Editar Material' : 'Adicionar Material'} open={matModal} onOk={saveMat} onCancel={() => setMatModal(false)} okText="Salvar" cancelText="Cancelar" width={600} style={{ maxWidth: '95vw' }}>
        <Form form={matForm} layout="vertical" style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col xs={24} sm={16}><Form.Item name="nome" label="Material" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item name="unidade" label="Unidade" rules={[{ required: true }]}><Input placeholder="m², kg, saco…" /></Form.Item></Col>
          </Row>
          <Form.Item name="especificacao" label="Especificação"><Input placeholder="Marca, dimensão, norma técnica…" /></Form.Item>
          <Row gutter={12}>
            <Col xs={12} sm={6}><Form.Item name="quantidadePrevista" label="Qtd Prev." initialValue={0} rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col xs={12} sm={6}><Form.Item name="quantidadeUtilizada" label="Qtd Real" initialValue={0}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col xs={12} sm={6}><Form.Item name="valorUnitarioPrevisto" label="V. Unit. Prev." initialValue={0} rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} prefix="R$" /></Form.Item></Col>
            <Col xs={12} sm={6}><Form.Item name="valorUnitarioReal" label="V. Unit. Real" initialValue={0}><InputNumber style={{ width: '100%' }} min={0} prefix="R$" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={12}><Form.Item name="fornecedor" label="Fornecedor"><Input /></Form.Item></Col>
            <Col xs={24} sm={12}>
              <Form.Item name="statusAquisicao" label="Status de Aquisição" initialValue="pendente">
                <Select options={[{ value: 'pendente', label: 'Pendente' }, { value: 'adquirido', label: 'Adquirido' }, { value: 'entregue', label: 'Entregue' }, { value: 'utilizado', label: 'Utilizado' }]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal Ferramenta */}
      <Modal title={editingFerr ? 'Editar Ferramenta' : 'Adicionar Ferramenta'} open={ferrModal} onOk={saveFerr} onCancel={() => setFerrModal(false)} okText="Salvar" cancelText="Cancelar" width={600} style={{ maxWidth: '95vw' }}>
        <Form form={ferrForm} layout="vertical" style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col xs={24} sm={16}><Form.Item name="nome" label="Nome" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} sm={8}>
              <Form.Item name="tipo" label="Tipo" initialValue="ferramenta_manual" rules={[{ required: true }]}>
                <Select options={[{ value: 'ferramenta_manual', label: 'Manual' }, { value: 'equipamento_eletrico', label: 'Elétrico' }, { value: 'maquinario', label: 'Maquinário' }, { value: 'veiculo', label: 'Veículo' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={12}><Form.Item name="especificacao" label="Especificação"><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="responsavel" label="Responsável"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col xs={12} sm={6}><Form.Item name="horasPrevistas" label="H. Previstas" initialValue={0}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col xs={12} sm={6}><Form.Item name="horasReais" label="H. Reais" initialValue={0}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col xs={12} sm={6}><Form.Item name="custoEstimado" label="Custo Est. (R$)" initialValue={0}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col xs={12} sm={6}><Form.Item name="custoReal" label="Custo Real (R$)" initialValue={0}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
          </Row>
          <Form.Item name="proprio" label="Propriedade" initialValue={true}>
            <Select options={[{ value: true, label: 'Próprio' }, { value: false, label: 'Locado' }]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Vínculo Segurança */}
      <Modal title="Vincular Ocorrência de Segurança" open={vincModal} onOk={saveVinculo} onCancel={() => setVincModal(false)} okText="Vincular" cancelText="Cancelar" style={{ maxWidth: '95vw' }}>
        <Form form={vincForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="tipo" label="Tipo de Ocorrência" initialValue="acidente" rules={[{ required: true }]}>
            <Select
              options={[{ value: 'acidente', label: 'Acidente de Trabalho' }, { value: 'incidente', label: 'Incidente (Quase-Acidente)' }, { value: 'acao_preventiva', label: 'Ação Preventiva' }, { value: 'relato', label: 'Relato de Segurança' }]}
              onChange={(v) => { setVincTipo(v); vincForm.setFieldValue('referenciaId', undefined); }}
            />
          </Form.Item>
          <Form.Item name="referenciaId" label="Ocorrência" rules={[{ required: true }]}>
            <Select options={segOpcoes(vincTipo)} showSearch placeholder="Selecione a ocorrência" />
          </Form.Item>
          <Form.Item name="descricao" label="Observação sobre o vínculo">
            <Input.TextArea rows={2} placeholder="Descreva como essa ocorrência se relaciona com este processo…" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// ── Relatório imprimível (PDF) ─────────────────────────────────────────────────

function PrintableRelatorio({ cronograma }: { cronograma: CronogramaObra }) {
  const processosPorFase = (fase: FaseCronograma) =>
    cronograma.processos.filter((p) => p.fase === fase).sort((a, b) => a.ordem - b.ordem);

  const orcPrev = cronograma.processos.reduce((s, p) => s + orcTotal(p, 'Previsto'), 0);
  const orcExec = cronograma.processos.reduce((s, p) => s + orcTotal(p, 'Executado'), 0);
  const progress = cronograma.processos.length
    ? Math.round(cronograma.processos.reduce((s, p) => s + p.percentualConcluido, 0) / cronograma.processos.length)
    : 0;

  const sectionStyle: React.CSSProperties = { marginBottom: 24 };
  const headerStyle: React.CSSProperties = { background: '#1a56db', color: '#fff', padding: '16px 24px', borderRadius: 8, marginBottom: 24 };
  const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' as const, fontSize: 11 };
  const thStyle: React.CSSProperties = { background: '#f0f0f0', padding: '6px 10px', textAlign: 'left', borderBottom: '2px solid #d9d9d9' };
  const tdStyle: React.CSSProperties = { padding: '5px 10px', borderBottom: '1px solid #f0f0f0' };

  const fases: FaseCronograma[] = ['inicio', 'meio', 'fim'];

  return (
    <div style={{ padding: 32, fontFamily: 'Inter, sans-serif', color: '#333' }}>
      {/* Cabeçalho */}
      <div style={headerStyle}>
        <div style={{ fontSize: 11, opacity: 0.8 }}>RELATÓRIO DE CRONOGRAMA DE OBRA — ObraSync</div>
        <div style={{ fontSize: 22, fontWeight: 700, margin: '6px 0 4px' }}>{cronograma.obraNome}</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          Responsável: {cronograma.responsavelGeral} &nbsp;|&nbsp;
          Período: {dayjs(cronograma.dataInicioProgramada).format('DD/MM/YYYY')} → {dayjs(cronograma.dataFimProgramada).format('DD/MM/YYYY')} &nbsp;|&nbsp;
          Emitido em: {dayjs().format('DD/MM/YYYY [às] HH:mm')}
        </div>
      </div>

      {/* Resumo */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, borderBottom: '2px solid #1a56db', paddingBottom: 4 }}>RESUMO EXECUTIVO</div>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, width: '25%' }}><strong>Total de Processos</strong></td>
              <td style={tdStyle}>{cronograma.processos.length}</td>
              <td style={{ ...tdStyle, width: '25%' }}><strong>Progresso Geral</strong></td>
              <td style={tdStyle}>{progress}%</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Concluídos</strong></td>
              <td style={tdStyle}>{cronograma.processos.filter((p) => p.status === 'concluido').length}</td>
              <td style={tdStyle}><strong>Em Andamento</strong></td>
              <td style={tdStyle}>{cronograma.processos.filter((p) => p.status === 'em_andamento').length}</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Orçamento Total</strong></td>
              <td style={tdStyle}>{fmt(cronograma.orcamentoTotal)}</td>
              <td style={tdStyle}><strong>Executado</strong></td>
              <td style={{ ...tdStyle, color: orcExec > cronograma.orcamentoTotal ? '#f5222d' : '#52c41a' }}>{fmt(orcExec)} ({cronograma.orcamentoTotal > 0 ? Math.round((orcExec / cronograma.orcamentoTotal) * 100) : 0}%)</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Atrasados</strong></td>
              <td style={{ ...tdStyle, color: cronograma.processos.some((p) => p.status === 'atrasado') ? '#f5222d' : '#333' }}>{cronograma.processos.filter((p) => p.status === 'atrasado').length}</td>
              <td style={tdStyle}><strong>Variação Orçamento</strong></td>
              <td style={{ ...tdStyle, color: orcExec > orcPrev ? '#f5222d' : '#52c41a' }}>{orcExec > orcPrev ? '+' : '-'}{fmt(Math.abs(orcExec - orcPrev))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Processos por fase */}
      {fases.map((fase) => {
        const procs = processosPorFase(fase);
        if (!procs.length) return null;
        return (
          <div key={fase} style={sectionStyle}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, borderBottom: `2px solid ${faseColor[fase]}`, paddingBottom: 4, color: faseColor[fase] }}>
              FASE {faseLabel[fase].toUpperCase()} ({procs.length} processo{procs.length > 1 ? 's' : ''})
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 30 }}>#</th>
                  <th style={thStyle}>Processo</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>%</th>
                  <th style={thStyle}>Início Prog.</th>
                  <th style={thStyle}>Fim Prog.</th>
                  <th style={thStyle}>Início Real</th>
                  <th style={thStyle}>Fim Real</th>
                  <th style={thStyle}>Prev. (R$)</th>
                  <th style={thStyle}>Exec. (R$)</th>
                  <th style={thStyle}>Equipe</th>
                  <th style={thStyle}>Seg.</th>
                </tr>
              </thead>
              <tbody>
                {procs.map((p) => {
                  const pv = orcTotal(p, 'Previsto');
                  const pe = orcTotal(p, 'Executado');
                  return (
                    <tr key={p.id} style={{ background: p.status === 'atrasado' ? '#fff1f0' : p.status === 'concluido' ? '#f6ffed' : 'white' }}>
                      <td style={tdStyle}>{p.ordem}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{p.nome}</td>
                      <td style={tdStyle}>{statusLabel[p.status]}</td>
                      <td style={tdStyle}>{p.percentualConcluido}%</td>
                      <td style={tdStyle}>{dayjs(p.dataInicioProgramada).format('DD/MM/YY')}</td>
                      <td style={tdStyle}>{dayjs(p.dataFimProgramada).format('DD/MM/YY')}</td>
                      <td style={tdStyle}>{p.dataInicioReal ? dayjs(p.dataInicioReal).format('DD/MM/YY') : '—'}</td>
                      <td style={tdStyle}>{p.dataFimReal ? dayjs(p.dataFimReal).format('DD/MM/YY') : p.dataInicioReal ? 'Em aberto' : '—'}</td>
                      <td style={tdStyle}>{pv > 0 ? fmt(pv) : '—'}</td>
                      <td style={{ ...tdStyle, color: pe > pv && pv > 0 ? '#f5222d' : pe > 0 ? '#52c41a' : '#333' }}>{pe > 0 ? fmt(pe) : '—'}</td>
                      <td style={tdStyle}>{p.equipe.length > 0 ? `${p.equipe.length} pessoa${p.equipe.length > 1 ? 's' : ''}` : '—'}</td>
                      <td style={tdStyle}>{p.vinculosSeguranca.length > 0 ? `${p.vinculosSeguranca.length} ocorrência${p.vinculosSeguranca.length > 1 ? 's' : ''}` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Segurança resumo */}
      {cronograma.processos.some((p) => p.vinculosSeguranca.length > 0) && (
        <div style={sectionStyle}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, borderBottom: '2px solid #f5222d', paddingBottom: 4, color: '#f5222d' }}>OCORRÊNCIAS DE SEGURANÇA POR PROCESSO</div>
          {cronograma.processos.filter((p) => p.vinculosSeguranca.length > 0).map((p) => (
            <div key={p.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{p.nome}</div>
              {p.vinculosSeguranca.map((v, i) => (
                <div key={i} style={{ fontSize: 11, padding: '3px 8px', borderLeft: '3px solid #f5222d', marginBottom: 3 }}>
                  [{tipoSegLabel[v.tipo]}] {v.descricao}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Rodapé */}
      <div style={{ borderTop: '1px solid #d9d9d9', paddingTop: 12, marginTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8c8c8c' }}>
        <span>ObraSync — Gestão de Obras &nbsp;|&nbsp; Relatório gerado em {dayjs().format('DD/MM/YYYY [às] HH:mm')}</span>
        <span>{cronograma.obraNome} &nbsp;|&nbsp; Responsável: {cronograma.responsavelGeral}</span>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function CronogramaView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cronogramas, updateProcesso } = useCronogramaStore();
  const [selectedProcesso, setSelectedProcesso] = useState<ProcessoCronograma | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const cronograma = cronogramas.find((c) => c.id === id);

  if (!cronograma) return <Alert message="Cronograma não encontrado" type="error" showIcon action={<Button onClick={() => navigate('/cronograma')}>Voltar</Button>} />;

  const processosPorFase = (fase: FaseCronograma) =>
    cronograma.processos.filter((p) => p.fase === fase).sort((a, b) => a.ordem - b.ordem);

  const totalProcessos = cronograma.processos.length;
  const concluidos = cronograma.processos.filter((p) => p.status === 'concluido').length;
  const emAndamento = cronograma.processos.filter((p) => p.status === 'em_andamento').length;
  const atrasados = cronograma.processos.filter((p) => p.status === 'atrasado').length;
  const progressoGeral = totalProcessos > 0 ? Math.round(cronograma.processos.reduce((s, p) => s + p.percentualConcluido, 0) / totalProcessos) : 0;
  const orcPrevisto = cronograma.processos.reduce((s, p) => s + orcTotal(p, 'Previsto'), 0);
  const orcExecutado = cronograma.processos.reduce((s, p) => s + orcTotal(p, 'Executado'), 0);

  async function handleExportPDF() {
    if (!printRef.current) return;
    setExportingPDF(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgH = pdfW * ratio;
      let pos = 0;
      let heightLeft = imgH;
      pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH);
      heightLeft -= pdfH;
      while (heightLeft > 0) {
        pos -= pdfH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH);
        heightLeft -= pdfH;
      }
      pdf.save(`Cronograma_${cronograma.obraNome.replace(/\s+/g, '_')}.pdf`);
      message.success('PDF exportado com sucesso!');
    } finally {
      setExportingPDF(false);
    }
  }

  function ProcessoCard({ p }: { p: ProcessoCronograma }) {
    const prev = orcTotal(p, 'Previsto');
    const exec = orcTotal(p, 'Executado');
    return (
      <Card
        bordered={false} size="small" hoverable
        style={{ borderRadius: 10, marginBottom: 12, borderLeft: `4px solid ${statusColor[p.status]}`, cursor: 'pointer' }}
        onClick={() => setSelectedProcesso(p)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <div>
            <Text strong>{p.ordem}. {p.nome}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {dayjs(p.dataInicioProgramada).format('DD/MM/YY')} → {dayjs(p.dataFimProgramada).format('DD/MM/YY')}
              {p.dataInicioReal && ` | Real: ${dayjs(p.dataInicioReal).format('DD/MM/YY')} → ${p.dataFimReal ? dayjs(p.dataFimReal).format('DD/MM/YY') : 'em aberto'}`}
            </Text>
          </div>
          <Tag color={statusTagColor[p.status]}>{statusLabel[p.status]}</Tag>
        </div>
        <Progress percent={p.percentualConcluido} size="small" strokeColor={statusColor[p.status]} style={{ marginBottom: 8 }} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Tooltip title="Equipe"><Space size={4}><TeamOutlined style={{ color: '#8c8c8c' }} /><Text style={{ fontSize: 11 }}>{p.equipe.length}</Text></Space></Tooltip>
          <Tooltip title="Materiais"><Space size={4}><InboxOutlined style={{ color: '#8c8c8c' }} /><Text style={{ fontSize: 11 }}>{p.materiais.length}</Text></Space></Tooltip>
          <Tooltip title="Ferramentas"><Space size={4}><ToolOutlined style={{ color: '#8c8c8c' }} /><Text style={{ fontSize: 11 }}>{p.ferramentas.length}</Text></Space></Tooltip>
          <Tooltip title="Segurança"><Space size={4}><SafetyOutlined style={{ color: p.vinculosSeguranca.length > 0 ? '#f5222d' : '#8c8c8c' }} /><Text style={{ fontSize: 11 }}>{p.vinculosSeguranca.length}</Text></Space></Tooltip>
          {prev > 0 && (
            <Tooltip title="Orçamento previsto × executado">
              <Space size={4}>
                <DollarOutlined style={{ color: '#8c8c8c' }} />
                <Text style={{ fontSize: 11 }}>
                  {fmt(prev)}{exec > 0 && <Text style={{ fontSize: 11 }} type={exec > prev ? 'danger' : 'success'}> / {fmt(exec)}</Text>}
                </Text>
              </Space>
            </Tooltip>
          )}
        </div>
      </Card>
    );
  }

  const faseTabs = (['inicio', 'meio', 'fim'] as FaseCronograma[]).map((fase) => {
    const procs = processosPorFase(fase);
    const concF = procs.filter((p) => p.status === 'concluido').length;
    return {
      key: fase,
      label: <Space><span style={{ color: faseColor[fase], fontWeight: 600 }}>{faseLabel[fase]}</span><Tag>{concF}/{procs.length}</Tag></Space>,
      children: procs.length === 0
        ? <Alert message={`Nenhum processo na fase ${faseLabel[fase]}.`} type="info" showIcon />
        : procs.map((p) => <ProcessoCard key={p.id} p={p} />),
    };
  });

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/cronograma')}>Voltar</Button>
          <Title level={3} style={{ margin: 0 }}>{cronograma.obraNome}</Title>
          <Text type="secondary">{cronograma.descricao}</Text>
        </div>
        <Space wrap>
          <Button icon={<FilePdfOutlined />} loading={exportingPDF} onClick={handleExportPDF}>Exportar PDF</Button>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/cronograma/${id}/editar`)}>Editar</Button>
        </Space>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Progresso Geral" value={progressoGeral} suffix="%" valueStyle={{ color: '#1a56db' }} />
            <Progress percent={progressoGeral} showInfo={false} strokeColor="#1a56db" size="small" style={{ marginTop: 4 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Concluídos" value={`${concluidos}/${totalProcessos}`} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Em Andamento" value={emAndamento} prefix={<ClockCircleOutlined style={{ color: '#1a56db' }} />} valueStyle={{ color: '#1a56db' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Atrasados" value={atrasados} prefix={<WarningOutlined style={{ color: '#f5222d' }} />} valueStyle={{ color: atrasados > 0 ? '#f5222d' : '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Orçamento Total" value={cronograma.orcamentoTotal} prefix="R$" formatter={(v) => Number(v).toLocaleString('pt-BR')} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Executado" value={orcExecutado} prefix="R$" formatter={(v) => Number(v).toLocaleString('pt-BR')} valueStyle={{ color: orcExecutado > cronograma.orcamentoTotal ? '#f5222d' : '#52c41a' }} />
            <Progress percent={cronograma.orcamentoTotal > 0 ? Math.round((orcExecutado / cronograma.orcamentoTotal) * 100) : 0} size="small" strokeColor={orcExecutado > cronograma.orcamentoTotal ? '#f5222d' : '#52c41a'} showInfo={false} style={{ marginTop: 4 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Período" value={`${dayjs(cronograma.dataInicioProgramada).format('DD/MM/YY')} → ${dayjs(cronograma.dataFimProgramada).format('DD/MM/YY')}`} valueStyle={{ fontSize: 14 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(cronograma.dataFimProgramada).diff(dayjs(), 'day')} dias restantes</Text>
          </Card>
        </Col>
      </Row>

      {/* Gantt */}
      <GanttTimeline processos={cronograma.processos} projetoInicio={cronograma.dataInicioProgramada} projetoFim={cronograma.dataFimProgramada} />

      {/* Processos por fase */}
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Tabs items={faseTabs} />
      </Card>

      {/* Drawer */}
      {selectedProcesso && (
        <ProcessoDrawer
          key={selectedProcesso.id}
          processo={selectedProcesso}
          onClose={() => setSelectedProcesso(null)}
          onUpdate={(pid, data) => {
            updateProcesso(cronograma.id, pid, data);
            setSelectedProcesso((prev) => prev ? { ...prev, ...data } : null);
          }}
        />
      )}

      {/* Div oculta para PDF */}
      <div style={{ position: 'absolute', left: -9999, top: 0, width: 1000, pointerEvents: 'none' }}>
        <div ref={printRef}>
          <PrintableRelatorio cronograma={cronograma} />
        </div>
      </div>
    </div>
  );
}
