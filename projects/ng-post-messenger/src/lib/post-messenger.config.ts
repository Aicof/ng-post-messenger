import {InjectionToken} from '@angular/core';

export const NgPostMessageConfigToken = new InjectionToken<NgPostMessageConfig>('ng-post-messenger/config');

export interface NgPostMessageConfig {
  maxSynRetry: number;
  synRetryPeriod: number;
  defaultTargetOrigin: string;
}

export const ngPostMessageDefaultConfig: NgPostMessageConfig = {
  maxSynRetry: 10,
  synRetryPeriod: 1000,
  defaultTargetOrigin: '/',
};
