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
  itemsList.innerHTML = ''; // Limpia la tabla principal
  snapshot.forEach(item => {
      const data = item.val();
      const key = item.key; // ID único de Firebase
      if (!data.completed) { // Sólo muestra las no completadas
          const row = document.createElement('tr');
          row.innerHTML = `
          <td>${data.name}</td>
          <td>${data.platform}</td>
          <td>${data.duration}</td>
          <td>
              <button class="edit-button" data-id="${key}">
                  <img src="imagenes/lapiz.png" alt="Editar" style="width: 16px; height: 16px;">
              </button>
              <button class="delete-button" data-id="${key}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                      <path d="M3 6h18v2H3zm3 3h12v12H6zm5-5h2v3h-2z"/>
                  </svg>
              </button>
              <button class="complete-button" data-id="${key}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                      <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
                  </svg>
              </button>
          </td>
      `;
      
      
      
          itemsList.appendChild(row);
      }
  });

  // Actualiza los botones después de reconstruir la tabla
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');

        if (confirm("¿Estás seguro de que quieres borrar esta película/serie?")) {
            // Eliminar la fila del DOM
            const row = e.currentTarget.closest('tr');
            row.remove();

            // Eliminar el elemento de Firebase
            firebase.database().ref(`pelis-series/${id}`).remove()
                .then(() => {
                    console.log("Elemento eliminado correctamente de Firebase.");
                })
                .catch((error) => {
                    console.error("Error al eliminar el elemento:", error);
                });
        }
    });
});



document.querySelectorAll('.complete-button').forEach(button => {
  button.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');

      // Actualizar en Firebase: marcar como completado
      firebase.database().ref(`pelis-series/${id}`).update({ completed: true })
          .then(() => {
              console.log("Marcado como completado.");
          })
          .catch((error) => {
              console.error("Error al marcar como completado:", error);
          });
  });
});

});


const showCompletedButton = document.getElementById('showCompleted');
const completedSection = document.getElementById('completed-section');
const completedTable = document.getElementById('completed-table').querySelector('tbody');

showCompletedButton.addEventListener('click', () => {
    completedSection.classList.toggle('hidden');
    firebase.database().ref('pelis-series').once('value', (snapshot) => {
      completedTable.innerHTML = ''; // Limpiar tabla
      snapshot.forEach(item => {
          const data = item.val();
          if (data.completed) {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${data.name}</td>
                  <td>${data.platform}</td>
                  <td>${data.duration}</td>
                  <td>
                      <button class="delete-completed" data-id="${item.key}">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                              <path d="M3 6h18v2H3zm3 3h12v12H6zm5-5h2v3h-2z"/>
                          </svg>
                      </button>
                  </td>
              `;
  
              completedTable.appendChild(row);
          }
      });
  
      // Botón para eliminar definitivamente
      document.querySelectorAll('.delete-completed').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id'); // Asegura que accedemos al botón
            const row = e.target.closest('tr'); // Obtén la fila de la tabla
    
            if (confirm("¿Estás seguro de que quieres eliminar esta película/serie definitivamente?")) {
                firebase.database().ref(`pelis-series/${id}`).remove()
                    .then(() => {
                        if (row) row.remove(); // Elimina la fila del DOM
                    })
            }
        });
    });
    
  });
  
  
});


const closeWizard = document.getElementById('closeWizard');

// Cerrar el wizard al pulsar el botón de cerrar
closeWizard.addEventListener('click', () => {
  wizard.classList.add('hidden');
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
});

// Cerrar el wizard al pulsar ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    wizard.classList.add('hidden');
    document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
  }
});


document.querySelectorAll('.edit-button').forEach(button => {
  button.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const row = e.currentTarget.closest('tr');

      const editableCells = [
          { cell: row.cells[0], key: 'name' },
          { cell: row.cells[1], key: 'platform' },
          { cell: row.cells[2], key: 'duration' }
      ];

      editableCells.forEach(({ cell, key }) => {
          const originalValue = cell.textContent.trim();

          // Crear input editable
          const input = document.createElement('input');
          input.type = "text";
          input.value = originalValue;
          input.classList.add('edit-input');
          cell.innerHTML = ""; // Vaciar celda
          cell.appendChild(input);

          // Guardar cambios al perder foco o presionar Enter
          const saveChanges = () => {
              const newValue = input.value.trim();
              if (newValue !== originalValue) {
                  const updateData = {};
                  updateData[key] = newValue;
                  firebase.database().ref(`pelis-series/${id}`).update(updateData)
                      .then(() => {
                          cell.textContent = newValue;
                      })
                      .catch(error => console.error("Error al guardar cambios:", error));
              } else {
                  cell.textContent = originalValue;
              }
          };

          input.addEventListener('blur', saveChanges);
          input.addEventListener('keydown', (event) => {
              if (event.key === 'Enter') input.blur();
          });

          input.focus(); // Enfocar el input
      });
  });
});


