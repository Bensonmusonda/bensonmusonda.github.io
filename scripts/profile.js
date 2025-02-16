async function getUserData() {
    try {

        let response = await fetch("http://localhost:8080/users/email/bennie@example.com");

        if(!response.ok) {
            throw new Error("HTTP error! status: ${response.status}")
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

displayUserData();