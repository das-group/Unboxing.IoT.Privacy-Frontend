<template>
  <input id="tag-input" type="text" class="form-control" :placeholder="placeholder" v-model="newTag" @keydown="onKeydown" list="tagOptions" />

  <div class="mt-2">
    <span v-for="(tag, index) in tags" :key="index" class="badge bg-primary me-1">
      {{ tag }}
      <button type="button" class="btn-close btn-close-white btn-sm ms-1" aria-label="Remove" @click="removeTag(index)"></button>
    </span>
  </div>

  <datalist id="tagOptions">
    <option value="Bluetooth" />
    <option value="WiFi" />
    <option value="Zigbee" />
    <option value="Z-Wave" />
    <option value="LoRaWAN" />
    <option value="Medizinisch" />
    <option value="Industriell" />
    <option value="Smart Home" />
    <option value="Wearable" />
    <option value="Sensor" />
    <option value="Aktuator" />
    <option value="Überwachung" />
    <option value="Energie" />
    <option value="Landwirtschaft" />
    <option value="Transport" />
    <option value="Sicherheit" />
    <option value="Fitness" />
    <option value="Automobil" />
    <option value="Umwelt" />
    <option value="Robotik" />

    <option value="Blutdruckmessgerät" />
    <option value="Körperwaage" />
    <option value="Elektrostimulator" />
  </datalist>
</template>

<script>
export default {
  name: 'TagSelector',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: 'Fügen Sie ein Schlagwort hinzu',
    },
  },
  data() {
    return {
      newTag: '',
      tags: [...this.modelValue],
    }
  },
  methods: {
    addTag() {
      const tag = this.newTag.trim()
      if (tag && !this.tags.includes(tag)) {
        this.tags.push(tag)
      }
      this.newTag = ''
      this.$emit('update:modelValue', this.tags)
    },
    removeTag(index) {
      this.tags.splice(index, 1)
      this.$emit('update:modelValue', this.tags)
    },
    onKeydown(e) {
      if (e.key === ',' || e.key === 'Enter') {
        e.preventDefault()

        this.addTag()
      }
    },
  },
}
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
}
</style>
