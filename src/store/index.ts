import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User, DiarioObra, AcidenteTrabalho, Incidente,
  AcaoPreventiva, RelatoSeguranca, Obra
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
