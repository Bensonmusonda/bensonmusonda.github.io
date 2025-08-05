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

    const date = new Date(year, month, day, hours, minutes, seconds);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24 && diffHours >= 0) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    if (date >= startOfWeek && date <= now) {
        return date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
               date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    }

    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPlainTextSnippet(markdownContent, maxLength = 80) {
    if (typeof marked === 'undefined') {
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

async function displayHighlights(containerSelector, apiPath, linkPrefix, cardClass, nameKey, contentKey) {
    try {
        const response = await fetch(`${SERVER_URL}/${apiPath}?limit=3`); 
        if (!response.ok) {
            throw new Error(`HTTP error. Status: ${response.status}`);
        }
        const highlightData = await response.json();
        const container = document.querySelector(containerSelector);

        container.innerHTML = '';

        for (let i = 0; i < 3; i++) {
            const data = highlightData[i];
            const cardDiv = document.createElement("div");
            cardDiv.classList.add(cardClass);

            if (data) {
                cardDiv.addEventListener('click', () => {
                    window.location.href = `${linkPrefix}?id=${data.id}`;
                });
                
                const thumbContainer = document.createElement("div");
                thumbContainer.classList.add("thumbnail-container");
                if (data.thumbnailUrl) {
                    const img = document.createElement("img");
                    img.src = SERVER_URL + data.thumbnailUrl;
                    img.alt = data[nameKey] + " thumbnail";
                    img.classList.add("highlight-thumbnail-img");
                    thumbContainer.appendChild(img);
                }

                const cardName = document.createElement("p");
                cardName.classList.add(`${cardClass}-name`);
                cardName.textContent = data[nameKey];

                cardDiv.appendChild(thumbContainer);
                cardDiv.appendChild(cardName);
                
            } else {
                cardDiv.innerHTML = '<div class="thumbnail-container"></div><p>Coming Soon...</p>';
            }

            container.appendChild(cardDiv);
        }

    } catch (error) {
        console.error(`Error displaying highlights from ${apiPath}: `, error);
        let container = document.querySelector(containerSelector);
        container.innerHTML = `<p>Error loading content.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    displayHighlights(".projects .cards", "projects", "project-detail.html", "project", "name", "description");
    displayHighlights(".posts .cards", "blog", "blog-post-detail.html", "post", "title", "content");
    displayHighlights(".skills .cards", "skills", "skill-detail.html", "skill", "name", "description");
});