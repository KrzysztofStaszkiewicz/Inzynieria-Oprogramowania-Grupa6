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

/**
 * Próbuje nawiązać połączenie z bazą danych przy starcie aplikacji.
 * 
 * Jeśli połączenie się powiedzie, wypisuje "Połączono z bazą danych!".
 * Jeśli wystąpi błąd, wypisuje szczegóły błędu do konsoli.
 * 
 * Po sprawdzeniu połączenia natychmiast zwalnia klienta z puli.
 */
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Błąd połączenia z bazą:', err.stack);
  }
  console.log('Połączono z bazą danych!');
  release();
});

/**
 * Zwraca podstawowe informacje o maksymalnie 3 ofertach rejsów.
 * 
 * Zwracane pola w tablicy obiektów:
 * - id (offer_id),
 * - name,
 * - price,
 * - discount,
 * - description (krótki opis).
 * 
 * W przypadku błędu zwraca status 500 i komunikat o błędzie.
 */
app.get('/offers/short/get', async (req, res) => {
  try{
    const result = await pool.query('SELECT o.offer_id AS id, o.name, o.price, o.discount, d.short_description AS description FROM trip_offer o JOIN trip_description d ON o.offer_id = d.offer_id LIMIT 3');
    res.json(result.rows);
  } catch(err){
    console.log(err);
    res.status(500).json({error: 'Database get offers error'});
  }
});

/**
 * Zwraca szczegółowe dane o ofercie rejsu na podstawie jej ID.
 * 
 * Parametry URL:
 * - id: identyfikator oferty (offer_id)
 * 
 * Zwraca tablicę z obiektem zawierającym pola:
 * - id (offer_id),
 * - name,
 * - remaining_slots,
 * - price,
 * - discount,
 * - title,
 * - description (pełny opis),
 * - advantages.
 * 
 * W przypadku błędu zwraca status 500 i komunikat o błędzie.
 */
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

/**
 * Sprawdza, czy dany klient ma potwierdzoną rezerwację konkretnego rejsu.
 * 
 * Parametry URL:
 * - customer_id: identyfikator klienta
 * - offer_id: identyfikator oferty/rejsu
 * 
 * Zwraca obiekt JSON z polem `confirmed`:
 * - true, jeśli istnieje potwierdzona rezerwacja,
 * - false, jeśli nie.
 * 
 * W przypadku błędu zwraca status 500 i komunikat o błędzie.
 */
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

/**
 * Dodaje nową rezerwację rejsu do bazy danych dla danego klienta.
 * 
 * Parametry URL:
 * - customer_id: identyfikator klienta
 * - offer_id: identyfikator oferty/rejsu
 * 
 * Rezerwacja jest dodawana z aktualną datą (`CURRENT_DATE`), jednym miejscem (`seats = 1`) i statusem `'confirmed'`.
 * Zwraca JSON z polem `confirmed`:
 * - true, gdy rezerwacja została pomyślnie dodana,
 * - false, gdy dodanie się nie powiodło.
 * 
 * W przypadku błędu zwraca status 500 i komunikat o błędzie.
 */
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

/**
 * Pobiera listę rejsów zarezerwowanych przez danego klienta.
 * 
 * Parametry URL:
 * - customer_id: numer identyfikujący klienta
 * 
 * Zwraca tablicę obiektów rejsów (`trip_offer`) wraz z ich opisem (`short_description` z `trip_description`) oraz `customer_id`.
 * 
 * W przypadku błędu zwraca status 500 i informację o błędzie.
 */
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

/**
 * Usuwa potwierdzoną rezerwację rejsu dla danego klienta.
 * 
 * Parametry URL:
 * - customer_id: numer identyfikujący klienta
 * - offer_id: numer identyfikujący ofertę/rejs
 * 
 * Usuwa rekord z tabeli `reservation`, gdzie status to 'confirmed'.
 * Zwraca JSON z polem `cancelled`:
 * - true, jeśli rezerwacja została usunięta
 * - false, jeśli nie znaleziono pasującej rezerwacji
 * 
 * W przypadku błędu zwraca status 500 i informację o błędzie.
 */
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

