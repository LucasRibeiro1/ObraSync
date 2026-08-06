import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User, DiarioObra, AcidenteTrabalho, Incidente,
  AcaoPreventiva, RelatoSeguranca, Obra,
  CronogramaObra, ProcessoCronograma,
  NotaFiscal,
} from '../types';

// ─── Mock Data ─────────────────────────────────────────────────────────────

const mockObras: Obra[] = [
  { id: '1', nome: 'Residencial Vista Verde', endereco: 'Rua das Flores, 100 - SP', responsavel: 'Eng. Carlos Mota', dataInicio: '2025-01-10', previsaoTermino: '2026-03-31', status: 'ativa' },
  { id: '2', nome: 'Comercial Centro Empresarial', endereco: 'Av. Paulista, 1500 - SP', responsavel: 'Eng. Ana Lima', dataInicio: '2025-03-01', previsaoTermino: '2026-08-30', status: 'ativa' },
  { id: '3', nome: 'Condomínio Solar das Palmeiras', endereco: 'Rua das Palmeiras, 55 - Campinas', responsavel: 'Eng. Marcos Souza', dataInicio: '2024-06-15', previsaoTermino: '2025-12-31', status: 'ativa' },
];

const mockDiarios: DiarioObra[] = [
  {
    id: '1',
    obra: 'Residencial Vista Verde',
    data: '2026-06-04',
    responsavel: 'Carlos Mota',
    horarioInicio: '07:00',
    horarioEncerramento: '17:00',
    condicaoClimatica: 'ensolarado',
    observacoesClimaticas: 'Dia quente, temperatura acima de 30°C',
    equipe: [
      { id: '1', nome: 'João Silva', funcao: 'Pedreiro', empresa: 'Própria', horaEntrada: '07:00', horaSaida: '17:00', horasTrabalhadas: 10, observacoes: '' },
      { id: '2', nome: 'Pedro Santos', funcao: 'Ajudante', empresa: 'Própria', horaEntrada: '07:00', horaSaida: '17:00', horasTrabalhadas: 10, observacoes: '' },
    ],
    atividades: [
      { id: '1', descricao: 'Execução de alvenaria 3º pavimento', local: '3º Pavimento', quantidade: 120, unidade: 'm²', equipe: 'Equipe A', status: 'concluida', observacoes: '' },
      { id: '2', descricao: 'Lançamento de concreto pilares', local: 'Térreo', quantidade: 8, unidade: 'unid', equipe: 'Equipe B', status: 'em_andamento', observacoes: '' },
    ],
    materiais: [
      { id: '1', material: 'Cimento CP-II', quantidade: 50, unidade: 'sacos', fornecedor: 'Votorantim', observacoes: '' },
      { id: '2', material: 'Tijolo 9 furos', quantidade: 2000, unidade: 'unid', fornecedor: 'Cerâmica Norte', observacoes: '' },
    ],
    equipamentos: [
      { id: '1', equipamento: 'Betoneira 400L', operador: 'José Ferreira', horasUtilizacao: 6, situacao: 'Bom estado', observacoes: '' },
    ],
    ocorrencias: [
      { id: '1', descricao: 'Falta de andaimes no 4º pavimento. Solicitar ao almoxarifado.', tipo: 'Pendência', origem: 'diario' },
    ],
    anexos: [],
    numeroRelatorio: 'RDO-2026-001',
    criadoEm: '2026-06-04T07:00:00',
    atualizadoEm: '2026-06-04T17:00:00',
  },
  {
    id: '2',
    obra: 'Comercial Centro Empresarial',
    data: '2026-06-03',
    responsavel: 'Ana Lima',
    horarioInicio: '08:00',
    horarioEncerramento: '18:00',
    condicaoClimatica: 'parcialmente_nublado',
    observacoesClimaticas: '',
    equipe: [
      { id: '1', nome: 'Marcos Rocha', funcao: 'Eletricista', empresa: 'Eletro Ltda', horaEntrada: '08:00', horaSaida: '17:00', horasTrabalhadas: 9, observacoes: '' },
    ],
    atividades: [
      { id: '1', descricao: 'Instalação de eletrodutos 5º andar', local: '5º Andar', quantidade: 200, unidade: 'm', equipe: 'Equipe Elétrica', status: 'em_andamento', observacoes: '' },
    ],
    materiais: [
      { id: '1', material: 'Eletroduto PVC 3/4"', quantidade: 100, unidade: 'm', fornecedor: 'Tigre', observacoes: '' },
    ],
    equipamentos: [],
    ocorrencias: [],
    anexos: [],
    numeroRelatorio: 'RDO-2026-002',
    criadoEm: '2026-06-03T08:00:00',
    atualizadoEm: '2026-06-03T18:00:00',
  },
];

const mockAcidentes: AcidenteTrabalho[] = [
  {
    id: '1',
    data: '2026-05-20',
    hora: '10:30',
    obra: 'Residencial Vista Verde',
    funcionario: 'Roberto Alves',
    funcao: 'Pedreiro',
    local: '2º Pavimento - Escada',
    descricao: 'Funcionário escorregou na escada e torceu o tornozelo direito.',
    gravidade: 'leve',
    atendimentoRealizado: 'Primeiros socorros no canteiro. Imobilização do tornozelo.',
    encaminhamentoMedico: true,
    necessidadeAfastamento: true,
    diasAfastados: 3,
    responsavelRegistro: 'Carlos Mota',
    anexos: [],
    criadoEm: '2026-05-20T10:45:00',
  },
];

const mockIncidentes: Incidente[] = [
  {
    id: '1',
    data: '2026-05-25',
    obra: 'Comercial Centro Empresarial',
    local: '3º Andar',
    descricao: 'Ferramenta caiu de altura de 2m, não atingindo ninguém.',
    riscosIdentificados: 'Falta de proteção nas bordas e não uso de trava-quedas para ferramentas.',
    acoesCorretivas: 'Instalação de redes de proteção e fixação de ferramentas com cordas de segurança.',
    anexos: [],
    criadoEm: '2026-05-25T14:00:00',
  },
];

const mockAcoesPreventivas: AcaoPreventiva[] = [
  {
    id: '1',
    data: '2026-06-01',
    obra: 'Residencial Vista Verde',
    tipo: 'dds',
    descricao: 'DDS sobre uso correto de EPI – ênfase em capacete e cinto de segurança em trabalho em altura.',
    responsavel: 'Técnico João Neto',
    colaboradoresEnvolvidos: ['João Silva', 'Pedro Santos', 'Marcos Lima'],
    anexos: [],
    criadoEm: '2026-06-01T07:30:00',
  },
  {
    id: '2',
    data: '2026-06-02',
    obra: 'Comercial Centro Empresarial',
    tipo: 'inspecao',
    descricao: 'Inspeção geral de andaimes e equipamentos de proteção coletiva.',
    responsavel: 'Técnico Ana Ferreira',
    colaboradoresEnvolvidos: ['Equipe de Segurança'],
    anexos: [],
    criadoEm: '2026-06-02T09:00:00',
  },
];

