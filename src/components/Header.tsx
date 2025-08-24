import { Box, Container, Flex, Link as ChakraLink, Stack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

const Header = () => {
  return (
    <Box as="header" bg="yellow.400" py={4} boxShadow="sm" w="full">
      <Container maxW="100%" px={{ base: 4, md: 8, lg: 16 }}>
        <Flex justify="space-between" align="center">
          <ChakraLink as={RouterLink} to="/" fontSize="2xl" fontWeight="bold" color="brown.800">
            МедОК
          </ChakraLink>
          
          <Stack direction="row" spacing={{ base: 4, md: 8 }}>
            <ChakraLink as={RouterLink} to="/" color="brown.800" fontWeight="medium">
              Главная
            </ChakraLink>
            <ChakraLink as={RouterLink} to="/products" color="brown.800" fontWeight="medium">
              Продукция
            </ChakraLink>
            <ChakraLink as={RouterLink} to="/about" color="brown.800" fontWeight="medium">
              О нас
            </ChakraLink>
            <ChakraLink as={RouterLink} to="/contact" color="brown.800" fontWeight="medium">
              Контакты
            </ChakraLink>
          </Stack>
        </Flex>
      </Container>
    </Box>
  )
}

export default Header