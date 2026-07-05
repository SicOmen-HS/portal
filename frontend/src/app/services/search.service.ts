import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { ServiceOfferingService } from './service-offering.service';
import { SystemService } from './system.service';
import { GuideService } from './guide.service';
import { DataCatalogService } from './data-catalog.service';
import { OrderService } from './order.service';
import {
  DATA_PRODUCT_TECHNICAL_LABEL,
  Guide,
  LIFECYCLE_STATUS_LABELS,
  LifecycleStatus,
  OrderType,
  SYSTEM_LINK_TYPE_LABELS,
  SystemEntity,
  TRUST_LEVEL_LABELS,
} from '../models';

/**
 * "Dataprodukt" ersätter "Information Mart" som synlig typ, se
 * docs/adr/0001-dataprodukt-som-anvandarbegrepp.md. Den tekniska
 * implementationen (t.ex. Information Mart) visas separat via
 * `SearchResultItem.technicalImplementation`.
 */
export type SearchResultType =
  | 'Tjänst'
  | 'System'
  | 'Systemlänk'
  | 'Guide'
  | 'Datamängd'
  | 'Dataprodukt'
  | 'BI-tillämpning'
  | 'Beställning';

/** Åtkomstläge, använt som eget filter skilt från den friare `access`-texten. */
export type AccessCategory = 'Öppen' | 'Åtkomst krävs' | 'Godkännande krävs';

export interface RelatedRef {
  id: string;
  title: string;
  routerLink: string[];
}

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  type: SearchResultType;
  /** Behov/kategori – används som eget filter, t.ex. datadomän, tjänstekategori eller beställningskategori. */
  category: string;
  routerLink: string[];
  signals: string[];
  owner: string;
  access: string;
  accessCategory: AccessCategory;
  lifecycleStatus: LifecycleStatus;
  /** Kort text om aktualitet, t.ex. uppdateringsfrekvens eller senast uppdaterad. */
  freshness: string;
  /** Teknisk implementation, t.ex. "Information Mart" för en dataprodukt. Sekundär metadata, inte primär typ. */
  technicalImplementation?: string;
  relatedGuides: RelatedRef[];
  relatedOrders: RelatedRef[];
  relatedSystems: RelatedRef[];
}

function guideRef(guide: Guide): RelatedRef {
  return { id: guide.id, title: guide.title, routerLink: ['/guider'] };
}

function orderRef(order: OrderType): RelatedRef {
  return { id: order.id, title: order.name, routerLink: ['/bestall', order.id] };
}

function systemRef(system: SystemEntity): RelatedRef {
  return { id: system.id, title: system.name, routerLink: ['/system'] };
}

function accessFromText(accessModel: string): AccessCategory {
  return accessModel.toLowerCase().includes('öppen') ? 'Öppen' : 'Åtkomst krävs';
}

