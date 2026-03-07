<template>
    <main>
        <BackArrowLayout></BackArrowLayout>
        <div class="card">
            <div class="book" v-if="bookStore.currentBook != null">
                <div class="book-img-container">
                    <img class="book-img" :src="bookStore.currentBook.imageUrl"
                        :alt="bookStore.currentBook.title + ' image'" width="220px" height="280">
                </div>
                <div class="book-informations-actions-rating">
                    <div class="book-actions-and-label-container" v-show="userConnected && isUserBook">
                        <p>Vous avez publié cet ouvrage, vous pouvez le :</p>
                        <div class="book-actions-container">
                            <RouterLink :to="`/books/${bookStore.currentBook._id}/edit`"><span class="book-action"
                                    id="update-book-span">modifier</span>
                            </RouterLink>
                            <span tabindex="0" class="book-action" id="delete-book-span" @click="showModal"
                                @keyup.enter="showModal">supprimer</span>
                        </div>
                    </div>
                    <div class="book-informations">
                        <p class="book-title">{{ bookStore.currentBook.title }}</p>
                        <div class="book-title-and-author">
                            <p class="book-author">{{ bookStore.currentBook.author }} - {{ bookStore.currentBook.year }}
                            </p>
                        </div>
                        <div class="book-description-and-rating">
                            <p class="book-description">{{ bookStore.currentBook.genre }}</p>
                            <div class="book-rating">
                                <!-- Rating stars fill -->
                                <i v-for="n in 5" :key="n" class="fa-solid fa-star rating-star"
                                    :class="{ 'filled': bookStore.currentBook.averageRating >= n }"></i>
                            </div>
                        </div>
                        <!-- <p id="postedBy">Posté par: </p> -->
          
                    </div>
                    
                    <div class="book-rating-and-label-container" v-show="userConnected">
                        <h3>Votre note</h3>
                        <div class="book-rating-container" id="user-rating-container">
                            <i v-if="hasUserRatedThisBook" v-for="n in 5" :key="n" class="fa-solid fa-star rating-star"
                                :class="{ 'filled': isUserBook ? userRating >= n : currentUserRating >= n }"></i>
                            <i v-if="!hasUserRatedThisBook" v-for="n in 5" :key="n"
                                class="fa-solid fa-star rating-star clickable" @click="rateBook(n)" tabindex="0"
                                @keyup.enter="rateBook(n)"></i>
                        </div>
                    </div>
                </div>

                <div id="book-modal" :class="{ 'hidden': !ModalIsVisible }">
                    <h3>Êtes vous sure de vouloir supprimer ce livre ?</h3>
                    <img src="/src/assets/delete-book.jpg" alt="trash can image" width="120px">
                    <div class="btn-container">
                        <button :disabled="isDisabled" @click="() => deleteBook()"
                            @keyup.enter="() => deleteBook()">OUI</button>
                        <button :disabled="isDisabled" @click="hideModal" @keyup.enter="hideModal">NON</button>
                    </div>
                    <p v-if="deleteBookFailed">{{ deletedBookMessage }}</p>
                    <Loader :isLoading="isLoading" />
                </div>
            </div>
            <div v-if="!bookStore.currentBook" class="loader-container">
                <Loader :isLoading="isLoading" />
            </div>
            <div>
                <p v-if="!userConnected">Connectez-vous pour noter ce livre</p>
                <p v-if="userConnected && !hasUserRatedThisBook">Cliquez sur une étoile pour noter ce livre</p>
            </div>
            <div>
                <span id="reportProblem" tabindex="0" @click="reportProblem" @keyup.enter="reportProblem">Signaler un
                    problème</span>
            </div>
            <hr>
            <div class="best-rated-container">
                <h2>Les mieux notés</h2>
                <div class="books-thumbnails-container best-rated-books-thumbnail-container">
                    <!-- Book display -->
                    <div class="book-thumbnail" v-for="(book, index) in bestRatedBookList" :key="index">
                        <RouterLink :to="'/books/' + book?._id" class="book-link" target="_blank">
                            <div class="book-thumbnail-img-container">
                                <img :src="book?.imageUrl" :alt="book?.title + ' image'" width="120px" height="140">
                            </div>
                            <div class="book-thumbnail-informations">
                                <div class="book-thumbnail-rating">
                                    <!-- Rating stars fill -->
                                    <i v-for="n in 5" :key="n" class="fa-solid fa-star rating-star"
                                        :class="{ 'filled': book?.averageRating >= n }"></i>
                                </div>
                                <p class="book-thumbnail-title">{{ book?.title }}</p>
                                <p class="book-thumbnail-author">{{ book?.author }}</p>
                                <p class="book-thumbnail-year">{{ book?.year }}</p>
                                <p class="book-thumbnail-description">{{ book?.genre }}</p>
                            </div>
                        </RouterLink>
                    </div>
                </div>
            </div>
            <div v-if="messageDisplay" class="message-display" @click="messageDisplay = ''">
                <span>{{ messageDisplay }}</span>
            </div>
        </div>
    </main>