/**
 * Aktualizuje liczbę zarezerwowanych miejsc (seats) dla danego klienta i oferty rejsu.
 * 
 * Endpoint: PUT /user/reservation/seats/:customer_id/:offer_id/:num_seats
 * 
 * Parametry URL:
 * - customer_id (number) — ID klienta dokonującego rezerwacji.
 * - offer_id (number) — ID oferty rejsu, której dotyczy rezerwacja.
 * - num_seats (number) — nowa liczba miejsc do ustawienia w rezerwacji.
 * 
 * Działanie:
 * - Aktualizuje kolumnę `seats` w tabeli `reservation` dla rekordu odpowiadającego podanemu `customer_id` i `offer_id`.
 * 
 * Odpowiedź:
 * - Jeśli aktualizacja powiodła się (rekord istnieje i został zmodyfikowany), zwraca JSON: { confirmed: true }.
 * - Jeśli nie znaleziono pasującego rekordu lub aktualizacja się nie powiodła, zwraca JSON: { confirmed: false }.
 * - W przypadku błędu serwera zwraca status HTTP 500 i JSON z komunikatem o błędzie.
 * 
 * Przykład wywołania:
 * PUT http://localhost:6969/user/reservation/seats/123/456/3
 * - aktualizuje rezerwację klienta o ID 123 dla oferty 456 na 3 miejsca.
 */
app.put('/user/reservation/seats/:customer_id/:offer_id/:num_seats', async(req, res) => {
  const { customer_id, offer_id, num_seats } = req.params;

  try {
    const result = await pool.query(
      `UPDATE reservation SET seats = $3 WHERE customer_id = $1 AND offer_id = $2`,
      [customer_id, offer_id, num_seats]
    );

    res.json({ confirmed: true });
  } catch (err) {
    console.error('Błąd przy usuwaniu rezerwacji:', err);
    res.status(500).json({ error: 'Błąd bazy danych' });
  }
})

/**
 * Endpoint: GET /user/role/:customer_id
 *
 * Opis:
 * Ten endpoint zwraca rolę użytkownika w systemie na podstawie jego identyfikatora (customer_id).
 * Rola użytkownika może określać jego uprawnienia w aplikacji, np. czy jest to zwykły klient, administrator itp.
 *
 * Parametry:
 * - `customer_id` (URL param) – unikalny identyfikator użytkownika (klienta), którego rola ma zostać pobrana.
 *
 * Działanie:
 * - Wysyła zapytanie SQL do tabeli `customer`, aby pobrać wartość pola `role` dla wskazanego `customer_id`.
 * - Jeśli zapytanie się powiedzie, zwraca wynik jako tablicę JSON (np. `[ { role: 'admin' } ]`).
 * - W przypadku błędu (np. błąd połączenia z bazą danych) zwraca status 500 z komunikatem o błędzie.
 */
app.get('/user/role/:customer_id', async(req, res) => {
  const { customer_id } = req.params;

  try{
    const result = await pool.query(
      `SELECT role FROM customer WHERE customer_id = $1`,
      [customer_id]
    )

    res.json(result.rows);
  } catch(err){
    console.error("Błąd podczas zwracania wyniku roli użytkownika w systemie: ", err);
    res.status(500).json({ error: 'Błąd bazy danych' })
  }
})

/**
 * Endpoint rejestracji nowego użytkownika.
 * 
 * Oczekuje w ciele żądania JSON z polami:
 * - first_name: string — imię użytkownika
 * - last_name: string — nazwisko użytkownika
 * - email: string — adres email
 * - phone: string lub number — numer telefonu
 * - password: string — hasło w formacie niezaszyfrowanym
 * 
 * Hasło jest hashowane i zapisywane w bazie danych.
 * Zwraca JSON z komunikatem o sukcesie lub błędzie serwera.
 */
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

/**
 * Endpoint logowania użytkownika.
 * 
 * Oczekuje w ciele żądania JSON z polami:
 * - email: string (opcjonalnie, jeśli nie jest podany numer telefonu)
 * - phone: string lub number (opcjonalnie, jeśli nie jest podany email)
 * - password: string — hasło użytkownika
 * 
 * Logowanie działa na podstawie emaila lub numeru telefonu.
 * Jeśli dane są poprawne, zwraca dane użytkownika (id, imię, nazwisko) wraz z komunikatem o sukcesie.
 * W przeciwnym razie zwraca odpowiednie błędy:
 * - 400, gdy brak emaila i telefonu
 * - 401, gdy użytkownik nie istnieje lub hasło jest niepoprawne
 * - 500, gdy wystąpi błąd serwera/bazy danych
 */
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

/**
 * Aktualizuje hasło użytkownika o podanym emailu.
 * 
 * Oczekuje w ciele żądania JSON z polami:
 * - email: string — adres email użytkownika
 * - password: string — nowe hasło w formacie niezaszyfrowanym
 * 
 * Hasło zostaje zahashowane i zapisane w bazie.
 * Zwraca JSON z komunikatem o sukcesie lub błędzie.
 */
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
