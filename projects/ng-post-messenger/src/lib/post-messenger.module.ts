import {ModuleWithProviders, NgModule} from '@angular/core';
import {NgPostMessageConfig, NgPostMessageConfigToken} from './post-messenger.config';
import {NgPostMessageService} from './post-messenger.service';

@NgModule({providers: [NgPostMessageService]})
export class NgPostMessageModule {
  static forRoot(config: NgPostMessageConfig): ModuleWithProviders<NgPostMessageModule> {
    return {
      ngModule: NgPostMessageModule,
      providers: [
        {
          provide: NgPostMessageConfigToken,
          useValue: config
        },
        NgPostMessageService
      ]
    };
  }
}


