import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { useDispatch } from 'react-redux';
import { addItem } from '../slices/cartSlice';
import { motion } from 'framer-motion';
import QuantitySelector from '../components/QuantitySelector';

export default function ProductDetails(){
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(()=>{
    API.get(`/products/${productId}`).then(r=>setProduct(r.data)).finally(()=>setLoading(false));
  }, [productId]);

  if (loading) return <div className="container mx-auto p-4"><div className="card p-6">Chargement...</div></div>;
  if (!product) return <div className="container mx-auto p-4"><div className="card p-6">Produit introuvable</div></div>;

  const [qty, setQty] = useState(1);
  const add = () => dispatch(addItem({ productId: product.id, name: product.name, price: product.price, quantity: qty, imageUrl: product.imageUrl }));

  return (
    <div className="container mx-auto p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid md:grid-cols-2 gap-6 card p-4">
        <div>
          <img src={(product.images && product.images[0]) || product.imageUrl || 'https://via.placeholder.com/800x600'} alt={product.name} className="w-full h-80 object-cover rounded"/>
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {product.images && product.images.length > 1 && product.images.map((src, idx) => (
              <img key={idx} onClick={()=>{ const imgs=[...product.images]; const [first]=imgs.splice(idx,1); setProduct(p=>({...p, images:[first, ...imgs]})); }} src={src} className="w-16 h-16 object-cover rounded ring-1 ring-gray-200 cursor-pointer hover:ring-blue-500" />
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <div className="text-gray-600 mt-2">{product.description}</div>
          <div className="mt-4 text-3xl font-bold">{product.price} €</div>
          <div className="mt-2 text-sm text-gray-500">Stock: {product.stock}</div>
          <div className="mt-4 flex items-center gap-3">
            <QuantitySelector value={qty} onChange={setQty} max={Math.max(1, product.stock || 99)} />
            <button disabled={product.stock===0} onClick={add} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50">Ajouter au panier</button>
          </div>
        </div>
      </motion.div>
      <SimilarProducts currentId={product.id} />
    </div>
  );
}

function SimilarProducts({ currentId }){
  const [items, setItems] = useState([]);
  useEffect(()=>{
    API.get('/products', { params: { limit: 6 } }).then(r => {
      const arr = (r.data.items || r.data).filter(p => p.id !== currentId).slice(0, 6);
      setItems(arr);
    });
  }, [currentId]);

  if (!items.length) return null;
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-3">Produits similaires</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(p => (
          <div key={p.id} className="card p-4">
            <div className="flex items-center gap-3">
              <img src={p.imageUrl || 'https://via.placeholder.com/150'} className="w-20 h-20 object-cover rounded"/>
              <div>
                <div className="font-medium line-clamp-1">{p.name}</div>
                <div className="text-sm text-gray-600">{p.price} €</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


