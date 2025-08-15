import { CanActivateFn } from '@angular/router';
import { UserService } from '@services/user.service';
import { inject } from '@angular/core';
import { User } from '@utils/models/user.models';
import { ROL } from '@utils/interfaces/login.interfaces';

export const isSecretaryRoleGuard: CanActivateFn = (route, state) => {
  const userService: UserService = inject(UserService);
  const user: User = userService.currentUser;
  return user.rolName.trim() === ROL.ADMIN || user.rolName.trim() === ROL.REGISTRY || user.rolName === ROL.RECTOR;
};
