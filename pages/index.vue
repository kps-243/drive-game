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
            player: playerPosition?.adresse === cell.adresse
          }"
          @click="movePlayerTo(cell)"
        >
          {{ cell.adresse }}
        </div>
      </div>
  
      <!-- Encart d'infos -->
      <div v-if="selectedCell" class="info-panel">
        <h3>Détails de la case</h3>
        <p><strong>Adresse :</strong> {{ selectedCell.adresse }}</p>
        <p><strong>Ligne :</strong> {{ selectedCell.ligne }}</p>
        <p><strong>Colonne :</strong> {{ selectedCell.colonne }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const selectedCell = ref(null)
  const playerPosition = ref(null)
  
  const lignes = ['A','B','C','D','E','F','G','H']
  const colonnes = Array.from({ length: 10 }, (_, i) => i + 1)
  const rayon = 'F'
  
  const grid = []
  
  for (let y = 0; y < lignes.length; y++) {
    for (let x = 0; x < colonnes.length; x++) {
      const adresse = `${rayon}${colonnes[x].toString().padStart(2, '0')}${lignes[y]}${x+1}`
      const cell = {
        adresse,
        ligne: lignes[y],
        colonne: x + 1
      }
      grid.push(cell)
  
      if (y === 0 && x === 0) {
        playerPosition.value = cell // position de départ
      }
    }
  }
  
  function movePlayerTo(cell) {
    playerPosition.value = cell
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
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(8, 80px);
    gap: 4px;
  }
  
  .grid-cell {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s;
  }
  
  .grid-cell.selected {
    background-color: #4ade80;
    border: 2px solid #16a34a;
    color: white;
  }
  
  .grid-cell.player {
    background-color: #2563eb;
    color: white;
    border: 2px solid #1d4ed8;
  }
  
  .info-panel {
    width: 250px;
    background: #fff;
    border: 1px solid #ddd;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
  }
  </style>
  