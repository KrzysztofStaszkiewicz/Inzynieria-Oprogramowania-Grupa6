import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DB_URL });

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Błąd połączenia z bazą:', err.stack);
  }
  console.log('Połączono z bazą danych!');
  release();
});

app.get('/offers/get', async (req, res) => {
  try{
    const result = await pool.query('SELECT * FROM trip_offer LIMIT 3');
    res.json(result.rows);
  } catch(err){
    console.log(err);
    res.status(500).json({error: 'Database error'});
  }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
