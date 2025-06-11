<template>
  <div v-if="is_admin" class="admin">
    <div v-if="!is_ordering" class="admin-content">
      <div class="admin-content-title">
        <span class="admin-content-title__text">Obecny Stan Magazynu:</span>
      </div>
      <table class="admin-content-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nazwa</th>
            <th>Ilość</th>
            <th>Jednostka</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in stock_items" :key="item.id">
            <td>{{ item.item_id }}</td>
            <td>{{ item.item_name }}</td>
            <td>{{ item.amount }}</td>
            <td>{{ item.unit }}</td>
          </tr>
        </tbody>
      </table>
      <div class="admin-content-submit">
        <button @click="is_ordering = true" class="admin-content-submit-button">
          <span class="admin-content-submit-button__text">Złóż zamówienie</span>
        </button>
      </div>
    </div>
    <div v-else class="admin-content">
      <div class="admin-content-title">
        <span class="admin-content-title__text">Zamawiane Produkty</span>
      </div>
      <table class="admin-content-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nazwa</th>
            <th>Ilość</th>
            <th>Jednostka</th>
            <th>Dostawca</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in ordered_items" :key="item.id">
            <td><input v-model="item.item_id" type="text"></td>
            <td><input v-model="item.item_name" type="text"></td>
            <td><input v-model="item.amount" type="text"></td>
            <td><input v-model="item.unit" type="text"></td>
            <td><input v-model="item.supplier"></td>
          </tr>
        </tbody>
      </table>
      <div class="admin-content-order">
        <div class="admin-content-order-product">
          <span class="admin-content-order-product__text">Produkt:</span>
          <select v-model="select_add_product_name" class="admin-content-order-product-list">
            <option v-for="item in stock_items_names" :key="item.item_name" :value="item.item_name">{{ item.item_name }}</option>
          </select>
        </div>
        <div class="admin-content-order-supplier">
          <span class="admin-content-order-supplier__text">Dostawca:</span>
          <select v-model="select_add_product_supplier" class="admin-content-order-supplier-list">
            <option v-for="supplier in suppliers" :key="supplier.supplier_id" :value="supplier.supplier_id">{{ supplier.supplier_name }}</option>
          </select>
        </div>
      </div>
      <div class="admin-content-submit" style="justify-content: space-between; gap: 2rem">
        <button @click="add_order_product" class="admin-content-submit-button">
          <span class="admin-content-submit-button__text">Dodaj Produkt</span>
        </button>
        <button @click="post_order_products" class="admin-content-submit-button">
          <span class="admin-content-submit-button__text">Zamów Produkty</span>
        </button>
      </div>
    </div>
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
  id: number;
  name: string;
  amount: number;
  unit: string;
}

interface OrderedItem{
  id: number;
  name: string;
  amount: number;
  unit: string;
  supplier_id: number;
}

interface Supplier{
  supplier_id: number;
  supplier_name: string;
}

const is_logged = ref<boolean>(false);
const is_admin = ref<boolean>(false);
const is_ordering = ref<boolean>(false);

const user_data = ref<UserData | null>(null);
const stock_items = ref<Item[]>([]);
const ordered_items = ref<OrderedItem[]>([]);
const stock_items_names = ref<string[]>([]);
const suppliers = ref<Supplier[]>([]);

const select_add_product_name = ref<string>('');
const select_add_product_supplier = ref<string>('');

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

async function get_stock_product_names(){
  if(!is_admin) return;
  if(!user_data.value) return;

  try{
    const result = await fetch(`http://localhost:6969/admin/stock/product/names`);
    const data = await result.json();

    stock_items_names.value = data;
  } catch(err){
    console.error("Error: ", err);
  }
}

async function get_suppliers() {
  try{
    const result = await fetch(`http://localhost:6969/admin/stock/suppliers`);
    const data = await result.json();

    suppliers.value = data;
  } catch(err){
    console.error("Error: ", err);
  }
}

function add_order_product(){
  const newItem: OrderedItem = {
    item_id: ordered_items.value.length + 1,
    item_name: select_add_product_name.value,
    amount: 1,
    unit: "szt.",
    supplier_id: select_add_product_supplier.value
  };

  ordered_items.value.push(newItem);
}

async function post_order_products(){
  for(let product of ordered_items.value){
    console.log(product)
    try{
      const result = await fetch(`http://localhost:6969/admin/order/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: product.item_id,
          name: product.item_name,
          amount: product.amount,
          unit: product.unit,
          supplier_id: product.supplier_id
        })
      });

      if (!result.ok) {
        console.error("Błąd podczas wysyłania produktu:", product.name);
      }
    } catch(err){
      console.error("Error: ", err);
    }
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
        get_stock_product_names();
        get_suppliers();
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