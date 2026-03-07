<template>
    <main>
        <div class="card">
            <div class="inputs-container" @keydown.enter="signIn">
                <label for="email-input">Adresse email</label>
                <div class="input-container" id="email-input-container">
                    <input type="text" id="email-input" v-model="emailModel">
                </div>
                <label for="password-input">Mot de passe</label>
                <div class="input-container" id="password-input-container">
                    <input :type="showPassword ? 'text' : 'password'" id="password-input" v-model="passwordModel">
                    <span class="password-appear-btn" @click="togglePassword"></span>
                </div>
            </div>
            <div class="buttons-container">
                <button @click="signIn" :disabled="isDisabled">Se connecter</button>
                <span>OU</span>
                <button @click="signUp">S'inscrire</button>
            </div>
            <div v-if="messageDisplay" class="message-display" @click="messageDisplay = ''" @focus="messageDisplay = ''"
                tabindex="0"><span>{{
                    messageDisplay }}</span></div>
            <Loader :isLoading="isLoading" />
        </div>
    </main>
</template>
<!-- ---------------------------- -->
<script setup lang='ts'>

import { ref, computed } from 'vue';
// Loader
import Loader from '../components/Loader.vue';
const isLoading = ref(false);

// Inputs
const isDisabled = ref(false)
const emailModel = ref("");
const emailModelLowerCase = computed(() => emailModel.value.toLowerCase());
const passwordModel = ref("");
const showPassword = ref(false);
const togglePassword = () => {
    showPassword.value = !showPassword.value;
};


// Fetch
import axios from 'axios';
import { useRouter } from 'vue-router';
const router = useRouter();
import userSates from "../stored-datas/user-states.ts";
const storedUserStates = userSates();

const signIn = () => {
    isDisabled.value = true;
    isLoading.value = true;
    if (emailModelLowerCase.value.length === 0 || passwordModel.value.length === 0) {
        isLoading.value = false;
        isDisabled.value = false;
        return messageDisplayer('Veuillez compléter tous les champs');
    };

    axios.post(import.meta.env.VITE_API_URL + "/auth/login", {
        email: emailModelLowerCase.value,
        password: passwordModel.value
    })
        .then((response) => {
            isLoading.value = false;
            if (response.status === 200 && response.data.token) {
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('userId', response.data.userId);
                storedUserStates.changeUserStates();
                storedUserStates.changeUserId(response.data.userId);
                messageDisplayer("Bienvenue !");

                setTimeout(() => {
                    router.push('/');
                    isDisabled.value = false;
                }, 1000)

            } else {
                isDisabled.value = false;
                messageDisplayer("Un problème est survenu... ");
            }
        })
        .catch((error) => {
            isLoading.value = false;
            isDisabled.value = false;
            if (error.status === 401) {
                messageDisplayer("Email ou mot de passe incorrect");
            } else if (error.status === 500) {
                messageDisplayer("La connexion au serveur a échoué, actualisez la page ou réessayez plus tard");
            }
        });

    isLoading.value = false;
    isDisabled.value = false;
};

const signUp = () => {
    isDisabled.value = true;
    isLoading.value = true;
    if (emailModelLowerCase.value.length === 0 || passwordModel.value.length === 0) {
        isDisabled.value = false;
        isLoading.value = false;
        return messageDisplayer('Veuillez compléter tous les champs');
    };

    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailModelLowerCase.value)) {
        isDisabled.value = false;
        isLoading.value = false;
        return messageDisplayer("Le format de l'email n'est pas correct");
    };

    axios.post(import.meta.env.VITE_API_URL + "/auth/signup", {
        email: emailModelLowerCase.value,
        password: passwordModel.value
    })
        .then(() => {
            isDisabled.value = false;
            isLoading.value = false;
            messageDisplayer("Inscription réussie !");
        })
        .catch((error) => {
            isDisabled.value = false;
            isLoading.value = false;
            if (error.response && error.response.status === 400) {
                return messageDisplayer("Email déjà utilisé");
            } else {
                return messageDisplayer("La connexion au serveur a échoué, actualisez la page ou réessayez plus tard");
            }
        });

    isDisabled.value = false;
    isLoading.value = false;
};

const messageDisplay = ref('');
const messageDisplayer = (message: string) => {
    messageDisplay.value = message;
    setTimeout(() => {
        messageDisplay.value = '';
    }, 2000);
};

</script>
<!-- ---------------------------- -->
<style scoped>
main {
    background-color: #F2E3CE;

    .card {
        gap: 20px;
        width: 80%;
        padding: 40px;
        margin: 80px;

        border-radius: 2px;
        box-shadow: 0 4px 5px rgba(163, 163, 163, 0.3);

        .inputs-container {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;

            gap: 10px;
            width: 100%;

            .input-container {
                position: relative;
                width: 100%;
                height: 3rem;
                border-radius: 2px;

                input {
                    width: 100%;
                    height: 100%;
                    padding: 0 0 0 40px;
                }
            }

            .input-container::after {
                position: absolute;
                top: 50%;
                left: 20px;
                transform: translate(-50%, -50%);
                content: '';
                width: 20px;
                height: 20px;
                background-size: cover;
            }

            #email-input-container::after {
                background-image: url(../assets/user-icon-grey.png);
            }

            #password-input-container::after {
                background-image: url(../assets/lock-icon-grey.png);
            }

            .password-appear-btn {
                position: absolute;

                display: flex;
                justify-content: center;
                align-items: center;

                top: 50%;
                right: 0;
                transform: translate(-50%, -50%);
                width: 26px;
                height: 20px;

                background-image: url(../assets/originals/eye-slash-icon-grey.png);
                background-size: cover;

                cursor: pointer;
            }

            .password-appear-btn:hover {
                transform: scale(1.05) translate(-50%, -50%);
            }
        }

        .buttons-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            gap: 20px;

            button {
                padding: 16px 16px;
                font-size: 1rem;
            }
        }
    }
}

@media screen and (max-width: 600px) {
    main {
        background-color: #F2E3CE;

        .card {
            gap: 20px;
            padding: 20px;
            margin: 40px;

            background-color: rgb(249, 242, 239);
            border-radius: 2px;

            .inputs-container {
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;

                gap: 5px;
                width: 100%;

                .input-container {
                    position: relative;
                    width: 100%;
                    height: 2rem;
                    border-radius: 2px;

                    input {
                        width: 100%;
                        height: 100%;
                        padding: 0 0 0 20px;
                    }
                }

                .input-container::after {
                    top: 50%;
                    left: 10px;
                    width: 14px;
                    height: 14px;
                }

                .password-appear-btn {
                    width: 20px;
                    height: 16px;
                }
            }

            .buttons-container {
                flex-direction: column;
                gap: 10px;

                button {
                    padding: 10px 20px;
                    font-size: 0.9rem;
                }
            }
        }
    }


}
</style>