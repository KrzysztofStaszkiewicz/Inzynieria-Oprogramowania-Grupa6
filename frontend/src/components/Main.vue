<template>
    <main>
        <div class="main__image">
            <img :src="landing_image" alt="Zdjecie jachtu">
        </div>
        <div class="main-offers">
            <ul class="main-offers-list"></ul>
        </div>
    </main>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

import landing_image from '../assets/landing_image.png'

export default defineComponent({
    name: "Main",
    setup() {
        onMounted(async () => {
            try{
                const response = await fetch("http://localhost:6969/offers/get");
                const data = await response.json()
            } catch (err){
                console.error("Error: ", err);
            }
        });

        return {
            landing_image
        };
    }
})
</script>