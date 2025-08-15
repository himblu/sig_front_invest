import { JsonPipe, NgClass, NgForOf, NgIf, NgStyle } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule, ValidationErrors, ValidatorFn,
	Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatListOption, SelectionList } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@services/api.service';
import { CareerForSection, MajorSchool } from '@utils/interfaces/campus.interfaces';
import {
	Author,
	CampusStockForm,
	DeweyCategory,
	DeweySubcategory,
	Editorial,
	KnowledgeArea,
	KnowledgeSpecificSubarea,
	KnowledgeSubarea,
	Publication,
	PublicationAvailability,
	PublicationCondition,
	PublicationEditionForm,
	PublicationForm,
	PublicationIncomeType,
	PublicationStock,
	PublicationStockDetail,
	PublicationStockForm,
	PublicationType,
	PublicationView,
	SupportType,
} from '@utils/interfaces/library.interface';
import { Campus } from '@utils/interfaces/period.interfaces';
import { PaginatedResource } from '@utils/interfaces/person.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, map, Observable, Subscriber, Subscription, switchMap, take } from 'rxjs';
import {
	CreateOrUpdateAuthorComponent
} from '../../components/create-or-update-author/create-or-update-author.component';
import {
	CreateOrUpdateEditorialComponent
} from '../../components/create-or-update-editorial/create-or-update-editorial.component';
import { EditionTabNamePipe } from '../../services/pipes/edition-tab-name.pipe';
import {FILE_STATE} from '@utils/interfaces/others.interfaces';
import {MatTooltipModule} from '@angular/material/tooltip';
import {UppercaseDirective} from '@shared/directives/UppercaseDirective';
import {CommonService} from '@services/common.service';
import {environment} from '@environments/environment';

// Configuración para que el front exija al usuario subir un archivo si marca la publicación como digital.
const REQUIRED_FILE_FOR_DIGITAL_PUBLICATION: boolean = false;
const MAX_FILE_SIZE: number = 5 * 1048576;
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
	selector: 'app-create-or-update-publication',
	standalone: true,
	imports: [
		FormsModule,
		MatInputModule,
		ReactiveFormsModule,
		MatSelectModule,
		MatListModule,
		NgForOf,
		MatIconModule,
		NgIf,
		MatChipsModule,
		MatCheckboxModule,
		NgxMaskDirective,
		MatButtonModule,
		NgxEditorModule,
		MatTabsModule,
		EditionTabNamePipe,
		MatDialogModule,
		MatSnackBarModule,
		MatTooltipModule,
		UppercaseDirective
	],
	providers: [
		provideNgxMask(),
	],
	templateUrl: './create-or-update-publication.component.html',
	styleUrls: ['./create-or-update-publication.component.css']
})

export class CreateOrUpdatePublicationComponent extends OnDestroyMixin implements OnInit, OnDestroy {
	public readonly CAMPUS_ID: number = 1; // Por defecto, se envía el campus con ID 1. Se deja dinámico, pero por el momento solamente se envía este ID.
	public disableControls: boolean = false;
	public readonly REQUIRED_FILE_FOR_DIGITAL_PUBLICATION: boolean = REQUIRED_FILE_FOR_DIGITAL_PUBLICATION;
	public publication!: PublicationView;
	public now: Date = new Date();
	public form!: FormGroup<PublicationForm>;
	public unselectedAuthors: Array<Author[]> = [];
	public selectedAuthors: Array<Author[]> = [];
	public unselectedEditorials: Array<Editorial[]> = [];
	public selectedEditorials: Array<Editorial[]> = [];
	public deweyCategories: Array<DeweyCategory> = [];
	public deweySubcategories: Array<DeweySubcategory> = [];
	public knowledgeAreas: Array<KnowledgeArea> = [];
	public knowledgeSubareas: Array<KnowledgeSubarea> = [];
	public knowledgeSpecificSubareas: Array<KnowledgeSpecificSubarea> = [];
	public schools: Array<MajorSchool> = [];
	public summaries: Array<Editor> = [];
	public contents: Array<Editor> = [];
	public incomeTypes: Array<PublicationIncomeType> = [];
	public publicationTypes: Array<PublicationType> = [];
	public publicationAvailabilities: Array<PublicationAvailability> = [];
	public keywords: Array<string> = [];
	public campuses: Array<Campus> = [];
	public toolbar: Toolbar = TOOLBAR_EDITOR;
	public publicationsCondition: Array<PublicationCondition> = [];
	public publicationStock: Array<PublicationStockDetail> = [];
	public supportTypes: Array<SupportType> = [];
	public fileUrl: string | null = null;
	public isAllSelected = false; // Controla el estado de "Seleccionar todos"
	public isIndeterminate = false; // Estado parcial

	private getAuthorsSubscription: Subscription;
	private getEditorialsSubscription: Subscription;
	private getDeweySubcategoriesSubscription: Subscription;
	private getKnowledgeSpecificSubareasSubscription: Subscription;
	private getKnowledgeSubareasSubscription: Subscription;
	private sendFormSubscription: Subscription;
	@ViewChildren('unselectedAuthorList') private unselectedAuthorList: QueryList<SelectionList>;
	@ViewChildren('selectedAuthorList') private selectedAuthorList: QueryList<SelectionList>;
	@ViewChildren('unselectedEditorialList') private unselectedEditorialList: QueryList<SelectionList>;
	@ViewChildren('selectedEditorialList') private selectedEditorialList: QueryList<SelectionList>;

