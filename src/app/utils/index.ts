import {
	Author,
	AuthorFormValue,
	CampusStock,
	Editorial,
	EditorialFormValue,
	Publication,
	PublicationBody,
	PublicationBodyToUpdate,
	PublicationEditionFormValue,
	PublicationRequest,
	PublicationRequestDetail,
	PublicationStock,
	RequestPublicationBody,
	ReturnRequestPublicationDetailBody,
	StockPublicationBody,
	UpdateRequestPublicationBody,
	UpdateRequestPublicationDetailBody
} from '@utils/interfaces/library.interface';
import { EVALUATION_COMPONENT } from '@utils/interfaces/others.interfaces';
import { CustomCalendarEvent, EventForm, PostUpdateEvent } from './interfaces/calendar.interface';
import {
	Curriculum,
	CurriculumBody,
	CurriculumPeriod,
	DayFormValue,
	Filter,
	PracticeHour,
	PracticeUnit,
	RomanNumeral,
	Subject,
	SubjectColor,
	SubjectDependency,
	TemporalPostSubjectSchedule,
	Unit
} from './interfaces/campus.interfaces';
import { BodyToSetInstrument, Period, PERSON_TYPE } from './interfaces/period.interfaces';

export class Utils {
	static ROMAN_NUMERALS: RomanNumeral[] = [
		{ value: 1000, numeral: 'M' },
		{ value: 900, numeral: 'CM' },
		{ value: 500, numeral: 'D' },
		{ value: 400, numeral: 'CD' },
		{ value: 100, numeral: 'C' },
		{ value: 90, numeral: 'XC' },
		{ value: 50, numeral: 'L' },
		{ value: 40, numeral: 'XL' },
		{ value: 10, numeral: 'X' },
		{ value: 9, numeral: 'IX' },
		{ value: 5, numeral: 'V' },
		{ value: 4, numeral: 'IV' },
		{ value: 1, numeral: 'I' }
	];

	static parseCalendarEvent(event: CustomCalendarEvent): any {
		return {
			end: new Date(`${event.calendarEndDate} GMT-0500`),
			id: event.eventID,
			allDay: true,
			title: event.eventName,
			start: new Date(`${event.calendarStartDate} GMT-0500`),
		}
	}

	static parsePeriod(period: Period): Period {
		return {
			periodID: period.periodID,
			periodDetail: period.periodDetail,
			periodDateEnd: new Date(period.periodDateEnd),
			periodDateStart: new Date(period.periodDateStart),
			periodName: period.periodName,
			state: period.state,
			user: period.user
		}
	}


	static getRandomColorPair(): SubjectColor {
		// Array de colores básicos en formato hexadecimal
		// const colors: string[] = ['#DB4437', '#F4B400', '#4285F4', '#0F9D58'];
		const colors = [
			'#FFC3A0', // Rosa pastel
			'#FFD700', // Amarillo pastel
			'#FFB6C1', // Rosa claro
			'#AEC6CF', // Azul cielo
			'#FFA07A', // Salmón claro
			'#FFDB58', // Amarillo mantequilla
			'#C2B280', // Beige claro
			'#98FB98', // Verde menta
			'#F0E68C', // Amarillo khaki
			'#E6E6FA'  // Lavanda pálida
		];
		// const colors = ['#FF5733', '#33FF57', '#5733FF', '#FFFF33', '#33FFFF', '#FF33FF'];

		// Selecciona un color de fondo aleatorio
		const background: string = colors[Math.floor(Math.random() * colors.length)];

		// Calcula el color de texto que tenga suficiente contraste con el color de fondo
		const bgColor = background.slice(1); // Elimina el signo '#' del color de fondo
		const r = parseInt(bgColor.slice(0, 2), 16); // Componente rojo
		const g = parseInt(bgColor.slice(2, 4), 16); // Componente verde
		const b = parseInt(bgColor.slice(4, 6), 16); // Componente azul

		// Calcula el brillo del color de fondo (coeficiente de luminosidad)
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		// Elige el color de texto en función del contraste
		const color: string = brightness > 128 ? '#000000' : '#FFFFFF'; // Si el fondo es claro, el texto es negro; si es oscuro, el texto es blanco
		return { background: background, color: color };
	}

