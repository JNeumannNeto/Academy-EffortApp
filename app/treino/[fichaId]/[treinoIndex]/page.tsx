'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { Ficha, Exercicio } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Importar estilos do Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface ExercicioComInfo extends Exercicio {
  parteIndex: number;
  exercicioIndex: number;
  parteNome?: string;
}

export default function TreinoPage() {
  const router = useRouter();
  const params = useParams();
  const fichaId = params?.fichaId as string;
  const treinoIndex = parseInt(params?.treinoIndex as string);

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [exercicios, setExercicios] = useState<ExercicioComInfo[]>([]);
  const [exercicioAtual, setExercicioAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [anotacoes, setAnotacoes] = useState<{ [key: number]: string }>({});
  const [salvando, setSalvando] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    carregarFicha();
  }, [fichaId]);

  const carregarFicha = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/fichas/${fichaId}`);
      
      if (data.sucesso && data.dados) {
        setFicha(data.dados);
     
        // Extrair todos os exercícios do treino selecionado
        const treino = data.dados.treinos[treinoIndex];
        
        if (!treino) {
          console.error('Treino não encontrado no índice:', treinoIndex);
          return;
        }
        
        const todosExercicios: ExercicioComInfo[] = [];

        treino.partes?.forEach((parte: { nome?: string; exercicios: Exercicio[] }, pIndex: number) => {
          parte.exercicios?.forEach((ex: Exercicio, eIndex: number) => {
            todosExercicios.push({
              ...ex,
              parteIndex: pIndex,
              exercicioIndex: eIndex,
              parteNome: parte.nome,
              concluido: false
            });
          });
        });

        setExercicios(todosExercicios);
      }
    } catch (error) {
      console.error('Erro ao carregar ficha:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = () => {
    setIniciado(true);
    setPausado(false);
  };

  const handlePausar = () => {
    setPausado(!pausado);
  };

  const handleConcluirExercicio = async () => {
    const exercicio = exercicios[exercicioAtual];
    const anotacao = anotacoes[exercicioAtual] || '';

    try {
      setSalvando(true);
      // Salvar execução no backend
      await api.post('/api/execucoes/exercicio', {
        fichaId,
        treinoIndex,
        parteIndex: exercicio.parteIndex,
        exercicioIndex: exercicio.exercicioIndex,
        anotacoes: anotacao
      });

      const novosExercicios = [...exercicios];
      novosExercicios[exercicioAtual].concluido = true;
      setExercicios(novosExercicios);

      // Ir para o próximo exercício
      if (exercicioAtual < exercicios.length - 1) {
        swiperRef.current?.slideNext();
      }
    } catch (error) {
      console.error('Erro ao salvar execução:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleFinalizarTreino = async () => {
    const exerciciosConcluidos = exercicios.filter(e => e.concluido).length;
    const todosConcluidos = exerciciosConcluidos === exercicios.length;

    const confirmacao = confirm(
      `Você concluiu ${exerciciosConcluidos} de ${exercicios.length} exercícios.\n\n` +
      'Deseja finalizar o treino?'
    );

    if (!confirmacao) return;

    try {
      // Salvar execução do treino (se o endpoint existir)
      const execucao = {
        aluno: ficha?.aluno._id,
        ficha: fichaId,
        treinoIndex,
        treinoCor: ficha?.treinos[treinoIndex].cor,
        dataExecucao: new Date().toISOString(),
        exercicios: exercicios.map(ex => ({
          exercicioIndex: ex.exercicioIndex,
          parteIndex: ex.parteIndex,
      concluido: ex.concluido || false,
       seriesRealizadas: ex.series,
          repeticoesRealizadas: ex.repeticoes
        })),
        duracaoMinutos: Math.floor(tempo / 60),
        concluido: todosConcluidos
   };

      try {
        await api.post('/api/execucoes', execucao);
      } catch (err) {
        console.log('Endpoint de execuções não disponível');
      }

 router.push('/');
    } catch (error) {
      console.error('Erro ao finalizar treino:', error);
      // Mesmo com erro, volta para home
      router.push('/');
    }
  };

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!ficha) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ficha não encontrada</p>
  <button
         onClick={() => router.push('/')}
        className="text-blue-600 hover:underline"
      >
Voltar para home
 </button>
        </div>
      </div>
    );
  }

  const treino = ficha.treinos[treinoIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header Fixo */}
      <div className="bg-gray-800 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="text-center flex-1">
            <div
              className="inline-block w-10 h-10 rounded-full text-lg font-bold flex items-center justify-center mb-1"
              style={{ backgroundColor: treino.cor }}
            >
              {String.fromCharCode(65 + treinoIndex)}
            </div>
            <p className="text-sm text-gray-400">
              Treino {String.fromCharCode(65 + treinoIndex)}
            </p>
          </div>

          <div className="w-10" />
        </div>
      </div>

      {/* Carrossel de Exercícios */}
      <div className="flex-1 relative">
        <Swiper
          modules={[Pagination, Navigation]}
  spaceBetween={0}
          slidesPerView={1}
   pagination={{
  clickable: true,
      bulletClass: 'swiper-pagination-bullet !bg-white',
         bulletActiveClass: 'swiper-pagination-bullet-active !bg-blue-500'
          }}
      navigation={{
  nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom'
  }}
   onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
  setExercicioAtual(swiper.activeIndex);
      }}
          className="h-full"
        >
          {exercicios.map((exercicio, index) => (
            <SwiperSlide key={index}>
      <div className="h-full flex items-center justify-center p-6">
        <div className="w-full max-w-md">
    {/* Card do Exercício */}
      <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
  {/* Parte */}
    {exercicio.parteNome && (
      <div className="text-center mb-4">
      <span className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                {exercicio.parteNome}
      </span>
      </div>
      )}

           {/* Nome do Exercício */}
     <h2 className="text-2xl font-bold text-center mb-2">
                    {typeof exercicio.objetivo === 'object' && exercicio.objetivo?.nome 
                      ? exercicio.objetivo.nome 
                      : exercicio.objetivo}
                  </h2>
                  <p className="text-center text-gray-400 mb-6">
                    {typeof exercicio.equipamento === 'object' && exercicio.equipamento?.nome
                      ? exercicio.equipamento.nome
                      : exercicio.equipamento}
                  </p>

                  {/* Séries/Repetições ou Tempo */}
                  {exercicio.tipo === 'tempo' ? (
                    // Exercício por Tempo
                    <div className="bg-gray-700 rounded-lg p-6 mb-6 text-center">
                      <p className="text-gray-400 text-sm mb-2">Duração</p>
                      <p className="text-4xl font-bold text-blue-400">
                        {formatarTempo(exercicio.tempoSegundos || 0)}
                      </p>
                    </div>
                  ) : (
                    // Exercício por Séries
                    <div className="space-y-3 mb-6">
                      {exercicio.series.map((serie, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-700 rounded-lg p-4"
                        >
                          <span className="text-gray-300">Série {idx + 1}</span>
                          <span className="text-xl font-bold">
                            {serie} x {exercicio.repeticoes[idx]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

         {/* Detalhes */}
            {exercicio.detalhes && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
    <p className="text-sm text-gray-300">{exercicio.detalhes}</p>
             </div>
         )}

                  {/* Campo de Anotações */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-300 mb-2">
                      Anotações (carga, distância, observações...)
                    </label>
                    <textarea
                      value={anotacoes[index] || ''}
                      onChange={(e) => setAnotacoes({ ...anotacoes, [index]: e.target.value })}
                      disabled={exercicio.concluido}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-800 disabled:text-gray-500"
                      rows={3}
                      placeholder="Ex: 20kg, 2km percorridos, etc..."
                    />
                  </div>

       {/* Botão Concluir */}
         <button
  onClick={handleConcluirExercicio}
          disabled={exercicio.concluido || salvando}
      className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
    exercicio.concluido
       ? 'bg-green-600 cursor-not-allowed'
        : salvando
          ? 'bg-gray-600 cursor-wait'
          : 'bg-blue-600 hover:bg-blue-700'
             }`}
>
   <Check size={24} />
      <span>
        {exercicio.concluido ? 'Exercício Concluído' : salvando ? 'Salvando...' : 'Concluir Exercício'}
      </span>
       </button>
      </div>
  </div>
              </div>
     </SwiperSlide>
          ))}
        </Swiper>

        {/* Botões de Navegação Personalizados */}
        <button className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-gray-800/80 rounded-full backdrop-blur-sm hover:bg-gray-700 transition">
  <ChevronLeft size={24} />
      </button>
        <button className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-gray-800/80 rounded-full backdrop-blur-sm hover:bg-gray-700 transition">
          <ChevronRight size={24} />
  </button>
      </div>

   {/* Botão Finalizar (Fixo no Bottom) */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <button
       onClick={handleFinalizarTreino}
        className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition"
      >
      Finalizar Treino
  </button>
      </div>
    </div>
  );
}
