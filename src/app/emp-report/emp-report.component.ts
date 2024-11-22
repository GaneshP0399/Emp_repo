import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChartData, ChartOptions } from 'chart.js';
// Interface
export interface User {
  id: number;
  f_name: string;
  l_name: string;
  phone: string;
  email: string;
  image: string | null;
  is_phone_verified: number;
  email_verified_at: string | null;
  email_verification_token: string | null;
  cm_firebase_token: string;
  created_at: string;
  updated_at: string;
  status: number;
  order_count: number;
  emp_id: string;
  department_id: number;
  is_veg: number;
  is_sat_opted: number;
  device_id: string;
  is_invalid_device: number;
  is_breakfast: number;
  is_lunch: number;
  is_dinner: number;
}

export interface OptIns {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

export interface Report {
  date: string;
  opt_ins: OptIns | null;
}

export interface Data {
  user: User;
  reports: Report[];
}

@Component({
  selector: 'app-emp-report',
  templateUrl: './emp-report.component.html',
  styleUrls: ['./emp-report.component.scss']
})
export class EmpReportComponent {
  totalFine: number = 0;
  month: any;
  loader: boolean = false
  filteredData: any
  userDetails!: User
  reportdata!: Report[]
  reportdata_v1!: Report[]
  summary: any;
  startDate!: string; 
  endDate!: string;
  categorys = ['breakfast', 'lunch', 'dinner']
  chartData!: ChartData<'bar'>;
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Meal Status by Month',
      },
    },
  };
  constructor(public http: HttpClient) { }
  searchDate() {

    const monthOnly = new Date(this.month).getMonth() + 1;
    // set initial value to calendar
    this.startDate = `${new Date(this.month).getFullYear() - 1}-${(new Date(this.month).getMonth() + 1).toString().padStart(2, '0')}-${new Date(this.month).getDate().toString().padStart(2, '0')}`;
    this.endDate = `${new Date(this.month).getFullYear() - 1}-${(new Date(this.month).getMonth() + 1).toString().padStart(2, '0')}-${new Date(this.month).getDate().toString().padStart(2, '0')}`;
    this.searchReport(monthOnly)
  }

  ngOnInit() {
    this.month = `${new Date().getFullYear() - 1}-${new Date().getMonth() + 1}`
    const monthOnly = new Date().getMonth() + 1;
    this.startDate = `${new Date(this.month).getFullYear()}-${(new Date(this.month).getMonth() + 1).toString().padStart(2, '0')}-${new Date(this.month).getDate().toString().padStart(2, '0')}`;
    this.endDate = `${new Date(this.month).getFullYear()}-${(new Date(this.month).getMonth() + 1).toString().padStart(2, '0')}-${new Date(this.month).getDate().toString().padStart(2, '0')}`;
    console.log(this.startDate)
    console.log(this.endDate)
    this.searchReport(monthOnly)
  }

  searchReport(month: number) {
    this.loader = true
    this.returnReport(month).subscribe({
      next: (data: Data) => {
        this.loader = false
        this.userDetails = data.user
        this.reportdata = data.reports;
        this.reportdata_v1 = data.reports;


        this.generateSummary(data.reports);
        this.initializeChartData(data.reports);
        this.calculateFine()
      },
      error: (error) => {
        this.loader = false
      },
    })
  }

  returnReport(month: number): Observable<any> {
    // API calling
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZWRhNWExODU0OTFhYWE0MmY5YzMyZjRhMTU5MDM1ODk4ZjZiMzMxNWUzZjJjNGRiZDA1N2IyNGE3NTAzMDc3NDBlMjFlYjZmNGE4Mjk0MGUiLCJpYXQiOjE3MDQ4MDA4OTAuODc5OTI1OTY2MjYyODE3MzgyODEyNSwibmJmIjoxNzA0ODAwODkwLjg3OTkyOTA2NTcwNDM0NTcwMzEyNSwiZXhwIjoxNzM2NDIzMjkwLjgzNDkxMjA2MTY5MTI4NDE3OTY4NzUsInN1YiI6IjI2NSIsInNjb3BlcyI6W119.CwDEjlHoRtOXdFcaO6KGGxV202AOA7MMtJVPtKzgLqzTFzUUnDLGBd7PNAtHO2--3YOathM9HOG8hYjY8wjktXZIoCGUR9GWIaEVUxLwFq927CrSf05NuqTBTrJcDeBOjXDvKcSBiJ2A994FC2IunPcdkaZ4jpoaWBIaWueYUbHviYSQuLec3tFcAMg4njrImAlaN9k-QKkHetpdrdbUEX1Wzq4X-1QwuOx7W3W2nbbxaoNgFX1gaabxi00ZO7h5MokGvtqy_gCkS9TYoM74VfxmTyAAczjttLcPqDNiAL_ZJdutDMezw32CZj8G8l8PUL46F_BuaxatZDBUZxeClZh4_0Wvo9GX4zqF2XvHdzZHnwdB414vNCl8itaGW9w7QWbdchPOglhnek32ZmkH0MIqeOBhnAyHo5_WbP0uLd_3qmz3w04nvTbTGV25-QebaxPAsVD0-7Za1sVpqB_FD6yEeliaEzdxl_8gA5IH59uowpfPYgUIjom8NVEASuYsAwb0q3f0jhNRfwg2zmXNenoDunh_dN9l2NRjI2gdZueSMwu6IJLQK46jpn01uG2iQ1xx-pFJAGe_bzSceLsho3dbtabym3tMqi0Ac02xUP9Mn50LdkFJGNVU9jiuHQfyjQirDtGUfya3aIvpJlCGx9Cx99s_4P89uDnOiXy3A1Q'; // Replace this with your actual token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(
      'http://canteen.benzyinfotech.com/api/v3/customer/report',
      { "month": month },
      { headers: headers }
    );
  }

  generateSummary(report: any): void {
    // To get each meal count as per array provided to this method
    this.summary = report.reduce((acc: any, report: any) => {
      const optIns = report.opt_ins as any;
      this.categorys.forEach((meal) => {
        if (optIns[meal]) {
          acc[meal][optIns[meal]]++;
        }
      });

      return acc;
    },

      {
        breakfast: { Delivered: 0, Canceled: 0, Pending: 0 },
        lunch: { Delivered: 0, Canceled: 0, Pending: 0 },
        dinner: { Delivered: 0, Canceled: 0, Pending: 0 }
      }
    );
  }


  initializeChartData(report: any) {
    // Here I create readable data for chart
    const monthStatus = report.reduce((acc: any, report: any) => {
      const month = new Date(report.date).toLocaleString('default', { month: 'long' });

      // If data not available for that date then it should pass below obj for that particular array obj
      if (!acc[month]) {
        acc[month] = { Delivered: 0, Canceled: 0, 'No Data': 0 };
      }
      const optIns = report.opt_ins;
      this.categorys.forEach((meal) => {
        const status = optIns[meal] || 'No Data';
        acc[month][status] = (acc[month][status] || 0) + 1;
      });
      return acc;
    }, {});


    const months = Object.keys(monthStatus);
    // Here we create another object for 'breakfast', 'lunch', 'dinner' wise
    const deliveredCounts = months.map((month) => monthStatus[month]['Delivered']);
    const canceledCounts = months.map((month) => monthStatus[month]['Canceled']);
    const pendingCount = months.map((month) => monthStatus[month]['Pending'])
    const noDataCounts = months.map((month) => monthStatus[month]['No Data']);

    this.chartData = {
      labels: months,
      datasets: [
        { label: 'Delivered', data: deliveredCounts, backgroundColor: 'rgba(204, 255, 204, 0.8)' },
        { label: 'Canceled', data: canceledCounts, backgroundColor: 'rgba(255, 127, 127, 0.8)' },
        { label: 'Pending', data: pendingCount, backgroundColor: 'rgba(255, 255, 204, 0.6)' },
        { label: 'No Data', data: noDataCounts, backgroundColor: 'rgba(50, 50, 50, 0.6)' },
      ],
    };
  }

  calculateFine(): void {
    // This method iterate each array opt_ins obj to count Pending status 
    this.totalFine = this.reportdata_v1.reduce((acc: any, report: any) => {
      this.categorys.forEach((meal) => {
        if (report.opt_ins[meal] === 'Pending') {
          acc += 100;
        }
      });
      return acc;
    }, 0);
  }
  filterData() {

    // This method for to get weekly or daily basis array data
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    //To get approximate date data in from filter
    start.setHours(0, 0, 0, 0);  
    end.setHours(23, 59, 59, 999);  


    this.filteredData = this.reportdata.filter((item: any) => {
      const currentDate = new Date(item.date);
      currentDate.setHours(0, 0, 0, 0); // Setting 0 hours on comparing with start and end each time
      return currentDate >= start && currentDate <= end;
    });
    this.reportdata_v1 = this.filteredData
    this.generateSummary(this.reportdata_v1);
    this.initializeChartData(this.reportdata_v1);
    this.calculateFine()
  }
}
