// Tipos do sistema
export interface Usuario {
  _id: string;
  nome: string;
  email: string;
  tipo: 'aluno';
  codigoAluno: number;
  ativo: boolean;
}

export interface Exercicio {
  objetivo: string;
  equipamento: string;
  series: number[];
  repeticoes: number[];
  detalhes?: string;
  ordem: number;
  concluido?: boolean;
}

export interface Parte {
  nome?: string;
  exercicios: Exercicio[];
}

export interface Treino {
  cor: string;
  partes: Parte[];
  observacoes?: string;
}

export interface Ficha {
  _id: string;
  aluno: {
    _id: string;
    nome: string;
    codigoAluno: number;
  };
  professorReferencia: {
    _id: string;
    nome: string;
  };
  dataInicio: string;
  dataValidade: string;
  ativa: boolean;
  vencida: boolean;
  objetivos: string[];
  anotacoesNutricao?: string;
  treinos: Treino[];
  anamnese: {
    remedios?: string;
    problemasSaude?: string;
    doencas?: string;
    cirurgias?: string;
    condicoes: {
      diabetes: boolean;
      hipertensao: boolean;
      doencaCardiaca: boolean;
      hipoglicemia: boolean;
      alergia: boolean;
      descricaoAlergia?: string;
    };
  };
}

export interface ExecucaoTreino {
  _id?: string;
  aluno: string;
  ficha: string;
  treinoIndex: number;
  treinoCor: string;
  dataExecucao: string;
  exercicios: {
    exercicioIndex: number;
    parteIndex: number;
    concluido: boolean;
    seriesRealizadas: number[];
    repeticoesRealizadas: number[];
  observacoes?: string;
  }[];
duracaoMinutos?: number;
  concluido: boolean;
}
