import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-profile-page',
  standalone: true, // Asegúrate de marcarlo como standalone si usas Angular 17+
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile-page.html',
  styleUrl: './my-profile-page.css',
})
export class MyProfilePage {
  editMode = false;

  // Listados para selectores españoles
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
    housemates: [
      {
        name: '',
        relation: '',
        livesWith: true,
        dependent: false,
        directRelative: false,
        income: 0,
        disability: false,
        age: '',
      },
    ],
    totalHouseholdIncome: 0,
  };

  constructor() {
    // Inicializar lista completa de provincias
    this.provinciasLista = Object.values(this.comunidadesProvincias).flat().sort();
  }

  // Lógica para asignar Región automáticamente al cambiar Provincia
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

  saveProfile() {
    this.updateTotalIncome();
    this.editMode = false;
    // Aquí iría la lógica de persistencia (API)
  }

  addHousemate() {
    this.profile.housemates.push({
      name: '',
      relation: '',
      livesWith: true,
      dependent: false,
      directRelative: false,
      income: 0,
      disability: false,
      age: '',
    });
  }

  removeHousemate(index: number) {
    this.profile.housemates.splice(index, 1);
  }

  yesNo(value: boolean) {
    return value ? 'Sí' : 'No';
  }
}