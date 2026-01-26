<script setup lang="ts">
import { useTagsStore } from '@/stores/tagsStore'
import { computed } from 'vue'

const tagsStore = useTagsStore()

const props = defineProps<{
  tags?: string[]
}>()

const validTags = computed(() => {
  if (!props.tags) return []
  return props.tags.filter(tag => tagsStore.tags.includes(tag))
})
</script>

<template>
  <div v-if="validTags && validTags.length > 0" class="tags-container">
    <span v-for="tag in validTags" :key="tag" class="tag-badge">
      {{ tag }}
    </span>
  </div>
</template>

<style scoped>
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag-badge {
  background-color: #e0f2f1; /* Helles Türkis passend zum Theme */
  color: #00695c;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}
</style>