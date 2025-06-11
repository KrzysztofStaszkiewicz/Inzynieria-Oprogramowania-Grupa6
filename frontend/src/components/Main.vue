<template>
    <div class="main__image">
        <img :src="landing_image" alt="Zdjecie jachtu">
    </div>
    <div class="main-offers">
        <ul class="main-offers-list">
            <LandingOffer
                v-for="offer in offers" :key="offer.id"
                :id="offer.id"
                :name="offer.name" 
                :price="offer.price" 
                :discount="offer.discount" >
            </LandingOffer>
        </ul>
    </div>
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

/**
 * Pobiera listę aktualnie dostępnych, skróconych informacji o ofertach rejsów z serwera.
 * 
 * Funkcja wysyła zapytanie GET do endpointu `/offers/short/get`, odbiera odpowiedź JSON
 * zawierającą dane ofert i zapisuje je w reaktywnej zmiennej `offers`.
 * W przypadku błędu wyświetla go w konsoli.
 */
async function get_offers(){
    try{
        const response = await fetch("http://localhost:6969/offers/short/get");
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