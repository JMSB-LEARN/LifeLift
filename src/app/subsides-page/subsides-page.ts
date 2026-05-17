import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import CommentsService from '../api/CommentsService';
import AuthService from '../api/AuthService';
import { GrantComment } from '../api/models';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../api/ApiClient';

@Component({
  selector: 'app-subsides-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subsides-page.html',
  styleUrl: './subsides-page.css',
})
export class SubsidesPage implements OnInit {
  grants: any[] = [];
  applications: any[] = [];
  matches: any[] = [];

  showOnlyQualified = true;
  hideApplied = false;
  showOnlyApplied = false;
  generatingPdf = false;
  isLoggedIn = false;

  // Filtros Manuales
  filterUnemployment = false;
  filterFamily = false;
  filterDisability = false;
  filterExclusion = false;
  searchText: string = '';

  expandedGrantId: number | null = null;
  loading = true;

  // Comentarios state
  comments: GrantComment[] = [];
  newCommentText: string = '';
  replyTexts: { [commentId: number]: string } = {};
  replyingToId: number | null = null;

  constructor(private route: ActivatedRoute) { }
  
  
  


  async ngOnInit() {
    this.isLoggedIn = AuthService.isLoggedIn();
    if (!this.isLoggedIn) {
      this.showOnlyQualified = false;
    }

    this.route.queryParams.subscribe(params => {
      if (params['filter'] === 'unemployment') {
        this.showOnlyQualified = false;
        this.filterUnemployment = true;
      } else if (params['filter'] === 'family') {
        this.showOnlyQualified = false;
        this.filterFamily = true;
      }
    });

    await this.fetchData();
  }

  async fetchData() {
    this.loading = true;
    try {
      const grantsReq = api.client.get('/grants').catch(() => ({ data: [] }));
      
      let appsRes = { data: [] };
      let matchesRes = { data: [] };

      if (this.isLoggedIn) {
        appsRes = await api.client.get('/applications').catch(() => ({ data: [] }));
        matchesRes = await api.client.get('/grant-matches').catch(() => ({ data: [] }));
      }

      const grantsRes = await grantsReq;
      
      this.grants = grantsRes.data;
      this.applications = appsRes.data;
      this.matches = matchesRes.data;
    } catch (err) {
      console.error('Error obteniendo datos', err);
    }
    this.loading = false;
  }

  get filteredGrants() {
    return this.grants.filter(grant => {
      const isApplied = this.applications.some(a => a.grant_id === grant.id);
      if (this.hideApplied && isApplied) return false;
      if (this.showOnlyApplied && !isApplied) return false;

      if (this.searchText) {
        const search = this.searchText.toLowerCase();
        const titleMatch = grant.title.toLowerCase().includes(search);
        const descMatch = grant.description.toLowerCase().includes(search);
        if (!titleMatch && !descMatch) return false;
      }

      if (this.showOnlyQualified) {
        const match = this.matches.find(m => m.grant_id === grant.id);
        if (!match || !match.is_eligible) return false;
      } else {
        const text = (grant.title + ' ' + grant.description).toLowerCase();
        let pass = true;
        const anyFilterActive = this.filterUnemployment || this.filterFamily || this.filterDisability || this.filterExclusion;

        if (anyFilterActive) {
          let matchedAny = false;
          if (this.filterUnemployment && (text.includes('desempleo') || text.includes('paro'))) matchedAny = true;
          if (this.filterFamily && (text.includes('monoparental') || text.includes('familia numerosa'))) matchedAny = true;
          if (this.filterDisability && (text.includes('discapacidad') || text.includes('minusvalía'))) matchedAny = true;
          if (this.filterExclusion && (text.includes('exclusión social') || text.includes('vulnerabilidad'))) matchedAny = true;
          if (!matchedAny) pass = false;
        }
        if (!pass) return false;
      }
      return true;
    });
  }
  async toggleExpand(grantId: number) {
    if (this.expandedGrantId === grantId) {
      this.expandedGrantId = null;
      this.comments = [];
      this.newCommentText = '';
      this.replyingToId = null;
    } else {
      this.expandedGrantId = grantId;
      await this.loadComments(grantId);
    }
  }

