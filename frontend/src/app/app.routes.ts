import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { FundsTableComponent } from './pages/funds-table/funds-table.component';
import { FundDetailComponent } from './pages/fund-detail/fund-detail.component';
import { FundEditComponent } from './pages/fund-edit/fund-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'funds', pathMatch: 'full' }, // Redirect the empty path to 'funds'
  { path: 'index', component: IndexComponent }, // Add the route for the IndexComponent
  { path: 'funds', component: FundsTableComponent }, // Add the route for the FundsTableComponent
  { path: 'funds/:index/detail', component: FundDetailComponent }, // Add the route for the FundDetailComponent with a dynamic parameter 'index'
  { path: 'funds/:index/edit', component: FundEditComponent }, // Add the route for the FundEditComponent with a dynamic parameter 'index'
  { path: '**', redirectTo: 'funds' }, // Wildcard route to catch any undefined paths and redirect to 'funds'
];
