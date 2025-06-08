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
        <a class="login-form-submit__subtext" href="/register">Nie masz konta? Zarejestruj się!</a>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref<string>('');
const password = ref<string>('');

const handleLogin = () => {
  
}
</script>