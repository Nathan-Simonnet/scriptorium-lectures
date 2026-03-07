<template>
    <div v-if="message" class="message-display" @click="$emit('clear')">
        <span>{{ message }}</span>
    </div>
</template>


<script setup lang="ts">
defineProps<{
    message: string
}>()
</script>


<style scoped>
.message-display {
    position: fixed;
    bottom: 25%;

    display: flex;
    justify-content: center;
    align-items: center;

    height: 50%;
    width: 50%;

    font-family: Arial, Helvetica, sans-serif;
    background: #F2E3CE;
    border-radius: 20px;
    /* font-size: 16px; */

    span {
        font-size: clamp(16px, 3vw, 32px);
    }
}

.message-display::after {
    position: absolute;
    top: 5%;
    left: 5%;
    content: 'X';
    font-family: sans-serif, cursive;
    height: 6px;
    font-size: clamp(24px, 4vw, 48px);
    background: none;
    cursor: pointer;
}
</style>
