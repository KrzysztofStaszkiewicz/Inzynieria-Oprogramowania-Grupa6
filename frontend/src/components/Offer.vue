<template>
  <div v-if="offer" class="offer">
    <div class="offer__image">
      <img :src="image_src" :alt="image_alt">
    </div>
    <div class="offer-title">
      <span class="offer-title__text">{{ offer.name }} - {{ offer.title }}</span>
    </div>
    <div class="offer-content">
      <div class="offer-content-description">
        <span class="offer-content-description__text">{{ descriptions[0] }}</span>
      </div>
      <div class="offer-content-advantages">
        Podczas wycieczki:
        <ul class="offer-content-advantages-list">
          <li v-for="advantage in advantages" :key="advantage" class="offer-content-advantages-list-option">
            <span class="offer-content-advantages-list-option__text">{{ advantage }}</span>
          </li>
        </ul>
      </div>
      <div class="offer-content-finish">
        <span class="offer-content-finish__text">{{ descriptions[1] }}</span>
      </div>
    </div>
    <div class="offer-slots">
      <span class="offer-slots__text">Liczba Pozostałych Miejsc: {{ offer.remaining_slots }}</span>
    </div>
    <div class="offer-info" :class="{ 'flex-end': !is_reserved }">
      <div v-if="is_reserved" class="offer-info-restaurant">
        <button v-if="!is_reserving_table" @click="is_reserving_table = true" class="offer-info-restaurant-button">
          <span class="offer-info-restaurant-button_text">Zarezerwuj Stolik</span>
        </button>
        <button @click="reserve_seats" v-if="is_reserving_table" class="offer-info-restaurant-button">
          <span class="offer-info-restaurant-button__text">Potwierdź</span>
        </button>
        <select v-if="is_reserving_table" v-model="selected_seats" class="offer-info-restaurant-list">
          <option v-for="n in 8" :key="n" :value="n" class="offer-info-restaurant-list__option">{{ n }}</option>
        </select>
        <div v-if="is_reserving_table" @click="is_reserving_table = false" class="offer-info-restaurant-cancel">
          <span class="offer-info-restaurant-cancel__text">Anuluj</span>
        </div>
      </div>
      <div class="offer-info-trip">
        <div class="offer-info-trip-price">
          <span v-if="offer.discount > 0" class="offer-info-trip-price__text">{{ Math.floor(offer.price - offer.price * offer.discount / 100) }}</span>
          <span v-else class="offer-info-trip-price__text">{{ offer.price }}</span>
        </div>
        <button @click="reserve_trip" v-if="!is_reserved" :disabled="offer.remaining_slots <= 0 ? true : false" class="offer-info-trip-button">
          <span class="offer-info-trip-button__text">Zarezerwuj</span>
        </button>
        <button @click="cancel_reservation" v-else class="offer-info-trip-button">
          <span class="offer-info-trip-button__text">Anuluj Rezerwację</span>
        </button>
      </div>
        
    </div>
  </div>
  <Error
    v-if="show_error"
    :text="error_text"
    @close="show_error = false"
  >
  </Error>
  <Confirm
    v-if="show_confirm"
    :text="confirm_text"
    @close="show_confirm = false"
  >
  </Confirm>
  <Confirm
    v-if="show_r_confirm"
    :text="confirm_r_text"
    @close="show_r_confirm = false"
  >
  </Confirm>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import Error from './Error.vue';
import Confirm from './Confirm.vue';
import fallback_image from '../assets/fallback.png'

interface Offer{
  id: number;
  name: string;
  price: number;
  discount: number;
  remaining_slots: number;
  title: string;
  description: string;
  advantages: string;
}

const image_src = ref<string>('');
const image_alt = ref<string>('');

const route = useRoute();
const offer = ref<Offer>();
const descriptions = ref<string[]>([]);
const advantages = ref<string[]>([]);

const is_reserved = ref<boolean>(false);
const is_reserving_table = ref<boolean>(false);
const selected_seats = ref<number>(1);

const show_confirm = ref<boolean>(false);
const confirm_text = ref<string>("Poprawnie zarejestrowano rejs.")

const show_r_confirm = ref<boolean>(false);
const confirm_r_text = ref<string>("Poprawnie zarejestrowano miejsca w restauracji.")

const show_error = ref<boolean>(false);
const error_text = ref<string>("Musisz być zalogowany aby złożyć rezerwację.");

