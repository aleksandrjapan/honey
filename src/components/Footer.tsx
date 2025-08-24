import { Box, Container, Stack, Text, Link } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Box as="footer" bg="yellow.100" py={8} w="full">
      <Container maxW="100%" px={{ base: 4, md: 8, lg: 16 }}>
        <Stack spacing={4} align="center">
          <Text fontSize="lg" fontWeight="bold" color="brown.800">
            МедОК - Натуральный мёд с собственной пасеки
          </Text>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 2, md: 8 }}>
            <Link href="tel:+79001234567" color="brown.800">
              +7 (900) 123-45-67
            </Link>
            <Link href="mailto:info@medok.ru" color="brown.800">
              info@medok.ru
            </Link>
          </Stack>
          <Text color="gray.600" fontSize="sm">
            © {new Date().getFullYear()} МедОК. Все права защищены.
          </Text>
        </Stack>
      </Container>
    </Box>
  )
}

export default Footer