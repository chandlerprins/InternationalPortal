import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';

export default function ProtectedRoute({children, requiredRole}){
   const { isAuthenticated, userRole } = useAuth();

   if(!isAuthenticated){
       return <Navigate to="/login" replace />;
   }

   // If a specific role is required, check if user has that role
   if(requiredRole && userRole !== requiredRole){
       // Redirect based on user role
       if(userRole === 'employee'){
           return <Navigate to="/employee/login" replace />;
       } else if(userRole === 'admin'){
           return <Navigate to="/admin/login" replace />;
       } else {
           // Default to customer login for customers or unknown roles
           return <Navigate to="/login" replace />;
       }
   }

   return children;
}

