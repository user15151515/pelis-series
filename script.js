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

// Elementos del DOM
const addBtn = document.getElementById('addBtn');
const wizard = document.getElementById('wizard');
const wizardForm = document.getElementById('wizardForm');
const nameInput = document.getElementById('name');
const platformInput = document.getElementById('platform');
const durationInput = document.getElementById('duration');
const itemsList = document.getElementById('items');

// Botones wizard
const next1 = document.getElementById('next1');
const next2 = document.getElementById('next2');
const prev2 = document.getElementById('prev2');
const prev3 = document.getElementById('prev3');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const currentStep = document.getElementById('current-step');

// Sección completadas
const showCompletedButton = document.getElementById('showCompleted');
const completedSection = document.getElementById('completed-section');
const completedTable = document.getElementById('completed-table').querySelector('tbody');
const completedThead = document.querySelector('#completed-table thead');

// Mostrar el wizard
addBtn.addEventListener('click', () => {
  wizard.classList.remove('hidden');
  showStep(1); // Muestra el paso 1
});

// Al cargar la página, ocultamos todo
window.addEventListener('DOMContentLoaded', () => {
  wizard.classList.add('hidden');
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
});

function showStep(n) {
  // Ocultar todos los div.step
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
  
  // Remover activo/completado de todos los li.wizard-step
  document.querySelectorAll('.wizard-step').forEach(s => {
    s.classList.remove('active');
    s.classList.remove('completed');
  });
  
  // Mostrar el div.step correspondiente
  switch(n) {
    case 1:
      document.getElementById('step1').classList.remove('hidden');
      // Marcar el step 1 como activo
      document.querySelector('#wizardStep1').classList.add('active');
      break;
    case 2:
      document.getElementById('step2').classList.remove('hidden');
      // Marcar step 1 como completado
      document.querySelector('#wizardStep1').classList.add('completed');
      // Marcar step 2 como activo
      document.querySelector('#wizardStep2').classList.add('active');
      break;
    case 3:
      document.getElementById('step3').classList.remove('hidden');
      // Marcar steps 1 y 2 como completados
      document.querySelector('#wizardStep1').classList.add('completed');
      document.querySelector('#wizardStep2').classList.add('completed');
      // Marcar step 3 como activo
      document.querySelector('#wizardStep3').classList.add('active');
      break;
  }
}

// Pasar de paso 1 a 2
next1.addEventListener('click', () => {
  // Validación mínima
  if (!nameInput.value.trim()) {
    alert("Por favor, introduce un nombre.");
    return;
  }
  showStep(2);
});

// Pasar de paso 2 a 3
next2.addEventListener('click', () => {
  if (!platformInput.value.trim()) {
    alert("Por favor, introduce una plataforma.");
    return;
  }
  showStep(3);
});

// Botones de retroceso
prev2.addEventListener('click', () => showStep(1));
prev3.addEventListener('click', () => showStep(2));

// Al enviar el formulario (paso 3)
wizardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!durationInput.value.trim()) {
    alert("Por favor, introduce la duración.");
    return;
  }

  // Guardar en Firebase
  const name = nameInput.value.trim();
  const platform = platformInput.value.trim();
  const duration = durationInput.value.trim();

  firebase.database().ref('pelis-series').push({ name, platform, duration });
  
  // Reseteo y cierre
  wizardForm.reset();
  wizard.classList.add('hidden');
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
});

