import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { filter, Observable, Subscription, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { DocumentManagement, MessageManagementContent, MessageReply, Roles, TypeManagement, TypeRol } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

const TOOLBAR_EDITOR: Toolbar = [
	['bold', 'italic'],
	['underline', 'strike'],
	['code', 'blockquote'],
	['ordered_list', 'bullet_list'],
	[{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
	['link', 'image'],
	['text_color', 'background_color'],
	['align_left', 'align_center', 'align_right', 'align_justify'],
	['horizontal_rule', 'format_clear'],
];

@Component({
  selector: 'app-reply-procedure',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		NgIf,
		SpinnerLoaderComponent,
		MatInputModule,
		MatSelectModule,
		NgxEditorModule,
		MatSnackBarModule
	],
  templateUrl: './reply-procedure.component.html',
  styleUrls: ['./reply-procedure.component.css']
})
export class ReplyProcedureComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public responseForm!: FormGroup;
	public message: Editor;
	public toolbar: Toolbar = TOOLBAR_EDITOR;
	public listFilesUpload: File[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { currentMessage?: MessageManagementContent, reply?: MessageReply },
		private dialogRef: MatDialogRef<ReplyProcedureComponent>,
		private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService
	) {
		super();
		this.initResponseForm();
	}

	override ngOnDestroy(): void {
		this.message.destroy();
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		if(this.data.currentMessage){
			//console.log('currentMessage', this.data.currentMessage);
			this.responseForm.get('messageID').patchValue(this.data.currentMessage.messageID);
		}else if(this.data.reply){
			//console.log('reply', this.data.reply);
			this.responseForm.get('messageID').patchValue(this.data.reply.messageID);
			this.responseForm.get('parentReplyID').patchValue(this.data.reply.replyID);
		}
		this.message = new Editor();
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

	public onSubmit(): void {
		let formData: FormData = new FormData();
		let filters= this.responseForm.value;
		let reply;
		if(this.responseForm.valid){
			this.isLoading= true;
			if(this.data.currentMessage){
				reply= {
					"messageID": filters.messageID,
					"message": filters.message,
					"userID": filters.userID,
					"userCreated": filters.userCreated
				}
			}else if(this.data.reply){
				reply= {
					"messageID": filters.messageID,
					"message": filters.message,
					"userID": filters.userID,
					"userCreated": filters.userCreated,
					"parentReplyID": filters.parentReplyID
				}
			}
			formData.append('reply', JSON.stringify(reply));
			for(let i=0; i<this.listFilesUpload.length; i++){
				formData.append('attachments', this.listFilesUpload[i]);
			}

			this.admin.postMessageManagementReply(formData).subscribe({
				next: (res: any) => {
					//console.log('post', res);
					this.common.message(`${res.message}`,'','success','#86bc57');
					this.initResponseForm();
					this.listFilesUpload= [];
					this.isLoading= false;
					this.dialogRef.close(res);
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.isLoading= false;
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
