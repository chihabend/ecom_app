import React, { useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import { downloadInvoicePdf } from '../utils/pdf';

export default function Orders(){
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    API.get('/orders/my')
      .then(r => setOrders(r.data))
      .finally(()=> setLoading(false));
  }, []);

  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState({ key: 'id', dir: 'desc' });
  const filtered = useMemo(() => orders.filter(o => !statusFilter || o.status === statusFilter), [orders, statusFilter]);
  const sorted = useMemo(() => [...filtered].sort((a,b)=>{
    const m = sort.dir === 'asc' ? 1 : -1;
    const av = sort.key==='total'?a.total:sort.key==='status'?a.status:a.id;
    const bv = sort.key==='total'?b.total:sort.key==='status'?b.status:b.id;
    if (av < bv) return -1*m; if (av > bv) return 1*m; return 0;
  }), [filtered, sort]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Mes commandes</h2>
      {loading && <div className="text-sm text-gray-600">Chargement...</div>}
      <div className="flex items-center gap-2 mb-3">
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border rounded p-2 text-sm dark:bg-gray-900 dark:border-gray-700">
          <option value="">Toutes</option>
          <option value="pending">En attente</option>
          <option value="shipped">Expédiée</option>
          <option value="delivered">Livrée</option>
        </select>
        <select value={sort.key+':'+sort.dir} onChange={e=>{ const [k,d]=e.target.value.split(':'); setSort({ key:k, dir:d }); }} className="border rounded p-2 text-sm dark:bg-gray-900 dark:border-gray-700">
          <option value="id:desc">ID desc</option>
          <option value="id:asc">ID asc</option>
          <option value="total:desc">Total desc</option>
          <option value="total:asc">Total asc</option>
          <option value="status:asc">Status A-Z</option>
          <option value="status:desc">Status Z-A</option>
        </select>
      </div>
      {sorted.length===0 ? <div>Aucune commande</div> : sorted.map(o=>(
        <div key={o.id} className="card p-4 mb-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Commande #{o.id} — <span className={`text-xs px-2 py-0.5 rounded ${o.status==='pending'?'bg-yellow-100 text-yellow-800': o.status==='shipped'?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>{o.status}</span></div>
            <button onClick={()=>downloadInvoicePdf(o)} className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Télécharger facture (PDF)</button>
          </div>
          <div className="mt-1">Total: {o.total} €</div>
          <div>Adresse: {o.address}</div>
          <div className="mt-2">
            {o.items.map(it=>(
              <div key={it.id} className="border-t pt-2 dark:border-gray-800">
                {it.Product?.name} x {it.quantity} — {it.price} €
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