	static filterAndMapCurriculum(curriculum: Curriculum): Curriculum {
		return {
			units: curriculum.units.map((unit) => {
				const filteredRows = unit.rows.map((row) => {
					const filteredSubjects = row.filter((subject) => subject.courseID);

					return filteredSubjects.map((subject) => {
						subject.credits = ((+subject.unsupervisedHours) + (+subject.experimentalHours) + (+subject.faceToFaceHours)) / 48;
						if (Array.isArray(subject.depends)) {
							subject.depends = subject.depends.map((dependency) => {
								if (typeof dependency === 'number') {
									return dependency;
								} else {
									return dependency.id;
								}
							});
						}
						return subject;
					});
				});

				const filteredRowsWithSubjects = filteredRows.filter((row) => row.length > 0);

				return {
					name: unit.name,
					rows: filteredRowsWithSubjects,
				};
			}),
			name: curriculum.name,
			practiceHours: curriculum.practiceHours
		};
	}

	static filterAndFlatCurriculum(curriculum: Curriculum, major: number): CurriculumBody {
		const selectedSubjects: Subject[] = [];
		curriculum.units.forEach((unit: Unit) => {
			unit.rows.forEach((subjects: Subject[]) => {
				subjects.filter((subject: Subject) => subject.courseID).forEach((subject: Subject) => {
					subject.credits = ((+subject.unsupervisedHours) + (+subject.experimentalHours) + (+subject.faceToFaceHours)) / 48;
					subject.careerID = major;
					// FIXME: Cambiar el nombre de esta variable. Antes era un texto ingresado por el usuario. Ahora se selecciona.
					subject.orgUnitID = unit.name;
					if (Array.isArray(subject.depends)) {
						subject.depends = subject.depends.map((dependency: number | SubjectDependency) => {
							if (typeof dependency === 'number') {
								return dependency;
							} else {
								return dependency.id;
							}
						});
					}
					selectedSubjects.push(subject);
				});
			});
		});
		curriculum.practiceHours.forEach((practiceUnit: PracticeUnit) => {
			practiceUnit.rows.forEach((practiceHours: PracticeHour[]) => {
				practiceHours.forEach((practiceHour: PracticeHour) => {
					const subject: Subject = {
						background: null,
						color: null,
						cycle: practiceHour.cycle,
						orgUnitID: practiceUnit.name,
						careerID: major,
						courseID: practiceHour.name,
						faceToFaceHours: practiceHour.hours,
						experimentalHours: 0,
						unsupervisedHours: 0,
						credits: +(practiceHour.hours / 48).toFixed(2),
						depends: []
					};
					selectedSubjects.push(subject);
				});
			});
		});
		return {
			name: curriculum.name,
			subjects: selectedSubjects
		}
	}

	static getCurriculumMatrix(curriculum: Curriculum): { periods: CurriculumPeriod[], curriculum: Curriculum } {
		let periodsLength: number = curriculum.units.reduce((maxCycle, unit) => {
			return unit.rows.reduce((innerMaxCycle, rows) => {
				return rows.reduce((cycleMax, subject) => {
					return Math.max(cycleMax, subject.cycle);
				}, innerMaxCycle);
			}, maxCycle);
		}, 0);
		const periods: CurriculumPeriod[] = [];
		for (let i = 0; i < periodsLength; i++) {
			// Para hacer push en los periodos.
			const periodRomanNumeral = this.intToRoman(i + 1);
			const period: CurriculumPeriod = {
				name: `PERIODO ${periodRomanNumeral}`,
				number: i + 1
			};
			periods.push(period);
		}
		const orderByCycle = (a: Subject, b: Subject) => a.cycle - b.cycle;
		curriculum.units.forEach((unit: Unit) => {
			unit.rows.forEach((row: Subject[]) => {
				const subjectCycles: number[] = row.map((subject: Subject) => subject.cycle);
				const numberPeriods: number[] = periods.map((period: CurriculumPeriod) => period.number);

				const remainingCycles: number[] = numberPeriods.filter((n) => !subjectCycles.includes(n));
				remainingCycles.forEach((cycle: number) => {
					const emptySubject: Subject = {
						cycle: cycle,
						faceToFaceHours: 0,
						experimentalHours: 0,
						credits: 0,
						courseName: '',
						courseID: 0,
						depends: [],
						color: '',
						careerName: '',
						careerID: 0,
						unsupervisedHours: 0,
						background: '',
						studyPlanId: 0
					}
					row.push(emptySubject);
				});
				row = row.sort(orderByCycle);
			});
		});
		return {
			periods,
			curriculum
		}
	}

