// import { Component } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
// import firebase from 'firebase/compat/app';
// import 'firebase/auth';
// import { Router } from '@angular/router';


// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css']
// })
// export class DashboardComponent {
//   public periodicity!: string;
//   public timePeriod!: string;
//   public csvFile!: File;
//   public isLoading = false;

//   constructor(private http: HttpClient, private afAuth: AngularFireAuth,private router: Router) { }

//   onFileSelected(event: any) {
//     this.csvFile = event.target.files[0];
//   }

//   onSubmit() {
//     this.isLoading = true;
//     this.afAuth.currentUser.then((user: firebase.User | null) => {
//       if (user) {
//         user.getIdToken().then((token: string) => {
//           const formData = new FormData();
//           formData.append('csvFile', this.csvFile);
//           formData.append('periodicity', this.periodicity);
//           formData.append('timePeriod', this.timePeriod);
//           const options = { headers: { 'Authorization': token } };
//           this.http.post<any>('http://localhost:5000/upload-csv', formData, options).subscribe(
//             (response) => {
//               console.log(response);
//               console.log(response.forecast_data)
//               this.isLoading = false;
//               this.router.navigate(['/result'], { state: { response: response } });
//             },
//             (error) => {
//               console.log(error);
//               this.isLoading = false;
//             }
//           );
//         });
//       } else {
//         console.log('No user is currently signed in.');
//       }
//     });
//   }
// }
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  
  public periodicity!: string;
  public timePeriod!: string;
  public csvFile!: File;
  constructor(private http: HttpClient, private afAuth: AngularFireAuth,private router: Router) { }

  onFileSelected(event: any) {
    this.csvFile = event.target.files[0];
  }

  onSubmit() {
    if (!this.csvFile || !this.periodicity || !this.timePeriod) {
      alert('Please fill in all required fields.');
      return;
    }
   
    this.afAuth.currentUser.then((user: firebase.User | null) => {
      if (user) {
        user.getIdToken().then((token: string) => {
          const formData = new FormData();
          formData.append('csvFile', this.csvFile);
          formData.append('periodicity', this.periodicity);
          formData.append('timePeriod', this.timePeriod);
          const options = { headers: { 'Authorization': token, 'X-User-Email': user?.email || '' } };
          this.http.post<any>('http://localhost:5000/upload-csv', formData, options).subscribe(
            (response) => {
              console.log(response);
              console.log(response.forecast_data)
             
              // Store response in local storage
              localStorage.setItem('response', JSON.stringify(response));
              this.router.navigate(['/result']);
            },
            (error) => {
              console.log(error);
              
            }
          );
        });
      } else {
        console.log('No user is currently signed in.');
      }
    });
  }
  
}