<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
    <div class="flex min-h-screen bg-gray-100">
        <aside class="w-64 bg-slate-900 text-white flex flex-col">
            <div
                class="p-5 text-xl font-bold border-b border-slate-800 tracking-wider"
            >
                Bank Deposito
            </div>

            <nav class="flex-1 p-4 space-y-2">
                <RouterLink
                    to="/"
                    class="block px-4 py-2.5 rounded transition duration-200 hover:bg-slate-800 font-medium"
                    active-class="bg-blue-600 hover:bg-blue-600 text-white"
                >
                    Dashboard
                </RouterLink>

                <RouterLink
                    to="/customers"
                    class="block px-4 py-2.5 rounded transition duration-200 hover:bg-slate-800 font-medium"
                    active-class="bg-blue-600 hover:bg-blue-600 text-white"
                >
                    Nasabah (Customers)
                </RouterLink>
                <RouterLink
                    to="/deposito-settings"
                    class="block px-4 py-2.5 rounded transition duration-200 hover:bg-slate-800 font-medium"
                    active-class="bg-blue-600 hover:bg-blue-600 text-white"
                >
                    Deposito Settings
                </RouterLink>
            </nav>

            <div class="p-4 border-t border-slate-800 text-xs text-slate-400">
                v1.0.0 — MVC Frontend
            </div>
        </aside>

        <main class="flex-1 overflow-y-auto">
            <slot />
        </main>
    </div>
</template>
