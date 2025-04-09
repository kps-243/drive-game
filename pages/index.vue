<template>
    <!-- Phase de sélection des joueurs -->
    <div v-if="phase === 'selection'" class="p-4">
      <h2 class="text-xl font-bold mb-2">Sélection du mode</h2>
      <label class="block mb-2">
        Nombre de joueurs :
        <input type="number" v-model="nbJoueurs" min="1" max="4" class="border p-1 ml-2 w-16" />
      </label>
  
      <div v-for="(nom, index) in nbJoueurs" :key="index" class="mb-2">
        <label>
          Nom du joueur {{ index + 1 }} :
          <input v-model="nomsJoueurs[index]" class="border p-1 ml-2" />
        </label>
      </div>
  
      <button @click="commencerPartie" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Commencer le jeu
      </button>
    </div>
  
    <!-- Phase de jeu -->
    <div v-if="phase === 'jeu'" class="p-4">
      <h2 class="text-lg font-bold mb-2">Tour de : {{ joueurs[joueurActuelIndex]?.nom }}</h2>
      <p class="mb-1">Temps : {{ formatTemps(temps) }}</p>
      <p class="mb-3">Score : {{ joueurs[joueurActuelIndex]?.score }}</p>
      <div v-if="produitActuel">
          <p><strong>Produit à trouver :</strong> {{ produitActuel.nom }}</p>
          <p><strong>Adresse :</strong> {{ produitActuel.rayonId + produitActuel.emplacement }}</p>
      </div>  
      <button
          @click="modePrise = !modePrise"
          class="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 text-white rounded shadow-md"
        >
          {{ modePrise ? '🚪 Quitter mode prise' : '🛒 Activer mode prise' }}
        </button>
      <!-- Grille -->
      <div class="grid" :style="`grid-template-columns: repeat(${colonnes}, 30px);`">
        <div
          v-for="cell in grid"
          :key="`${cell.x}-${cell.y}`"
          :class="[
            'w-7 h-7 border text-xs flex items-center justify-center cursor-pointer',
            cell.type === 'rayon' ? 'bg-yellow-300' : 'bg-gray-100',
            cell.x === playerPosition.x && cell.y === playerPosition.y ? 'border-4 border-red-500' : '',
          ]"
          @click="selectCell(cell)"
        >
          {{ cell.rayonId || '' }}
        </div>
      </div>

      <!-- Détails (uniquement si en mode prise + à côté d’un rayon) -->
        <div v-if="modePrise && selectedRayon" class="details-section">
          <div class="info-panel">
            <h3>Détails du rayon {{ selectedRayon }}</h3>
            <p><strong>Position joueur :</strong> {{ playerPosition.x }} / {{ playerPosition.y }}</p>
          </div>
      
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
  
      <div class="mt-4">
        <p class="mb-2">Rayon sélectionné : {{ selectedRayon || 'Aucun' }}</p>
        <div v-if="selectedRayon">
          <label for="produit">Choisis un produit :</label>
          <select id="produit" v-model="produitSelectionne" class="border ml-2">
            <option disabled value="">-- Choisir --</option>
            <option
              v-for="produit in produitsParRayon[selectedRayon]?.produits || []"
              :key="produit.nom"
              :value="produit.nom"
            >
              {{ produit.nom }}
            </option>
          </select>
          <button @click="validerProduit" class="ml-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
            Valider
          </button>
        </div>
        <p class="mt-2 text-sm">{{ message }}</p>
      </div>
      <!-- Bouton de reprise -->
        <div v-if="jeuEnPause">
          <button @click="recommencerTour" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Joueur Suivant
          </button>
        </div>
    </div>
  
    <!-- Phase de résultat -->
    <div v-if="phase === 'resultat'" class="p-4">
      <h2 class="text-xl font-bold mb-4">🎉 Fin de la partie !</h2>
      <table class="table-auto border border-collapse w-full mb-4">
        <thead class="bg-gray-200">
          <tr>
            <th class="border px-4 py-2">Joueur</th>
            <th class="border px-4 py-2">Score</th>
            <th class="border px-4 py-2">Temps</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="joueur in joueurs.slice().sort((a, b) => b.score - a.score || a.temps - b.temps)"
            :key="joueur.nom"
          >
            <td class="border px-4 py-2">{{ joueur.nom }}</td>
            <td class="border px-4 py-2">{{ joueur.score }}</td>
            <td class="border px-4 py-2">{{ formatTemps(joueur.temps) }}</td>
          </tr>
        </tbody>
      </table>
  
      <button @click="phase = 'selection'" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Rejouer
      </button>
    </div>
  </template>
  
  
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import productsData from '../data/products.json'
  
  const colonnes = 20
  const lignes = 8
  const grid = []
  const produitsParRayon = ref({})
  const listeDeCourses = ref([])
  const joueurs = ref([])
  const joueurActuelIndex = ref(0)
  const score = ref(0)
  const temps = ref(0)
  const produitActuel = ref(null)
  const produitSelectionne = ref("")
  const produitActuelIndex = ref(0)
  const chronoInterval = ref(null)
  const jeuCommence = ref(false)
  const modePrise = ref(false)
  const selectedCell = ref(null)
  const selectedRayon = ref(null)
  const playerPosition = ref({ x: 0, y: 0 })
  const message = ref("")
  const nbJoueurs = ref(1)
  const nomsJoueurs = ref([])
  const phase = ref("selection") // "selection", "jeu", "resultat"
  const jeuEnPause = ref(false)

  function formatTemps(temps) {
    const minutes = Math.floor(temps / 6000)
    const secondes = Math.floor((temps % 6000) / 100)
    const centiemes = temps % 100
    return `${String(minutes).padStart(2, '0')}:${String(secondes).padStart(2, '0')}:${String(centiemes).padStart(2, '0')}`
  }
  
  function commencerPartie() {
    phase.value = 'jeu'
    joueurs.value = nomsJoueurs.value.map(nom => ({
      nom,
      score: 0,
      temps: 0,
      listeDeCourses: [],
      produitActuelIndex: 0
    }))
    joueurActuelIndex.value = 0
    initialiserTour()
  }
  
  function initialiserTour() {
  produitSelectionne.value = ""
  const joueur = joueurs.value[joueurActuelIndex.value]
  joueur.score = 0
  joueur.produitActuelIndex = 0
  joueur.listeDeCourses = genererListeDeCourses()
  produitActuel.value = joueur.listeDeCourses[joueur.produitActuelIndex]
  score.value = 0
  temps.value = 0
  jeuCommence.value = true

  chronoInterval.value = setInterval(() => {
    if (!jeuEnPause.value) {
      temps.value++
    }
  }, 10)
}
  
  function genererListeDeCourses() {
    const tousLesProduits = []
    for (const rayonId in productsData) {
      const produits = productsData[rayonId].produits || productsData[rayonId]
      produits.forEach(produit => {
        tousLesProduits.push({
          ...produit,
          rayonId,
          position: { x: productsData[rayonId].x, y: productsData[rayonId].y }
        })
      })
    }
    return tousLesProduits.sort(() => 0.5 - Math.random()).slice(0, 2)
  }
  
  function validerProduit() {
    const joueur = joueurs.value[joueurActuelIndex.value]
    const produit = joueur.listeDeCourses[joueur.produitActuelIndex]
    const estCorrect = produitSelectionne.value === produit.nom
  
    if (estCorrect) {
      message.value = `✅ Bon produit trouvé : ${produit.nom}`
      joueur.score++
      joueur.produitActuelIndex++
      produitSelectionne.value = ""
  
      if (joueur.produitActuelIndex >= joueur.listeDeCourses.length) {
        joueur.temps = temps.value
        clearInterval(chronoInterval.value)
        passerAuJoueurSuivant()
        return
      } else {
        produitActuel.value = joueur.listeDeCourses[joueur.produitActuelIndex]
      }
    } else {
      message.value = `❌ Mauvais produit. Produit attendu : ${produit.nom}`
    }
  
    setTimeout(() => { message.value = "" }, 2000)
  }
  
  function passerAuJoueurSuivant() {
    joueurActuelIndex.value++
    if (joueurActuelIndex.value >= joueurs.value.length) {
      phase.value = "resultat"
      jeuCommence.value = false
    } else {
      // Mise en pause après chaque tour
      jeuEnPause.value = true
      clearInterval(chronoInterval.value)
    }
  }
  
  function recommencerTour() {
    jeuEnPause.value = false
    initialiserTour() // Démarre le tour du joueur actuel
  }

  
  onMounted(() => {
    produitsParRayon.value = productsData
    for (let y = 0; y < lignes; y++) {
      for (let x = 0; x < colonnes; x++) {
        grid.push({
          x,
          y,
          adresse: `Cell${x + 1}-${y + 1}`,
          type: 'chemin',
        })
      }
    }
    for (const rayonKey in productsData) {
      const { x, y } = productsData[rayonKey]
      const cell = grid.find(cell => cell.x === x && cell.y === y)
      if (cell) {
        cell.type = 'rayon'
        cell.rayonId = rayonKey
      }
    }
  
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') movePlayer(0, -1)
      if (e.key === 'ArrowDown') movePlayer(0, 1)
      if (e.key === 'ArrowLeft') movePlayer(-1, 0)
      if (e.key === 'ArrowRight') movePlayer(1, 0)
    })
  })
  
  let canMove = true
  function movePlayer(xDelta, yDelta) {
    if (!canMove) return
    const newX = playerPosition.value.x + xDelta
    const newY = playerPosition.value.y + yDelta
    const newCell = grid.find(c => c.x === newX && c.y === newY)
  
    if (newCell && newCell.type === 'chemin') {
      playerPosition.value = { x: newX, y: newY }
      selectedCell.value = newCell
      if (modePrise.value) {
        canMove = false
        setTimeout(() => { canMove = true }, 400)
        const voisins = [
          getCell(newX - 1, newY),
          getCell(newX + 1, newY),
          getCell(newX, newY - 1),
          getCell(newX, newY + 1)
        ]
        const rayonCible = voisins.find(c => c?.type === 'rayon')
        selectedRayon.value = rayonCible?.rayonId || null
      }
    }
  }
  
  function getCell(x, y) {
    return grid.find(c => c.x === x && c.y === y)
  }
  
  function selectCell(cell) {
    selectedCell.value = cell
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
  