import { api } from './ApiClient';
import { UserApplication, GrantComment } from './models';

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
  async getApplicationDocument(applicationId: number): Promise<{ document_name: string, document_pdf: string }> {
    const { data } = await api.client.get<{ document_name: string, document_pdf: string }>(`/admin/applications/${applicationId}/document`);
    return data;
  }

  async getReportedComments(): Promise<GrantComment[]> {
    const { data } = await api.client.get<GrantComment[]>('/admin/comments/reported');
    return data;
  }

  async deleteComment(commentId: number): Promise<void> {
    await api.client.put(`/admin/comments/${commentId}/delete`);
  }

  async dismissCommentReports(commentId: number): Promise<void> {
    await api.client.put(`/admin/comments/${commentId}/dismiss-reports`);
  }
}

export default new AdminService();
