import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable(
	{providedIn: 'root'}
)
export class ShoppingCartService {

  public cartState = new BehaviorSubject<boolean>(false);

  constructor() { }
}