	private formBuilder: FormBuilder = inject(FormBuilder);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private api: ApiService = inject(ApiService);
	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private router: Router = inject(Router);
	private file!: File;

	constructor(
		private common:CommonService,
	) {
		super();
	}

	public ngOnInit(): void {
		this.getDataFromResolver();
		this.initForm();
	}

	public override ngOnDestroy(): void {
		super.ngOnDestroy();
		this.summaries.map((summary) => summary.destroy());
		this.contents.map((content) => content.destroy());
	}

	private getDataFromResolver(): void {
		this.activatedRoute.data
			.pipe(
				untilComponentDestroyed(this),
				map((value: any) => value['resolver']))
			.subscribe({
				next: (value: {
					publication: PublicationView,
					deweyCategories: DeweyCategory[],
					deweySubcategories: DeweySubcategory[],
					knowledgeAreas: KnowledgeArea[],
					knowledgeSubareas: KnowledgeSubarea[],
					knowledgeSpecificSubareas: KnowledgeSpecificSubarea[],
					schools: MajorSchool[]
					publicationsCondition: PublicationCondition[]
					incomeTypes: PublicationIncomeType[],
					campuses: Campus[]
					publicationTypes: PublicationType[]
					availabilityPublications: PublicationAvailability[],
					publicationStock: PublicationStockDetail[],
					supportTypes: SupportType[]
				}) => {
					if (this.activatedRoute.snapshot.params['id']) {
						this.publication = value.publication;
						this.deweySubcategories = value.deweySubcategories;
						this.knowledgeSubareas = value.knowledgeSubareas;
						this.knowledgeSpecificSubareas = value.knowledgeSpecificSubareas;
						this.publicationStock = value.publicationStock;
					}
					this.publicationsCondition = value.publicationsCondition;
					this.deweyCategories = value.deweyCategories;
					this.schools = value.schools;
					this.knowledgeAreas = value.knowledgeAreas;
					this.incomeTypes = value.incomeTypes;
					this.campuses = value.campuses;
					this.publicationTypes = value.publicationTypes;
					this.supportTypes = value.supportTypes;
					this.publicationAvailabilities = value.availabilityPublications;
				},
			});
	}

	public initForm(): void {
		this.form = this.formBuilder.group<PublicationForm>({
			title: this.formBuilder.control(null, [Validators.required, Validators.minLength(2), Validators.maxLength(255)]),
			keywords: this.formBuilder.control([], []),
			deweyCategory: this.formBuilder.control(null, [Validators.required]),
			deweySubcategory: this.formBuilder.control(null, [Validators.required]),
			knowledgeArea: this.formBuilder.control(null, []),
			knowledgeSubarea: this.formBuilder.control(null, []),
			knowledgeSpecificSubarea: this.formBuilder.control(null, []),
			majors: this.formBuilder.control(null, [Validators.required]),
			observation: this.formBuilder.control(''),
			publicationType: this.formBuilder.control(null, [Validators.required]),
			language: this.formBuilder.control(null, [Validators.required]),
			editions: this.formBuilder.array([]),
			publicationSupportID: this.formBuilder.control(null, [Validators.required]),
			urlFile: this.formBuilder.control(null),
		});
		this.addEditionToThisPublication();
		// Solamente para la edición con index 0
		this.addSingleCampus();

		if (this.activatedRoute.snapshot.params['id']) {
			this.updateForm();
		}
	}

	// Esto es únicamente para agregar la sede Matriz
	private addSingleCampus(): void {
		const campus: Campus = this.campuses.find((item: Campus) => item.campusID === this.CAMPUS_ID);
		if (campus) {
			// TODO: Verificar este index
			this.campusStockFormArray(0).push(this.createCampusStock(campus));
		}
	}

