<template>
  <div class="reservations">
    <div class="reservations-title">
      <span class="reservations-title__text">Lista Moich Rezerwacji</span>
      <div class="reservations-title-none">
        <span v-if="offers[0] == null" class="reseravtions-title-none__text">: Brak</span>
      </div>
    </div>
    <ul v-if="customer_id != null" class="reservations-list">
      <UserReservationsOffer
        v-for="offer in offers" :key="offer.offer_id" v-bind="offer"
        @cancelled="remove_reservation"
        :offer_id="offer.offer_id"
        :customer_id="customer_id"
        :name="offer.name"
        :description="offer.description"
        :price="offer.price"
        :discount="offer.discount"
      >
      </UserReservationsOffer>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import UserReservationsOffer from './UserReservationsOffer.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface Offer{
  offer_id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
}

const offers = ref<Offer[]>([])
const customer_id = ref<number>();

function remove_reservation(offer_id: number) {
  offers.value = offers.value.filter(offer => offer.offer_id !== offer_id);
}

/**
 * Funkcja asynchroniczna pobierająca z serwera listę rezerwowanych podróży przez danego klienta.
 * 
 * Wysyła zapytanie HTTP GET pod endpoint `/user/reservation/get/:customer_id`,
 * gdzie `customer_id` to identyfikator klienta.
 * 
 * Po poprawnym otrzymaniu odpowiedzi ustawia zmienną `offers` na otrzymane dane.
 * W przypadku błędu wypisuje go w konsoli.
 */
async function get_offers(){
  try{
    const response = await fetch(`http://localhost:6969/user/reservation/get/${customer_id.value}`);
    const data = await response.json();
    offers.value = data;
  } catch (err){
    console.error("Error: ", err);
  }
}

/**
 * Funkcja asynchroniczna zwracająca i ustawiająca w zmiennej `customer_id` identyfikator
 * zalogowanego klienta pobrany z localStorage.
 * 
 * Jeśli klient nie jest zalogowany (brak flagi `is_logged` lub jest ustawiona na "false"),
 * następuje przekierowanie na stronę główną.
 * 
 * W przypadku braku danych użytkownika lub błędnego ID w localStorage, wyświetlane są
 * odpowiednie komunikaty ostrzegawcze lub błędy.
 */
async function get_customer_id(){
  // powrot na glowna strone jesli klient nie jest zalogowany
  if(localStorage.getItem("is_logged") === null || localStorage.getItem("is_logged") === "false") router.push('/');
  else{
    const user_data_raw = localStorage.getItem("user_data");
    if (!user_data_raw) {
      console.warn("Brak danych użytkownika w localStorage.");
      return;
    }

    const user_data = JSON.parse(user_data_raw);

    if (isNaN(user_data.id)) {
      console.error("Błędne ID klienta.");
      return;
    }

    customer_id.value = user_data.id;
  }
}

onMounted(async () => {
  await get_customer_id();
  await get_offers();
})
</script>