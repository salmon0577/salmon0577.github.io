// --- 1. My Gear 彈窗邏輯 ---
const modal = document.getElementById("gear-modal");
const btn = document.getElementById("gear-btn");
const span = document.getElementsByClassName("close-btn")[0];

// 點擊按鈕打開
btn.onclick = function() {
    modal.style.display = "flex";
}
// 點擊 X 關閉
span.onclick = function() {
    modal.style.display = "none";
}
// 點擊視窗外區域關閉
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// --- 2. 深色模式邏輯 ---
const themeBtn = document.getElementById("theme-btn");
const body = document.body;

// 檢查使用者之前的偏好
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    themeBtn.textContent = "☀️";
}

themeBtn.onclick = function() {
    body.classList.toggle("dark-mode");
    
    // 切換圖示並儲存設定
    if (body.classList.contains("dark-mode")) {
        themeBtn.textContent = "☀️";
        localStorage.setItem("theme", "dark");
    } else {
        themeBtn.textContent = "🌙";
        localStorage.setItem("theme", "light");
    }
}

// --- 3. 語言切換邏輯 ---
const langBtn = document.getElementById("lang-btn");
const langSpan = langBtn.querySelector("span");
let currentLang = "zh"; // 預設中文

// 語言包
const translations = {
    zh: {
        bio: "楽しんで生きる。自由に生きるために生まれた。",
        blog_main: "最新文章 (Blogger)",
        blog_main_desc: "我的日常更新與分享",
        blog_old: "備用 blog (WordPress)",
        blog_old_desc: "舊文章存檔與其他文章",
        github: "GitHub / 關於我",
        github_desc: "關於我 & 聯絡方式",
        gear_title: "我的裝備",
        lang_name: "中文"
    },
    jp: {
        bio: "楽しんで生きる。自由に生きるために生まれた。",
        blog_main: "最新記事 (Blogger)",
        blog_main_desc: "日常の更新とシェア",
        blog_old: "予備ブログ (WordPress)",
        blog_old_desc: "過去の記事アーカイブ",
        github: "GitHub / 私について",
        github_desc: "自己紹介 & 連絡先",
        gear_title: "使用機材",
        lang_name: "日本語"
    },
    en: {
        bio: "Enjoy life. Born to be free.",
        blog_main: "Latest Posts (Blogger)",
        blog_main_desc: "Daily updates and sharing",
        blog_old: "Backup Blog (WordPress)",
        blog_old_desc: "Old archives",
        github: "GitHub / About Me",
        github_desc: "About me & Contact",
        gear_title: "My Gear",
        lang_name: "English"
    }
};

langBtn.onclick = function() {
    // 循環切換語言：中 -> 日 -> 英 -> 中
    if (currentLang === "zh") {
        currentLang = "jp";
    } else if (currentLang === "jp") {
        currentLang = "en";
    } else {
        currentLang = "zh";
    }

    updateLanguage(currentLang);
};

function updateLanguage(lang) {
    const data = translations[lang];
    
    // 更新按鈕文字
    langSpan.textContent = data.lang_name;

    // 抓取所有有 data-tag 的元素並更新內容
    document.querySelectorAll('[data-tag]').forEach(el => {
        const tag = el.getAttribute('data-tag');
        if (data[tag]) {
            el.textContent = data[tag];
        }
    });
}

// -- 4. 12.28 新增功能：anime list --

// 1. 基本設定
const ANILIST_USERNAME = 'salmon0577'; //

// 2. 定義 Query (這就是你漏掉的天線！)
const query = `
query ($username: String) {
  MediaListCollection(userName: $username, type: ANIME, status: CURRENT) {
    lists {
      entries {
        media {
          title {
            native
            romaji
          }
          coverImage {
            large
          }
          siteUrl
        }
        progress
      }
    }
  }
}
`;

// 3. 狀態對話設定 (妖夢風格)
const messages = {
  idle: ["半人半靈的庭師，魂魄妖夢，參上！", "你要看我的追番表嗎？", "今天的修行也完成了！", "斬不斷的東西...幾乎不存在！"],
  open: ["嘿嘿，這就是我最近在看的！", "有沒有跟你重複的番？", "這些都超好看的喔！"],
  close: ["縮回去休息囉～", "晚點再來找我玩！"]
};

const bubble = document.getElementById('moe-bubble');
const panel = document.getElementById('anime-list-panel');

// 隨機更換對話函式
function updateBubble(type) {
  const list = messages[type];
  const text = list[Math.floor(Math.random() * list.length)];
  if(bubble) bubble.innerText = text;
}

// 4. 切換面板邏輯
function toggleAnimeList() {
  
  const isHidden = panel.classList.toggle('hidden');
    updateBubble(isHidden ? 'close' : 'open');
        if (isHidden) {
      setTimeout(() => updateBubble('idle'), 3000);
    } else {
    // 每次打開時重新抓取一次資料，保持最新狀態
    fetchAniList();
  }
}

// 5. 抓取 AniList 資料的函式
function fetchAniList() {
  fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: { username: ANILIST_USERNAME }
    })
  })
  .then(res => res.json())
  .then(data => {
    const entries = data.data.MediaListCollection.lists[0]?.entries || [];
    const contentArea = document.getElementById('anime-api-content');
    
    if (entries.length === 0) {
      contentArea.innerHTML = '<p style="font-size:12px;">目前清單是空的喔～</p>';
      return;
    }

    // 渲染清單
    contentArea.innerHTML = entries.map(entry => `
      <div class="anime-entry" style="display: flex; align-items: center; margin-bottom: 10px;">
        <a href="${entry.media.siteUrl}" target="_blank" style="text-decoration: none; display: flex; align-items: center; color: inherit;">
          <img src="${entry.media.coverImage.large}" style="width: 40px; height: 55px; border-radius: 4px; margin-right: 10px; object-fit: cover;">
          <div style="overflow: hidden;">
            <div class="anime-title" style="font-size: 12px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 160px;">
              ${entry.media.title.native}
            </div>
            <div style="font-size: 10px; color: #ff66b2;">看到第 ${entry.progress} 集</div>
          </div>
        </a>
      </div>
    `).join('');
  })
  .catch(err => {
    console.error('AniList 抓取失敗:', err);
    document.getElementById('anime-api-content').innerHTML = '<p>資料讀取失敗...</p>';
  });
}

// 6. 初始化
document.addEventListener('DOMContentLoaded', () => {
  fetchAniList(); // 頁面載入先抓一次
  setInterval(() => {
    if (panel.classList.contains('hidden')) updateBubble('idle');
  }, 10000);
});

// 初始化：如果是預設日文，可以這裡先呼叫 updateLanguage('jp');
// 根據你的原始碼，預設是日文標題配中文描述，建議這裡統一初始化：
updateLanguage('zh');
