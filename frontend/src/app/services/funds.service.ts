import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Fund {
  index?: number;
  name: string;
  strategies: string[];
  geographies: string[];
  currency: string;
  fundSize: number;
  vintage: number;
  managers: string[];
  description: string;
}

@Injectable({ providedIn: 'root' })
export class FundsService {
  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Fund[]> {
    return this.http.get<Fund[]>(`${this.api}/funds`);
  }

  getOne(index: number): Observable<Fund> {
    return this.http.get<Fund>(`${this.api}/funds/${index}`);
  }

  update(index: number, fund: Partial<Fund>): Observable<Fund> {
    return this.http.put<Fund>(`${this.api}/funds/${index}`, fund);
  }

  delete(index: number): Observable<any> {
    return this.http.delete(`${this.api}/funds/${index}`);
  }
}
