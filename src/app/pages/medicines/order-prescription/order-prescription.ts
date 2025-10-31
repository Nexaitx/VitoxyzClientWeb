import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { API_URL, ENDPOINTS } from '@src/app/core/const';

@Component({
  selector: 'app-order-prescription',
  imports: [CommonModule,
     RouterModule,

  ],
  templateUrl: './order-prescription.html',
  styleUrl: './order-prescription.scss'
})
export class OrderPrescription {
 attachedFile: File | null = null;
  attachedPreview: string | null = null;
  showMobileSheet = false;
 isUploading = false;

  savedPrescriptions = [
    { id: 1, name: 'Prescription - 01.jpg' },
    { id: 2, name: 'Prescription - 02.pdf' },
  ];

  constructor(private router: Router, private http: HttpClient) {}

  onFileSelected(event: Event) {
    const el = event.target as HTMLInputElement;
    const files = el.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    this.attachedFile = file;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.attachedPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.attachedPreview = null;
    }

    this.closeSheet();
  }

  triggerFileInput() {
    document.getElementById('mobileFileInput')?.click();
  }

  openSavedPrescriptions() {
    const p = this.savedPrescriptions[0];
    if (p) {
      this.attachedFile = new File([], p.name);
      this.attachedPreview = null;
    }
    this.closeSheet();
  }

  removeAttachment() {
    this.attachedFile = null;
    this.attachedPreview = null;
  }

  onContinue() {
    if (!this.attachedFile) {
      alert('Please attach a prescription to continue.');
      return;
    }
    alert('Continue — upload logic goes here.');
     this.uploadPrescription(this.attachedFile);
  }
private uploadPrescription(file: File) {
  this.isUploading = true;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('medicineId', '');
  formData.append('medicineName', 'General Prescription');

  // ✅ Retrieve token safely
  const token = localStorage.getItem('authToken');

  // ✅ Use Angular HttpHeaders
  const headers = token
    ? new Headers({ Authorization: `Bearer ${token}` })
    : new Headers();

  // ✅ FIX: Use HttpHeaders (from @angular/common/http)
  const httpHeaders = token
    ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    : {};

  this.http.post<{ status: boolean; message: string; data?: any }>(
    `${API_URL}${ENDPOINTS.PRESCRIPTION}`,
    formData,
    httpHeaders
  ).subscribe({
    next: (res) => {
      this.isUploading = false;
      if (res.status) {
        alert('✅ ' + res.message);
        console.log('Upload success:', res.data);
        this.router.navigate(['/']);
      } else {
        alert('❌ Upload failed: ' + (res.message || 'Unknown error'));
      }
    },
    error: (err) => {
      this.isUploading = false;
      console.error('Upload error:', err);
      alert('❌ Something went wrong while uploading.');
    },
  });
}

  goBack() {
    this.router.navigate(['/']);
  }

  openSheet() {
    this.showMobileSheet = true;
  }

  closeSheet() {
    this.showMobileSheet = false;
  }
}
