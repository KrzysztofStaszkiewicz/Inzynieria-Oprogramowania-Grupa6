<template>
  <div v-if="is_admin" class="admin">
    
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
}

const is_logged = ref<boolean>(false);
const is_admin = ref<boolean>(false);

const user_data = ref<UserData | null>(null);

/**
 * Funkcja: get_is_admin
 *
 * Opis:
 * Sprawdza, czy aktualnie zalogowany użytkownik posiada rolę "admin".
 * W tym celu wykonuje zapytanie GET do API `/user/role/:customer_id`, gdzie
 * `customer_id` pochodzi z danych przechowywanych w `user_data`.
 *
 * Działanie:
 * - Jeśli `user_data` nie istnieje (np. użytkownik nie jest zalogowany), funkcja kończy działanie.
 * - Wysyła zapytanie GET do lokalnego serwera z ID użytkownika.
 * - Odbiera dane zawierające rolę użytkownika.
 * - Jeżeli rola to `"admin"`, ustawia lokalną zmienną reaktywną `is_admin.value` na `true`.
 *
 * Zastosowanie:
 * Funkcja przydaje się do warunkowego renderowania elementów tylko dla administratorów,
 * np. przy panelach zarządzania, dodawaniu ofert itp.
 *
 * Przykład odpowiedzi z API:
 * ```json
 * [
 *   { "role": "admin" }
 * ]
 * ```
 */
async function get_is_admin(){
  if(!user_data.value) return;

  try{
    const result = await fetch(`http://localhost:6969/user/role/${user_data.value.id}`);
    const data = await result.json();

    if(data[0].role === "admin") is_admin.value = true;
  } catch(err){
    console.error("Error: ", err);
  }
}

/**
 * Po zamontowaniu komponentu:
 * - Sprawdza, czy użytkownik jest zalogowany, odczytując `is_logged` z localStorage.
 * - Jeśli jest zalogowany, próbuje wczytać dane użytkownika z `user_data` i sparsować je do obiektu.
 * - W przypadku błędu parsowania usuwa dane i oznacza użytkownika jako niezalogowanego.
 * - Jeśli użytkownik nie jest zalogowany, zeruje dane użytkownika.
 * - Jeśli użytkownik nie jest administratorem, to przenosi go do strony głównej.
 */
onMounted(() => {
  is_logged.value = localStorage.getItem('is_logged') === 'true';

  // Import imienia i nazwiska użytkownika w przypadku, gdy jest zalogowany
  if(is_logged.value){
    const stored_user_data = localStorage.getItem("user_data");
    
    if(stored_user_data){
      try{
        user_data.value = JSON.parse(stored_user_data) as UserData;
      } catch(err){
        console.error('Błąd podczas parsowania user_data z localStorage:', err);

        localStorage.removeItem('is_logged');
        localStorage.removeItem('user_data');
        is_logged.value = false;
        user_data.value = null;
      }
    }

    get_is_admin();
  }
  else{
    user_data.value = null;
  }

  if(!is_admin) router.push('/');
});
</script>