import axios from 'axios';

// Definimos la estructura que Fintoc nos devuelve (parcial)
interface FintocMovement {
  id: string;
  amount: number;
  currency: string;
  description: string;
  transaction_date: string;
}

export class FintocService {
  private apiKey: string;
  private baseUrl = 'https://api.fintoc.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Obtiene los movimientos de una cuenta específica.
   * @param linkToken - El token de la conexión del usuario (bank_connections).
   * @param accountId - El ID de la cuenta bancaria.
   */
  async getMovements(linkToken: string, accountId: string): Promise<FintocMovement[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/accounts/${accountId}/movements`, {
        headers: {
          'Authorization': this.apiKey,
          'Link-Token': linkToken // Fintoc requiere esto para saber a qué usuario acceder
        },
        params: {
          link_token: linkToken 
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error conectando con Fintoc:', error);
      throw new Error('Fallo al obtener movimientos bancarios');
    }
  }
}