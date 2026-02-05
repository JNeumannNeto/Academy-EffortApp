'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface LoginForm {
  email: string;
  senha: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>();
  const emailValue = watch('email') || '';
  const senhaValue = watch('senha') || '';
  const [primeiroAcessoErro, setPrimeiroAcessoErro] = useState('');

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', data);

      if (response.data.sucesso) {
        const { usuario, token } = response.data;

        // Apenas alunos podem fazer login no app
        if (usuario.tipo !== 'aluno') {
          setError('Apenas alunos podem acessar este aplicativo');
          setLoading(false);
          return;
        }

        setAuth(usuario, token);
        router.push('/');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensagem?: string } } };
      setError(error.response?.data?.mensagem || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <img 
              src="/logo.png" 
   alt="Effort Academy Logo" 
  width={80} 
            height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Effort Academy</h1>
          <p className="text-blue-100">Seu treino, seu ritmo</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Entrar</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  {...register('senha', { required: 'Senha é obrigatória' })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder=""
                />
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
              )}
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Primeiro Acesso */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              disabled={!emailValue || !!senhaValue}
              onClick={() => {
                setPrimeiroAcessoErro('');
                if (!emailValue) {
                  setPrimeiroAcessoErro('Digite seu email para primeiro acesso.');
                  return;
                }
                if (senhaValue) {
                  setPrimeiroAcessoErro('Deixe a senha em branco para primeiro acesso.');
                  return;
                }
                router.push(`/primeiro-acesso?email=${encodeURIComponent(emailValue)}`);
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium transition-colors ${(!emailValue || senhaValue) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
            >
              <UserPlus size={20} />
              <span>Primeiro Acesso</span>
            </button>
            {primeiroAcessoErro && (
              <p className="mt-2 text-sm text-red-600 text-center">{primeiroAcessoErro}</p>
            )}
            <p className="text-xs text-gray-500 text-center mt-2">
              Você foi cadastrado? Defina sua senha aqui
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white text-sm mt-6 opacity-75">
          © 2024 Effort Academy. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
