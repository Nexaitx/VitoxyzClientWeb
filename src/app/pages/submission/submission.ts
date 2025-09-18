import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-submission',
  imports: [],
  templateUrl: './submission.html',
  styleUrls: ['./submission.scss']
})
export class Submission {
  @Input() buttonType: string = 'Submit'; // Default value for buttonType
  @Input() disableButton: boolean = false;
   @Output() onSubmit = new EventEmitter<void>();

  ngOnInit() {
  }

  handleClick() {
    this.onSubmit.emit(); // Notify parent
  }
}
