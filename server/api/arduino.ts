export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const arduinoUrl = config.arduinoUrl;

  if (!arduinoUrl) {
    throw createError({
      statusCode: 500,
      message: "Arduino URLが設定されていません",
    });
  }

  // POSTリクエストのみ許可
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      message: "Method Not Allowed",
    });
  }

  try {
    // リクエストボディを取得
    const body = await readBody(event);

    // Arduinoにリクエストを転送
    const response = await fetch(arduinoUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // レスポンスを取得
    const responseData = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(responseData);
    } catch {
      jsonData = { status: responseData };
    }

    // ステータスコードとレスポンスを返す
    setResponseStatus(event, response.status);
    return jsonData;
  } catch (error) {
    console.error("Arduino proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw createError({
      statusCode: 500,
      message: `Arduinoへのリクエストに失敗しました: ${errorMessage}`,
    });
  }
});
