import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'; 
import StravaCallback from './components/StravaCallback';
import StravaStats from './components/stravastats/StravaStats';
import StravaWeek from './components/stravaweek/StravaWeek';
import Login from './components/login/Login';
import MyAccount from './components/acc/Account';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import Navbar from './components/navbar/Navbar'; // Import the Navbar component

const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <Navbar /> {/* Include the Navbar here */}
        <Routes>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/register' element={<Login/>}></Route>
          
          <Route path='/account' element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          }></Route>

          
          <Route path="/callback" element={<StravaCallback />} />
          
          <Route path="/stats" element={<StravaStats />} />
          
          <Route path="/week" element={<StravaWeek />} />
        </Routes>
      </Router>
    </DndProvider>
  );
};

export default App;
