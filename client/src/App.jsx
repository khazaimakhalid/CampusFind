
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ItemsProvider } from './context/ItemsContext';

import Home from './pages/Home';
import ReportItem from './pages/ReportItem';
import ItemDetails from './pages/ItemDetails';
import FoundRequest from './pages/FoundRequest';
import Login from './pages/Login';
import Register from './pages/Register';
import MyReports from './pages/MyReports';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ItemsProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/items/:id" element={<ItemDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportItem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/found-request/:id"
            element={
              <ProtectedRoute>
                <FoundRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-reports"
            element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ItemsProvider>
    </BrowserRouter>
  );
}

export default App;
