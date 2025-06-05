document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('authToken', data.token);
          if (data.user) {
            localStorage.setItem('userData', JSON.stringify(data.user));
          }

          if (data.user && data.user.type === 'admin') {
            window.location.href = '/api/events';
          } else if (data.user && data.user.type === 'usuario') {
            window.location.href = '/api/events';
          } else {
            window.location.href = '/'; 
          }
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Erro na requisição de login:', error);
        window.location.reload();
      }
    });
  }
});
