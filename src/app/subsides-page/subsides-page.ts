import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

  // Filtros Manuales
  filterUnemployment = false;
  filterFamily = false;
  filterDisability = false;
  filterExclusion = false;
  searchText: string = '';

  expandedGrantId: number | null = null;
  loading = true;

  constructor(private route: ActivatedRoute) { }
  
  
  


  async ngOnInit() {
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
      const [grantsRes, appsRes, matchesRes] = await Promise.all([
        api.client.get('/grants'),
        api.client.get('/applications'),
        api.client.get('/grant-matches')
      ]);
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
  toggleExpand(grantId: number) {
    if (this.expandedGrantId === grantId) {
      this.expandedGrantId = null;
    } else {
      this.expandedGrantId = grantId;
    }
  }

  isApplied(grantId: number) {
    return this.applications.some(a => a.grant_id === grantId);
  }

  async markAsApplied(grantId: number) {
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

  
}

