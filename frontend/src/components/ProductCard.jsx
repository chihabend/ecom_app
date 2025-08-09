import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuantitySelector from './QuantitySelector';
import { useDispatch } from 'react-redux';
import { addItem } from '../slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const handleAdd = () => {
    dispatch(addItem({ productId: product.id, name: product.name, price: product.price, quantity: qty, imageUrl: product.imageUrl }));
    setQty(1);
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="group rounded-xl bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md transition overflow-hidden dark:bg-gray-900 dark:ring-gray-800">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative">
          <img src={product.imageUrl || 'https://via.placeholder.com/600x400'} alt={product.name} className="h-48 w-full object-cover" />
          {product.stock === 0 && (<span className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded">Rupture</span>)}
          {product.isNew && (<span className="absolute top-2 left-2 text-xs bg-emerald-600 text-white px-2 py-1 rounded">Nouveau</span>)}
          {product.isPromo && (<span className="absolute top-2 left-20 text-xs bg-pink-600 text-white px-2 py-1 rounded">Promo</span>)}
        </div>
        <div className="p-4">
          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1 dark:text-gray-300">{product.description}</p>
        </div>
      </Link>
      <div className="px-4 pb-4 -mt-2">
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="font-bold text-lg">{product.price} €</span>
          <div className="flex items-center gap-2">
            <QuantitySelector value={qty} onChange={setQty} small max={Math.max(1, product.stock || 99)} />
            <button disabled={product.stock===0} onClick={handleAdd} className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">Ajouter</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
