import { api } from './ApiClient';
import { GrantComment } from './models';

class CommentsService {
  async getComments(grantId: number): Promise<GrantComment[]> {
    const { data } = await api.client.get<GrantComment[]>(`/grants/${grantId}/comments`);
    return data;
  }

  async addComment(grantId: number, comment_text: string, parent_id?: number): Promise<GrantComment> {
    const { data } = await api.client.post<GrantComment>(`/grants/${grantId}/comments`, {
      comment_text,
      parent_id
    });
    return data;
  }

  async reportComment(commentId: number): Promise<{ reports_count: number }> {
    const { data } = await api.client.post<{ reports_count: number }>(`/comments/${commentId}/report`);
    return data;
  }
}

export default new CommentsService();
