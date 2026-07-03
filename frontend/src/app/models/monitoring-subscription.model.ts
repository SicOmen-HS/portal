/**
 * MonitoringSubscription beskriver en prenumeration på larm/övervakning,
 * t.ex. ett laddningslarm kopplat till en Information Mart eller BI-tillämpning.
 */
export interface MonitoringSubscription {
  id: string;
  name: string;
  description: string;
  relatedInformationMartId?: string;
  relatedBusinessApplicationId?: string;
  triggerCondition: string;
  notificationChannelKey: string;
  ownerTeamId?: string;
  active: boolean;
}
