import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct'; 
import ProductList from './pages/ProductList';
import RecordSale from './pages/RecordSale';
import AIInsights from './pages/AIInsights';
import SaleHistory from './pages/SaleHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
          <Route path="products" element={<ProductList />} />
          <Route path="record-sale" element={<RecordSale />} />
          <Route path="sales" element={<SaleHistory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;