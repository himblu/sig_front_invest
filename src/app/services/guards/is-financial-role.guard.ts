import { CanActivateFn } from '@angular/router';
import { UserService } from '@services/user.service';
import { inject } from '@angular/core';
import { User } from '@utils/models/user.models';

export const isFinancialRoleGuard: CanActivateFn = (route, state) => {
  const userService: UserService = inject(UserService);
  const user: User = userService.currentUser;
  return user.rolName.trim() === 'ADMINISTRADOR' || user.rolName.trim() === 'FINANCIERO';
};
