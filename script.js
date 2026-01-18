// --- 1. My Gear 彈窗邏輯 ---
const gearModal = document.getElementById("gear-modal");
const gearBtn = document.getElementById("gear-btn");

// 點擊按鈕打開 Gear
if (gearBtn) {
    gearBtn.onclick = function() {
        gearModal.style.display = "flex";
    }
}

/**
 */
function closeGearModal() {
    if (gearModal) gearModal.style.display = "none";
}

// --- 2. 深色模式邏輯 ---
const themeBtn = document.getElementById("theme-btn");
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    if (themeBtn) themeBtn.textContent = "☀️";
}

if (themeBtn) {
    themeBtn.onclick = function() {
        body.classList.toggle("dark-mode");
        if (body.classList.contains("dark-mode")) {
            themeBtn.textContent = "☀️";
            localStorage.setItem("theme", "dark");
        } else {
            themeBtn.textContent = "🌙";
            localStorage.setItem("theme", "light");
        }
    }
}

// --- 3. 語言切換邏輯 ---
const langBtn = document.getElementById("lang-btn");
let currentLang = "zh";

const translations = {
    zh: { bio: "楽しんで生きる。自由に生きるために生まれた。", blog_main: "最新文章 (Blogger)", blog_main_desc: "我的日常更新與分享", blog_old: "備用 blog (WordPress)", blog_old_desc: "舊文章存檔與其他文章", github: "GitHub / 關於我", github_desc: "關於我 & 聯絡方式", gear_title: "我的裝備", lang_name: "中文" },
    jp: { bio: "楽しんで生きる。自由に生きるために生まれた。", blog_main: "最新記事 (Blogger)", blog_main_desc: "日常の更新とシェア", blog_old: "予備ブログ (WordPress)", blog_old_desc: "過去の記事アーカイブ", github: "GitHub / 私について", github_desc: "自己紹介 & 連絡先", gear_title: "使用機材", lang_name: "日本語" },
    en: { bio: "Enjoy life. Born to be free.", blog_main: "Latest Posts (Blogger)", blog_main_desc: "Daily updates and sharing", blog_old: "Backup Blog (WordPress)", blog_old_desc: "Old archives", github: "GitHub / About Me", github_desc: "About me & Contact", gear_title: "My Gear", lang_name: "English" }
};

if (langBtn) {
    langBtn.onclick = function() {
        if (currentLang === "zh") currentLang = "jp";
        else if (currentLang === "jp") currentLang = "en";
        else currentLang = "zh";
        updateLanguage(currentLang);
    };
}

function updateLanguage(lang) {
    const data = translations[lang];
    const langSpan = langBtn.querySelector("span");
    if (langSpan) langSpan.textContent = data.lang_name;
    document.querySelectorAll('[data-tag]').forEach(el => {
        const tag = el.getAttribute('data-tag');
        if (data[tag]) el.textContent = data[tag];
    });
}

// --- 4. Anime List & 看板娘邏輯 ---
const ANILIST_USERNAME = 'salmon0577';
const query = `
query ($username: String) {
  anime: MediaListCollection(userName: $username, type: ANIME, status: CURRENT) {
    lists {
      entries {
        media {
          title { native romaji }
          coverImage { large }
          siteUrl
        }
        progress
      }
    }
  }
  manga: MediaListCollection(userName: $username, type: MANGA, status: CURRENT) {
    lists {
      entries {
        media {
          title { native romaji }
          coverImage { large }
          siteUrl
        }
        progress
        progressVolumes
      }
    }
  }
}
`;

const messages = {
    idle: ["半人半靈的庭師，魂魄妖夢，參上！", "你要看我的追番表嗎？", "今天的修行也完成了！", "斬不斷的東西...幾乎不存在！"],
    open: ["嘿嘿，這就是我最近在看的！", "有沒有跟你重複的番？", "這些都超好看的喔！"],
    close: ["縮回去休息囉～", "晚點再來找我玩！"]
};

