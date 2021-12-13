import './App.css';
import Home from './pages/Home'
import { ChakraProvider } from "@chakra-ui/react"
require('dotenv').config()

function App() {
  return (
    <div className="App">
        <ChakraProvider>
        <Home/>
        </ChakraProvider>
    </div>
  );
}

export default App;
