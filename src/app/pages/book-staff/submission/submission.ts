import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-submission',
  imports: [],
  templateUrl: './submission.html',
  styleUrl: './submission.scss'
})
export class Submission {
@Input() buttonType: string = 'Submit'; // Default value for buttonType
ngOnInit() {
  // You can initialize or perform any setup here if needed
  console.log('Submission component initialized with buttonType:', this.buttonType);
  // Additional initialization logic can go here
  }
}
