<template>
  <main>
    <BackArrowLayout></BackArrowLayout>
    <div class="card">

      <div class="card-title">
        <h1 @click="cheatPlaceHolder()">Ajouter un livre</h1>
        <h2>Tous les champs sont obligatoires</h2>
      </div>

      <form action="" @submit.prevent="bookUploader()">
        <div class="input-container">
          <label for="input-title">Titre</label>
          <input type="text" aria-label="title" id="input-title" maxlength="52" v-model="titleModel" required>
        </div>
        <div class="input-container">
          <label for="input-author">Auteur</label>
          <input type="text" aria-label="Author" id="input-author" maxlength="40" v-model="authorModel" required>
        </div>
        <div class="input-container">
          <label for="input-year">Année de publication</label>
          <input type="text" aria-label="Publishing year" id="input-year" maxlength="4"
            @input="publishingYearInputHandler" v-model="publishingYearModel" required>
        </div>
        <div class="input-container genre">
          <!-- <label for="input-genre">Genre</label>
          <input type="text" aria-label="Genre" id="input-genre" maxlength="40" v-model="genreModel" required> -->

          <label for="genre-livre">Genre du livre</label>
          <select id="genre-livre" name="genre-livre" v-model="selectedGenre" required>
            <option value="">-- Sélectionnez 1 à 3 genre --</option>
            <option value="Roman">Roman</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Aventure">Aventure</option>
            <option value="Science-fiction">Science-fiction</option>
            <option value="Dystopie">Dystopie</option>
            <option value="Policier">Policier</option>
            <option value="Thriller">Thriller</option>
            <option value="Horreur">Horreur</option>
            <option value="Historique">Historique</option>
            <option value="Biographie">Biographie</option>
            <option value="Poesie">Poésie</option>
            <option value="Theatre">Théâtre</option>
            <option value="Bande dessinée">Bande dessinée</option>
            <option value="Jeunesse">Jeunesse</option>
            <option value="Développement-personnel">Développement personnel</option>
            <option value="autre">Autre (précisez)</option>
          </select>

          <!-- Appear if other is selected -->
          <div v-if="showOtherField" class="other-genre-container">
            <label for="autre-genre">Précisez le genre :</label>
            <input type="text" id="autre-genre" name="autre-genre" maxlength="20" v-model="otherGenre">
            <button type="button" class="genre-btn" @click="addGenreModel(otherGenre)">Ajouter</button>
          </div>

          <div v-for="(genre, index) in genreModelArray" :key="index">
            <span>{{ genre }}</span>
            <button type="button" class="genre-btn" @click="deleteGenreFromArray(index)">Supprimer</button>
          </div>

        </div>
        <div class="rating-container">
          <p>Note</p>
          <div class="stars-container">
            <i v-for="n in 5" :key="n" class="fa-solid fa-star rating-star" :class="{ 'filled': rating >= n }"
              @click="ratingCountHandler(n)" tabindex="0" @keyup.enter="ratingCountHandler(n)"></i>
          </div>
        </div>
        <div class="input-file-container">
          <input type="file" @change="uploadImage" id="input-file" :class="{ 'filled': imageUrlFilled }" required
            :disabled="imageIsLoading" />
          <label for="input-file"> {{ imageIsLoading ? "Chargement en cours..." : "Ajouter une image" }}</label>
          <img v-if="imageUrl" :src="imageUrl" alt="Uploaded Image" width="60px" height="60px" id="uploaded-img" />
        </div>
        <input type="submit" class="btn" tabindex="0">
        <div v-if="messageDisplay" class="message-display" @click="messageDisplay = ''"><span>{{ messageDisplay
        }}</span></div>
        <Loader :isLoading="isLoading" />
      </form>
    </div>
  </main>
</template>
<!-- -------------------------------------------------------------------- -->
<script setup lang='ts'>
import { ref, watch } from "vue";
import BackArrowLayout from "../components/BackArrowLayout.vue";

// Input text publishing year
// ---------------------------------------
const publishingYearModel = ref("");

const publishingYearInputHandler = () => {
  if (!/^\d{0,4}$/.test(publishingYearModel.value)) {
    return publishingYearModel.value = publishingYearModel.value.replace(/\D/g, "").slice(0, 4);
  }
  if (Number(publishingYearModel.value) > new Date().getFullYear()) {
    return publishingYearModel.value = publishingYearModel.value.slice(0, 3);
  }
};

// Rating stars
// ---------------------------------------
const rating = ref(0);
let bookHasBeenRated = false;
const ratingCountHandler = (newValue: number) => {
  if (!bookHasBeenRated) bookHasBeenRated = true;
  rating.value = newValue;
};

// Input file - image upload
// ---------------------------------------
import { useImageUpload } from '../composable/useImageUpload.ts';
// const imageUrl = useImageUpload().imageUrl;
// or
// const imageUploadResult = useImageUpload();
// const imageUrl = imageUploadResult.imageUrl;
// const imageIsLoading = imageUploadResult.imageIsLoading;
// const imageUrlFilled = imageUploadResult.imageUrlFilled;
// const uploadImage = imageUploadResult.uploadImage;
// or
const { imageUrl, imageIsLoading, imageUrlFilled, uploadImage } = useImageUpload();
console.log(imageUrl.value);