	private updateForm(): void {
		this.disableControls=true
		// Dividir palabras clave
		this.keywords =this.publication.keywords&& this.publication.keywords.length>0? this.publication.keywords?.split(',') : [];
		// Obtener todos los careerID de schools
		const totalCareers = this.schools.flatMap(school =>
			school.careers.map(career => career.careerID)
		);

// Comparar la longitud de las carreras
		const areAllCareersSelected = totalCareers?.length === this.publication?.careers?.length;

// Si son iguales, añade el valor 0 y establece isAllSelected = true
		const selectedMajors = areAllCareersSelected && this.publication.careers && this.publication.careers.length>0
			? [...this.publication.careers.map((item: CareerForSection) => item.careerID), 0]
			: this.publication.careers?this.publication.careers.map((item: CareerForSection) => item.careerID):[];

		// Actualizar los valores principales del formulario
		this.form.patchValue({
			title: this.publication.title,
			keywords: this.keywords,
			deweyCategory: this.publication.deweyCategoryID,
			deweySubcategory: this.publication.deweySubCategoryID,
			knowledgeArea: this.publication.knowledgeAreaID,
			knowledgeSubarea: this.publication.subAreaKnowledgeID,
			knowledgeSpecificSubarea: this.publication.specificSubareaKnowledgeID,
			majors: selectedMajors,
			observation: this.publication.observation,
			publicationType: this.publication.publicationTypeID,
			language: this.publication.languageDesc,
			publicationSupportID: this.publication.publicationSupportID,
			urlFile: this.publication.urlFile,
		});
		this.fileUrl=this.publication.urlFile;

// Actualizar el estado de isAllSelected
		this.isAllSelected = areAllCareersSelected;


		// Obtener la primera edición
		const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(0) as FormGroup<PublicationEditionForm>;
		(this.editionsFormArray.at(0)as FormGroup).get('edition').setValue(this.publication.edition);
		(this.editionsFormArray.at(0)as FormGroup).get('publicationYear').setValue(this.publication.publicationYear);
		(this.editionsFormArray.at(0)as FormGroup).get('publicationCode').setValue(this.publication.codeISBN);
		(this.editionsFormArray.at(0)as FormGroup).get('availability').setValue(this.publication.availability);
		(this.editionsFormArray.at(0)as FormGroup).get('price').setValue(this.publication.estimatedCost);
		const campusesStock: FormArray = edition.controls.campusesStock;

		// Obtener la primera sede (por ahora está quemada)
		const campusStock: FormGroup<CampusStockForm> = campusesStock.at(0) as FormGroup<CampusStockForm>;
		const stockFormArray: FormArray = campusStock.controls.stock;

		// Limpiar el stock previo
		stockFormArray.clear();

		// Agregar items de stock (publicationStock)
		this.publicationStock
			.filter((item: PublicationStockDetail) => item.branchID === this.CAMPUS_ID)
			.forEach((item: PublicationStockDetail) => {
				const stockItem: FormGroup = this.formBuilder.group<PublicationStockForm>({
					quantity: this.formBuilder.control(item.quantity, [Validators.required, Validators.min(item.quantityLoan === 0 ? 0 : item.quantity)]),
					condition: this.formBuilder.control(item.physicalQualityID, [Validators.required]),
					incomeType: this.formBuilder.control(item.incomeTypeID, [Validators.required]),
					isForUpdate: this.formBuilder.control(true),
					borrowedItems: this.formBuilder.control(item.quantityLoan),
				});
				stockFormArray.push(stockItem);
			});
// Pre-cargar autores en la edición para evitar errores de valores no seleccionados
		const authors: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(0) as FormGroup<PublicationEditionForm>;
		const preloadedAuthors = this.publication.authors?.map((author) => author.authorID) || [];
		authors.controls.authors.patchValue(preloadedAuthors);

// Pre-cargar editoriales en la edición para que no de error de valores no seleccionados
		const edition2: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(0) as FormGroup<PublicationEditionForm>;
		const preloadedEditorials = this.publication.editorials?.map((editorial) => editorial.editorialID) || [];
		edition2.controls.editorials.patchValue(preloadedEditorials);


		// Agregar items de incomePublication (datos adicionales)
		if (this.publication.incomePublication?.length) {
			this.publication.incomePublication.forEach((item: PublicationStockForm) => {
				const stockItem: FormGroup = this.formBuilder.group<PublicationStockForm>({
					quantity: this.formBuilder.control(item.quantity, [Validators.required, Validators.min(0)]),
					condition: this.formBuilder.control(item.condition, [Validators.required]),
					incomeType: this.formBuilder.control(item.incomeType, [Validators.required]),
					isForUpdate: this.formBuilder.control(true),
					borrowedItems: this.formBuilder.control(0),
				});
				stockFormArray.push(stockItem);
			});
		}

		// Actualizar los valores del resumen y contenido si existen
		edition.patchValue({
			summary: this.publication.summary || '',
			content: this.publication.content || '',
		});

		// Deshabilitar controles si es necesario
		this.disableControlsOnUpdate();
	}

	private disableControlsOnUpdate(): void {
		// this.form.controls.title.disable();
		const currentIndex: number = this.editionsFormArray.length;
		const editionForm: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(currentIndex - 1) as FormGroup<PublicationEditionForm>;
		this.selectedAuthors[currentIndex - 1] = this.publication.authors;
		this.selectedEditorials[currentIndex - 1] = this.publication.editorials;
		this.unselectedAuthors[currentIndex - 1] = this.unselectedAuthors[currentIndex - 1].filter((author: Author) => !this.publication.authors.map((a: Author) => a.authorID).includes(author.authorID));
		this.unselectedEditorials[currentIndex - 1] = this.unselectedEditorials[currentIndex - 1].filter((editorial: Editorial) => !this.publication.editorials.map((e: Editorial) => e.editorialID).includes(editorial.editorialID));
		editionForm.patchValue({
			authors: this.selectedAuthors.length>0 ? this.selectedAuthors[currentIndex - 1].map((a: Author) => a.authorID):[],
			edition: this.publication.edition,
			availability: this.publication.availability.map((a: PublicationAvailability) => a.availabilityID),
			content: this.publication.content,
			publicationYear: this.publication.publicationYear.toString(),
			encodingName: this.publication.codeISBN,
			summary: this.publication.summary,
			price: this.publication.estimatedCost,
			publicationCode: this.publication.codeISBN,
		});

		this.form.controls.deweyCategory.disable({ emitEvent: false });
		this.form.controls.deweySubcategory.disable({ emitEvent: false });
		// this.form.controls.majors.disable({ emitEvent: false });
		this.form.controls.publicationType.disable({ emitEvent: false });
		editionForm.controls.author.disable({ emitEvent: false });
		// editionForm.controls.editorial.disable({ emitEvent: false });
		// editionForm.controls.edition.disable({ emitEvent: false });
		// editionForm.controls.publicationYear.disable({ emitEvent: false });
		// editionForm.controls.availability.disable({ emitEvent: false });
		// editionForm.controls.publicationCode.disable({ emitEvent: false });
		// editionForm.controls.price.disable({ emitEvent: false });
		this.disableControls = true;
	}

