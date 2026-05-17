<script setup>
import { onMounted, ref, computed } from "vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import StatsCard from "../components/StatsCard.vue";
import { useAccountStore } from "../stores/accountStore";
import { useCustomerStore } from "../stores/customerStore";

// 1. INISIALISASI SEMUA STORE & STATE (Harus di paling atas)
const accountStore = useAccountStore();
const customerStore = useCustomerStore();

// State Konfirmasi Hapus Langsung di UI
const isConfirmingDelete = ref(false);

// State Manajemen Modal Edit/Delete
const isModalOpen = ref(false);
const selectedAccount = ref(null);
const editForm = ref({
    id: null,
    packet: "",
    deposito_type_id: "",
});

// Form state untuk Buka Rekening Baru
const form = ref({
    packet: "",
    customer_id: "", // Tersinkronisasi otomatis dengan filter tabel!
    balance: "",
    deposito_type_id: "",
});

// State untuk Notifikasi UI Custom
const notification = ref({
    show: false,
    message: "",
    type: "success", // 'success' atau 'danger'
});

// 2. TIMING FUNGSIONALITAS (Lifecycle & Notification)
onMounted(() => {
    accountStore.fetchAccountsFromAPI();
    customerStore.fetchCustomersFromAPI();
});

const triggerNotification = (message, type = "success") => {
    notification.value = { show: true, message, type };
    setTimeout(() => {
        notification.value.show = false;
    }, 1000); // Otomatis hilang dalam 1 detik
};

// 3. LOGIKA MODAL HANDLERS (Sudah dibersihkan dari duplikasi)
const openEditModal = (account) => {
    selectedAccount.value = account;
    editForm.value = {
        id: account.id,
        packet: account.packet,
        deposito_type_id: account.deposito_type_id || "1",
    };
    isConfirmingDelete.value = false; // Reset state konfirmasi hapus setiap buka modal
    isModalOpen.value = true;
};

const closeEditModal = () => {
    isModalOpen.value = false;
    selectedAccount.value = null;
    isConfirmingDelete.value = false;
};

// 4. COMPUTED PROPERTIES (Filter & Likuiditas Otomatis)
const filteredAccounts = computed(() => {
    if (!form.value.customer_id) {
        return accountStore.accounts;
    }
    return accountStore.accounts.filter(
        (account) => account.customer_id === parseInt(form.value.customer_id),
    );
});

const dynamicBankLiquidity = computed(() => {
    return filteredAccounts.value.reduce((total, account) => {
        return total + (parseFloat(account.balance) || 0);
    }, 0);
});

// 5. CRUD ACTION HANDLERS (Submit, Update, Delete)
const handleSubmit = async () => {
    if (
        !form.value.packet ||
        !form.value.customer_id ||
        !form.value.balance ||
        !form.value.deposito_type_id
    ) {
        triggerNotification(
            "Harap isi semua kolom form terlebih dahulu!",
            "danger",
        );
        return;
    }

    const currentCustomer = form.value.customer_id;

    const isSuccess = await accountStore.createAccount({
        packet: form.value.packet,
        customer_id: parseInt(form.value.customer_id),
        balance: parseFloat(form.value.balance),
        deposito_type_id: parseInt(form.value.deposito_type_id),
    });

    if (isSuccess) {
        form.value.packet = "";
        form.value.balance = "";
        form.value.deposito_type_id = "";
        form.value.customer_id = currentCustomer; // Pertahankan filter nasabah
        triggerNotification("🎉 Success Saving.");
    }
};

const handleUpdateAccount = async () => {
    if (!editForm.value.packet || !editForm.value.deposito_type_id) {
        triggerNotification(
            "Nama paket dan tipe deposito tidak boleh kosong!",
            "danger",
        );
        return;
    }

    if (accountStore.updateAccount) {
        const success = await accountStore.updateAccount(editForm.value.id, {
            packet: editForm.value.packet,
            deposito_type_id: parseInt(editForm.value.deposito_type_id),
        });
        if (success) triggerNotification("✏️ Akun berhasil di update!");
    } else {
        triggerNotification(
            "Action updateAccount berhasil di-trigger di Vue UI.",
            "danger",
        );
    }
    closeEditModal();
};

const handleDeleteAccount = async () => {
    const success = await accountStore.deleteAccount(editForm.value.id);
    if (success) {
        triggerNotification(
            "🗑️ Akun Deposito Telah Berhasil Dihapus!",
            "success",
        );
    }
    closeEditModal();
};

