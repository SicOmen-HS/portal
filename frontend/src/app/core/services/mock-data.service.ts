import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Generisk läsning av lokal mockdata under assets/mock/.
 *
 * I denna mockup ersätter mockdata anrop till backend/API. Domänspecifika
 * services (i app/services/) bygger på denna klass och kapslar vilken fil
 * som hör till vilket informationsobjekt, så att ett framtida byte till
 * riktiga API-anrop bara påverkar en plats (docs/04_Systemarkitektur.md).
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly http = inject(HttpClient);

  load<T>(fileName: string): Observable<T> {
    return this.http.get<T>(`assets/mock/${fileName}`);
  }
}
