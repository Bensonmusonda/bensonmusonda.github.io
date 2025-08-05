const SERVER_URL = "http://localhost:8081";
let easyMDE;

document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
    }

    const mainContentArea = document.querySelector('.admin-main');
    const creationCenterContent = document.getElementById('creation-center-content');
    const profileEditorContent = document.getElementById('profile-editor-content');
    const adminTabs = document.querySelectorAll('.admin-tab');

    showTabContent('creation-center');

    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            showTabContent(tabId);
            updateActiveTab(tab);
        });
    });

    document.querySelectorAll('.create-option').forEach(option => {
        option.addEventListener('click', () => {
            const type = option.dataset.type;
            loadMarkdownForm(type);
        });
    });

    document.querySelectorAll('.add-option').forEach(option => {
        option.addEventListener('click', () => {
            const type = option.dataset.type;
            loadSimpleForm(type);
        });
    });

    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
    });

    function showTabContent(tabId) {
        if (tabId === 'creation-center') {
            creationCenterContent.style.display = 'block';
            profileEditorContent.style.display = 'none';
        } else if (tabId === 'profile-editor') {
            creationCenterContent.style.display = 'none';
            profileEditorContent.style.display = 'block';
        }
    }

    function updateActiveTab(activeTab) {
        adminTabs.forEach(tab => tab.classList.remove('active-tab'));
        activeTab.classList.add('active-tab');
    }

    function loadMarkdownForm(type) {
        const headerText = `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        let titlePlaceholder = "";
        let contentPlaceholder = "";

        switch (type) {
            case 'project':
                titlePlaceholder = "Project Name";
                contentPlaceholder = "Project Content (Markdown)";
                break;
            case 'blog':
                titlePlaceholder = "Post Title";
                contentPlaceholder = "Post Content (Markdown)";
                break;
            case 'skill':
                titlePlaceholder = "Skill Name";
                contentPlaceholder = "Skill Description (Markdown)";
                break;
        }

        const formHtml = `
            <div class="creation-center-container">
                <h1 class="tab-header">${headerText}</h1>
                <form id="creation-form">
                    <input type="text" id="content-title" class="obsidian-style-input" placeholder="${titlePlaceholder}" required>
                    <textarea id="content-body" placeholder="${contentPlaceholder}" required></textarea>
                    <div class="form-actions">
                        <button type="button" id="save-content-button" class="submit-button">Save</button>
                        <button type="button" class="cancel-button">Cancel</button>
                    </div>
                </form>
            </div>
            <dialog id="save-modal" class="modal">
                <div class="modal-content">
                    <h2>Add Details</h2>
                    <label for="thumbnail-upload" class="file-label">
                        <img src="src/image-icon.png" alt="Upload Icon" class="upload-icon">
                        <span id="file-name-display">Choose Thumbnail Image</span>
                        <input type="file" id="thumbnail-upload" accept="image/*" style="display:none;">
                    </label>
                    <input type="text" id="category-input" placeholder="Category" class="modal-input" required>
                    <div class="modal-actions">
                        <button id="confirm-save" class="modal-button primary">Confirm</button>
                        <button id="cancel-modal" class="modal-button secondary">Cancel</button>
                    </div>
                </div>
            </dialog>
            `;
        mainContentArea.innerHTML = formHtml;
        initMarkdownEditorAndModal(type);
    }

    function initMarkdownEditorAndModal(type) {
        if (easyMDE) easyMDE.toTextArea();
        easyMDE = new EasyMDE({
            element: document.getElementById('content-body'),
            spellChecker: false,
            forceSync: true,
        });

        const saveButton = document.getElementById('save-content-button');
        const cancelButton = document.querySelector('.cancel-button');
        const saveModal = document.getElementById('save-modal');
        const confirmSaveButton = document.getElementById('confirm-save');
        const cancelModalButton = document.getElementById('cancel-modal');
        const thumbnailUploadInput = document.getElementById('thumbnail-upload');
        const fileNameDisplay = document.getElementById('file-name-display');

        thumbnailUploadInput.addEventListener('change', (e) => {
            fileNameDisplay.textContent = e.target.files[0] ? e.target.files[0].name : "Choose Thumbnail Image";
        });

        saveButton.addEventListener('click', () => {
            const content = easyMDE.value();
            const title = document.getElementById('content-title').value;
            if (title.trim() === "" || content.trim() === "") {
                alert("Title and content cannot be empty.");
                return;
            }
            saveModal.showModal();
        });

        cancelButton.addEventListener('click', () => location.reload());
        cancelModalButton.addEventListener('click', () => saveModal.close());

        confirmSaveButton.addEventListener('click', () => handleMarkdownSave(type, easyMDE));
    }

    async function handleMarkdownSave(type, mde) {
        const titleInput = document.getElementById('content-title').value;
        const contentBody = mde.value();
        const categoryInput = document.getElementById('category-input').value;
        const thumbnailUploadInput = document.getElementById('thumbnail-upload');
        const file = thumbnailUploadInput.files[0];
        const token = localStorage.getItem('jwt_token');

        if (!token) {
            alert("You are not logged in. Redirecting to login page.");
            window.location.href = 'login.html';
            return;
        }

        if (categoryInput.trim() === "") {
            alert("Category cannot be empty.");
            return;
        }

        let thumbnailUrl = null;
        if (file) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch(`${SERVER_URL}/upload/thumbnail`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });

                if (response.status === 401) {
                    alert("Your session has expired. Please log in again.");
                    localStorage.removeItem('jwt_token');
                    window.location.href = 'login.html';
                    return;
                }

                if (!response.ok) throw new Error(`File upload failed: ${response.status}`);
                const result = await response.json();
                thumbnailUrl = result.fileUrl;
            } catch (error) {
                console.error('Upload Error:', error);
                alert('Error uploading thumbnail. Please try again.');
                return;
            }
        }

        const payload = {
            category: categoryInput
        };

        if (thumbnailUrl) {
            payload.thumbnailUrl = thumbnailUrl;
        }

        if (type === 'project' || type === 'skill') {
            payload.name = titleInput;
            payload.description = contentBody;
        } else if (type === 'blog') {
            payload.title = titleInput;
            payload.content = contentBody;
        }

        const endpoint = `/${type === 'blog' ? 'blog' : (type === 'project' ? 'projects' : 'skills')}`;
        try {
            const response = await fetch(`${SERVER_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (response.status === 401) {
                alert("Your session has expired. Please log in again.");
                localStorage.removeItem('jwt_token');
                window.location.href = 'login.html';
                return;
            }

            if (response.ok) {
                alert('Content saved successfully!');
                location.reload();
            } else {
                const error = await response.text();
                throw new Error(`Content save failed: ${response.status} - ${error}`);
            }
        } catch (error) {
            console.error('Content Save Error:', error);
            alert('Error saving content. Please try again.');
        }
    }

    function loadSimpleForm(type) {
        const headerText = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        let formHtml = '';

        switch (type) {
            case 'education':
                formHtml = `
                    <div class="creation-center-container">
                        <h1 class="tab-header">${headerText}</h1>
                        <form id="education-form">
                            <input type="text" id="education-institution" placeholder="Institution" class="modal-input" required>
                            <input type="text" id="education-title" placeholder="Degree/Course Title" class="modal-input" required>
                            <label for="education-level" class="form-label">Education Level:</label>
                            <select id="education-level" class="modal-input" required>
                                <option value="" disabled selected>Select Level</option>
                                <option value="HIGH_SCHOOL">High School</option>
                                <option value="ASSOCIATE">Associate's Degree</option>
                                <option value="DIPLOMA">Diploma</option>
                                <option value="BACHELOR">Bachelor's Degree</option>
                                <option value="MASTER">Master's Degree</option>
                                <option value="PHD">PhD</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <div class="date-inputs">
                                <label for="education-date-started">Start Date:</label>
                                <input type="date" id="education-date-started" class="modal-input" required>
                                <label for="education-date-ended">End Date:</label>
                                <input type="date" id="education-date-ended" class="modal-input">
                                <div id="education-end-date-container">
                                    <label><input type="checkbox" id="education-currently-here"> Currently Attending</label>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="submit-button">Save</button>
                                <button type="button" class="cancel-button">Cancel</button>
                            </div>
                        </form>
                    </div>
                `;
                break;
            case 'certificate':
                formHtml = `
                    <div class="creation-center-container">
                        <h1 class="tab-header">${headerText}</h1>
                        <form id="certificate-form">
                            <input type="text" id="cert-name" placeholder="Certificate Name" class="modal-input" required>
                            <input type="text" id="cert-source" placeholder="Issuing Organization" class="modal-input" required>
                            <input type="text" id="cert-category" placeholder="Category (e.g., Cloud, AI, Security)" class="modal-input" required>
                            <div class="form-actions">
                                <button type="submit" class="submit-button">Save</button>
                                <button type="button" class="cancel-button">Cancel</button>
                            </div>
                        </form>
                    </div>
                `;
                break;
            case 'experience':
                formHtml = `
                    <div class="creation-center-container">
                        <h1 class="tab-header">${headerText}</h1>
                        <form id="experience-form">
                            <input type="text" id="exp-position" placeholder="Position Title" class="modal-input" required>
                            <input type="text" id="exp-organization" placeholder="Organization/Company" class="modal-input" required>
                            <div class="date-inputs">
                                <label for="exp-date-started">Start Date:</label>
                                <input type="date" id="exp-date-started" class="modal-input" required>
                                <label for="exp-date-ended">End Date:</label>
                                <input type="date" id="exp-date-ended" class="modal-input">
                                <div id="experience-end-date-container">
                                    <label><input type="checkbox" id="exp-currently-here"> Currently here</label>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="submit-button">Save</button>
                                <button type="button" class="cancel-button">Cancel</button>
                            </div>
                        </form>
                    </div>
                `;
                break;
        }

        mainContentArea.innerHTML = formHtml;
        const cancelButton = mainContentArea.querySelector('.cancel-button');
        cancelButton.addEventListener('click', () => location.reload());

        mainContentArea.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (type === 'education') {
                handleEducationSave();
            } else if (type === 'certificate') {
                handleCertificateSave();
            } else if (type === 'experience') {
                handleExperienceSave();
            }
        });

        const educationCurrentlyHereCheckbox = document.getElementById('education-currently-here');
        const educationEndDateInput = document.getElementById('education-date-ended');

        if (educationCurrentlyHereCheckbox && educationEndDateInput) {
            educationCurrentlyHereCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    educationEndDateInput.disabled = true;
                    educationEndDateInput.value = '';
                } else {
                    educationEndDateInput.disabled = false;
                }
            });

            if (educationCurrentlyHereCheckbox.checked) {
                educationEndDateInput.disabled = true;
            }
        }
        
        const experienceCurrentlyHereCheckbox = document.getElementById('exp-currently-here');
        const experienceEndDateInput = document.getElementById('exp-date-ended');

        if (experienceCurrentlyHereCheckbox && experienceEndDateInput) {
            experienceCurrentlyHereCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    experienceEndDateInput.disabled = true;
                    experienceEndDateInput.value = '';
                } else {
                    experienceEndDateInput.disabled = false;
                }
            });

            if (experienceCurrentlyHereCheckbox.checked) {
                experienceEndDateInput.disabled = true;
            }
        }
    }

    async function handleEducationSave() {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            alert("You are not logged in. Redirecting to login page.");
            window.location.href = 'login.html';
            return;
        }

        const startDateInput = document.getElementById('education-date-started');
        const endDateInput = document.getElementById('education-date-ended');
        const isCurrentlyHere = document.getElementById('education-currently-here').checked;

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert("The end date cannot be before the start date.");
            return;
        }

        const payload = {
            level: document.getElementById('education-level').value,
            title: document.getElementById('education-title').value,
            institution: document.getElementById('education-institution').value,
            dateStarted: startDate,
            dateEnded: isCurrentlyHere ? null : endDate,
        };

        try {
            await postData('education', payload, token);
        } catch (error) {
            console.error('Education Save Error:', error);
            alert('Error saving education. Please try again.');
        }
    }

    async function handleCertificateSave() {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            alert("You are not logged in. Redirecting to login page.");
            window.location.href = 'login.html';
            return;
        }
        const payload = {
            name: document.getElementById('cert-name').value,
            source: document.getElementById('cert-source').value,
            category: document.getElementById('cert-category').value,
        };
        try {
            await postData('certificate', payload, token);
        } catch (error) {
            console.error('Certificate Save Error:', error);
            alert('Error saving certificate. Please try again.');
        }
    }

    async function handleExperienceSave() {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            alert("You are not logged in. Redirecting to login page.");
            window.location.href = 'login.html';
            return;
        }

        const startDateInput = document.getElementById('exp-date-started');
        const endDateInput = document.getElementById('exp-date-ended');
        const isCurrentlyHere = document.getElementById('exp-currently-here').checked;

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert("The end date cannot be before the start date.");
            return;
        }
        
        const payload = {
            position: document.getElementById('exp-position').value,
            organization: document.getElementById('exp-organization').value,
            dateStarted: startDate,
            dateEnded: isCurrentlyHere ? null : endDate,
        };

        try {
            await postData('experience', payload, token);
        } catch (error) {
            console.error('Experience Save Error:', error);
            alert('Error saving experience. Please try again.');
        }
    }

    async function postData(type, payload, token) {
        let endpoint = '';
        if (type === 'education') {
            endpoint = `${SERVER_URL}/education`;
        } else if (type === 'certificate') {
            endpoint = `${SERVER_URL}/certificate`;
        } else if (type === 'experience') {
            endpoint = `${SERVER_URL}/experience`;
        } else {
            throw new Error('Invalid post data type');
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload),
        });

        if (response.status === 401) {
            alert("Your session has expired. Please log in again.");
            localStorage.removeItem('jwt_token');
            window.location.href = 'login.html';
            return;
        }

        if (response.ok) {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`);
            location.reload();
        } else {
            const error = await response.text();
            throw new Error(`Save failed: ${response.status} - ${error}`);
        }
    }
});