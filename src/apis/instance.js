import axios from "axios";

export const exeInstance = (port) => axios.create({
  baseURL: `http://127.0.0.1:${port}`,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const instance = axios.create({
  baseURL: 'http://222.234.4.177:8081/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})