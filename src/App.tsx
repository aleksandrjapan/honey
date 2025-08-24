import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import OrderConfirmation from './pages/OrderConfirmation'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" display="flex" flexDirection="column">
          <Header />
          <Box flex="1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-status" element={<OrderStatus />} />
              <Route path="/order-status/:orderId" element={<OrderStatus />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ChakraProvider>
  )
}

export default App