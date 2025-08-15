import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { InterceptorService } from '@services/interceptor.service';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getSpanishPaginatorIntl } from '@utils/paginator/spanish-paginator.intl';
import localEs from '@angular/common/locales/es';
import { DatePipe, registerLocaleData } from '@angular/common';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import {LoadingComponent} from "@shared/loading/loading.component";
registerLocaleData(localEs);

@NgModule({
  declarations: [
    AppComponent,
  ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        CalendarModule.forRoot({provide: DateAdapter, useFactory: adapterFactory}),
        PdfViewerModule,
        LoadingComponent,
    ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
    {
      provide: MatPaginatorIntl,
      useValue: getSpanishPaginatorIntl()
    },
		{
			provide: LOCALE_ID,
			useValue: 'es-EC'
		},
		{
			provide: MAT_DATE_LOCALE,
			useValue: 'es-EC'
		},
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: {
				appearance: 'outline'
			}
		},
		DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