	static intToRoman(num: number): string {
		const romanNumerals: RomanNumeral[] = this.ROMAN_NUMERALS;
		let result: string = '';
		for (const { value, numeral } of romanNumerals) {
			while (num >= value) {
				result += numeral;
				num -= value;
			}
		}
		return result;
	}

	static bodyToCreateTemporalSubjectSchedule(filters: Filter, day: DayFormValue): TemporalPostSubjectSchedule {
		return {
			careerID: filters.career,
			courseID: day.subjectId,
			campusID: filters.campus,
			classModuleID: filters.module || 0,
			workingDayID: filters.workingDay || 0,
			classRoomID: +day.classroom,
			cycleID: filters.cycle,
			endTime: day.endTime,
			startTime: day.startTime,
			modalityID: filters.modality,
			periodID: filters.period,
			parallelCode: filters.section,
			studyPlanID: filters.studyPlan,
			weekday: day.day,
			personID: day.personId,
			subjectHours: day.subjectHours,
			schoolID: filters.school,
			capacity: +filters.capacity
		}
	}

	static bodyToCreateOrUpdateEvent(formValue: EventForm): PostUpdateEvent {
		return {
			eventID: formValue.eventType,
			branchID: formValue.campus,
			classModuleID: formValue?.module,
			commentary: formValue.observation,
			modalityID: formValue?.modality,
			periodID: formValue.period,
			startDate: '',
			endDate: ''
		}
	}

	static bodyToCreateOrUpdateEditorial(editorial: EditorialFormValue): Editorial {
		return {
			website: editorial.website,
			cityCountryDesc: editorial.cityCountry,
			editorialDesc: editorial.name,
			yearPublication: editorial.foundationYear,
			description: editorial.description,
			cityCountryID: editorial.cityCountryId,
			editorialID: editorial.editorialId
		}
	}

	static bodyToCreateOrUpdateAuthor(author: AuthorFormValue): Author {
		return {
			authorName: author.name,
			nationalityID: author.nationality,
			authorID: author.authorId,
			year: 0 // Esto no tiene sentido
		}
	}

	static bodyToUpdatePublication(publication: Publication, publicationId: string): PublicationBodyToUpdate {
		const edition: PublicationEditionFormValue = publication.editions[0];
		const stock: StockPublicationBody[] = [];
		edition.campusesStock.map((c: CampusStock) => {
			c.stock.map((s: PublicationStock) => {
				stock.push(
					{
						codeUUID: publicationId,
						incomeTypeID: s.incomeType,
						branchID: c.campusId,
						physicalQualityID: s.condition,
						quantity: s.quantity,
					}
				);
			});
		});

		return {
			title: publication.title,
			publicationID: publicationId,
			content: publication.editions[0].content,
			keywords: typeof publication.keywords === 'string' ? publication.keywords : publication.keywords.join(','),
			languageDesc: publication.language,
			summary: publication.editions[0].summary,
			specificSubareaKnowledgeID: publication.knowledgeSpecificSubarea,
			codeISBN: publication.editions[0].publicationCode,
			edition: publication.editions[0].edition,
			publicationYear: publication.editions[0].publicationYear,
			commentary: publication.observation,
			majors: publication.majors,
			publicationSupportID: publication.publicationSupportID,
			editorials: publication.editorials,
			price: publication.price,
			availability: publication.availability,
			income: stock,
			urlFile: publication.urlFile
		}
	}

