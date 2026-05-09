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

  // Manual Filters
  filterUnemployment = false;
  filterFamily = false;
  filterDisability = false;
  filterExclusion = false;

  expandedGrantId: number | null = null;
  loading = true;

  constructor(private route: ActivatedRoute) {}

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
      console.error('Error fetching data', err);
    }
    this.loading = false;
  }

  get filteredGrants() {
    return this.grants.filter(grant => {
      // 1. Check if applied
      const isApplied = this.applications.some(a => a.grant_id === grant.id);
      if (this.hideApplied && isApplied) {
        return false;
      }

      // 2. Check if qualified
      if (this.showOnlyQualified) {
        const match = this.matches.find(m => m.grant_id === grant.id);
        if (!match || !match.is_eligible) {
          return false;
        }
      } else {
        // Manual Filtering based on text rules
        const text = (grant.title + ' ' + grant.description).toLowerCase();
        
        let pass = true;
        
        // If any manual filter is checked, we only show grants that match AT LEAST ONE checked filter 
        // OR we show all if no filters are checked.
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
      console.error('Error applying', err);
      alert('Error al marcar como aplicado');
    }
  }

  async onFileSelected(event: any, grantId: number) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('El archivo supera los 15MB permitidos.');
      return;
    }

    // Find the application ID for this grant
    const application = this.applications.find(a => a.grant_id === grantId);
    if (!application) {
      alert('Debes marcarla como aplicada antes de subir un documento.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        await api.client.put(`/applications/${application.id}/document`, {
          document_pdf: base64
        });
        alert('Documento subido correctamente.');
      } catch (err) {
        console.error(err);
        alert('Error al subir el documento.');
      }
    };
    reader.readAsDataURL(file);
  }
}
