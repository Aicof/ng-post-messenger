export type NgPostMessageHandshakeTypes = 'SYN' | 'SYN-ACK';

export type NgPostMessageDataTypes = 'APP';

export interface NgPostMessagePayload<T = any> {
  type: NgPostMessageHandshakeTypes | NgPostMessageDataTypes;
  payload?: T;
}

export interface NgPostMessageEvent<T = any> extends MessageEvent {
  readonly data: NgPostMessagePayload<T>;
}
