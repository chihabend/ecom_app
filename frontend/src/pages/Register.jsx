import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register(){
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const dispatch = useDispatch(); const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError('');
      await dispatch(register({ name, email, password })).unwrap();
      nav('/');
      toast.success('Compte créé');
    } catch (err) { const msg = err?.message || 'Erreur inscription'; setError(msg); toast.error(msg); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Inscription</h2>
      <form onSubmit={submit} className="space-y-3 card">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <input value={name} onChange={e=>setName(e.target.value)} required placeholder="Nom" className="w-full p-2 border rounded focus:ring-brand-500 focus:border-brand-500" />
        <input value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Email" className="w-full p-2 border rounded focus:ring-brand-500 focus:border-brand-500" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Mot de passe" className="w-full p-2 border rounded focus:ring-brand-500 focus:border-brand-500" />
        <button disabled={loading} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">{loading ? 'Création...' : "S'inscrire"}</button>
      </form>
    </div>
  );
}
