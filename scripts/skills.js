async function fetchskills() {

    try {
        let response = await fetch("http://localhost:8080/skills");
        let skillsData = await response.json();

        if(!response.ok) {

            throw new Error("HTTP error. Status:", response.status);

        }

        return skillsData;
    }
    catch(error) {
        console.log("Error fetching skills: ", error);
    }
    
}

async function displayskills() {

    let skillsContainer = document.querySelector(".skills");
    if(skillsContainer) {
        skillsContainer.innerHTML = "";

        try{

            let skills = await fetchskills();

            skills.forEach(skill => {
            let skillDiv = document.createElement("div");
                skillDiv.classList.add("skill");

                let skillNameElement = document.createElement("h2");
                let descriptionElement = document.createElement("p");
                let categoryElement = document.createElement("h3");
                let datePostedElement = document.createElement("span");
                let lastUpdateElement = document.createElement("span");

                skillNameElement.textContent = skill.name;
                descriptionElement.textContent = skill.description;
                categoryElement.textContent = skill.category;
                datePostedElement.textContent = skill.datePosted + "    ";
                lastUpdateElement.textContent = skill.lastUpdated;

                skillDiv.appendChild(skillNameElement);
                skillDiv.appendChild(descriptionElement);
                skillDiv.appendChild(categoryElement);
                skillDiv.appendChild(datePostedElement);
                skillDiv.appendChild(lastUpdateElement);

                skillsContainer.appendChild(skillDiv);

            });
        } 
        catch(error) {
            console.log("Error displaying skills: ", error);
        }  
    }
    else {
        console.error("No element with class 'blog-posts' found.");
    }
}

displayskills();