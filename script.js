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
const closeWizardButton = document.getElementById('close-wizard');
const wizardNameInput = document.getElementById('wizard-name');
const wizardPlatformInput = document.getElementById('wizard-platform');
const wizardDurationInput = document.getElementById('wizard-duration');
const addItemButton = document.getElementById('add-item-button');

// Sección completadas
const showCompletedButton = document.getElementById('showCompleted');
const completedSection = document.getElementById('completed-section');
const completedTable = document.getElementById('completed-table').querySelector('tbody');
const completedThead = document.querySelector('#completed-table thead');

// Lista de Pelis/Series
const itemsList = document.getElementById('items');

// Variable para rastrear el paso actual
let currentStep = 1;

// Mostrar el wizard al hacer clic en 'Afegir Peli/Serie'
addBtn.addEventListener('click', () => {
  wizard.classList.remove('hidden');
  wizard.classList.add('visible');
  showStep(1); // Muestra el paso 1
});

// Al cargar la página, ocultamos todo
window.addEventListener('DOMContentLoaded', () => {
  wizard.classList.add('hidden');
  wizard.classList.remove('visible');
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
});

// Función para mostrar pasos
function showStep(n) {
  // Ocultar todos los pasos
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
  
  // Mostrar el paso correspondiente
  const stepToShow = document.getElementById(n === 1 ? 'step-name' : n === 2 ? 'step-platform' : 'step-duration');
  if (stepToShow) {
    stepToShow.classList.remove('hidden');
    currentStep = n;
  }
}

// Cerrar el wizard con el botón X
closeWizardButton.addEventListener('click', () => {
  wizard.classList.add('hidden');
  wizard.classList.remove('visible');
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
});

// Cerrar el wizard con la tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && wizard.classList.contains('visible')) {
    wizard.classList.add('hidden');
    wizard.classList.remove('visible');
    document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
  }
});

// Avanzar de paso 1 a 2
const nextPlatformButton = document.querySelector('.next-button[data-next="step-platform"]');
if (nextPlatformButton) {
  nextPlatformButton.addEventListener('click', () => {
    if (!wizardNameInput.value.trim()) {
      alert("Si us plau, introdueix el nom de la pel·lícula/sèrie.");
      return;
    }
    showStep(2);
  });
}

// Avanzar de paso 2 a 3
const nextDurationButton = document.querySelector('.next-button[data-next="step-duration"]');
if (nextDurationButton) {
  nextDurationButton.addEventListener('click', () => {
    if (!wizardPlatformInput.value.trim()) {
      alert("Si us plau, introdueix la plataforma.");
      return;
    }
    showStep(3);
  });
}

// Al hacer clic en 'Guardar'
addItemButton.addEventListener('click', async () => {
  const name = wizardNameInput.value.trim();
  const platform = wizardPlatformInput.value.trim();
  const duration = wizardDurationInput.value.trim();
  
  if (!name || !platform || !duration) {
    alert("Si us plau, completa tots els camps.");
    return;
  }

  try {
    // Agregar a Firebase Database
    const newItemRef = db.ref('pelis-series').push();
    await newItemRef.set({ 
      name, 
      platform, 
      duration, 
      completed: false 
    });
    
    // Reseteo y cierre wizard
    wizardNameInput.value = '';
    wizardPlatformInput.value = '';
    wizardDurationInput.value = '';
    wizard.classList.add('hidden');
    wizard.classList.remove('visible');
    document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
  } catch (error) {
    console.error("Error al agregar la película/serie:", error);
    alert("Hi ha hagut un error en afegir la pel·lícula/sèrie. Torna-ho a intentar.");
  }
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
          <button class="delete-button" data-id="${key}" title="Esborrar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M3 6h18v2H3zm3 3h12v12H6zm5-5h2v3h-2z"/>
            </svg>
          </button>
          <button class="complete-button" data-id="${key}" title="Marcar com a vist">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
            </svg>
          </button>
        </td>
      `;
      itemsList.appendChild(row);

      // Eventos de borrar y completar
      const deleteButton = row.querySelector('.delete-button');
      const completeButton = row.querySelector('.complete-button');
      if (deleteButton) {
        deleteButton.addEventListener('click', () => handleDelete(key, row));
      }
      if (completeButton) {
        completeButton.addEventListener('click', () => handleComplete(key, row));
      }
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
          <button class="delete-completed" data-id="${key}" title="Eliminar definitivament">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M3 6h18v2H3zm3 3h12v12H6zm5-5h2v3h-2z"/>
            </svg>
          </button>
        </td>
      `;
      completedTable.appendChild(row);

      // Evento para eliminar definitivamente
      const deleteCompletedButton = row.querySelector('.delete-completed');
      if (deleteCompletedButton) {
        deleteCompletedButton.addEventListener('click', () => {
          if (confirm("Eliminar aquesta pel·lícula/sèrie definitivament?")) {
            firebase.database().ref(`pelis-series/${key}`).remove();
          }
        });
      }
    }
  });

  // 4. MOSTRAR U OCULTAR THEAD Y MENSAJE "NO HAY"
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
  if (confirm("Estàs segur que vols esborrar aquesta pel·lícula/sèrie?")) {
    firebase.database().ref(`pelis-series/${id}`).remove()
      .then(() => {
        row.remove(); 
        console.log("Element eliminat correctament.");
      })
      .catch((error) => {
        console.error("Error en eliminar l'element:", error);
      });
  }
}

// Manejar completar
function handleComplete(id, row) {
  if (confirm("Marcar com a vist?")) {
    firebase.database().ref(`pelis-series/${id}`).update({ completed: true })
      .then(() => {
        row.remove();
        console.log("Marcat com a completat.");
      })
      .catch((error) => {
        console.error("Error en marcar com a completat:", error);
      });
  }
}

// Mostrar/ocultar completadas (solo alterna la visibilidad)
showCompletedButton.addEventListener('click', () => {
  completedSection.classList.toggle('hidden');
});
