const SERVER_URL = "http://localhost:8081";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const payload = {
            email: username,
            password: password
        };

        try {
            const response = await fetch(`${SERVER_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                const jwtToken = data.token;
                
                localStorage.setItem('jwt_token', jwtToken);

                window.location.href = 'admin.html';
            } else {
                loginError.style.display = 'block';
                console.error('Login failed:', response.status);
            }
        } catch (error) {
            loginError.style.display = 'block';
            console.error('An error occurred:', error);
        }
    });
});
