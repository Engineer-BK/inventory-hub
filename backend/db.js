import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  port: parseInt(process.env.TIDB_PORT || "4000", 10),
  user: process.env.TIDB_USERNAME,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: { rejectUnauthorized: true },
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ TiDB Connected Successfully");
    connection.release();
  } catch (error) {
    console.error("Database connection failed!", error.message);
    process.exit(1);
  }
};

export const initializeDB = async () => {
  try {
    const connection = await pool.getConnection();

    // Create item_types table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS item_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type_name VARCHAR(255) NOT NULL UNIQUE
      )
    `);

    // Create items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        purchase_date DATE NOT NULL,
        stock_available BOOLEAN DEFAULT true,
        item_type_id INT,
        FOREIGN KEY (item_type_id) REFERENCES item_types(id) ON DELETE SET NULL
      )
    `);

    // Insert default item types if table is empty
    const [rows] = await connection.execute("SELECT COUNT(*) as count FROM item_types");
    if (rows[0].count === 0) {
      await connection.execute(`
        INSERT INTO item_types (type_name) VALUES 
        ('Electronics'), ('Furniture'), ('Clothing'), ('Office Supplies'), ('Other')
      `);
      console.log("✅ Seeded item_types with default categories.");
    }

    console.log("✅ Database initialized successfully");
    connection.release();
  } catch (error) {
    console.error("Database initialization failed!", error.message);
  }
};

export default pool;
