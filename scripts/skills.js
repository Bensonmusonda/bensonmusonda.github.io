const SERVER_URL = "http://localhost:8081";

async function fetchAllSkills() {
    try {
        const response = await fetch(`${SERVER_URL}/skills`);
        if (!response.ok) {
            throw new Error(`HTTP error. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching skills: ", error);
        return [];
    }
}

function renderSkills(skills) {
    const skillsContainer = document.querySelector(".skills");
    skillsContainer.innerHTML = '';

    if (skills.length === 0) {
        skillsContainer.innerHTML = "<p>No skills found.</p>";
        return;
    }

    skills.forEach(skill => {
        let skillDiv = document.createElement("div");
        skillDiv.classList.add("skill");
        skillDiv.addEventListener('click', () => {
            window.location.href = `skill-detail.html?id=${skill.id}`;
        });

        let skillThumbnail = document.createElement("div");
        skillThumbnail.classList.add("skill-thumbnail");

        if (skill.thumbnailUrl) {
            let img = document.createElement("img");
            img.src = SERVER_URL + skill.thumbnailUrl;
            img.alt = skill.name + " thumbnail";
            skillThumbnail.appendChild(img);
        }

        let skillName = document.createElement("h3");
        skillName.textContent = skill.name;

        skillDiv.appendChild(skillThumbnail);
        skillDiv.appendChild(skillName);

        skillsContainer.appendChild(skillDiv);
    });
}

async function displayAllSkills() {
    const allSkills = await fetchAllSkills();
    renderSkills(allSkills);
}

displayAllSkills();