  async loadComments(grantId: number) {
    try {
      const flatComments = await CommentsService.getComments(grantId);
      this.comments = this.buildCommentTree(flatComments);
    } catch (err) {
      console.error('Error cargando comentarios', err);
    }
  }

  buildCommentTree(flatComments: GrantComment[]): GrantComment[] {
    const commentMap = new Map<number, GrantComment>();
    const roots: GrantComment[] = [];

    // Initialize
    flatComments.forEach(c => {
      c.replies = [];
      commentMap.set(c.id, c);
    });

    // Build tree
    flatComments.forEach(c => {
      if (c.parent_id && commentMap.has(c.parent_id)) {
        commentMap.get(c.parent_id)!.replies!.push(c);
      } else {
        roots.push(c);
      }
    });

    return roots;
  }

  async postComment() {
    if (!this.isLoggedIn) {
      alert('Debes estar registrado e iniciar sesión para comentar.');
      return;
    }
    if (!this.expandedGrantId || !this.newCommentText.trim()) return;
    try {
      await CommentsService.addComment(this.expandedGrantId, this.newCommentText);
      this.newCommentText = '';
      await this.loadComments(this.expandedGrantId);
    } catch (err) {
      console.error('Error publicando comentario', err);
      alert('Error publicando comentario');
    }
  }

  toggleReply(commentId: number) {
    if (this.replyingToId === commentId) {
      this.replyingToId = null;
    } else {
      this.replyingToId = commentId;
      if (!this.replyTexts[commentId]) {
        this.replyTexts[commentId] = '';
      }
    }
  }

  async postReply(parentId: number) {
    if (!this.isLoggedIn) {
      alert('Debes estar registrado e iniciar sesión para responder.');
      return;
    }
    if (!this.expandedGrantId || !this.replyTexts[parentId]?.trim()) return;
    try {
      await CommentsService.addComment(this.expandedGrantId, this.replyTexts[parentId], parentId);
      this.replyTexts[parentId] = '';
      this.replyingToId = null;
      await this.loadComments(this.expandedGrantId);
    } catch (err) {
      console.error('Error publicando respuesta', err);
      alert('Error publicando respuesta');
    }
  }

  async reportComment(commentId: number) {
    if (confirm('¿Estás seguro de que quieres reportar este comentario?')) {
      try {
        await CommentsService.reportComment(commentId);
        alert('Comentario reportado');
      } catch (err) {
        console.error('Error reportando comentario', err);
        alert('Error reportando comentario');
      }
    }
  }

  isApplied(grantId: number) {
    return this.applications.some(a => a.grant_id === grantId);
  }

  getApplicationStatus(grantId: number): string {
    const app = this.applications.find(a => a.grant_id === grantId);
    return app?.status || 'applied';
  }

  getApplicationStatusLabel(grantId: number): string {
    const status = this.getApplicationStatus(grantId);
    const labels: Record<string, string> = {
      'interested': 'Interesado',
      'saved': 'Guardada',
      'applied': 'Aplicada',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'expired': 'Expirada'
    };
    return labels[status] || status;
  }

  async markAsApplied(grantId: number) {
    if (!this.isLoggedIn) {
      alert('Debes registrarte e iniciar sesión para solicitar una ayuda.');
      return;
    }
    try {
      const res = await api.client.post('/applications', {
        grant_id: grantId,
        status: 'applied',
        applied_at: new Date().toISOString()
      });
      this.applications.push(res.data);
    } catch (err) {
      console.error('Error al marcar como solicitada', err);
      alert('Error al marcar como solicitada');
    }
  }

async onFileSelected(event: any, grantId: number) {
  const file: File = event.target.files[0];
  if (!file) return;

  const application = this.applications.find(a => a.grant_id === grantId);
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      await api.client.put(`/applications/${application.id}/document`, {
        document_pdf: reader.result as string,
        document_name: file.name
      });
      await this.fetchData(); // Refrescamos para ver los cambios
    } catch (err) {
      alert('Error al subir');
    }
  };
  reader.readAsDataURL(file);
}

