import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Text,
  Stack,
  useToast,
} from '@chakra-ui/react';
import api, { Order, PopulatedOrder } from '../services/api';

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

const Admin = () => {
  const [orders, setOrders] = useState<PopulatedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заказы',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']): Promise<void> => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      toast({
        title: 'Статус обновлен',
        description: 'Статус заказа успешно обновлен',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус заказа',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotalAmount = (order: PopulatedOrder): number => {
    return order.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <Stack spacing={8}>
          <Heading>Панель администратора</Heading>
          
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Дата</Th>
                  <Th>Клиент</Th>
                  <Th>Товары</Th>
                  <Th isNumeric>Сумма</Th>
                  <Th>Статус</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <Tr key={order._id}>
                    <Td>{formatDate(order.createdAt)}</Td>
                    <Td>
                      <Stack spacing={1}>
                        <Text fontWeight="bold">{order.customer.name}</Text>
                        <Text fontSize="sm">{order.customer.email}</Text>
                        <Text fontSize="sm">{order.customer.phone}</Text>
                        <Text fontSize="sm">{order.customer.address}</Text>
                      </Stack>
                    </Td>
                    <Td>
                      <Stack spacing={2}>
                        {order.items.map((item, index) => (
                          <Text key={index}>
                            {typeof item.product === 'object' ? item.product.name : item.product} × {item.quantity}
                          </Text>
                        ))}
                      </Stack>
                    </Td>
                    <Td isNumeric>{calculateTotalAmount(order)} ₽</Td>
                    <Td>
                      <Stack spacing={2}>
                        <Select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value as Order['status'])}
                          width="150px"
                        >
                          {Object.entries(statusTranslations).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </Select>
                        <Badge colorScheme={statusColors[order.status]}>
                          {statusTranslations[order.status]}
                        </Badge>
                      </Stack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Admin;