	public addEditionToThisPublication(): void {
		const editions: FormArray = this.editionsFormArray;
		const edition: FormGroup = this.createPublicationEdition;
		this.summaries.push(new Editor());
		this.contents.push(new Editor());
		this.editionsFormArray.push(edition);
		this.getAuthors(editions.length - 1);
		this.getEditorials(editions.length - 1);
	}

	public getDeweySubcategories(category: string): void {
		if (this.getDeweySubcategoriesSubscription) this.getDeweySubcategoriesSubscription.unsubscribe();
		this.getDeweySubcategoriesSubscription = this.api.getDeweySubcategories(+category).subscribe({
			next: (value: DeweySubcategory[]) => {
				this.deweySubcategories = value;
				this.form.patchValue({
					deweySubcategory: null
				});
			},
			error: (err: HttpErrorResponse) => {
				console.error(err);
				this.form.patchValue({
					deweySubcategory: null
				});
				this.deweySubcategories = [];
			}
		});
	}

	public getKnowledgeSubareas(area: string): void {
		if (this.getKnowledgeSubareasSubscription) this.getKnowledgeSubareasSubscription.unsubscribe();
		this.getKnowledgeSubareasSubscription = this.api.getKnowledgeSubareas(+area).subscribe({
			next: (value: KnowledgeSubarea[]) => {
				this.knowledgeSubareas = value;
				this.form.patchValue({
					knowledgeSubarea: null,
					knowledgeSpecificSubarea: null
				});
				this.knowledgeSpecificSubareas = [];
			},
			error: (err: HttpErrorResponse) => {
				console.error(err);
				this.form.patchValue({
					knowledgeSubarea: null,
					knowledgeSpecificSubarea: null
				});
				this.knowledgeSubareas = this.knowledgeSpecificSubareas = [];
			}
		});
	}

	public getKnowledgeSpecificSubareas(subarea: string): void {
		if (this.getKnowledgeSpecificSubareasSubscription) this.getKnowledgeSpecificSubareasSubscription.unsubscribe();
		this.getKnowledgeSpecificSubareasSubscription = this.api.getKnowledgeSpecificSubareas(+subarea).subscribe({
			next: (value: KnowledgeSpecificSubarea[]) => {
				this.knowledgeSpecificSubareas = value;
				this.form.controls.knowledgeSpecificSubarea.patchValue(null);
			},
			error: (err: HttpErrorResponse) => {
				console.error(err);
				this.form.controls.knowledgeSpecificSubarea.patchValue(null);
				this.knowledgeSpecificSubareas = [];
			}
		});
	}

	public get editionsFormArray(): FormArray {
		return this.form.controls.editions as FormArray;
	}

	public stockFormArray(indexEdition: number, indexCampusStock: number): FormArray {
		return (this.form.controls.editions.at(indexEdition).get('campusesStock') as FormArray).at(indexCampusStock).get('stock') as FormArray;
	}

	public campusStockFormArray(indexEdition: number): FormArray {
		return this.form.controls.editions.at(indexEdition).get('campusesStock') as FormArray;
	}

	private createCampusStock(campus: Campus): FormGroup {
		return this.formBuilder.group<CampusStockForm>({
			campusId: this.formBuilder.control(campus.campusID, [Validators.required]),
			campusName: this.formBuilder.control(campus.campusName, [Validators.required]),
			stock: this.formBuilder.array([this.createStockItem()], { validators: this.uniqueStockItem() })
		});
	}

	private createStockItem(quantity: number = 0, condition: number | null = null, incomeType: number | null = null, isForUpdate: boolean = false): FormGroup {
		return this.formBuilder.group<PublicationStockForm>({
			quantity: this.formBuilder.control(quantity, [Validators.required, Validators.min(0)]),
			condition: this.formBuilder.control(condition, [Validators.required]),
			incomeType: this.formBuilder.control(incomeType, [Validators.required]),
			isForUpdate: this.formBuilder.control(isForUpdate)
		});
	}

	// Agrega un estado para registrar inventario.
	public addStockItem(indexEdition: number, indexCampusStock: number): void {
		const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(indexEdition) as FormGroup<PublicationEditionForm>;
		const campusesStock: FormArray = edition.controls.campusesStock;
		const campusStock: FormGroup<CampusStockForm> = campusesStock.at(indexCampusStock) as FormGroup<CampusStockForm>;
		const stockFormArray: FormArray = campusStock.controls.stock;
		stockFormArray.push(this.createStockItem());
	}

	public removeStockItem(indexEdition: number, indexCampusStock: number, indexStock: number): void {
		const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(indexEdition) as FormGroup<PublicationEditionForm>;
		const campusesStock: FormArray = edition.controls.campusesStock;
		const campusStock: FormGroup<CampusStockForm> = campusesStock.at(indexCampusStock) as FormGroup<CampusStockForm>;
		const stockFormArray: FormArray = campusStock.controls.stock;
		// Para que siempre haya al menos un item en el stock. Así evitamos esa validación.
		if (campusesStock.length === 1 && stockFormArray.length === 1) {
			return;
		}
		stockFormArray.removeAt(indexStock);
	}