const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
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
                class="fixed top-5 right-5 z-50 max-w-sm w-full bg-white shadow-lg rounded-xl border pointer-events-auto overflow-hidden"
                :class="
                    notification.type === 'success'
                        ? 'border-emerald-500'
                        : 'border-red-500'
                "
            >
                <div class="p-4 flex items-center gap-3">
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
            </div>
        </Transition>
        <div class="p-8">
            <h1 class="text-3xl font-bold text-gray-800">Customers Accounts</h1>
            <p class="text-gray-600 mt-2">
                Kelola simpanan dan nasabah secara real-time.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <StatsCard
                    :title="
                        form.customer_id
                            ? 'Likuiditas Nasabah Ini'
                            : 'Total Likuiditas Bank'
                    "
                    :value="formatRupiah(dynamicBankLiquidity)"
                    textColor="text-emerald-600"
                />
                <StatsCard
                    title="Total Nasabah Aktif"
                    :value="customerStore.customers.length + ' Orang'"
                    textColor="text-slate-800"
                />
            </div>

            <div
                class="mt-8 bg-white p-6 rounded-xl shadow-xs border border-gray-200"
            >
                <h3 class="font-bold text-gray-700 text-lg mb-4">
                     Buka Rekening Deposito Baru
                </h3>
                <form
                    @submit.prevent="handleSubmit"
                    class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
                >
                    <div>
                        <label
                            class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                            >Nama Paket</label
                        >
                        <input
                            v-model="form.packet"
                            type="text"
                            placeholder="Contoh: Silver Saving"
                            class="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                            >Pilih Nasabah</label
                        >
                        <select
                            v-model="form.customer_id"
                            class="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Tampilkan Semua Nasabah</option>
                            <option
                                v-for="customer in customerStore.customers"
                                :key="customer.id"
                                :value="customer.id"
                            >
                                {{ customer.name }} (#{{ customer.id }})
                            </option>
                        </select>
                    </div>

                    <div>
                        <label
                            class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                            >Tipe Deposito</label
                        >
                        <select
                            v-model="form.deposito_type_id"
                            class="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="" disabled>Pilih Tipe</option>
                            <option value="1">Tipe 1 (Bronze)</option>
                            <option value="2">Tipe 2 (Silver)</option>
                            <option value="3">Tipe 3 (Gold)</option>
                        </select>
                    </div>
                    <div>
                        <label
                            class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                            >Saldo Awal (IDR)</label
                        >
                        <input
                            v-model="form.balance"
                            type="number"
                            placeholder="Contoh: 2500000"
                            class="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-lg text-sm transition duration-200 cursor-pointer"
                    >
                        Submit Rekening
                    </button>
                </form>
            </div>

            <div
                class="mt-8 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
            >
                <div
                    class="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center"
                >
                    <h3 class="font-bold text-gray-700">
                        Daftar Rekening Deposito Active
                    </h3>
                    <span
                        v-if="form.customer_id"
                        class="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md font-semibold"
                    >
                        Mode Filter Nasabah Aktif
                    </span>
                </div>

                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr
                            class="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase"
                        >
                            <th class="p-4">ID Akun</th>
                            <th class="p-4">Paket Deposito</th>
                            <th class="p-4">ID Nasabah</th>
                            <th class="p-4 text-right">Saldo (Balance)</th>
                            <th class="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody
                        class="divide-y divide-gray-100 text-sm text-gray-600"
                    >
                        <tr v-if="accountStore.isLoading">
                            <td
                                colspan="5"
                                class="p-8 text-center text-gray-500 animate-pulse font-medium"
                            >
                                🔄 Sedang mengambil data...
                            </td>
                        </tr>

                        <tr
                            v-else
                            v-for="account in filteredAccounts"
                            :key="account.id"
                            class="hover:bg-gray-50 transition duration-150"
                        >
                            <td class="p-4 font-medium text-gray-900">
                                #{{ account.id }}
                            </td>
                            <td class="p-4">
                                <div class="font-semibold text-gray-800">
                                    {{ account.packet }}
                                </div>
                                <div
                                    class="text-xs font-medium text-gray-500 mt-0.5"
                                >
                                    Jenis:
                                    <span
                                        :class="{
                                            'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200':
                                                account.deposito_type_id == 1,
                                            'text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200':
                                                account.deposito_type_id == 2,
                                            'text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200':
                                                account.deposito_type_id == 3,
                                        }"
                                    >
                                        {{
                                            account.deposito_type?.name ||
                                            "Loading..."
                                        }}
                                    </span>
                                </div>
                            </td>
                            <td class="p-4">UID-{{ account.customer_id }}</td>
                            <td
                                class="p-4 text-right font-semibold text-slate-900"
                            >
                                {{ formatRupiah(account.balance) }}
                            </td>

                            <td class="p-4 text-center">
                                <button
                                    @click="openEditModal(account)"
                                    class="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 shadow-2xs cursor-pointer"
                                >
                                    Kelola Akun
                                </button>
                            </td>
                        </tr>

                        <tr
                            v-if="
                                filteredAccounts.length === 0 &&
                                !accountStore.isLoading
                            "
                        >
                            <td
                                colspan="5"
                                class="p-8 text-center text-gray-400"
                            >
                                Tidak ada rekening deposito yang cocok dengan
                                filter ini.
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
                        Kelola Akun Deposito #{{ editForm.id }}
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
                            >Nama Paket</label
                        >
                        <input
                            v-model="editForm.packet"
                            type="text"
                            class="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-xs font-bold text-gray-500 uppercase mb-1"
                            >Jenis / Tipe Deposito</label
                        >
                        <select
                            v-model="editForm.deposito_type_id"
                            class="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="1">Tipe 1 (Bronze)</option>
                            <option value="2">Tipe 2 (Silver)</option>
                            <option value="3">Tipe 3 (Gold)</option>
                        </select>
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
                                class="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-lg text-sm transition duration-150 cursor-pointer text-center"
                            >
                                Hapus Akun
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
                                    @click="handleUpdateAccount"
                                    type="button"
                                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition duration-150 cursor-pointer"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>

                        <div
                            v-else
                            class="w-full bg-red-50 p-3 rounded-xl border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-150"
                        >
                            <span
                                class="text-xs font-bold text-red-800 text-center sm:text-left"
                                >Yakin ingin menghapus akun ini?</span
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
                                    @click="handleDeleteAccount"
                                    type="button"
                                    class="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-md text-xs transition shadow-xs cursor-pointer"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </DashboardLayout>
</template>
