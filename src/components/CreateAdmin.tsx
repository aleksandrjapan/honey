import {
    Alert,
    AlertIcon,
    Box,
    Button,
    FormControl,
    FormLabel,
    Heading,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

import type { CreateAdminData } from '../services/api';
import api from '../services/api';

const CreateAdmin = () => {
  const [formData, setFormData] = useState<CreateAdminData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('Все поля обязательны для заполнения');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Неверный формат email');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.createAdmin(formData);
      
      toast({
        title: 'Успешно',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && error.response 
        ? (error.response as { data?: { message?: string } })?.data?.message 
        : 'Произошла ошибка при создании администратора';
      setError(errorMessage || 'Произошла ошибка при создании администратора');
      
      toast({
        title: 'Ошибка',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        <Heading size="lg">Создать нового администратора</Heading>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="admin@example.com"
            size="lg"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Пароль</FormLabel>
          <InputGroup size="lg">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Минимум 6 символов"
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                icon={<Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                size="sm"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          width="full"
          isLoading={isLoading}
          loadingText="Создание..."
        >
          Создать администратора
        </Button>
      </VStack>
    </Box>
  );
};

export default CreateAdmin;
