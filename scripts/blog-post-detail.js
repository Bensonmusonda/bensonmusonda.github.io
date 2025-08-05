const SERVER_URL = "http://localhost:8081";

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

function getBlogPostIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function fetchBlogPost(id) {
    try {
        const response = await fetch(`${SERVER_URL}/blog/${id}`);
        const postData = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error. Status: ${response.status}`);
        }
        return postData;
    } catch (error) {
        console.error("Error fetching blog post:", error);
        return null;
    }
}

async function displayBlogPost() {
    const postId = getBlogPostIdFromUrl();
    const pageTitleElement = document.getElementById('pageTitle');
    const postDetailThumbnail = document.getElementById('postDetailThumbnail'); // New
    const postTitleElement = document.querySelector('.post-detail-title');
    const postCategoryElement = document.querySelector('.post-meta .category');
    const datePostedElement = document.querySelector('.post-meta .date-posted');
    const lastUpdateElement = document.querySelector('.post-meta .last-updated');
    const postContentElement = document.querySelector('.post-content-rendered');

    if (!postId) {
        postTitleElement.textContent = "Post Not Found";
        postContentElement.innerHTML = "<p>No blog post ID provided in the URL.</p>";
        pageTitleElement.textContent = "Error";
        return;
    }

    const post = await fetchBlogPost(postId);

    if (post) {
        pageTitleElement.textContent = post.title;
        postTitleElement.textContent = post.title;
        postCategoryElement.textContent = post.category;
        datePostedElement.textContent = "Posted: " + formatDateTimeArray(post.datePosted);
        lastUpdateElement.textContent = "Last Updated: " + formatDateTimeArray(post.lastUpdated);

        if (post.thumbnailUrl) {
            postDetailThumbnail.src = SERVER_URL + post.thumbnailUrl;
            postDetailThumbnail.style.display = 'block';
        } else {
            postDetailThumbnail.style.display = 'none';
        }

        postContentElement.innerHTML = marked.parse(post.content);
    } else {
        postTitleElement.textContent = "Post Not Found";
        postContentElement.innerHTML = "<p>The requested blog post could not be loaded.</p>";
        pageTitleElement.textContent = "Error";
    }
}

document.addEventListener('DOMContentLoaded', displayBlogPost);
