const SERVER_URL = "http://localhost:8081";
const MAX_LIST_ITEMS = 5;

async function getUserData() {
    try {
        let response = await fetch(`${SERVER_URL}/api/v1/users/email/bennieboyy101@gmail.com`);

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        let userData = await response.json();
        return userData;
    } catch(error) {
        console.error("Error fetching data: ", error);
        throw error;
    }
}

async function displayUserData() {
    let identity = document.querySelector(".identity");

    try {
        let user = await getUserData();

        let username = document.createElement("h1");
        let career = document.createElement("h2");

        username.classList.add("username");
        career.classList.add("career");
        
        username.textContent = user.firstName + " " + user.lastName;
        career.textContent = user.career;

        identity.appendChild(username);
        identity.appendChild(career);
    } catch(error) {
        console.error("Failed to fetch user data: ", error)
    }
}

async function fetchProjects() {
    try {
        let response = await fetch(`${SERVER_URL}/projects/names`);
        let projectsData = await response.json();

        if(!response.ok) {
            throw new Error("HTTP Error.Status: ", error);
        }

        return projectsData;
    }
    catch(error) {
        console.error("Error fetching projects.", error);
    }
}

async function displayProjects() {
    let projectsDiv = document.querySelector(".projects");

    try {
        let projects = await fetchProjects();
        const limitedProjects = projects.slice(0, MAX_LIST_ITEMS);

        limitedProjects.forEach(project => {
            let projectName = document.createElement("p");
            projectName.classList.add("project");
            projectName.textContent = project.name;
            projectsDiv.appendChild(projectName);
        });
    }
    catch(error) {
        console.error("Error displaying projects.", error);
    }
}

async function fetchExperience() {
    try {
        let response = await fetch(`${SERVER_URL}/experience`);
        let experienceData = await response.json();

        if(!response.ok) {
            throw new Error("HTTP Error.Status: ", error);
        }

        return experienceData;
    }
    catch(error) {
        console.error("Error fetching experience.", error);
    }
}

async function displayExperience() {
    let experienceDiv = document.querySelector(".experience");

    try {
        let experience = await fetchExperience();
        const limitedExperience = experience.slice(0, MAX_LIST_ITEMS);

        limitedExperience.forEach(exp => {
            let exp_entry = document.createElement("p");
            exp_entry.classList.add("worked_at");
            exp_entry.textContent = `${exp.position} at ${exp.organization}`;
            experienceDiv.appendChild(exp_entry);
        });
    }
    catch(error) {
        console.error("Error displaying experience.", error);
    }
}

async function fetchEducation() {
    try {
        let response = await fetch(`${SERVER_URL}/education`);
        let educationData = await response.json();

        if(!response.ok) {
            throw new Error("HTTP error. Status: ", error);
        }

        return educationData;
    }
    catch(error) {
        console.error("Error fetching education details. error:", error);
    }
}

async function displayEducation() {
    let educationDiv = document.querySelector(".education");

    try {
        let educationData = await fetchEducation();
        const limitedEducation = educationData.slice(0, MAX_LIST_ITEMS);

        limitedEducation.forEach(education => {
            let educationEntry = document.createElement("div");
            educationEntry.classList.add(".education-entry");

            let educationTitleElement = document.createElement('span');
            let institutionElement = document.createElement("span");
            let levelElement = document.createElement("span");
            let dateElement = document.createElement("span");

            educationTitleElement.classList.add("education-title");
            institutionElement.classList.add("institution-element");
            levelElement.classList.add("level-element");
            dateElement.classList.add("date");

            educationTitleElement.textContent = education.title + " - ";
            institutionElement.textContent = education.institution;
            levelElement.textContent = education.level + " ";

            let formattedDateStarted = "";
            let formattedDateEnded = "";

            if (education.dateStarted) {
                let fDStart = new Date(education.dateStarted[0], education.dateStarted[1] - 1, education.dateStarted[2]);
                let dayS = String(fDStart.getDate()).padStart(2, '0');
                let monthS = String(fDStart.getMonth() + 1).padStart(2, '0');
                let yearS = String(fDStart.getFullYear()).slice(-2);
                formattedDateStarted = `${dayS} - ${monthS} - ${yearS}`;
            }

            if (education.dateEnded) {
                let fDEnd = new Date(education.dateEnded[0], education.dateEnded[1] - 1, education.dateEnded[2]);
                let dayE = String(fDEnd.getDate()).padStart(2, '0');
                let monthE = String(fDEnd.getMonth() + 1).padStart(2, '0');
                let yearE = String(fDEnd.getFullYear()).slice(-2);
                formattedDateEnded = `${dayE} - ${monthE} - ${yearE}`;
            }

            if (formattedDateStarted && formattedDateEnded) {
                dateElement.textContent = `${formattedDateStarted} to ${formattedDateEnded}`;
            } else if (formattedDateStarted) {
                dateElement.textContent = formattedDateStarted;
            } else if (formattedDateEnded) {
                dateElement.textContent = formattedDateEnded;
            } else {
                dateElement.textContent = "";
            }

            const lineBreak = document.createElement("br");
            educationEntry.appendChild(educationTitleElement);
            educationEntry.appendChild(institutionElement);
            educationEntry.appendChild(lineBreak);
            educationEntry.appendChild(levelElement);
            educationEntry.appendChild(lineBreak);
            educationEntry.appendChild(dateElement);
            educationDiv.appendChild(educationEntry);
        });
    }
    catch(error) {
        console.error("error displaying education details. error:", error)
    }
}

async function fetchSkills() {
    try {
        let response = await fetch(`${SERVER_URL}/skills`)
        let skillsData = await response.json();

        if(!response.ok) {
            throw new error("HTTP error. Status: ", error);
        }

        return skillsData;
    }
    catch(error) {
        console.error("Error fetching skills details. error:", error);
    }
}

async function displaySkills() {
    let skillsDiv = document.querySelector(".skills");

    try {
        let skillsData = await fetchSkills();
        const limitedSkills = skillsData.slice(0, MAX_LIST_ITEMS);

        limitedSkills.forEach(skill => {
            let skillElement = document.createElement("p");
            skillElement.classList.add("skill-element");
            skillElement.textContent = skill.name;
            skillsDiv.appendChild(skillElement);
        });
    }
    catch(error) {
        console.error("error displaying skills");
    }
}

async function fetchCertification() {
    try {
        let response = await fetch(`${SERVER_URL}/certificate`)
        let certificationData = await response.json();

        if(!response.ok) {
            throw new error("HTTP error. Status: ", error);
        }

        return certificationData;
    }
    catch(error) {
        console.error("Error fetching skills details. error:", error);
    }
}

async function displayCertification() {
    let certificationDiv = document.querySelector(".certification");

    try {
        let certificationData = await fetchCertification();
        const limitedCertification = certificationData.slice(0, MAX_LIST_ITEMS);

        limitedCertification.forEach(certificate => {
            let certificateElement = document.createElement("p");
            certificateElement.classList.add("certificate-element");
            certificateElement.textContent = certificate.name + " from " + certificate.source;
            certificationDiv.appendChild(certificateElement);
        });
    }
    catch(error) {
        console.error("error displaying skills");
    }
}

displayUserData();
displayProjects();
displayExperience();
displayEducation();
displaySkills();
displayCertification();