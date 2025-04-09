<template>
    <div class="store-container">
        <div class="score">
          <h2>Score : {{ score }}</h2>
        </div>
      <!-- Grille -->
      <div class="store-grid">
        <div
          v-for="(cell, index) in grid"
          :key="index"
          class="grid-cell"
          :class="{
            selected: selectedCell?.adresse === cell.adresse,
            player: playerPosition?.x === cell.x && playerPosition?.y === cell.y,
            rayon: cell.type === 'rayon'
          }"
          @click="selectCell(cell)"
        >
          <div v-if="cell.type === 'rayon'">{{ cell.rayonId }}</div>
          <div v-if="playerPosition?.x === cell.x && playerPosition?.y === cell.y" :class="{ 'slow-mode': modePrise }" class="player-icon">⬤</div>
        </div>
      </div>
  
      <!-- Bouton d'action -->
      <div class="action-panel">
        <button @click="modePrise = !modePrise">
          {{ modePrise ? 'Quitter mode prise' : 'Activer mode prise' }}
        </button>
      </div>
  
      <!-- Détails (uniquement si en mode prise + à côté d’un rayon) -->
      <div v-if="modePrise && selectedRayon" class="details-section">
  <div class="info-panel">
    <h3>Détails du rayon {{ selectedRayon }}</h3>
    <p><strong>Position joueur :</strong> {{ playerPosition.x }} / {{ playerPosition.y }}</p>
  </div>

  <div v-if="produitsParRayon[selectedRayon]" class="product-panel">
    <h3>Choisis le bon produit :</h3>
    <div v-if="produitsParRayon[selectedRayon]?.produits" class="product-panel">
      <h3>Choisis le bon produit :</h3>
      <select v-model="produitSelectionne" @change="validerProduit">
        <option disabled value="">-- Sélectionner un produit --</option>
        <option
          v-for="(produit, index) in produitsParRayon[selectedRayon].produits"
          :key="index"
          :value="produit.nom"
        >
          {{ produit.nom }} - {{ produit.quantite }}
        </option>
      </select>
    </div>
          </div>
        </div>
        <div v-if="produitActuel">
          <p><strong>Produit à trouver :</strong> {{ produitActuel.nom }}</p>
          <p><strong>Rayon :</strong> {{ produitActuel.rayonId }}</p>
          <p><strong>Emplacement :</strong> {{ produitActuel.emplacement }}</p>
          <p class="mt-2 text-lg font-semibold" :class="message.startsWith('✅') ? 'text-green-600' : 'text-red-600'">
            {{ message }}
          </p>

        </div>
        <button @click="validerProduit">Valider</button>

    </div>
  </template>
  
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import productsData from '../data/products.json' // Assure-toi que le chemin du fichier est correct
  
  const selectedCell = ref(null)
const playerPosition = ref({ x: 0, y: 0 })
const selectedRayon = ref(null)
const modePrise = ref(false)

const colonnes = 20 // 20 colonnes
const lignes = 8 // 8 lignes
const grid = []
const listeDeCourses = ref([])
const produitSelectionne = ref("")
const produitActuelIndex = ref(0)
const score = ref(0)
const message = ref("")

const produitActuel = computed(() => listeDeCourses.value[produitActuelIndex.value])

function genererListeDeCourses() {
  const tousLesProduits = []

  for (const rayonId in productsData) {
    const produits = productsData[rayonId].produits || productsData[rayonId] // selon structure
    produits.forEach(produit => {
      tousLesProduits.push({
        ...produit,
        rayonId,
        position: { x: productsData[rayonId].x, y: productsData[rayonId].y }
      })
    })
  }

  // Mélanger les produits
  const produitsMelanges = tousLesProduits.sort(() => 0.5 - Math.random())

  // En prendre 20 max
  listeDeCourses.value = produitsMelanges.slice(0, 20)
  produitActuelIndex.value = 0
}
// Créer une grille vide avec 20 colonnes et 8 lignes
for (let y = 0; y < lignes; y++) {
  for (let x = 0; x < colonnes; x++) {
    grid.push({
      x,
      y,
      adresse: `Cell${x + 1}-${y + 1}`,
      type: 'chemin', // Par défaut, chaque cellule est un "chemin"
    })
  }
}

