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

function getProjectIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function fetchProject(id) {
    try {
        const response = await fetch(`${SERVER_URL}/projects/${id}`);
        const projectData = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error. Status: ${response.status}`);
        }
        return projectData;
    } catch (error) {
        console.error("Error fetching project:", error);
        return null;
    }
}

async function displayProject() {
    const projectId = getProjectIdFromUrl();
    const pageTitleElement = document.getElementById('pageTitle');
    const projectDetailThumbnail = document.getElementById('projectDetailThumbnail');
    const projectTitleElement = document.querySelector('.project-detail-title');
    const projectCategoryElement = document.querySelector('.project-meta .category');
    const datePostedElement = document.querySelector('.project-meta .date-posted');
    const lastUpdateElement = document.querySelector('.project-meta .last-updated');
    const projectContentElement = document.querySelector('.project-content-rendered');

    if (!projectId) {
        projectTitleElement.textContent = "Project Not Found";
        projectContentElement.innerHTML = "<p>No project ID provided in the URL.</p>";
        pageTitleElement.textContent = "Error";
        return;
    }

    const project = await fetchProject(projectId);

    // Added for debugging: Log the entire project object to the console
    console.log("Fetched project object:", project);

    if (project) {
        pageTitleElement.textContent = project.name;
        projectTitleElement.textContent = project.name;
        projectCategoryElement.textContent = project.category;
        datePostedElement.textContent = "Posted: " + formatDateTimeArray(project.datePosted);
        lastUpdateElement.textContent = "Last Updated: " + formatDateTimeArray(project.lastUpdated);
        
        // Display thumbnail if available
        if (project.thumbnailUrl) {
            // FIX: Prepend the SERVER_URL to the relative thumbnail path
            projectDetailThumbnail.src = SERVER_URL + project.thumbnailUrl;
            projectDetailThumbnail.style.display = 'block'; // Make it visible
        } else {
            projectDetailThumbnail.style.display = 'none'; // Hide if no thumbnail
        }

        projectContentElement.innerHTML = marked.parse(project.description);
    } else {
        projectTitleElement.textContent = "Project Not Found";
        projectContentElement.innerHTML = "<p>The requested project could not be loaded.</p>";
        pageTitleElement.textContent = "Error";
    }
}

document.addEventListener('DOMContentLoaded', displayProject);
