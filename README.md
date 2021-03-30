# NgPostMessenger

Lightweight service for safe communication between Window objects with <a href="https://angular.io/">Angular</a>

[![npm version](https://badge.fury.io/js/ng-post-meesenger.svg)](https://badge.fury.io/js/ng-post-messenger)


## Table of contents
1. [Getting Started](#getting-started)
2. [Supporting](#supporting)
3. [Installation instructions](#installation-instructions)
4. [Usage](#usage)
5. [Options](#options)
6. [Compatibility](#compatibility)
7. [Contributing](#contributing)
8. [License](#license)

## Getting Started
ng-post-messenger handles safe communications between Window objects on [Angular](https://angular.io) applications.

The library is based on the Window.postMessage() api. Information about compatibility and other related resources are available here:
https://developer.mozilla.org/docs/Web/API/Window/postMessage

## Supporting
ng-post-messenger is an Open Source (MIT Licensed) project started to solve specific problems for <a href="https://www.aicof.it/">Aicof</a> applications. All help and suggestions are appreciated!

## Installation instructions
Install `ng-post-messenger` from `npm`:
```bash
npm install ng-post-messenger --save
```

(optional) Add needed package to NgModule imports to customize the service configuration
```typescript
import {NgModule} from '@angular/core'; 
import {NgPostMessageModule} from 'ng-post-messenger';

@NgModule({
  ...
  imports: [
    NgPostMessageModule.forRoot({
          maxSynRetry: 10,
          synRetryPeriod: 1000,
          defaultTargetOrigin: '*',
        }),
    ...
    ]
  ...
})
```

## Usage
To use NgPostMessage functionality inject the `NgPostMessageService` after importing `NgPostMessageModule` in your angular module.

### NgPostMessageService.connect(receiver, options)

> Tries to start a safe connection to the specified Window object. Emits after the connection is established.

```typescript
import {Injectable} from '@angular/core';
import {NgPostMessageService} from 'ng-post-messenger';

@Injectable()
export class MyService {
  ...
  constructor(postMessage: NgPostMessageService) {
      postMessenger.connect(receiverWindow).subscribe(() => {
          console.log('connection with receiverWindow is established and secure');
      });
  }
  ...
}
```

### NgPostMessageService.send(receiver, payload)

> Sends a message to the specified Window.

```typescript
import {Injectable} from '@angular/core';
import {NgPostMessageService} from 'ng-post-messenger';

@Injectable()
export class MyService {
  ...
  constructor(postMessenger: NgPostMessageService) {
    postMessenger.connect(receiverWindow).subscribe(() => {
      postMessenger.send(receiverWindow, {test: 'Hello my receiverWindow!'});
    });
  }
  ...
}
```

### NgPostMessageService.listen(sender)

> Starts listening to the specified sender.

```typescript
import {Injectable} from '@angular/core';
import {NgPostMessageService} from 'ng-post-messenger';

@Injectable()
export class MyService {
  ...
  constructor(postMessenger: NgPostMessageService) {
    postMessenger.listen(senderWindow).subscribe(message => {
        console.log('[senderWindow] message', message);
    });
  }
  ...
}
```

### Security Note

The native postMessage() api lacks the ability to check if a receiver is ready. 
To alleviate this problem, the `connect` method should be used before sending any message. 
NgPostMessage will take care of handling an 'handshake' between the two parts making sure that, at the time of connection, both ends are ready.

## Options

Notes:

- The default options can be assigned with the `NgPostMessageModule.forRoot(options)` import.
- It is possible to use specific options, ignoring the defaults, following the documentation of the pertinent functions.

| Global              | Type          | Default value    | Values                                                                                         | Description                                                                                                                                                                                         |
| :------------------ | :------------ | :--------------- | :--------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| maxSynRetry         | number        | 10               | time in milliseconds                                                                           | Number of connection retries                                                                                                                                                                                       |
| synRetryPeriod      | number        | 1000             | positive integer number                                                                        | Time before retrying a failed connection attempt                                                                                                                                                                                          |
| defaultTargetOrigin | string        | '/'              | [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) of the current application  | The origin of the window that sent the message (consult the official [postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#the_dispatched_event) documentation for details)                                                                                                                    | behaviour of tooltip                                                                                                                                                                                |

### How to build for development

First time:
 - clone repository
 - `npm install`
 - `npm run build`

## Compatibility

The only dependency is [Angular](https://angular.io).
All the angular version from the `7.x.x` to `9.x.x`.

## Contributing

All contributions are welcome! Both coding and helping others with troubleshooting!

### License

MIT
