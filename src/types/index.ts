export type UserRole = 'admin' | 'engenheiro' | 'encarregado' | 'tecnico_seguranca' | 'consulta';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  empresa?: string;
  avatar?: string;
  ativo: boolean;
  criadoEm: string;
}

export type CondicaoClimatica = 'ensolarado' | 'parcialmente_nublado' | 'nublado' | 'chuva_leve' | 'chuva_forte' | 'outros';

export interface FuncionarioDia {
  id: string;
  nome: string;
  funcao: string;
  empresa: string;
  horaEntrada: string;
  horaSaida: string;
  horasTrabalhadas: number;
  observacoes?: string;
}

export type StatusAtividade = 'em_andamento' | 'concluida' | 'interrompida';

export interface Atividade {
  id: string;
  descricao: string;
  local: string;
  quantidade: number;
  unidade: string;
  equipe: string;
  status: StatusAtividade;
  observacoes?: string;
}

export interface Material {
  id: string;
  material: string;
  quantidade: number;
  unidade: string;
  fornecedor?: string;
  observacoes?: string;
}

export interface Equipamento {
  id: string;
  equipamento: string;
  operador: string;
  horasUtilizacao: number;
  situacao: string;
  observacoes?: string;
}

export interface Ocorrencia {
  id: string;
  descricao: string;
  tipo: string;
  origem?: 'diario' | 'seguranca';
  segurancaId?: string;
  observacoesComplementares?: string;
}

export interface Anexo {
  id: string;
  nome: string;
  tipo: string;
  dataInclusao: string;
  usuarioResponsavel: string;
  descricao?: string;
  url?: string;
}

export interface DiarioObra {
  id: string;
  obra: string;
  data: string;
  responsavel: string;
  horarioInicio: string;
  horarioEncerramento: string;
  condicaoClimatica: CondicaoClimatica;
  observacoesClimaticas?: string;
  equipe: FuncionarioDia[];
  atividades: Atividade[];
  materiais: Material[];
  equipamentos: Equipamento[];
  ocorrencias: Ocorrencia[];
  anexos: Anexo[];
  numeroRelatorio: string;
  criadoEm: string;
  atualizadoEm: string;
}

// Segurança do Trabalho
export type GravidadeAcidente = 'leve' | 'moderada' | 'grave';

export interface AcidenteTrabalho {
  id: string;
  data: string;
  hora: string;
  obra: string;
  funcionario: string;
  funcao: string;
  local: string;
  descricao: string;
  gravidade: GravidadeAcidente;
  atendimentoRealizado: string;
  encaminhamentoMedico: boolean;
  necessidadeAfastamento: boolean;
  diasAfastados?: number;
  responsavelRegistro: string;
  anexos: Anexo[];
  criadoEm: string;
}

export interface Incidente {
  id: string;
  data: string;
  obra: string;
  local: string;
  descricao: string;
  riscosIdentificados: string;
  acoesCorretivas: string;
  anexos: Anexo[];
  criadoEm: string;
}

export type TipoAcaoPreventiva = 'dds' | 'treinamento' | 'fiscalizacao' | 'inspecao' | 'campanha' | 'outro';

export interface AcaoPreventiva {
  id: string;
  data: string;
  obra: string;
  tipo: TipoAcaoPreventiva;
  descricao: string;
  responsavel: string;
  colaboradoresEnvolvidos: string[];
  anexos: Anexo[];
  criadoEm: string;
}

export interface RelatoSeguranca {
  id: string;
  data: string;
  obra: string;
  funcionario: string;
  relato: string;
  recomendacoes: string;
  observacoes?: string;
  anexos: Anexo[];
  criadoEm: string;
}

export interface Obra {
  id: string;
  nome: string;
  endereco: string;
  responsavel: string;
  dataInicio: string;
  previsaoTermino: string;
  status: 'ativa' | 'concluida' | 'paralisada';
}

// ─── Cronograma de Obra ──────────────────────────────────────────────────────

export type FaseCronograma = 'inicio' | 'meio' | 'fim';