	static bodyToCreatePublication(publication: Publication): PublicationBody {
		const edition: PublicationEditionFormValue = publication.editions[0];
		const stock: StockPublicationBody[] = [];
		edition.campusesStock.map((c: CampusStock) => {
			c.stock.map((s: PublicationStock) => {
				stock.push(
					{
						incomeTypeID: s.incomeType,
						branchID: c.campusId,
						physicalQualityID: s.condition,
						quantity: s.quantity,
					}
				);
			});
		});
		return {
			publicationTypeID: publication.publicationType,
			specificSubAreaKnowledgeID: publication.knowledgeSpecificSubarea,
			authorID: edition.authors,
			availability: edition.availability,
			codeISBN: edition.publicationCode,
			content: edition.content,
			deweySubCategoryID: publication.deweySubcategory,
			edition: edition.edition,
			estimatedCost: edition.price,
			title: publication.title,
			observation: publication.observation,
			keywords: publication.keywords.toString(),
			languageDesc: publication.language,
			editorials: edition.editorials,
			majors: publication.majors,
			publicationYear: edition.publicationYear,
			titleDesc: publication.title,
			summary: edition.summary,
			income: stock,
			publicationSupportID: publication.publicationSupportID,
			urlFile:  publication.urlFile,
		}
	}

	static bodyToPostRequestedPublication(publication: PublicationRequest): RequestPublicationBody {
		return {
			warrantyID: publication.depositType,
			typeRequestID: 1,
			personID: publication.personID,
			commentary: publication.observation,
			institutionAgreementID: null,
			applicantTypeID: publication.applicantType,
			agreement: '',
			requestStatusID: publication.requestStatusID,
			loanPublication: publication.requestedPublications.map((item: PublicationRequestDetail) => {
				return {
					publicationID: item.publicationId,
					physicalQualityID: item.condition,
					quantity: 1,
					dateDelivery: item.dueDateString,
					requestStatusID: item.requestStatus
				}
			}),
			studentID:publication.studentID
		}
	}

	static bodyToUpdateRequestPublication(requestId: number, status: number, observation: string = ''): UpdateRequestPublicationBody {
		return {
			commentary: observation,
			requestID: requestId,
			statusRequestID: status
		}
	}

	static bodyToUpdateRequestPublicationDetail(requestDetailId: number, status: number, observation: string = ''): UpdateRequestPublicationDetailBody {
		return {
			commentary: observation,
			loanPublicationID: requestDetailId,
			statusRequestID: status
		}
	}

	static bodyToReturnRequestPublicationDetail(requestDetailId: number, condition: number, returnDate: string, observation: string = ''): ReturnRequestPublicationDetailBody {
		return {
			commentary: observation,
			loanPublicationID: requestDetailId,
			dateReturn: returnDate,
			returnPhysicalQualityID: condition
		}
	}

