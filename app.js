const loginForm = document.getElementById("loginForm");
const loginView = document.getElementById("loginView");
const galleryView = document.getElementById("galleryView");
const gallery = document.getElementById("gallery");
const loginMessage = document.getElementById("loginMessage");

const API_URL = "/api/login";

function showGallery() {
  loginView.style.display = "none";
  galleryView.style.display = "block";
}

function showLogin() {
  loginView.style.display = "block";
  galleryView.style.display = "none";
}

async function loadGallery() {
  try {
    const response = await fetch("./assets/manifest.json");
    if (!response.ok) {
      gallery.innerHTML = "<div class='loading'>未发现图片清单，请先执行重命名脚本</div>";
      return;
    }

    const items = await response.json();

    if (!Array.isArray(items) || items.length === 0) {
      gallery.innerHTML = "<div class='loading'>没有图片</div>";
      return;
    }

    gallery.innerHTML = items.map(item => `
      <article class="card">
        <img src="${item.thumbnail}" alt="${item.displayName}" />
        <div class="meta">
          <h3>${item.displayName}</h3>
          <a href="${item.fileUrl}" download="${item.downloadName}">
            下载原图
          </a>
        </div>
      </article>
    `).join("");
  } catch (error) {
    console.error(error);
    gallery.innerHTML = "<div class='loading'>加载失败</div>";
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  loginMessage.textContent = "";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      loginMessage.textContent = result.message || "登录失败";
      return;
    }

    showGallery();
    await loadGallery();
  } catch (error) {
    loginMessage.textContent = "连接失败，请检查 Worker 是否运行";
    console.error(error);
  }
});