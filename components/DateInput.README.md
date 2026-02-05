# Componente DateInput

Componente de entrada de data que permite ao usuário digitar ou selecionar datas no formato brasileiro (dd/mm/yyyy).

## Funcionalidades

- **Entrada manual**: O usuário pode digitar a data no formato dd/mm/yyyy
- **Seletor visual**: Botão com ícone de calendário para abrir o seletor de data nativo
- **Formatação automática**: À medida que o usuário digita, o componente formata automaticamente com as barras
- **Validação**: Valida datas básicas (dia 1-31, mês 1-12, ano >= 1900)
- **Conversão automática**: Converte entre formato brasileiro (dd/mm/yyyy) e formato ISO (yyyy-mm-dd) para o backend

## Uso

```tsx
import { DateInput } from '@/components/DateInput';
import { useForm, Controller } from 'react-hook-form';

interface FormData {
  dataNascimento: string;
}

function MeuFormulario() {
  const { control, formState: { errors } } = useForm<FormData>();

  return (
    <Controller
      name="dataNascimento"
      control={control}
      rules={{ required: 'Data é obrigatória' }}
      render={({ field }) => (
        <DateInput
          label="Data de Nascimento"
          value={field.value || ''}
          onChange={field.onChange}
          name="dataNascimento"
          error={errors.dataNascimento?.message}
          required
        />
      )}
    />
  );
}
```

## Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `label` | string | Sim | Texto do label do campo |
| `value` | string | Sim | Valor atual (formato ISO: yyyy-mm-dd) |
| `onChange` | (value: string) => void | Sim | Callback chamado quando a data muda (retorna formato ISO) |
| `name` | string | Não | Nome do campo (para formulários) |
| `error` | string | Não | Mensagem de erro a ser exibida |
| `required` | boolean | Não | Se o campo é obrigatório (adiciona asterisco) |
| `className` | string | Não | Classes CSS adicionais para o container |

## Formato de dados

- **Entrada do usuário**: dd/mm/yyyy (ex: 25/12/2024)
- **Valor retornado**: yyyy-mm-dd (ex: 2024-12-25)
- O componente faz a conversão automaticamente

## Validação

O componente realiza validação básica:
- Dia entre 1 e 31
- Mês entre 1 e 12
- Ano maior ou igual a 1900

Para validações mais complexas (como meses com diferentes números de dias), use validações adicionais no seu formulário.

## Integração com React Hook Form

O componente é projetado para funcionar perfeitamente com React Hook Form usando o componente `Controller`. Isso garante que:
- O estado do formulário é mantido corretamente
- As validações são executadas apropriadamente
- O valor é atualizado de forma controlada

## Exemplos

### Uso básico
```tsx
<Controller
  name="dataInicio"
  control={control}
  render={({ field }) => (
    <DateInput
      label="Data de Início"
      value={field.value || ''}
      onChange={field.onChange}
    />
  )}
/>
```

### Com validação
```tsx
<Controller
  name="dataValidade"
  control={control}
  rules={{ 
    required: 'Data de validade é obrigatória',
    validate: (value) => {
      const data = new Date(value);
      const hoje = new Date();
      return data > hoje || 'Data deve ser futura';
    }
  }}
  render={({ field }) => (
    <DateInput
      label="Data de Validade"
      value={field.value || ''}
      onChange={field.onChange}
      error={errors.dataValidade?.message}
      required
    />
  )}
/>
```
