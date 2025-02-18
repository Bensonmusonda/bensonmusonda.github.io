async function fetchProjects() {

    try {
        let response = await fetch("http://localhost:8080/projects");
        let projectsData = await response.json();

        if(!response.ok) {

            throw new Error("HTTP error. Status:", response.status);

        }

        return projectsData;
    }
    catch(error) {
        console.log("Error fetching projects: ", error);
    }
    
}

async function displayProjects() {

    let projectsContainer = document.querySelector(".project-cards");
    projectsContainer.innerHTML = "";

    try{

        let projects = await fetchProjects();

        projects.forEach(project => {
            let projectDiv = document.createElement("div");
            projectDiv.classList.add("project");

            let projectNameElement = document.createElement("h2");
            let descriptionElement = document.createElement("p");
            let categoryElement = document.createElement("h3");
            let datePostedElement = document.createElement("span");
            let lastUpdateElement = document.createElement("span");

            projectNameElement.textContent = project.name;
            descriptionElement.textContent = project.description;
            categoryElement.textContent = project.category;
            datePostedElement.textContent = project.datePosted + "    ";
            lastUpdateElement.textContent = project.lastUpdated;

            projectDiv.appendChild(projectNameElement);
            projectDiv.appendChild(descriptionElement);
            projectDiv.appendChild(categoryElement);
            projectDiv.appendChild(datePostedElement);
            projectDiv.appendChild(lastUpdateElement);

            projectsContainer.appendChild(projectDiv);

        });
    } 
    catch(error) {
        console.log("Error displaying projects: ", error);
    }  
}

displayProjects();