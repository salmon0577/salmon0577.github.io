function renderPosts(data) {

    const container =
        document.getElementById("blog-posts");

    container.innerHTML = "";

    data.feed.entry.forEach(post => {

        const title = post.title.$t;

        const link =
            post.link.find(
                l => l.rel === "alternate"
            ).href;

        const summary =
            post.summary?.$t || "";

        container.innerHTML += `

        <a href="${link}"
           target="_blank"
           class="card-link post-card">

            <span class="icon">📝</span>

            <div>

                <div class="text">
                    ${title}
                </div>

                <div class="sub-text">

                    ${summary
                        .replace(/<[^>]+>/g,'')
                        .slice(0,120)}

                </div>

            </div>

        </a>

        `;
    });
}

const script =
    document.createElement("script");

script.src =
    "https://blog.salmonn.co.uk/feeds/posts/default?alt=json-in-script&callback=renderPosts";

document.body.appendChild(script);
