import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { connectDB, initializeDB } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize Database on Startup
connectDB().then(initializeDB);

// GET: All Item Types
app.get('/api/item-types', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM item_types ORDER BY type_name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching item types:', error);
    res.status(500).json({ error: 'Failed to fetch item types' });
  }
});

// GET: All Items (JOIN with item_types)
app.get('/api/items', async (req, res) => {
  try {
    const query = `
      SELECT 
        items.id, 
        items.name, 
        items.purchase_date, 
        items.stock_available, 
        items.item_type_id,
        item_types.type_name
      FROM items
      LEFT JOIN item_types ON items.item_type_id = item_types.id
      ORDER BY items.id DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// POST: Bulk Add Items
app.post('/api/items/bulk', async (req, res) => {
  const items = req.body; // Expecting an array of items
  
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid payload. Expected an array of items.' });
  }

  // Validate items
  for (const item of items) {
    if (!item.name || !item.purchase_date || !item.item_type_id) {
      return res.status(400).json({ error: 'Missing required fields (name, purchase_date, item_type_id) in one or more items.' });
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const query = `INSERT INTO items (name, purchase_date, stock_available, item_type_id) VALUES (?, ?, ?, ?)`;
    
    for (const item of items) {
       // Convert purchase_date to YYYY-MM-DD
       const formattedDate = new Date(item.purchase_date).toISOString().split('T')[0];
       const stock = item.stock_available !== undefined ? item.stock_available : true;
       
       await connection.execute(query, [item.name, formattedDate, stock, item.item_type_id]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Items successfully added!' });
  } catch (error) {
    await connection.rollback();
    console.error('Error during bulk insert:', error);
    res.status(500).json({ error: 'Failed to insert items' });
  } finally {
    connection.release();
  }
});

// PUT: Update single item
app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, purchase_date, stock_available, item_type_id } = req.body;

  if (!name || !purchase_date || !item_type_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const formattedDate = new Date(purchase_date).toISOString().split('T')[0];
    const query = `UPDATE items SET name=?, purchase_date=?, stock_available=?, item_type_id=? WHERE id=?`;
    const [result] = await pool.execute(query, [name, formattedDate, stock_available, item_type_id, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE: Delete single item
app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.execute('DELETE FROM items WHERE id=?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
