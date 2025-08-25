import { Component, OnInit } from '@angular/core';
interface Day {
  date: number;
  name: string;
  isToday?: boolean;
}

@Component({
  selector: 'app-diet-dashboard',
  imports: [],
  templateUrl: './diet-dashboard.html',
  styleUrl: './diet-dashboard.scss'
})
export class DietDashboard implements OnInit {
  weekDays: Day[] = [];

  ngOnInit(): void {
    this.generateWeek();
  }

  generateWeek() {
  const today = new Date();
  const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  // Calculate Monday of the current week
  const weekStart = new Date(today);
  const diffToMonday = (dayIndex === 0 ? -6 : 1 - dayIndex);
  weekStart.setDate(today.getDate() + diffToMonday);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  this.weekDays = []; // reset array
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);

    this.weekDays.push({
      date: d.getDate(),
      name: dayNames[d.getDay()],
      isToday: d.toDateString() === today.toDateString(),
    });
  }
}


  selectDay(day: Day) {
    this.weekDays.forEach(d => (d.isToday = false));
    day.isToday = true;
  }
}