// Exemple de fonction pour changer le type d'une cellule (pour placer un rayon par exemple)
for (const rayonKey in productsData) {
  const { x, y } = productsData[rayonKey]
  const cell = grid.find(cell => cell.x === x && cell.y === y)
  if (cell) {
    cell.type = 'rayon'
    cell.rayonId = rayonKey // <== On garde l'id du rayon (F00, F01...) ici
  }
}


// Exemple de fonction pour changer le type de retour à "chemin"
function setChemin(x, y) {
  const cell = grid.find(cell => cell.x === x && cell.y === y)
  if (cell) {
    cell.type = 'chemin' // Modifie le type de la cellule en "chemin"
  }
};

console.log(grid)
  // Utiliser les données importées depuis products.json
  const produitsParRayon = ref({})
  
  // Charger les produits lors du montage du composant
  onMounted(() => {
    // Vérifier que les données sont bien chargées
    console.log('Produits chargés:', productsData)
  
    // Assigner les produits aux rayons
    produitsParRayon.value = productsData
  genererListeDeCourses()
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') movePlayer(0, -1)
      if (e.key === 'ArrowDown') movePlayer(0, 1)
      if (e.key === 'ArrowLeft') movePlayer(-1, 0)
      if (e.key === 'ArrowRight') movePlayer(1, 0)
    })
  })
  
  function getCell(x, y) {
    return grid.find(c => c.x === x && c.y === y)
  }
  
  // Charger les produits lors du montage du composant
  let canMove = true // Contrôle si le joueur peut se déplacer

function movePlayer(xDelta, yDelta) {
  if (!canMove) return // Bloque le déplacement si on est en attente

  const newX = playerPosition.value.x + xDelta
  const newY = playerPosition.value.y + yDelta
  const newCell = getCell(newX, newY)

  if (newCell && newCell.type === 'chemin') {
    playerPosition.value = { x: newX, y: newY }
    selectedCell.value = newCell

    if (modePrise.value) {
      // Lancer une animation de ralentissement (simulation par un timeout)
      canMove = false
      setTimeout(() => {
        canMove = true
      }, 400) // 400ms de délai entre les déplacements
    }

    if (modePrise.value) {
      const voisins = [
        getCell(newX - 1, newY),
        getCell(newX + 1, newY),
        getCell(newX, newY - 1),
        getCell(newX, newY + 1)
      ]
      const rayonCible = voisins.find(c => c?.type === 'rayon')
      if (rayonCible) {
        selectedRayon.value = rayonCible.rayonId
      } else {
        selectedRayon.value = null
      }
    }
  }
}

  
  function selectCell(cell) {
    selectedCell.value = cell
  }
  function validerProduit() {
  if (!produitActuel.value || !produitSelectionne.value) return

  const estCorrect = produitSelectionne.value === produitActuel.value.nom

  if (estCorrect) {
    message.value = `✅ Bon produit trouvé : ${produitActuel.value.nom}`
    setTimeout(() => {
      message.value = ""
    }, 2000)
    score.value++
    produitActuelIndex.value++
    produitSelectionne.value = ""
  } else {
    message.value = `❌ Mauvais produit. Produit attendu : ${produitActuel.value.nom}`
    setTimeout(() => {
      message.value = ""
    }, 2000)
  }
}

  </script>
  
  <style scoped>

.store-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
  .store-grid {
    display: grid;
    grid-template-columns: repeat(20, 60px);
    grid-template-rows: repeat(8, 60px);
    gap: 6px;
  }
  
  .grid-cell {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 10px;
    user-select: none;
    transition: all 0.2s;
    position: relative;
    text-align: center;
    cursor: pointer;
    flex-direction: column;
  }
  
  .grid-cell.rayon {
    background-color: #d1d5db;
  }
  
  .grid-cell.selected {
    background-color: #4ade80;
    border: 2px solid #16a34a;
    color: white;
  }
  
  .grid-cell.player {
    border: 2px dashed #38bdf8;
  }
  
  .player-icon {
    font-size: 18px;
    animation: pop 0.3s ease;
  }
  .slow-mode .player-icon {
  animation: slow-blink 1s infinite;
}

@keyframes slow-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

  
  @keyframes pop {
    0% {
      transform: scale(0.7);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
 

.details-section {
  margin-top: 1rem;
  width: 100%;
  max-width: 600px;
}

.info-panel, .product-panel {
  background: #f4f4f4;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
}

  </style>
  