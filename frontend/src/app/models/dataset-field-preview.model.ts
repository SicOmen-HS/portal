/**
 * Beskriver ett enskilt fält i ett dataobjekt (t.ex. Dataset), med ett
 * fiktivt exempelvärde. Används för att visa fältstruktur och en syntetisk
 * exempelpreview innan användaren begär åtkomst — aldrig verklig eller
 * anonymiserad produktionsdata.
 */
export interface DatasetFieldPreview {
  name: string;
  dataType: string;
  description: string;
  exampleValue: string;
}
