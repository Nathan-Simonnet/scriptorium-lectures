<template>
  <span class="back-arrow">
    <RouterLink to="/"><i class="fa-solid fa-arrow-left"></i></RouterLink> Retour
  </span>
</template>
<!-- ---------------------------- -->
<script setup lang='ts'>

</script>
<!-- ---------------------------- -->
<style scoped>
.back-arrow {
  text-align: left;
  width: 100%;
  padding: 40px 0;
  color: #796157;
  font-family: "DM Sans", sans-serif;
  text-decoration: none;

  a {
    position: relative;
  }

  a ::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 80px;
    height: 20px;
    content: '';
    background: transparent;
  }
}

 @media screen and (max-width: 600px) {
  .back-arrow {
  padding: 20px 0;

  a {
    position: relative;
  }

  a ::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 80px;
    height: 20px;
    content: '';
    background: transparent;
  }
}
}
</style>