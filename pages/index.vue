<template>
    <div class="relative h-screen bg-cover bg-center bg-no-repeat bg-image">
  <!-- Overlay semi-transparent pour lisibilité -->
  <div class="absolute inset-0 bg-white bg-opacity-70"></div>

  <!-- Contenu centré -->
  <div class="relative z-10 h-full flex flex-col justify-center items-center overflow-y-auto p-6">
    
    <!-- Phase de sélection -->
    <transition name="fade-resize" mode="out-in" appear>
      <div
        v-if="phase === 'selection'"
        :key="nbJoueurs"
        class="w-full max-w-md bg-white backdrop-blur-md p-8 rounded-2xl shadow-2xl"
      >
        <h2 class="text-3xl font-bold text-red-600 mb-6 text-center">🛒 Sélection du mode</h2>

        <label class="block mb-4">
          <span class="font-semibold">Nombre de joueurs :</span>
          <input
            type="number"
            v-model="nbJoueurs"
            min="1"
            max="4"
            class="border rounded px-3 py-2 mt-1 w-full"
          />
        </label>

        <transition-group
          name="fade"
          tag="div"
          class="space-y-3 mb-6"
          appear
        >
          <div
            v-for="(nom, index) in nbJoueurs"
            :key="index"
            class="mb-3"
          >
            <label class="block font-medium">
              👤 Joueur {{ index + 1 }} :
              <input
                v-model="nomsJoueurs[index]"
                class="mt-1 border rounded px-3 py-2 w-full"
              />
            </label>
          </div>
        </transition-group>

        <button
          @click="commencerPartie"
          class="w-full bg-red-600 text-white font-semibold py-3 rounded-xl mt-4 hover:bg-red-700 transition"
        >
          ▶️ Commencer le jeu
        </button>
      </div>
    </transition>

    <!-- Phase de jeu -->
    <div v-if="phase === 'jeu'" class="w-full max-w-4xl bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-8">
  <div class="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-600 space-y-4">
    <h2 class="text-2xl font-bold text-gray-800">
      🎮 Tour de : <span class="text-red-600">{{ joueurs[joueurActuelIndex]?.nom }}</span>
    </h2>
    <div class="flex items-center justify-between">
      <p>⏱ Temps : <strong>{{ formatTemps(temps) }}</strong></p>
      <p>🏆 Score : <strong>{{ joueurs[joueurActuelIndex]?.score }}</strong></p>
    </div>

    <div v-if="produitActuel" class="bg-red-50 p-4 rounded-lg border border-red-200 shadow-inner text-center space-y-3">
  <h3 class="text-lg font-semibold text-red-700 flex justify-center items-center gap-2">
    🧺 Produit à trouver :
    <span class="text-xl font-bold text-red-900">{{ produitActuel.nom }}</span>
  </h3>
  <p class="text-gray-700 text-sm flex justify-center items-center gap-1">
    📍 Adresse :
    <span class="bg-red-100 text-red-800 font-bold px-2 py-1 rounded">
      {{ produitActuel.rayonId + produitActuel.emplacement }}
    </span>
  </p>
</div>

<div class="flex justify-center">
  <button
    @click="modePrise = !modePrise"
    class="mt-4 bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition"
  >
    {{ modePrise ? '🚪 Quitter mode prise' : '🛒 Activer mode prise' }}
  </button>
</div>

  </div>

  <div v-if="decompteActif" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="text-white text-6xl font-bold animate-bounce">
        {{ decompte }}
    </div>
  </div>
  <!-- Grille centrée -->
  <div class="flex justify-center">
    <div class="grid gap-2" :style="`grid-template-columns: repeat(${colonnes}, 30px);`">
      <div
        v-for="cell in grid"
        :key="`${cell.x}-${cell.y}`"
        :class="[
          'w-8 h-8 text-xs flex items-center justify-center rounded shadow-sm transition-all duration-200',
          cell.type === 'rayon' ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-100',
          cell.x === playerPosition.x && cell.y === playerPosition.y ? 'ring-2 ring-red-500' : ''
        ]"
      >
        {{ cell.rayonId || '' }}
      </div>
    </div>
  </div>


      <!-- Mode prise -->
      <div v-if="modePrise && selectedRayon" class="bg-yellow-100 p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-yellow-700">📦 Rayon {{ selectedRayon }}</h3>
        <p>🧍 Position joueur : {{ playerPosition.x }} / {{ playerPosition.y }}</p>

        <div v-if="produitsParRayon[selectedRayon]?.produits" class="mt-2">
          <label class="block font-medium mb-1">🛍 Choisis un produit :</label>
          <select v-model="produitSelectionne" @change="validerProduit" class="w-full p-2 rounded border">
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

      <!-- Bouton suivant -->
      <div v-if="jeuEnPause" class="text-center">
        <button
          @click="recommencerTour"
          class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          👉 Joueur Suivant
        </button>
      </div>
    </div>

    <!-- Résultat -->
    <!-- Phase de résultat -->
