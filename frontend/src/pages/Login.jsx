import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError('');
      await dispatch(login({ email, password })).unwrap();
      nav('/');
      toast.success('Connexion réussie');
    } catch (err) { setError('Identifiants invalides'); toast.error('Erreur de connexion'); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Connexion</h2>
      <form onSubmit={submit} className="space-y-3 card">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <input value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Email" className="w-full p-2 border rounded focus:ring-brand-500 focus:border-brand-500" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Mot de passe" className="w-full p-2 border rounded focus:ring-brand-500 focus:border-brand-500" />
        <button disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50">{loading ? 'Connexion...' : 'Se connecter'}</button>
      </form>
    </div>
  );
}
