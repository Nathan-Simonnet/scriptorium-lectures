<template>
    <header>
        <div class="logo-container">
            <RouterLink to="/">
                <img src="../assets/scriptorium-lectures-logo.png" alt="Scriptorium lectures logo"
                    aria-label="Click to go to the home page">
            </RouterLink>
        </div>
        <nav>
            <ul>
                <RouterLink to="/">
                    <li :class="{ bold: currentPage === 'home' }">Accueil</li>
                </RouterLink>
                <RouterLink  :to="userConnected ? `/upload` : '/authentification'" >
                    <li :class="{ bold: currentPage === 'upload' }">Ajouter un livre</li>
                </RouterLink>
                <RouterLink to="/authentification">
                    <li :class="{ bold: currentPage === 'authentification' }" id="connection-nav"><span
                            v-show="!userConnected">Se connecter</span>
                        <span v-show="userConnected" @click="disconnectUser">Se déconnecter</span>
                    </li>
                </RouterLink>
            </ul>
        </nav>
    </header>
</template>
<!-- ---------------------------- -->
<script setup lang='ts'>

// Stored values
import userSates from "../stored-datas/user-states.ts";
const storedUserStates = userSates();

// Watch for changes and redisplay it 
import { computed } from 'vue'
const userConnected = computed(() => {
    return storedUserStates.logUserStates();
});

import { useRoute } from 'vue-router';
const route = useRoute();

const currentPage = computed(() => {
    return route.path.substring(1) || 'home'
});

// Disconnect user
const disconnectUser = () => {
    storedUserStates.changeUserStates();
    storedUserStates.changeUserId(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
};

</script>
<!-- ---------------------------- -->
<style scoped>
header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
    height: 90px;

    font-size: 1rem;
    padding: 12px;
    gap: 12px;

    div.logo-container {
        width: 220px;
        cursor: pointer;

        a {
            display: flex;
            justify-content: center;
            align-items: center;

            img {
                display: flex;
                justify-content: center;
                align-items: center;

                object-fit: cover;

                width: 100%;
                height: 100%;
            }
        }
    }

    nav {
        ul {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 24px;

            li {
                cursor: pointer;
            }

            li.bold {
                font-weight: bold;
            }

            li:hover {
                text-shadow: 2px 2px 4px rgb(26, 16, 1);
            }
        }
    }
}

@media screen and (max-width: 600px) {
    header {
        flex-direction: column;
        margin-bottom: 20px;
    }
}

@media screen and (max-width: 400px) {
    header {
        font-size: 0.8rem;

        nav {
            ul {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 12px;
            }
        }

    }
}
</style>