<div v-if="phase === 'resultat'" class="p-6 max-w-3xl mx-auto space-y-6 bg-white shadow rounded-2xl backdrop-blur-md">
  <h2 class="text-3xl font-bold text-green-700 text-center">🎉 Fin de la partie !</h2>

  <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow text-center">
    <p class="text-xl font-semibold text-green-800">
      🏆 Gagnant : 
      <span class="font-bold text-green-900">
        {{
          joueurs
            .slice()
            .sort((a, b) => b.score - a.score || a.temps - b.temps)[0].nom
        }}
      </span>
      avec 
      <span class="font-bold">{{ joueurs.slice().sort((a, b) => b.score - a.score || a.temps - b.temps)[0].score }}</span> 
      points en 
      <span class="font-bold">{{ formatTemps(joueurs.slice().sort((a, b) => b.score - a.score || a.temps - b.temps)[0].temps) }}</span>
    </p>
  </div>

  <table class="w-full table-auto border-collapse">
    <thead class="bg-gray-200">
      <tr>
        <th class="border px-4 py-2 text-left">👤 Joueur</th>
        <th class="border px-4 py-2 text-left">🏆 Score</th>
        <th class="border px-4 py-2 text-left">⏱ Temps</th>
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

  <div class="text-center">
    <button
      @click="() => {
        nomsJoueurs = []
        nbJoueurs = 1
        phase = 'selection'
      }"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      🔁 Rejouer
    </button>
  </div>
</div>

  </div>
</div>
</template>
  
  
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import productsData from '../data/products.json'

  const colonnes = 20
  const lignes = 10
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
  const decompte = ref(3)
  const decompteActif = ref(false)

    watch(modePrise, (isActive) => {
      if (isActive) {
        const { x, y } = playerPosition.value
        const voisins = [
          getCell(x - 1, y),
          getCell(x + 1, y),
          getCell(x, y - 1),
          getCell(x, y + 1)
        ]
        const rayonCible = voisins.find(c => c?.type === 'rayon')
        selectedRayon.value = rayonCible?.rayonId || null
      } else {
        selectedRayon.value = null
      }
    })

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
  
  async function initialiserTour() {
  produitSelectionne.value = ""
  modePrise.value = false
  playerPosition.value = { x: 0, y: 0 }

  const joueur = joueurs.value[joueurActuelIndex.value]
  joueur.score = 0
  joueur.produitActuelIndex = 0
  joueur.listeDeCourses = genererListeDeCourses()
  produitActuel.value = joueur.listeDeCourses[joueur.produitActuelIndex]

  score.value = 0
  temps.value = 0
  jeuCommence.value = false
  jeuEnPause.value = true

  // Décompte
  decompteActif.value = true
  decompte.value = 3

  const interval = setInterval(() => {
    decompte.value--
    if (decompte.value === 0) {
      clearInterval(interval)
      decompteActif.value = false
      jeuCommence.value = true
      jeuEnPause.value = false

      chronoInterval.value = setInterval(() => {
        if (!jeuEnPause.value) {
          temps.value++
        }
      }, 10)
    }
  }, 1000)
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
.bg-image{
    background-image: url("./../assets/images/auchan-fond.png");
}

.fade-enter-active,
.fade-leave-active,
.fade-resize-enter-active,
.fade-resize-leave-active {
  transition: all 0.4s ease;
}

.fade-enter-from,
.fade-leave-to,
.fade-resize-enter-from,
.fade-resize-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}


  </style>
  