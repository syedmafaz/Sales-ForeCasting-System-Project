import { Component, Input, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/auth';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent {
  
  user: firebase.User | null| undefined;
  router: any;
  

  constructor(private afAuth: AngularFireAuth) { }

  ngOnInit() {
  
    this.afAuth.authState.subscribe(user => {
      this.user = user;
      console.log(user);
      
    });
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
