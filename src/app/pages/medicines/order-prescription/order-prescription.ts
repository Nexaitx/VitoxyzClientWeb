import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { API_URL1, ENDPOINTS } from '@src/app/core/const';

@Component({
  selector: 'app-order-prescription',
  imports: [
    CommonModule,
     RouterModule,
     FormsModule

  ],
  templateUrl: './order-prescription.html',
  styleUrl: './order-prescription.scss'
})
export class OrderPrescription implements OnInit {

  ngOnInit(): void {
  this.loadPrescriptions();
}
 attachedFile: File | null = null;
  attachedPreview: string | null = null;
  attachedViewUrl: string | null = null;
  openDropdownId: number | null = null;
  showMobileSheet = false;
 isUploading = false;
 isUploaded = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  medicines: any[] = [];
  savedPrescriptions: any[] = [];

  showPrescriptionModal = false;
  selectedPrescription: any = null;

  showEditPrescriptionModal = false;
  showDeletePrescriptionModal = false;

  editingPrescription: any = null;
  deletingPrescription: any = null;

  isUpdatingPrescription = false;
  isDeletingPrescription = false;

  showImagePreviewModal = false;
  previewImageUrl: string | null = null;
  previewFileName: string = '';

  imageZoom = 1;
  readonly minImageZoom = 0.5;
  readonly maxImageZoom = 3;
  readonly imageZoomStep = 0.25;



  constructor(private router: Router, private http: HttpClient) {}

