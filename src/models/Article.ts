export class Article {
  headers: {
    from: string;
    date: string;
    subject: string;
    newsgroups: string;
    'message-id': string;
    bytes: string;
  };
  number: number;

  constructor(article: {
    headers: {
      from: string;
      date: string;
      subject: string;
      newsgroups: string;
      'message-id': string;
      bytes: string;
    };
    number?: number;
  }) {
    this.headers = article.headers;
    this.number = article.number || 0;
  }
}
