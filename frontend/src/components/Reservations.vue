<template>
  <div class="reservations">
    <ul class="reservations-list">
      <ReservationsOffer
        v-for="offer in offers" :key="offer.id"
        :id="offer.id"
        :name="offer.name"
        :description="offer.description"
        :price="offer.price"
        :discount="offer.discount"
      >
      </ReservationsOffer>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ReservationsOffer from './ReservationsOffer.vue';

interface Offer{
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
}

const offers = ref<Offer[]>([])

// Zwraca obecnie dostępne oferty rejsów
async function get_offers(){
    try{
        const response = await fetch("http://localhost:6969/offers/short/get");
        const data = await response.json();
        offers.value = data;
    } catch (err){
        console.error("Error: ", err);
    }
}

onMounted(async () => {
  get_offers();
})
</script>