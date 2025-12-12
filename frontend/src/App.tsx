import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ShowList } from './pages/ShowList';
import { SeatSelection } from './pages/SeatSelection';
import { BookingConfirmation } from './pages/BookingConfirmation';
import { Navbar } from './components/Navbar';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ShowList />} />
              <Route path="/shows/:id/seats" element={<SeatSelection />} />
              <Route path="/bookings/:id" element={<BookingConfirmation />} />
            </Routes>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;

