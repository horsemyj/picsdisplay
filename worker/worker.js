export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return json(405, { ok: false, message: "仅允许 POST 请求" });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json(400, { ok: false, message: "请求体必须为 JSON" });
    }

    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return json(400, { ok: false, message: "用户名和密码不能为空" });
    }

    const dangerousPattern =
      /(--|;|\/\*|\bOR\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bDELETE\b|\bUPDATE\b|\bINSERT\b|\bALTER\b|\bEXEC\b)/i;

    if (dangerousPattern.test(username) || dangerousPattern.test(password)) {
      return json(400, {
        ok: false,
        message: "检测到可疑 SQL 注入字符，已拒绝请求"
      });
    }

    const passwordHash = await sha256(password);

    const row = await env.DB.prepare(
      "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1"
    )
      .bind(username)
      .first();

    if (!row) {
      return json(401, { ok: false, message: "用户名或密码错误" });
    }

    if (row.password_hash !== passwordHash) {
      return json(401, { ok: false, message: "用户名或密码错误" });
    }

    return json(200, {
      ok: true,
      message: "登录成功",
      user: {
        id: row.id,
        username: row.username
      }
    });
  }
};

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}