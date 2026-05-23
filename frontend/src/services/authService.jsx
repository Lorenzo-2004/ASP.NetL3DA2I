import api from './api'

export const loginUser = async (data) => {
    const response = await api.post('/Auth/login', data)
    return response.data
}