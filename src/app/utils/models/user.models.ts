export class User {
    private _userId: number;
    private _PersonId: number;
    private _userName: string;
    private _rolName: string;
		private _rolid: number;
    private _userImg: string;
    private _userEmail: string;
    private _iat: number;
    private _exp: number;
    constructor(
        userId?: number,
        PersonId?: number,
        userName?: string,
        rolName?: string,
        rolid?: number,
        userImg?: string,
        userEmail?: string,
        iat?: number,
        exp?: number,
    ) {
        if (typeof(userId) === 'number') {
            this._userId = userId;
            this._PersonId = PersonId;
            this._userName = userName;
            this._rolName = rolName;
						this._rolid = rolid;
            this._userImg = userImg;
            this._userEmail = userEmail;
            this._iat = iat;
            this._exp = exp;
        } else {
            Object.assign(this, userId);
        }
    }

		get rolid(): number {
			return this._rolid;
		}

		set rolid(value: number) {
			this._rolid = value;
		}

    get userId(): number {
        return this._userId;
    }

    set userId(value: number) {
        this._userId = value;
    }

    get PersonId(): number {
        return this._PersonId;
    }

    set PersonId(value: number) {
        this._PersonId = value;
    }

    get userName(): string {
        return this._userName;
    }

    set userName(value: string) {
        this._userName = value;
    }

    get rolName(): string {
        return this._rolName;
    }

    set rolName(value: string) {
        this._rolName = value;
    }

    get userImg(): string {
        return this._userImg;
    }

    set userImg(value: string) {
        this._userImg = value;
    }

    get userEmail(): string {
        return this._userEmail;
    }

    set userEmail(value: string) {
        this._userEmail = value;
    }

    get iat(): number {
        return this._iat;
    }

    set iat(value: number) {
        this._iat = value;
    }

    get exp(): number {
        return this._exp;
    }

    set exp(value: number) {
        this._exp = value;
    }
}


export interface IUser {
    userId: number;
    PersonId: number;
    userName: string;
    rolName: string;
		rolid: number;
    userImg: string;
    userEmail: string;
    iat: number;
    exp: number;
}
