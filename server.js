const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("frontend"));

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "parking_system",
  password: "123",
  port: 5432,
});

(async () => {
  try {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS cars (cars_id VARCHAR(7) PRIMARY KEY, serial_number VARCHAR(255) NOT NULL, brand TEXT,mark VARCHAR(255),  park_id INTEGER);"
    );
    console.log("Машины хүснэгт бэлэн боллоо.");
  } catch (err) {
    console.error("Бааз үүсэхэд алдаа гарлаа.");
  }
})();

(async () => {
  try {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS parkings ( park_id VARCHAR(7) PRIMARY KEY,price_per_hours INTEGER, capacity INTEGER NOT NULL, free_spot INTEGER);"
    );
    console.log("Зогсоолын хүснэгт бэлэн боллоо.");
  } catch (err) {
    console.error("Бааз үүсэхэд алдаа гарлаа.");
  }
})();

(async () => {
  try {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS payment (payment_id SERIAL PRIMARY KEY, cars_id VARCHAR(7),hours INTEGER NOT NULL,payment_method TEXT, amount INTEGER, payed_date DATE);"
    );
    console.log("Төлбөрийн хүснэгт бэлэн боллоо.");
  } catch (err) {
    console.error("Бааз үүсэхэд алдаа гарлаа.");
  }
})();

(async () => {
  try {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS entrance (cars_id VARCHAR(7) PRIMARY KEY,entered_date TIMESTAMP NOT NULL,leaved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
    );
    console.log("Бүртгэлийн хүснэгт бэлэн боллоо.");
  } catch (err) {
    console.error("Бааз үүсэхэд алдаа гарлаа.");
  }
})();

// Get all cars
app.get("/cars", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cars");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a car
app.delete("/cars/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM cars WHERE cars_id = $1", [id]);
    res.json({ message: "Car deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all parkings
app.get("/parkings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM parkings");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new parking
app.post("/parkings", async (req, res) => {
  const { park_id, price_per_hours, capacity, free_spot } = req.body;
  try {
    await pool.query(
      "INSERT INTO parkings (park_id, price_per_hours, capacity, free_spot) VALUES ($1, $2, $3, $4)",
      [park_id, price_per_hours, capacity, free_spot]
    );
    res.status(201).json({ message: "Parking added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a parking
app.delete("/parkings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM parkings WHERE park_id = $1", [id]);
    res.json({ message: "Parking deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all payments
app.get("/payments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payment");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new payment
app.post("/payments", async (req, res) => {
  const { cars_id, hours, payment_method, amount, payed_date } = req.body;
  try {
    await pool.query(
      "INSERT INTO payment (cars_id, hours, payment_method, amount, payed_date) VALUES ($1, $2, $3, $4, $5)",
      [cars_id, hours, payment_method, amount, payed_date]
    );
    res.status(201).json({ message: "Payment added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all entrance records
app.get("/entrance", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM entrance WHERE leaved_date IS NULL"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new entrance record
app.post("/entrance", async (req, res) => {
  const { cars_id, entered_date } = req.body;
  try {
    await pool.query(
      "INSERT INTO entrance (cars_id, entered_date) VALUES ($1, $2)",
      [cars_id, entered_date]
    );
    res.status(201).json({ message: "Entrance recorded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update exit time
app.put("/entrance/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE entrance SET leaved_date = CURRENT_TIMESTAMP WHERE cars_id = $1 AND leaved_date IS NULL",
      [id]
    );
    res.json({ message: "Exit recorded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
