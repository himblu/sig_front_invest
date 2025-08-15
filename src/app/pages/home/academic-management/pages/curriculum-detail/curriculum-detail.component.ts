import { Component, OnDestroy, OnInit } from '@angular/core';
import { Curriculum, CurriculumPeriod } from '@utils/interfaces/campus.interfaces';
import { DecimalPipe, NgForOf, NgTemplateOutlet } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HoursPerSubjectPipe } from '../../pipes/hours-per-subject.pipe';
import { HoursPerUnitPipe } from '../../pipes/hours-per-unit.pipe';

@Component({
  selector: 'app-curriculum-detail',
  standalone: true,
  imports: [
    NgForOf,
    DecimalPipe,
    MatTooltipModule,
    MatRippleModule,
    NgTemplateOutlet,
    HoursPerSubjectPipe,
    HoursPerUnitPipe
  ],
  templateUrl: './curriculum-detail.component.html',
  styleUrls: ['./curriculum-detail.component.scss']
})

export class CurriculumDetailComponent extends OnDestroyMixin implements OnInit, OnDestroy {
  public periods: CurriculumPeriod[] = [];
  public curriculum: Curriculum;
  constructor(
      private readonly activatedRoute: ActivatedRoute
  ) {
    super();
  }

  public ngOnInit(): void {
    this.getDataFromResolver();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private getDataFromResolver(): void {
    this.activatedRoute.data
      .pipe(
          untilComponentDestroyed(this),
          map((value: any) => value['resolver']))
      .subscribe({
        next: (value: { periods: CurriculumPeriod[], curriculum: Curriculum }) => {
          console.log({ value });
          this.periods = value.periods;
          this.curriculum = value.curriculum
        },
      });
  }

  public trackByPeriod(index: number, period: CurriculumPeriod): number {
    return period.number;
  }
}
