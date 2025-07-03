import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-authorization',
  imports: [RouterOutlet,
    RouterLink
  ],
  templateUrl: './authorization.html',
  styleUrl: './authorization.scss'
})
export class Authorization {

}
