// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Login from './components/auth/LoginForm';
import Register from './components/auth/RegisterForm';
import RecipesList from './components/recipes/RecipesList';
import RecipeDetail from './components/recipes/RecipeDetail';
import CreateRecipe from './components/recipes/CreateRecipe';
import EditRecipe from './components/recipes/EditRecipe';
import NotFound from './pages/NotFound';
import ThrottleErrorPage from './pages/ThrottleErrorPage';

// Protected Route component for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Main layout component that includes the header and footer
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-cream bg-opacity-30">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<RecipesList />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/throttle-error" element={<ThrottleErrorPage />} />

            {/* Protected routes - require authentication */}
            <Route 
              path="/recipe/new" 
              element={
                <ProtectedRoute>
                  <CreateRecipe />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/recipe/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditRecipe />
                </ProtectedRoute>
              } 
            />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;