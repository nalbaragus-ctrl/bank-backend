<script setup>
import { onMounted, ref } from "vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { useCustomerStore } from "../stores/customerStore";

const customerStore = useCustomerStore();


const form = ref({
    name: "",
});


const isModalOpen = ref(false);
const isConfirmingDelete = ref(false);
const selectedCustomer = ref(null);
const editForm = ref({
    id: null,
    name: "",
});


const notification = ref({
    show: false,
    message: "",
    type: "success",
});

onMounted(() => {
    customerStore.fetchCustomersFromAPI();
});

const triggerNotification = (message, type = "success") => {
    notification.value = { show: true, message, type };
    setTimeout(() => {
        notification.value.show = false;
    }, 1500);
};


const handleSubmit = async () => {
    if (!form.value.name) {
        triggerNotification(
            "Harap isi nama nasabah terlebih dahulu!",
            "danger",
        );
        return;
    }

    const isSuccess = await customerStore.createCustomer({
        name: form.value.name,
    });

    if (isSuccess) {
        form.value.name = "";
        triggerNotification(" Nasabah Baru Berhasil Terdaftar!");
    }
};


const openEditModal = (customer) => {
    selectedCustomer.value = customer;
    editForm.value = {
        id: customer.id,
        name: customer.name,
    };
    isConfirmingDelete.value = false;
    isModalOpen.value = true;
};

const closeEditModal = () => {
    isModalOpen.value = false;
    selectedCustomer.value = null;
    isConfirmingDelete.value = false;
};

const handleUpdateCustomer = async () => {
    if (!editForm.value.name) {
        triggerNotification("Nama nasabah tidak boleh kosong!", "danger");
        return;
    }

    const success = await customerStore.updateCustomer(editForm.value.id, {
        name: editForm.value.name,
    });

    if (success) {
        triggerNotification(" Nama Nasabah Berhasil Diperbarui!");
    }
    closeEditModal();
};

const handleDeleteCustomer = async () => {
    const success = await customerStore.deleteCustomer(editForm.value.id);
    if (success) {
        triggerNotification("🗑️ Data Nasabah Berhasil Dihapus!", "success");
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
                    >✅</span
                >
                <span v-else class="text-red-500 text-lg">⚠️</span>
                <p class="text-sm font-semibold text-gray-800">
                    {{ notification.message }}
                </p>
            </div>
        </Transition>

        <div class="p-8">
            <h1 class="text-3xl font-bold text-gray-800">Manajemen Nasabah</h1>
            <p class="text-gray-600 mt-2">
                Daftar dan registrasi nasabah baru Bank.
            </p>

            <div
                class="mt-8 bg-white p-6 rounded-xl shadow-xs border border-gray-200"
            >
                <h3 class="font-bold text-gray-700 text-lg mb-4">
                    Registrasi Nasabah Baru
                </h3>
                <form
                    @submit.prevent="handleSubmit"
                    class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
                >
                    <div class="md:col-span-2">
                        <label
                            class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                            >Nama Lengkap</label
                        >
                        <input
                            v-model="form.name"
                            type="text"
                            placeholder="Contoh: Ahmad Subagja"
                            class="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium p-2 rounded-lg text-sm transition duration-200 cursor-pointer"
                    >
                        Daftarkan Nasabah
                    </button>
                </form>
            </div>

            <div
                class="mt-8 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
            >
                <div class="p-5 border-b border-gray-100 bg-gray-50">
                    <h3 class="font-bold text-gray-700">
                        Database Nasabah Aktif
                    </h3>
                </div>

                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr
                            class="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase"
                        >
                            <th class="p-4">ID Nasabah</th>
                            <th class="p-4">Nama Lengkap</th>
                            <th class="p-4 text-center">Total Akun Deposito</th>
                            <th class="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody
                        class="divide-y divide-gray-100 text-sm text-gray-600"
                    >
                        <tr v-if="customerStore.isLoading">
                            <td
                                colspan="4"
                                class="p-8 text-center text-gray-500 animate-pulse font-medium"
                            >
                                🔄 Sedang memuat database nasabah...
                            </td>
                        </tr>

                        <tr
                            v-else
                            v-for="customer in customerStore.customers"
                            :key="customer.id"
                            class="hover:bg-gray-50 transition duration-150"
                        >
                            <td class="p-4 font-medium text-gray-900">
                                #UID-{{ customer.id }}
                            </td>
                            <td class="p-4 font-semibold text-gray-800">
                                {{ customer.name }}
                            </td>
                            <td class="p-4 text-center">
                                <span
                                    class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                    {{ customer.accounts_count || 0 }} Rekening
                                </span>
                            </td>
                            <td class="p-4 text-center">
                                <button
                                    @click="openEditModal(customer)"
                                    class="bg-gray-50 text-slate-600 hover:bg-slate-600 hover:text-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                                >
                                    Kelola
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
                        Kelola Nasabah {{ editForm.id }}
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
                            >Nama Lengkap Nasabah</label
                        >
                        <input
                            v-model="editForm.name"
                            type="text"
                            class="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div
                        class="pt-4 flex flex-col sm:flex-row justify-between gap-2 border-t border-gray-100 mt-4"
                    >
                        <div
                            v-if="!isConfirmingDelete"
                            class="w-full flex flex-col sm:flex-row justify-between gap-2"
                        >
                            <button
                                @click="isConfirmingDelete = true"
                                type="button"
                                class="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-lg text-sm transition duration-150 cursor-pointer"
                            >
                                Hapus Nasabah
                            </button>
                            <div class="flex gap-2 justify-end">
                                <button
                                    @click="closeEditModal"
                                    type="button"
                                    class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm transition duration-150 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    @click="handleUpdateCustomer"
                                    type="button"
                                    class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition duration-150 cursor-pointer"
                                >
                                    Simpan Nama
                                </button>
                            </div>
                        </div>

                        <div
                            v-else
                            class="w-full bg-red-50 p-3 rounded-xl border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-150"
                        >
                            <span
                                class="text-xs font-bold text-red-800 text-center sm:text-left"
                                >Yakin ingin menghapus nasabah ini?</span
                            >
                            <div
                                class="flex gap-2 w-full sm:w-auto justify-end"
                            >
                                <button
                                    @click="isConfirmingDelete = false"
                                    type="button"
                                    class="bg-white hover:bg-gray-100 text-gray-700 font-medium px-3 py-1.5 rounded-md text-xs border border-gray-200 transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    @click="handleDeleteCustomer"
                                    type="button"
                                    class="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-md text-xs transition cursor-pointer"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </DashboardLayout>
</template>
