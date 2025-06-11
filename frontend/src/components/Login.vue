<template>
  <div class="login">
    <form class="login-form" @submit.prevent="handleLogin">
      <div class="login-form-title">
        <span class="login-form-title__text">Logowanie</span>
      </div>
      <div class="login-form-separator">
        <hr class="login-form-separator__hr" />
      </div>
      <div class="login-form-username">
        <label for="username" class="login-form-username__text">Email lub numer telefonu</label>
        <input id="username" class="login-form-username__input" type="text" v-model="name" required></input>
      </div>
      <div class="login-form-password">
        <label for="password" class="login-form-password__text">Hasło</label>
        <input id="password" class="login-form-password__input" type="password" v-model="password" required></input>
      </div>
      <div class="login-form-submit">
        <input type="submit" value="Zaloguj się" class="login-form-submit__input">
        <button @click="register_pressed" class="login-form-submit__subtext" href="/register">Nie masz konta? Zarejestruj się!</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter();

const name = ref<string>('');
const password = ref<string>('');

function register_pressed(){
  router.push('/register');
}

/**
 * Wysyła zapytanie do API logowania użytkownika na podstawie podanego emaila lub numeru telefonu oraz hasła.
 * 
 * @param {string} email - Adres e-mail użytkownika do logowania.
 * @param {number} phone - Numer telefonu użytkownika do logowania.
 * 
 * Funkcja wysyła metodą POST dane logowania (email, phone, password) do endpointu `/user/login`.
 * Jeśli logowanie zakończy się sukcesem, pobiera dane użytkownika, zapisuje status logowania
 * oraz dane użytkownika w localStorage, a następnie przekierowuje na stronę główną i odświeża stronę.
 * W przypadku błędu lub niepoprawnych danych usuwa odpowiednie dane z localStorage i wyświetla alert.
 */
async function get_login(email: string, phone: number) {
  try{
    const response = await fetch("http://localhost:6969/user/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        phone: phone,
        password: password.value
      })
    })

    if(response.ok){
      const user = await response.json();

      console.log("Poprawnie zalogowano!");

      const userData = {
        id: user.user.id,
        first_name: user.user.first_name,
        last_name: user.user.last_name
      };

      localStorage.setItem('is_logged', 'true');
      localStorage.setItem('user_data', JSON.stringify(userData));

      router.push('/').then(() => {
        location.reload();
      });
    }
    else{
      // Czyszczenie localStorage w przypadku bledu
      localStorage.removeItem('is_logged');
      localStorage.removeItem('user_data');
    }
  } catch(err){
    console.error("Error: ", err);
    alert('Błąd połączenia z serwerem');  

    // Czyszczenie localStorage w przypadku bledu
    localStorage.removeItem('is_logged');
    localStorage.removeItem('user_data');
  }
}

const handleLogin = () => {
  // Sprwadza czy podany przez użytkownika został email, czy numer telefonu
  if(name.value.includes("@")){
    get_login(name.value, -1)
  }
  else{
    get_login('', parseInt(name.value));
  }
}
</script>