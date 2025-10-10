import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

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

  savedPrescriptions = [
    { id: 1, name: 'Prescription - 01.jpg' },
    { id: 2, name: 'Prescription - 02.pdf' },
  ];

  constructor(private router: Router) {}

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
