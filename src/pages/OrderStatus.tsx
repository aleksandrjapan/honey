import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Input,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Divider,
  Stack,
  Badge,
  useToast
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import api, { Order, OrderItem } from '../services/api';

interface OrderItemWithPopulatedProduct extends Omit<OrderItem, 'product'> {
  product: {
    _id: string;
    name: string;
    price: number;
  };
}

interface PopulatedOrder extends Omit<Order, 'items'> {
  items: OrderItemWithPopulatedProduct[];
}

const statusColors: Record<Order['status'], string> = {
  pending: 'yellow',
  processing: 'blue',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

const statusTranslations: Record<Order['status'], string> = {
  pending: 'Ожидает обработки',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const OrderStatus = () => {
  const { orderId: urlOrderId } = useParams<{ orderId?: string }>();
  const [orderId, setOrderId] = useState(urlOrderId || '');
  const [orderDetails, setOrderDetails] = useState<PopulatedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSearch = async () => {
    if (!orderId.trim()) {
      toast({
        title: 'Введите номер заказа',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setError('');
    setOrderDetails(null);

    try {
      const response = await api.getOrderById(orderId);
      setOrderDetails(response.data as PopulatedOrder);
    } catch (err) {
      setError('Заказ не найден или произошла ошибка при поиске');
      toast({
        title: 'Ошибка',
        description: 'Не удалось найти заказ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">Проверка статуса заказа</Heading>
        
        <Box>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <Input
              placeholder="Введите номер заказа"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <Button
              colorScheme="yellow"
              isLoading={isLoading}
              onClick={handleSearch}
              minW={{ base: 'full', md: '200px' }}
            >
              Проверить
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {orderDetails && (
          <Box borderWidth="1px" borderRadius="lg" p={6}>
            <VStack spacing={4} align="stretch">
              <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="bold">
                  Заказ #{orderDetails._id}
                </Text>
                <Badge
                  colorScheme={statusColors[orderDetails.status]}
                  fontSize="md"
                  p={2}
                  borderRadius="md"
                >
                  {statusTranslations[orderDetails.status]}
                </Badge>
              </Stack>

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={2}>Информация о заказе:</Text>
                <Text>Дата заказа: {formatDate(orderDetails.createdAt)}</Text>
                <Text>Сумма заказа: {orderDetails.totalAmount} ₽</Text>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Товары:</Text>
                <VStack spacing={2} align="stretch">
                  {orderDetails.items.map((item, index) => (
                    <Box key={index} p={2} bg="gray.50" borderRadius="md">
                      <Text>{item.product.name} × {item.quantity} шт.</Text>
                      <Text fontSize="sm" color="gray.600">
                        {item.price * item.quantity} ₽
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Информация о доставке:</Text>
                <Text>Получатель: {orderDetails.customer.name}</Text>
                <Text>Адрес: {orderDetails.customer.address}</Text>
                <Text>Телефон: {orderDetails.customer.phone}</Text>
                <Text>Email: {orderDetails.customer.email}</Text>
              </Box>
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default OrderStatus;