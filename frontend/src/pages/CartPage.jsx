import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeItem, updateQty } from '../slices/cartSlice';
import QuantitySelector from '../components/QuantitySelector';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage(){
  const cart = useSelector(s => s.cart.items);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const total = cart.reduce((s,i)=>s + i.price*i.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Votre panier</h2>
      {cart.length===0 ? (
        <div className="card p-6 text-center">
          <div className="text-lg font-semibold mb-2">Votre panier est vide</div>
          <div className="text-sm text-gray-600 mb-4">Ajoutez des produits depuis la boutique pour les retrouver ici.</div>
          <Link to="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Continuer mes achats</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            {cart.map(it => (
              <div key={it.productId} className="p-3 card mb-2 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={it.imageUrl || 'https://via.placeholder.com/60'} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <div className="font-semibold">{it.name}</div>
                    <div>{it.price} €</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <QuantitySelector small value={it.quantity} onChange={(q)=>dispatch(updateQty({ productId: it.productId, quantity: q }))} />
                  <button onClick={()=>dispatch(removeItem(it.productId))} className="text-red-600 hover:underline active:scale-[0.98]">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 card">
            <div className="font-bold">Total: {total.toFixed(2)} €</div>
            <button onClick={()=>nav('/checkout')} className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Passer à la caisse</button>
          </div>
        </div>
      )}
    </div>
  );
}
