import React, { useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct, setPage } from '../slices/productSlice';
import toast from 'react-hot-toast';
import { downloadOrdersPdf } from '../utils/pdf';

export default function AdminDashboard(){
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const dispatch = useDispatch();
  const { list: products, page, totalPages } = useSelector(s => s.products);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ id: null, name: '', description: '', price: '', imageUrl: '', stock: 0, images: '', isNew: false, isPromo: false });
  const isEditing = useMemo(() => form.id !== null, [form.id]);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderSort, setOrderSort] = useState({ key: 'id', dir: 'desc' });

  useEffect(()=> { load(); dispatch(fetchProducts({ page })); }, [page]);

  const load = async () => {
    const s = await API.get('/admin/stats'); setStats(s.data);
    const o = await API.get('/admin/orders', { params: { page: orderPage, status: orderStatus || undefined } });
    setOrders(o.data.items || o.data);
    setOrderTotalPages(o.data.totalPages || 1);
  };

  const exportCsv = (rows) => {
    const header = ['id','user','total','status','address'];
    const lines = [header.join(',')];
    (rows || []).forEach(o => {
      const line = [o.id, JSON.stringify(o.User?.name || ''), o.total, o.status, JSON.stringify(o.address || '')].join(',');
      lines.push(line);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (key) => {
    setOrderSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const sortedOrders = [...orders].sort((a,b) => {
    const { key, dir } = orderSort;
    const m = dir === 'asc' ? 1 : -1;
    let av, bv;
    if (key === 'id') { av = a.id; bv = b.id; }
    else if (key === 'total') { av = a.total; bv = b.total; }
    else if (key === 'status') { av = a.status; bv = b.status; }
    else { av = 0; bv = 0; }
    if (av < bv) return -1 * m;
    if (av > bv) return 1 * m;
    return 0;
  });

  const updateStatus = async (id, status) => {
    await API.put(`/admin/orders/${id}/status`, { status });
    toast.success('Statut mis à jour');
    load();
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock), images: (form.images||'').split(',').map(s=>s.trim()).filter(Boolean) };
    if (isNaN(payload.price) || isNaN(payload.stock)) return alert('Prix/stock invalides');
    if (isEditing) {
      await dispatch(updateProduct({ id: form.id, data: payload })).unwrap();
      toast.success('Produit mis à jour');
    } else {
      await dispatch(createProduct(payload)).unwrap();
      toast.success('Produit créé');
    }
    setForm({ id: null, name: '', description: '', price: '', imageUrl: '', stock: 0, images: '', isNew: false, isPromo: false });
  };

  const editProduct = (p) => {
    setForm({ id: p.id, name: p.name, description: p.description || '', price: String(p.price), imageUrl: p.imageUrl || '', stock: p.stock || 0, images: (p.images||[]).join(', '), isNew: !!p.isNew, isPromo: !!p.isPromo });
  };

  const removeProduct = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await dispatch(deleteProduct(id)).unwrap();
    toast.success('Produit supprimé');
  };

  const search = async (e) => {
    e.preventDefault();
    dispatch(fetchProducts({ q: query, page: 1 }));
    dispatch(setPage(1));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Stats</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-4 rounded-lg ring-1 ring-blue-200 dark:ring-blue-900 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900">
              <div className="text-gray-600 dark:text-gray-300">Commandes</div>
              <div className="text-2xl font-bold">{stats?.totalOrders ?? '—'}</div>
            </div>
            <div className="p-4 rounded-lg ring-1 ring-emerald-200 dark:ring-emerald-900 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-900">
              <div className="text-gray-600 dark:text-gray-300">Ventes</div>
              <div className="text-2xl font-bold">{stats?.sales ?? 0} €</div>
            </div>
          </div>
        </div>
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Commandes</h3>
            <div className="flex items-center gap-2">
              <input placeholder="Rechercher (client, id)" className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700" onChange={()=>{}} />
              <select value={orderStatus} onChange={(e)=>{ setOrderStatus(e.target.value); setOrderPage(1); setTimeout(load,0); }} className="border rounded p-2 text-sm dark:bg-gray-900 dark:border-gray-700">
                <option value="">Toutes</option>
                <option value="pending">En attente</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
              </select>
              <select onChange={e=>{ const val=e.target.value; const now=new Date(); let start=null; if(val==='day'){ start=new Date(now.getFullYear(),now.getMonth(),now.getDate()); } else if(val==='month'){ start=new Date(now.getFullYear(), now.getMonth(), 1);} else if(val==='year'){ start=new Date(now.getFullYear(),0,1);} /* placeholder: apply client-side filter or request server with dates */ }} className="border rounded p-2 text-sm dark:bg-gray-900 dark:border-gray-700">
                <option value="">Toutes périodes</option>
                <option value="day">Aujourd'hui</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
              <button onClick={()=>exportCsv(sortedOrders)} className="px-3 py-2 text-sm border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Export CSV</button>
              <button onClick={()=>downloadOrdersPdf(sortedOrders)} className="px-3 py-2 text-sm border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Export PDF</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-900">
                <tr className="text-left border-b">
                  <th className="py-2 pr-4 cursor-pointer select-none" onClick={()=>toggleSort('id')}>ID {orderSort.key==='id' ? (orderSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4 cursor-pointer select-none" onClick={()=>toggleSort('total')}>Total {orderSort.key==='total' ? (orderSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th className="py-2 pr-4 cursor-pointer select-none" onClick={()=>toggleSort('status')}>Status {orderSort.key==='status' ? (orderSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map(o => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">#{o.id}</td>
                    <td className="py-2 pr-4">{o.User?.name || '-'}</td>
                    <td className="py-2 pr-4">{o.total} €</td>
                    <td className="py-2 pr-4"><span className={`px-2 py-1 rounded text-xs ${o.status==='pending'?'bg-yellow-100 text-yellow-800': o.status==='shipped'?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>{o.status}</span></td>
                    <td className="py-2 pr-4">
                      <button onClick={()=>updateStatus(o.id,'shipped')} className="mr-2 text-blue-700 hover:underline">Expédier</button>
                      <button onClick={()=>updateStatus(o.id,'delivered')} className="mr-2 text-green-700 hover:underline">Livrer</button>
                      <button onClick={async ()=>{
                        if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) return;
                        await API.delete(`/admin/orders/${o.id}`);
                        toast.success('Commande supprimée');
                        load();
                      }} className="text-red-600 hover:underline">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button disabled={orderPage<=1} onClick={()=>{ setOrderPage(p=>p-1); setTimeout(load,0); }} className="px-3 py-1 border rounded disabled:opacity-50">Précédent</button>
            <span className="px-2 py-1">Page {orderPage} / {orderTotalPages}</span>
            <button disabled={orderPage>=orderTotalPages} onClick={()=>{ setOrderPage(p=>p+1); setTimeout(load,0); }} className="px-3 py-1 border rounded disabled:opacity-50">Suivant</button>
          </div>
        </div>
        <div className="card p-4 lg:col-span-3">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <h3 className="font-semibold mb-2">{isEditing ? 'Modifier un produit' : 'Créer un produit'}</h3>
              <form onSubmit={submitProduct} className="space-y-2">
                <input className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Nom" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
                <textarea className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
                <input type="number" step="0.01" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Prix" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} required />
                <input className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Image URL" value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} />
                <input type="number" className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Stock" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} />
                <textarea className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Autres images (séparées par des virgules)" value={form.images} onChange={e=>setForm(f=>({...f,images:e.target.value}))} />
                <div className="flex items-center gap-4 text-sm"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isNew} onChange={e=>setForm(f=>({...f,isNew:e.target.checked}))} /> Nouveau</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isPromo} onChange={e=>setForm(f=>({...f,isPromo:e.target.checked}))} /> Promo</label></div>
                <div className="flex gap-2"><button className="px-3 py-2 bg-blue-600 text-white rounded" type="submit">{isEditing ? 'Mettre à jour' : 'Créer'}</button>{isEditing && (<button type="button" className="px-3 py-2 bg-gray-200 rounded" onClick={()=>setForm({ id:null,name:'',description:'',price:'',imageUrl:'',stock:0,images:'',isNew:false,isPromo:false })}>Annuler</button>)}</div>
              </form>
            </div>
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-3"><h3 className="font-semibold">Produits</h3><form onSubmit={search} className="flex gap-2"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher..." className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700" /><button className="px-3 py-2 bg-gray-800 text-white rounded">Rechercher</button></form></div>
              {products.map(p => (<div key={p.id} className="flex items-center justify-between border p-2 rounded mb-2 dark:border-gray-800"><div><div className="font-semibold flex items-center gap-2">{p.name} {p.isNew && <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Nouveau</span>} {p.isPromo && <span className="text-xs px-2 py-0.5 rounded bg-pink-100 text-pink-800">Promo</span>}</div><div className="text-sm text-gray-600 dark:text-gray-300">{p.price} € — stock: {p.stock}</div></div><div className="flex gap-2"><button className="px-2 py-1 text-sm bg-gray-200 rounded" onClick={()=>editProduct(p)}>Modifier</button><button className="px-2 py-1 text-sm bg-red-600 text-white rounded" onClick={()=>removeProduct(p.id)}>Supprimer</button></div></div>))}
              <div className="flex justify-end gap-2 mt-3"><button disabled={page<=1} onClick={()=>dispatch(setPage(page-1))} className="px-3 py-1 border rounded disabled:opacity-50">Précédent</button><span className="px-2 py-1">Page {page} / {totalPages}</span><button disabled={page>=totalPages} onClick={()=>dispatch(setPage(page+1))} className="px-3 py-1 border rounded disabled:opacity-50">Suivant</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
