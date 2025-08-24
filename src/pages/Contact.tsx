import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  SimpleGrid,
  Link
} from '@chakra-ui/react'

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Форма отправлена! Мы свяжемся с вами в ближайшее время.')
  }

  return (
    <Box py={20} minWidth="100vw">
      <Container maxW="container.xl">
        <Stack spacing={12}>
          <Stack spacing={6} textAlign="center">
            <Heading as="h1" size="2xl" color="brown.800">
              Свяжитесь с нами
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
              У вас есть вопросы? Мы всегда рады помочь вам!
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
            <Stack spacing={8}>
              <Heading as="h2" size="lg" color="brown.800">
                Контактная информация
              </Heading>
              
              <Stack spacing={4}>
                <Stack direction="row" align="center">
                  <Box
                    w={10}
                    h={10}
                    bg="yellow.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    📞
                  </Box>
                  <Link href="tel:+79001234567" color="brown.800">
                    +7 (900) 123-45-67
                  </Link>
                </Stack>

                <Stack direction="row" align="center">
                  <Box
                    w={10}
                    h={10}
                    bg="yellow.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    ✉️
                  </Box>
                  <Link href="mailto:info@medok.ru" color="brown.800">
                    info@medok.ru
                  </Link>
                </Stack>
              </Stack>
            </Stack>

            <Box
              as="form"
              onSubmit={handleSubmit}
              bg="white"
              p={8}
              borderRadius="lg"
              boxShadow="md"
            >
              <Stack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color="brown.800">Имя</FormLabel>
                  <Input type="text" bg="gray.50" />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brown.800">Email</FormLabel>
                  <Input type="email" bg="gray.50" />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brown.800">Сообщение</FormLabel>
                  <Textarea bg="gray.50" rows={5} />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="yellow"
                  bg="yellow.400"
                  _hover={{ bg: 'yellow.500' }}
                  size="lg"
                >
                  Отправить сообщение
                </Button>
              </Stack>
            </Box>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  )
}

export default Contact