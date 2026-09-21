import React from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";

export default function TopProductsCard({
  products = [],
  currencyFormatter,
}) {
  // Fallback demo top products if no orders yet
  const displayProducts =
    products && products.length > 0
      ? products.slice(0, 5)
      : [
          {
            title: "iPhone 17 Pro 256GB Natural Titanium",
            unitsSold: 182,
            totalRevenue: 2184000,
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=120&q=80",
          },
          {
            title: "Apple MacBook Air M4 (16GB, 512GB)",
            unitsSold: 94,
            totalRevenue: 1128000,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=120&q=80",
          },
          {
            title: "AirPods Pro (2nd Generation) USB-C",
            unitsSold: 84,
            totalRevenue: 209916,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80",
          },
          {
            title: "Samsung Galaxy S25 Ultra 512GB",
            unitsSold: 73,
            totalRevenue: 948927,
            image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=120&q=80",
          },
          {
            title: "Sony WH-1000XM5 Noise Canceling",
            unitsSold: 61,
            totalRevenue: 243939,
            image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=120&q=80",
          },
        ];

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-heading font-bold text-white">
            Top Selling Products
          </h2>
          <p className="text-[11px] text-slate-400">By sales volume & gross earnings</p>
        </div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white group transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Table list */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-2 w-6">#</th>
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3 text-center">Sold</th>
              <th className="py-2.5 px-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayProducts.map((p, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-2 font-mono text-slate-500 font-bold text-xs">
                  {idx + 1}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5 max-w-[200px] sm:max-w-[240px]">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <span className="font-medium text-white truncate text-xs">
                      {p.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center font-mono font-semibold text-slate-300">
                  {p.unitsSold}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                  {currencyFormatter
                    ? currencyFormatter(p.totalRevenue)
                    : `₹${p.totalRevenue.toLocaleString()}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
