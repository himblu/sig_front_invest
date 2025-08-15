import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

interface DayOfWeek {
  id: number;
  name: string;
  key: number;
}

interface DayAvailability {
  [day: number]: Schedule[];
}

interface ClassroomAvailability {
  classroom: string;
  availability: DayAvailability[];
}

interface Schedule {
  [hour: string]: boolean;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  {id: 0, name: 'Lunes', key: 0},
  {id: 1, name: 'Martes', key: 1},
  {id: 2, name: 'Miércoles', key: 2},
  {id: 3, name: 'Jueves', key: 3},
  {id: 4, name: 'Viernes', key: 4},
  {id: 5, name: 'Sábado', key: 5},
  {id: 6, name: 'Domingo', key: 6},
];

const CLASSROOM_AVAILABILITY: ClassroomAvailability = {
  availability: [
    {
      0: [
        {
          '00:00': true
        },
        {
          '01:00': true
        },
        {
          '02:00': true
        },
        {
          '03:00': true
        },
        {
          '04:00': true
        },
        {
          '05:00': true
        },
        {
          '06:00': true
        },
        {
          '07:00': true
        },
        {
          '08:00': true
        }
      ]
    }
  ],
  classroom: 'AULA 1'
}

@Component({
  selector: 'app-hours-per-classroom',
  templateUrl: './hours-per-classroom.component.html',
  styleUrls: ['./hours-per-classroom.component.css'],
  imports: [
    NgForOf,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  standalone: true
})

export class HoursPerClassroomComponent {
  public hours: string[] = [];
  public daysOfWeek: DayOfWeek[] = DAYS_OF_WEEK;
  public classroomAvailability: ClassroomAvailability;
  constructor() {
    this.fillHours();
  }

  private fillHours(): void {
    for (let hour: number = 0; hour < 24; hour++) {
      const formattedHour: string = hour.toString().padStart(2, '0') + ':00';
      this.hours.push(formattedHour);
    }
  }
}
