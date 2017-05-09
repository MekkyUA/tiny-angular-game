import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { PlayComponent } from './play/play.component';
import { GameoverComponent } from './gameover/gameover.component';

const appRoutes: Routes = [
{
path: 'home',
component: HomeComponent
},
{
path: 'play',
component: PlayComponent
},
{
path: 'gameover',
component: GameoverComponent
},
// otherwise redirect to home
{
path: '**', redirectTo: 'home'
}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
