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
