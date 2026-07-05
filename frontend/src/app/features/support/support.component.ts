import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ContactCardComponent } from '../../shared/components/contact-card/contact-card.component';
import { ContactPointService } from '../../services/contact-point.service';
import { SystemUrlService } from '../../core/links/system-url.service';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Vad är skillnaden mellan en tjänst och ett system?',
    answer:
      'En tjänst är något du kan hitta, förstå, beställa eller få stöd kring, till exempel "Beställ dashboard". Ett system, till exempel Qlik Sense, är verktyget som kan ligga bakom en eller flera tjänster.',
  },
  {
    question: 'Hur vet jag om ett system rekommenderas eller är på väg bort?',
    answer:
      'Titta på livscykelstatusen som visas på tjänster, system och beställningar. Status som "Legacy" eller "Under avveckling" innebär att lösningen inte rekommenderas för nya behov.',
  },
  {
    question: 'Vem godkänner min beställning?',
    answer:
      'Det beror på typ av beställning. Vissa beställningar hanteras automatiskt, andra kräver godkännande från ansvarigt team eller resursägare. Detta framgår på respektive beställningssida.',
  },
  {
    question: 'Var hittar jag mer teknisk dokumentation?',
    answer:
      'Under "Guider & dokumentation" hittar du guider riktade till utvecklare, data engineers och data scientists, utöver de mer verksamhetsnära guiderna.',
  },
];

@Component({
  selector: 'app-support',
  imports: [PageHeaderComponent, ContactCardComponent, RouterLink],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportComponent {
  private readonly contactPointService = inject(ContactPointService);
  // Injiceras direkt i templaten (protected) för att slå upp länknycklarna nedan.
  protected readonly systemUrlService = inject(SystemUrlService);

  protected readonly contacts = toSignal(this.contactPointService.getAll(), { initialValue: [] });
  protected readonly faqItems = FAQ_ITEMS;

  /**
   * TICKETING_SYSTEM_URL är avsiktligt inte satt i runtime-config.json, för att
   * visa hur SystemUrlService degraderar säkert när en länk saknas i miljön
   * (se docs/13_Utvecklarguide.md).
   */
  protected readonly documentationSiteUrlKey = 'DOCUMENTATION_SITE_URL';
  protected readonly ticketingSystemUrlKey = 'TICKETING_SYSTEM_URL';
}