	private uniqueStockItem(): ValidatorFn {
		return (control: AbstractControl): { uniqueStock: boolean | null } => {
			const stockItemFormArray: FormArray = control as FormArray;
			const stockItems: Array<PublicationStock> = stockItemFormArray.value;
			const conditionCount: { [key: number]: any } = {};
			const incomeTypeCount: { [key: number]: any } = {};

			for (const stock of stockItems) {
				if (stock.condition && stock.incomeType) {
					if (conditionCount[stock.condition] && incomeTypeCount[stock.incomeType]) {
						return { uniqueStock: true }
					}
				}
				conditionCount[stock.condition] = (conditionCount[stock.condition] || 0) + 1;
				incomeTypeCount[stock.incomeType] = (incomeTypeCount[stock.incomeType] || 0) + 1;
			}
			return null;
		}
	}

	// private createCampus(campusId: number, indexEdition: number): void {
	//   const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(indexEdition) as FormGroup<PublicationEditionForm>;
	//   const campus: FormGroup<CampusForm> = this.formBuilder.group<CampusForm>({
	//     campus: this.formBuilder.control(campusId),
	//     stock: this.createStock
	//   });
	//   edition.controls.campuses.push(campus);
	// }

	// private deleteCampus(indexEdition: number, indexCampus: number): void {
	//   const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(indexEdition) as FormGroup<PublicationEditionForm>;
	// 	edition.controls.campuses.removeAt(indexCampus);
	// }

	public removeEdition(indexEdition: number): void {
		if (this.editionsFormArray.length !== 1) {
			this.editionsFormArray.removeAt(indexEdition);
			this.selectedAuthors.splice(indexEdition, 1);
			this.unselectedAuthors.splice(indexEdition, 1);
			this.selectedEditorials.splice(indexEdition, 1);
			this.unselectedEditorials.splice(indexEdition, 1);
			this.summaries.splice(indexEdition, 1);
			this.contents.splice(indexEdition, 1);
		}
	}

