export interface Segment {
  id: string;
  size: number;
  number: number;
}

export interface Article {
  headers: {
    from: string;
    date: string;
    subject: string;
    newsgroups: string;
    'message-id': string;
    bytes: string;
  };
  number: number;
}

export interface Output {
  readonly writable: WritableStream<Uint8Array>;
}
