const SERVER_URL = "http://localhost:8081";

async function fetchPosts() {
    try {
        let response = await fetch(`${SERVER_URL}/blog`);
        let postsData = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error. status: ${response.status}`);
        }

        return postsData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

function formatDateTimeArray(dateTimeArray) {
    if (!dateTimeArray || dateTimeArray.length < 6) {
        return "Invalid Date";
    }

    const year = dateTimeArray[0];
    const month = dateTimeArray[1] - 1;
    const day = dateTimeArray[2];
    const hours = dateTimeArray[3];
    const minutes = dateTimeArray[4];
    const seconds = dateTimeArray[5];

    const postDate = new Date(year, month, day, hours, minutes, seconds);
    const now = new Date();

    const diffMs = now.getTime() - postDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24 && diffHours >= 0) {
        return postDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    if (postDate >= startOfWeek && postDate <= now) {
        return postDate.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
               postDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
    if (postDate.getFullYear() === now.getFullYear()) {
        return postDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    }

    return postDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPlainTextSnippet(markdownContent, maxLength = 120) {
    if (typeof marked === 'undefined') {
        console.warn("marked.js is not loaded. Cannot process Markdown for snippet.");
        return markdownContent.substring(0, maxLength) + (markdownContent.length > maxLength ? '...' : '');
    }
    const htmlContent = marked.parse(markdownContent);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    let plainText = tempDiv.textContent || tempDiv.innerText || '';
    plainText = plainText.replace(/\s+/g, ' ').trim();

    if (plainText.length > maxLength) {
        return plainText.substring(0, maxLength) + '...';
    }
    return plainText;
}

async function displayPosts() {
    let postsContainer = document.querySelector(".blog-posts");
    if (postsContainer) {
        postsContainer.innerHTML = "";

        try {
            let postsData = await fetchPosts();

            if (!postsData || postsData.length === 0) {
                postsContainer.innerHTML = "<p>No blog posts to display yet.</p>";
                return;
            }

            postsData.forEach(post => {
                let postDiv = document.createElement("div");
                postDiv.classList.add("blog-post");
                postDiv.addEventListener('click', () => {
                    window.location.href = `blog-post-detail.html?id=${post.id}`;
                });

                let postThumbnail = document.createElement("div");
                postThumbnail.classList.add("thumbnail-container");
                
                if (post.thumbnailUrl) {
                    let img = document.createElement("img");
                    img.src = SERVER_URL + post.thumbnailUrl;
                    img.alt = post.title + " thumbnail";
                    img.classList.add("post-thumbnail-img");
                    postThumbnail.appendChild(img);
                }

                let postMetadata = document.createElement("div");
                postMetadata.classList.add("metadata");

                let postTitleElement = document.createElement("h2");
                let postContentElement = document.createElement("p");
                let postCategoryElement = document.createElement("span");
                let datePostedElement = document.createElement("span");
                let lastUpdateElement = document.createElement("span");

                postTitleElement.classList.add("post-title");
                postContentElement.classList.add("post-content");
                postCategoryElement.classList.add("category");
                datePostedElement.classList.add("date-posted");
                lastUpdateElement.classList.add("last-updated");

                postTitleElement.textContent = post.title;
                postContentElement.textContent = getPlainTextSnippet(post.content, 120);
                postCategoryElement.textContent = post.category;

                datePostedElement.textContent = "Posted: " + formatDateTimeArray(post.datePosted);
                lastUpdateElement.textContent = "Last Updated: " + formatDateTimeArray(post.lastUpdated);

                postMetadata.appendChild(postTitleElement);
                postMetadata.appendChild(postContentElement);
                postMetadata.appendChild(postCategoryElement);
                postMetadata.appendChild(datePostedElement);
                postMetadata.appendChild(document.createElement("br"));
                postMetadata.appendChild(lastUpdateElement);

                postDiv.appendChild(postThumbnail);
                postDiv.appendChild(postMetadata);

                postsContainer.appendChild(postDiv);
            });
        } catch (error) {
            console.error("Error displaying posts:", error);
            postsContainer.innerHTML = "<p>Error loading posts.</p>";
        }
    } else {
        console.error("No element with class 'blog-posts' found.");
    }
}

displayPosts();