</template>
<!------------------------------ Script ---------------------------- -->
<script setup lang="ts">
// import "./book-page.css";
import { onMounted, ref, computed } from 'vue';
import BackArrowLayout from "../components/BackArrowLayout.vue";

import userSates from "../stored-datas/user-states.ts";
const storedUserStates = userSates();
const userConnected = computed(() => {
    return storedUserStates.logUserStates();
});

import { useBookStore } from "../stored-datas/bookStore.ts";
const bookStore = useBookStore();

interface Book {
    _id: string;
    userId: String,
    title: string,
    author: string,
    year: number,
    genre: string,
    ratings: [
        {
            userId: string,
            userRated: number
        }
    ],
    imageUrl: string,
    averageRating: number
};

const userRating = computed(() => {
    const book = bookStore.currentBook;
    if (!book) return 0;
    const foundRating = book.ratings.find(rating => rating.userId === book.userId);
    return foundRating ? foundRating.userRated : 0;
});

const bestRatedBookList = ref<Book[]>([]);

const currentuserId = computed(() => {
    return storedUserStates.logUserId();
});
const isUserBook = computed(() => {
    return bookStore.currentBook?.userId === currentuserId.value;
});

const currentUserRating = ref(0)
const hasUserRatedThisBook = computed(() => {
    let result = false;
    const ratingsArray = bookStore.currentBook?.ratings || [];
    for (let i = 0; i < ratingsArray.length; i++) {
        if (ratingsArray[i].userId === currentuserId.value) {
            result = true;
            currentUserRating.value = ratingsArray[i].userRated;
        }
    }
    return result;
});

// Loader
// -----------------------------------------------
import Loader from '../components/Loader.vue';
const isLoading = ref(false);
const isDisabled = ref(false);

// On mounted fetch / restore from stored datas
// -----------------------------------------------
import axios from "axios";
import { useRoute } from 'vue-router';

const route = useRoute();
const bookId = route.params.id;

const bestRatedBooksFetcher = () => {
    axios.get(import.meta.env.VITE_API_URL + "/books/best-rated")
        .then((response) => {
            bestRatedBookList.value = response.data;
        })
        .catch((error) => console.log(error));
};

onMounted(() => {
    bookStore.fetchBook(bookId as string);
    console.log(bookStore.currentBook);
    bestRatedBooksFetcher();
})

// Modal
// -----------------------------------------------
import { useRouter } from 'vue-router';
const router = useRouter();
const deleteBookFailed = ref(false)
const deletedBookMessage = ref("")

const ModalIsVisible = ref(false);

const showModal = () => {
    ModalIsVisible.value = true;
};

const hideModal = () => {
    ModalIsVisible.value = false;
};

