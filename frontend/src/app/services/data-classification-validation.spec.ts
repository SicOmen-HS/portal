import { describe, expect, it } from 'vitest';
import { Dataset, InformationMart } from '../models';
import { validateDataClassifications } from './data-classification-validation';

const dataset = (classification: Dataset['classification'] = 'internal'): Dataset => ({
  id: 'dataset-demo', name: 'Demo', description: 'Fiktiv', dataDomain: 'Demo', owner: 'Exempelteam',
  steward: 'Exempelteam', source: 'Demo', accessModel: 'Exempel', classification,
  updateFrequency: 'Dagligen', metadataSource: 'Demo', lifecycleStatus: 'active', visibility: 'all-users',
});
const product = (classification: InformationMart['classification'] = 'internal', relatedDatasetIds = ['dataset-demo']): InformationMart => ({
  id: 'product-demo', name: 'Demo', description: 'Fiktiv', dataDomain: 'Demo', owner: 'Exempelteam',
  classification, relatedDatasetIds, lifecycleStatus: 'active', visibility: 'all-users',
});

describe('validateDataClassifications', () => {
  it('accepterar samma eller högre dataproduktklassning', () => {
    expect(() => validateDataClassifications([dataset()], [product('sensitive')])).not.toThrow();
  });

  it('stoppar lägre dataproduktklassning och trasiga relationer', () => {
    expect(() => validateDataClassifications([dataset('highly-sensitive')], [product('internal')])).toThrow(/lägre klassning/);
    expect(() => validateDataClassifications([dataset()], [product('internal', ['saknas'])])).toThrow(/okänd datamängd/);
  });

  it('stoppar okända och äldre kodvärden', () => {
    expect(() => validateDataClassifications([dataset('restricted' as Dataset['classification'])], [])).toThrow(/Ogiltig/);
    expect(() => validateDataClassifications([dataset('5.1' as Dataset['classification'])], [])).toThrow(/Ogiltig/);
    expect(() => validateDataClassifications([{ ...dataset(), classification: undefined as unknown as Dataset['classification'] }], [])).toThrow(/Ogiltig/);
    expect(() => validateDataClassifications([dataset()], [{ ...product(), classification: undefined as unknown as InformationMart['classification'] }])).toThrow(/Ogiltig/);
  });
});
