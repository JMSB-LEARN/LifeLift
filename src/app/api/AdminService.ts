import { api } from './ApiClient';
import { UserApplication } from './models';

class AdminService {
  /**
   * Obtiene todas las solicitudes para el panel de administrador
   */
  async getAllApplications(): Promise<UserApplication[]> {
    const { data } = await api.client.get<UserApplication[]>('/admin/applications');
    return data;
  }

  /**
   * Actualiza el estado y los comentarios de una solicitud
   */
  async updateApplicationStatus(id: number, document_status: string, admin_comments: string | null): Promise<UserApplication> {
    const { data } = await api.client.put<UserApplication>(`/admin/applications/${id}/status`, {
      document_status,
      admin_comments
    });
    return data;
  }

  /**
   * Obtiene el documento PDF de una solicitud para visualización
   */
  async getApplicationDocument(id: number): Promise<string> {
    const { data } = await api.client.get<{ document_pdf: string }>(`/admin/applications/${id}/document`);
    return data.document_pdf;
  }
}

export default new AdminService();
