import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/auth';
@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  public chartData: any[] = [];
  public rmse: number | undefined;
  public mape: number | undefined;
  public mae: number | undefined;
  public colorScheme: any;
  public gradient: boolean = false;
  public barPadding: number = 15;
  public roundEdges: boolean = false;

  public view: any[2] = [1200, 600];
  public showXAxis: boolean = true;
  public showYAxis: boolean = true;
  public showLegend: boolean = true;
  public showXAxisLabel: boolean = true;
  public xAxisLabel: string = 'Time';
  public showYAxisLabel: boolean = true;
  public yAxisLabel: string = 'Value';
  user: firebase.User | null| undefined;
  router: any;
  constructor(private afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe(user => {
      this.user = user;
      console.log(user);
      
    });
    this.colorScheme = {
      domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    };
  }

  ngOnInit(): void {
    const responseStr = localStorage.getItem('response');
    if (responseStr) {
      const response = JSON.parse(responseStr);
      console.log(response);

      // Construct data for the bar chart
      const forecastData = Object.keys(response.forecast_data.ds).map((key: string) => {
        const value = response.forecast_data.yhat[key];
        return { name: response.forecast_data.ds[key], value: value !== undefined ? value : 0 };
      });

      // Construct data for the line chart
      const actualData = Object.keys(response.actual.ds).map((key: string) => {
        const value = response.actual.y[key];
        return { name: response.actual.ds[key], value: value !== undefined ? value : 0 };
      });
      this.rmse = response.rmse;
      this.mape = response.mape;
      this.mae = response.mae;
      // Combine data into a single array
      this.chartData = [
        {
          name: 'Actual',
          series: actualData
        },
        {
          name: 'Forecast',
          series: forecastData
        }
      ];

      console.log(this.chartData);
      localStorage.removeItem('response');
    }
  }

  public onSelect(event: any): void {
    console.log(event);
  }
  logout() {
    this.afAuth.signOut()
    .then(() => {
      this.router.navigate(['/login']);
    })
    .catch(error => {
      console.log(error);
    });
  }
}
