import { BASE_URL } from 'constants/configs';

export const pollutionDataSource = new WebSocket('wss://'+BASE_URL+'/');