const mockRelatos: RelatoSeguranca[] = [
  {
    id: '1',
    data: '2026-06-03',
    obra: 'Condomínio Solar das Palmeiras',
    funcionario: 'Luiz Mendes',
    relato: 'Observado excesso de entulho no corredor de circulação do térreo, dificultando evacuação em caso de emergência.',
    recomendacoes: 'Realizar limpeza imediata do corredor e estabelecer rotina de descarte de entulho.',
    observacoes: 'Situação fotografada e enviada ao responsável.',
    anexos: [],
    criadoEm: '2026-06-03T11:00:00',
  },
];

const mockUsers: User[] = [
  { id: '1', nome: 'Carlos Mota', email: 'carlos@obrasync.com', role: 'engenheiro', empresa: 'ObraSync Engenharia', ativo: true, criadoEm: '2025-01-01' },
  { id: '2', nome: 'Ana Lima', email: 'ana@obrasync.com', role: 'engenheiro', empresa: 'ObraSync Engenharia', ativo: true, criadoEm: '2025-01-01' },
  { id: '3', nome: 'João Neto', email: 'joao@obrasync.com', role: 'tecnico_seguranca', empresa: 'ObraSync Engenharia', ativo: true, criadoEm: '2025-02-01' },
  { id: '4', nome: 'Admin Sistema', email: 'admin@obrasync.com', role: 'admin', empresa: 'ObraSync', ativo: true, criadoEm: '2025-01-01' },
];

// ─── Auth Store ─────────────────────────────────────────────────────────────

interface AuthState {
  currentUser: User | null;
  isDarkMode: boolean;
  login: (user: User) => void;
  logout: () => void;
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: mockUsers[3],
      isDarkMode: false,
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      toggleTheme: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
    }),
    { name: 'auth-store' }
  )
);

// ─── Obras Store ────────────────────────────────────────────────────────────

interface ObrasState {
  obras: Obra[];
  addObra: (obra: Obra) => void;
  updateObra: (id: string, data: Partial<Obra>) => void;
  removeObra: (id: string) => void;
}

export const useObrasStore = create<ObrasState>()(
  persist(
    (set) => ({
      obras: mockObras,
      addObra: (obra) => set((s) => ({ obras: [...s.obras, obra] })),
      updateObra: (id, data) =>
        set((s) => ({ obras: s.obras.map((o) => (o.id === id ? { ...o, ...data } : o)) })),
      removeObra: (id) => set((s) => ({ obras: s.obras.filter((o) => o.id !== id) })),
    }),
    { name: 'obras-store' }
  )
);

// ─── Diário Store ───────────────────────────────────────────────────────────

interface DiarioState {
  diarios: DiarioObra[];
  addDiario: (d: DiarioObra) => void;
  updateDiario: (id: string, data: Partial<DiarioObra>) => void;
  removeDiario: (id: string) => void;
  getDiarioById: (id: string) => DiarioObra | undefined;
}

