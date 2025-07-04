<template>
  <div class="register">
    <form class="register-form" @submit.prevent="handleRegister">
      <div class="register-form-title">
        <span class="register-form-title__text">Rejestracja</span>
      </div>
      <div class="register-form-separator">
        <hr class="register-form-separator__hr" />
      </div>
      <div class="register-form-name">
        <div class="register-form-name-first">
          <label for="username" class="register-form-name-first__text">Imię</label>
          <input id="username" class="register-form-name-first__input" type="text" placeholder="Imie" maxlength="50" v-model="first_name" required></input>
        </div>
        <div class="register-form-name-last">
          <label for="username" class="register-form-name-last__text">Nazwisko</label>
          <input id="username" class="register-form-name-last__input" type="text" placeholder="Nazwisko" maxlength="50" v-model="last_name" required></input>
        </div>
      </div>
      <div class="register-form-email">
        <label for="username" class="register-form-email__text">Email</label>
        <input id="username" class="register-form-email__input" type="email" placeholder="nazwa@email.com" maxlength="100" v-model="email" required></input>
      </div>
      <div class="register-form-phone">
        <label for="username" class="register-form-phone__text">Numer Telefonu</label>
        <input id="username" class="register-form-phone__input" type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{3}" placeholder="111-222-333" maxlength="11" v-model="phone" required></input>
      </div>
      <div class="register-form-password">
        <label for="password" class="register-form-password__text">Hasło</label>
        <input id="password" class="register-form-password__input" type="password" v-model="password" maxlength="50" required></input>
      </div>
      <div class="register-form-submit">
        <input type="submit" value="Zarejestruj się" class="register-form-submit__input">
        <button @click="login_pressed" class="register-form-submit__subtext">Masz już konto? Zaloguj się!</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router';

const first_name = ref<string>('');
const last_name = ref<string>('');
const email = ref<string>('');
const phone = ref<string>('');
const password = ref<string>('');

const router = useRouter();

function login_pressed(){
  router.push('/log_in');
}

/**
 * Watcher obserwujący zmiany w zmiennej `phone` (string).
 * 
 * Zadania watchera:
 * 1. Zapewnia, że do pola wprowadzany jest tylko ciąg cyfr lub znak '-'.
 *    - Jeśli ostatni znak nie jest cyfrą ani '-', zostaje usunięty.
 * 2. Automatycznie dodaje lub usuwa znak '-' w odpowiednich miejscach, aby format telefonu wyglądał następująco:
 *    - Po 3 i 7 znakach wstawiany jest lub usuwany separator '-'.
 * 3. Pamięta poprzednią wartość `phone` w zmiennej `old_phone`, aby wiedzieć, czy użytkownik dodaje czy usuwa znaki i odpowiednio manipulować tekstem.
 * 
 * Przykładowy format telefonu: `123-456-789`
 */
let old_phone:string = '';
watch(phone, (value:string) => {
  // Upewnia sie ze wpisywana jest tylko cyfra
  if(isNaN(Number(value.charAt(value.length - 1))) && value.charAt(value.length - 1) != "-"){
    phone.value = phone.value.slice(0, -1);
    return;
  }

  // Manipuluje tekstem inputa tak aby był zgodny z jego formatem
  if(value.length == 3 || value.length == 7){
    if(value.length > old_phone.length) phone.value = phone.value + "-";
    else if(value.length < old_phone.length) phone.value = phone.value.slice(0, -1);
  }

  old_phone = value;
})

/**
 * Asynchroniczna funkcja służy do zarejestrowania nowego klienta w bazie danych.
 *
 * - Wysyła zapytanie PUT do endpointu `/user/register` z danymi rejestracyjnymi użytkownika.
 * - Dane wysyłane w formacie JSON obejmują: imię, nazwisko, email, numer telefonu (po usunięciu myślnika), oraz hasło.
 * - Po udanej rejestracji przekierowuje użytkownika na stronę logowania (`/log_in`) i wyświetla alert z potwierdzeniem.
 * - W przypadku błędu zwracanego przez serwer wyświetla alert z komunikatem błędu.
 * - W przypadku błędu połączenia z serwerem wypisuje błąd w konsoli i wyświetla alert informujący o problemie.
 */
async function put_register(){
    try{
        const response = await fetch("http://localhost:6969/user/register", {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name: first_name.value,
            last_name: last_name.value,
            email: email.value,
            phone: phone.value.replace("-", ""),
            password: password.value
          })
        });

        const data = await response.json();

        if (response.ok) {
          router.push('/log_in');

          alert('Zarejestrowano poprawnie, można teraz się zalogować.');
        } else {
          alert('Błąd: ' + data.error);
        }
    } catch(err){
        console.error("Error: ", err);
        alert('Błąd połączenia z serwerem');
    }
}

const handleRegister = () => {
  put_register();
}
</script>