// client/modules/authHandler.js
const AuthHandler = (function () {
    const form = document.getElementById('auth-form');
    const email_input = document.getElementById('email-input');
    const password_input = document.getElementById('password-input');
    const confirm_password_input = document.getElementById('confirm-password-input');
    const error_message = document.getElementById('error-message');
  
    function getSignupErrors(email, password, confirm_password) {
      let errors = [];
      if (email === '' || email == null) {
        errors.push('Yêu cầu nhập email');
        email_input.parentElement.classList.add('incorrect-form');
      }
      if (password === '' || password == null) {
        errors.push('Yêu cầu nhập mật khẩu');
        password_input.parentElement.classList.add('incorrect-form');
      }
      if (password.length < 8) {
        errors.push('Mật khẩu phải có ít nhất 8 ký tự');
        password_input.parentElement.classList.add('incorrect-form');
      }
      if (password !== confirm_password) {
        errors.push('Mật khẩu không trùng khớp');
        password_input.parentElement.classList.add('incorrect-form');
        confirm_password_input.parentElement.classList.add('incorrect-form');
      }
      return errors;
    }
  
    function getLoginErrors(email, password) {
      let errors = [];
      if (email === '' || email == null) {
        errors.push('Yêu cầu nhập email');
        email_input.parentElement.classList.add('incorrect-form');
      }
      if (password === '' || password == null) {
        errors.push('Yêu cầu nhập mật khẩu');
        password_input.parentElement.classList.add('incorrect-form');
      }
      return errors;
    }
  
    async function handleSubmit(e) {
      e.preventDefault();
      let errors = [];
  
      if (confirm_password_input) {
        errors = getSignupErrors(email_input.value, password_input.value, confirm_password_input.value);
        if (errors.length > 0) {
          error_message.innerText = errors.join(". ");
          return;
        }
  
        try {
          const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email_input.value, password: password_input.value }),
          });
  
          const data = await response.json();
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'sign in.html';
          } else {
            error_message.innerText = data.error;
            email_input.parentElement.classList.add('incorrect-form');
            password_input.parentElement.classList.add('incorrect-form');
            confirm_password_input.parentElement.classList.add('incorrect-form');
          }
        } catch (error) {
          error_message.innerText = 'Đã xảy ra lỗi khi đăng ký';
          console.error('Lỗi đăng ký:', error);
        }
      } else {
        errors = getLoginErrors(email_input.value, password_input.value);
        if (errors.length > 0) {
          error_message.innerText = errors.join(". ");
          return;
        }
  
        try {
          const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email_input.value, password: password_input.value }),
          });
  
          const data = await response.json();
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'tính toán động cơ.html';
          } else {
            error_message.innerText = data.error;
            email_input.parentElement.classList.add('incorrect-form');
            password_input.parentElement.classList.add('incorrect-form');
          }
        } catch (error) {
          error_message.innerText = 'Đã xảy ra lỗi khi đăng nhập';
          console.error('Lỗi đăng nhập:', error);
        }
      }
    }
  
    function init() {
      form.addEventListener('submit', handleSubmit);
  
      const allInputs = [email_input, password_input, confirm_password_input].filter(input => input != null);
      allInputs.forEach(input => {
        input.addEventListener('input', () => {
          if (input.parentElement.classList.contains('incorrect-form')) {
            input.parentElement.classList.remove('incorrect-form');
            error_message.innerText = '';
          }
        });
      });
    }
  
    return { init };
  })();
  
  export default AuthHandler;