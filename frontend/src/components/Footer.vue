<template>
  <footer>
    <div class="footer-logo">
      <div class="footer-logo__image">
        <img :src="logo" alt="Logo Sapore Celeste">
      </div>
    </div>
    <div class="footer-description">
      <div class="footer-description-title">
        <span class="footer-description-title__text">O nas</span>
      </div>
      <div class="footer-description-content">
        <span class="footer-description-content__text">{{ description }}</span>
      </div>
    </div>
    <div class="footer-separator">
      <hr class="footer-separator__hr" />
    </div>
    <div class="footer-links">
      <ul class="footer-links-list">
        <li 
          v-for="(item, index) in links"
          :key="index"
          class="footer-links-list-option"
        >
          <a :href="item.href" class="footer-links-list-option__text">{{ item.title }}</a>
        </li>
      </ul>
    </div>
    <div class="footer-copyrights">
      <span class="footer-copyrights__text">&copy; 2025 Sapore.com | Sapore Celeste</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import logo from '../assets/logo-white.png';

const description: string = "Sapore Celeste to wyjątkowe połączenie luksusowego rejsu i niezapomnianych doznań kulinarnych. Na naszym pokładzie odkryjesz smaki świata, relaksując się w komfortowym otoczeniu. Zapraszamy na podróż, która rozpieszcza zmysły.";

const links = [
  { title: 'O nas', href: '/o-nas' },
  { title: 'Polityka Prywatności', href: '/polityka-prywatnosci' },
  { title: 'Warunki użytkowania', href: '/warunki-uzytkowania' },
  { title: 'Kontakt', href: '/kontakt' },
];
</script>