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

    const skillDate = new Date(year, month, day, hours, minutes, seconds);
    const now = new Date(); 

    const diffMs = now.getTime() - skillDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24 && diffHours >= 0) {
        return skillDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    if (skillDate >= startOfWeek && skillDate <= now) {
        return skillDate.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
               skillDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
    if (skillDate.getFullYear() === now.getFullYear()) {
        return skillDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    }

    return skillDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getSkillIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function fetchSkill(id) {
    try {
        const response = await fetch(`${SERVER_URL}/skills/${id}`);
        const skillData = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error. Status: ${response.status}`);
        }
        return skillData;
    } catch (error) {
        console.error("Error fetching skill:", error);
        return null;
    }
}

async function displaySkill() {
    const skillId = getSkillIdFromUrl();
    const pageTitleElement = document.getElementById('pageTitle');
    const skillDetailThumbnail = document.getElementById('skillDetailThumbnail');
    const skillTitleElement = document.querySelector('.skill-detail-title');
    const skillCategoryElement = document.querySelector('.skill-meta .category');
    const datePostedElement = document.querySelector('.skill-meta .date-posted');
    const lastUpdateElement = document.querySelector('.skill-meta .last-updated');
    const skillContentElement = document.querySelector('.skill-content-rendered');

    if (!skillId) {
        skillTitleElement.textContent = "Skill Not Found";
        skillContentElement.innerHTML = "<p>No skill ID provided in the URL.</p>";
        pageTitleElement.textContent = "Error";
        return;
    }

    const skill = await fetchSkill(skillId);

    if (skill) {
        pageTitleElement.textContent = skill.name;
        skillTitleElement.textContent = skill.name;
        skillCategoryElement.textContent = skill.category;
        datePostedElement.textContent = "Posted: " + formatDateTimeArray(skill.datePosted);
        lastUpdateElement.textContent = "Last Updated: " + formatDateTimeArray(skill.lastUpdated);
        
        if (skill.thumbnailUrl) {
            skillDetailThumbnail.src = SERVER_URL + skill.thumbnailUrl;
            skillDetailThumbnail.style.display = 'block';
        } else {
            skillDetailThumbnail.style.display = 'none';
        }

        skillContentElement.innerHTML = marked.parse(skill.description);
    } else {
        skillTitleElement.textContent = "Skill Not Found";
        skillContentElement.innerHTML = "<p>The requested skill could not be loaded.</p>";
        pageTitleElement.textContent = "Error";
    }
}

document.addEventListener('DOMContentLoaded', displaySkill);
