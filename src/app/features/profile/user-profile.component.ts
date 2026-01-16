import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.isLoading = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
        
        // Si no hay usuario, refrescar desde el servidor
        if (!user) {
          this.authService.refreshUser().subscribe({
            next: (updatedUser) => {
              this.user = updatedUser;
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
            }
          });
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}

