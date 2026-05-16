<script setup>
    import { ref, onMounted, computed, watch } from "vue";
    import { useAccountStore } from "../stores/accountStore";
    import { useTransactionStore } from "../stores/transactionStore";

    const accountStore = useAccountStore();
    const transactionStore = useTransactionStore();

    // 🔑 BYPASS AUTH: Anggap saja saat ini Nasabah ID #1 yang sedang login
    const loggedInCustomerId = ref(1);

    // UI State
    const selectedAccountId = ref("");
    const transactionType = ref("DEPOSIT"); // Default tab
    const amountInput = ref("");
    const dateInput = ref(new Date().toISOString().split("T")[0]); // Default hari ini

    const notification = ref({ show: false, message: "", type: "success" });

    onMounted(async () => {
        // Load semua data master akun & nasabah
        await accountStore.fetchAccountsFromAPI();

        // Cari rekening pertama milik nasabah ini untuk dijadikan default selector
        if (myAccounts.value.length > 0) {
            selectedAccountId.value = myAccounts.value[0].id;
        }
    });

    const triggerNotification = (message, type = "success") => {
        notification.value = { show: true, message, type };
        setTimeout(() => {
            notification.value.show = false;
        }, 2000);
    };

    // 🎯 Filter rekening: Hanya menampilkan rekening milik nasabah yang sedang login
    const myAccounts = computed(() => {
        return accountStore.accounts.filter(
            (acc) => acc.customer_id === loggedInCustomerId.value,
        );
    });

    // 📈 Ambil object detail info rekening yang sedang dipilih saat ini
    const activeAccount = computed(() => {
        return myAccounts.value.find(
            (acc) => acc.id === parseInt(selectedAccountId.value),
        );
    });

    // 🧮 LOGIKA REKREASI: Hitung Estimasi Bunga Bulanan (Yearly Return / 12)
    const estimatedMonthlyReturn = computed(() => {
        if (!activeAccount.value || !activeAccount.value.deposito_type)
            return 0;
        const yearlyReturnPercent =
            activeAccount.value.deposito_type.yearly_return || 0;
        const currentBalance = activeAccount.value.balance || 0;

        // Rumus: (Saldo Saat Ini * Suku Bunga Tahunan / 100) / 12 Bulan
        return (currentBalance * (yearlyReturnPercent / 100)) / 12;
    });

    // Pantau jika nasabah mengganti pilihan nomor rekeningnya di dropdown
    watch(
        selectedAccountId,
        (newId) => {
            if (newId) {
                transactionStore.fetchAccountDetails(newId);
            }
        },
        { immediate: true },
    );

    // HANDLER SUBMIT TRANSAKSI (DEPOSIT / WITHDRAW)
    const handleTransactionSubmit = async () => {
        if (
            !selectedAccountId.value ||
            !amountInput.value ||
            !dateInput.value
        ) {
            triggerNotification(
                "Harap lengkapi nominal dan tanggal transaksi!",
                "danger",
            );
            return;
        }

        const payload = {
            account_id: parseInt(selectedAccountId.value),
            type: transactionType.value,
            amount: parseFloat(amountInput.value),
            transaction_date: dateInput.value,
        };

        const result = await transactionStore.executeTransaction(payload);

        if (result.success) {
            triggerNotification(
                `🎉 Transaksi ${transactionType.value} sukses! Bunga terakumulasi: ${formatRupiah(result.data.interest_earned)}`,
            );
            amountInput.value = ""; // Reset input nominal
        } else {
            triggerNotification(result.message, "danger");
        }
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
    <div class="min-h-screen bg-slate-100 p-4 md:p-8">
        <div
            v-if="notification.show"
            class="fixed top-5 right-5 z-50 max-w-md bg-white shadow-xl rounded-xl border-l-4 p-4 flex items-center gap-3 animate-bounce"
            :class="notification.type === 'success' ? 'border-emerald-500 text-emerald-800' : 'border-red-500 text-red-800'"
        >
            <span>{{ notification.type === "success" ? "✅" : "⚠️" }}</span>
            <p class="text-sm font-bold">{{ notification.message }}</p>
        </div>

        <div class="max-w-5xl mx-auto">
            <div
                class="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 text-white p-6 rounded-2xl shadow-lg mb-6"
            >
                <div>
                    <span
                        class="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                        >Customer Sandbox Mode</span
                    >
                    <h1 class="text-2xl font-black mt-2">
                        Selamat Datang di Portal Nasabah 🏦
                    </h1>
                    <p class="text-sm text-slate-400 mt-1">
                        Kelola simpanan berjangka dan dapatkan profit bulanan
                        otomatis.
                    </p>
                </div>
                <div
                    class="mt-4 md:mt-0 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs text-right"
                >
                    <p class="text-slate-400">Terautentikasi Sebagai:</p>
                    <p class="font-bold text-blue-400">
                        Nasabah ID #{{ loggedInCustomerId }}
                    </p>
                </div>
            </div>

            <div
                class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
                <div class="text-center sm:text-left">
                    <h3 class="font-bold text-gray-800">
                        Silakan Pilih Rekening Deposito Anda:
                    </h3>
                    <p class="text-xs text-gray-500">
                        Aksi transaksi akan berdampak pada rekening yang aktif
                        dipilih.
                    </p>
                </div>
                <select
                    v-model="selectedAccountId"
                    class="p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-500 w-full sm:w-64"
                >
                    <option
                        v-for="acc in myAccounts"
                        :key="acc.id"
                        :value="acc.id"
                    >
                        #{{ acc.id }} - {{ acc.packet }}
                    </option>
                </select>
            </div>

            <div
                v-if="myAccounts.length === 0"
                class="bg-amber-50 border border-amber-200 text-amber-800 p-8 rounded-xl text-center font-medium"
            >
                ⚠️ Akun simulasi ini belum memiliki rekening deposito aktif.
                Sila pasangkan rekening baru terlebih dahulu di Dashboard Admin!
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1 space-y-4">
                    <div
                        class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs"
                    >
                        <span
                            class="text-xs font-bold text-gray-400 uppercase tracking-wider"
                            >Total Saldo Terkini</span
                        >
                        <h2 class="text-2xl font-black text-slate-900 mt-1">
                            {{ formatRupiah(activeAccount?.balance || 0) }}
                        </h2>
                        <div
                            class="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500"
                        >
                            <span>Tipe Paket:</span>
                            <span class="font-bold text-blue-600 uppercase">{{
                                activeAccount?.deposito_type?.name
                            }}</span>
                        </div>
                    </div>

                    <div
                        class="bg-emerald-600 p-6 rounded-2xl text-white shadow-md"
                    >
                        <span
                            class="text-xs font-bold text-emerald-200 uppercase tracking-wider"
                            >Estimasi Profit / Bulan</span
                        >
                        <h2 class="text-2xl font-black mt-1">
                            + {{ formatRupiah(estimatedMonthlyReturn) }}
                        </h2>
                        <p
                            class="text-[10px] text-emerald-100/80 mt-2 leading-relaxed"
                        >
                            Dihitung otomatis berdasarkan suku bunga produk
                            tahunan saat ini ({{
                                activeAccount?.deposito_type?.yearly_return ||
                                    0
                            }}% / tahun) dibagi 12 bulan.
                        </p>
                    </div>
                </div>

                <div
                    class="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden"
                >
                    <div class="flex border-b border-gray-100 bg-gray-50">
                        <button
                            @click="transactionType = 'DEPOSIT'"
                            :class="transactionType === 'DEPOSIT' ? 'border-b-2 border-blue-600 text-blue-600 bg-white font-bold' : 'text-gray-500 font-medium'"
                            class="flex-1 py-3 text-sm cursor-pointer transition"
                        >
                            📥 Setor Tunai (Deposit)
                        </button>
                        <button
                            @click="transactionType = 'WITHDRAW'"
                            :class="transactionType === 'WITHDRAW' ? 'border-b-2 border-red-600 text-red-600 bg-white font-bold' : 'text-gray-500 font-medium'"
                            class="flex-1 py-3 text-sm cursor-pointer transition"
                        >
                            📤 Tarik Tunai (Withdraw)
                        </button>
                    </div>

                    <form
                        @submit.prevent="handleTransactionSubmit"
                        class="p-6 space-y-4"
                    >
                        <h3 class="font-bold text-gray-800 text-sm">
                            Formulir
                            {{
                                transactionType === "DEPOSIT"
                                    ? "Penyetoran"
                                    : "Penarikan"
                            }}
                            Dana Simulasi
                        </h3>

                        <div>
                            <label
                                class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                                >Nominal Transaksi (IDR)</label
                            >
                            <input
                                v-model="amountInput"
                                type="number"
                                min="1"
                                placeholder="Contoh: 500000"
                                class="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label
                                class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                                >Tanggal Transaksi Finansial</label
                            >
                            <input
                                v-model="dateInput"
                                type="date"
                                class="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            :class="transactionType === 'DEPOSIT' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'"
                            class="w-full text-white font-bold p-3 rounded-xl text-sm transition duration-150 shadow-md cursor-pointer mt-2"
                        >
                            Konfirmasi Eksekusi {{ transactionType }}
                        </button>
                    </form>
                </div>
            </div>

            <div
                class="mt-8 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden"
            >
                <div class="p-5 border-b border-gray-100 bg-gray-50">
                    <h3 class="font-bold text-gray-700 text-sm">
                        📑 Buku Mutasi / Riwayat Transaksi Rekening
                    </h3>
                </div>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr
                            class="bg-gray-50/50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase"
                        >
                            <th class="p-4">Tanggal Ledger</th>
                            <th class="p-4 text-center">Jenis Mutasi</th>
                            <th class="p-4 text-right">Bunga Terakumulasi</th>
                            <th class="p-4 text-right">Nominal Mutasi</th>
                        </tr>
                    </thead>
                    <tbody
                        class="divide-y divide-gray-100 text-sm text-gray-600"
                    >
                        <tr v-if="transactionStore.isLoading">
                            <td
                                colspan="4"
                                class="p-6 text-center text-gray-400 animate-pulse"
                            >
                                🔄 Sedang mengkalkulasi database ledger
                                mutasi...
                            </td>
                        </tr>
                        <tr
                            v-else-if="!transactionStore.currentAccountDetails?.transactions?.length"
                        >
                            <td
                                colspan="4"
                                class="p-8 text-center text-gray-400 italic"
                            >
                                Belum ada rekam jejak transaksi keuangan pada
                                rekening ini.
                            </td>
                        </tr>
                        <tr
                            v-else
                            v-for="tx in transactionStore.currentAccountDetails.transactions"
                            :key="tx.id"
                            class="hover:bg-gray-50/80 transition"
                        >
                            <td class="p-4 font-medium text-gray-700">
                                {{ tx.transaction_date }}
                            </td>
                            <td class="p-4 text-center">
                                <span
                                    :class="tx.type === 'DEPOSIT' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'"
                                    class="px-2.5 py-1 text-xs font-bold rounded-md border"
                                >
                                    {{ tx.type }}
                                </span>
                            </td>
                            <td
                                class="p-4 text-right font-semibold text-emerald-600"
                            >
                                + {{ formatRupiah(tx.interest_earned || 0) }}
                            </td>
                            <td
                                class="p-4 text-right font-black"
                                :class="tx.type === 'DEPOSIT' ? 'text-blue-600' : 'text-red-600'"
                            >
                                {{ tx.type === "DEPOSIT" ? "+" : "-" }}
                                {{ formatRupiah(tx.amount) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
