<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-4xl font-bold">Peach Tech</h1>
    <p class="text-2xl">
      2-{{ room || "302" }}-{{ box || productNumber || "-" }}
    </p>
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
const productNumber = ref(null);
const room = ref(null);
const box = ref(null);
const isLoading = ref(false);

const handleClick = async () => {
  // 新しい形式（room + box）が利用可能な場合はそれを使用
  if (room.value && box.value != null) {
    try {
      isLoading.value = true;

      // サーバーサイドプロキシ経由でリクエストを送信
      const response = await $fetch("/api/arduino", {
        method: "POST",
        body: {
          room: room.value,
          box: box.value,
          action: "set",
        },
      });

      console.log("Request sent successfully:", response);
    } catch (error) {
      console.error("Error while sending JSON:", error);
      alert("リクエストの送信に失敗しました: " + error.message);
    } finally {
      isLoading.value = false;
      router.push(`/please-wait?productNumber=${box.value}`);
    }
  } else if (productNumber.value != null) {
    // 後方互換性: productNumber形式
    try {
      isLoading.value = true;

      // サーバーサイドプロキシ経由でリクエストを送信
      const response = await $fetch("/api/arduino", {
        method: "POST",
        body: {
          productNumber: productNumber.value,
        },
      });

      console.log("Request sent successfully:", response);
    } catch (error) {
      console.error("Error while sending JSON:", error);
      alert("リクエストの送信に失敗しました: " + error.message);
    } finally {
      isLoading.value = false;
      router.push(`/please-wait?productNumber=${productNumber.value}`);
    }
  } else {
    console.error(
      "room/box or productNumber is null. JSON request will not be sent."
    );
  }
};

// URLから部屋番号と区画番号を解析
// 形式1: ?3011 → 部屋301、区画1
// 形式2: ?3022 → 部屋302、区画2
// 形式3: ?productNumber=3 → 後方互換性（部屋302、区画3）

// まず、クエリ文字列全体を取得
const queryString = route.fullPath.split("?")[1] || "";

if (route.query.productNumber) {
  // 後方互換性: productNumber形式
  productNumber.value = parseInt(route.query.productNumber);
  room.value = "302"; // デフォルトは302室
  box.value = productNumber.value;
} else if (queryString) {
  // 形式: ?3011 または ?3022 を解析
  // クエリ文字列から4桁以上の数字を探す（3011, 3022など）
  const match = queryString.match(/^(\d{3})(\d+)/);

  if (match) {
    const roomStr = match[1];
    const boxStr = match[2];

    if (roomStr === "301" || roomStr === "302") {
      room.value = roomStr;
      box.value = parseInt(boxStr);
      productNumber.value = parseInt(boxStr); // 後方互換性のため
    } else {
      // 3桁未満の場合は従来の形式として扱う
      const singleMatch = queryString.match(/^(\d+)/);
      if (singleMatch) {
        productNumber.value = parseInt(singleMatch[1]);
        room.value = "302"; // デフォルトは302室
        box.value = productNumber.value;
      }
    }
  } else {
    // 単一の数字の場合（従来の形式）
    const singleMatch = queryString.match(/^(\d+)/);
    if (singleMatch) {
      productNumber.value = parseInt(singleMatch[1]);
      room.value = "302"; // デフォルトは302室
      box.value = productNumber.value;
    }
  }

  // クエリパラメータのキーからも解析を試みる（?3011= のような形式）
  const queryKeys = Object.keys(route.query);
  const numericKey = queryKeys.find((key) => /^\d{4,}$/.test(key));

  if (numericKey && !room.value) {
    // 4桁以上の数字キーが見つかった場合
    const roomStr = numericKey.substring(0, 3);
    const boxStr = numericKey.substring(3);

    if (roomStr === "301" || roomStr === "302") {
      room.value = roomStr;
      box.value = parseInt(boxStr);
      productNumber.value = parseInt(boxStr);
    }
  }
}
</script>