/**
 * Funkcja służy do zarezerwowania rejsu przez zalogowanego użytkownika.
 *
 * Sprawdza, czy użytkownik jest zalogowany na podstawie wartości w localStorage.
 * Jeśli nie jest zalogowany, ustawia flagę błędu i przerywa działanie funkcji.
 * Pobiera dane użytkownika z localStorage, w tym `customer_id`.
 * Pobiera `offer_id` z aktualnie wybranej oferty (`offer.value`).
 * Wysyła zapytanie PUT do API, aby dodać rezerwację.
 * Po potwierdzeniu rezerwacji aktualizuje lokalny stan (`is_reserved`) oraz zmniejsza liczbę dostępnych miejsc.
 * W przypadku błędów wyświetla odpowiednie komunikaty w konsoli.
 */
async function reserve_trip() {
  // Upewnia się że użytkownik jest zalogowany
  if(localStorage.getItem("is_logged") === null || localStorage.getItem("is_logged") === "false"){
    show_error.value = true;
    return;
  };

  if (!offer.value) return;

  // Importuje dane użytkownika z localStorage do postaci JSON
  const user_data_raw = localStorage.getItem("user_data");
  if (!user_data_raw) {
    console.warn("Brak danych użytkownika w localStorage.");
    return;
  }

  const user_data = JSON.parse(user_data_raw);
  const customer_id = user_data.id;
  const offer_id = offer.value.id;

  if (isNaN(customer_id) || isNaN(offer_id)) {
    console.error("Błędne ID klienta lub oferty.");
    return;
  }

  // Połączenie API
  try {
    const response = await fetch(`http://localhost:6969/user/reservation/put/${customer_id}/${offer_id}`, {
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error("Błąd odpowiedzi z serwera");
    }

    const data = await response.json();

    if (data.confirmed) {
      is_reserved.value = true;
      offer.value.remaining_slots--;
    } else {
      console.warn("Rezerwacja nie została potwierdzona.");
    }

    show_confirm.value = true;
  } catch (err) {
    console.error("Błąd podczas rezerwacji:", err);
  }
}

/**
 * Anuluje rezerwację aktualnie wybranej oferty przez zalogowanego użytkownika.
 *
 * Funkcja odczytuje dane użytkownika z localStorage, w tym jego `customer_id`.
 * Pobiera `offer_id` z bieżącej oferty (`offer.value`).
 * Następnie wysyła żądanie DELETE do endpointu API, aby anulować rezerwację.
 * Po udanym anulowaniu aktualizuje lokalny stan rezerwacji oraz liczbę dostępnych miejsc.
 * W przypadku błędów wyświetla odpowiednie komunikaty w konsoli.
 */
async function cancel_reservation() {
  if (!offer.value) return;

  // Importuje dane użytkownika z localStorage do postaci JSON
  const user_data_raw = localStorage.getItem("user_data");
  if (!user_data_raw) {
    console.warn("Brak danych użytkownika w localStorage.");
    return;
  }

  const user_data = JSON.parse(user_data_raw);
  const customer_id = user_data.id;
  const offer_id = offer.value.id;

  if (isNaN(customer_id) || isNaN(offer_id)) {
    console.error("Błędne ID klienta lub oferty.");
    return;
  }

  // Połączenie API
  try {
    const response = await fetch(`http://localhost:6969/user/reservation/delete/${customer_id}/${offer_id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Błąd odpowiedzi z serwera");
    }

    const data = await response.json();

    if (data.cancelled) {
      is_reserved.value = false;
      offer.value.remaining_slots++;
    } else {
      console.warn("Nie udało się anulować rezerwacji.");
    }
  } catch (err) {
    console.error("Błąd podczas anulowania rezerwacji:", err);
  }
}

/**
 * Funkcja asynchroniczna pobierająca szczegółowe dane oferty rejsu na podstawie ID z parametru trasy.
 *
 * - Pobiera parametr `id` z aktualnej trasy (`route.params.id`).
 * - Wysyła zapytanie GET do API, aby pobrać pełne dane oferty.
 * - Przypisuje pierwszy wynik odpowiedzi do zmiennej `offer.value`.
 * - Jeśli oferta nie zostanie znaleziona (brak danych), wypisuje błąd w konsoli i przerywa działanie.
 * - Dzieli opis oferty na fragmenty po separatorze "//" i zapisuje je w `descriptions.value`.
 * - Dzieli zalety oferty po separatorze "//" i zapisuje je w `advantages.value`.
 * - W przypadku błędów podczas pobierania lub przetwarzania danych loguje je do konsoli.
 */
async function get_offer(){
  try{
    const id = route.params.id;
    const response = await fetch(`http://localhost:6969/offers/full/get/${id}`);
    const data = await response.json();
    offer.value = data[0];

    if(!offer.value){
      console.error("Nie znaleziono oferty.");
      return;
    }

    descriptions.value = offer.value.description.split("//");
    advantages.value = offer.value.advantages.split("//");
  } catch (err){
    console.error("Error: ", err);
  }
}

/**
 * Asynchroniczna funkcja ładuje obrazek dla aktualnej oferty.
 *
 * - Sprawdza, czy istnieje aktualna oferta (`offer.value`).
 * - Jeśli nie, funkcja kończy działanie.
 * - Próbuje dynamicznie zaimportować obrazek na podstawie nazwy oferty (w małych literach) z katalogu `assets/places`.
 * - Jeśli obrazek zostanie znaleziony, przypisuje jego źródło do `image_src.value` oraz ustawia tekst alternatywny `image_alt.value`.
 * - W przypadku braku pliku obrazka wyświetla ostrzeżenie i ustawia `image_src.value` na domyślny obraz zastępczy (`fallback_image`).
 */
async function get_image() {
  if(!offer.value) return;

  try{
    const image = await import(`../assets/places/${offer.value.name.toLowerCase()}.png`);
    image_src.value = image.default;
    image_alt.value = offer.value.name + " Image";
  } catch (err){
    console.warn(`Could not find image: ${offer.value.name.toLowerCase()}.png`);
    image_src.value = fallback_image;
  }
}

/**
 * Asynchroniczna funkcja sprawdza, czy zalogowany użytkownik
 * potwierdził rezerwację dla aktualnej oferty.
 *
 * - Jeśli aktualna oferta (`offer.value`) nie istnieje, funkcja kończy działanie.
 * - Pobiera dane użytkownika z `localStorage` i parsuje je do obiektu.
 * - Pobiera `customer_id` z danych użytkownika.
 * - Weryfikuje, czy `customer_id` jest poprawną liczbą dodatnią.
 * - Wysyła zapytanie GET do endpointu API w celu sprawdzenia, czy rezerwacja dla danego
 *   `customer_id` i `offer.value.id` istnieje i jest potwierdzona.
 * - Ustawia wartość reaktywnej zmiennej `is_reserved` na podstawie wyniku odpowiedzi (`data.confirmed`).
 * - W przypadku błędu loguje go do konsoli.
 */
async function get_reservation_confirm() {
  if(!offer.value) return;

  const user_data_raw = localStorage.getItem("user_data");
  if (!user_data_raw) return;

  const user_data = JSON.parse(user_data_raw);
  const customer_id = user_data.id;

  if(isNaN(customer_id) || customer_id < 0) return;
  
  try{
    const response = await fetch(`http://localhost:6969/user/reservation/confirm/${customer_id}/${offer.value.id}`);
    const data = await response.json();

    is_reserved.value = data.confirmed;
  } catch(err){
    console.error("Error: ", err);
  }
}

/**
 * Funkcja służy do zarezerwowania miejsc w restauracji w ramach wcześniej zarezerwowanego rejsu.
 * 
 * Warunki działania:
 * - Rejs musi być wcześniej zarezerwowany (`is_reserved` musi być true).
 * - Dane użytkownika muszą znajdować się w localStorage pod kluczem "user_data".
 * 
 * Działanie:
 * - Funkcja odczytuje `customer_id` z localStorage.
 * - Wysyła żądanie PUT do API `/user/reservation/seats/:customer_id/:offer_id/:num_seats`,
 *   aby zaktualizować liczbę zarezerwowanych miejsc w restauracji dla konkretnego rejsu.
 * - Po pomyślnym potwierdzeniu aktualizacji (data.confirmed === true), ukrywa formularz rezerwacji stołu.
 * 
 * Zmienne używane:
 * - `offer.value` — zawiera aktualnie wybraną ofertę rejsu.
 * - `selected_seats.value` — liczba miejsc, które użytkownik chce zarezerwować.
 * - `is_reserved` — informacja czy rejs został wcześniej zarezerwowany.
 * - `is_reserving_table.value` — kontroluje widoczność interfejsu rezerwacji stolika.
 */
async function reserve_seats(){
  if(!offer.value) return;

  if(!is_reserved){
    console.error("Nie mozna razejestrowac miejsc w restauracji, bez uprzedniego zarejestrowania rejsu.");
    return;
  }

  const user_data_raw = localStorage.getItem("user_data");
  if (!user_data_raw) return;

  const user_data = JSON.parse(user_data_raw);
  const customer_id = user_data.id;

  if(isNaN(customer_id) || customer_id < 0) return;
  
  try{
    const response = await fetch(`http://localhost:6969/user/reservation/seats/${customer_id}/${offer.value.id}/${selected_seats.value}`,{
      method: 'PUT'
    });
    const data = await response.json();

    if(data.confirmed){
      is_reserving_table.value = false;
      show_r_confirm.value = true;
    }
  } catch(err){
    console.error("Error: ", err);
  }
}

onMounted(async () => {
  await get_offer();
  await get_image();
  await get_reservation_confirm();
})
</script>