/* 
  SUSCRIPCIÓN EN TIEMPO REAL
  - Reconstruye la lista principal (no completadas)
  - Reconstruye la lista de completadas
*/
firebase.database().ref('pelis-series').on('value', (snapshot) => {
  // 1. LIMPIAR TABLA DE NO COMPLETADAS
  itemsList.innerHTML = '';

  // 2. LIMPIAR TABLA DE COMPLETADAS
  completedTable.innerHTML = '';
  let completedCount = 0;

  // 3. RECORRER TODOS LOS ELEMENTOS
  snapshot.forEach(item => {
    const data = item.val();
    const key = item.key;

    // 3a. SI NO ESTÁ COMPLETADA => TABLA PRINCIPAL
    if (!data.completed) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="editable-name">${data.name}</td>
        <td class="editable-platform">${data.platform}</td>
        <td class="editable-duration">${data.duration}</td>
        <td>
          <button class="delete-button" data-id="${key}" title="Borrar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M3 6h18v2H3zm3 3h12v12H6zm5-5h2v3h-2z"/>
            </svg>
          </button>
          <button class="complete-button" data-id="${key}" title="Marcar como visto">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
            </svg>
          </button>
        </td>
      `;
      itemsList.appendChild(row);

      // Eventos de borrar y completar
      row.querySelector('.delete-button').addEventListener('click', () => handleDelete(key, row));
      row.querySelector('.complete-button').addEventListener('click', () => handleComplete(key, row));
    } 
    // 3b. SI ESTÁ COMPLETADA => TABLA DE COMPLETADAS
    else {
      completedCount++;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${data.name}</td>
        <td>${data.platform}</td>
        <td>${data.duration}</td>
        <td>
          <button class="delete-completed" data-id="${key}" title="Eliminar definitivamente">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M3 6h18v2H3zm3 3h12v12H6zm5-5h2v3h-2z"/>
            </svg>
          </button>
        </td>
      `;
      completedTable.appendChild(row);

      // Evento para eliminar definitivamente
      row.querySelector('.delete-completed').addEventListener('click', (e) => {
        if (confirm("¿Eliminar esta película/serie definitivamente?")) {
          firebase.database().ref(`pelis-series/${key}`).remove();
        }
      });
    }
  });

  // 4. MOSTRAR U OCULTAR THEAD Y MENSAJE "NO HAY"
  //    (SI ESTÁ VACÍA LA LISTA DE COMPLETADAS)
  const oldMsg = document.getElementById('noCompletedMsg');
  if (oldMsg) oldMsg.remove(); // Quitar mensaje anterior, si existía

  if (completedCount === 0) {
    // Ocultar thead
    completedThead.style.display = 'none';

    // Añadir mensaje "No hi ha películes vistes"
    const noItemsMsg = document.createElement('p');
    noItemsMsg.id = 'noCompletedMsg';
    noItemsMsg.textContent = 'No hi ha películes vistes';
    noItemsMsg.style.marginTop = '10px';
    noItemsMsg.style.color = '#666';
    completedSection.appendChild(noItemsMsg);
  } else {
    // Mostrar thead
    completedThead.style.display = 'table-header-group';
  }
});

// Manejar borrado
function handleDelete(id, row) {
  if (confirm("¿Estás seguro de que quieres borrar esta película/serie?")) {
    row.remove(); 
    firebase.database().ref(`pelis-series/${id}`).remove()
      .then(() => {
        console.log("Elemento eliminado correctamente.");
      })
      .catch((error) => {
        console.error("Error al eliminar el elemento:", error);
      });
  }
}

// Manejar completar
function handleComplete(id, row) {
  if (confirm("¿Marcar como visto?")) {
    firebase.database().ref(`pelis-series/${id}`).update({ completed: true })
      .then(() => {
        console.log("Marcado como completado.");
      })
      .catch((error) => {
        console.error("Error al marcar como completado:", error);
      });
  }
}

// Mostrar/ocultar completadas (solo alterna la visibilidad)
const closeWizard = document.getElementById('closeWizard');
showCompletedButton.addEventListener('click', () => {
  completedSection.classList.toggle('hidden');
});

// Cerrar wizard con el botón X
closeWizard.addEventListener('click', () => {
  wizard.classList.add('hidden');
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
});

// Cerrar wizard con ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    wizard.classList.add('hidden');
    document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
  }
});
