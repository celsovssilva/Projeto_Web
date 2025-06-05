document.getElementById('openModalBtn').onclick = function() {
  document.getElementById('editProfileModal').style.display = 'flex';
  const cpfInput = document.querySelector('input[name="cpf"]');
  if (cpfInput) cpfInput.value = maskCPF(cpfInput.value);
};
document.getElementById('closeModalBtn').onclick = function() {
  document.getElementById('editProfileModal').style.display = 'none';
};
window.onclick = function(event) {
  const modal = document.getElementById('editProfileModal');
  if (event.target === modal) modal.style.display = 'none';
};

document.querySelector('input[name="password"]').addEventListener('input', function() {
  const current = document.querySelector('input[name="currentPassword"]');
  if (this.value.trim() !== "") {
    current.required = true;
  } else {
    current.required = false;
  }
});

const editPasswordInput = document.getElementById('editPassword');
const editPasswordCriteriaContainer = document.getElementById('editPasswordCriteriaContainer');
const editLengthCrit = document.getElementById('editLengthCrit');
const editUpperCrit = document.getElementById('editUpperCrit');
const editLowerCrit = document.getElementById('editLowerCrit');
const editNumberCrit = document.getElementById('editNumberCrit');
const editSpecialCrit = document.getElementById('editSpecialCrit');

function updateEditCriterionStatus(element, isValid) {
  if (isValid) {
    element.classList.remove('invalid');
    element.classList.add('valid');
  } else {
    element.classList.remove('valid');
    element.classList.add('invalid');
  }
}

function checkEditPasswordCriteria() {
  const value = editPasswordInput.value;
  updateEditCriterionStatus(editLengthCrit, value.length >= 8);
  updateEditCriterionStatus(editUpperCrit, /[A-Z]/.test(value));
  updateEditCriterionStatus(editLowerCrit, /[a-z]/.test(value));
  updateEditCriterionStatus(editNumberCrit, /\d/.test(value));
  updateEditCriterionStatus(editSpecialCrit, /[^A-Za-z0-9]/.test(value));
}

if (editPasswordInput) {
  editPasswordInput.addEventListener('focus', () => {
    editPasswordCriteriaContainer.style.display = 'block';
    checkEditPasswordCriteria();
  });
  editPasswordInput.addEventListener('input', checkEditPasswordCriteria);
  editPasswordInput.addEventListener('blur', () => {
    if (editPasswordInput.value === "") {
      editPasswordCriteriaContainer.style.display = 'none';
      [editLengthCrit, editUpperCrit, editLowerCrit, editNumberCrit, editSpecialCrit].forEach(el => {
        el.classList.remove('valid', 'invalid');
      });
    }
  });
}

window.onload = function() {
  const popup = document.getElementById('popupError');
  if (popup) {
    setTimeout(() => {
      popup.style.display = 'none';
    }, 4000);
  }
  const popupSuccess = document.getElementById('popupSuccess');
  if (popupSuccess) {
    setTimeout(() => {
      popupSuccess.style.display = 'none';
    }, 4000);
  }
}

function maskCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

document.getElementById('openModalBtn').onclick = function() {
  document.getElementById('editProfileModal').style.display = 'flex';
  const cpfInput = document.querySelector('input[name="cpf"]');
  if (cpfInput) cpfInput.value = maskCPF(cpfInput.value);
};