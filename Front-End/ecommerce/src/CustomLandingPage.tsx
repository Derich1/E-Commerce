// src/CustomLoginPage.tsx
import { useState } from 'react';
import { useLogin, useNotify, Link } from 'react-admin';
import { useForm } from 'react-hook-form';
import { Box, Button, TextField, Typography, Stack } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface LoginFormData {
  email: string;
  senha: string;
}

const CustomLoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login({
        email: data.email,
        senha: data.senha,
      }, '/admin'); // Redireciona para /admin após login
    } catch (error: any) {
      notify(
        typeof error === 'string' ? error : 'Erro ao fazer login. Verifique suas credenciais.',
        { type: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
          maxWidth: 400,
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Stack alignItems="center" gap={1}>
          <LockOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h5" component="h1">
            Painel Administrativo
          </Typography>
        </Stack>

        <TextField
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
          label="Email"
          type="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
          autoFocus
        />

        <TextField
          {...register('senha', {
            required: 'Senha é obrigatória',
            minLength: {
              value: 4,
              message: 'Senha deve ter pelo menos 8 caracteres'
            }
          })}
          label="Senha"
          type="password"
          error={!!errors.senha}
          helperText={errors.senha?.message}
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? 'Carregando...' : 'Entrar'}
        </Button>

        <Typography variant="body2" textAlign="center" mt={2}>
          <Link to="/redefinir-senha" color="textSecondary">
            Esqueceu sua senha?
          </Link>
        </Typography>
      </Box>

      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} Sua Empresa. Todos os direitos reservados.
        </Typography>
      </Box>
    </Box>
  );
};

export default CustomLoginPage;