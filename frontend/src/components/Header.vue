<template>
  <header>
    <div class="header-logo">
      <div class="header-logo__image">
        <img :src="logo" alt="Sapore Celeste Logo">
      </div>
    </div>
    <div class="header-options">
      <ul class="header-options-list">
        <li @click="main_pressed" class="header-options-list-option">
          <span class="header-options-list-option__text">Strona Główna</span>
        </li>
        <li @click="list_pressed" class="header-options-list-option">
          <span class="header-options-list-option__text">Lista Wycieczek</span>
        </li>
      </ul>
    </div>
    <div class="header-account">
      <div v-if="!is_logged" class="header-account-login">
        <button @click="login_pressed" class="header-account-login-button">
          <span class="header-account-login-button__text">Zaloguj się</span>
        </button>
        <div class="header-account-register">
          <button @click="register_pressed" class="header-account-register-button">
            <span class="header-account-register-button__text">Zarejestruj się</span>
          </button>
        </div>
      </div>
      <div v-if="is_logged" class="header-account-info">
        <div @click="trigger_user_info" class="header-account-info-content">
          <div class="header-account-info-content-name">
            <span v-if="user_data" class="header-account-info-content-name__text">{{ user_data.first_name }}, {{ user_data.last_name }}</span>
          </div>
          <div class="header-account-info-content-arrow">
            <i class="fa-solid fa-caret-down"></i>
          </div>
        </div>
        <div class="header-account-info-options">
          <ul class="header-account-info-options-list" :class="show_user_options ? 'header-account-info-options-list-show' : 'header-account-info-options-list-hide'">
            <li @click="reservations_pressed" class="header-account-info-options-list-option">Moje rezerwacje</li>
            <li v-if="is_admin" @click="admin_pressed" class="header-account-info-options-list-option">Panel Admina</li>
            <li @click="log_out" class="header-account-info-options-list-option">Wyloguj sie</li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import logo from '../assets/logo.png'

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
}

const is_logged = ref<boolean>(false);
const is_admin = ref<boolean>(false);

const user_data = ref<UserData | null>(null);
const show_user_options = ref<boolean>(false);

function main_pressed(){
  router.push('/');
}

function list_pressed(){
  router.push('/reservations');
}

function login_pressed(){
  router.push('/log_in');
}

function register_pressed(){
  router.push('/register');
}

function reservations_pressed(){
  router.push('/user/reservations');
}

function admin_pressed(){
  router.push('/admin')
}

function trigger_user_info(){
  show_user_options.value = !show_user_options.value;
}

function log_out(){
  localStorage.removeItem('is_logged');
  localStorage.removeItem('user_data');
  sessionStorage.clear();

  location.reload();
}

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
 * Po zamontowaniu komponentu:
 * - Sprawdza, czy użytkownik jest zalogowany, odczytując `is_logged` z localStorage.
 * - Jeśli jest zalogowany, próbuje wczytać dane użytkownika z `user_data` i sparsować je do obiektu.
 * - W przypadku błędu parsowania usuwa dane i oznacza użytkownika jako niezalogowanego.
 * - Jeśli użytkownik nie jest zalogowany, zeruje dane użytkownika.
 */
onMounted(() => {
  is_logged.value = localStorage.getItem('is_logged') === 'true';

  // Import imienia i nazwiska użytkownika w przypadku, gdy jest zalogowany
  if(is_logged.value){
    const stored_user_data = localStorage.getItem("user_data");
    
    if(stored_user_data){
      try{
        user_data.value = JSON.parse(stored_user_data) as UserData;
      } catch(err){
        console.error('Błąd podczas parsowania user_data z localStorage:', err);

        localStorage.removeItem('is_logged');
        localStorage.removeItem('user_data');
        is_logged.value = false;
        user_data.value = null;
      }
    }

    get_is_admin();
  }
  else{
    user_data.value = null;
  }
});
</script>