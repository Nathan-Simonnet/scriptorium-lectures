<template>
  <HeaderComponent />
  <RouterView />
  <FooterComponent />
</template>
<!-- ---------------------------- -->
<script setup lang='ts'>

// Header
// ===================================================
import HeaderComponent from './components/HeaderComponent.vue';
// Footer
// ===================================================
import FooterComponent from './components/FooterComponent.vue';
</script>
<!-- ---------------------------- -->
<style></style>