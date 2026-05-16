import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PurchaseForm from './components/PurchaseForm';
import InventoryTable from './components/InventoryTable';
import { Package } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [items, setItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/items`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/item-types`);
      setItemTypes(response.data);
    } catch (error) {
      console.error('Error fetching item types:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchItems(), fetchItemTypes()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleBulkSubmit = async (newItems) => {
    try {
      await axios.post(`${API_BASE_URL}/items/bulk`, newItems);
      await fetchItems(); // Refresh table
      Swal.fire({
        title: 'Success!',
        text: 'Items successfully added to inventory.',
        icon: 'success',
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#22c55e',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error submitting items:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to submit items.',
        icon: 'error',
        background: '#ffffff',  
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      background: '#ffffff',
      color: '#1f2937',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/items/${id}`);
      await fetchItems();
      Swal.fire({
        title: 'Deleted!',
        text: 'Your item has been deleted.',
        icon: 'success',
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#22c55e',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete item.',
        icon: 'error',
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleUpdate = async (id, updatedItem) => {
    try {
      await axios.put(`${API_BASE_URL}/items/${id}`, updatedItem);
      await fetchItems();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Item updated successfully',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#22c55e'
      });
    } catch (error) {
      console.error('Error updating item:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update item.',
        icon: 'error',
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="app-container">
      <header className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Package size={48} color="var(--primary)" />
        </div>
        <h1>Inventory Hub</h1>
        <p>Manage your stock efficiently with real-time updates</p>
      </header>

      <main className="main-grid">
        <aside className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <PurchaseForm itemTypes={itemTypes} onSubmit={handleBulkSubmit} />
        </aside>
        
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <InventoryTable 
            items={items} 
            itemTypes={itemTypes} 
            loading={loading} 
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
