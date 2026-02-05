'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [iniciado, setIniciado] = useState(false);
const [tempo, setTempo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
carregarFicha();
    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, [fichaId]);

  useEffect(() => {
    if (iniciado && !pausado) {
      intervaloRef.current = setInterval(() => {
        setTempo(prev => prev + 1);
      }, 1000);
    } else if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
    }

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, [iniciado, pausado]);

  const carregarFicha = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/fichas/${fichaId}`);
      
      if (data.sucesso) {
        setFicha(data.ficha);
     
      // Extrair todos os exercícios do treino selecionado
        const treino = data.ficha.treinos[treinoIndex];
      const todosExercicios: ExercicioComInfo[] = [];

        treino.partes.forEach((parte: { nome?: string; exercicios: Exercicio[] }, pIndex: number) => {
  parte.exercicios.forEach((ex: Exercicio, eIndex: number) => {
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

  const handleConcluirExercicio = () => {
    const novosExercicios = [...exercicios];
    novosExercicios[exercicioAtual].concluido = true;
    setExercicios(novosExercicios);

    // Ir para o próximo exercício
    if (exercicioAtual < exercicios.length - 1) {
      swiperRef.current?.slideNext();
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
  const progresso = exercicios.filter(e => e.concluido).length;
  const percentual = exercicios.length > 0 ? (progresso / exercicios.length) * 100 : 0;

  return (
  <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header Fixo */}
      <div className="bg-gray-800 p-4 shadow-lg">
   <div className="flex items-center justify-between mb-3">
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

        {/* Barra de Progresso */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
     <span>{progresso} de {exercicios.length}</span>
       <span>{Math.round(percentual)}%</span>
          </div>
       <div className="w-full bg-gray-700 rounded-full h-2">
            <div
       className="bg-blue-500 h-2 rounded-full transition-all duration-300"
     style={{ width: `${percentual}%` }}
            />
      </div>
        </div>

  {/* Timer e Controles */}
 <div className="flex items-center justify-between">
          <div className="text-2xl font-bold font-mono">
            {formatarTempo(tempo)}
     </div>

      <div className="flex gap-2">
      {!iniciado ? (
          <button
          onClick={handleIniciar}
     className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
    >
          <Play size={20} />
    <span>Iniciar</span>
          </button>
            ) : (
          <>
 <button
   onClick={handlePausar}
          className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
{pausado ? <Play size={20} /> : <Pause size={20} />}
</button>
      <button
              onClick={() => setTempo(0)}
     className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
 >
       <RotateCcw size={20} />
        </button>
       </>
            )}
    </div>
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
    {exercicio.objetivo}
               </h2>
<p className="text-center text-gray-400 mb-6">
           {exercicio.equipamento}
          </p>

           {/* Séries e Repetições */}
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

         {/* Detalhes */}
            {exercicio.detalhes && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
    <p className="text-sm text-gray-300">{exercicio.detalhes}</p>
             </div>
         )}

       {/* Botão Concluir */}
         <button
  onClick={handleConcluirExercicio}
          disabled={exercicio.concluido}
      className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
    exercicio.concluido
       ? 'bg-green-600 cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700'
             }`}
>
   <Check size={24} />
      <span>{exercicio.concluido ? 'Exercício Concluído' : 'Concluir Exercício'}</span>
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
