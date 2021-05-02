import { BASE_URL } from 'constants/configs';

export const pollutionDataSource = new WebSocket('ws://'+BASE_URL+'/');