import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { RegisterPublicationResolver } from './services/resolvers/register-publication.resolver';
import { AuthorResolver } from './services/resolvers/author.resolver';
import { EditorialResolver } from './services/resolvers/editorial.resolver';
import { ListPublicationResolver } from './services/resolvers/list-publication.resolver';
import { UpdatePublicationResolver } from './services/resolvers/update-publication.resolver';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
			{
				path: '',
				loadComponent: () => import('./pages/list-publication/list-publication.component').then((c) => c.ListPublicationComponent),
				data: { title: 'Biblioteca', module: 'Biblioteca' },
				resolve: {
					resolver: ListPublicationResolver
				}
			},
      {
        path: 'crear-publicacion',
        loadComponent: () => import('./pages/register-publication/create-or-update-publication.component').then((c) => c.CreateOrUpdatePublicationComponent),
        data: { title: 'Crear Documento', module: 'Biblioteca' },
        resolve: {
          resolver: RegisterPublicationResolver
        }
      },
      {
        path: 'editar-publicacion/:id',
				loadComponent: () => import('./pages/register-publication/create-or-update-publication.component').then((c) => c.CreateOrUpdatePublicationComponent),
        data: { title: 'Gestionar Publicación', module: 'Biblioteca' },
				resolve: {
					resolver: UpdatePublicationResolver
				}
      },
			{
				path: 'autores',
				loadComponent: () => import('./pages/list-author/list-author.component').then((c) => c.ListAuthorComponent),
				data: { title: 'Listado de Autores', module: 'Biblioteca' },
				resolve: {
					resolver: AuthorResolver
				}
			},
			{
				path: 'editoriales',
				loadComponent: () => import('./pages/list-editorial/list-editorial.component').then((c) => c.ListEditorialComponent),
				data: { title: 'Listado de Editoriales', module: 'Biblioteca' },
				resolve: {
					resolver: EditorialResolver
				}
			},
			// {
			// 	path: 'prestamos',
			// 	loadComponent: () => import('./pages/borrowed-publication/borrowed-publication.component').then((c) => c.BorrowedPublicationComponent),
			// 	data: { title: 'Préstamos de publicaciones', module: 'Biblioteca' }
			// },
			{
				path: 'lista-espacios',
				loadComponent: () => import('./pages/list-spaces/list-spaces.component').then((c) => c.ListSpacesComponent),
				data: { title: 'Listado de Espacios', module: 'Biblioteca' }
			},
    ]
  },
	{
    path: '',
    children: [
			{
				path: 'log-espacio/:id',
				loadComponent: () => import('./pages/space-log/space-log.component').then((c) => c.SpaceLogComponent),
				data: { title: 'Biblioteca', module: 'Biblioteca' },
			},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LibraryRoutingModule { }
