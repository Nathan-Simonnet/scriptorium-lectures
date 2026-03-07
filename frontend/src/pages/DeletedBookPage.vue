<template>
    <main>
        <BackArrowLayout></BackArrowLayout>
        <div class="card">
            <h1>Livre supprimé !</h1>
            <img src="/src/assets/delete-book-2.jpg" alt="trash can image" width="320px">
        </div>
    </main>
</template>
<!-- ---------------------------- -->
<script setup lang='ts'>
import BackArrowLayout from "../components/BackArrowLayout.vue";
</script>
<!-- ---------------------------- -->
<style scoped>
main {
    background: #F2E3CE;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    
    padding:0 20px;
    .card {
       display:flex;
       flex-direction:column;
       justify-content:center;
       align-items:center;
       
        gap: 20px;
        padding: 20px;
        margin: 4%;
    }
}
</style>