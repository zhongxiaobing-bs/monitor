<template>
  <div>{{ brokenValue.message }}</div>
</template>

<script setup lang="ts">
const brokenValue = undefined as unknown as { message: string }
</script>
