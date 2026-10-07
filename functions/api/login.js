export async function onRequestPost({ request, env }) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({
        ok: false,
        message: "用户名和密码不能为空"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const dangerous = /(--|;|\/\*|\bOR\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bDELETE\b|\bUPDATE\b|\bINSERT\b|\bALTER\b|\bEXEC\b)/i;
    if (dangerous.test(username) || dangerous.test(password)) {
      return new Response(JSON.stringify({
        ok: false,
        message: "检测到可疑 SQL 注入字符"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const inputHash = await sha256(password);

    const row = await env["picsdisplay-db"]
      .prepare("SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1")
      .bind(username)
      .first();

    if (!row) {
      return new Response(JSON.stringify({
        ok: false,
        message: "用户名或密码错误"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (row.password_hash !== inputHash) {
      return new Response(JSON.stringify({
        ok: false,
        message: "用户名或密码错误"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      message: "登录成功",
      user: { id: row.id, username: row.username }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      message: "服务器错误"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}