import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notice.component.html',
  styleUrls: ['./legal.component.scss']
})
export class NoticeComponent {
  lastUpdated = 'Enero 2026';
}

