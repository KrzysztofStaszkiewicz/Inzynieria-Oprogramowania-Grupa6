import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
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
    res.status(500).json({error: 'Database get offers error'});
  }
});

app.put('/user/register', async(req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;

  try{
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));

    const result = await pool.query(
      'INSERT INTO customer (first_name, last_name, email, phone_number, password) VALUES ($1, $2, $3, $4, $5)',
      [first_name, last_name, email, phone, hashedPassword]
    );

    res.json({ message: 'Customer registered successfully' });
  } catch(err){
    console.log(err);
    res.status(500).json({error: 'Database insert error'});
  }
});

app.put('/user/update_password', async (req, res) => {
  const { email, password} = req.body;

  try{
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));

    const result = await pool.query(
      'UPDATE customer SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );

    res.json({ message: 'Password updated successfully' });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
