<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-8">
    <h1 class="text-4xl font-bold mb-8">区画制御</h1>

    <div class="w-full max-w-2xl space-y-6">
      <!-- 2-302室のセレクト -->
      <div class="flex flex-col gap-2">
        <label class="text-xl font-semibold">2-302室</label>
        <select
          v-model="selectedRoom302"
          class="border-2 border-gray-300 rounded-lg px-4 py-2 text-lg"
        >
          <option :value="null">選択してください</option>
          <option v-for="i in 16" :key="i" :value="i">区画 {{ i }}</option>
        </select>
      </div>

      <!-- 2-301室のセレクト -->
      <div class="flex flex-col gap-2">
        <label class="text-xl font-semibold">2-301室</label>
        <select
          v-model="selectedRoom301"
          class="border-2 border-gray-300 rounded-lg px-4 py-2 text-lg"
        >
          <option :value="null">選択してください</option>
          <option v-for="i in 16" :key="i" :value="i">区画 {{ i }}</option>
        </select>
      </div>

      <!-- ボタン群 -->
      <div class="flex flex-col gap-4 mt-6">
        <!-- 設定ボタン -->
        <button
          :disabled="isLoading || (!selectedRoom302 && !selectedRoom301)"
          class="bg-linear-to-r from-rose-400 hover:from-rose-600 from-0% via-pink-500 hover:via-pink-600 via-50% to-fuchsia-400 hover:to-fuchsia-600 to-100% py-4 px-6 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg"
          @click="handleSet"
        >
          <div
            v-if="!isLoading"
            class="flex flex-row items-center justify-center gap-2"
          >
            <span>設定</span>
          </div>
          <div v-else class="flex flex-row items-center justify-center gap-2">
            <span
              class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
            <span>送信中...</span>
          </div>
        </button>

        <!-- 解除ボタン -->
        <button
          :disabled="isLoading || (!selectedRoom302 && !selectedRoom301)"
          class="bg-linear-to-r from-gray-400 hover:from-gray-600 to-gray-500 hover:to-gray-700 py-4 px-6 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg"
          @click="handleClear"
        >
          <div
            v-if="!isLoading"
            class="flex flex-row items-center justify-center gap-2"
          >
            <span>解除</span>
          </div>
          <div v-else class="flex flex-row items-center justify-center gap-2">
            <span
              class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
            <span>送信中...</span>
          </div>
        </button>

        <!-- 全解除ボタン -->
        <button
          :disabled="isLoading"
          class="bg-linear-to-r from-red-400 hover:from-red-600 to-red-500 hover:to-red-700 py-4 px-6 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg"
          @click="handleClearAll"
        >
          <div
            v-if="!isLoading"
            class="flex flex-row items-center justify-center gap-2"
          >
            <span>全解除</span>
          </div>
          <div v-else class="flex flex-row items-center justify-center gap-2">
            <span
              class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
            <span>送信中...</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const selectedRoom302 = ref(null);
const selectedRoom301 = ref(null);
const isLoading = ref(false);

const sendRequest = async (room, box, action) => {
  try {
    isLoading.value = true;

    const requestBody = {
      room: room,
      action: action,
    };

    // box が指定されている場合のみ追加
    if (box !== null) {
      requestBody.box = box;
    }

    // サーバーサイドプロキシ経由でリクエストを送信
    const response = await $fetch("/api/arduino", {
      method: "POST",
      body: requestBody,
    });

    console.log("Request sent successfully:", response);
  } catch (error) {
    console.error("Error while sending JSON:", error);
    alert("エラーが発生しました: " + error.message);
  } finally {
    isLoading.value = false;
  }
};

const handleSet = async () => {
  if (selectedRoom302.value !== null) {
    await sendRequest("302", selectedRoom302.value, "set");
  }
  if (selectedRoom301.value !== null) {
    await sendRequest("301", selectedRoom301.value, "set");
  }
};

const handleClear = async () => {
  if (selectedRoom302.value !== null) {
    await sendRequest("302", selectedRoom302.value, "clear");
  }
  if (selectedRoom301.value !== null) {
    await sendRequest("301", selectedRoom301.value, "clear");
  }
};

const handleClearAll = async () => {
  if (confirm("すべての区画を解除しますか？")) {
    await sendRequest("302", null, "clear");
    await sendRequest("301", null, "clear");
  }
};
</script>
