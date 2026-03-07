<template>
  <main>
    <div class="card">
      <div class="card-title">
        <h1 v-if="userConnected">Vos Livres</h1>
        <h1 v-else>Nos Livres</h1>
        <h2 v-if="userConnected">Ajouter un livre</h2>
        <h2 v-else>à lire et à relire ...</h2>
        <RouterLink :to="userConnected ? `/upload` : '/authentification'">
          <button :class="{ 'attention-pulse': userBookList.length === 0 }" v-if="userConnected" class="btn add-btn"
            aria-label="Click to add a book"></button>
        </RouterLink>
      </div>
      <!-- <h3 v-if="userConnected && userBookList.length === 0">Vous pouvez dès à présent commencer à ajouter vos premiers
        livres</h3> -->
      <Loader :isLoading="userBooksLoading" />
      <div class="books-thumbnails-container user-books" v-if="userConnected && userBookList.length > 0">
        <div class="book-thumbnail" v-if="userBookList.length > 0" v-for="(book, index) in userBookList" :key="index">
          <RouterLink :to="'/books/' + book._id" class="book-link">
            <div class="book-thumbnail-img-container">
              <img :src="book.imageUrl?.toString() || imgPlaceholder" :alt="book.title + ' image'" width="120px"
                height="140">

            </div>
            <div class="book-thumbnail-informations">
              <div class="book-thumbnail-rating">
                <!-- Rating stars fill -->
                <i v-for="n in 5" :key="n" class="fa-solid fa-star rating-star"
                  :class="{ 'filled': Number(book.averageRating) >= n }"></i>
              </div>
              <p class="book-thumbnail-title">{{ book.title }}</p>
              <p class="book-thumbnail-author">{{ book.author }}</p>
              <p class="book-thumbnail-year">{{ book.year }}</p>
              <p class="book-thumbnail-description">{{ book.genre }}</p>
            </div>
          </RouterLink>
        </div>
      </div>
      <hr>
      <h3>Recherchez par :</h3>
      <div class="sort-books-filters" ref="bookFiltersContainer">
        <h4 @click="filterBookBy('title')" @keyup.enter="filterBookBy('title')" tabindex="0" class="sort-books-filter"
          :class="filterBooksBy === 'title' ? 'active' : ''">Titre</h4>
        <h4 @click="filterBookBy('author')" @keyup.enter="filterBookBy('author')" tabindex="0" class="sort-books-filter"
          :class="filterBooksBy === 'author' ? 'active' : ''">Auteur</h4>
        <h4 @click="filterBookBy('genre')" @keyup.enter="filterBookBy('genre')" tabindex="0" class="sort-books-filter"
          :class="filterBooksBy === 'genre' ? 'active' : ''">Genre</h4>
      </div>
      <div class="sort-books-inputs">
        <label for="genreSearch" class="sr-only">Filtre</label>
        <input v-if="filterBooksBy === 'genre' || filterBooksBy === 'author' || filterBooksBy === 'title'" type="text"
          id="genreSearch" placeholder="Filtre" v-model="booksFilter" maxlength="30" @keyup.enter="fetchBooksByFilter">
        <input v-if="filterBooksBy === 'year'" type="number" id="genreSearch" placeholder="Filtre" v-model="booksFilter"
          :max="currentYear" min="0" @keyup.enter="fetchBooksByFilter">
        <br>
        <button id="genre-search-btn" class="btn" @click="fetchBooksByFilter" @keyup.enter="fetchBooksByFilter">
          Recherche <i class="fa-solid fa-magnifying-glass"></i> </button>
        <button id="genre-search-btn" class="btn" @click="booksFetcher" @keyup.enter="booksFetcher">
          Rafraichir <i class="fa-solid fa-arrow-rotate-left"></i></button>
      </div>
      <div class="books-thumbnails-container other-books">
        <!-- Books display -->
        <div class="book-thumbnail" v-if="bookList.length > 0" v-for="(book, index) in bookList" :key="index">
          <RouterLink :to="'/books/' + book._id" class="book-link">
            <div class="book-thumbnail-img-container">
              <img :src="book.imageUrl?.toString() || imgPlaceholder" :alt="book.title + ' image'" width="120px"
                height="140">

            </div>
            <div class="book-thumbnail-informations">
              <div class="book-thumbnail-rating">
                <!-- Rating stars fill -->
                <i v-for="n in 5" :key="n" class="fa-solid fa-star rating-star"
                  :class="{ 'filled': Number(book.averageRating) >= n }"></i>
              </div>
              <p class="book-thumbnail-title">{{ book.title }}</p>
              <p class="book-thumbnail-author">{{ book.author }}</p>
              <p class="book-thumbnail-year">{{ book.year }}</p>
              <p class="book-thumbnail-description">{{ book.genre }}</p>
            </div>
          </RouterLink>
        </div>
        <Loader :isLoading="otherBookLoading" />
      </div>
      <div v-if="messageDisplay" class="message-display" @click="messageDisplay = ''"><span>{{ messageDisplay
          }}</span></div>
    </div>
  </main>
  <span class="IntersectionObserver-beacon" id="fetchMoreBooks-beacon" ref="fetchMoreBooksBeacon"></span>