/**
 * Sammanställer sökbara objekt från flera informationsobjekt så att
 * startsidans och headerns sökfunktion kan söka över hela portalen
 * (docs/12_Designsystem_och_UI.md: "Sök ska vara en central funktion").
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly serviceOfferings = inject(ServiceOfferingService);
  private readonly systems = inject(SystemService);
  private readonly guides = inject(GuideService);
  private readonly dataCatalog = inject(DataCatalogService);
  private readonly orders = inject(OrderService);

  private readonly index$: Observable<SearchResultItem[]> = combineLatest([
    this.serviceOfferings.getAll(),
    this.systems.getAll(),
    this.guides.getAll(),
    this.dataCatalog.getAllDatasets(),
    this.dataCatalog.getAllInformationMarts(),
    this.dataCatalog.getAllBusinessApplications(),
    this.orders.getAllOrderTypes(),
    this.systems.getAllLinks(),
  ]).pipe(
    map(([services, systems, guides, datasets, marts, applications, orders, links]) => [
      ...services.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.name,
          description: item.shortDescription,
          type: 'Tjänst',
          category: item.category,
          routerLink: ['/tjanster', item.id],
          signals: ['Tydligt nästa steg', 'Support finns', LIFECYCLE_STATUS_LABELS[item.lifecycleStatus]],
          owner: 'Ansvarig tjänstefunktion',
          access: 'Öppen information',
          accessCategory: 'Öppen',
          lifecycleStatus: item.lifecycleStatus,
          freshness: `Uppdaterad ${item.lastUpdated}`,
          relatedGuides: guides.filter((guide) => item.guideIds.includes(guide.id)).map(guideRef),
          relatedOrders: orders.filter((order) => item.orderTypeIds.includes(order.id)).map(orderRef),
          relatedSystems: systems.filter((system) => item.relatedSystemIds.includes(system.id)).map(systemRef),
        })
      ),
      ...systems.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.name,
          description: item.description,
          type: 'System',
          category: item.systemType,
          routerLink: ['/system'],
          signals: ['Systemöversikt', LIFECYCLE_STATUS_LABELS[item.lifecycleStatus]],
          owner: item.ownerTeamId ?? 'Ansvarig systemfunktion',
          access: item.authenticationModel ? 'Åtkomst kan krävas' : 'Öppen information',
          accessCategory: item.authenticationModel ? 'Åtkomst krävs' : 'Öppen',
          lifecycleStatus: item.lifecycleStatus,
          freshness: LIFECYCLE_STATUS_LABELS[item.lifecycleStatus],
          relatedGuides: guides.filter((guide) => guide.relatedSystemIds?.includes(item.id)).map(guideRef),
          relatedOrders: orders
            .filter((order) => order.steps.some((step) => step.systemsAffected?.includes(item.id)))
            .map(orderRef),
          relatedSystems: [],
        })
      ),
      ...guides.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: 'Guide',
          category: item.category,
          routerLink: ['/guider'],
          signals: ['Guide', 'Kom igång', LIFECYCLE_STATUS_LABELS[item.lifecycleStatus]],
          owner: item.ownerTeamId ?? 'Ansvarig dokumentationsfunktion',
          access: 'Kan läsas direkt',
          accessCategory: 'Öppen',
          lifecycleStatus: item.lifecycleStatus,
          freshness: `Uppdaterad ${item.lastUpdated}`,
          relatedGuides: [],
          relatedOrders: orders
            .filter((order) => order.relatedServiceId && item.relatedServiceIds?.includes(order.relatedServiceId))
            .map(orderRef),
          relatedSystems: systems.filter((system) => item.relatedSystemIds?.includes(system.id)).map(systemRef),
        })
      ),
      ...datasets.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.name,
          description: item.description,
          type: 'Datamängd',
          category: item.dataDomain,
          routerLink: ['/data', item.id],
          signals: [
            item.lifecycleStatus === 'retiring' ? 'Legacy' : 'Verifierad',
            accessFromText(item.accessModel) === 'Öppen' ? 'Tillgänglig' : 'Åtkomst krävs',
            item.updateFrequency,
          ],
          owner: item.owner,
          access: item.accessModel,
          accessCategory: accessFromText(item.accessModel),
          lifecycleStatus: item.lifecycleStatus,
          freshness: item.updateFrequency,
          relatedGuides: guides.filter((guide) => item.relatedGuideIds?.includes(guide.id)).map(guideRef),
          relatedOrders: orders.filter((order) => item.relatedOrderTypeIds?.includes(order.id)).map(orderRef),
          relatedSystems: systems.filter((system) => item.relatedSystemIds?.includes(system.id)).map(systemRef),
        })
      ),
      ...marts.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.name,
          description: item.description,
          type: 'Dataprodukt',
          category: item.dataDomain,
          routerLink: ['/data/dataprodukt', item.id],
          signals: [
            item.trust ? TRUST_LEVEL_LABELS[item.trust.level] : (item.lifecycleStatus === 'retiring' ? 'Legacy' : 'Verifierad'),
            item.accessModel ? accessFromText(item.accessModel) : 'Åtkomst krävs',
            item.updateFrequency ?? LIFECYCLE_STATUS_LABELS[item.lifecycleStatus],
          ],
          owner: item.owner,
          access: item.accessModel ?? 'Åtkomst kan krävas',
          accessCategory: item.accessModel ? accessFromText(item.accessModel) : 'Åtkomst krävs',
          lifecycleStatus: item.lifecycleStatus,
          freshness: item.updateFrequency ?? (item.lifecycleStatus === 'retiring' ? 'Under avveckling' : 'Aktiv konsumtionsyta'),
          technicalImplementation: DATA_PRODUCT_TECHNICAL_LABEL,
          relatedGuides: guides.filter((guide) => item.relatedGuideIds?.includes(guide.id)).map(guideRef),
          relatedOrders: orders.filter((order) => item.relatedOrderTypeIds?.includes(order.id)).map(orderRef),
          relatedSystems: systems
            .filter((system) =>
              applications.some(
                (app) => item.relatedBusinessApplicationIds?.includes(app.id) && app.systemId === system.id
              )
            )
            .map(systemRef),
        })
      ),
      ...applications.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.name,
          description: item.description,
          type: 'BI-tillämpning',
          category: 'Business Intelligence',
          routerLink: ['/data'],
          signals: [
            item.lifecycleStatus === 'retiring' ? 'Legacy' : 'I drift',
            LIFECYCLE_STATUS_LABELS[item.lifecycleStatus],
          ],
          owner: item.ownerTeamId ?? 'Ansvarig BI-funktion',
          access: 'Behörighet kan krävas',
          accessCategory: 'Åtkomst krävs',
          lifecycleStatus: item.lifecycleStatus,
          freshness: item.lifecycleStatus === 'retiring' ? 'Ersätts av nyare tillämpning' : 'I drift',
          relatedGuides: guides.filter((guide) => guide.relatedSystemIds?.includes(item.systemId ?? '')).map(guideRef),
          relatedOrders: [],
          relatedSystems: systems.filter((system) => system.id === item.systemId).map(systemRef),
        })
      ),
      ...orders.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.name,
          description: item.description,
          type: 'Beställning',
          category: item.category,
          routerLink: ['/bestall', item.id],
          signals: [item.requiresApproval ? 'Godkännande krävs' : 'Ingen attest', 'Tydliga steg'],
          owner: item.ownerTeamId ?? 'Ansvarig beställningsfunktion',
          access: item.requiresApproval ? 'Godkännande krävs' : 'Kan startas direkt',
          accessCategory: item.requiresApproval ? 'Godkännande krävs' : 'Öppen',
          lifecycleStatus: item.lifecycleStatus,
          freshness: LIFECYCLE_STATUS_LABELS[item.lifecycleStatus],
          relatedGuides: guides
            .filter((guide) => item.relatedServiceId && guide.relatedServiceIds?.includes(item.relatedServiceId))
            .map(guideRef),
          relatedOrders: [],
          relatedSystems: systems
            .filter((system) => item.steps.some((step) => step.systemsAffected?.includes(system.id)))
            .map(systemRef),
        })
      ),
      ...links.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.name,
          description: item.description,
          type: 'Systemlänk',
          category: SYSTEM_LINK_TYPE_LABELS[item.linkType],
          routerLink: ['/system'],
          signals: ['Konfigurationsstyrd länk', LIFECYCLE_STATUS_LABELS[item.lifecycleStatus]],
          owner: 'Ansvarig systemfunktion',
          access: 'Länk visas när den är konfigurerad',
          accessCategory: 'Åtkomst krävs',
          lifecycleStatus: item.lifecycleStatus,
          freshness: LIFECYCLE_STATUS_LABELS[item.lifecycleStatus],
          relatedGuides: guides
            .filter((guide) => item.relatedSystemId && guide.relatedSystemIds?.includes(item.relatedSystemId))
            .map(guideRef),
          relatedOrders: [],
          relatedSystems: systems.filter((system) => system.id === item.relatedSystemId).map(systemRef),
        })
      ),
    ])
  );

  getAll(): Observable<SearchResultItem[]> {
    return this.index$;
  }

  search(query: string): Observable<SearchResultItem[]> {
    const normalized = query.trim().toLowerCase();
    return this.index$.pipe(
      map((items) => normalized.length === 0 ? [] : this.rank(items, normalized))
    );
  }

  rank(items: SearchResultItem[], query: string): SearchResultItem[] {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return items;
    return items
      .map((item) => {
        const text = `${item.title} ${item.description} ${item.type} ${item.signals.join(' ')}`.toLowerCase();
        const score = tokens.reduce((sum, token) => sum + (text.includes(token) ? 1 : 0), 0);
        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'sv'))
      .map(({ item }) => item);
  }
}
