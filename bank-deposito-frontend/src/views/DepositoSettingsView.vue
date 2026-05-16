<script setup>
import { onMounted, ref } from "vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { useDepositoTypeStore } from "../stores/depositoTypeStore";

const depositoTypeStore = useDepositoTypeStore();

// State untuk Manajemen Modal Edit
const isModalOpen = ref(false);
const selectedType = ref(null);
const editForm = ref({
    id: null,
    name: "",
    yearly_return: 0,
});

// State untuk Notifikasi UI Simpel
const notification = ref({
    show: false,
    message: "",
    type: "success",
});

onMounted(() => {
    depositoTypeStore.fetchTypesFromAPI();
});

const triggerNotification = (message, type = "success") => {
    notification.value = { show: true, message, type };
    setTimeout(() => {
        notification.value.show = false;
    }, 1500);
};

// HANDLERS MODAL EDIT
const openEditModal = (typeData) => {
    selectedType.value = typeData;
    editForm.value = {
        id: typeData.id,
        name: typeData.name,
        yearly_return: typeData.yearly_return,
    };
    isModalOpen.value = true;
};

const closeEditModal = () => {
    isModalOpen.value = false;
    selectedType.value = null;
};

const handleUpdateType = async () => {
    if (!editForm.value.name || editForm.value.yearly_return === "") {
        triggerNotification("Semua kolom wajib diisi!", "danger");
        return;
    }

    const success = await depositoTypeStore.updateType(editForm.value.id, {
        name: editForm.value.name,
        yearly_return: parseFloat(editForm.value.yearly_return),
    });

    if (success) {
        triggerNotification("📈 Produk Deposito Berhasil Diperbarui!");
    } else {
        triggerNotification("Gagal menyimpan perubahan.", "danger");
    }
    closeEditModal();
};
</script>

<template>
    <DashboardLayout>
        <Transition
            enter-active-class="transform ease-out duration-300 transition"
            enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="notification.show"
                class="fixed top-5 right-5 z-50 max-w-sm w-full bg-white shadow-lg rounded-xl border p-4 flex items-center gap-3 overflow-hidden"
                :class="
                    notification.type === 'success'
                        ? 'border-emerald-500'
                        : 'border-red-500'
                "
            >
                <span
                    v-if="notification.type === 'success'"
                    class="text-emerald-500 text-lg"
                >
                    ✅
                </span>
                <span v-else class="text-red-500 text-lg">⚠️</span>
                <p class="text-sm font-semibold text-gray-800">
                    {{ notification.message }}
                </p>
            </div>
        </Transition>

        <div class="p-8">
            <h1 class="text-3xl font-bold text-gray-800">
                Pengaturan Produk Deposito
            </h1>
            <p class="text-gray-600 mt-2">
                Kelola suku bunga tahunan dan nama paket investasi bank.
            </p>

            <div
                class="mt-8 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
            >
                <div class="p-5 border-b border-gray-100 bg-gray-50">
                    <h3 class="font-bold text-gray-700">
                        Daftar Paket Deposito Aktif
                    </h3>
                </div>

                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr
                            class="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase"
                        >
                            <th class="p-4">ID Tipe</th>
                            <th class="p-4">Nama Produk / Paket</th>
                            <th class="p-4 text-center">Yearly Rate</th>
                            <th class="p-4 text-center">Digunakan Oleh</th>
                            <th class="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody
                        class="divide-y divide-gray-100 text-sm text-gray-600"
                    >
                        <tr v-if="depositoTypeStore.isLoading">
                            <td
                                colspan="5"
                                class="p-8 text-center text-gray-500 animate-pulse font-medium"
                            >
                                🔄 Sedang memuat produk bank...
                            </td>
                        </tr>

                        <tr
                            v-else
                            v-for="typeData in depositoTypeStore.types"
                            :key="typeData.id"
                            class="hover:bg-gray-50 transition duration-150"
                        >
                            <td class="p-4 font-medium text-gray-900">
                                #TYPE-{{ typeData.id }}
                            </td>
                            <td class="p-4">
                                <span
                                    :class="{
                                        'text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 font-bold text-xs':
                                            typeData.id == 1,
                                        'text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 font-bold text-xs':
                                            typeData.id == 2,
                                        'text-yellow-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 font-bold text-xs':
                                            typeData.id == 3,
                                    }"
                                >
                                    {{ typeData.name }}
                                </span>
                            </td>
                            <td
                                class="p-4 text-center font-bold text-emerald-600"
                            >
                                {{ typeData.yearly_return }}%
                                <span class="text-xs text-gray-400 font-normal"
                                    >/ year</span
                                >
                            </td>
                            <td class="p-4 text-center">
                                <span class="text-xs text-gray-500">
                                    {{ typeData.accounts_count || 0 }} Rekening
                                    Aktif
                                </span>
                            </td>
                            <td class="p-4 text-center">
                                <button
                                    @click="openEditModal(typeData)"
                                    class="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                                >
                                    Sesuaikan Suku Bunga
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div
            v-if="isModalOpen"
            class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
            <div
                class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
            >
                <div
                    class="flex justify-between items-center mb-4 border-b border-gray-100 pb-3"
                >
                    <h3 class="text-lg font-bold text-gray-800">
                        Konfigurasi #TYPE-{{ editForm.id }}
                    </h3>
                    <button
                        @click="closeEditModal"
                        class="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
                    >
                        &times;
                    </button>
                </div>

                <div class="space-y-4">
                    <div>
                        <label
                            class="block text-xs font-bold text-gray-500 uppercase mb-1"
                            >Nama Paket Deposito</label
                        >
                        <input
                            v-model="editForm.name"
                            type="text"
                            class="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-xs font-bold text-gray-500 uppercase mb-1"
                            >Suku Bunga Tahunan (%)</label
                        >
                        <div class="relative mt-1 rounded-md shadow-xs">
                            <input
                                v-model="editForm.yearly_return"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                class="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            />
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
                            >
                                <span class="text-gray-500 text-sm font-bold"
                                    >%</span
                                >
                            </div>
                        </div>
                    </div>

                    <div
                        class="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-4"
                    >
                        <button
                            @click="closeEditModal"
                            type="button"
                            class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm transition duration-150 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            @click="handleUpdateType"
                            type="button"
                            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition duration-150 cursor-pointer"
                        >
                            Simpan Konfigurasi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </DashboardLayout>
</template>
