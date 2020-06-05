import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333',
});

export default api;

// localhost: com adb reverse
// 10.0.2.2: Android Studio
// Ip da Máquina: Dispositivo Físico
