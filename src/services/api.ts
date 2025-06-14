import axios from 'axios';
import { League } from '../types/league';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

export const fetchLeagues = () => {
  return axios.get<League[]>(`${API_BASE_URL}/leagues`);
};