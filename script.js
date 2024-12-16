// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAs8Dv6AlNThvyOUcgzcICLHb6VMGzqT0c",
  authDomain: "padel-3660f.firebaseapp.com",
  databaseURL: "https://padel-3660f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "padel-3660f",
  storageBucket: "padel-3660f.firebasestorage.app",
  messagingSenderId: "655113834897",
  appId: "1:655113834897:web:dd0166c7fda5996f4c0a30",
  measurementId: "G-RPDBP27M4J"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const addBtn = document.getElementById('addBtn');
const wizard = document.getElementById('wizard');
const wizardForm = document.getElementById('wizardForm');
const nameInput = document.getElementById('name');
const platformInput = document.getElementById('platform');
const durationInput = document.getElementById('duration');
const itemsList = document.getElementById('items');

addBtn.addEventListener('click', () => {
  wizard.classList.remove('hidden'); // Abre el wizard
  document.getElementById('step1').classList.remove('hidden'); // Muestra el primer paso
});

window.addEventListener('DOMContentLoaded', () => {
  wizard.classList.add('hidden'); // Oculta el wizard
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden')); // Asegura que los pasos estén ocultos
});

wizardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value;
  const platform = platformInput.value;
  const duration = durationInput.value;

  firebase.database().ref('pelis-series').push({ name, platform, duration });

  wizardForm.reset();
  wizard.classList.add('hidden');
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
});

document.getElementById('next1').addEventListener('click', () => {
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
});

document.getElementById('next2').addEventListener('click', () => {
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step3').classList.remove('hidden');
});

// Fetch data from Firebase
// Actualiza los elementos de la lista
// Actualiza los elementos de la tabla
firebase.database().ref('pelis-series').on('value', (snapshot) => {
  itemsList.innerHTML = ''; // Limpia el contenido previo
  snapshot.forEach(item => {
    const data = item.val();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${data.name}</td>
      <td>${data.platform}</td>
      <td>${data.duration}</td>
    `;
    itemsList.appendChild(row);
  });
});