	static bodyToCreateInstrumentConfiguration(config: any): BodyToSetInstrument[] {
		// let personType: number;
		let body: BodyToSetInstrument[] = [];
		if (config.component === EVALUATION_COMPONENT.COEVALUATION_BETWEEN_TEACHERS) {
			config.evaluatorTeachers.forEach((evaluator: any) => {
				evaluator.teachersToBeEvaluated.forEach((evaluated: any) => {
					body.push({
						teacherID: evaluated.id,
						typePerson: PERSON_TYPE.TEACHER,
						studyPlanID: config.studyPlan,
						careerID: config.career,
						courseID: config.subject,
						cycleID: config.cycle,
						evaluationInstrumentsID: config.evaluationInstrument,
						modalityID: config.modality,
						periodID: config.period,
						numberAttemps: config.attempts,
						personID: evaluator.personId,
						schoolID: config.school,
					});
				});
			});
			return body;
		}
		if (
			config.component === EVALUATION_COMPONENT.COEVALUATION_COORDINATOR ||
			!config.component
		) {
			config.evaluatorCoordinators.forEach((evaluator: any) => {
				evaluator.teachersToBeEvaluated.forEach((evaluated: any) => {
					body.push({
						teacherID: evaluated.id,
						typePerson: PERSON_TYPE.TEACHER,
						studyPlanID: config.studyPlan,
						careerID: config.career,
						courseID: config.subject,
						cycleID: config.cycle,
						evaluationInstrumentsID: config.evaluationInstrument,
						modalityID: config.modality,
						periodID: config.period,
						numberAttemps: config.attempts,
						personID: evaluator.personId,
						schoolID: config.school,
					});
				});
			});
			return body;
		}

		if (config.component === EVALUATION_COMPONENT.COEVALUATION_ADMIN) {
			config.evaluatorAdministrators.forEach((evaluator: any) => {
				evaluator.coordinatorsToBeEvaluated.forEach((evaluated: any) => {
					body.push({
						teacherID: evaluated.id,
						typePerson: PERSON_TYPE.COORDINATOR,
						studyPlanID: config.studyPlan,
						careerID: config.career,
						courseID: config.subject,
						cycleID: config.cycle,
						evaluationInstrumentsID: config.evaluationInstrument,
						modalityID: config.modality,
						periodID: config.period,
						numberAttemps: config.attempts,
						personID: evaluator.personId,
						schoolID: config.school,
					});
				});
			});
			return body;
		}
		if (
			config.component === EVALUATION_COMPONENT.STUDENT_EVALUATION ||
			config.component === EVALUATION_COMPONENT.SELF_EVALUATION
		) {
			config.teachersBySubject.forEach((evaluated: any) => {
				body.push({
					parallelCode: config.parallelCode,
					teacherID: evaluated.teacherID,
					typePerson: config.component === EVALUATION_COMPONENT.SELF_EVALUATION ? PERSON_TYPE.TEACHER : PERSON_TYPE.STUDENT,
					studyPlanID: config.studyPlan,
					careerID: config.career,
					courseID: config.subject,
					cycleID: config.cycle,
					evaluationInstrumentsID: config.evaluationInstrument,
					modalityID: config.modality,
					periodID: config.period,
					numberAttemps: config.attempts,
					schoolID: config.school,
					personID: config.component === EVALUATION_COMPONENT.SELF_EVALUATION ? evaluated.personID : null
				});
			});
			return body;
		}
		return body;
	}

	//   static createCurriculumMatrix(curriculum: Curriculum): Curriculum {
	//     // Para encontrar el número de periodos de la malla
	//     let maxCycle = 0;
	//     curriculum.units.forEach((unit: Unit) => {
	//       unit.rows.forEach((row: Subject[]) => {
	//         row.forEach((subject: Subject) => {
	//           if (subject.cycle > maxCycle) {
	//             maxCycle = subject.cycle;
	//           }
	//         });
	//       });
	//     });
	// //
	// // Crear una matriz de registros completa
	//     const registrosCompletos = [];
	//     curriculum.units.forEach((unit: Unit) => {
	//       const unidadesCompletas: Subject[] = [];
	//       unit.rows.forEach((rows) => {
	//         const registrosPeriodo = [];
	//         for (let i = 1; i <= maxCycle; i++) {
	//           const registro = rows.find((subject) => subject.cycle === i);
	//           registrosPeriodo.push(registro || {
	//             credits: 0, // Agrega las propiedades necesarias de Subject
	//             faceToFaceHours: 0,
	//             experimentalHours: 0,
	//             unsupervisedHours: 0,
	//             depends: [], // Agrega otras propiedades según tus necesidades
	//             studyPlanId: 0,
	//             cycle: i,
	//             careerID: 0,
	//             careerName: "",
	//             courseID: "",
	//             courseName: "",
	//           });
	//         }
	//         unidadesCompletas.push(registrosPeriodo);
	//       });
	//
	//       registrosCompletos.push({
	//         name: unit.name,
	//         rows: unidadesCompletas,
	//       });
	//     });
	//   }
}
