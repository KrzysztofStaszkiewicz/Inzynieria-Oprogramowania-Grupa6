<template>
    <main>
        <div class="main__image">
            <img :src="landing_image" alt="Zdjecie jachtu">
        </div>
    </main>
</template>

<script lang="ts">
import landing_image from '../assets/landing_image.png'

import { defineComponent } from 'vue';

export default defineComponent({
    name: "Main",
    setup() {
    return {
      landing_image
    };
  }
})
</script>