import { NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, inject, OnInit, OnDestroy, Input, SecurityContext } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdministrativeService } from '@services/administrative.service';
import { MessageReply } from '@utils/interfaces/others.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MatMenuModule } from '@angular/material/menu';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-sub-response',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		NgIf,
		NgFor,
		MatIconModule,
		MatMenuModule,
		MatFormFieldModule,
		MatInputModule,
		MatSnackBarModule,
		MatTooltipModule
	],
  templateUrl: './sub-response.component.html',
  styleUrls: ['./sub-response.component.scss']
})

export class SubResponseComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	@Input('messageReply') messageReply: MessageReply;
	public responseForm!: FormGroup;
	public replies: MessageReply[] = [];
	private listFilesUpload: File[] = [];

	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		private admin: AdministrativeService,
		private api: ApiService,
		private fb: FormBuilder,
		private user: UserService,
		private common: CommonService,
	) {
		super();
		this.initResponseForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		this.getMessageReplyByReply(this.messageReply.replyID);
	}

	public initResponseForm(): void {
		this.responseForm= this.fb.group({
			messageID: '',
			message: ['', Validators.required],
			userID: this.user.currentUser.userId,
			userCreated: this.user.currentUser.userName,
			parentReplyID: null
		})
	}

	public getMessageReplyByReply(replyID: number): void {
		this.admin.getMessageReplyByReply(replyID).subscribe({
			next: (res) => {
				//console.log(this.messageReply, res);
				this.replies= res;
				this.responseForm.get('messageID').patchValue(this.messageReply.messageID);
				this.responseForm.get('parentReplyID').patchValue(this.messageReply.replyID);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public onChangeInput(files: FileList, input: HTMLInputElement): void{
		if (files) {
			for(let i=0; i<files.length; i++){
				let file: File = files.item(i);
				this.listFilesUpload.push(file);
			}
			//console.log('listFiles', this.listFilesUpload);
			if(this.listFilesUpload.length > 5){
				this.listFilesUpload= [];
				input.value= '';
				this.snackBar.dismiss();
				this.snackBar.open(
          `Máximo 5 archivos permitidos`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['red-snackbar']
          }
        );
			}
		}
	}

	public openFile(relativeRoute: string): void {
    const route: string = `${environment.url}/${relativeRoute}`;
    this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
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

	public onSubmit(): void {
		let formData: FormData = new FormData();
		let filters= this.responseForm.value;
		if(this.responseForm.valid){
			let reply= {
				"messageID": filters.messageID,
				"message": filters.message,
				"userID": filters.userID,
				"userCreated": filters.userCreated,
				"parentReplyID": filters.parentReplyID
			}
			formData.append('reply', JSON.stringify(reply));
			for(let i=0; i<this.listFilesUpload.length; i++){
				formData.append('attachments', this.listFilesUpload[i]);
			}

			this.admin.postMessageManagementReply(formData).subscribe({
				next: (res: any) => {
					//console.log('post', res);
					this.snackBar.dismiss();
					this.snackBar.open(
						`${res.message}`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
					this.initResponseForm();
					this.getMessageReplyByReply(this.messageReply.replyID);
					this.listFilesUpload= [];
				},
				error: (err: HttpErrorResponse) => {
				}
			});
		}else{
			this.responseForm.markAllAsTouched();
			this.snackBar.dismiss();
			this.snackBar.open(
				`Mensaje requerido`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
		}
	}

}