	private get createPublicationEdition(): FormGroup {
		const editionForm: FormGroup<PublicationEditionForm> = this.formBuilder.group<PublicationEditionForm>({
			authors: this.formBuilder.control([], [this.atLeastOneSelectedValidator()]), // Validador agregado
			author: this.formBuilder.control(null), // To search
			publicationYear: this.formBuilder.control(null, [Validators.required, Validators.min(0), Validators.max(this.now.getFullYear())]),
			edition: this.formBuilder.control(null, []),
			hasDigitalEdition: this.formBuilder.control(false),
			file: this.formBuilder.control(null),
			publicationCode: this.formBuilder.control(''), // ISBN
			price: this.formBuilder.control(0, [Validators.required, Validators.min(0)]),
			summary: this.formBuilder.control(null),
			editorial: this.formBuilder.control(null), // To search
			editorials: this.formBuilder.control([], [this.atLeastOneSelectedValidator()]), // Validador agregado
			publicationDate: this.formBuilder.control(null),
			content: this.formBuilder.control(null),
			observation: this.formBuilder.control(''),
			availability: this.formBuilder.control(null,[Validators.required]),
			campuses: this.formBuilder.control([]),
			campusesStock: this.formBuilder.array([])
		});
		if (this.REQUIRED_FILE_FOR_DIGITAL_PUBLICATION) {
			const hasDigitalEditionControl: FormControl<boolean | null> = editionForm.controls.hasDigitalEdition;
			hasDigitalEditionControl.valueChanges.pipe(untilComponentDestroyed(this)).subscribe({
				next: (value: boolean) => {
					const fileControl: FormControl<File | null> = editionForm.controls.file;
					if (!value) {
						fileControl.patchValue(null);
						fileControl.setValidators(null);
						return;
					}
					editionForm.controls.file.addValidators([Validators.required]);
				}
			});
		}
		editionForm.controls.editorial.valueChanges
			.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: (value: string) => {
					this.getEditorials(0, value);
				}
			});
		editionForm.controls.author.valueChanges
			.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: (value: string) => {
					this.getAuthors(0, value);
				}
			});
		this.unselectedAuthors.push([]);
		this.selectedAuthors.push([]);
		this.unselectedEditorials.push([]);
		this.selectedEditorials.push([]);
		this.summaries.push(new Editor());
		this.contents.push(new Editor());
		return editionForm;
	}
	public async sendForm() {
		if (this.form.invalid) {
			this.form.markAsDirty();
			this.form.markAllAsTouched();
			return;
		}

		const publication: Publication = this.form.getRawValue() as unknown as Publication;
		let observableToCreateOrUpdatePublication: Observable<any>;

		// Si hay un archivo para subir
		if (this.file) {
			let formData = new FormData();
			formData.append('file', this.file);

			// Subir el archivo primero
			this.api.postPublicationFile(formData).pipe(
				switchMap((res: any) => {
					this.form.get('urlFile')?.patchValue(res.urlFile);
					publication.urlFile=res.urlFile;

					// Lógica de procesamiento adicional
					this.removeZeroFromMajors();
					this.processStockAndEditions();
					// Configurar publicación con datos adicionales
					return this.getPublicationObservable(publication);
				})
			).subscribe(this.getPublicationSubscription());
		} else {
			// Si no hay archivo, solo guardar la publicación
			this.removeZeroFromMajors();
			this.processStockAndEditions();

			// Configurar publicación con datos adicionales
			observableToCreateOrUpdatePublication = this.getPublicationObservable(publication);
			observableToCreateOrUpdatePublication.subscribe(this.getPublicationSubscription());
		}
	}

	private processStockAndEditions(): void {
		this.editionsFormArray.controls.forEach((editionGroup: AbstractControl) => {
			const campusesStockArray = (editionGroup.get('campusesStock') as FormArray);
			campusesStockArray.controls.forEach((campusStockGroup: AbstractControl) => {
				const stockFormArray = (campusStockGroup.get('stock') as FormArray);
				stockFormArray.controls.forEach((stockGroup: AbstractControl) => {
					const quantity = stockGroup.get('quantity')?.value;
				});
			});
		});
	}

	private getPublicationObservable(publication: Publication): Observable<any> {
		if (this.publication?.publicationID) {
			const editorialIDs = this.selectedEditorials.flatMap((editorialArray) =>
				editorialArray.map((editorial) => editorial.editorialID)
			);
			publication.editorials = editorialIDs;
			publication.price = this.form.controls.editions.value[0].price;
			publication.availability = this.form.controls.editions.value[0].availability;
			return this.api.updatePublication(publication, this.publication.publicationID);
		} else {
			return this.api.postPublication(publication);
		}
	}

	private getPublicationSubscription(): Partial<Subscriber<any>> {
		return {
			next: (value) => {
				const message: string = `Publicación fue ${this.publication?.publicationID ? 'actualizada' : 'agregada'} con éxito`;
				this.snackBar.open(
					message,
					undefined,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['green-snackbar']
					}
				);
				this.router.navigate(['/biblioteca']).then();
			},
			error: (err: HttpErrorResponse) => {
				console.error(err);
				this.form.enable({ emitEvent: false });
				if (this.publication?.publicationID) {
					this.disableControlsOnUpdate();
				}
				const message: string = `Hubo un error al ${this.publication?.publicationID ? 'actualizar' : 'crear'} la publicación. Intenta de nuevo.`;
				this.snackBar.open(
					message,
					undefined,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['red-snackbar']
					}
				);
			}
		};
	}

	public removeSelectedEditorial(indexEdition: number): void {
		try {
			const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(indexEdition) as FormGroup<PublicationEditionForm>;
			const selectedOptionsIdInThisScope: number[] = this.selectedEditorialList.get(indexEdition).selectedOptions.selected.map((item: MatListOption) => item.value as number);
			if (selectedOptionsIdInThisScope.length) {
				this.selectedEditorials[indexEdition] = this.selectedEditorials[indexEdition].filter((editorial: Editorial) => !selectedOptionsIdInThisScope.includes(editorial.editorialID));
				edition.controls.editorials.patchValue(this.selectedEditorials[indexEdition].map((editorial: Editorial) => editorial.editorialID));
				this.getEditorials(indexEdition, edition.controls.editorial.value || '');
			}
		} catch (e) {
		}
	}

	public addEditorialToAEdition(indexEdition: number, editorial?: Editorial): void {
		const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(indexEdition) as FormGroup<PublicationEditionForm>;

		if (editorial) {
			// Añadir la editorial seleccionada
			this.selectedEditorials[indexEdition].push(editorial);
			edition.controls.editorials.patchValue(
				this.selectedEditorials[indexEdition].map((editorial: Editorial) => editorial.editorialID)
			);
			// Remover de editoriales disponibles
			this.unselectedEditorials[indexEdition] = this.unselectedEditorials[indexEdition].filter(
				(item) => item.editorialID !== editorial.editorialID
			);
			return;
		}

		// Obtener las editoriales seleccionadas desde la lista de no seleccionadas
		const selectedOptionsIdInThisScope: number[] = this.unselectedEditorialList
			.get(indexEdition)
			.selectedOptions.selected.map((item: MatListOption) => item.value as number);

		if (selectedOptionsIdInThisScope.length) {
			// Filtrar las editoriales seleccionadas
			const editorialsToBeAdded: Editorial[] = this.unselectedEditorials[indexEdition].filter(
				(editorial: Editorial) => selectedOptionsIdInThisScope.includes(editorial.editorialID)
			);

			// Agregar a seleccionados
			this.selectedEditorials[indexEdition] = (this.selectedEditorials[indexEdition] || []).concat(editorialsToBeAdded);

			// Actualizar el formulario
			edition.controls.editorials.patchValue(
				this.selectedEditorials[indexEdition].map((editorial: Editorial) => editorial.editorialID)
			);

			// Eliminar las editoriales agregadas de "disponibles"
			this.unselectedEditorials[indexEdition] = this.unselectedEditorials[indexEdition].filter(
				(editorial: Editorial) => !selectedOptionsIdInThisScope.includes(editorial.editorialID)
			);
		}
	}


	public removeSelectedAuthor(indexEdition: number): void {
		try {
			// Seleccionar la edición.
			const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(indexEdition) as FormGroup<PublicationEditionForm>;
			// Del SelectionList vamos a filtrar los ids que seleccionamos para quitar de la lista
			const selectedOptionsIdInThisScope: number[] = this.selectedAuthorList.get(indexEdition).selectedOptions.selected.map((item: MatListOption) => item.value as number);
			if (selectedOptionsIdInThisScope.length) {
				// Ahora vamos a filtrar la lista de autores seleccionados, filtrando la lista por los ids del SelectionList que no seleccionó el usuario.
				this.selectedAuthors[indexEdition] = this.selectedAuthors[indexEdition].filter((author: Author) => !selectedOptionsIdInThisScope.includes(author.authorID));
				// Actualizamos el formControl de los autores seleccionados
				edition.controls.authors.patchValue(this.selectedAuthors[indexEdition].map((author: Author) => author.authorID));
				// Traemos de nuevo la lista de autores. No sabemos si los autores que eliminamos de la lista de seleccionados,
				// necesariamente tienen que estar en la lista de no seleccionados.
				this.getAuthors(indexEdition, edition.controls.author.value || '');
			}
		} catch (e) {
			// TODO: Controlar cuando algo de todo esto falla.
		}
	}

	public addAuthorToAEdition(indexEdition: number, author?: Author): void {
		const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(indexEdition) as FormGroup<PublicationEditionForm>;
		if (author) {
			this.selectedAuthors[indexEdition].push(author);
			edition.controls.authors.patchValue(this.selectedAuthors[indexEdition].map((author: Author) => author.authorID));
			this.getAuthors(indexEdition, edition.controls.author.value || '');
			return;
		}

		const selectedOptionsIdInThisScope: number[] = this.unselectedAuthorList.get(indexEdition).selectedOptions.selected.map((item: MatListOption) => item.value as number);
		if (selectedOptionsIdInThisScope.length) {
			const authorsToBeAdded: Author[] = this.unselectedAuthors[indexEdition].filter((author: Author) => selectedOptionsIdInThisScope.includes(author.authorID));
			this.selectedAuthors[indexEdition] = this.selectedAuthors[indexEdition].concat(authorsToBeAdded);
			edition.controls.authors.patchValue(this.selectedAuthors[indexEdition].map((author: Author) => author.authorID));
			this.getAuthors(indexEdition, edition.controls.author.value || '');
		}
	}

	public getAuthors(indexEdition: number, search: string = ''): void {
		if (this.getAuthorsSubscription) this.getAuthorsSubscription.unsubscribe();
		// Formatear el parámetro de búsqueda si se proporciona
		if (search !== '') {
			search = `{authorName:or:like:${search}}`;
		}
		// Llamada a la API para obtener los autores
		this.getAuthorsSubscription = this.api.getAuthors(0, 100, search).subscribe({
			next: (value: PaginatedResource<Author>) => {
				// Obtener los IDs de los autores seleccionados para esta edición
				const selectedAuthorsId: number[] = this.selectedAuthors[indexEdition]?.map(
					(author: Author) => author.authorID
				) || [];

				// Filtrar autores no seleccionados
				this.unselectedAuthors[indexEdition] = value.items.filter(
					(author: Author) => !selectedAuthorsId.includes(author.authorID)
				);
			},
			error: () => {
				console.error('Error al obtener los autores.');
			}
		});
	}

	public getEditorials(indexEdition: number, search: string = ''): void {
		if (this.getEditorialsSubscription) this.getEditorialsSubscription.unsubscribe();

		if (search !== '') {
			search = `{editorialDesc:or:like:${search}}`;
		}

		this.getEditorialsSubscription = this.api.getEditorials(0, 100, search).subscribe({
			next: (value: PaginatedResource<Editorial>) => {
				// Obtener IDs de editoriales seleccionados
				const selectedEditorialIDs: number[] = this.selectedEditorials[indexEdition]?.map(
					(editorial: Editorial) => editorial.editorialID
				) || [];

				// Filtrar editoriales disponibles excluyendo los seleccionados
				this.unselectedEditorials[indexEdition] = value.items.filter(
					(editorial: Editorial) => !selectedEditorialIDs.includes(editorial.editorialID)
				);
			},
			error: () => {
				console.error('Error fetching editorials');
			},
		});
	}


	public removeKeyword(keyword: string): void {
		const index = this.keywords.indexOf(keyword);
		if (index >= 0) {
			this.keywords.splice(index, 1);
			// this.announcer.announce(`removed ${keyword}`).then();
		}
	}

	public addKeyword(event: MatChipInputEvent): void {
		const value: string = (event.value || '').trim();
		if (value) {
			this.keywords.push(value);
		}
		event.chipInput!.clear();
	}

	public validateIfFileIsAPDF(fileFormControl: FormControl<File>, file: File): void {
		const fileReader: FileReader = new FileReader();
		fileReader.onloadend = (event: ProgressEvent<FileReader>) => {
			fileFormControl.patchValue(file);
			let errors: ValidationErrors = fileFormControl.errors || {};
			if (file.size > MAX_FILE_SIZE) {
				errors['sizeError'] = true;
				fileFormControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
				return;
			} else {
				delete errors['sizeError'];
			}
			const arr: Uint8Array = new Uint8Array(event.target.result as ArrayBuffer).subarray(0, 4);
			let isValid: boolean = false;
			let header: string = '';
			arr.forEach((value: number) => {
				header += value.toString(16);
				isValid = header === '25504446';
			});
			if (isValid) {
				delete errors['invalidMimeType'];
			}
			fileFormControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
			fileFormControl.markAsTouched();
		};
		fileReader.readAsArrayBuffer(file.slice(0, 4));
	}

	public onChangeFileInput(files: FileList, indexEdition?: number): void {
		if (files?.length) {
			const file: File = files.item(0);
			if (indexEdition) {
				const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(indexEdition) as FormGroup<PublicationEditionForm>;
				const fileFormControl: FormControl<File> = edition.controls.file;
				this.validateIfFileIsAPDF(fileFormControl, file);
				return;
			}
			// const fileFormControl: FormControl<File> = this.form.controls.inlineFile as FormControl<File>;
			// this.validateIfFileIsAPDF(fileFormControl, file);
			// return;
		}
	}

	// public enableFileInput(event: MatCheckboxChange, fileInput: HTMLInputElement, indexEdition?: number): void {
	// 	// Para habilitar el input tipo file inline
	// 	// if (!indexEdition) {
	// 	// 	const fileFormControl: FormControl<File> = this.form.controls.inlineFile as FormControl<File>;
	// 	// 	if (!event.checked) {
	// 	// 		fileFormControl.setValidators(null);
	// 	// 		return;
	// 	// 	}
	// 	// 	fileFormControl.setValidators([Validators.required]);
	// 	// 	return;
	// 	// }
	// 	// Para habilitar los inputs de tipo file del formArray
	// 	const edition: FormGroup<PublicationEditionForm> = this.editionsFormArray.at(indexEdition) as FormGroup<PublicationEditionForm>;
	// 	const fileFormControl: FormControl<File> = edition.controls.file;
	// 	fileFormControl.patchValue(null);
	// 	if (!event.checked) {
	// 		fileFormControl.setValidators(null);
	// 		fileInput.files = null;
	// 		fileInput.disabled = true;
	// 		return;
	// 	}
	// 	fileInput.disabled = false;
	// 	fileFormControl.setValidators([Validators.required]);
	// }


	public manageCampusStock(event: MatOptionSelectionChange<number>, indexEdition: number, campus: Campus): void {
		// Si el usuario anula la selección de un campus.
		if (!event.source.selected) {
			this.campusStockFormArray(indexEdition).removeAt(indexEdition);
			return;
		}
		this.campusStockFormArray(indexEdition).push(this.createCampusStock(campus));
	}

	public createEditorial(indexEdition: number): void {
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'editEditorialDialog';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.width = '70vw';
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		const dialog: MatDialogRef<CreateOrUpdateEditorialComponent> = this.dialog.open(CreateOrUpdateEditorialComponent, config);
		dialog.afterClosed()
			.pipe(take(1))
			.subscribe((value: Editorial) => {
				if (value) {
					this.addEditorialToAEdition(indexEdition, value);
					this.snackBar.dismiss();
					this.snackBar.open(
						`Editorial creada correctamente`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
				}
			});
	}

	public createAuthor(indexEdition: number): void {
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'editAuthorDialog';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.width = '70vw';
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		const dialog: MatDialogRef<CreateOrUpdateAuthorComponent> = this.dialog.open(CreateOrUpdateAuthorComponent, config);
		dialog.afterClosed()
			.pipe(take(1))
			.subscribe((value: Author) => {
				if (value) {
					this.addAuthorToAEdition(indexEdition, value);
					this.snackBar.dismiss();
					this.snackBar.open(
						`Autor creado correctamente`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
				}
			});
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;

		if (input.files && input.files.length > 0) {
			const file = input.files[0];

			// Verifica si el archivo es un PDF
			if (file.type === 'application/pdf') {
				this.file= file;
				// Reemplaza la URL anterior si existe
				if (this.fileUrl) {
					URL.revokeObjectURL(this.fileUrl);
				}

				// Crea la URL temporal del archivo
				this.fileUrl = URL.createObjectURL(file);

				// Abre el archivo en una nueva pestaña
				window.open(this.fileUrl, '_blank');
			} else {
				alert('Por favor, selecciona un archivo PDF válido.');
			}
		}
	}

	onEditClick(): void {
		// Hace visible la parte de subir archivo
		this.fileUrl = null;
	}

	private atLeastOneSelectedValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			return Array.isArray(value) && value.length > 0 ? null : { required: true };
		};
	}


	getAllMajors(): number[] {
		return this.schools.flatMap((school) =>
			school.careers.map((career) => career.careerID)
		);
	}


	toggleAllSelection() {
		const majorsControl = this.form.get('majors');
		const currentValues = majorsControl?.value || [];

		if (this.isAllSelected) {
			majorsControl?.setValue([]); // Deseleccionar todo
		} else {
			majorsControl?.setValue([0, ...this.getAllMajors()]); // Seleccionar todos incluyendo el ID 0
		}

		this.updateSelectState();
	}

	// Actualizar estado "Seleccionar todos"
	updateSelectState() {
		const majorsControl = this.form.get('majors')?.value || [];
		const allMajors = this.getAllMajors();

		// Comprobar si "Seleccionar todos" está marcado
		const isSelectAllChecked = majorsControl.includes(0);

		// Si una opción individual se desmarca, quitar "Seleccionar todos" (0)
		if (isSelectAllChecked && majorsControl.length < allMajors.length + 1) {
			const updatedMajors = majorsControl.filter((value: number) => value !== 0);
			this.form.get('majors')?.setValue(updatedMajors);
		}

		// Actualizar estados de "isAllSelected" e "isIndeterminate"
		this.isAllSelected =
			majorsControl.length === allMajors.length + 1 &&
			majorsControl.includes(0);

		this.isIndeterminate =
			majorsControl.length > 0 && majorsControl.length < allMajors.length + 1;
	}


	removeZeroFromMajors() {
		const majorsControl = this.form.get('majors');
		if (majorsControl) {
			const updatedMajors = majorsControl.value.filter((value: number) => value !== 0);
			majorsControl.setValue(updatedMajors);
		}
	}

	onResetClick(): void {
		this.fileUrl = this.form.get('urlFile').value;
	}

	getFileUrl(): string {
		if (!this.fileUrl) {
			return '';
		}
		return this.fileUrl.includes('publications')
			? this.environment.pullZone + this.fileUrl
			: this.fileUrl;
	}



	protected readonly environment = environment;
}

