<template>
  <main>
    <BackArrowLayout></BackArrowLayout>
    <div class="card">

      <div class="card-title">
        <h1>Ajouter un livre</h1>
        <h2>Tout les champs sont obligatoires</h2>
      </div>

      <form action="" @submit.prevent="bookUpdater()" v-if="book">
        <div class="input-container">
          <label for="input-title">Titre</label>
          <input type="text" required aria-label="title" id="input-title" maxlength="52" v-model="titleModel">
        </div>
        <div class="input-container">
          <label for="input-author">Autheur</label>
          <input type="text" required aria-label="Author" id="input-author" maxlength="40" v-model="authorModel">
        </div>
        <div class="input-container">
          <label for="input-year">Année de publication</label>
          <input type="text" required aria-label="Publishing year" id="input-year" maxlength="4"
            @input="publishingYearInputHandler" v-model="publishingYear">
        </div>
        <div class="input-container">
          <label for="input-genre">Genre</label>
          <input type="text" required aria-label="Genre" id="input-genre" maxlength="40" v-model="genreModel">
        </div>
        <div class="rating-container">
          <p>Note</p>
          <div class="stars-container">
            <i v-for="n in 5" :key="n" class="fa-solid fa-star rating-star" :class="{ 'filled': rating >= n }"
              @click="ratingCountHandler(n)" tabindex="0" @keyup.enter="ratingCountHandler(n)"></i>
          </div>
        </div>
        <div class="input-file-container">
          <input type="file" @change="uploadImage" id="input-file" :disabled="imageIsLoading" />
          <label for="input-file">{{ imageIsLoading ? "Chargement en cours..." : "Ajouter une image" }}</label>
          <img v-if="imageUrl" :src="imageUrl" alt="Uploaded Image" width="60px" height="60px" id="uploaded-img" />
        </div>
        <input type="submit" class="btn" :disabled="loadingDisplay" >
        <div v-if="messageDisplay" class="message-display" @click="messageDisplay = ''"><span>{{ messageDisplay
        }}</span></div>
          <Loader :isLoading="isLoading" />
      </form>
      <h2 v-else>Chargement en cours...</h2>

    </div>
  </main>
</template>
<!-- -------------------------------------------------------------------- -->
<script setup lang='ts'>
import BackArrowLayout from "../components/BackArrowLayout.vue";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useBookStore } from "../stored-datas/bookStore.ts";

const route = useRoute();
const bookStore = useBookStore();

// Book stored
// ---------------------------------------
const book = computed(() => bookStore.currentBook!);

// Input text publishing year
// ---------------------------------------
const publishingYear = ref("");

const publishingYearInputHandler = () => {

  if (!/^\d{0,4}$/.test(publishingYear.value)) {
    return publishingYear.value = publishingYear.value.replace(/\D/g, "").slice(0, 4);
  }

  if (Number(publishingYear.value) > new Date().getFullYear()) {
    return publishingYear.value = publishingYear.value.slice(0, 3);
  }
};

// Stars
// ---------------------------------------
const rating = ref(0);
const userRating = () => {
  if (!book.value) return 0;
  return book.value.ratings.find(rating => rating.userId === book.value.userId)?.userRated || 0;
};

// let bookHasBeenRated = true;
const ratingCountHandler = (newValue: number) => {
  rating.value = newValue;
};

// Loader
// ---------------------------------------
import Loader from '../components/Loader.vue';
const isLoading = ref(false);

// Input file 
// ---------------------------------------
import { useImageUpload } from '../composable/useImageUpload.ts';
const { imageUrl, imageIsLoading, uploadImage } = useImageUpload();
// const numberOfImagesUploaded = ref(0);
// Post
// ---------------------------------------
import axios from "axios";

const loadingDisplay = ref(false);
const messageDisplay = ref("");

const messageDisplayer = (message: string) => {
  messageDisplay.value = message;
  setTimeout(() => {
    messageDisplay.value = "";
  }, 2000);
};

