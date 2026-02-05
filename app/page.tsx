'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, User, Clock, ChevronRight, Dumbbell, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Ficha, ExecucaoTreino } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HomePage() {
  const router = useRouter();
  const { usuario, logout } = useAuthStore();
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [ultimasExecucoes, setUltimasExecucoes] = useState<ExecucaoTreino[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Buscar ficha ativa do aluno
      const fichaRes = await api.get('/api/fichas');
      if (fichaRes.data.sucesso) {
        const fichas: Ficha[] = fichaRes.data.fichas;
        const fichaAtiva = fichas.find(f => f.ativa && !f.vencida);
        setFicha(fichaAtiva || null);
      }

      // Buscar últimas execuções (últimas 3)
      try {
        const execucoesRes = await api.get('/api/execucoes');
        if (execucoesRes.data.sucesso) {
          const execucoes: ExecucaoTreino[] = execucoesRes.data.execucoes;
          setUltimasExecucoes(execucoes.slice(0, 3));
        }
      } catch (err) {
        // Se não existir endpoint de execuções, apenas ignore
        console.log('Endpoint de execuções não disponível');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleIniciarTreino = (treinoIndex: number) => {
    router.push(`/treino/${ficha?._id}/${treinoIndex}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <User size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm opacity-90">Olá,</p>
              <h1 className="text-xl font-bold">{usuario?.nome}</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Info da Ficha */}
        {ficha ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} />
              <p className="text-sm">Ficha Ativa</p>
            </div>
            <p className="text-xs opacity-90">
              Válida até {format(parseISO(ficha.dataValidade), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
            <p className="text-xs opacity-90 mt-1">
              Professor: {ficha.professorReferencia.nome}
            </p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-2">
            <AlertCircle size={20} />
            <p className="text-sm">Nenhuma ficha ativa no momento</p>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Últimos Treinos Executados */}
        {ultimasExecucoes.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Últimos Treinos</h2>
            <div className="space-y-3">
              {ultimasExecucoes.map((execucao, index) => (
                <div
                  key={execucao._id || index}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: execucao.treinoCor }}
                    >
                      {String.fromCharCode(65 + execucao.treinoIndex)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Treino {String.fromCharCode(65 + execucao.treinoIndex)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(parseISO(execucao.dataExecucao), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        {execucao.duracaoMinutos && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {execucao.duracaoMinutos} min
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        execucao.concluido
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {execucao.concluido ? 'Concluído' : 'Parcial'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Treinos Disponíveis */}
        {ficha && ficha.treinos.length > 0 ? (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Escolha seu Treino</h2>
            <div className="grid grid-cols-1 gap-3">
              {ficha.treinos.map((treino, index) => (
                <button
                  key={index}
                  onClick={() => handleIniciarTreino(index)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                      style={{ backgroundColor: treino.cor }}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        Treino {String.fromCharCode(65 + index)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Dumbbell size={14} />
                        <span>
                          {treino.partes.reduce((acc, parte) => acc + parte.exercicios.length, 0)} exercícios
                        </span>
                      </div>
                      {treino.observacoes && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {treino.observacoes}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={24} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell size={32} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Nenhum treino disponível</h3>
            <p className="text-sm text-gray-600">
              Entre em contato com seu professor para criar sua ficha de treino
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