export const useDiarioStore = create<DiarioState>()(
  persist(
    (set, get) => ({
      diarios: mockDiarios,
      addDiario: (d) => set((s) => ({ diarios: [...s.diarios, d] })),
      updateDiario: (id, data) =>
        set((s) => ({ diarios: s.diarios.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
      removeDiario: (id) => set((s) => ({ diarios: s.diarios.filter((d) => d.id !== id) })),
      getDiarioById: (id) => get().diarios.find((d) => d.id === id),
    }),
    { name: 'diario-store' }
  )
);

// ─── Segurança Store ─────────────────────────────────────────────────────────

interface SegurancaState {
  acidentes: AcidenteTrabalho[];
  incidentes: Incidente[];
  acoesPreventivas: AcaoPreventiva[];
  relatos: RelatoSeguranca[];
  addAcidente: (a: AcidenteTrabalho) => void;
  updateAcidente: (id: string, data: Partial<AcidenteTrabalho>) => void;
  removeAcidente: (id: string) => void;
  addIncidente: (i: Incidente) => void;
  updateIncidente: (id: string, data: Partial<Incidente>) => void;
  removeIncidente: (id: string) => void;
  addAcaoPreventiva: (a: AcaoPreventiva) => void;
  updateAcaoPreventiva: (id: string, data: Partial<AcaoPreventiva>) => void;
  removeAcaoPreventiva: (id: string) => void;
  addRelato: (r: RelatoSeguranca) => void;
  updateRelato: (id: string, data: Partial<RelatoSeguranca>) => void;
  removeRelato: (id: string) => void;
}

export const useSegurancaStore = create<SegurancaState>()(
  persist(
    (set) => ({
      acidentes: mockAcidentes,
      incidentes: mockIncidentes,
      acoesPreventivas: mockAcoesPreventivas,
      relatos: mockRelatos,
      addAcidente: (a) => set((s) => ({ acidentes: [...s.acidentes, a] })),
      updateAcidente: (id, data) =>
        set((s) => ({ acidentes: s.acidentes.map((a) => (a.id === id ? { ...a, ...data } : a)) })),
      removeAcidente: (id) => set((s) => ({ acidentes: s.acidentes.filter((a) => a.id !== id) })),
      addIncidente: (i) => set((s) => ({ incidentes: [...s.incidentes, i] })),
      updateIncidente: (id, data) =>
        set((s) => ({ incidentes: s.incidentes.map((i) => (i.id === id ? { ...i, ...data } : i)) })),
      removeIncidente: (id) => set((s) => ({ incidentes: s.incidentes.filter((i) => i.id !== id) })),
      addAcaoPreventiva: (a) => set((s) => ({ acoesPreventivas: [...s.acoesPreventivas, a] })),
      updateAcaoPreventiva: (id, data) =>
        set((s) => ({ acoesPreventivas: s.acoesPreventivas.map((a) => (a.id === id ? { ...a, ...data } : a)) })),
      removeAcaoPreventiva: (id) =>
        set((s) => ({ acoesPreventivas: s.acoesPreventivas.filter((a) => a.id !== id) })),
      addRelato: (r) => set((s) => ({ relatos: [...s.relatos, r] })),
      updateRelato: (id, data) =>
        set((s) => ({ relatos: s.relatos.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
      removeRelato: (id) => set((s) => ({ relatos: s.relatos.filter((r) => r.id !== id) })),
    }),
    { name: 'seguranca-store' }
  )
);

// ─── Cronograma Mock Data ────────────────────────────────────────────────────

const orcVazio = { maoDeObraPrevista: 0, maoDeObraExecutada: 0, materiaisPrevisto: 0, materiaisExecutado: 0, equipamentosPrevisto: 0, equipamentosExecutado: 0, outrosPrevisto: 0, outrosExecutado: 0 };

const mockCronogramas: CronogramaObra[] = [
  {
    id: 'cron-1',
    obraNome: 'Residencial Vista Verde',
    descricao: 'Edifício residencial de 8 pavimentos com 32 unidades. Estrutura em concreto armado.',
    responsavelGeral: 'Eng. Carlos Mota',
    dataInicioProgramada: '2025-01-10',
    dataFimProgramada: '2026-03-31',
    dataInicioReal: '2025-01-10',
    status: 'ativo',
    orcamentoTotal: 2350000,
    criadoEm: '2025-01-05T08:00:00',
    atualizadoEm: '2026-08-01T10:00:00',
    processos: [
      // ── INÍCIO ─────────────────────────────────────────────────────────────
      {
        id: 'proc-1', cronogramaId: 'cron-1', ordem: 1,
        nome: 'Serviços Preliminares', fase: 'inicio', categoria: 'servicos_preliminares',
        descricao: 'Limpeza do terreno, levantamento topográfico, locação da obra, instalação de canteiro (barracão, almoxarifado, banheiros químicos), instalações provisórias de água e energia, tapumes e sinalização de segurança.',
        dataInicioProgramada: '2025-01-10', dataFimProgramada: '2025-01-31',
        dataInicioReal: '2025-01-10', dataFimReal: '2025-02-05',
        status: 'concluido', percentualConcluido: 100,
        responsavel: 'Carlos Mota',
        equipe: [
          { id: 'eq1-1', nome: 'José Ferreira', funcao: 'Encarregado', empresa: 'Própria', horasPrevistas: 160, horasReais: 192 },
          { id: 'eq1-2', nome: 'Marcos Lima', funcao: 'Servente', empresa: 'Própria', horasPrevistas: 160, horasReais: 192 },
          { id: 'eq1-3', nome: 'Rafael Costa', funcao: 'Topógrafo', empresa: 'TopGeo Ltda', horasPrevistas: 16, horasReais: 16 },
        ],
        materiais: [
          { id: 'mat1-1', nome: 'Tapume metálico', especificacao: '2,20m × 1,10m', unidade: 'painel', quantidadePrevista: 80, quantidadeUtilizada: 80, valorUnitarioPrevisto: 45, valorUnitarioReal: 45, fornecedor: 'Tapumes RJ', statusAquisicao: 'utilizado' },
          { id: 'mat1-2', nome: 'Placa de obra', especificacao: 'Lona 2×3m', unidade: 'unid', quantidadePrevista: 2, quantidadeUtilizada: 2, valorUnitarioPrevisto: 380, valorUnitarioReal: 390, fornecedor: 'Gráfica Express', statusAquisicao: 'utilizado' },
          { id: 'mat1-3', nome: 'Areia grossa', especificacao: '', unidade: 'm³', quantidadePrevista: 5, quantidadeUtilizada: 5, valorUnitarioPrevisto: 120, valorUnitarioReal: 120, fornecedor: 'Areial Norte', statusAquisicao: 'utilizado' },
          { id: 'mat1-4', nome: 'Brita 1', especificacao: '', unidade: 'm³', quantidadePrevista: 3, quantidadeUtilizada: 3, valorUnitarioPrevisto: 140, valorUnitarioReal: 145, fornecedor: 'Pedreira Central', statusAquisicao: 'utilizado' },
        ],
        ferramentas: [
          { id: 'fer1-1', nome: 'Retroescavadeira', tipo: 'maquinario', especificacao: 'JCB 3CX', responsavel: 'José Ferreira', proprio: false, horasPrevistas: 16, horasReais: 20, custoEstimado: 3200, custoReal: 4000 },
          { id: 'fer1-2', nome: 'Teodolito', tipo: 'equipamento_eletrico', especificacao: 'Leica TS06', responsavel: 'Rafael Costa', proprio: false, horasPrevistas: 16, horasReais: 16, custoEstimado: 800, custoReal: 800 },
          { id: 'fer1-3', nome: 'Ferramentas manuais (kit)', tipo: 'ferramenta_manual', responsavel: 'Marcos Lima', proprio: true, horasPrevistas: 320, horasReais: 384, custoEstimado: 0, custoReal: 0 },
        ],
        orcamento: { maoDeObraPrevista: 18000, maoDeObraExecutada: 21600, materiaisPrevisto: 5800, materiaisExecutado: 5960, equipamentosPrevisto: 4000, equipamentosExecutado: 4800, outrosPrevisto: 2200, outrosExecutado: 2400 },
        requisitosSafety: ['NR-18 — Canteiro de obras', 'NR-6 — EPI (capacete, bota, colete)', 'NR-12 — Máquinas e equipamentos', 'CIPA instalada no canteiro'],
        vinculosSeguranca: [
          { tipo: 'acao_preventiva', referenciaId: '1', descricao: 'DDS — Uso correto de EPI na mobilização da obra' },
        ],
        observacoes: 'Prazo estendido em 5 dias devido a chuvas intensas na última semana de janeiro.',
        criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-02-05T17:00:00',
      },
      {
        id: 'proc-2', cronogramaId: 'cron-1', ordem: 2,
        nome: 'Fundações', fase: 'inicio', categoria: 'fundacao',
        descricao: 'Sondagem SPT do solo, escavação mecanizada, execução de estacas hélice contínua (Ø40cm, 18m), blocos de coroamento, vigas baldrame e aterro compactado.',
        dataInicioProgramada: '2025-02-01', dataFimProgramada: '2025-03-15',
        dataInicioReal: '2025-02-06', dataFimReal: '2025-03-28',
        status: 'concluido', percentualConcluido: 100,
        responsavel: 'Carlos Mota',
        equipe: [
          { id: 'eq2-1', nome: 'Carlos Mota', funcao: 'Engenheiro', empresa: 'ObraSync Engenharia', horasPrevistas: 80, horasReais: 88 },
          { id: 'eq2-2', nome: 'José Ferreira', funcao: 'Encarregado', empresa: 'Própria', horasPrevistas: 320, horasReais: 352 },
          { id: 'eq2-3', nome: 'João Silva', funcao: 'Armador', empresa: 'Própria', horasPrevistas: 320, horasReais: 352 },
          { id: 'eq2-4', nome: 'Pedro Santos', funcao: 'Ajudante', empresa: 'Própria', horasPrevistas: 320, horasReais: 352 },
          { id: 'eq2-5', nome: 'Marcos Lima', funcao: 'Servente', empresa: 'Própria', horasPrevistas: 320, horasReais: 352 },
          { id: 'eq2-6', nome: 'Roberto Alves', funcao: 'Operador de Sonda', empresa: 'Sondagens SP', horasPrevistas: 40, horasReais: 48 },
        ],
        materiais: [
          { id: 'mat2-1', nome: 'Aço CA-50', especificacao: 'Barras Ø10 a Ø25mm', unidade: 'kg', quantidadePrevista: 28000, quantidadeUtilizada: 29400, valorUnitarioPrevisto: 5.8, valorUnitarioReal: 6.1, fornecedor: 'Gerdau', statusAquisicao: 'utilizado' },
          { id: 'mat2-2', nome: 'Concreto usinado', especificacao: 'fck 30 MPa — fundações', unidade: 'm³', quantidadePrevista: 180, quantidadeUtilizada: 192, valorUnitarioPrevisto: 450, valorUnitarioReal: 465, fornecedor: 'Concretex', statusAquisicao: 'utilizado' },
          { id: 'mat2-3', nome: 'Fôrma de madeira compensado', especificacao: '1,10 × 2,20m, 12mm', unidade: 'painel', quantidadePrevista: 60, quantidadeUtilizada: 60, valorUnitarioPrevisto: 110, valorUnitarioReal: 115, fornecedor: 'Madeirex', statusAquisicao: 'utilizado' },
          { id: 'mat2-4', nome: 'Espaçadores plásticos', especificacao: '3cm', unidade: 'cento', quantidadePrevista: 40, quantidadeUtilizada: 42, valorUnitarioPrevisto: 22, valorUnitarioReal: 22, fornecedor: 'Construtools', statusAquisicao: 'utilizado' },
        ],
        ferramentas: [
          { id: 'fer2-1', nome: 'Sonda SPT / Hélice', tipo: 'maquinario', especificacao: 'Rotopercussão + Hélice contínua', responsavel: 'Roberto Alves', proprio: false, horasPrevistas: 40, horasReais: 48, custoEstimado: 28000, custoReal: 31200 },
          { id: 'fer2-2', nome: 'Caminhão bomba de concreto', tipo: 'veiculo', especificacao: 'Putzmeister BSF 28', responsavel: 'José Ferreira', proprio: false, horasPrevistas: 24, horasReais: 28, custoEstimado: 9600, custoReal: 11200 },
          { id: 'fer2-3', nome: 'Vibrador de concreto', tipo: 'equipamento_eletrico', especificacao: 'Mangote Ø50mm', responsavel: 'Marcos Lima', proprio: true, horasPrevistas: 60, horasReais: 72, custoEstimado: 0, custoReal: 0 },
          { id: 'fer2-4', nome: 'Retroescavadeira', tipo: 'maquinario', especificacao: 'JCB 3CX', responsavel: 'José Ferreira', proprio: false, horasPrevistas: 60, horasReais: 70, custoEstimado: 12000, custoReal: 14000 },
        ],
        orcamento: { maoDeObraPrevista: 68000, maoDeObraExecutada: 75000, materiaisPrevisto: 175000, materiaisExecutado: 194000, equipamentosPrevisto: 49600, equipamentosExecutado: 56400, outrosPrevisto: 7400, outrosExecutado: 8600 },
        requisitosSafety: ['NR-18 — Escavações e fundações', 'NR-11 — Transporte de cargas', 'NR-6 — EPI (capacete, cinto, bota)', 'Sinalização de área escavada', 'Vigilância noturna'],
        vinculosSeguranca: [
          { tipo: 'acidente', referenciaId: '1', descricao: 'Funcionário escorregou na escada — tornozelo torcido (leve)' },
          { tipo: 'acao_preventiva', referenciaId: '2', descricao: 'Inspeção de andaimes e EPC — identificados pontos de melhoria' },
        ],
        observacoes: 'Sondagem revelou solo mais compressível que previsto em projeto. Número de estacas aumentado de 24 para 28 unidades.',
        criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-03-28T17:00:00',
      },
      // ── MEIO ───────────────────────────────────────────────────────────────
      {
        id: 'proc-3', cronogramaId: 'cron-1', ordem: 3,
        nome: 'Estrutura', fase: 'meio', categoria: 'estrutura',
        descricao: 'Execução de toda a estrutura de concreto armado: pilares, vigas, lajes (8 pavimentos + cobertura). Inclui carpintaria de formas, armação, concretagem e desforma.',
        dataInicioProgramada: '2025-03-16', dataFimProgramada: '2025-07-31',
        dataInicioReal: '2025-03-29', dataFimReal: '2025-08-20',
        status: 'concluido', percentualConcluido: 100,
        responsavel: 'Carlos Mota',
        equipe: [
          { id: 'eq3-1', nome: 'Carlos Mota', funcao: 'Engenheiro', empresa: 'ObraSync Engenharia', horasPrevistas: 320, horasReais: 360 },
          { id: 'eq3-2', nome: 'José Ferreira', funcao: 'Encarregado', empresa: 'Própria', horasPrevistas: 800, horasReais: 880 },
          { id: 'eq3-3', nome: 'João Silva', funcao: 'Armador', empresa: 'Própria', horasPrevistas: 800, horasReais: 880 },
          { id: 'eq3-4', nome: 'Pedro Santos', funcao: 'Carpinteiro de formas', empresa: 'Própria', horasPrevistas: 800, horasReais: 880 },
          { id: 'eq3-5', nome: 'Marcos Lima', funcao: 'Servente', empresa: 'Própria', horasPrevistas: 800, horasReais: 880 },
          { id: 'eq3-6', nome: 'Lucas Rocha', funcao: 'Pedreiro', empresa: 'Própria', horasPrevistas: 800, horasReais: 880 },
        ],
        materiais: [
          { id: 'mat3-1', nome: 'Aço CA-50/CA-60', especificacao: 'Barras e telas', unidade: 'kg', quantidadePrevista: 95000, quantidadeUtilizada: 98200, valorUnitarioPrevisto: 5.9, valorUnitarioReal: 6.2, fornecedor: 'Gerdau', statusAquisicao: 'utilizado' },
          { id: 'mat3-2', nome: 'Concreto usinado', especificacao: 'fck 35 MPa — pilares/vigas; fck 25 MPa — lajes', unidade: 'm³', quantidadePrevista: 820, quantidadeUtilizada: 848, valorUnitarioPrevisto: 465, valorUnitarioReal: 480, fornecedor: 'Concretex', statusAquisicao: 'utilizado' },
          { id: 'mat3-3', nome: 'Compensado resinado 18mm', especificacao: 'Fôrmas — 1,10×2,20m', unidade: 'painel', quantidadePrevista: 400, quantidadeUtilizada: 412, valorUnitarioPrevisto: 125, valorUnitarioReal: 130, fornecedor: 'Madeirex', statusAquisicao: 'utilizado' },
          { id: 'mat3-4', nome: 'Escoramento metálico', especificacao: 'Escora telescópica 3,5m', unidade: 'unid', quantidadePrevista: 300, quantidadeUtilizada: 300, valorUnitarioPrevisto: 35, valorUnitarioReal: 35, fornecedor: 'Escoras Sul', statusAquisicao: 'utilizado' },
          { id: 'mat3-5', nome: 'Desmoldante', especificacao: 'Óleo vegetal — fôrmas', unidade: 'L', quantidadePrevista: 200, quantidadeUtilizada: 210, valorUnitarioPrevisto: 8.5, valorUnitarioReal: 9, fornecedor: 'Quimob', statusAquisicao: 'utilizado' },
        ],
        ferramentas: [
          { id: 'fer3-1', nome: 'Grua Torre', tipo: 'maquinario', especificacao: 'Potain MDT 178 — alcance 50m', responsavel: 'José Ferreira', proprio: false, horasPrevistas: 800, horasReais: 880, custoEstimado: 96000, custoReal: 105600 },
          { id: 'fer3-2', nome: 'Caminhão bomba de concreto', tipo: 'veiculo', especificacao: 'Putzmeister BSF 36', responsavel: 'Carlos Mota', proprio: false, horasPrevistas: 80, horasReais: 88, custoEstimado: 32000, custoReal: 35200 },
          { id: 'fer3-3', nome: 'Vibrador de concreto (2 und)', tipo: 'equipamento_eletrico', especificacao: 'Mangote Ø50 e Ø38mm', responsavel: 'Lucas Rocha', proprio: true, horasPrevistas: 200, horasReais: 220, custoEstimado: 0, custoReal: 0 },
          { id: 'fer3-4', nome: 'Serra circular de bancada', tipo: 'equipamento_eletrico', responsavel: 'Pedro Santos', proprio: true, horasPrevistas: 400, horasReais: 440, custoEstimado: 0, custoReal: 0 },
        ],
        orcamento: { maoDeObraPrevista: 185000, maoDeObraExecutada: 204000, materiaisPrevisto: 278000, materiaisExecutado: 304000, equipamentosPrevisto: 128000, equipamentosExecutado: 140800, outrosPrevisto: 9000, outrosExecutado: 11200 },
        requisitosSafety: ['NR-18 — Estruturas de concreto', 'NR-35 — Trabalho em altura', 'NR-6 — EPI completo (capacete, cinto de segurança tipo paraquedista, bota, luva)', 'Rede de proteção nas bordas de laje', 'Guarda-corpo em aberturas', 'Plano de içamento de cargas'],
        vinculosSeguranca: [
          { tipo: 'incidente', referenciaId: '1', descricao: 'Ferramenta caiu de altura de 2m — sem vítimas (ação: instalar redes de proteção)' },
          { tipo: 'acao_preventiva', referenciaId: '1', descricao: 'DDS sobre uso de cinto paraquedista em trabalho em altura' },
          { tipo: 'acao_preventiva', referenciaId: '2', descricao: 'Inspeção geral de andaimes e EPC' },
        ],
        observacoes: 'Atraso de 20 dias (início dia 29/03 vs. planejado 16/03) propagado da fundação. Concretagem do 7º pavimento adiada 3 dias por chuvas.',
        criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-08-20T17:00:00',
      },
      {
        id: 'proc-4', cronogramaId: 'cron-1', ordem: 4,
        nome: 'Alvenaria', fase: 'meio', categoria: 'alvenaria',
        descricao: 'Alvenaria de vedação em bloco cerâmico 9×19×19cm em todos os pavimentos. Inclui vergas, contravergas e cintas de amarração.',
        dataInicioProgramada: '2025-06-01', dataFimProgramada: '2025-09-30',
        dataInicioReal: '2025-08-21',
        status: 'em_andamento', percentualConcluido: 75,
        responsavel: 'José Ferreira',
        equipe: [
          { id: 'eq4-1', nome: 'José Ferreira', funcao: 'Encarregado', empresa: 'Própria', horasPrevistas: 640, horasReais: 480 },
          { id: 'eq4-2', nome: 'Lucas Rocha', funcao: 'Pedreiro', empresa: 'Própria', horasPrevistas: 640, horasReais: 480 },
          { id: 'eq4-3', nome: 'Marcos Lima', funcao: 'Servente', empresa: 'Própria', horasPrevistas: 640, horasReais: 480 },
        ],
        materiais: [
          { id: 'mat4-1', nome: 'Bloco cerâmico 9×19×19', especificacao: 'Vedação', unidade: 'milheiro', quantidadePrevista: 48, quantidadeUtilizada: 36, valorUnitarioPrevisto: 680, valorUnitarioReal: 710, fornecedor: 'Cerâmica Norte', statusAquisicao: 'adquirido' },
          { id: 'mat4-2', nome: 'Argamassa de assentamento', especificacao: 'Traço 1:2:8', unidade: 'm³', quantidadePrevista: 22, quantidadeUtilizada: 16, valorUnitarioPrevisto: 350, valorUnitarioReal: 360, fornecedor: 'Construtools', statusAquisicao: 'adquirido' },
          { id: 'mat4-3', nome: 'Cimento CP-II', especificacao: '50kg', unidade: 'saco', quantidadePrevista: 320, quantidadeUtilizada: 240, valorUnitarioPrevisto: 42, valorUnitarioReal: 45, fornecedor: 'Votorantim', statusAquisicao: 'adquirido' },
        ],
        ferramentas: [
          { id: 'fer4-1', nome: 'Betoneira 400L', tipo: 'equipamento_eletrico', responsavel: 'Marcos Lima', proprio: true, horasPrevistas: 320, horasReais: 240, custoEstimado: 0, custoReal: 0 },
          { id: 'fer4-2', nome: 'Andaime tubular', tipo: 'equipamento_eletrico', especificacao: 'Sistema modular', responsavel: 'José Ferreira', proprio: false, horasPrevistas: 640, horasReais: 480, custoEstimado: 12800, custoReal: 9600 },
        ],
        orcamento: { maoDeObraPrevista: 72000, maoDeObraExecutada: 54000, materiaisPrevisto: 90000, materiaisExecutado: 67500, equipamentosPrevisto: 12800, equipamentosExecutado: 9600, outrosPrevisto: 5200, outrosExecutado: 3900 },
        requisitosSafety: ['NR-18 — Alvenaria', 'NR-35 — Trabalho em altura', 'NR-6 — Capacete, bota, luva, óculos', 'Andaimes inspecionados a cada 7 dias'],
        vinculosSeguranca: [
          { tipo: 'relato', referenciaId: '1', descricao: 'Relato de excesso de entulho no corredor de circulação — limpeza imediata solicitada' },
        ],
        observacoes: 'Início atrasado em 82 dias (cascata da estrutura). Ritmo atual: 1,5 pavimento/semana. Previsão de conclusão: novembro/2025.',
        criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2026-08-01T09:00:00',
      },
      // Processos não iniciados — dados básicos
      { id: 'proc-5', cronogramaId: 'cron-1', ordem: 5, nome: 'Cobertura', fase: 'meio', categoria: 'cobertura', descricao: 'Estrutura de telhado em madeira tratada, telhas cerâmicas, rufos, calhas em alumínio e impermeabilização da laje de cobertura.', dataInicioProgramada: '2025-08-01', dataFimProgramada: '2025-10-31', status: 'atrasado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 35000, maoDeObraExecutada: 0, materiaisPrevisto: 98000, materiaisExecutado: 0, equipamentosPrevisto: 8000, equipamentosExecutado: 0, outrosPrevisto: 9000, outrosExecutado: 0 }, requisitosSafety: ['NR-35 — Trabalho em altura', 'NR-6 — EPI completo', 'Linha de vida horizontal na laje'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-6', cronogramaId: 'cron-1', ordem: 6, nome: 'Instalações Elétricas', fase: 'meio', categoria: 'instalacoes_eletricas', descricao: 'Eletrodutos, caixas de passagem, fiação (fases, neutro, terra), quadros de distribuição e proteção por pavimento.', dataInicioProgramada: '2025-08-15', dataFimProgramada: '2025-11-30', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 48000, maoDeObraExecutada: 0, materiaisPrevisto: 140000, materiaisExecutado: 0, equipamentosPrevisto: 6000, equipamentosExecutado: 0, outrosPrevisto: 6000, outrosExecutado: 0 }, requisitosSafety: ['NR-10 — Eletricidade', 'NR-6 — EPI (luva isolante, óculos)', 'SEP — Sistema elétrico de potência'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-7', cronogramaId: 'cron-1', ordem: 7, nome: 'Instalações Hidráulicas', fase: 'meio', categoria: 'instalacoes_hidraulicas', descricao: 'Tubulações de água fria e quente, esgoto, ventilação, ralos e caixas sifonadas em todos os banheiros, cozinhas e áreas técnicas.', dataInicioProgramada: '2025-08-15', dataFimProgramada: '2025-11-30', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 42000, maoDeObraExecutada: 0, materiaisPrevisto: 138000, materiaisExecutado: 0, equipamentosPrevisto: 4000, equipamentosExecutado: 0, outrosPrevisto: 6000, outrosExecutado: 0 }, requisitosSafety: ['NR-18 — Instalações hidráulicas', 'NR-6 — EPI básico'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-8', cronogramaId: 'cron-1', ordem: 8, nome: 'Instalações de Gás', fase: 'meio', categoria: 'gas', descricao: 'Tubulações de cobre para gás GLP, central de gás, ramais e pontos por unidade.', dataInicioProgramada: '2025-09-01', dataFimProgramada: '2025-11-15', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 18000, maoDeObraExecutada: 0, materiaisPrevisto: 32000, materiaisExecutado: 0, equipamentosPrevisto: 1500, equipamentosExecutado: 0, outrosPrevisto: 2500, outrosExecutado: 0 }, requisitosSafety: ['NR-18 — Instalações de gás', 'ABNT NBR 13523 — Central de GLP', 'Empresa habilitada ART'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-9', cronogramaId: 'cron-1', ordem: 9, nome: 'Impermeabilização', fase: 'meio', categoria: 'impermeabilizacao', descricao: 'Impermeabilização de banheiros, cozinhas, lavanderia, área técnica e laje de cobertura com manta asfáltica e argamassa polimérica.', dataInicioProgramada: '2025-10-01', dataFimProgramada: '2025-11-30', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 22000, maoDeObraExecutada: 0, materiaisPrevisto: 48000, materiaisExecutado: 0, equipamentosPrevisto: 4000, equipamentosExecutado: 0, outrosPrevisto: 6000, outrosExecutado: 0 }, requisitosSafety: ['NR-6 — Luva, respirador, óculos (produtos químicos)', 'NR-35 — Trabalho em altura'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-10', cronogramaId: 'cron-1', ordem: 10, nome: 'Revestimento Interno', fase: 'meio', categoria: 'revestimento_interno', descricao: 'Chapisco, reboco/gesso projetado, contrapiso em argamassa e regularização de pisos.', dataInicioProgramada: '2025-10-15', dataFimProgramada: '2026-01-31', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 68000, maoDeObraExecutada: 0, materiaisPrevisto: 72000, materiaisExecutado: 0, equipamentosPrevisto: 8000, equipamentosExecutado: 0, outrosPrevisto: 2000, outrosExecutado: 0 }, requisitosSafety: ['NR-6 — Capacete, luva, máscara PFF2', 'NR-9 — PPRA para poeiras'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-11', cronogramaId: 'cron-1', ordem: 11, nome: 'Revestimento Externo', fase: 'meio', categoria: 'revestimento_externo', descricao: 'Chapisco e reboco em fachada, textura acrílica e pintura externa em todo o perímetro do edifício.', dataInicioProgramada: '2025-11-01', dataFimProgramada: '2026-01-31', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 52000, maoDeObraExecutada: 0, materiaisPrevisto: 60000, materiaisExecutado: 0, equipamentosPrevisto: 16000, equipamentosExecutado: 0, outrosPrevisto: 2000, outrosExecutado: 0 }, requisitosSafety: ['NR-35 — Trabalho em altura', 'NR-6 — Cinto paraquedista, capacete, luva', 'Balancim inspecionado por profissional habilitado'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      // ── FIM ────────────────────────────────────────────────────────────────
      { id: 'proc-12', cronogramaId: 'cron-1', ordem: 12, nome: 'Esquadrias', fase: 'fim', categoria: 'esquadrias', descricao: 'Instalação de portas de madeira, janelas em alumínio anodizado, portões de garagem e gradis.', dataInicioProgramada: '2025-12-01', dataFimProgramada: '2026-01-31', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 28000, maoDeObraExecutada: 0, materiaisPrevisto: 68000, materiaisExecutado: 0, equipamentosPrevisto: 2000, equipamentosExecutado: 0, outrosPrevisto: 2000, outrosExecutado: 0 }, requisitosSafety: ['NR-6 — EPI básico', 'NR-18 — Esquadrias (montagem em altura)'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-13', cronogramaId: 'cron-1', ordem: 13, nome: 'Pisos e Revestimentos', fase: 'fim', categoria: 'pisos', descricao: 'Assentamento de porcelanato em áreas sociais, cerâmica em banheiros e cozinhas, rodapé e soleiras.', dataInicioProgramada: '2025-12-15', dataFimProgramada: '2026-02-28', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 45000, maoDeObraExecutada: 0, materiaisPrevisto: 62000, materiaisExecutado: 0, equipamentosPrevisto: 3000, equipamentosExecutado: 0, outrosPrevisto: 10000, outrosExecutado: 0 }, requisitosSafety: ['NR-6 — Joelheira, luva, óculos', 'NR-9 — PPRA para poeiras de corte'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-14', cronogramaId: 'cron-1', ordem: 14, nome: 'Pintura', fase: 'fim', categoria: 'pintura', descricao: 'Massa corrida PVA, tinta látex interna nas unidades e áreas comuns. Selador e tinta acrílica na fachada.', dataInicioProgramada: '2026-01-15', dataFimProgramada: '2026-02-28', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 38000, maoDeObraExecutada: 0, materiaisPrevisto: 32000, materiaisExecutado: 0, equipamentosPrevisto: 4000, equipamentosExecutado: 0, outrosPrevisto: 6000, outrosExecutado: 0 }, requisitosSafety: ['NR-6 — Respirador, luva nitrílica, óculos', 'Ventilação forçada em ambientes fechados'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-15', cronogramaId: 'cron-1', ordem: 15, nome: 'Instalações Complementares', fase: 'fim', categoria: 'instalacoes_complementares', descricao: 'Louças e metais sanitários, tomadas, interruptores, luminárias, ar condicionado split e CFTV.', dataInicioProgramada: '2026-01-01', dataFimProgramada: '2026-03-15', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 42000, maoDeObraExecutada: 0, materiaisPrevisto: 48000, materiaisExecutado: 0, equipamentosPrevisto: 3000, equipamentosExecutado: 0, outrosPrevisto: 7000, outrosExecutado: 0 }, requisitosSafety: ['NR-10 — Eletricidade (tomadas/luminárias)', 'NR-6 — EPI básico'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-16', cronogramaId: 'cron-1', ordem: 16, nome: 'Paisagismo e Área Externa', fase: 'fim', categoria: 'paisagismo', descricao: 'Calçadas, estacionamento em piso intertravado, jardins, cercamento e iluminação externa.', dataInicioProgramada: '2026-02-01', dataFimProgramada: '2026-03-15', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 24000, maoDeObraExecutada: 0, materiaisPrevisto: 48000, materiaisExecutado: 0, equipamentosPrevisto: 4000, equipamentosExecutado: 0, outrosPrevisto: 4000, outrosExecutado: 0 }, requisitosSafety: ['NR-6 — EPI básico', 'Sinalização de calçada durante obra'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
      { id: 'proc-17', cronogramaId: 'cron-1', ordem: 17, nome: 'Limpeza Final e Entrega', fase: 'fim', categoria: 'limpeza_entrega', descricao: 'Limpeza pesada de todas as unidades e áreas comuns, vistoria técnica, habite-se e entrega formal das chaves.', dataInicioProgramada: '2026-03-01', dataFimProgramada: '2026-03-31', status: 'nao_iniciado', percentualConcluido: 0, responsavel: 'Carlos Mota', equipe: [], materiais: [], ferramentas: [], orcamento: { maoDeObraPrevista: 12000, maoDeObraExecutada: 0, materiaisPrevisto: 3000, materiaisExecutado: 0, equipamentosPrevisto: 2000, equipamentosExecutado: 0, outrosPrevisto: 3000, outrosExecutado: 0 }, requisitosSafety: ['NR-6 — Luva, máscara, bota (limpeza química)', 'Vistoria com AVCB aprovado'], vinculosSeguranca: [], criadoEm: '2025-01-05T08:00:00', atualizadoEm: '2025-01-05T08:00:00' },
    ],
  },
];

// ─── Cronograma Store ────────────────────────────────────────────────────────

interface CronogramaState {
  cronogramas: CronogramaObra[];
  addCronograma: (c: CronogramaObra) => void;
  updateCronograma: (id: string, data: Partial<CronogramaObra>) => void;
  removeCronograma: (id: string) => void;
  addProcesso: (cronogramaId: string, p: ProcessoCronograma) => void;
  updateProcesso: (cronogramaId: string, processoId: string, data: Partial<ProcessoCronograma>) => void;
  removeProcesso: (cronogramaId: string, processoId: string) => void;
}

export const useCronogramaStore = create<CronogramaState>()(
  persist(
    (set) => ({
      cronogramas: mockCronogramas,
      addCronograma: (c) => set((s) => ({ cronogramas: [...s.cronogramas, c] })),
      updateCronograma: (id, data) =>
        set((s) => ({ cronogramas: s.cronogramas.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
      removeCronograma: (id) => set((s) => ({ cronogramas: s.cronogramas.filter((c) => c.id !== id) })),
      addProcesso: (cronogramaId, p) =>
        set((s) => ({
          cronogramas: s.cronogramas.map((c) =>
            c.id === cronogramaId ? { ...c, processos: [...c.processos, p] } : c
          ),
        })),
      updateProcesso: (cronogramaId, processoId, data) =>
        set((s) => ({
          cronogramas: s.cronogramas.map((c) =>
            c.id === cronogramaId
              ? { ...c, processos: c.processos.map((p) => (p.id === processoId ? { ...p, ...data } : p)) }
              : c
          ),
        })),
      removeProcesso: (cronogramaId, processoId) =>
        set((s) => ({
          cronogramas: s.cronogramas.map((c) =>
            c.id === cronogramaId
              ? { ...c, processos: c.processos.filter((p) => p.id !== processoId) }
              : c
          ),
        })),
    }),
    { name: 'cronograma-store' }
  )
);

// ─── Nota Fiscal Mock Data ────────────────────────────────────────────────────

const mockNotasFiscais: NotaFiscal[] = [
  {
    id: 'nf-001',
    numero: '000045823',
    serie: '001',
    chaveAcesso: '35260712345678000195550010000458231234567890',
    dataEmissao: '2026-07-10',
    naturezaOperacao: 'VENDA DE MERCADORIA',
    fornecedorCNPJ: '12345678000195',
    fornecedorNome: 'Casa do Construtor Materiais Ltda',
    destinatarioCNPJ: '98765432000100',
    destinatarioNome: 'ObraSync Engenharia Ltda',
    valorProdutos: 23680,
    valorTotal: 23680,
    itens: [
      { id: 'nfi-001-1', nItem: 1, codigo: 'BLO-CER-919', descricao: 'BLOCO CERAMICO 9X19X19CM VEDACAO', ncm: '69031000', cfop: '5102', unidade: 'MIL', quantidade: 12, valorUnitario: 710, valorTotal: 8520, cronogramaId: 'cron-1', processoId: 'proc-4', obraNome: 'Residencial Vista Verde', processoNome: 'Alvenaria' },
      { id: 'nfi-001-2', nItem: 2, codigo: 'CIM-CPII-50', descricao: 'CIMENTO CP-II E 50KG', ncm: '25232900', cfop: '5102', unidade: 'SC', quantidade: 200, valorUnitario: 45, valorTotal: 9000 },
      { id: 'nfi-001-3', nItem: 3, codigo: 'ARG-ASS-20', descricao: 'ARGAMASSA COLANTE AC-I 20KG', ncm: '38244000', cfop: '5102', unidade: 'SC', quantidade: 80, valorUnitario: 22, valorTotal: 1760 },
      { id: 'nfi-001-4', nItem: 4, codigo: 'ARG-TRA-25', descricao: 'ARGAMASSA TRACADA PREMISTURADA 25KG', ncm: '38244000', cfop: '5102', unidade: 'SC', quantidade: 80, valorUnitario: 18, valorTotal: 4400 },
    ],
    status: 'parcialmente_vinculada',
    importadoEm: '2026-07-11T08:30:00Z',
  },
  {
    id: 'nf-002',
    numero: '000012456',
    serie: '001',
    chaveAcesso: '35260687654321000195550010000124561234567891',
    dataEmissao: '2026-06-20',
    naturezaOperacao: 'VENDA DE CONCRETO USINADO',
    fornecedorCNPJ: '87654321000195',
    fornecedorNome: 'Concretex Brasil LTDA',
    destinatarioCNPJ: '98765432000100',
    destinatarioNome: 'ObraSync Engenharia Ltda',
    valorProdutos: 92400,
    valorTotal: 92400,
    itens: [
      { id: 'nfi-002-1', nItem: 1, codigo: 'CONC-35MPA', descricao: 'CONCRETO USINADO FCK 35 MPA BOMBEAVEL', ncm: '38140000', cfop: '5102', unidade: 'M3', quantidade: 120, valorUnitario: 480, valorTotal: 57600, cronogramaId: 'cron-1', processoId: 'proc-3', obraNome: 'Residencial Vista Verde', processoNome: 'Estrutura' },
      { id: 'nfi-002-2', nItem: 2, codigo: 'CONC-25MPA', descricao: 'CONCRETO USINADO FCK 25 MPA CAMINHAO BETONEIRA', ncm: '38140000', cfop: '5102', unidade: 'M3', quantidade: 72, valorUnitario: 455, valorTotal: 32760, cronogramaId: 'cron-1', processoId: 'proc-3', obraNome: 'Residencial Vista Verde', processoNome: 'Estrutura' },
      { id: 'nfi-002-3', nItem: 3, codigo: 'BOMBE-EQ', descricao: 'LOCACAO BOMBA DE CONCRETO COM OPERADOR', ncm: '00000000', cfop: '5102', unidade: 'VB', quantidade: 2, valorUnitario: 1020, valorTotal: 2040, cronogramaId: 'cron-1', processoId: 'proc-3', obraNome: 'Residencial Vista Verde', processoNome: 'Estrutura' },
    ],
    status: 'vinculada',
    importadoEm: '2026-06-21T14:00:00Z',
  },
];

// ─── Nota Fiscal Store ────────────────────────────────────────────────────────

interface NotaFiscalState {
  notasFiscais: NotaFiscal[];
  addNotaFiscal: (nf: NotaFiscal) => void;
  updateNotaFiscal: (id: string, data: Partial<NotaFiscal>) => void;
  removeNotaFiscal: (id: string) => void;
  vincularItem: (nfId: string, itemId: string, vinculo: { cronogramaId: string; processoId: string; obraNome: string; processoNome: string }) => void;
  desvincularItem: (nfId: string, itemId: string) => void;
}

export const useNotaFiscalStore = create<NotaFiscalState>()(
  persist(
    (set) => ({
      notasFiscais: mockNotasFiscais,
      addNotaFiscal: (nf) => set((s) => ({ notasFiscais: [...s.notasFiscais, nf] })),
      updateNotaFiscal: (id, data) =>
        set((s) => ({ notasFiscais: s.notasFiscais.map((nf) => (nf.id === id ? { ...nf, ...data } : nf)) })),
      removeNotaFiscal: (id) => set((s) => ({ notasFiscais: s.notasFiscais.filter((nf) => nf.id !== id) })),
      vincularItem: (nfId, itemId, vinculo) =>
        set((s) => {
          const notasFiscais = s.notasFiscais.map((nf) => {
            if (nf.id !== nfId) return nf;
            const itens = nf.itens.map((item) => (item.id === itemId ? { ...item, ...vinculo } : item));
            const todos = itens.every((i) => i.processoId);
            const algum = itens.some((i) => i.processoId);
            const status: NotaFiscal['status'] = todos ? 'vinculada' : algum ? 'parcialmente_vinculada' : 'importada';
            return { ...nf, itens, status };
          });
          return { notasFiscais };
        }),
      desvincularItem: (nfId, itemId) =>
        set((s) => {
          const notasFiscais = s.notasFiscais.map((nf) => {
            if (nf.id !== nfId) return nf;
            const itens = nf.itens.map((item) =>
              item.id === itemId ? { ...item, cronogramaId: undefined, processoId: undefined, obraNome: undefined, processoNome: undefined } : item
            );
            const todos = itens.every((i) => i.processoId);
            const algum = itens.some((i) => i.processoId);
            const status: NotaFiscal['status'] = todos ? 'vinculada' : algum ? 'parcialmente_vinculada' : 'importada';
            return { ...nf, itens, status };
          });
          return { notasFiscais };
        }),
    }),
    { name: 'nota-fiscal-store' }
  )
);

// ─── Users Store ─────────────────────────────────────────────────────────────

interface UsersState {
  users: User[];
  addUser: (u: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  removeUser: (id: string) => void;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set) => ({
      users: mockUsers,
      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      updateUser: (id, data) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)) })),
      removeUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
    }),
    { name: 'users-store' }
  )
);