const bookUpdater = () => {

  if (imageIsLoading.value) {
    return messageDisplayer("Un peu de patiente, la nouvelle image est entrain de charger");
  }
  const userId = sessionStorage.getItem('userId');
  const token = sessionStorage.getItem('token');

  const book = {
    userId: userId,
    title: titleModel.value,
    author: authorModel.value,
    year: Number(publishingYear.value),
    genre: genreModel.value,
    imageUrl: imageUrl.value,
    newRating: rating.value,
  };

  loadingDisplay.value = true;
  // const bodyFormData = new FormData(); // bodyFormData.append('book', JSON.stringify(book)); // console.log(bodyFormData) // console.log(book, JSON.stringify(book));

  axios.put(`${import.meta.env.VITE_API_URL}/books/${bookStore.currentBook?._id}`, book,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  ).then((response) => {
    loadingDisplay.value = false;
    console.log(response.status, response.data);
    messageDisplayer("Livre modifié !");

  }).catch((err) => {
    loadingDisplay.value = false;
    console.error("Error:", err);
    messageDisplayer("Erreur lors de la tentative de modification du livre. Veuillez réessayer plus tard");
  });
  loadingDisplay.value = false;
}

// On mount
// ---------------------------------------
const titleModel = ref("");
const authorModel = ref("");
const genreModel = ref("");

onMounted(async () => {
  if (!bookStore.currentBook || bookStore.currentBook._id !== route.params.id) {
    await bookStore.fetchBook(route.params.id as string);
  };

  titleModel.value = book.value.title;
  authorModel.value = book.value.author;
  genreModel.value = book.value.genre;
  publishingYear.value = book.value.year.toString();
  imageUrl.value = book.value.imageUrl;
  // previousImage = imageUrl.value
  rating.value = userRating();

});

</script>
<!-- -------------------------------------------------------------------- -->
<style scoped>
main {
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  padding: 0 80px 80px 80px;

  background-color: #F2E3CE;

  .card {
    width: 100%;
    padding: 40px;
    gap: 40px;

    border-radius: 6px;
    box-shadow: 0 4px 5px rgba(163, 163, 163, 0.3);

    .card-title {
      gap: 6px;

      h1 {
        font-weight: 500;
        font-style: italic;
      }

      h2 {
        font-weight: 400;
        font-size: 1rem;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
    }

    form {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      gap: 20px;
      /* margin: 40px; */
      padding: 40px;
      width: 100%;

      background-color: rgb(248, 243, 239);
      border-radius: 2px;

      .input-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;

        gap: 10px;

        width: 100%;
        height: 5rem;
        border-radius: 2px;

        input {
          width: 100%;
          height: 100%;
          padding: 6px;
        }
      }

      .rating-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;

        gap: 10px;
        width: 100%;

        .stars-container {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;

          gap: 20px;

          i.fa-star {
            font-size: 1.6rem;
            cursor: pointer;
          }
        }

      }

      .input-file-container {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        gap: 20px;
        width: 100%;
        padding: 40px;

        border: 2px dotted rgb(226, 192, 142);

        input[type='file'] {
          width: 60px;
          height: 60px;
          position: relative;
          border-radius: 12px;

          cursor: pointer;
        }

        input[type='file']::after {
          z-index: 9;
          opacity: 0;
          position: absolute;

          display: flex;
          justify-content: center;
          align-items: flex-end;

          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;

          content: '+';
          font-size: 3.2rem;
          font-weight: 100;

          color: rgb(217, 169, 99);
          background: rgb(243, 227, 207);
          border: 1px solid rgb(217, 169, 99);
          border-radius: 12px;
        }

        label {
          cursor: pointer;
        }

        #uploaded-img {
          position: absolute;
          border-radius: 12px;
          object-fit: cover;
        }
      }

      input[type='submit'] {
        text-align: center;
        margin-top: 20px;
      }
    }
  }

  /* .message-display {
    position: fixed;
    bottom: 25%;

    display: flex;
    justify-content: center;
    align-items: center;

    height: 50%;
    width: 50%;
    font-size: 2em;
    font-family: Arial, Helvetica, sans-serif;
    background: #F2E3CE;
    border-radius: 20px;
  } */
}

@media screen and (max-width: 600px) {
  main {
    padding: 0 40px 40px 40px;

    .card {
      padding: 40px 0 0 0;
      background-color: rgb(248, 243, 239);

      form {
        padding: 20px;

        .input-file-container {
          flex-direction: column;
        }
      }
    }
  }
}

@media screen and (max-width: 400px) {
  main {
    padding: 20px 40px 40px 40px;
    padding: 0 0 40px 0;

    .card {
      form {
        .input-container {
          align-items: center;
        }
      }
    }
  }
}
</style>