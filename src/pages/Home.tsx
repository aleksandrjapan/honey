import { Box, Button, Container, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Box w="full">
      {/* Hero Section */}
      <Box 
        bg="yellow.50" 
        py={{ base: 16, lg: 24 }} 
        px={{ base: 4, md: 8, lg: 16 }}
        position="relative"
        overflow="hidden"
        minWidth="100vw"
      >
        {/* Декоративный элемент */}
        <Box
          position="absolute"
          top="0"
          right="0"
          width="40%"
          height="100%"
          bg="yellow.100"
          transform="skewX(-12deg) translateX(40%)"
          opacity="0.3"
          zIndex="0"
        />

        <Container maxW="100%">
          <Stack 
            spacing={{ base: 6, lg: 8 }} 
            maxW={{ base: "100%", lg: "70%" }}
            position="relative"
            zIndex="1"
          >
            <Heading 
              as="h1" 
              size={{ base: "2xl", lg: "4xl" }} 
              color="brown.800"
              lineHeight="shorter"
            >
              Натуральный мёд с собственной пасеки Саши
            </Heading>
            <Text 
              fontSize={{ base: "lg", lg: "2xl" }} 
              color="gray.600" 
              maxW="3xl"
            >
              Мы предлагаем широкий выбор натурального мёда, собранного на нашей пасеке. 
              Наш мёд - это 100% натуральный продукт без добавок и примесей.
            </Text>
            <Box>
              <Button
                as={RouterLink}
                to="/products"
                size="lg"
                height={{ base: "12", lg: "16" }}
                px={{ base: "8", lg: "12" }}
                fontSize={{ base: "lg", lg: "2xl" }}
                colorScheme="yellow"
                bg="yellow.400"
                _hover={{ bg: 'yellow.500', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                boxShadow="lg"
              >
                Смотреть продукцию
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={{ base: 16, lg: 24 }} px={{ base: 4, md: 8, lg: 16 }}>
        <Container maxW="100%">
          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 3 }} 
            spacing={{ base: 10, lg: 20 }}
          >
            <Stack align="center" textAlign="center">
              <Box
                w={{ base: 20, lg: 28 }}
                h={{ base: 20, lg: 28 }}
                bg="yellow.100"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
                fontSize={{ base: "4xl", lg: "6xl" }}
                transition="transform 0.2s"
                _hover={{ transform: 'scale(1.05)' }}
              >
                🐝
              </Box>
              <Heading as="h3" size={{ base: "md", lg: "lg" }} color="brown.800">
                Собственная пасека
              </Heading>
              <Text 
                color="gray.600" 
                fontSize={{ base: "md", lg: "lg" }}
                maxW="sm"
              >
                Мы контролируем весь процесс производства мёда от пчелы до банки
              </Text>
            </Stack>

            <Stack align="center" textAlign="center">
              <Box
                w={{ base: 20, lg: 28 }}
                h={{ base: 20, lg: 28 }}
                bg="yellow.100"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
                fontSize={{ base: "4xl", lg: "6xl" }}
                transition="transform 0.2s"
                _hover={{ transform: 'scale(1.05)' }}
              >
                ✨
              </Box>
              <Heading as="h3" size={{ base: "md", lg: "lg" }} color="brown.800">
                100% натуральный
              </Heading>
              <Text 
                color="gray.600" 
                fontSize={{ base: "md", lg: "lg" }}
                maxW="sm"
              >
                Никаких добавок и примесей - только чистый мёд
              </Text>
            </Stack>

            <Stack align="center" textAlign="center">
              <Box
                w={{ base: 20, lg: 28 }}
                h={{ base: 20, lg: 28 }}
                bg="yellow.100"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
                fontSize={{ base: "4xl", lg: "6xl" }}
                transition="transform 0.2s"
                _hover={{ transform: 'scale(1.05)' }}
              >
                🌿
              </Box>
              <Heading as="h3" size={{ base: "md", lg: "lg" }} color="brown.800">
                Экологически чистый
              </Heading>
              <Text 
                color="gray.600" 
                fontSize={{ base: "md", lg: "lg" }}
                maxW="sm"
              >
                Наша пасека находится в экологически чистом районе
              </Text>
            </Stack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box 
        bg="yellow.100" 
        py={{ base: 16, lg: 24 }} 
        px={{ base: 4, md: 8, lg: 16 }}
      >
        <Container maxW="100%">
          <Stack 
            spacing={8} 
            align="center" 
            textAlign="center"
          >
            <Heading 
              size={{ base: "xl", lg: "2xl" }} 
              color="brown.800"
            >
              Готовы попробовать наш мёд?
            </Heading>
            <Text 
              fontSize={{ base: "lg", lg: "xl" }} 
              color="gray.600" 
              maxW="2xl"
            >
              Закажите прямо сейчас и убедитесь в качестве нашей продукции
            </Text>
            <Button
              as={RouterLink}
              to="/products"
              size="lg"
              colorScheme="yellow"
              bg="yellow.400"
              _hover={{ bg: 'yellow.500', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
              boxShadow="lg"
            >
              Перейти в каталог
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;