const bubble = document.getElementById('moe-bubble');
const panel = document.getElementById('anime-list-panel');

function updateBubble(type) {
    if (!bubble) return;
    const list = messages[type];
    bubble.innerText = list[Math.floor(Math.random() * list.length)];
}

function toggleAnimeList() {
    if (!panel) return;
    const isHidden = panel.classList.toggle('hidden');
    updateBubble(isHidden ? 'close' : 'open');
    if (isHidden) setTimeout(() => updateBubble('idle'), 3000);
    else fetchAniList();
}

function renderList(title, entries, color, isManga = false) {
    if (!entries || entries.length === 0) return '';

    const listHTML = entries.map(entry => {
        
        let progressText = `看到第 ${entry.progress || 0} 集`;
        
        // 如果是漫畫 (isManga 為 true)，優先顯示卷數
        if (isManga) {
            if (entry.progressVolumes > 0) {
                progressText = `看到第 ${entry.progressVolumes} 卷`;
                // 同時顯示話數
                if (entry.progress > 0) progressText += ` (${entry.progress} 話)`;
            } else {
                progressText = `看到第 ${entry.progress || 0} 話`;
            }
        }
        // -----------------------

        return `
        <div class="anime-entry" style="display: flex; align-items: center; margin-bottom: 10px;">
            <a href="${entry.media.siteUrl}" target="_blank" style="text-decoration: none; display: flex; align-items: center; color: inherit; width: 100%;">
                <img src="${entry.media.coverImage.large}" style="width: 40px; height: 55px; border-radius: 4px; margin-right: 10px; object-fit: cover;">
                <div style="overflow: hidden; flex: 1;">
                    <div style="font-size: 12px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${entry.media.title.native}</div>
                    <div style="font-size: 10px; color: ${color};">${progressText}</div>
                </div>
            </a>
        </div>
        `;
    }).join('');

    return `
        <div style="margin-top: 15px; margin-bottom: 5px; font-size: 12px; color: #888; border-bottom: 1px solid #eee; padding-bottom: 2px;">${title}</div>
        <div>${listHTML}</div>
    `;
}

function fetchAniList() {
    const contentArea = document.getElementById('anime-api-content');
    if (!contentArea) return;

    // 顯示載入中
    contentArea.innerHTML = '<p style="font-size:12px; color:#999; text-align:center;">載入清單中...</p>';

    fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query: query, variables: { username: ANILIST_USERNAME } })
    })
    .then(res => res.json())
    .then(data => {
        // 分別抓取動畫和漫畫的資料
        const animeEntries = data.data.anime.lists[0]?.entries || [];
        const mangaEntries = data.data.manga.lists[0]?.entries || [];

        if (animeEntries.length === 0 && mangaEntries.length === 0) {
            contentArea.innerHTML = '<p style="font-size:12px;">目前清單是空的喔～</p>';
            return;
        }

        let finalHTML = '';
        
        finalHTML += renderList('📺 動畫 (Anime)', animeEntries, '#ff66b2', false); 
        
        finalHTML += renderList('📖 漫畫 (Manga)', mangaEntries, '#4dabf7', true);

        contentArea.innerHTML = finalHTML;
    })
    .catch(err => {
        console.error('AniList 抓取失敗:', err);
    });
}

// --- 5. 全域點擊監聽 (點擊外部關閉) ---
window.onclick = function(event) {
    // 點擊 Gear Modal 背景關閉
    if (event.target == gearModal) {
        closeGearModal();
    }
    // 點擊看板娘區域以外關閉
    const mascotContainer = document.getElementById('moe-mascot-container');
    if (panel && !panel.classList.contains('hidden') && mascotContainer && !mascotContainer.contains(event.target)) {
        toggleAnimeList();
    }
}

// --- 6. 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAniList();
    setInterval(() => {
        if (panel && panel.classList.contains('hidden')) updateBubble('idle');
    }, 10000);
    updateLanguage('zh');
});

