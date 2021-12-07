import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/user.service';
import { Observable } from 'rxjs';
import { User } from '../User';
import { TokenStorageService } from '../token-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  user = User;

  constructor(public userService: UserService, private tokenStorageService: TokenStorageService) { 
    this.user = this.tokenStorageService.getUser();
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
  }

  logout(): void {
    this.tokenStorageService.signOut();
    window.location.replace('/main');
  }

}
