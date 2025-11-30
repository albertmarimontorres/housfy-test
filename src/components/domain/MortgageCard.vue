<template>
    <v-card class="mortgage-card h-100" elevation="2" hover>
        <v-card-title class="d-flex align-center pb-2">
            <v-icon class="mr-2" color="primary">
                mdi-bank-outline
            </v-icon>
            <span class="text-truncate">{{ mortgage.bank }}</span>
            <v-spacer />
            <v-chip :color="statusColor" size="small" variant="flat">
                {{ statusLabel }}
            </v-chip>
        </v-card-title>

        <v-card-subtitle class="pb-1">
            <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
            {{ mortgage.city }}
        </v-card-subtitle>

        <v-card-text>
            <div class="mb-3">
                <div class="text-caption text-grey-darken-1 mb-1">Importe del préstamo</div>
                <div class="text-h6 font-weight-bold">
                    {{ mortgageService.formatLoanAmount(mortgage) }}
                </div>
            </div>

            <div class="mb-3">
                <div class="text-caption text-grey-darken-1 mb-1">Valor de la propiedad</div>
                <div class="text-subtitle-1">
                    {{ mortgageService.formatPropertyValue(mortgage) }}
                </div>
            </div>

            <div class="mb-3">
                <div class="text-caption text-grey-darken-1 mb-1">LTV (Loan-to-Value)</div>
                <div class="text-subtitle-1 font-weight-medium">
                    {{ mortgageService.formatLTV(mortgage) }}
                </div>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex justify-space-between text-caption text-grey-darken-1">
                <span>Creado: {{ mortgageService.formatCreatedAt(mortgage) }}</span>
                <span>Actualizado: {{ mortgageService.formatLastStatusChanged(mortgage) }}</span>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Mortgage } from '@/types/Mortgage';
import { mortgageService } from '@/services/mortgage.service';

interface Props {
    mortgage: Mortgage;
}

const props = defineProps<Props>();

// Computed para obtener el color y label del estado
const statusColor = computed(() => mortgageService.getStatusColor(props.mortgage.status));
const statusLabel = computed(() => mortgageService.getStatusLabel(props.mortgage.status));
</script>

<style scoped>
.mortgage-card {
    transition: transform 0.2s ease-in-out;
}

.mortgage-card:hover {
    transform: translateY(-2px);
}
</style>