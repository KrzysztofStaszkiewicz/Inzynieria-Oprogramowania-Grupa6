<template>
  <div v-if="is_admin" class="admin">

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
}

interface Item{
  item: number;
  name: string;
  amount: number;
  unit: string;
}

const is_logged = ref<boolean>(false);
const is_admin = ref<boolean>(false);

const user_data = ref<UserData | null>(null);
const stock_items = ref<Item[]>([]);

/**
 * Funkcja: get_is_admin
 *
 * Opis:
 * Sprawdza, czy aktualnie zalogowany użytkownik posiada rolę "admin".
 * W tym celu wykonuje zapytanie GET do API `/user/role/:customer_id`, gdzie
 * `customer_id` pochodzi z danych przechowywanych w `user_data`.
 *
 * Działanie:
 * - Jeśli `user_data` nie istnieje (np. użytkownik nie jest zalogowany), funkcja kończy działanie.
 * - Wysyła zapytanie GET do lokalnego serwera z ID użytkownika.
 * - Odbiera dane zawierające rolę użytkownika.
 * - Jeżeli rola to `"admin"`, ustawia lokalną zmienną reaktywną `is_admin.value` na `true`.
 *
 * Zastosowanie:
 * Funkcja przydaje się do warunkowego renderowania elementów tylko dla administratorów,
 * np. przy panelach zarządzania, dodawaniu ofert itp.
 *
 * Przykład odpowiedzi z API:
 * ```json
 * [
 *   { "role": "admin" }
 * ]
 * ```
 */
async function get_is_admin(){
  if(!user_data.value) return;

  try{
    const result = await fetch(`http://localhost:6969/user/role/${user_data.value.id}`);
    const data = await result.json();

    if(data[0].role === "admin") is_admin.value = true;
  } catch(err){
    console.error("Error: ", err);
  }
}

/**
 * Funkcja: get_stock
 *
 * Opis:
 * Pobiera dane o stanie magazynowym (np. zapasy, produkty) z serwera, ale tylko jeśli
 * zalogowany użytkownik posiada uprawnienia administratora (`is_admin`).
 *
 * Warunki działania:
 * - Funkcja kończy działanie, jeśli użytkownik nie ma roli administratora (`!is_admin`).
 * - Funkcja kończy działanie, jeśli dane użytkownika nie są dostępne (`!user_data.value`).
 *
 * Działanie:
 * - Wysyła zapytanie GET do endpointu `/admin/stock/get` znajdującego się na lokalnym serwerze.
 * - Po otrzymaniu odpowiedzi przypisuje dane (np. listę produktów) do reaktywnej zmiennej `stock_items`.
 * - W przypadku błędu wyświetla go w konsoli.
 *
 * Zastosowanie:
 * Używana np. w panelu administracyjnym do wyświetlenia aktualnego stanu zapasów, edycji produktów itp.
 *
 * Przykład odpowiedzi z API:
 * ```json
 * [
 *   { "item_id": 1, "name": "Woda", "quantity": 120 },
 *   { "item_id": 2, "name": "Sok pomarańczowy", "quantity": 45 }
 * ]
 * ```
 */
async function get_stock(){
  if(!is_admin) return;
  if(!user_data.value) return;

  try{
    const result = await fetch(`http://localhost:6969/admin/stock/get`);
    const data = await result.json();

    stock_items.value = data;
  } catch(err){
    console.error("Error: ", err);
  }
}

/**
 * Po zamontowaniu komponentu:
 * - Sprawdza, czy użytkownik jest zalogowany, odczytując `is_logged` z localStorage.
 * - Jeśli jest zalogowany, próbuje wczytać dane użytkownika z `user_data` i sparsować je do obiektu.
 * - W przypadku błędu parsowania usuwa dane i oznacza użytkownika jako niezalogowanego.
 * - Jeśli użytkownik nie jest zalogowany, zeruje dane użytkownika.
 * - Jeśli użytkownik nie jest administratorem, to przenosi go do strony głównej.
 * - Jeśli użytkownik jest administratorem pobiera stan magazynu z bazy danych.
 */
onMounted(() => {
  is_logged.value = localStorage.getItem('is_logged') === 'true';

  // Import imienia i nazwiska użytkownika w przypadku, gdy jest zalogowany
  if(is_logged.value){
    const stored_user_data = localStorage.getItem("user_data");
    
    if(stored_user_data){
      try{
        user_data.value = JSON.parse(stored_user_data) as UserData;

        get_is_admin();
        get_stock();
      } catch(err){
        console.error('Błąd podczas parsowania user_data z localStorage:', err);

        localStorage.removeItem('is_logged');
        localStorage.removeItem('user_data');
        is_logged.value = false;
        user_data.value = null;
      }
    }
  }
  else{
    user_data.value = null;
  }

  if(!is_admin) router.push('/');
});
</script>