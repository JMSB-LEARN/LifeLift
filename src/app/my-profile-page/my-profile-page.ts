import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { api } from '../api/ApiClient';
import AuthService from '../api/AuthService';
import { Housemate } from '../api/models';

@Component({
  selector: 'app-my-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile-page.html',
  styleUrl: './my-profile-page.css',
})
export class MyProfilePage implements OnInit {
  editMode = false;
  hasProfile = false;
  hasSocioEconomic = false;
  deletedHousemateIds: number[] = [];

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  readonly comunidadesProvincias: { [key: string]: string[] } = {
    'Andalucía': ['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla'],
    'Aragón': ['Huesca', 'Teruel', 'Zaragoza'],
    'Asturias': ['Asturias'],
    'Islas Baleares': ['Islas Baleares'],
    'Canarias': ['Las Palmas', 'Santa Cruz de Tenerife'],
    'Cantabria': ['Cantabria'],
    'Castilla y León': ['Ávila', 'Burgos', 'León', 'Palencia', 'Salamanca', 'Segovia', 'Soria', 'Valladolid', 'Zamora'],
    'Castilla-La Mancha': ['Albacete', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Toledo'],
    'Cataluña': ['Barcelona', 'Gerona', 'Lérida', 'Tarragona'],
    'Comunidad Valenciana': ['Alicante', 'Castellón', 'Valencia'],
    'Extremadura': ['Badajoz', 'Cáceres'],
    'Galicia': ['La Coruña', 'Lugo', 'Orense', 'Pontevedra'],
    'Madrid': ['Madrid'],
    'Murcia': ['Murcia'],
    'Navarra': ['Navarra'],
    'País Vasco': ['Álava', 'Guipúzcoa', 'Vizcaya'],
    'La Rioja': ['La Rioja'],
    'Ceuta': ['Ceuta'],
    'Melilla': ['Melilla']
  };

  provinciasLista: string[] = [];

  nivelesEstudio = ['Sin estudios', 'Educación Primaria', 'ESO', 'Bachillerato', 'FP Grado Medio', 'FP Grado Superior', 'Grado Universitario', 'Máster/Doctorado'];
  situacionesLaborales = ['Cuenta ajena (Tiempo completo)', 'Cuenta ajena (Tiempo parcial)', 'Autónomo', 'Desempleado', 'ERTE', 'Pensionista', 'Estudiante'];

  profile = {
    username: '',
    email: '',
    emailVerified: false,
    firstName: '',
    lastName: '',
    secondLastName: '',
    birthDate: '',
    idNumber: '', // DNI/NIE
    sex: '',
    city: '',
    gender: '',
    nationality: 'Española',
    immigrationStatus: 'Residente permanente',
    phone: '',
    address: '',
    postalCode: '',
    province: '',
    region: '',
    educationLevel: '',
    employmentStatus: '',
    contractType: '',
    grossMonthlyIncome: 0,
    netMonthlyIncome: 0,
    receivesBenefit: false,
    benefitType: '',
    disability: false,
    disabilityPercentage: null as number | null,
    dependency: false,
    dependencyDegree: null as number | null,
    genderViolence: false,
    largeFamily: false,
    singleParent: false,
    caregiver: false,
    socialExclusionRisk: false,
    immigrantRefugeeAsylum: false,
    numberOfChildren: 0,
    childrenDependent: false,
    minorsDependent: false,
    elderlyDependent: false,
    personsDependent: false,
    householdSize: 1,
    livesWithOthers: false,
    housemates: [] as {
      id?: number;
      name: string;
      relation: string;
      livesWith: boolean;
      dependent: boolean;
      directRelative: boolean;
      income: number;
      disability: boolean;
      age: string;
      birthDate?: string;
    }[],
    totalHouseholdIncome: 0,
  };

  constructor() {
    this.provinciasLista = Object.values(this.comunidadesProvincias).flat().sort();
  }

  async ngOnInit() {
    const user = AuthService.getCurrentUser();
    if (user) {
      this.profile.username = user.username || '';
      this.profile.email = user.email || '';
    }
    await this.loadProfileData();
  }

  async loadProfileData() {
    try {
      try {
        const profRes = await api.client.get('/profile');
        const p = profRes.data;
        this.hasProfile = true;
        this.profile.firstName = p.first_name || '';
        this.profile.lastName = p.surname_1 || '';
        this.profile.secondLastName = p.surname_2 || '';
        this.profile.birthDate = p.birth_date ? p.birth_date.split('T')[0] : '';
        this.profile.idNumber = p.document_number || '';
        this.profile.phone = p.phone || '';
        this.profile.address = p.address || '';
        this.profile.postalCode = p.postal_code || '';
        this.profile.province = p.province || '';
        this.profile.region = p.autonomous_community || '';
        this.profile.genderViolence = !!p.is_gender_violence_victim;
      } catch (e) {
        this.hasProfile = false;
      }

      try {
        const socRes = await api.client.get('/socio-economic');
        const s = socRes.data;
        this.hasSocioEconomic = true;
        this.profile.educationLevel = s.education_level || '';
        this.profile.employmentStatus = s.employment_status || '';
        this.profile.grossMonthlyIncome = s.gross_annual_income ? Math.round(s.gross_annual_income / 12) : 0;
        this.profile.largeFamily = !!s.is_large_family;
        this.profile.disability = !!s.has_disability;
        this.profile.disabilityPercentage = s.disability_percentage || null;
        this.profile.singleParent = !!s.is_single_parent;
        this.profile.socialExclusionRisk = !!s.exclusion_risk;
        this.profile.dependencyDegree = s.dependency_grade || null;
        this.profile.dependency = !!s.dependency_grade && s.dependency_grade > 0;
        this.profile.numberOfChildren = s.number_of_children || 0;
      } catch (e) {
        this.hasSocioEconomic = false;
      }

      try {
        const hmRes = await api.client.get('/housemates');
        const hm = hmRes.data;
        if (hm) {
          this.profile.housemates = hm.map((h: Housemate) => ({
            id: h.id,
            name: h.full_name || '',
            relation: h.relation || 'Other',
            livesWith: h.lives_with !== false,
            dependent: !!h.is_dependent,
            income: h.income_annual ? Math.round(h.income_annual / 12) : 0,
            birthDate: h.birth_date ? h.birth_date.split('T')[0] : '',
            directRelative: false,
            disability: false,
            age: ''
          }));
          this.profile.livesWithOthers = true;
        } else {
          this.profile.housemates = [];
        }
      } catch (e) {
        console.error('Error cargando convivientes', e);
      }
      
      this.profile.householdSize = this.profile.housemates.length + 1;
      this.updateTotalIncome();
    } catch (err) {
      console.error('Error cargando datos completos del perfil:', err);
    }
  }

  // Asigna automáticamente la Comunidad Autónoma al cambiar Provincia
  onProvinceChange(newProvince: string) {
    for (const [region, provincias] of Object.entries(this.comunidadesProvincias)) {
      if (provincias.includes(newProvince)) {
        this.profile.region = region;
        break;
      }
    }
  }

  get age() {
    if (!this.profile.birthDate) return '';
    const today = new Date();
    const birth = new Date(this.profile.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  updateTotalIncome() {
    const housematesIncome = this.profile.housemates.reduce((sum, member) => sum + Number(member.income || 0), 0);
    this.profile.totalHouseholdIncome = Number(this.profile.grossMonthlyIncome || 0) + housematesIncome;
  }

  async saveProfile() {
    if (this.newPassword || this.currentPassword || this.confirmPassword) {
      if (!this.currentPassword) {
        alert('Debes ingresar tu contraseña actual para cambiarla.');
        return;
      }
      if (!this.newPassword) {
        alert('Debes ingresar una nueva contraseña.');
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        alert('Las contraseñas nuevas no coinciden.');
        return;
      }
      try {
        await api.client.put('/change-password', {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword
        });
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      } catch (err: any) {
        console.error('Error cambiando contraseña', err);
        alert(err.response?.data?.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.');
        return;
      }
    }

    this.updateTotalIncome();
    
    const docNumber = (this.profile.idNumber || '').toUpperCase();
    let docType = 'Passport';
    if (/^[0-9]{8}[A-Z]$/.test(docNumber)) {
      docType = 'DNI';
    } else if (/^[XYZ][0-9]{7}[A-Z]$/.test(docNumber)) {
      docType = 'NIE';
    }

    const profilePayload = {
      first_name: this.profile.firstName,
      surname_1: this.profile.lastName,
      surname_2: this.profile.secondLastName || null,
      birth_date: this.profile.birthDate || null,
      document_number: this.profile.idNumber,
      document_type: docType,
      phone: this.profile.phone || null,
      address: this.profile.address || null,
      postal_code: this.profile.postalCode || null,
      province: this.profile.province || null,
      autonomous_community: this.profile.region || null,
      is_gender_violence_victim: this.profile.genderViolence
    };

    const socioPayload = {
      education_level: this.profile.educationLevel,
      employment_status: this.profile.employmentStatus,
      gross_annual_income: (this.profile.grossMonthlyIncome || 0) * 12,
      is_large_family: this.profile.largeFamily,
      has_disability: this.profile.disability,
      disability_percentage: this.profile.disability ? (this.profile.disabilityPercentage || 0) : 0,
      is_single_parent: this.profile.singleParent,
      exclusion_risk: this.profile.socialExclusionRisk,
      dependency_grade: this.profile.dependency ? (this.profile.dependencyDegree || 1) : 0,
      number_of_children: this.profile.numberOfChildren || 0
    };

    try {
      // Guardar Perfil
      if (this.hasProfile) {
        await api.client.put('/profile', profilePayload);
      } else {
        await api.client.post('/profile', profilePayload);
        this.hasProfile = true;
      }

      // Guardar Datos Socioeconómicos
      if (this.hasSocioEconomic) {
        await api.client.put('/socio-economic', socioPayload);
      } else {
        await api.client.post('/socio-economic', socioPayload);
        this.hasSocioEconomic = true;
      }

      // Eliminar convivientes eliminados
      for (const id of this.deletedHousemateIds) {
        try {
          await api.client.delete(`/housemates/${id}`);
        } catch(e) { 
          console.error('Fallo al eliminar conviviente', id); 
        }
      }
      this.deletedHousemateIds = [];

      // Añadir / Actualizar convivientes
      for (const hm of this.profile.housemates) {
        const hmPayload = {
          full_name: hm.name,
          relation: hm.relation || 'Other',
          lives_with: hm.livesWith,
          is_dependent: hm.dependent,
          income_annual: (hm.income || 0) * 12,
          birth_date: hm.birthDate || null
        };
        
        if (hm.id) {
          await api.client.put(`/housemates/${hm.id}`, hmPayload);
        } else {
          const res = await api.client.post('/housemates', hmPayload);
          hm.id = res.data.id;
        }
      }

      this.profile.householdSize = this.profile.housemates.length + 1;
      this.editMode = false;
    } catch (err) {
      console.error('Error guardando datos del perfil', err);
      alert('Hubo un error al guardar los datos.');
    }
  }

  addHousemate() {
    this.profile.housemates.push({
      name: '',
      relation: 'Other',
      livesWith: true,
      dependent: false,
      directRelative: false,
      income: 0,
      disability: false,
      age: '',
      birthDate: ''
    });
  }

  removeHousemate(index: number) {
    const removed = this.profile.housemates.splice(index, 1)[0];
    if (removed.id) {
      this.deletedHousemateIds.push(removed.id);
    }
    this.updateTotalIncome();
  }

  yesNo(value: boolean) {
    return value ? 'Sí' : 'No';
  }

  getRelationLabel(rel: string): string {
    const map: Record<string, string> = {
      Parent: 'Padre / Madre',
      Child: 'Hijo/a',
      Sibling: 'Hermano/a',
      Partner: 'Pareja',
      Grandparent: 'Abuelo/a',
      Other: 'Otro'
    };
    return map[rel] || rel;
  }
}
