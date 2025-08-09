import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';
import ThemeToggle from './ThemeToggle';

export default function Navbar(){
  const cart = useSelector(s => s.cart.items);
  const auth = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    nav('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40 border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-xl tracking-tight hover:opacity-80">E‑Shop</Link>
          {auth.user && auth.user.role === 'admin' && <Link to="/admin" className="text-sm text-gray-700 hover:text-gray-900">Dashboard</Link>}
        </div>
        <div className="flex items-center gap-4">
          {(!auth.user || auth.user.role !== 'admin') && (
            <Link to="/cart" className="inline-flex items-center gap-2 text-sm">
              <span>Panier</span>
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-blue-600 text-white text-xs">
                {cart.reduce((s,i)=>s+i.quantity,0)}
              </span>
            </Link>
          )}
          {auth.user && auth.user.role !== 'admin' && (
            <Link to="/orders" className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50 active:scale-[0.98]">Mes commandes</Link>
          )}
          <ThemeToggle />
          {auth.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Bonjour {auth.user.name}</span>
              <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50 active:scale-[0.98]" onClick={handleLogout}>Déconnexion</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50 active:scale-[0.98]">Connexion</Link>
              <Link to="/register" className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]">Inscription</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
