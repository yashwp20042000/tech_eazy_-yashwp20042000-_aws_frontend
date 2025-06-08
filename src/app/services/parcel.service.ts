import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Parcel {
  id?: string;
  customerName: string;
  deliveryAddress: string;
  contactNumber: string;
  parcelSize: string;
  parcelWeight: string;
  trackingNumber: string;
  status?: 'Pending' | 'In Transit' | 'Delivered';
  createdAt?: Date;
  updatedAt?: Date;
}

const API_URL = 'hhttps://ideal-palm-tree-q7679prxxvg5f9xwr-8080.app.github.dev/api/parcels';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ParcelService {
  constructor(private http: HttpClient) {}

  // Create a new parcel
  createParcel(parcel: Parcel): Observable<Parcel> {
    return this.http.post<Parcel>(API_URL, parcel, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Get all parcels
  getAllParcels(): Observable<Parcel[]> {
    return this.http.get<{ data: Parcel[] }>(API_URL).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Get parcel by tracking number
  getParcelByTrackingNumber(trackingNumber: string): Observable<Parcel> {
    return this.http.get<{ data: Parcel }>(`${API_URL}/${trackingNumber}`).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Update parcel
  updateParcel(trackingNumber: string, updates: Partial<Parcel>): Observable<Parcel> {
    return this.http.put<Parcel>(
      `${API_URL}/${trackingNumber}`, 
      updates, 
      httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete parcel
  deleteParcel(trackingNumber: string): Observable<void> {
    return this.http.delete<void>(
      `${API_URL}/${trackingNumber}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Search parcels by customer name
  searchParcels(customerName: string): Observable<Parcel[]> {
    return this.http.get<{ data: Parcel[] }>(
      `${API_URL}/search?customerName=${encodeURIComponent(customerName)}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Custom error messages based on status code
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request data';
          break;
        case 404:
          errorMessage = 'Parcel not found';
          break;
        case 409:
          errorMessage = 'Parcel with this tracking number already exists';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
      }
      
      // Include server-provided error message if available
      if (error.error?.message) {
        errorMessage += `\nDetails: ${error.error.message}`;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

