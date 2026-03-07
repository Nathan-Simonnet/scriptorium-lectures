<template>
   <div class="loaderComponent" :class="isLoading ? '' : 'hidden'"></div>
</template>
<!-- ---------------------------- -->
<script setup lang="ts">
defineProps<{
  isLoading: boolean
}>()
</script>
<!-- ---------------------------- -->
<style scoped>

.loaderComponent.hidden {
    display: none;
}

.loaderComponent {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
    border: 6px solid #d6d6d6;
    border-top-color: #796157;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>