export type CategoriaCronograma =
  | 'servicos_preliminares'
  | 'fundacao'
  | 'estrutura'
  | 'alvenaria'
  | 'cobertura'
  | 'instalacoes_eletricas'
  | 'instalacoes_hidraulicas'
  | 'gas'
  | 'impermeabilizacao'
  | 'revestimento_interno'
  | 'revestimento_externo'
  | 'esquadrias'
  | 'pisos'
  | 'pintura'
  | 'instalacoes_complementares'
  | 'paisagismo'
  | 'limpeza_entrega'
  | 'outro';

export type StatusProcesso = 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado' | 'paralisado';

export type StatusCronograma = 'rascunho' | 'ativo' | 'concluido' | 'paralisado';

export interface MembroEquipeCronograma {
  id: string;
  nome: string;
  funcao: string;
  empresa: string;
  horasPrevistas: number;
  horasReais: number;
}

export interface MaterialCronograma {
  id: string;
  nome: string;
  especificacao?: string;
  unidade: string;
  quantidadePrevista: number;
  quantidadeUtilizada: number;
  valorUnitarioPrevisto: number;
  valorUnitarioReal: number;
  fornecedor?: string;
  statusAquisicao: 'pendente' | 'adquirido' | 'entregue' | 'utilizado';
}

export interface FerramentaCronograma {
  id: string;
  nome: string;
  tipo: 'ferramenta_manual' | 'equipamento_eletrico' | 'maquinario' | 'veiculo';
  especificacao?: string;
  responsavel?: string;
  proprio: boolean;
  horasPrevistas: number;
  horasReais: number;
  custoEstimado: number;
  custoReal: number;
}

export interface OrcamentoProcesso {
  maoDeObraPrevista: number;
  maoDeObraExecutada: number;
  materiaisPrevisto: number;
  materiaisExecutado: number;
  equipamentosPrevisto: number;
  equipamentosExecutado: number;
  outrosPrevisto: number;
  outrosExecutado: number;
}

export interface VinculoSeguranca {
  tipo: 'acidente' | 'incidente' | 'acao_preventiva' | 'relato';
  referenciaId: string;
  descricao: string;
}

export interface ProcessoCronograma {
  id: string;
  cronogramaId: string;
  nome: string;
  descricao?: string;
  fase: FaseCronograma;
  categoria: CategoriaCronograma;
  ordem: number;
  dataInicioProgramada: string;
  dataFimProgramada: string;
  dataInicioReal?: string;
  dataFimReal?: string;
  status: StatusProcesso;
  percentualConcluido: number;
  responsavel: string;
  equipe: MembroEquipeCronograma[];
  materiais: MaterialCronograma[];
  ferramentas: FerramentaCronograma[];
  orcamento: OrcamentoProcesso;
  requisitosSafety: string[];
  vinculosSeguranca: VinculoSeguranca[];
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Notas Fiscais ───────────────────────────────────────────────────────────

export interface ItemNotaFiscal {
  id: string;
  nItem: number;
  codigo: string;
  descricao: string;
  ncm?: string;
  cfop?: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  // Vínculo com processo do cronograma
  cronogramaId?: string;
  processoId?: string;
  obraNome?: string;
  processoNome?: string;
}

export interface NotaFiscal {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso?: string;
  dataEmissao: string;
  naturezaOperacao?: string;
  fornecedorCNPJ: string;
  fornecedorNome: string;
  destinatarioCNPJ?: string;
  destinatarioNome?: string;
  valorProdutos: number;
  valorTotal: number;
  itens: ItemNotaFiscal[];
  status: 'importada' | 'parcialmente_vinculada' | 'vinculada';
  observacoes?: string;
  importadoEm: string;
}

export interface CronogramaObra {
  id: string;
  obraNome: string;
  descricao?: string;
  responsavelGeral: string;
  dataInicioProgramada: string;
  dataFimProgramada: string;
  dataInicioReal?: string;
  dataFimReal?: string;
  status: StatusCronograma;
  orcamentoTotal: number;
  processos: ProcessoCronograma[];
  criadoEm: string;
  atualizadoEm: string;
}
