import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinnerToastComponent } from "./core/toasts/spinner-toast/spinner-toast.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatSupport } from './pages/chat-support/chat-support';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    ChatSupport],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'VitoxyzAdmin';
  time: Date | null = null;
  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);
  token = localStorage.getItem('authToken')

  ngOnInit() { }
}
