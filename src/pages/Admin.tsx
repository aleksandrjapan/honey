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
import type { Order } from '../services/api';
import api from '../services/api';

const statusColors: Record<string, string> = {
  pending: 'yellow',
  processing: 'blue',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const toast = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
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
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders();
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
                  <Th>Сумма</Th>
                  <Th>Статус</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <Tr key={order._id}>
                    <Td>
                      {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Td>
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
                            {item.product} x {item.quantity}
                          </Text>
                        ))}
                      </Stack>
                    </Td>
                    <Td isNumeric>{order.totalAmount} ₽</Td>
                    <Td>
                      <Select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        width="150px"
                      >
                        <option value="pending">Ожидает</option>
                        <option value="processing">Обработка</option>
                        <option value="shipped">Отправлен</option>
                        <option value="delivered">Доставлен</option>
                        <option value="cancelled">Отменён</option>
                      </Select>
                      <Badge
                        colorScheme={statusColors[order.status]}
                        mt={2}
                      >
                        {order.status}
                      </Badge>
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