import { Footer } from "../../components/footer/footer";
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}