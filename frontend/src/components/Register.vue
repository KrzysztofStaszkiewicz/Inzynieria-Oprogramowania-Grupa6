<template>
  <div class="register">
    <form class="register-form" @submit.prevent="handleRegister">
      <div class="register-form-title">
        <span class="register-form-title__text">Rejestracja</span>
      </div>
      <div class="register-separator">
        <hr class="register-separator__hr" />
      </div>
      <div class="register-form-name">
        <div class="register-form-name-first">
          <label for="username" class="register-form-name-first__text">Imię</label>
          <input id="username" class="register-form-name-first__input" type="text" v-model="first_name" required></input>
        </div>
        <div class="register-form-name-last">
          <label for="username" class="register-form-name-last__text">Nazwisko</label>
          <input id="username" class="register-form-name-last__input" type="text" v-model="last_name" required></input>
        </div>
      </div>
      <div class="register-form-email">
        <label for="username" class="register-form-email__text">Email</label>
        <input id="username" class="register-form-email__input" type="email" v-model="email" required></input>
      </div>
      <div class="register-form-phone">
        <label for="username" class="register-form-phone__text">Numer Telefonu</label>
        <input id="username" class="register-form-phone__input" type="tel" v-model="phone" required></input>
      </div>
      <div class="register-form-password">
        <label for="password" class="register-form-password__text">Hasło</label>
        <input id="password" class="register-form-password__input" type="password" v-model="password" required></input>
      </div>
      <div class="register-form-submit">
        <input type="submit" value="Zarejestruj się" class="register-form-submit__input">
        <a class="register-form-submit__subtext" href="/log_in">Masz już konto? Zaloguj się!</a>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router';

const first_name = ref<string>('');
const last_name = ref<string>('');
const email = ref<string>('');
const phone = ref<string>('');
const password = ref<string>('');

const router = useRouter();

function main_page(){
  router.push('/');
}

async function put_register(){
    try{
        const response = await fetch("http://localhost:6969/user/register", {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name,
            last_name,
            email,
            phone,
            password
          })
        });

        const data = await response.json();

        if (response.ok) {
          main_page();
        } else {
          alert('Błąd: ' + data.error);
        }
    } catch (err){
        console.error("Error: ", err);
        alert('Błąd połączenia z serwerem');
    }
}

const handleRegister = () => {
  put_register();
}
</script>