import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  Text,
  Image,
  Flex,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../services/api';

interface CartItem {
  product: Pick<Product, '_id' | 'name' | 'price' | 'image'>;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps): JSX.Element => {
  const [items, setItems] = useState<CartItem[]>([]);
  const toast = useToast();
  const navigate = useNavigate();

  const loadCartItems = useCallback((): void => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить корзину',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    loadCartItems();
    
    const handleStorageChange = (): void => {
      loadCartItems();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadCartItems]);

  const updateQuantity = (productId: string, change: number): void => {
    try {
      const updatedItems = items.map(item => {
        if (item.product._id === productId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) return null;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter((item): item is CartItem => item !== null);

      setItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить количество',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getTotalAmount = (): number => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleCheckout = (): void => {
    onClose();
    navigate('/checkout');
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Корзина</DrawerHeader>

        <DrawerBody>
          {items.length === 0 ? (
            <Text>Корзина пуста</Text>
          ) : (
            <Stack spacing={4}>
              {items.map(item => (
                <Box
                  key={item.product._id}
                  p={4}
                  borderWidth={1}
                  borderRadius="lg"
                  shadow="sm"
                >
                  <Flex gap={4}>
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <Stack flex={1}>
                      <Text fontWeight="bold">{item.product.name}</Text>
                      <Text color="gray.600">{item.product.price} ₽/кг</Text>
                      <Flex align="center" gap={2}>
                        <IconButton
                          aria-label="Уменьшить количество"
                          icon={<Text>-</Text>}
                          size="sm"
                          onClick={() => updateQuantity(item.product._id, -1)}
                        />
                        <Text>{item.quantity}</Text>
                        <IconButton
                          aria-label="Увеличить количество"
                          icon={<Text>+</Text>}
                          size="sm"
                          onClick={() => updateQuantity(item.product._id, 1)}
                        />
                      </Flex>
                    </Stack>
                  </Flex>
                </Box>
              ))}
            </Stack>
          )}
        </DrawerBody>

        <DrawerFooter>
          <Stack width="100%" spacing={4}>
            <Flex justify="space-between">
              <Text fontWeight="bold">Итого:</Text>
              <Text fontWeight="bold">{getTotalAmount()} ₽</Text>
            </Flex>
            <Button
              colorScheme="yellow"
              isDisabled={items.length === 0}
              onClick={handleCheckout}
              width="100%"
            >
              Оформить заказ
            </Button>
          </Stack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default Cart;