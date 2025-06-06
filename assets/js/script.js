const contactOptions = document.getElementById('contactOptions');
  const contactOptionBtn = document.getElementById('contactOptionBtn');
  const icon = contactOptionBtn.querySelector('i');

  contactOptions.addEventListener('shown.bs.collapse', function () {
    icon.classList.remove('bi-chat-dots-fill');
    icon.classList.add('bi-x-lg');
  });

  contactOptions.addEventListener('hidden.bs.collapse', function () {
    icon.classList.remove('bi-x-lg');
    icon.classList.add('bi-chat-dots-fill');
  });