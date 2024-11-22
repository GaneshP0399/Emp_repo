import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmpReportComponent } from './emp-report/emp-report.component';

const routes: Routes = [
  {
    path:'',
    component:EmpReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
