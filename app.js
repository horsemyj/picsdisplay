const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const result = await res.json();

  if (!res.ok || !result.ok) {
    alert(result.message || "登录失败");
    return;
  }

  alert("登录成功");
  window.location.href = "/gallery.html";
});