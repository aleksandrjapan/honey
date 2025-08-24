import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Grid,
  Image,
  useToast,
  Divider,
  Stack,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import api, { type CreateOrderData } from '../services/api';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const toast = useToast();
  const navigate = useNavigate();

  // Получаем товары из корзины
  const cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
  
  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Формируем данные заказа
      const orderData: CreateOrderData = {
        customer: formData,
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: getTotalAmount()
      };

      // Отправляем заказ
      const response = await api.createOrder(orderData);

      // Очищаем корзину
      localStorage.setItem('cart', '[]');
      
      // Показываем уведомление об успехе
      toast({
        title: 'Заказ оформлен',
        description: `Номер вашего заказа: ${response.data._id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Перенаправляем на страницу подтверждения
      navigate(`/order-confirmation/${response.data._id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('Error creating order:', errorMessage);
      toast({
        title: 'Ошибка',
        description: 'Не удалось оформить заказ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container maxW="container.xl" py={20}>
        <Stack spacing={4} align="center">
          <Heading>Корзина пуста</Heading>
          <Button colorScheme="yellow" onClick={() => navigate('/products')}>
            Перейти к товарам
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={20}>
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={10}>
        <Box>
          <Heading size="lg" mb={6}>Оформление заказа</Heading>
          <VStack as="form" onSubmit={handleSubmit} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Имя</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Введите ваше имя"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Введите ваш email"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Телефон</FormLabel>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Введите ваш телефон"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Адрес доставки</FormLabel>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Введите адрес доставки"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="yellow"
              size="lg"
              isLoading={isLoading}
              width="100%"
              mt={4}
            >
              Оформить заказ
            </Button>
          </VStack>
        </Box>

        <Box>
          <Heading size="lg" mb={6}>Ваш заказ</Heading>
          <Stack spacing={4}>
            {cartItems.map((item) => (
              <Box
                key={item.product._id}
                p={4}
                borderWidth={1}
                borderRadius="lg"
                shadow="sm"
              >
                <Grid templateColumns="100px 1fr" gap={4}>
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    borderRadius="md"
                    objectFit="cover"
                  />
                  <Stack>
                    <Text fontWeight="bold">{item.product.name}</Text>
                    <Text>Количество: {item.quantity}</Text>
                    <Text>Цена: {item.product.price * item.quantity} ₽</Text>
                  </Stack>
                </Grid>
              </Box>
            ))}
            
            <Divider my={4} />
            
            <Stack direction="row" justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Итого:</Text>
              <Text fontSize="lg" fontWeight="bold">{getTotalAmount()} ₽</Text>
            </Stack>
          </Stack>
        </Box>
      </Grid>
    </Container>
  );
};

export default Checkout;