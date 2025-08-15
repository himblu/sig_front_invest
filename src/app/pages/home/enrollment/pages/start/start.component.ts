import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start.component.html',
  styles: [
  ]
})
export class StartComponent implements OnInit {

constructor(
  private common: CommonService
) { }

  ngOnInit(){
    const studentID = Number(sessionStorage.getItem('studentID'));
    this.common.getLastState(studentID).subscribe({
      next: (resp) => {
        this.common.message(`${resp[0].msg} ${resp[0].state}`, '','info', '#2eb4d8');
        return;
      }
    })
  }
}
