<template>
    <div class="store-container">
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
          <div v-if="playerPosition?.x === cell.x && playerPosition?.y === cell.y" class="player-icon">⬤</div>
        </div>
      </div>
  
      <!-- Infos + action -->
      <div class="right-panel">
        <div class="info-panel" v-if="selectedCell">
          <h3>Détails de la case</h3>
          <p><strong>Adresse :</strong> {{ selectedCell.adresse || 'N/A' }}</p>
          <p><strong>Type :</strong> {{ selectedCell.type }}</p>
          <button @click="modePrise = !modePrise">{{ modePrise ? 'Quitter mode prise' : 'Activer mode prise' }}</button>
        </div>
  
        <div v-if="modePrise && selectedRayon && produitsParRayon[selectedRayon]" class="product-panel">
          <h3>Produits dans {{ selectedRayon }}</h3>
          <ul>
            <li v-for="(produit, index) in produitsParRayon[selectedRayon]" :key="index">
              {{ produit.nom }} - {{ produit.quantite }}
            </li>
          </ul>
        </div>
      </div>
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
function setRayon(x, y) {
  const cell = grid.find(cell => cell.x === x && cell.y === y)
  if (cell) {
    cell.type = 'rayon' // Modifie le type de la cellule en "rayon"
  }
}

// Exemple de fonction pour changer le type de retour à "chemin"
function setChemin(x, y) {
  const cell = grid.find(cell => cell.x === x && cell.y === y)
  if (cell) {
    cell.type = 'chemin' // Modifie le type de la cellule en "chemin"
  }
};

for (const rayonKey in productsData) {
  const { x, y } = productsData[rayonKey]
  setRayon(x, y)
}

console.log(grid)
  // Utiliser les données importées depuis products.json
  const produitsParRayon = ref({})
  
  // Charger les produits lors du montage du composant
  onMounted(() => {
    // Vérifier que les données sont bien chargées
    console.log('Produits chargés:', productsData)
  
    // Assigner les produits aux rayons
    produitsParRayon.value = productsData
  
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
  
  function movePlayer(xDelta, yDelta) {
    const newX = playerPosition.value.x + xDelta
    const newY = playerPosition.value.y + yDelta
    const newCell = getCell(newX, newY)
    if (newCell && newCell.type === 'chemin') {
      playerPosition.value = { x: newX, y: newY }
      selectedCell.value = newCell
  
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
  </script>
  
  <style scoped>
  .store-container {
    display: flex;
    gap: 20px;
    padding: 20px;
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
  
  .info-panel,
  .product-panel {
    width: 250px;
    background: #fff;
    border: 1px solid #ddd;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
  }
  </style>
  