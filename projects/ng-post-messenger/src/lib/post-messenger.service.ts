import {Inject, Injectable, OnDestroy, Optional} from '@angular/core';
import {fromEvent, Observable, Subject, timer} from 'rxjs';
import {filter, first, map, mapTo, share, takeUntil, takeWhile, tap} from 'rxjs/operators';
import {NgPostMessageEvent, NgPostMessagePayload} from './models';
import {NgPostMessageConfig, NgPostMessageConfigToken, ngPostMessageDefaultConfig} from './post-messenger.config';

/**
 * @description
 * A service to function as message broker between "Window" objects such IFrames based upon the native postMessage api.
 *
 * @usageNotes
 *
 * ### Using the NgPostMessageService to listen to new message from the parent window
 *
 * The following example shows how to use this service to listen to the parent window messages.
 *
 * ```ts
 * constructor(postMessengerService: NgPostMessageService) {
 *  this.postMessengerService.listen(window.parent).subscribe(message => console.log(message));
 * }
 * ```
 *
 * This following code shows how the parent can send messages to the receiver window
 *
 * ```
 * constructor(postMessengerService: NgPostMessageService) {
 *  this.postMessengerService.connect(myChildrenWindow).subscribe(() => {
 *    this.postMessengerService.send(myChildrenWindow, 'APP', payload: 'Hello my child!');
 *  });
 * }
 *
 * ```
 *
 * @ngModule NgPostMessageModule
 * @publicApi
 */
@Injectable()
export class NgPostMessageService implements OnDestroy {
  /** @internal */
  private readonly destroy$ = new Subject<void>();
  /** @internal */
  private readonly messageListener$: Observable<NgPostMessageEvent>;

  config: NgPostMessageConfig;

  constructor(@Optional() @Inject(NgPostMessageConfigToken) config: NgPostMessageConfig) {
    this.config = config ?? ngPostMessageDefaultConfig;

    // init message listener
    this.messageListener$ = fromEvent<MessageEvent>(window, 'message').pipe(
      takeUntil(this.destroy$),
      map(messageEvent => ({
          ...messageEvent,
          source: messageEvent.source,
          data: typeof messageEvent.data === 'string' ? JSON.parse(messageEvent.data) : messageEvent.data
        }),
      ),
      share()
    );

    // init handshake handler
    this.messageListener$.subscribe(message => {
      if (message.data?.type === 'SYN') {
        this._sendMessage(message.source as Window, 'SYN-ACK');
      }
    });
  }

  /**
   * @description
   *
   * Starts listening on messages dispatched by the specified sender with the postMessage native api.
   * The only messages that are considered are the ones sent with the NgPostMessageService and with an APP-like type.
   * This excludes all messages with a payload different from the NgPostMessagePayload and the handshake messages.
   *
   * @param sender Window object to listen.
   */
  listen<T>(sender: Window): Observable<NgPostMessageEvent<T>> {
    return this.messageListener$.pipe(
      filter(messageEvent => messageEvent.source === sender && messageEvent.data?.type === 'APP'));
  }

  /**
   * @description
   *
   * Tries to start a connection to the specified Window object sending a 'SYN' message.
   * If the receiver is connected, it responds with a 'SYN-ACK' message to notify the sender.
   * The connection may not be established at the first try (the receiver application could still be loading)
   * so the service tries 'maxRetries' times every 'retryPeriod' to establish the connection.
   *
   * @param receiver Window object who will receive the message.
   * @param options Configuration options object for the connection. The configuration
   * object consists of:
   * * `retryPeriod`: Time before retrying a failed connection attempt
   * * `maxRetries`: Number of connection retries
   * Note: the default values can be setup on module import.
   */
  connect(
    receiver: Window,
    options: { retryPeriod: number, maxRetries: number } = {
      retryPeriod: this.config.synRetryPeriod,
      maxRetries: this.config.maxSynRetry
    },
  ): Observable<void> {
    let connectionEstablished: boolean = false;
    let connectionRetries: number = 0;

    timer(0, options.retryPeriod).pipe(
      tap(() => connectionRetries++),
      takeWhile(() => !connectionEstablished && connectionRetries <= options.maxRetries)
    ).subscribe(() => this._sendMessage(receiver, 'SYN'));

    return this.messageListener$.pipe(
      filter(messageEvent => messageEvent.source === receiver && messageEvent.data?.type === 'SYN-ACK'),
      tap(() => connectionEstablished = true),
      mapTo(undefined),
      first(),
    );
  }

  /**
   * @description
   *
   * Sends a message to the specified Window.
   * The message will be available to the receiver via the postMessage native api or in the NgPostMessageService.
   *
   * @param receiver Window object who will receive the message.
   * @param payload Message to send.
   */
  send<T>(receiver: Window, payload?: T): void {
    this._sendMessage<T>(receiver, 'APP', payload);
  }

  /** @internal */
  private _sendMessage<T>(
    receiver: Window,
    type: NgPostMessagePayload['type'],
    payload?: T,
    targetOrigin: string = this.config.defaultTargetOrigin
  ): void {
    receiver.postMessage(JSON.stringify({type, payload}), targetOrigin);
  }

  /** @internal */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
