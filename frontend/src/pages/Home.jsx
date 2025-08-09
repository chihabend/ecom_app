import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../slices/productSlice';
import ProductCard from '../components/ProductCard';
import { motion, useScroll, useTransform } from 'framer-motion';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';

export default function Home() {
  const dispatch = useDispatch();
  const { list: products, status } = useSelector(s => s.products);

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  const [sliderRef] = useKeenSlider({ loop: true, renderMode: 'performance', slides: { perView: 1 } }, [
    (slider) => {
      let timeout;
      let mouseOver = false;
      function clearNextTimeout() { clearTimeout(timeout); }
      function nextTimeout() {
        clearTimeout(timeout);
        if (mouseOver) return;
        timeout = setTimeout(() => { slider.next(); }, 2500);
      }
      slider.on('created', () => {
        slider.container.addEventListener('mouseover', () => { mouseOver = true; clearNextTimeout(); });
        slider.container.addEventListener('mouseout', () => { mouseOver = false; nextTimeout(); });
        nextTimeout();
      });
      slider.on('dragStarted', clearNextTimeout);
      slider.on('animationEnded', nextTimeout);
      slider.on('updated', nextTimeout);
    }
  ]);

  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 200], [0, -30]);
  const [deadline] = React.useState(() => {
    // promo dans 72h
    const d = new Date(); d.setHours(d.getHours() + 72); return d;
  });
  const [now, setNow] = React.useState(new Date());
  React.useEffect(()=>{
    const t = setInterval(()=> setNow(new Date()), 1000);
    return ()=> clearInterval(t);
  }, []);
  const remaining = Math.max(0, deadline - now);
  const sec = Math.floor(remaining / 1000) % 60;
  const min = Math.floor(remaining / (1000*60)) % 60;
  const hrs = Math.floor(remaining / (1000*60*60)) % 24;
  const days = Math.floor(remaining / (1000*60*60*24));

  return (
    <div className="container mx-auto p-4">
      <motion.div style={{ y: yParallax }} ref={sliderRef} className="keen-slider rounded-xl overflow-hidden mb-6">
        <div className="keen-slider__slide relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold">Bienvenue sur E‑Shop</h1>
            <p className="text-sm text-blue-100 mt-2">Découvrez nos nouveautés et meilleures ventes à prix malin.</p>
          </div>
          <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur px-3 py-2 rounded">
            <div className="text-xs">Promo se termine dans</div>
            <div className="text-lg font-semibold">{days}j {hrs}h {min}m {sec}s</div>
          </div>
        </div>
        <div className="keen-slider__slide bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold">Livraison rapide</h2>
            <p className="text-sm text-pink-100 mt-2">Expédition sous 24/48h sur la majorité des produits.</p>
          </div>
        </div>
        <div className="keen-slider__slide bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold">Qualité au meilleur prix</h2>
            <p className="text-sm text-emerald-100 mt-2">Sélection de produits fiables, garanties constructeurs.</p>
          </div>
        </div>
      </motion.div>
      {status === 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_,i)=>(
            <div key={i} className="animate-pulse rounded-xl bg-white p-4 ring-1 ring-gray-200">
              <div className="h-48 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded mt-4 w-3/4" />
              <div className="h-3 bg-gray-200 rounded mt-2 w-2/3" />
              <div className="h-8 bg-gray-200 rounded mt-4 w-1/2" />
            </div>
          ))}
        </div>
      )}
      {status !== 'loading' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p,i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
