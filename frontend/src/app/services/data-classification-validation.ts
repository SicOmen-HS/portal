import {
  Dataset,
  highestInformationSecurityClassification,
  InformationMart,
  INFORMATION_SECURITY_CLASSIFICATION_ORDER,
  InformationSecurityClassification,
} from '../models';

function assertClassification(value: unknown, objectId: string): asserts value is InformationSecurityClassification {
  if (!INFORMATION_SECURITY_CLASSIFICATION_ORDER.includes(value as InformationSecurityClassification)) {
    throw new Error(`Ogiltig informationssäkerhetsklassning för ${objectId}.`);
  }
}

/** Validerar den gemensamma klassningsprincipen innan katalogdata exponeras. */
export function validateDataClassifications(datasets: readonly Dataset[], products: readonly InformationMart[]): void {
  const datasetsById = new Map(datasets.map((dataset) => [dataset.id, dataset]));
  datasets.forEach((dataset) => assertClassification(dataset.classification, dataset.id));

  products.forEach((product) => {
    assertClassification(product.classification, product.id);
    const related = (product.relatedDatasetIds ?? []).map((id) => {
      const dataset = datasetsById.get(id);
      if (!dataset) throw new Error(`Dataprodukten ${product.id} refererar till okänd datamängd ${id}.`);
      return dataset.classification;
    });
    const highest = highestInformationSecurityClassification(related);
    if (highest && INFORMATION_SECURITY_CLASSIFICATION_ORDER.indexOf(product.classification) < INFORMATION_SECURITY_CLASSIFICATION_ORDER.indexOf(highest)) {
      throw new Error(`Dataprodukten ${product.id} har lägre klassning än relaterade datamängder.`);
    }
  });
}
