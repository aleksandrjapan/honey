import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Image,
  Text,
  Stack,
  Button,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import api, { type Product } from '../services/api';
import Cart from '../components/Cart';

interface CartItem {
  product: Pick<Product, '_id' | 'name' | 'price' | 'image' | 'description' | 'stock'>;
  quantity: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const loadProducts = useCallback(async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить продукты',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addToCart = (product: Product) => {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
      const existingItem = cartItems.find(item => item.product._id === product._id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cartItems.push({
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            stock: product.stock
          },
          quantity: 1
        });
      }

      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      toast({
        title: 'Добавлено в корзину',
        description: `${product.name} добавлен в корзину`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар в корзину',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box py={10} maxW="100vw">
      <Container maxW="100%" p={0}>
        <Heading as="h1" size="2xl" color="brown.800" mb={10} textAlign="center">
          Наша продукция
        </Heading>
        
        <SimpleGrid 
          columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} 
          spacing={{ base: 4, lg: 8 }}
          mx="auto"
        >
          {products.map((product) => (
            <Box
              key={product._id}
              bg="white"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              transition="transform 0.2s"
              _hover={{ transform: 'scale(1.02)' }}
            >
              <Image 
                src={product.image} 
                alt={product.name}
                height="200px"
                width="100%"
                objectFit="cover"
              />
              
              <Stack p={4} spacing={3}>
                <Heading as="h3" size="md" color="brown.800">
                  {product.name}
                </Heading>
                <Text color="gray.600" noOfLines={2}>
                  {product.description}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="brown.800">
                  {product.price} ₽/кг
                </Text>
                <Button
                  colorScheme="yellow"
                  bg="yellow.400"
                  _hover={{ bg: 'yellow.500' }}
                  onClick={() => addToCart(product)}
                >
                  В корзину
                </Button>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>

        <Button
          position="fixed"
          bottom={4}
          right={4}
          colorScheme="yellow"
          onClick={onOpen}
          size="lg"
          boxShadow="lg"
          zIndex={2}
        >
          Корзина
        </Button>

        <Cart isOpen={isOpen} onClose={onClose} />
      </Container>
    </Box>
  );
};

export default Products;