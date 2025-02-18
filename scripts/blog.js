async function fetchPosts() {
    try{
        let response = await fetch("http://localhost:8080/blog")
        let postsData = await response.json();

        if(!response.ok) {
            throw new Error("HTTP error. status: ", response.status);
        }

        return postsData;
    }
    catch(error) {
        console.error("error fetching data: ", error);
    }
}

async function displayPosts() {
    let postsContainer = document.querySelector(".blog-posts");
    if (postsContainer) {
        postsContainer.innerHTML = "";
    
        try {
            let postsData = await fetchPosts()
    
            postsData.forEach(post => {
                let postDiv = document.createElement("div");
                postDiv.classList.add("blog-post");
    
                let postTitleElement = document.createElement("h2");
                let postContentElement = document.createElement("p");
                let postCategoryElement = document.createElement("h4");
                let datePostedElement = document.createElement("span");
                let lastUpdateElement = document.createElement("span");
    
                postTitleElement.textContent = post.title;
                postContentElement.textContent = post.content;
                postCategoryElement.textContent = post.category;
                datePostedElement.textContent = post.datePosted + "    ";
                lastUpdateElement.textContent = post.lastUpdated;
    
                postDiv.appendChild(postTitleElement);
                postDiv.appendChild(postContentElement);
                postDiv.appendChild(postCategoryElement);
                postDiv.appendChild(datePostedElement);
                postDiv.appendChild(lastUpdateElement);
    
                postsContainer.appendChild(postDiv);
            })
        }
        catch(error) {
            console.error("error displaying posts: ", error);
            postsContainer.innerHTML = "<p>Error loading posts.</p>";
        }
    
    } else {
        console.error("No element with class 'blog-posts' found.");
    }

}

displayPosts();