import './App.css';
import { Route, Routes, useNavigate} from 'react-router-dom';
import Homepage from './pages/Homepage.js';
import Chatpage from './pages/Chatpage.js';
import Temp from './pages/Temp.js';



function App() {
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage />} />

        
          
            <Route path="/chats" element={<Chatpage />} />
            <Route path="/chats/temp" element={<Temp />} />
          
        
      </Routes>
    </div>
  );
}

export default App;
