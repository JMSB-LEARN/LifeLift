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
  selectedApp: any = null;
  loading = true;
  saving = false;
  
  // Opciones de estado
  statusOptions = ['Pending', 'Correct', 'Missing Documents', 'Incorrect'];

  constructor(private router: Router) {}

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
      const pdfBase64 = await AdminService.getApplicationDocument(id);
      const link = document.createElement('a');
      link.href = pdfBase64;
      link.download = document_name || 'documento.pdf';
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
