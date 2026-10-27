<template>
  <div class="chart-container" style="max-width: 320px; margin: 0 auto">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  flows: {
    type: Array,
    required: true,
  },
})

const chartData = computed(() => {
  const counts = {}

  // Zählen der Länder
  props.flows.forEach((flow) => {
    const country = flow['target_info.country_c'] || 'Unbekannt'
    counts[country] = (counts[country] || 0) + 1
  })

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        data: Object.values(counts),
        backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'],
        borderWidth: 1,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12, font: { size: 11 } },
    },
  },
}
</script>
