import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinnerToastComponent } from "./core/toasts/spinner-toast/spinner-toast.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpinnerToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'VitoxyzAdmin';
}
