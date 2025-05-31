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
      <div class="header-account-login">
        <button class="header-account-login-button">
          <span class="header-account-login-button__text">Zaloguj się</span>
        </button>
        <div class="header-account-register">
          <button class="header-account-register-button">
            <span class="header-account-register-button__text">Zarejestruj się</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import logo from '../assets/logo.png'

import { useRouter } from 'vue-router';
const router = useRouter();

function main_pressed(){
  router.push('/');
}

function list_pressed(){
  router.push('/lista-wycieczek')
}
</script>