import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, ChangeDetectionStrategy, SecurityContext } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { DatePipe, NgClass, NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { ROL } from '@utils/interfaces/login.interfaces';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { UserService } from '@services/user.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ManagementInboxSent, MessageManagementContent, MessageReply } from '@utils/interfaces/others.interfaces';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { ReplyProcedureComponent } from '../../components/reply-procedure/reply-procedure.component';
import { SubResponseComponent } from '../../components/sub-response/sub-response.component';
import { ForwardComponent } from '../../components/forward/forward.component';

@Component({
  selector: 'app-inbox-procedure',
	standalone: true,
  templateUrl: './inbox-procedure.component.html',
  styleUrls: ['./inbox-procedure.component.css'],
	imports: [
		ReactiveFormsModule,
		NgForOf,
		NgFor,
		NgIf,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatDialogModule,
		MatExpansionModule,
		MatPaginatorModule,
		MatDatepickerModule,
		MatNativeDateModule,
		NgClass,
		MatMenuModule,
		MatSnackBarModule,
		//ReplyProcedureComponent,
		DatePipe,
		SubResponseComponent
	],
	providers: [
    DatePipe
  ],
})

export class InboxProcedureComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	protected readonly ROL = ROL;
	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
	public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public messages: ManagementInboxSent[] = [];
	public isClicked: string;
	public currentMessage: MessageManagementContent;
	public messageReplies: MessageReply[] = [];

	@ViewChild('accordion') accordion: MatAccordion;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private dialog: MatDialog = inject(MatDialog);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public user: UserService,
		private datePipe: DatePipe, ){
		super();
		this.initFiltersForm();
	}

	ngOnInit(): void {
		this.getManagementInbox();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initFiltersForm(): void {
		this.filtersForm= this.fb.group({
			typeMessage: [0],
			userID: [this.user.currentUser.userId],
			studentID: +sessionStorage.getItem('studentID')! || 0,
			startDate: [''],
			endDate: [''],
			filter: [''],
			page: [1],
			size: [10],
			rolID: +sessionStorage.getItem('rolID')
		})
	}

	public getManagementInbox(spinner: boolean= true): void {
		this.isClicked= '';
		this.currentMessage= null;
		this.messageReplies= null;
		this.charging = spinner;
		this.filtersForm.get('page').patchValue(this.pageIndex);
		this.filtersForm.get('size').patchValue(this.pageSize);
		this.admin.getManagementInboxSent(this.filtersForm.value).subscribe({
			next: (res) => {
				//console.log('messages', res);
				this.messages = res.data;
				this.length = res.count;
				this.charging= false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging= false;
			}
		});
	}

	public changePage(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getManagementInbox(false);
    return event;
	}

	public getMessageManagementContent(messageID: number): void {
		this.putMessageManagementContent(messageID);
		this.admin.getMessageManagementContent(messageID).subscribe({
			next: (res: MessageManagementContent) => {
				//console.log('currentMessage', res);
				if(res.allPersonsTO?.length || res.allAreasTO?.length){
					let string= '';
					for(let i=0; i<res.allPersonsTO?.length; i++){
						if(i === 0) string= string + 'Personas: ' + res.allPersonsTO[i].personFullName +', ';
						else string= string + res.allPersonsTO[i].personFullName +', ';
					}
					for(let i=0; i<res.allAreasTO?.length; i++){
						if(i === 0) string= string + ' Areas: ' + res.allAreasTO[i].areaName +', ';
						else string= string + res.allAreasTO[i].areaName +', ';
					}
					res.toChain= string;
				}else res.toChain= null;
				if(res.allPersonsCC?.length || res.allAreasCC?.length){
					let string= '';
					for(let i=0; i<res.allPersonsCC?.length; i++){
						if(i === 0) string= string + 'Personas: ' + res.allPersonsCC[i].personFullName +', ';
						else string= string + res.allPersonsCC[i].personFullName +', ';
					}
					for(let i=0; i<res.allAreasCC?.length; i++){
						if(i === 0) string= string + ' Areas: ' + res.allAreasCC[i].areaName +', ';
						else string= string + res.allAreasCC[i].areaName +', ';
					}
					res.ccChain= string;
				}else res.ccChain= null;
				if(res.allPersonsFWD?.length || res.allAreasFWD?.length){
					let string= '';
					for(let i=0; i<res.allPersonsFWD?.length; i++){
						if(i === 0) string= string + 'Personas: ' + res.allPersonsFWD[i].personFullName +', ';
						else string= string + res.allPersonsFWD[i].personFullName +', ';
					}
					for(let i=0; i<res.allAreasFWD?.length; i++){
						if(i === 0) string= string + ' Areas: ' + res.allAreasFWD[i].areaName +', ';
						else string= string + res.allAreasFWD[i].areaName +', ';
					}
					res.fwdChain= string;
				}else res.fwdChain= null;
				this.currentMessage= res;
				this.getMessageReplyByMessage(res.messageID);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public putMessageManagementContent(messageID: number): void {
		this.admin.putMessageManagementContent(messageID).subscribe({
			next: (res) => {
				//console.log('putMessageManagementContent', res);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getMessageReplyByMessage(messageID: number): void {
		this.admin.getMessageReplyByMessage(messageID).subscribe({
			next: (res) => {
				//console.log('MessageReplyByMessage', res);
				this.messageReplies= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getMessageReplyByReply(replyID: number): void {
		this.admin.getMessageReplyByReply(replyID).subscribe({
			next: (res) => {
				//console.log('MessageReplyByReply', res);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public openFile(relativeRoute: string, messageID?: number): void {
    const route: string = `${environment.url}/${relativeRoute}`;
		let apiRute;
		if(messageID){
			let body= {
				messageID: messageID
			}
			apiRute= this.api.postPdfContent(route, body);
		}
		else apiRute= this.api.getPdfContent(route);
    apiRute.subscribe((res: HttpResponse<Blob>) => {
      if (res.body) {
        let contentType: string | null | undefined = res.headers.get('content-type');
        // Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
        if (!contentType) {
          contentType = undefined;
        }
        const blob: Blob = new Blob([res.body], { type: contentType });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
      }
    });
  }

	public openDialog(currentMessage?: MessageManagementContent, reply?: MessageReply): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'ReplyProcedureComponent';
		config.autoFocus = false;
		config.minWidth = '55vw';
		config.maxWidth = '65vw';
		config.panelClass = 'transparent-panel';
		config.data = { currentMessage, reply };
		config.disableClose = false;
		const dialog = this.dialog.open(ReplyProcedureComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if (res) this.getManagementInbox();
		});
	}

	public forward(currentMessage: MessageManagementContent): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'ForwardComponent';
		config.autoFocus = false;
		config.minWidth = '40vw';
		config.maxWidth = '45vw';
		config.panelClass = 'transparent-panel';
		config.data = { currentMessage };
		config.disableClose = false;
		const dialog = this.dialog.open(ForwardComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if (res) this.getManagementInbox();
		});
	}
}
