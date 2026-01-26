<template>
  <div class="cooking-mode-card">
    <div class="card-content">
      <div class="icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mode-icon">
          <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11-7.36a1 1 0 0 0 0-1.72l-11-7.36a1 1 0 0 0-1.5.86z" />
        </svg>
      </div>
      <div class="info-text">
        <span class="badge">Interaktiv</span>
        <h3>Schritt-für-Schritt kochen</h3>
        <p v-if="stepCount > 0">Starte die geführte Anleitung für alle {{ stepCount }} Schritte.</p>
        <p v-else>Lass dich entspannt durch die Zubereitung führen.</p>
      </div>
    </div>
    <button class="btn-start-mode" @click="$emit('start')">
      Modus starten
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stepCount: number;
}>();
defineEmits(['start']);
</script>

<style scoped>
.cooking-mode-card {
  margin: 2.5rem auto;
  width: 100%;
  max-width: 800px;
  padding: 1.5rem;
  box-sizing: border-box;
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--primary-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-wrapper {
  background-color: rgba(66, 185, 131, 0.1);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mode-icon {
  width: 20px;
  height: 20px;
  fill: var(--primary-color);
}

.info-text h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.badge {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-text p {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: #666;
}

.btn-start-mode {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
}

@media (min-width: 600px) {
  .cooking-mode-card { flex-direction: row; align-items: center; justify-content: space-between; }
  .btn-start-mode { width: auto; padding: 0.75rem 2rem; }
}
</style>