async deleteDocument(grantId: number) {
  const application = this.applications.find(a => a.grant_id === grantId);
  if (!application) return;

  try {
    await api.client.delete(`/applications/${application.id}/document`);
    await this.fetchData(); // Refrescamos para confirmar que se ha eliminado
  } catch (err) {
    console.error('Error al eliminar el documento', err);
    alert('Error al eliminar el documento.');
  }
}
getFileName(grantId: number): string {
  return this.applications.find(a => a.grant_id === grantId)?.document_name || 'Archivo adjunto';
}

getDocumentStatus(grantId: number): string {
  return this.applications.find(a => a.grant_id === grantId)?.document_status || 'Pending';
}

getAdminComments(grantId: number): string | null {
  return this.applications.find(a => a.grant_id === grantId)?.admin_comments || null;
}

  // Añade estos métodos a la clase SubsidesPage

  hasDocument(grantId: number): boolean {
    const application = this.applications.find(a => a.grant_id === grantId);
    return !!application?.has_document;
  }

  async downloadDocument(grantId: number) {
    const application = this.applications.find(a => a.grant_id === grantId);
    if (!application) return;

    try {
      const res = await api.client.get(`/applications/${application.id}/document`);
      const base64Data = res.data.document_pdf;

      // Crear un link temporal para la descarga
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = `documento_solicitud_${grantId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al descargar el documento', err);
      alert('No se pudo descargar el documento.');
    }
  }

  
  async generatePdfReport() {
    this.generatingPdf = true;
    try {
      // 1. Fetch user profile
      const profileRes = await api.client.get('/profile');
      const profile = profileRes.data;

      // 2. Prepare PDF
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Informe de Ayudas Solicitadas - LifeLift', 14, 22);
      
      // Datos del usuario
      doc.setFontSize(12);
      doc.text(`Nombre completo: ${profile.first_name} ${profile.surname_1} ${profile.surname_2 || ''}`, 14, 32);
      doc.text(`Documento (${profile.document_type}): ${profile.document_number}`, 14, 38);
      doc.text(`Fecha de nacimiento: ${new Date(profile.birth_date).toLocaleDateString()}`, 14, 44);
      if (profile.phone) doc.text(`Teléfono: ${profile.phone}`, 14, 50);
      if (profile.address) doc.text(`Dirección: ${profile.address}, ${profile.postal_code}, ${profile.province}`, 14, 56);
      
      // 3. Preparar datos de las solicitudes
      const tableData = this.applications.map(app => {
        const grant = this.grants.find(g => g.id === app.grant_id);
        const match = this.matches.find(m => m.grant_id === app.grant_id);
        
        const grantTitle = grant ? grant.title : 'Desconocida';
        const docName = app.document_name ? app.document_name : 'Ninguno';
        const dateStr = app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Desconocida';
        const status = app.status;
        const recommended = match?.is_eligible ? 'Sí (Recomendada)' : 'No (Manual)';
        
        return [grantTitle, docName, dateStr, status, recommended];
      });

      if (tableData.length === 0) {
        doc.text('No has solicitado ninguna ayuda.', 14, 70);
      } else {
        autoTable(doc, {
          startY: 65,
          head: [['Nombre de la Ayuda', 'Archivo Adjunto', 'Fecha', 'Estado', 'Recomendada']],
          body: tableData,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185] }
        });
      }

      // 4. Descargar
      doc.save(`informe_ayudas_${profile.document_number}.pdf`);
      
    } catch (err) {
      console.error('Error al generar el PDF', err);
      alert('Error al generar el reporte en PDF.');
    } finally {
      this.generatingPdf = false;
    }
  }
}

