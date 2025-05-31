<template>
    <main>
        <div class="main__image">
            <img :src="landing_image" alt="Zdjecie jachtu">
        </div>
        <div class="main-offers">
            <ul class="main-offers-list">
                <LandingOffer
                    v-for="offer in offers" :key="offer.id" 
                    :name="offer.name" 
                    :price="offer.price" 
                    :discount="offer.discount" >
                </LandingOffer>
            </ul>
        </div>
    </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import landing_image from '../assets/landing_image.png'

import LandingOffer from './LandingOffer.vue';

interface Offer{
  id: number;
  name: string;
  price: number;
  discount: number;
}

const offers = ref<Offer[]>([])

async function get_offers(){
    try{
        const response = await fetch("http://localhost:6969/offers/get");
        const data = await response.json();
        offers.value = data;
    } catch (err){
        console.error("Error: ", err);
    }
}

onMounted(() => {
    get_offers();
})
</script>