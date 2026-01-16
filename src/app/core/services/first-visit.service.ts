import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FirstVisitService {
  private readonly STORAGE_KEY = 'kapi_first_visit_completed';

  isFirstVisit(): boolean {
    // Verificar si ya se mostró el modal
    const hasVisited = localStorage.getItem(this.STORAGE_KEY);
    return !hasVisited;
  }

  markAsVisited(): void {
    // Marcar que ya se mostró el modal
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  resetFirstVisit(): void {
    // Método útil para testing o si se quiere resetear
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

