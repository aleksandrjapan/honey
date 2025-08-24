import { Box, Container, Heading, Text, Image, SimpleGrid, Stack } from '@chakra-ui/react'

const About = () => {
  return (
    <Box py={20} minWidth="100vw">
      <Container maxW="container.xl">
        <Stack spacing={12}>
          <Stack spacing={6} textAlign="center">
            <Heading as="h1" size="2xl" color="brown.800">
              О нашей пасеке
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
              Мы - семейная пасека с многолетней историей. Наша миссия - производить 
              высококачественный мёд и делиться с вами дарами природы.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
            <Box>
              <Image
                src="https://via.placeholder.com/600x400"
                alt="Наша пасека"
                borderRadius="lg"
                boxShadow="lg"
              />
            </Box>
            <Stack spacing={6} justify="center">
              <Heading as="h2" size="xl" color="brown.800">
                Наша история
              </Heading>
              <Text color="gray.600">
                Наша пасека была основана более 20 лет назад. Сегодня у нас более 100 
                пчелиных семей, расположенных в экологически чистом районе.
              </Text>
              <Text color="gray.600">
                Мы заботимся о здоровье наших пчёл и качестве продукции. Каждая партия 
                мёда проходит строгий контроль качества.
              </Text>
            </Stack>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  )
}

export default About