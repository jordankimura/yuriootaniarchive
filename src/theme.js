import { extendTheme } from '@chakra-ui/react'

// Custom theme with purple/blue colors
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #1a0033 0%, #0a1628 100%)',
        color: 'white',
        minH: '100vh',
      },
    },
  },
  colors: {
    brand: {
      500: '#6a00ff', // Main purple
    },
  },
})

export default theme