watch(imageUrl, () => {
  if (imageUrl.value === "error") {
    imageUrl.value = "";
    messageDisplay.value = "Erreur lors de l'upload de l'image. Veuillez réessayer plus tard";
  }
});
// Post
// ---------------------------------------
import axios from "axios";
import Loader from '../components/Loader.vue';
const isLoading = ref(false);

const titleModel = ref("");
const authorModel = ref("");
const genreModel = ref("");
const genreModelArray = ref<string[]>([])
const messageDisplay = ref("");

const messageDisplayer = (message: string) => {
  messageDisplay.value = message;
  setTimeout(() => {
    messageDisplay.value = ""
  }, 2000);
};

const emptyForm = () => {
  titleModel.value = "";
  authorModel.value = "";
  publishingYearModel.value = "";
  genreModel.value = "";
  genreModelArray.value = [];
  rating.value = 0;
  imageUrl.value = "";
  const fileInput = document.getElementById('input-file') as HTMLInputElement;
  fileInput.value = '';

  selectedGenre.value = ""
  otherGenre.value = ""
  showOtherField.value = false;
};

const bookUploader = () => {

  if (!bookHasBeenRated) {
    return messageDisplayer("Noubliez pas de noter le livre !");
  }
  if (imageIsLoading.value) {
    return messageDisplayer("Un tout petit peu de patiente, l'image est entrain de charger");
  }
  if (genreModelArray.value.length === 0) {
    return messageDisplayer("Vous devez ajouter au moins un genre");
  }
  if (titleModel.value === "" || authorModel.value === "" || publishingYearModel.value === "" || genreModel.value === "") {
    return messageDisplayer("Tous les champs sont obligatoires");
  }
  if (rating.value === 0) {
    return messageDisplayer("Vous devez noter le livre");
  }
  if (imageUrl.value === "") {
    return messageDisplayer("Vous devez ajouter une image");
  }

  isLoading.value = true;
  const userId = sessionStorage.getItem('userId');
  const token = sessionStorage.getItem('token');

  const book = {
    userId: userId,
    title: titleModel.value,
    author: authorModel.value,
    year: Number(publishingYearModel.value),
    genre: genreModelArray.value.join(" "),
    ratings: [{
      userId: userId,
      userRated: Number(rating.value),
    }],
    imageUrl: imageUrl.value
  };

  // const bodyFormData = new FormData(); // bodyFormData.append('book', JSON.stringify(book)); // console.log(bodyFormData) // console.log(book, JSON.stringify(book));

  axios.post(`${import.meta.env.VITE_API_URL}/books`, book,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  ).then(() => {
    isLoading.value = false;
    emptyForm();
    messageDisplayer("Livre enregistré !");

  }).catch((error) => {
    isLoading.value = false;
    console.error("Error:", error);
    if (error.status === 400) {
      messageDisplayer("Action impossible, ce livre est déjà enregistré");
    }
    else {
      messageDisplayer("Erreur lors de l'ajout du livre. Veuillez réessayer plus tard");
    }
  });
};

// Automatic input filling
// ==============================================
const cheatPlaceHolder = () => {
  titleModel.value = "Le titre gentil";
  authorModel.value = "L'autheur gentil";
  genreModel.value = "Le genre gentil";

  publishingYearModel.value = "1234";
  rating.value = 3;
  ratingCountHandler(3)
  imageUrl.value = "https://res.cloudinary.com/dj0cryrxy/image/upload/v1742914698/maison_1742914698602.webp";

};

// Genre
// ---------------------------------------
const selectedGenre = ref("");
const otherGenre = ref("");
const showOtherField = ref(false);

const addGenreModel = (genreToAdd: string) => {
  if (genreModelArray.value.length < 3) {
    genreModel.value = genreToAdd;
    genreModelArray.value.push(genreToAdd);
  } else {
    messageDisplayer("Vous ne pouvez pas ajouter plus de 3 genres");
  }
};

const deleteGenreFromArray = (index: number) => {
  genreModelArray.value.splice(index, 1);
};

watch(selectedGenre, (newValue) => {
  if (newValue === "autre") {
    showOtherField.value = true;
  } else {
    showOtherField.value = false;
    if (newValue !== "") {
      addGenreModel(newValue);
    }
  }
  console.log(genreModelArray.value.join(" "))
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

        .other-genre-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;

          gap: 20px;
          width: 100%;

          input {
            width: 100%;
            height: 100%;
            padding: 6px;
          }
        }
      }

      .input-container.genre {
        height: auto;

        .genre-btn {
          margin: 6px;
          padding: 2px 10px;
          font-size: 0.8rem;
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

        input[type='file'].filled::after {
          opacity: 0;
          z-index: 9;
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
  }

  .message-display::after {
  position: absolute;
  top: 5%;
  left: 5%;
  content: 'X';
  font-family: sans-serif, cursive;
  font-size: 1.2em;
  background: none;
  } */

}

@media screen and (max-width: 600px) {
  main {
    padding: 20px 40px 40px 40px;

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