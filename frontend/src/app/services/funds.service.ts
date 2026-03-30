import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Fund interface defines the shape of a fund object throughout the entire app
// Every component and service uses this type so TypeScript catches mismatches at compile time
export interface Fund {
  index?: number;       // optional — not in the JSON file, added by frontend or backend per request
  name: string;
  strategies: string[]; // array because a fund can have multiple strategies
  geographies: string[];
  currency: string;
  fundSize: number;     // stored in millions — 1199.0 means $1,199M
  vintage: number;      // the year the fund was established
  managers: string[];
  description: string;
}

// @Injectable marks this class as available for Angular's dependency injection system
// providedIn: 'root' registers ONE shared instance across the entire app (singleton)
// Every component that injects FundsService gets the same instance
@Injectable({ providedIn: 'root' })
export class FundsService {

  // Base URL stored once — if the backend URL changes, update here only
  // private means only methods inside FundsService can access it
  private api = 'http://localhost:3000/api';

  // Angular injects HttpClient automatically via the constructor
  // private http — shorthand that declares AND assigns the property in one line
  // HttpClient is Angular's service for making HTTP requests — returns Observables
  constructor(private http: HttpClient) {}

  // Returns Observable<Fund[]> — not the data itself
  // The HTTP request does NOT fire until a component calls .subscribe()
  // <Fund[]> generic tells TypeScript the response shape — gives autocomplete and type checking
  getAll(): Observable<Fund[]> {
    return this.http.get<Fund[]>(`${this.api}/funds`);
  }

  // Fetches a single fund by its array index
  // The backend adds index to the response so frontend can use it for navigation and API calls
  getOne(index: number): Observable<Fund> {
    return this.http.get<Fund>(`${this.api}/funds/${index}`);
  }

  // Partial<Fund> makes all Fund fields optional
  // This way you can call update(3, { fundSize: 1500 }) without TypeScript complaining
  // about missing required fields like name, vintage, currency etc.
  // The second argument to http.put is the request body — sent as JSON automatically
  update(index: number, fund: Partial<Fund>): Observable<Fund> {
    return this.http.put<Fund>(`${this.api}/funds/${index}`, fund);
  }

  // Observable<any> — no typed interface needed, response is just { success: true }
  // http.delete only needs the URL — no request body
  delete(index: number): Observable<any> {
    return this.http.delete(`${this.api}/funds/${index}`);
  }
}