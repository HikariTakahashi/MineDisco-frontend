<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-4xl font-bold">Peach Tech</h1>
    <p class="text-xl">コード：S2304-{{ productNumber }}</p>
    <div class="flex flex-col items-center justify-center py-4">
      <p class="text-2xl">⭐️スタッフをお呼びしました⭐️</p>
      <p class="text-2xl">しばらくお待ちください</p>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const productNumber = ref(null);

if (route.query.productNumber) {
  productNumber.value = parseInt(route.query.productNumber);
} else {
  const queryKeys = Object.keys(route.query);
  const numericKey = queryKeys.find((key) => /^\d+$/.test(key));

  if (numericKey) {
    productNumber.value = parseInt(numericKey);
  } else {
    const queryString = route.fullPath.split("?")[1];
    if (queryString) {
      const match = queryString.match(/^(\d+)/);
      if (match) {
        productNumber.value = parseInt(match[1]);
      }
    }
  }
}
</script>