const deleteBook = () => {
    isDisabled.value = true;
    isLoading.value = true;
    const token = sessionStorage.getItem('token');

    axios.delete(import.meta.env.VITE_API_URL + "/books/" + bookId, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then((response) => {
            isDisabled.value = false;
            isLoading.value = false;
            if (response.status === 200) {
                console.log("deleted : ", response.data);
                router.push('/books/deleted')
            } else {
                console.log(response);
                deleteBookFailed.value = true;
                deletedBookMessage.value = `Erreur ${response.status} : Réessayez plus tard`
            }
        })
        .catch((error) => {
            console.log(error)
            isDisabled.value = false;
            isLoading.value = false;
            deleteBookFailed.value = true;
            if (error.status === 401) {
                deletedBookMessage.value = "Action non authorisé"
            } else {
                deletedBookMessage.value = "Oups, il semble y avoir un probleme de connexion au server"
            }
        });
};

// Rate book
// -----------------------------------------------
// const loadingDisplay = ref(false);
const messageDisplay = ref("");

const messageDisplayer = (message: string, refreshPage: boolean) => {
    messageDisplay.value = message;
    setTimeout(() => {
        messageDisplay.value = "";
        if (refreshPage) {
            bookStore.fetchBook(bookId as string);
        }
    }, 2000);
};

const rateBook = (newRating: Number) => {
    if (isDisabled.value) return
    console.log(newRating)

    // Prevent a new click during exceution
    isDisabled.value = true

    const userId = sessionStorage.getItem('userId');
    const newRatingObject = {
        userId: userId,
        userRated: newRating,
    };

    const token = sessionStorage.getItem('token');
    axios.put(`${import.meta.env.VITE_API_URL}/books/${bookStore.currentBook?._id}/ratings`, newRatingObject,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    ).then(() => {
        messageDisplayer("Note ajoutée !", true);
        isDisabled.value = false;
    }).catch((err) => {
        console.error("Error:", err);
        messageDisplayer("Erreur lors de l'ajout de la note", false);
        isDisabled.value = false;
    });
}

// Report problem
// -----------------------------------------------
const reportProblem = () => {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    const bookId = bookStore.currentBook?._id;

        if(!token || !userId){ 
            messageDisplayer("Connectez vous afin de signaler un problème", false)
            return;
        }

    const reportObject = {
        userId: userId,
        bookId: bookId,
        message: "Problème signalé",
    };
    axios.post(`${import.meta.env.VITE_API_URL}/report`, reportObject, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => {
            console.log("Report sent:", response.data);
            messageDisplayer("Problème signalé !", false);
        })
        .catch((error) => {
            console.error("Error sending report:", error);
            messageDisplayer("Erreur lors de l'envoi du signalement", false);
        });
};

</script>
<!---------------------------- Style ---------------------------- -->
<style scoped>

main {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    padding: 0 80px 80px 80px;

    background-color: #F2E3CE;

    .card {
        gap: 20px;
        width: 100%;
        padding: 40px;

        border-radius: 6px;
        box-shadow: 0 4px 5px rgba(163, 163, 163, 0.3);

        .book {

            display: flex;
            justify-content: space-around;
            align-items: center;

            position: relative;

            gap: 40px;
            width: 100%;

            .book-img-container {
                flex: 2;

                display: flex;
                justify-content: center;
                align-items: center;

                .book-img {
                    object-fit: cover;
                }
            }

            .book-informations-actions-rating {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;

                gap: 2px;
                flex: 3;
                height: 100%;

                .book-actions-and-label-container,
                .book-informations,
                .book-rating-and-label-container {
                    width: 100%;
                }

                .book-actions-and-label-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: flex-start;
                    text-align: left;

                    gap: 10px;

                    .book-actions-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;

                        gap: 10px;

                        .book-action {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            font-style: italic;
                            cursor: pointer;
                        }

                        .book-action:hover {
                            text-decoration: underline;
                        }

                        #update-book-span {
                            color: rgb(83, 83, 83);
                        }

                        #delete-book-span {
                            color: rgb(151, 0, 0);
                        }
                    }

                }

                .book-informations {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: left;

                    gap: 4px;

                    .book-title,
                    .book-title-and-author,
                    .book-description-and-rating {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;

                        width: 100%;
                        padding: 10px 0;
                    }

                    .book-description-and-rating {
                        gap: 20px;
                    }

                   /* #postedBy{
                        width: 100%;
                        padding:6px 0px;
                    } */
                }

                .book-rating-and-label-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 20px 0;
                    gap: 20px;
                    background: rgb(248, 243, 239);

                    .book-rating-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 2px;
                        border-radius: 2px;

                        i.clickable {
                            cursor: pointer;
                        }
                    }
                }
            }
        }

        hr {
            width: 60%;
        }

        .best-rated-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: start;

            gap: 20px;

            h2 {
                font-weight: 500;
            }
        }
    }

}

#book-modal {
    z-index: 9;
    position: absolute;
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    width: 100%;
    height: 100%;
    border-radius: 6px;
    box-shadow: 0 4px 5px rgba(0, 0, 0, 0.3);
    background: rgb(243, 227, 207);
}

#book-modale img {
    position: relative;
}

#book-modal .btn-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    width: 100%;
}

#book-modal .btn-container button {
    width: 25%;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

#book-modal.hidden {
    display: none;
}

#reportProblem {
    cursor: pointer;
    color: rgb(151, 0, 0);
    font-weight: 500;
}

#reportProblem:hover {
    text-decoration: underline;
}

@media screen and (max-width: 800px) {
    main {
        .card {

            .book {
                flex-direction: column;

                .book-img-container {
                    flex: 1;

                    .book-img {
                        object-fit: cover;
                    }
                }

                .book-informations-actions-rating {
                    /* width: 100%; */
                    flex: 1;

                }
            }

            hr {
                width: 60%;
            }

            .best-rated-container {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: start;

                gap: 20px;

                h2 {
                    font-weight: 500;
                }
            }
        }
    }
}

@media screen and (max-width: 600px) {
    main {
        padding: 0 40px 40px 40px;

        .card {
            padding: 20px;
            background-color: rgb(248, 243, 239);
        }
    }
}

@media screen and (max-width: 400px) {
    main {
        padding: 0 0 40px 0;

        .card {
            padding: 20px;
        }
    }
}
</style>