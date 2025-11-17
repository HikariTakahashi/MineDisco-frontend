<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-4xl font-bold">Peach Tech</h1>
    <p class="text-2xl">2-304-{{ productNumber }}</p>
    <div class="flex flex-col items-center justify-center py-4">
      <button
        :disabled="isLoading"
        class="bg-linear-to-r from-rose-400 hover:from-rose-600 from-0% via-pink-500 hover:via-pink-600 via-50% to-fuchsia-400 hover:to-fuchsia-600 to-100% py-4 px-4 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        @click="handleClick"
      >
        <p v-if="!isLoading" class="text-white font-bold">
          説明がご入用の方はこちら
        </p>
        <div
          v-else
          class="flex flex-row items-center justify-center gap-2 text-white font-bold"
        >
          <span
            class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
          <span>送信中...</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const productNumber = ref(null);
const isLoading = ref(false);

const handleClick = async () => {
  if (productNumber.value == null) {
    console.error("productNumber is null. JSON request will not be sent.");
    return;
  }

  if (!config.public.cloudflareTunnelUrl) {
    console.error("Cloudflare Tunnel URL is not configured.");
    alert(
      "Cloudflare Tunnel URLが設定されていません。環境変数を確認してください。"
    );
    return;
  }

  try {
    isLoading.value = true;

    const response = await fetch(config.public.cloudflareTunnelUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productNumber: productNumber.value,
      }),
    });

    if (!response.ok) {
      console.error(
        "Failed to send JSON:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error while sending JSON:", error);
  } finally {
    isLoading.value = false;
    router.push(`/please-wait?productNumber=${productNumber.value}`);
  }
};

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
