import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  isLoading = false;
  chartData: any;

  constructor() { }

  setIsLoading(value: boolean) {
    this.isLoading = value;
  }

  setChartData(data: any) {
    this.chartData = data;
  }

  getChartData() {
    return this.chartData;
  }
}
