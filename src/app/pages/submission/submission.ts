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
  }
}