  toggleDropdown(id: number): void {
  this.openDropdownId =
    this.openDropdownId === id ? null : id;
}


zoomIn(): void {
  this.imageZoom = Math.min(
    this.imageZoom + this.imageZoomStep,
    this.maxImageZoom
  );
}

zoomOut(): void {
  this.imageZoom = Math.max(
    this.imageZoom - this.imageZoomStep,
    this.minImageZoom
  );
}

resetZoom(): void {
  this.imageZoom = 1;
}

onImageWheel(event: WheelEvent): void {
  event.preventDefault();

  if (event.deltaY < 0) {
    this.zoomIn();
  } else {
    this.zoomOut();
  }
}

closeDropdown(): void {
  this.openDropdownId = null;
}

onFileSelected(event: Event) {
  const el = event.target as HTMLInputElement;
  const files = el.files;

  if (!files || files.length === 0) return;

  const file = files[0];

  this.isUploaded = false;
  this.medicines = [];
  this.message = '';

  this.attachedFile = file;

// Remove previous local URL
if (this.attachedViewUrl) {
  URL.revokeObjectURL(this.attachedViewUrl);
}

// Create local URL so user can view image/PDF
this.attachedViewUrl = URL.createObjectURL(file);

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

  triggerCameraInput() {
    document.getElementById('mobileCameraInput')?.click();
  }

  openUploadOptions() {
  if (window.innerWidth <= 767) {
    this.openSheet();
  } else {
    document.getElementById('fileInput')?.click();
  }
}

openSavedPrescriptions(): void {
  this.loadPrescriptions();
  this.closeSheet();
}

  removeAttachment() {
  if (this.isUploaded) return;

  if (this.attachedViewUrl) {
    URL.revokeObjectURL(this.attachedViewUrl);
  }

  this.attachedFile = null;
  this.attachedPreview = null;
  this.attachedViewUrl = null;
  this.medicines = [];
}

  openPrescriptionImage(url: string, fileName: string): void {
    this.previewImageUrl = url;
    this.previewFileName = fileName;

    // Always start at 100%
    this.imageZoom = 1;

    this.showImagePreviewModal = true;
  }

  closeImagePreviewModal(): void {
    this.showImagePreviewModal = false;
    this.previewImageUrl = null;
    this.previewFileName = '';
    this.imageZoom = 1;
  }

  viewPrescription() {
  if (this.attachedViewUrl) {
    window.open(this.attachedViewUrl, '_blank');
  }
}

  // onContinue() {
  //   if (!this.attachedFile) {
  //     alert('Please attach a prescription to continue.');
  //     return;
  //   }
  //    alert('Continue — upload logic goes here.');
  //    this.uploadPrescription(this.attachedFile);
  // }
  onContinue() {
  if (!this.attachedFile) {
    this.message = 'Please attach a prescription to continue.';
    this.messageType = 'error';
    return;
  }

  this.message = ''; 
  this.uploadPrescription(this.attachedFile);
}

private uploadPrescription(file: File) {
  this.isUploading = true;
  this.message = '';

  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('authToken');

  const httpHeaders = token
  ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
  : {};

  this.http.post<any>(
    `${API_URL1}${ENDPOINTS.PRESCRIPTION}`,
    formData,
    httpHeaders
  ).subscribe({
    next: (res) => {
      this.isUploading = false;

      if (res.success) {
        this.message = res.message;
        this.messageType = 'success';

        this.isUploaded = true;

        // Store extracted medicines
        this.medicines = res.medicines || [];

        // Use uploaded prescription URL for View
        if (res.s3Url) {
          this.attachedViewUrl = res.s3Url;
        }

        this.loadPrescriptions();

        console.log('Prescription response:', res);
      } else {
        this.message = res.message || 'Prescription upload failed.';
        this.messageType = 'error';
      }
    },

    error: (err) => {
      this.isUploading = false;

      console.error('Upload error:', err);

      this.message =
        'Something went wrong while uploading the prescription. Please try again.';
      this.messageType = 'error';
    }
  });
}

  private loadPrescriptions(): void {
    const token = localStorage.getItem('authToken');

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<any[]>(
      `${API_URL1}${ENDPOINTS.PRESCRIPTIONS}`,
      { headers }
    ).subscribe({
      next: (res) => {
        this.savedPrescriptions = res || [];
      },
      error: (err) => {
        console.error('Failed to load prescriptions:', err);
      }
    });
  }

  viewSavedPrescription(id: number): void {
    const token = localStorage.getItem('authToken');

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<any>(
      `${API_URL1}${ENDPOINTS.PRESCRIPTION_BY_ID(id)}`,
      { headers }
    ).subscribe({
      next: (res) => {
        this.selectedPrescription = res;
        this.showPrescriptionModal = true;
      },
      error: (err) => {
        console.error('Failed to load prescription:', err);
      }
    });
  }

  editPrescription(id: number): void {
    this.closeDropdown();

    const token = localStorage.getItem('authToken');

    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      : new HttpHeaders();

    this.http.get<any>(
      `${API_URL1}${ENDPOINTS.PRESCRIPTION_BY_ID(id)}`,
      { headers }
    ).subscribe({
      next: (res) => {

        // Clone response so table data is not changed
        // until user actually clicks Update
        this.editingPrescription = {
          ...res,
          medicines: (res.medicines || []).map((medicine: any) => ({
            medicineName: medicine.medicineName || '',
            dosage: medicine.dosage || '',
            frequency: medicine.frequency || '',
            duration: medicine.duration || '',
            quantity: medicine.quantity || 0,
            specialInstructions: medicine.specialInstructions || ''
          }))
        };

        this.showEditPrescriptionModal = true;
      },

      error: (err) => {
        console.error('Failed to load prescription for editing:', err);
      }
    });
  }

  updatePrescription(): void {

    if (!this.editingPrescription) {
      return;
    }

    this.isUpdatingPrescription = true;

    const token = localStorage.getItem('authToken');

    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      : new HttpHeaders({
          'Content-Type': 'application/json'
        });

    const medicines = this.editingPrescription.medicines.map(
      (medicine: any) => ({
        medicineName: medicine.medicineName,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        duration: medicine.duration,
        quantity: Number(medicine.quantity),
        specialInstructions: medicine.specialInstructions
      })
    );

    this.http.put<any>(
      `${API_URL1}${ENDPOINTS.PRESCRIPTION_UPDATE(this.editingPrescription.id)}`,
      medicines,
      { headers }
    ).subscribe({
      next: (res) => {

        this.isUpdatingPrescription = false;

        console.log('Prescription updated successfully:', res);

        this.showEditPrescriptionModal = false;
        this.editingPrescription = null;

        // Refresh table
        this.loadPrescriptions();
      },

      error: (err) => {

        this.isUpdatingPrescription = false;

        console.error('Failed to update prescription:', err);

        this.message =
          'Failed to update prescription. Please try again.';

        this.messageType = 'error';
      }
    });
  }

  addMedicineToPrescription(): void {
    if (!this.editingPrescription) {
      return;
    }

    this.editingPrescription.medicines.push({
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 0,
      specialInstructions: ''
    });
  }

  removeMedicineFromPrescription(index: number): void {
      if (!this.editingPrescription) {
        return;
      }

      this.editingPrescription.medicines.splice(index, 1);
    }

  confirmDeletePrescription(prescription: any): void {
  this.closeDropdown();

  this.deletingPrescription = prescription;
  this.showDeletePrescriptionModal = true;
  }

  deletePrescription(): void {

    if (!this.deletingPrescription) {
      return;
    }

    this.isDeletingPrescription = true;

    const token = localStorage.getItem('authToken');

    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      : new HttpHeaders();

    this.http.delete<any>(
      `${API_URL1}${ENDPOINTS.PRESCRIPTION_DELETE(
        this.deletingPrescription.id
      )}`,
      { headers }
    ).subscribe({
      next: (res) => {

        this.isDeletingPrescription = false;

        console.log('Prescription deleted:', res);

        this.showDeletePrescriptionModal = false;
        this.deletingPrescription = null;

        // Refresh table
        this.loadPrescriptions();
      },

      error: (err) => {

        this.isDeletingPrescription = false;

        console.error('Failed to delete prescription:', err);

        this.message =
          'Failed to delete prescription. Please try again.';

        this.messageType = 'error';
      }
    });
  }

  closeEditPrescriptionModal(): void {
    this.showEditPrescriptionModal = false;
    this.editingPrescription = null;
  }

  closeDeletePrescriptionModal(): void {
    this.showDeletePrescriptionModal = false;
    this.deletingPrescription = null;
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

  closePrescriptionModal(): void {
  this.showPrescriptionModal = false;
  this.selectedPrescription = null;
}
}
