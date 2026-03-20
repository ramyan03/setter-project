import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { FundsTableComponent } from './pages/funds-table/funds-table.component';
import { FundDetailComponent } from './pages/fund-detail/fund-detail.component';
import { FundEditComponent } from './pages/fund-edit/fund-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'funds', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'funds', component: FundsTableComponent },
  { path: 'funds/:index/detail', component: FundDetailComponent },
  { path: 'funds/:index/edit', component: FundEditComponent },
  { path: '**', redirectTo: 'funds' },
];
