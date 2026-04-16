import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/api/productService';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';

export const Compare = () => {
  const [params] = useSearchParams();
  const [rows, setRows] = useState<Product[]>([]);
  const { compare } = useStore();
  const ids = ((params.get('ids') || '').split(',').filter(Boolean).length ? (params.get('ids') || '').split(',').filter(Boolean) : compare.map((p) => p.id));

  useEffect(() => {
    void (async () => {
      setRows(await productService.compare(ids));
    })();
  }, [params]);

  if (!ids.length) {
    return <div className="container-custom py-12">No products selected. Use compare icon from product cards.</div>;
  }

  return (
    <div className="container-custom py-12 overflow-x-auto">
      <h1 className="text-4xl font-extrabold mb-8">Compare Products</h1>
      <table className="w-full min-w-[900px] text-left border-collapse">
        <thead>
          <tr>
            <th className="p-3 border-b">Field</th>
            {rows.map((p) => (
              <th key={p.id} className="p-3 border-b">
                <Link to={`/product/${p.id}`} className="group block">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-28 h-28 object-cover rounded-xl mb-3 border border-slate-200 dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <span className="hover:underline group-hover:underline">{p.name}</span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-3 border-b font-semibold">Brand</td>{rows.map((p) => <td key={`${p.id}-b`} className="p-3 border-b">{p.brand}</td>)}</tr>
          <tr><td className="p-3 border-b font-semibold">Category</td>{rows.map((p) => <td key={`${p.id}-c`} className="p-3 border-b">{p.category}</td>)}</tr>
          <tr><td className="p-3 border-b font-semibold">Price</td>{rows.map((p) => <td key={`${p.id}-p`} className="p-3 border-b">{formatPrice(p.price)}</td>)}</tr>
          <tr><td className="p-3 border-b font-semibold">Rating</td>{rows.map((p) => <td key={`${p.id}-r`} className="p-3 border-b">{p.rating}</td>)}</tr>
          <tr><td className="p-3 border-b font-semibold">Stock</td>{rows.map((p) => <td key={`${p.id}-s`} className="p-3 border-b">{p.stock}</td>)}</tr>
          <tr>
            <td className="p-3 border-b font-semibold">Specs</td>
            {rows.map((p) => (
              <td key={`${p.id}-sp`} className="p-3 border-b">
                {Object.entries(p.specs || {}).map(([k, v]) => (
                  <div key={k}><span className="font-semibold">{k}:</span> {v}</div>
                ))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
