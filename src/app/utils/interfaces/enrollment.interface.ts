export interface Instruction {
    academicInstructionID:   number;
    academicInstructionName: string;
    academicInstructionDesc: string;
}

export interface Profession {
    professionID:   number;
    professionName: string;
    professionDesc: string;
}

export interface PaymentInfo {
    id: number;
    periodStart: Date | string;
    periodEnd: Date | string;
    periodName: string;
    duration?: number; // months
    paymentOptions: PaymentOption[];
}

export interface PaymentOption {
    id: number;
    tuitionPrice: number; // Precio Matrícula
    tariff: number; // Arancel
    condition: string; // Condición
    paymentMaxDate: string | Date; // Fecha máxima de pago
    fees: Fee[]; // Cuotas
    isSelected?: boolean;
}

export interface Fee {
    id: number;
    fee: number; // Monto Cuota
    observation?: string; // Observación opcional
}

export interface ClassSchedule {
	class: string;
	schedule: string;
	classroom: string;
	building: string;
	instructor: string;
	days: string;
}

export interface PayMentOptions {
	paymentOptionID:   number;
	enrollTypeDesc:    string;
	paymentOptionDesc: string;
	Matricula_Cuota1:  string;
	cuotaMatricula:    string;
	cuota1:            string;
	cuota2:            string;
	cuota3:            string;
	cuota4:            string;
	cuota5:            string;
	totalAmount:       string;
}

export interface EnrollType {
	enrollTypeDesc: string;
	enrollTypeID: number;
}

export interface ConceptOptionPayment {
	amount: string | number;
	companyID: number;
	conceptsPaymentID: number;
	expirationDate: string;
	paymentOptionID: number;
	periodID: number;
	stateName: string;
	statusID: number;
	user?: string;
	careerID: number;
	studyPlanID: number;
	cycleID: number;
}

export interface EnrolledSubjects {
	paymentOptions?: PayMentOptions[];
	failedSubjectsPaymentConcepts?: FailedSubject[];
}

export interface FailedSubject {
	paymentOptionID: number;
	enrollTypeDesc: string;
	enrollTypeID: number;
	paymentOptionDesc: string;
	Matricula_Cuota1: string;
	amountEnroll: string;
	careerID: number;
	courses: string;
	cuotaMatricula: string;
	cycleId: number;
	cuota1: string;
	cuota2: string;
	cuota3: string;
	cuota4: string;
	cuota5: string;
	totalAmount: string;
	studyPlanID: number;
	tariff: string;
}
