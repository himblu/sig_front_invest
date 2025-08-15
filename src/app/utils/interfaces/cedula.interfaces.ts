export interface Cedula {
	ok:       boolean;
	consulta: Consulta;
}

export interface Consulta {
	cedula?:              string;
	nombre?:              string;
	genero?:              string;
	fechaNacimiento?:     string;
	estadoCivil?:         string;
	conyuge?:             string;
	nacionalidad?:        string;
	fechaCedulacion?:     string;
	lugarDomicilio?:      string;
	calleDomicilio?:      string;
	numeracionDomicilio?: string;
	nombreMadre?:         string;
	nombrePadre?:         string;
	lugarNacimiento?:     string;
	instruccion?:         string;
	profesion?:           string;
	tipoDocumento?:       string;
	sexo?:								string;
}
