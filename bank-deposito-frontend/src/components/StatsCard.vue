<script setup>
// Mengonstruksikan Props untuk menerima data dari luar (Smart Component)
defineProps({
    title: {
        type: String,
        required: true,
    },
    value: {
        type: [String, Number],
        required: true,
    },
    textColor: {
        type: String,
        default: "text-blue-600", // Warna default jika tidak diisi
    },
});
</script>

<template>
    <div class="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
        <h3 class="text-gray-400 font-medium text-sm uppercase tracking-wider">
            {{ title }}
        </h3>

        <p class="text-2xl font-bold mt-1" :class="textColor">
            {{ value }}
        </p>
    </div>
</template>