</template>
<!----------------------------------- Script ------------------------------------>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import imgPlaceholder from "../assets/old-book.webp";

// User states
// -----------------------------------------
// import userStates from "/src/stored-datas/user-states";
import userStates from "../stored-datas/user-states";
const storedUserStates = userStates();
const userConnected = computed(() => {
  return storedUserStates.logUserStates();
});

// Books display
// =============================================
import axios from "axios";
import Loader from '../components/Loader.vue';
const userIdToFilter = sessionStorage.getItem("userId");

interface Book {
  _id: string;
  userId: String,
  title: String,
  author: String,
  year: Number,
  genre: String,
  ratings: [
    {
      userId: String,
      grade: Number
    }
  ],
  imageUrl: String,
  averageRating: String
};
const bookList = ref<Book[]>([]);
const userBookList = ref<Book[]>([]);


// Error message displayer
// ---------------------------------------------
const messageDisplay = ref("");

const messageDisplayer = (message: string) => {
  messageDisplay.value = message;
  setTimeout(() => {
    messageDisplay.value = ""
  }, 2000);
};

// Automatic Fetch
// ---------------------------------------------
let numberOfBooksPagesToFetch = 1;
const otherBookLoading = ref(false);
// Prevent multiple loading at the same time
let numberOfBooks = 0;
// Prevent inifinite intersection loading
const numberOfBooksFetcher = () => {
  axios.get(import.meta.env.VITE_API_URL + "/books?numberofBooksToDisplay=all")
    .then((response) => numberOfBooks = response.data.length)
    .catch((error) => console.log(error));
};

const booksFetcher = () => {
  otherBookLoading.value = true;
  const numberofBooksToDisplay = 6 * numberOfBooksPagesToFetch;
  axios.get(import.meta.env.VITE_API_URL + "/books?numberofBooksToDisplay=" + numberofBooksToDisplay)
    .then((response) => {
      bookList.value = response.data;
      otherBookLoading.value = false;
      numberOfBooksPagesToFetch++;
      console.log("bookList.value", bookList.value.length)

    })
    .catch((error) => {
      console.log(error)
      otherBookLoading.value = false;
      messageDisplayer("Nous rencontrons des difficultés à charger les livres... Rafraichissez la page ou revenez plus tard");
    });
};
const userBooksLoading = ref(false);
const userBooksFetcher = () => {
  userBooksLoading.value = true;
  axios.get(import.meta.env.VITE_API_URL + "/user/" + userIdToFilter + "/books", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      userBooksLoading.value = false;
      userBookList.value = response.data;
    })
    .catch((error) => {
      console.log(error)
      userBooksLoading.value = false;
      messageDisplayer("Nous rencontrons des difficultés à charger les livres... Rafraichissez la page ou revenez plus tard");
    });
}

// Filter books
// ---------------------------------------------
const currentYear = ref(new Date().getFullYear());
const filterBooksBy = ref("title");
const booksFilter = ref(null)
const filterBookBy = (event: string) => {
  filterBooksBy.value = event;
  booksFilter.value = null;
};

const fetchBooksByFilter = () => {
  if (!filterBooksBy.value) {
    messageDisplayer("Veuillez sélectionner un critère de recherche");
    return
  };
  if (!booksFilter.value) {
    messageDisplayer("Veuillez entrer un filtre de recherche");
    return
  };

  axios.get(import.meta.env.VITE_API_URL + "/books?" + filterBooksBy.value + "=" + booksFilter.value)
    .then((response) => {
      bookList.value = response.data;
      if (response.data.length === 0) {
        messageDisplayer("Aucun livre trouvé pour ce filtre");
      };
    })
    .catch((error) => {
      console.log(error);
      messageDisplayer("Nous rencontrons des difficultés à charger les livres... Rafraichissez la page ou revenez plus tard");
    });
}
// Observer
// ---------------------------------------------
// For ONE Fetch !
// const bookFiltersContainer = ref<HTMLElement | null>(null);
// let hasFetched = false;

