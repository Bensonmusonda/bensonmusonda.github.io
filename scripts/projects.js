const SERVER_URL = "http://localhost:8081";

async function fetchProjects() {
    try {
        let response = await fetch(`${SERVER_URL}/projects`);
        let projectsData = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error. Status: ${response.status}`);
        }

        return projectsData;
    } catch (error) {
        console.error("Error fetching projects: ", error);
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

    const projectDate = new Date(year, month, day, hours, minutes, seconds);
    const now = new Date();

    const diffMs = now.getTime() - projectDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24 && diffHours >= 0) {
        return projectDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    if (projectDate >= startOfWeek && projectDate <= now) {
        return projectDate.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
               projectDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
    if (projectDate.getFullYear() === now.getFullYear()) {
        return projectDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    }

    return projectDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
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

async function displayProjects() {
    let projectsContainer = document.querySelector(".project-cards");
    if (projectsContainer) {
        projectsContainer.innerHTML = "";

        try {
            let projects = await fetchProjects();

            if (!projects || projects.length === 0) {
                projectsContainer.innerHTML = "<p>No projects to display yet.</p>";
                return;
            }

            projects.forEach(project => {
                let projectDiv = document.createElement("div");
                projectDiv.classList.add("project");
                projectDiv.addEventListener('click', () => {
                    window.location.href = `project-detail.html?id=${project.id}`;
                });

                let projectThumbnail = document.createElement("div");
                projectThumbnail.classList.add("thumbnail-container");
                if (project.thumbnailUrl) {
                    let img = document.createElement("img");
                    img.src = SERVER_URL + project.thumbnailUrl;
                    img.alt = project.name + " thumbnail";
                    img.classList.add("project-thumbnail-img");
                    projectThumbnail.appendChild(img);
                }

                let projectMetadata = document.createElement("div");
                projectMetadata.classList.add("metadata");

                let projectNameElement = document.createElement("h2");
                let descriptionElement = document.createElement("p");
                let categoryElement = document.createElement("span");
                let datePostedElement = document.createElement("span");
                let lastUpdateElement = document.createElement("span");

                projectNameElement.classList.add("project-title");
                descriptionElement.classList.add("project-content");
                categoryElement.classList.add("category");
                datePostedElement.classList.add("date-posted");
                lastUpdateElement.classList.add("last-updated");

                projectNameElement.textContent = project.name;
                descriptionElement.textContent = getPlainTextSnippet(project.description, 120);
                categoryElement.textContent = project.category;
                
                datePostedElement.textContent = "Posted: " + formatDateTimeArray(project.datePosted);
                lastUpdateElement.textContent = "Last Updated: " + formatDateTimeArray(project.lastUpdated);

                projectMetadata.appendChild(projectNameElement);
                projectMetadata.appendChild(descriptionElement);
                projectMetadata.appendChild(categoryElement);
                projectMetadata.appendChild(datePostedElement);
                projectMetadata.appendChild(document.createElement("br"));
                projectMetadata.appendChild(lastUpdateElement);

                projectDiv.appendChild(projectThumbnail);
                projectDiv.appendChild(projectMetadata);

                projectsContainer.appendChild(projectDiv);
            });
        } catch (error) {
            console.error("Error displaying projects:", error);
            projectsContainer.innerHTML = "<p>Error loading projects.</p>";
        }
    } else {
        console.error("No element with class 'project-cards' found.");
    }
}

displayProjects();
