<template>
  <main class="settings-page">
    <h1>Einstellungen</h1>

    <div class="settings-card">
      <h2>Kategorien verwalten</h2>
      <p>Diese Kategorien stehen dir beim Erstellen und Filtern von Rezepten zur Verfügung.</p>

      <div class="add-category-section">
        <input
          v-model="newTag"
          type="text"
          placeholder="Neue Kategorie..."
          class="input-field"
          @keyup.enter="addNewTag"
        />
        <button @click="addNewTag" class="btn-add">
          Hinzufügen
        </button>
      </div>

      <div class="tags-list">
        <div v-for="tag in store.tags" :key="tag" class="tag-item">
          <span class="tag-name">{{ tag }}</span>
          <button @click="deleteTag(tag)" class="btn-delete" :title="`${tag} entfernen`">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <router-link to="/" class="btn-back">Zurück zur Startseite</router-link>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTagsStore } from '@/stores/tagsStore'

const store = useTagsStore()
const newTag = ref('')

const addNewTag = () => {
  if (newTag.value.trim()) {
    store.addTag(newTag.value)
    newTag.value = ''
  }
}

const deleteTag = (tag: string) => {
  if (confirm(`Möchtest du die Kategorie "${tag}" wirklich löschen?`)) {
    store.removeTag(tag)
  }
}
</script>

<style scoped>
.settings-page {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
}

.settings-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border: 1px solid #ddd;
}

h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

p {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.add-category-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.input-field {
  flex: 1;
  padding: 0.8rem;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fafafa;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: #fff;
}

.btn-add {
  padding: 0.8rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-add:hover {
  background: #3d5aa8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.tags-list {
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: #f0f4ff;
  border: 1.5px solid #8873e6;
  border-radius: 8px;
  color: #4868d1;
  font-weight: 500;
}

.tag-name {
  flex: 1;
}

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #da6834;
}

.btn-delete svg {
  width: 18px;
  height: 18px;
}

.btn-delete:hover {
  transform: scale(1.15);
  color: #ff5252;
}

.btn-reset {
  width: 100%;
  padding: 0.8rem;
  background: #999;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-bottom: 2rem;
}

.btn-reset:hover {
  background: #888;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-back {
  display: block;
  text-align: center;
  padding: 0.8rem;
  background: #4868d1;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: #405cb8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 600px) {
  .settings-page {
    padding: 1rem;
  }

  .settings-card {
    padding: 1.5rem;
    width: calc(100% - 2rem);
    box-sizing: border-box;
    margin: 0 auto 1.5rem;
  }

  .add-category-section {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .input-field {
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  .btn-add {
    width: 100%;
    padding: 0.8rem;
    font-size: 1rem;
    align-self: stretch;
  }

  .tags-list {
    gap: 0.5rem;
  }

  .tag-item {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
