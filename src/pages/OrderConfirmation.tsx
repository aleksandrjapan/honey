import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [orderStatus, setOrderStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrderStatus = async () => {
      try {
        const response = await api.getOrderStatus(orderId!);
        setOrderStatus(response.data.status);
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: `Не удалось загрузить статус заказа ${error}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderStatus();
  }, [orderId]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={20}>
        <Stack align="center" spacing={4}>
          <Spinner size="xl" color="yellow.500" />
          <Text>Загрузка информации о заказе...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={20} minWidth="100vw">
      <Stack spacing={8} align="center" textAlign="center">
        <Heading color="green.500">Заказ успешно оформлен!</Heading>
        
        <Stack spacing={4}>
          <Text fontSize="lg">
            Номер вашего заказа: <strong>{orderId}</strong>
          </Text>
          <Text fontSize="lg">
            Статус заказа: <strong>{orderStatus}</strong>
          </Text>
          <Text>
            Мы отправили подтверждение на ваш email. 
            Вы можете следить за статусом заказа по его номеру.
          </Text>
        </Stack>

        <Box>
          <Button
            colorScheme="yellow"
            size="lg"
            onClick={() => navigate('/products')}
            mr={4}
          >
            Продолжить покупки
          </Button>
          <Button
            variant="outline"
            colorScheme="yellow"
            size="lg"
            onClick={() => navigate('/')}
          >
            На главную
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default OrderConfirmation;
