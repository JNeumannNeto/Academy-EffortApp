'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

interface PrimeiroAcessoForm {
  email: string;
  senha: string;
  confirmarSenha: string;
}

export default function PrimeiroAcessoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PrimeiroAcessoForm>({
    defaultValues: {
      email: emailParam || ''
    }
  });

  const senha = watch('senha');

  const onSubmit = async (data: PrimeiroAcessoForm) => {
    setError('');
    setLoading(true);

    if (data.senha !== data.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/primeiro-acesso', {
        email: data.email,
   senha: data.senha
      });

      if (response.data.sucesso) {
        setSucesso(true);
        setTimeout(() => {
router.push('/login');
        }, 2000);
   }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensagem?: string } } };
      setError(error.response?.data?.mensagem || 'Erro ao definir senha');
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle size={32} className="text-green-600" />
</div>
   <h2 className="text-2xl font-bold text-gray-900 mb-2">Senha Definida!</h2>
  <p className="text-gray-600 mb-4">
          Sua senha foi cadastrada com sucesso.
     </p>
        <p className="text-sm text-gray-500">
Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h1>
      <p className="text-blue-100">Defina sua senha de acesso</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Primeiro Acesso</h2>
   <p className="text-gray-600 text-sm">
    Você foi cadastrado no sistema. Defina sua senha para começar a usar o aplicativo.
         </p>
          </div>

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
          disabled={!!emailParam}
        />
  </div>
       {errors.email && (
      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
       <p className="mt-1 text-xs text-gray-500">
                Use o email que foi cadastrado pelo seu instrutor
         </p>
            </div>

            {/* Nova Senha */}
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
      Nova Senha
        </label>
              <div className="relative">
  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
<input
  type="password"
        {...register('senha', { 
   required: 'Senha é obrigatória',
     minLength: { value: 6, message: 'Senha deve ter no mínimo 6 caracteres' }
          })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
   placeholder="Mínimo 6 caracteres"
 />
  </div>
  {errors.senha && (
       <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
         )}
            </div>

  {/* Confirmar Senha */}
      <div>
   <label className="block text-sm font-medium text-gray-700 mb-2">
      Confirmar Senha
              </label>
     <div className="relative">
   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
         <input
    type="password"
                {...register('confirmarSenha', { 
                 required: 'Confirmação de senha é obrigatória',
    validate: value => value === senha || 'As senhas não coincidem'
             })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Digite a senha novamente"
                />
      </div>
    {errors.confirmarSenha && (
    <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha.message}</p>
       )}
      </div>

            {/* Erro */}
            {error && (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
             <AlertCircle size={16} />
        <span>{error}</span>
              </div>
 )}

      {/* Botões */}
            <div className="space-y-3 pt-2">
            <button
          type="submit"
           disabled={loading}
 className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
{loading ? 'Definindo senha...' : 'Definir Senha e Entrar'}
     </button>
              
   <button
           type="button"
     onClick={() => router.push('/login')}
     className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
     Já tenho senha
            </button>
 </div>
       </form>
        </div>

   {/* Footer */}
        <p className="text-center text-white text-sm mt-6 opacity-75">
          © 2024 Effort Academy. Todos os direitos reservados.
        </p>
    </div>
    </div>
  );
}
