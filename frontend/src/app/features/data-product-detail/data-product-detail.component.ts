import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { DataCatalogService } from '../../services/data-catalog.service';
import { GuideService } from '../../services/guide.service';
import { OrderService } from '../../services/order.service';
import { TeamService } from '../../services/team.service';
import { ContactPointService } from '../../services/contact-point.service';
import { ContactCardComponent } from '../../shared/components/contact-card/contact-card.component';
import { SystemUrlService } from '../../core/links/system-url.service';
import { DATA_PRODUCT_TECHNICAL_LABEL, highestInformationSecurityClassification, INFORMATION_SECURITY_CLASSIFICATION_LABELS, TRUST_LEVEL_LABELS, TRUST_LEVEL_TONE } from '../../models';

@Component({
  selector: 'app-data-product-detail',
  imports: [AsyncPipe, RouterLink, ContactCardComponent],
  templateUrl: './data-product-detail.component.html',
  styleUrl: './data-product-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(DataCatalogService);
  private readonly guides = inject(GuideService);
  private readonly orders = inject(OrderService);
  private readonly teams = inject(TeamService);
  private readonly contacts = inject(ContactPointService);
  // Injiceras direkt i templaten (protected) för att slå upp documentationUrlKey – se SystemUrlService.
  protected readonly systemUrlService = inject(SystemUrlService);

  protected readonly trustLevelLabels = TRUST_LEVEL_LABELS;
  protected readonly trustLevelTone = TRUST_LEVEL_TONE;
  protected readonly technicalLabel = DATA_PRODUCT_TECHNICAL_LABEL;
  protected readonly classificationLabels = INFORMATION_SECURITY_CLASSIFICATION_LABELS;

  protected readonly view$ = this.route.paramMap.pipe(
    switchMap((params) => this.catalog.getInformationMartById(params.get('id') ?? '')),
    switchMap((product) =>
      product
        ? combineLatest([
            this.catalog.getDatasetsByIds(product.relatedDatasetIds ?? []),
            this.catalog.getBusinessApplicationsByIds(product.relatedBusinessApplicationIds ?? []),
            this.guides.getByIds(product.relatedGuideIds ?? []),
            this.orders.getOrderTypesByIds(product.relatedOrderTypeIds ?? []),
            product.ownerTeamId ? this.teams.getById(product.ownerTeamId) : of(undefined),
          ]).pipe(
            switchMap(([datasets, applications, relatedGuides, relatedOrderTypes, team]) =>
              (team?.contactPointId ? this.contacts.getById(team.contactPointId) : of(undefined)).pipe(
                map((contact) => ({
                  product,
                  datasets,
                  applications,
                  relatedGuides,
                  relatedOrderTypes,
                  team,
                  contact,
                  highestIncomingClassification: highestInformationSecurityClassification(datasets.map((dataset) => dataset.classification)),
                }))
              )
            )
          )
        : of({
            product: undefined,
            datasets: [],
            applications: [],
            relatedGuides: [],
            relatedOrderTypes: [],
            team: undefined,
            contact: undefined,
            highestIncomingClassification: undefined,
          })
    )
  );
}
