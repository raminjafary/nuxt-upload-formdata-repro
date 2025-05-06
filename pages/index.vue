<template>
  <div class="container">
    <h1>File Upload</h1>
    <FileUpload 
      accept="image/*,.pdf,.doc,.docx"
      :maxSize="5 * 1024 * 1024"
    />
  </div>
</template>

<script setup lang="ts">
// No additional setup needed
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}
</style> 