// const observer = new IntersectionObserver(handleIntersection);
// function handleIntersection(entries: IntersectionObserverEntry[]) {
//   entries.forEach(entry => {
//     if (entry.isIntersecting && !hasFetched) {
//       hasFetched = true; // Prevent multiple fetches
//       booksFetcher();
//     }
//   });
// };
// Watch whenever bookFiltersContainer is ready (not null)
// watch(bookFiltersContainer, () => {
//   if (bookFiltersContainer.value && !hasFetched) {
//     observer.observe(bookFiltersContainer.value);
//   };
// });
// ! hcteF ENO roF

// Infinite scroll
const fetchMoreBooksBeacon = ref<HTMLElement | null>(null);
const observer = new IntersectionObserver(handleIntersection);
function handleIntersection(entries: IntersectionObserverEntry[]) {
  entries.forEach(entry => {
    if (entry.isIntersecting && (numberOfBooks !== bookList.value.length) && booksFilter.value === null) {
      // Prevent infinite loop if the total of books is already displayed
      // &&  booksFilter.value != null
      booksFetcher();
    }
  });
};

// Watch whenever fetchMoreBooksBeacon is ready (not null)
watch(fetchMoreBooksBeacon, () => {
  if (fetchMoreBooksBeacon.value) {
    observer.observe(fetchMoreBooksBeacon.value);
  }
});

onMounted(() => {
  numberOfBooksFetcher()
  if (userIdToFilter) {
    userBooksFetcher();
  } else {
    booksFetcher();
  }
  console.log(userBookList.value.length)
  console.log(import.meta.env.VITE_API_URL)
})

onUnmounted(() => {
  observer?.disconnect();
});


</script>
<!----------------------------------- Style ------------------------------------>
<style scoped>
@keyframes pulse-scale {
  0% {
    transform: scale(1);
    box-shadow: 0 0 5px rgba(216, 168, 99, 0.3);
  }

  50% {
    transform: scale(1.15);
    box-shadow: 0 0 20px rgba(216, 168, 99, 0.8);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 5px rgba(216, 168, 99, 0.3);
  }
}

main {
  background: url(../assets/white-brown-library.webp) fixed;

  .card {
    /* border: 4px solid red; */
    gap: 20px;
    margin: 80px;
    padding: 40px;
    width: 100%;

    border-radius: 10px;

    .card-title {

      a {
        display: flex;
        justify-content: center;
        align-items: center;

        button {
          margin-top: 20px;

          &.attention-pulse {
            animation: pulse-scale 1s infinite ease-in-out;
          }
        }
      }
    }

    .sort-books-filters {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;

      .sort-books-filter {
        cursor: pointer;

        &.active {
          outline: 2px solid rgb(216, 168, 99);
          border-radius: 2px;
        }
        &:focus-visible {
          outline: 2px solid rgb(0, 0, 0);
          border-radius: 2px;
        }
        &.active:focus-visible {
          outline: 2px solid rgb(0, 0, 0);
          box-shadow: 0 0 0 4px rgb(216, 168, 99);
        }

        &:hover {
          outline: 2px solid rgb(216, 168, 99);
          border-radius: 2px;
        }
      }
    }

    .sort-books-inputs {

      #genre-search-btn {
        margin: 6px 6px 0 6px;
        padding: 10px;
        font-size: 0.8em;

        i {
          margin-left: 2px;
        }
      }
    }
  }

  hr {
    width: 60%;
  }
}

@media screen and (max-width: 460px) {
  main {
    background: none;
    position: relative;

    .card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      gap: 20px;
      margin: 0;
      padding: 20px;
      width: 100%;
      border-radius: 0;

      background: url(../assets/white-brown-library.webp) fixed;

      .card-title {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        background: rgb(254, 254, 255);
        gap: 6px;
        padding: 6px;
        width: 86%;

        button {
          margin-top: 0;
        }

        border-radius:12px;
      }

      h2,
      h3,
      h4 {
        background: white;
        border-radius: 6px;
        padding: 6px;
      }
    }
  }
}
</style>