import React, { useState } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';

const emptyItem = { name: '', item_type_id: '', purchase_date: '', stock_available: true };

function PurchaseForm({ itemTypes, onSubmit }) {
  const [items, setItems] = useState([{ ...emptyItem, id: Date.now() }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRow = () => {
    setItems([...items, { ...emptyItem, id: Date.now() }]);
  };

  const handleRemoveRow = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Prepare payload (remove local id)
    const payload = items.map(({ id, ...rest }) => ({
      ...rest,
      item_type_id: parseInt(rest.item_type_id, 10)
    }));

    await onSubmit(payload);
    
    // Reset form after successful submission
    setItems([{ ...emptyItem, id: Date.now() }]);
    setIsSubmitting(false);
  };

  return (
    <div className="glass-card">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>New Purchase</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add one or multiple items to the inventory.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {items.map((item, index) => (
          <div key={item.id} className="item-row">
            <div>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Item Name"
                  className="form-control"
                  value={item.name}
                  onChange={(e) => handleChange(item.id, 'name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <select
                  className="form-control"
                  value={item.item_type_id}
                  onChange={(e) => handleChange(item.id, 'item_type_id', e.target.value)}
                  required
                >
                  <option value="" disabled>Select Type</option>
                  {itemTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <input
                    type="date"
                    className="form-control"
                    value={item.purchase_date}
                    onChange={(e) => handleChange(item.id, 'purchase_date', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                  <label className="checkbox-wrapper" style={{ margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={item.stock_available}
                      onChange={(e) => handleChange(item.id, 'stock_available', e.target.checked)}
                    />
                    <span style={{ fontSize: '0.85rem' }}>In Stock</span>
                  </label>
                </div>
              </div>
            </div>
            {items.length > 1 && (
              <div className="remove-col">
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ padding: '0.5rem' }}
                  onClick={() => handleRemoveRow(item.id)}
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddRow}
            style={{ flex: 1 }}
          >
            <Plus size={18} /> Add Row
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ flex: 2 }}
          >
            {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Purchase</>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PurchaseForm;
