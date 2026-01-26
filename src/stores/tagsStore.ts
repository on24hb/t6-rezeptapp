import { defineStore } from 'pinia'
import { ref } from 'vue'

const DEFAULT_TAGS = [
  'Vegan',
  'Vegetarisch',
  'Schnell',
  'Pasta',
  'Herzhaft',
  'Süß',
  'Low Carb'
]

export const useTagsStore = defineStore('tagsStore', () => {
  const tags = ref<string[]>(DEFAULT_TAGS)
  const STORAGE_KEY = 'recipe_tags'

  const loadTags = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        tags.value = JSON.parse(stored)
      } catch {
        tags.value = DEFAULT_TAGS
      }
    }
  }

  const saveTags = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags.value))
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.value.includes(tag.trim())) {
      tags.value.push(tag.trim())
      saveTags()
    }
  }

  const removeTag = (tag: string) => {
    tags.value = tags.value.filter(t => t !== tag)
    saveTags()
  }

  const resetToDefaults = () => {
    tags.value = DEFAULT_TAGS
    saveTags()
  }

  loadTags()

  return {
    tags,
    addTag,
    removeTag,
    resetToDefaults
  }
})
