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

// --- 2.深色模式邏輯 ---
const themeBtn = document.getElementById("theme-btn");
const body = document.body;

// 檢查user之前的偏好
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
        blog_old: "予備のブログ (WordPress)",
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
    // 切換語言：中 -> 日 -> 英 -> 中
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

// 初始化
updateLanguage('zh');