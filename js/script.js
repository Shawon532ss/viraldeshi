let currentData = [...sampleData];
let currentPost = null;
let itemsPerLoad = 10;
let currentIndex = 0;
let loading = false;

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  loadContent();
  initializeTheme();
  setupSearch();
});

// Load content into grid
function loadContent(data = currentData) {
  const grid = document.getElementById("content-grid");

  if (currentIndex === 0) {
    grid.innerHTML = "";
  }

  const nextItems = data.slice(currentIndex, currentIndex + itemsPerLoad);

  nextItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "content-card";
    card.setAttribute("onclick", `showPost(${item.id})`);
    card.innerHTML = `
      <div style="position: relative;">
        <img src="${item.thumbnail}" alt="${item.title}" class="card-thumbnail"
             onerror="this.src='https://via.placeholder.com/300x200/006A4E/FFFFFF?text=Viral+Deshi'">
        <div class="card-badge">${item.category.toUpperCase()}</div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-description">${item.description}</p>
        <div class="card-meta">
          <span><i class="fas fa-calendar"></i> ${formatDate(item.date)}</span>
          <div class="card-stats">
            <div class="stat-item">
              <i class="fas fa-eye"></i>
              <span>${item.views}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-heart"></i>
              <span>${item.likes}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  currentIndex += itemsPerLoad;
  loading = false;

  if (currentIndex >= data.length) {
    document.getElementById("loading-message").innerText =
      "No more content to load.";
  } else {
    document.getElementById("loading-message").innerText = "";
  }
}

// Infinite scroll
window.addEventListener("scroll", function () {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
    !loading &&
    currentIndex < currentData.length
  ) {
    loading = true;
    document.getElementById("loading-spinner").style.display = "block";

    setTimeout(() => {
      loadContent();
      document.getElementById("loading-spinner").style.display = "none";
    }, 500);
  }
});

// Add spinner and message container
const spinner = document.createElement("div");
spinner.id = "loading-spinner";
spinner.className = "spinner";
spinner.style = "display: none; margin: 20px auto;";
document.getElementById("content-grid").after(spinner);

const message = document.createElement("p");
message.id = "loading-message";
message.style =
  "text-align: center; color: #888; margin-top: 10px; font-weight: 500;";
document.getElementById("loading-spinner").after(message);

// Show individual post
function showPost(id) {
  const post = sampleData.find((p) => p.id === id);
  if (!post) return;

  currentPost = post;

  // Update post content
  document.getElementById("post-title").textContent = post.title;
  document.getElementById("post-date").textContent = formatDate(post.date);
  document.getElementById("post-views").textContent = post.views;
  document.getElementById("post-likes").textContent = post.likes;
  document.getElementById("post-content").innerHTML = post.content;

  // Handle media based on type
  /*const mediaContainer = document.getElementById("post-media");
  if (post.type === "video") {
    mediaContainer.innerHTML = `
                    <div class="video-container">
                        <iframe src="${post.videoUrl}" frameborder="0" allowfullscreen></iframe>
                    </div>
                `;
  } else if (post.type === "image") {
    mediaContainer.innerHTML = `
                    <img src="${post.imageUrl}" alt="${post.title}" style="width: 100%; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                `;
  } else {
    mediaContainer.innerHTML = "";
  }*/

  const mediaContainer = document.getElementById("post-media");

  if (post.imageUrl) {
    mediaContainer.innerHTML = `
    <a href="${post.linkUrl}" style="display: block; width: 100%; max-width: 400px; margin: 0 auto; text-decoration: none;">
    <div style="position: relative; aspect-ratio: 3 / 4; overflow: hidden; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
      <img src="${post.imageUrl}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
    </div>
  </a>

  <!-- Buttons below image -->
  <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
    <a href="${post.playUrl}" style="padding: 10px 20px; background-color: #ff4757; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">
      ▶️ Play Video
    </a>
    <a href="${post.downloadUrl}" style="padding: 10px 20px; background-color: #1e90ff; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">
      ⬇️ Download
    </a>
  </div>
  `;
  } else {
    mediaContainer.innerHTML = "";
  }

  // Show post page
  document.getElementById("home-page").style.display = "none";
  document.getElementById("post-page").style.display = "block";

  // Update URL without page reload
  window.history.pushState({ page: "post", id: id }, post.title, `#post-${id}`);

  // Update page title and meta
  document.title = `${post.title} - Viral Deshi`;
  updateMetaTags(post);

  // Scroll to top
  window.scrollTo(0, 0);
}

// Show home page
function showHome() {
  document.getElementById("home-page").style.display = "block";
  document.getElementById("post-page").style.display = "none";

  window.history.pushState({ page: "home" }, "Viral Deshi", "/");
  document.title = "Viral Deshi - Latest Bangladeshi Viral Content";

  window.scrollTo(0, 0);
}

// Filter content by category
function filterCategory(category) {
  // Update active tab
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Filter data
  if (category === "all") {
    currentData = [...sampleData];
  } else {
    currentData = sampleData.filter((item) => item.category === category);
  }

  loadContent(currentData);
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchContent();
    }
  });
}

function searchContent() {
  const query = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  if (!query) {
    currentData = [...sampleData];
  } else {
    currentData = sampleData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
    );
  }

  loadContent(currentData);
}

// Theme toggle
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById("theme-icon");

  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    themeIcon.className = "fas fa-sun";
    localStorage.setItem("theme", "dark");
  } else {
    themeIcon.className = "fas fa-moon";
    localStorage.setItem("theme", "light");
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");
  const body = document.body;
  const themeIcon = document.getElementById("theme-icon");

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    themeIcon.className = "fas fa-sun";
  }
}

// Social sharing
function sharePost(platform) {
  if (!currentPost) return;

  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(currentPost.title);
  const description = encodeURIComponent(currentPost.description);

  let shareUrl = "";

  switch (platform) {
    case "facebook":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
      break;
    case "whatsapp":
      shareUrl = `https://wa.me/?text=${title}%20${url}`;
      break;
    case "telegram":
      shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
      break;
  }

  if (shareUrl) {
    window.open(shareUrl, "_blank", "width=600,height=400");
  }
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function updateMetaTags(post) {
  // Update Open Graph tags
  document
    .querySelector('meta[property="og:title"]')
    .setAttribute("content", post.title);
  document
    .querySelector('meta[property="og:description"]')
    .setAttribute("content", post.description);
  document
    .querySelector('meta[property="og:image"]')
    .setAttribute("content", post.thumbnail);

  // Update Twitter Card tags
  document
    .querySelector('meta[name="twitter:title"]')
    .setAttribute("content", post.title);
  document
    .querySelector('meta[name="twitter:description"]')
    .setAttribute("content", post.description);
  document
    .querySelector('meta[name="twitter:image"]')
    .setAttribute("content", post.thumbnail);
}

// Handle browser back/forward
window.addEventListener("popstate", function (event) {
  if (event.state) {
    if (event.state.page === "home") {
      showHome();
    } else if (event.state.page === "post") {
      showPost(event.state.id);
    }
  } else {
    showHome();
  }
});

// Handle initial URL
window.addEventListener("load", function () {
  const hash = window.location.hash;
  if (hash.startsWith("#post-")) {
    const id = parseInt(hash.replace("#post-", ""));
    showPost(id);
  }
});

// Lazy loading for images
document.addEventListener("DOMContentLoaded", function () {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
});

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Performance optimization - defer non-critical CSS
function loadNonCriticalCSS() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

// Load non-critical resources after page load
window.addEventListener("load", loadNonCriticalCSS);
