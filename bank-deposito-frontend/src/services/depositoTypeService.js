import apiClient from './api'

export const depositoTypeService = {
    
    getAllTypes() {
        return apiClient.get('/deposito-types')
    },

    
    updateType(id, updatedData) {
        return apiClient.put(`/deposito-types/${id}`, updatedData)
    }
}