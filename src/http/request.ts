import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const service: AxiosInstance = axios.create({
  baseURL: "/",
  timeout: 15000,
});

// axios实例拦截请求
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// axios实例拦截响应
service.interceptors.response.use(
  (response: AxiosResponse) => {},
  (error: any) => {}
);

export default service;
