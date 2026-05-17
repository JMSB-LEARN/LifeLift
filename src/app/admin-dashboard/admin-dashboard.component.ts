import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import AdminService from '../api/AdminService';
import AuthService from '../api/AuthService';
import { UserApplication } from '../api/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  applications: any[] = [];
  reportedComments: any[] = [];
  selectedApp: any = null;
  loading = true;
  saving = false;
  activeTab: 'applications' | 'comments' = 'applications';
  
  // Opciones de estado
  statusOptions = ['Pending', 'Correct', 'Missing Documents', 'Incorrect'];

  constructor(private router: Router) {}

  getApplicationStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'interested': 'Interesado',
      'saved': 'Guardada',
      'applied': 'Aplicada',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'expired': 'Expirada'
    };
    return labels[status?.toLowerCase() || 'applied'] || (status || 'applied');
  }

  async ngOnInit() {
    if (!AuthService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    await this.loadApplications();
  }

  async loadApplications() {
    this.loading = true;
    try {
      this.applications = await AdminService.getAllApplications();
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
    } finally {
      this.loading = false;
    }
  }

  async loadReportedComments() {
    this.loading = true;
    try {
      this.reportedComments = await AdminService.getReportedComments();
    } catch (err) {
      console.error('Error cargando comentarios reportados:', err);
    } finally {
      this.loading = false;
    }
  }

  async switchTab(tab: 'applications' | 'comments') {
    this.activeTab = tab;
    this.selectedApp = null;
    if (tab === 'applications') {
      await this.loadApplications();
    } else {
      await this.loadReportedComments();
    }
  }

  async deleteComment(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      try {
        await AdminService.deleteComment(id);
        await this.loadReportedComments();
      } catch (err) {
        console.error('Error eliminando comentario', err);
        alert('Error al eliminar comentario');
      }
    }
  }

  async dismissReports(id: number) {
    if (confirm('¿Estás seguro de que quieres ignorar los reportes de este comentario?')) {
      try {
        await AdminService.dismissCommentReports(id);
        await this.loadReportedComments();
      } catch (err) {
        console.error('Error descartando reportes', err);
        alert('Error al descartar reportes');
      }
    }
  }

  selectApplication(app: any) {
    // Clona el objeto para editar sin afectar la lista original hasta guardar
    this.selectedApp = { ...app };
    if (!this.selectedApp.document_status) {
      this.selectedApp.document_status = 'Pending';
    }
  }

  async saveStatus() {
    if (!this.selectedApp) return;
    this.saving = true;
    try {
      const updated = await AdminService.updateApplicationStatus(
        this.selectedApp.id,
        this.selectedApp.document_status,
        this.selectedApp.admin_comments
      );
      
      // Actualiza en la lista
      const index = this.applications.findIndex(a => a.id === this.selectedApp.id);
      if (index !== -1) {
        this.applications[index].document_status = updated.document_status;
        this.applications[index].admin_comments = updated.admin_comments;
      }
      
      this.selectedApp = null;
    } catch (err) {
      console.error('Error guardando estado:', err);
      alert('Error guardando el estado');
    } finally {
      this.saving = false;
    }
  }

  async downloadDocument(id: number, document_name: string) {
    try {
      const docData = await AdminService.getApplicationDocument(id);
      const link = document.createElement('a');
      link.href = docData.document_pdf;
      link.download = docData.document_name || document_name || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error descargando documento:', err);
      alert('Error al descargar el documento.');
    }
  }

  closeEditor() {
    this.selectedApp = null;
  }
}
