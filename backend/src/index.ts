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

// Połączenie z bazą danych
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Błąd połączenia z bazą:', err.stack);
  }
  console.log('Połączono z bazą danych!');
  release();
});

// Zwraca pokrótce dane na temat oferty rejsu
app.get('/offers/short/get', async (req, res) => {
  try{
    const result = await pool.query('SELECT o.offer_id AS id, o.name, o.price, o.discount, d.short_description AS description FROM trip_offer o JOIN trip_description d ON o.offer_id = d.offer_id LIMIT 3');
    res.json(result.rows);
  } catch(err){
    console.log(err);
    res.status(500).json({error: 'Database get offers error'});
  }
});

// Zwraca szczegółowe dane na temat oferty rejsu
app.get('/offers/full/get/:id', async (req, res) => {
  const { id } = req.params;

  try{
    const result = await pool.query(
      'SELECT o.offer_id AS id, o.name, o.remaining_slots, o.price, o.discount, d.title, d.full_description AS description, d.advantages FROM trip_offer o JOIN trip_description d ON o.offer_id = d.offer_id WHERE o.offer_id = $1',
      [id]
    );
    res.json(result.rows);
  } catch(err){
    console.log(err);
    res.status(500).json({error: 'Database get offers error'});
  }
});

// Sprawdza czy rejs (offer_id) został przez danego użytkownika (customer_id) zarezerwowany
app.get('/user/reservation/confirm/:customer_id/:offer_id', async(req, res) => {
  const { customer_id, offer_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT EXISTS (
         SELECT 1
         FROM reservation
         WHERE customer_id = $1
           AND offer_id = $2
           AND status = 'confirmed'
       ) AS exists`,
      [customer_id, offer_id]
    );

    res.json({ confirmed: result.rows[0].exists });
  } catch (err) {
    console.error('Błąd zapytania:', err);
    res.status(500).json({ error: 'Błąd bazy danych' });
  }
});

// Połączenie API służące do dodania do bazy danych rezerwacji rejsu (offer_id) przez klienta (customer_id)
app.put('/user/reservation/put/:customer_id/:offer_id', async(req, res) => {
  const { customer_id, offer_id } = req.params;

  try {
    const result = await pool.query(
      `INSERT INTO reservation (customer_id, date, seats, status, offer_id) VALUES ($1, CURRENT_DATE, 1, 'confirmed', $2) RETURNING *`,
      [customer_id, offer_id]
    );

    if(result.rows[0]) res.json({ confirmed: true });
    else res.json({ confirmed: false });
  } catch (err) {
    console.error('Błąd zapytania:', err);
    res.status(500).json({ error: 'Błąd bazy danych' });
  }
})

// Zwraca informacje na temat rejsów już zarezerwowanych przez danego klienta (customer_id)
app.get('/user/reservation/get/:customer_id', async(req, res) => {
  const { customer_id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT t.*, d.short_description AS description, r.customer_id
      FROM trip_offer t
      JOIN reservation r ON t.offer_id = r.offer_id
      JOIN trip_description d ON t.offer_id = d.offer_id
      WHERE r.customer_id = $1`,
      [customer_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Błąd zapytania:', err);
    res.status(500).json({ error: 'Błąd bazy danych' });
  }
})

// Usunięcie rekordu rezerwacji rejsu (offer_id) z bazy danych przez klienta (customer_id)
app.delete('/user/reservation/delete/:customer_id/:offer_id', async (req, res) => {
  const { customer_id, offer_id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM reservation WHERE customer_id = $1 AND offer_id = $2 AND status = 'confirmed' RETURNING *`,
      [customer_id, offer_id]
    );

    if (result.rowCount && result.rowCount > 0) {
      res.json({ cancelled: true });
    } else {
      res.json({ cancelled: false });
    }
  } catch (err) {
    console.error('Błąd przy usuwaniu rezerwacji:', err);
    res.status(500).json({ error: 'Błąd bazy danych' });
  }
});

// Połączenie API służące do zarejestrowania użytkownika w bazie danych
app.put('/user/register', async(req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;

  try{
    // Hasło użytkownika jest hashowane w celu zwiększenia bezpieczeństwa
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

// Połącznie API służące do zalogowania do systemu przez użytkownika
app.post('/user/login', async(req, res) => {
  const { email, phone, password } = req.body;

  try{
    let user;

    // Sprawdza czy nastąpiło logowanie za pomocą numeru telefonu, czy za pomocą emailu
    if (phone > 0) {
      user = await pool.query(
        'SELECT customer_id, password FROM customer WHERE phone_number = $1',
        [phone]
      );
    } else if (email.includes("@")) {
      user = await pool.query(
        'SELECT customer_id, password FROM customer WHERE email = $1',
        [email]
      );
    } else {
      res.status(400).json({ error: 'Email or phone number is required.' });
      return;
    }

    if (user.rows.length === 0) {
      res.status(401).json({ error: 'Niepoprawny email lub numer telefonu' });
      return;
    }

    // Sprawdzane jest czy hasło jest zgodne z tym zabezpieczonym w bazie danych
    const storedHashedPassword = user.rows[0].password;
    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

    if (passwordMatch) {
      const result = await pool.query(
        'SELECT first_name, last_name FROM customer WHERE customer_id = $1',
        [user.rows[0].customer_id]
      );

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.rows[0].customer_id,
          first_name: result.rows[0].first_name,
          last_name: result.rows[0].last_name
        }
      });
    } else {
      res.status(401).json({ error: 'Niepoprawne haslo' });
    }
  } catch(err){
    console.log(err);
    res.status(500).json({error: 'Database insert error'});
  }
})

// Połączenie API służące do zmiany hasła przez użytkownika
app.put('/user/update/password', async (req, res) => {
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
