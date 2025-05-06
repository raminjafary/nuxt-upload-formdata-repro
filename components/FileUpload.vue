<template>
  <div class="file-upload">
    <div 
      class="upload-area"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      :class="{ 'is-dragging': isDragging }"
    >
      <input
        type="file"
        ref="fileInput"
        @change="handleFileSelect"
        class="file-input"
        :accept="accept"
      />
      <div class="upload-content">
        <div v-if="!isUploading && !uploadedFile">
          <i class="upload-icon">📁</i>
          <p>Drag and drop your file here or click to browse</p>
          <p class="file-types">Accepted types: {{ accept }}</p>
        </div>
        <div v-else-if="isUploading" class="uploading">
          <p>Uploading...</p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: `${uploadProgress}%` }"></div>
          </div>
        </div>
        <div v-else-if="uploadedFile" class="uploaded">
          <p>File uploaded successfully!</p>
          <p class="file-name">{{ uploadedFile.name }}</p>
          <button @click="resetUpload" class="reset-btn">Upload Another</button>
        </div>
      </div>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  accept: {
    type: String,
    default: 'image/*,.pdf,.doc,.docx'
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  }
})

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadedFile = ref<File | null>(null)
const error = ref('')

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file instanceof File) {
    handleFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file instanceof File) {
    handleFile(file)
  }
}

const handleFile = async (file: File) => {
  error.value = ''
  
  if (file.size > props.maxSize) {
    error.value = `File size exceeds ${props.maxSize / (1024 * 1024)}MB limit`
    return
  }

  isUploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('file', file)

    const { data, error: fetchError } = await useFetch('/api/upload', {
      method: 'POST',
      body: formData,
      onRequest: () => {
        const interval = setInterval(() => {
          if (uploadProgress.value < 90) {
            uploadProgress.value += 10
          }
        }, 200)
        
        return () => clearInterval(interval)
      }
    })

    if (fetchError.value) {
      throw new Error(fetchError.value.message)
    }

    uploadProgress.value = 100
    uploadedFile.value = file
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Upload failed'
  } finally {
    isUploading.value = false
  }
}

const resetUpload = () => {
  uploadedFile.value = null
  uploadProgress.value = 0
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>

<style scoped>
.file-upload {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.upload-area.is-dragging {
  border-color: #2196f3;
  background: #e3f2fd;
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.file-types {
  font-size: 0.875rem;
  color: #666;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress {
  height: 100%;
  background: #2196f3;
  transition: width 0.3s ease;
}

.uploaded {
  color: #4caf50;
}

.file-name {
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.reset-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.reset-btn:hover {
  background: #1976d2;
}

.error {
  color: #f44336;
  margin-top: 1rem;
  text-align: center;
}
</style> 