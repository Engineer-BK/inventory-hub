import React, { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';

function InventoryTable({ items, itemTypes, loading, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditFormData({
      name: item.name,
      item_type_id: item.item_type_id,
      purchase_date: new Date(item.purchase_date).toISOString().split('T')[0],
      stock_available: item.stock_available
    });
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleSaveClick = async (id) => {
    await onUpdate(id, editFormData);
    setEditingId(null);
  };

  const handleChange = (field, value) => {
    setEditFormData({ ...editFormData, [field]: value });
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Loading Inventory...</div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Current Inventory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage and track your available stock.</p>
        </div>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>
          Total Items: {items.length}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Purchase Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No items found. Add some items using the form.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  {editingId === item.id ? (
                    // Edit Mode
                    <>
                      <td>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={editFormData.name} 
                          onChange={(e) => handleChange('name', e.target.value)} 
                          style={{ padding: '0.5rem' }}
                        />
                      </td>
                      <td>
                        <select 
                          className="form-control" 
                          value={editFormData.item_type_id} 
                          onChange={(e) => handleChange('item_type_id', e.target.value)}
                          style={{ padding: '0.5rem' }}
                        >
                          {itemTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.type_name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={editFormData.purchase_date} 
                          onChange={(e) => handleChange('purchase_date', e.target.value)}
                          style={{ padding: '0.5rem' }}
                        />
                      </td>
                      <td>
                        <label className="checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            checked={editFormData.stock_available} 
                            onChange={(e) => handleChange('stock_available', e.target.checked)}
                          />
                        </label>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" onClick={() => handleSaveClick(item.id)} style={{ padding: '0.5rem', color: 'var(--success)' }} title="Save">
                            <Check size={16} />
                          </button>
                          <button className="btn btn-secondary" onClick={handleCancelClick} style={{ padding: '0.5rem', color: 'var(--danger)' }} title="Cancel">
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td>
                        <span style={{ color: 'var(--secondary)' }}>{item.type_name}</span>
                      </td>
                      <td>{new Date(item.purchase_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${item.stock_available ? 'status-in-stock' : 'status-out-stock'}`}>
                          {item.stock_available ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" onClick={() => handleEditClick(item)} style={{ padding: '0.5rem' }} title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button className="btn btn-danger" onClick={() => onDelete(item.id)} style={{ padding: '0.5rem' }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryTable;
