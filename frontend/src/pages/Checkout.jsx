import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import API from '../api/axios';
import { clearCart } from '../slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { downloadInvoicePdf } from '../utils/pdf';

export default function Checkout(){
  const cart = useSelector(s => s.cart.items);
  const [address, setAddress] = useState('');
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [vatRate] = useState(0.2); // 20% par défaut

  const submit = async () => {
    if (cart.length===0) { setError('Panier vide'); return; }
    try {
      setLoading(true); setError(''); setSuccess('');
      const res = await API.post('/orders', { items: cart.map(i=>({ productId: i.productId, quantity: i.quantity })), address });
      setSuccess('Commande créée avec succès');
      toast.success('Commande créée');
      // fetch order for invoice
      const my = await API.get('/orders/my');
      const created = (my.data || []).find(o => o.id === res.data?.orderId) || (my.data || [])[0];
      if (created) downloadInvoicePdf(created);
      dispatch(clearCart());
      nav('/orders');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur commande';
      setError(msg);
      toast.error(msg);
    }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span><span>Panier</span></div>
        <span className="opacity-50">›</span>
        <div className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span><span>Informations</span></div>
        <span className="opacity-50">›</span>
        <div className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs">3</span><span>Paiement</span></div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="text-lg font-semibold mb-3">Adresse de livraison</h2>
            {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
            {success && <div className="text-sm text-green-700 mb-2">{success}</div>}
            <textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="Rue, Ville, Code postal, Pays" className="mt-1 w-full p-3 border rounded mb-4 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700" rows={4} />
            <h3 className="text-lg font-semibold mb-2">Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Code promo</label>
                <input value={promoCode} onChange={e=>setPromoCode(e.target.value)} placeholder="PROMO10" className="mt-1 w-full p-2 border rounded focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">TVA</label>
                <input value={(vatRate*100).toFixed(0)+'%'} readOnly className="mt-1 w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700" />
              </div>
            </div>
            <button disabled={loading} onClick={submit} className="mt-4 w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">{loading ? 'Validation...' : 'Valider la commande'}</button>
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="card p-5 md:sticky md:top-24">
            <h3 className="text-lg font-semibold mb-3">Récapitulatif</h3>
            {cart.map(it => (
              <div key={it.productId} className="flex items-center justify-between border-b py-2 last:border-0 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <img src={it.imageUrl || 'https://via.placeholder.com/60'} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <div className="font-medium text-sm">{it.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">x{it.quantity} — {it.price} €</div>
                  </div>
                </div>
                <div className="font-medium">{(it.price * it.quantity).toFixed(2)} €</div>
              </div>
            ))}
            {(() => {
              const sub = cart.reduce((s,i)=>s+i.price*i.quantity,0);
              const discount = promoCode.trim().toUpperCase()==='PROMO10' ? sub*0.1 : 0;
              const vat = (sub - discount) * vatRate;
              const total = sub - discount + vat;
              return (
                <div className="space-y-1 mt-4">
                  <div className="flex justify-between"><span>Sous-total</span><span>{sub.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-emerald-700"><span>Remise</span><span>-{discount.toFixed(2)} €</span></div>
                  <div className="flex justify-between"><span>TVA ({(vatRate*100).toFixed(0)}%)</span><span>{vat.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{total.toFixed(2)} €</span></div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
