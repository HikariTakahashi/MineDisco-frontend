<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-8">
    <h1 class="text-4xl font-bold mb-8">区画制御</h1>

    <div class="w-full max-w-2xl space-y-6">
      <!-- 2-203室のセレクト -->
      <div class="flex flex-col gap-2">
        <label class="text-xl font-semibold">2-203室</label>
        <select
          v-model="selectedRoom203"
          class="border-2 border-gray-300 rounded-lg px-4 py-2 text-lg"
        >
          <option :value="null">選択してください</option>
          <option v-for="i in 16" :key="i" :value="i">区画 {{ i }}</option>
        </select>
      </div>

      <!-- 2-204室のセレクト -->
      <div class="flex flex-col gap-2">
        <label class="text-xl font-semibold">2-204室</label>
        <select
          v-model="selectedRoom204"
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
          :disabled="isLoading || (!selectedRoom203 && !selectedRoom204)"
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
          :disabled="isLoading || (!selectedRoom203 && !selectedRoom204)"
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
const config = useRuntimeConfig();
const selectedRoom203 = ref(null);
const selectedRoom204 = ref(null);
const isLoading = ref(false);

const sendRequest = async (room, box, action) => {
  if (!config.public.cloudflareTunnelUrl) {
    console.error("Cloudflare Tunnel URL is not configured.");
    alert(
      "Cloudflare Tunnel URLが設定されていません。環境変数を確認してください。"
    );
    return;
  }

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

    const response = await fetch(config.public.cloudflareTunnelUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(
        "Failed to send JSON:",
        response.status,
        response.statusText
      );
      alert("リクエストの送信に失敗しました");
    } else {
      console.log("Request sent successfully");
    }
  } catch (error) {
    console.error("Error while sending JSON:", error);
    alert("エラーが発生しました: " + error.message);
  } finally {
    isLoading.value = false;
  }
};

const handleSet = async () => {
  if (selectedRoom203.value !== null) {
    await sendRequest("203", selectedRoom203.value, "set");
  }
  if (selectedRoom204.value !== null) {
    await sendRequest("204", selectedRoom204.value, "set");
  }
};

const handleClear = async () => {
  if (selectedRoom203.value !== null) {
    await sendRequest("203", selectedRoom203.value, "clear");
  }
  if (selectedRoom204.value !== null) {
    await sendRequest("204", selectedRoom204.value, "clear");
  }
};

const handleClearAll = async () => {
  if (confirm("すべての区画を解除しますか？")) {
    await sendRequest("203", null, "clear");
    await sendRequest("204", null, "clear");
  }
};
</script>
