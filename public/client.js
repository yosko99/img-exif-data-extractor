const thumbnailHolder = document.getElementById('thumbnailHolder');
const thumbnail = document.getElementById('thumbnail');
const linksDiv = document.getElementById('links');
const deleteBtn = document.getElementById('deleteButton');
const fetchImagesForm = document.getElementById('fetchImages');
const refetchAlert = document.getElementById('refetchAlert');

const socket = new WebSocket('ws://localhost:8080');

const populateLinksDiv = () => {
  refetchAlert.classList.remove('hide');
  refetchAlert.classList.add('show');

  fetchAndAppendImages(fetchImagesForm);

  thumbnailHolder.classList.remove('show');
  thumbnailHolder.classList.add('hide');
  thumbnail.src = '';

  setTimeout(() => {
    refetchAlert.classList.remove('show');
    refetchAlert.classList.add('hide');
  }, 1000);
};

deleteBtn.addEventListener('click', (e) => {
  const filepath = e.target.getAttribute('filepath');
  fetch(`http://localhost:5000/${filepath}`, { method: 'DELETE' })
    .then((response) => response.json()).then((data) => {
      socket.send('refetch');
      populateLinksDiv();
    });
});

thumbnail.addEventListener('click', (e) => {
  const link = e.target.getAttribute('filepath');
  window.open(link, '_blank');
});

const importImages = (images) => {
  images.forEach(image => {
    const text = document.createElement('a');

    text.innerHTML = image.filename;
    text.setAttribute('filepath', image.filepath);
    text.setAttribute('thumbnailPath', image.thumbnailPath);
    text.style.cursor = 'pointer';
    text.style.margin = '2px';

    text.addEventListener('click', (e) => {
      thumbnail.src = '/uploads/' + e.target.getAttribute('thumbnailPath');

      thumbnail.setAttribute('filepath', '/uploads/' + image.filepath);
      deleteBtn.setAttribute('filepath', image.filepath);

      thumbnailHolder.classList.remove('hide');
      thumbnailHolder.classList.add('show');
    });

    linksDiv.appendChild(text);
  });
};

const uploadForm = document.getElementById('uploadForm');

uploadForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  fetch('http://localhost:5000/upload', { method: 'POST', body: formData })
    .then((response) => response.json()).then((data) => {
      if (data.error !== '') {
        alert(`${data.message} ${data.error}`);
      } else {
        alert(data.message);
      }
      fetchAndAppendImages(fetchImagesForm);

      socket.send('refetch');
    });
});

function fetchAndAppendImages (form) {
  const formData = new FormData(form);
  const { minLon, maxLon, minLat, maxLat } = Object.fromEntries(formData);

  fetch(`http://localhost:5000/images?minLon=${minLon}&maxLon=${maxLon}&minLat=${minLat}&maxLat=${maxLat}`)
    .then((response) => response.json())
    .then((data) => {
      linksDiv.innerHTML = '';

      if (data.length === 0) {
        const p = document.createElement('p');

        p.innerHTML = 'No data with provided coordinates.';
        p.classList.add('h3');

        linksDiv.appendChild(p);
      } else {
        importImages(data);
      }
    });
}

fetchImagesForm.addEventListener('submit', (e) => {
  e.preventDefault();
  fetchAndAppendImages(fetchImagesForm);
});

socket.onmessage = () => {
  populateLinksDiv();
};
