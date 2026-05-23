'use client'

import { useState } from 'react'
import { ReserveDialog } from './reserve-dialog'

interface InventoryItem {
  warehouseId: string
  warehouseName: string
  warehouseLocation: string
  totalUnits: number
  reservedUnits: number
  availableUnits: number
}

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  price: number
  inventory: InventoryItem[]
}

export function ProductCard({ product, onReserved }: { product: Product; onReserved: () => void }) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<InventoryItem | null>(null)

  return (
    <>
      <div
        className="rounded-lg p-5 transition-shadow hover:shadow-md"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted)' }}>SKU: {product.sku}</p>
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>

        {product.description && (
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{product.description}</p>
        )}

        {/* stock table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th className="text-left py-2 font-medium" style={{ color: 'var(--muted)' }}>Warehouse</th>
                <th className="text-center py-2 font-medium" style={{ color: 'var(--muted)' }}>Available</th>
                <th className="text-center py-2 font-medium" style={{ color: 'var(--muted)' }}>Reserved</th>
                <th className="text-right py-2"></th>
              </tr>
            </thead>
            <tbody>
              {product.inventory.map((inv) => (
                <tr key={inv.warehouseId} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td className="py-2.5">
                    <div className="font-medium text-sm">{inv.warehouseName}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{inv.warehouseLocation}</div>
                  </td>
                  <td className="text-center py-2.5">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: inv.availableUnits <= 3 ? '#fef2f2' : '#f0fdf4',
                        color: inv.availableUnits <= 3 ? '#991b1b' : '#166534',
                      }}
                    >
                      {inv.availableUnits}
                    </span>
                  </td>
                  <td className="text-center py-2.5">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {inv.reservedUnits}
                    </span>
                  </td>
                  <td className="text-right py-2.5">
                    <button
                      onClick={() => setSelectedWarehouse(inv)}
                      disabled={inv.availableUnits === 0}
                      className="px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: inv.availableUnits > 0 ? 'var(--primary)' : '#9ca3af',
                      }}
                      onMouseEnter={(e) => {
                        if (inv.availableUnits > 0) {
                          e.currentTarget.style.background = 'var(--primary-hover)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (inv.availableUnits > 0) {
                          e.currentTarget.style.background = 'var(--primary)'
                        }
                      }}
                    >
                      {inv.availableUnits === 0 ? 'Out of Stock' : 'Reserve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedWarehouse && (
        <ReserveDialog
          product={product}
          warehouse={selectedWarehouse}
          onClose={() => setSelectedWarehouse(null)}
          onReserved={onReserved}
        />
      )}
    </>
  )
}
