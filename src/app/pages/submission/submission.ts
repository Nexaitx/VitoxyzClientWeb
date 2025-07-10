import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-submission',
  imports: [],
  templateUrl: './submission.html',
  styleUrl: './submission.scss'
})
export class Submission {
  @Input() buttonType: string = 'Submit'; // Default value for buttonType
   @Output() onSubmit = new EventEmitter<void>();

  ngOnInit() {
  }

  handleClick() {
    this.onSubmit.emit(); // Notify parent
  }
}
