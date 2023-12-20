import { WebsocketStreamFeaturesBase } from './setters/mixinBase';
import { WebsocketAPIOptions } from './setters/types';

export class WebsocketStream extends WebsocketStreamFeaturesBase {
    combinedStreams: boolean;
    subscriptions: string[][] = [];

    constructor(options?: WebsocketAPIOptions) {
        super(options);
        this.wsURL = options && options.wsURL ? options.wsURL : 'wss://stream.binance.com:9443';
        this.combinedStreams = options && options.combinedStreams ? options.combinedStreams : false;
    }

    _addSubscription(stream: string[]) {
        this.subscriptions = this.subscriptions.filter((n) => n === stream);
        this.subscriptions.push(stream);
    }

    _removeSubscription(stream: string[]) {
        this.subscriptions = this.subscriptions.filter((n) => n === stream);
    }

    _prepareURL(stream: string | string[]) {
        let url = `${this.wsURL}/ws/${stream}`;
        if (this.combinedStreams) {
            url = `${this.wsURL}/stream?streams=${stream}`;
        }
        return url;
    }

    subscribe(stream: string | string[]) {
        if (!this.isConnected()) {
            const url = this._prepareURL(stream);
            this.initConnect(url);
        } else {
            if (!Array.isArray(stream)) {
                stream = [stream];
            }
            // Add to subscriptions
            this._addSubscription(stream as string[]);
            const payload = {
                method: 'SUBSCRIBE',
                params: stream,
                id: Date.now()
            };

            this.send(JSON.stringify(payload));
        }
    }

    unsubscribe(stream: string | string[]) {
        if (!this.isConnected()) {
            console.warn('Not connected');
        } else {
            if (!Array.isArray(stream)) {
                stream = [stream];
            }
            this._removeSubscription(stream as string[]);

            const payload = {
                method: 'UNSUBSCRIBE',
                params: stream,
                id: Date.now()
            };
            this.send(JSON.stringify(payload));
        }
    }

    resubscribe() {
        this.subscriptions.forEach((stream) => {
            const payload = {
                method: 'SUBSCRIBE',
                params: stream,
                id: Date.now()
            };
            console.info('RESUBSCRIBE', payload);
            this.send(JSON.stringify(payload));
        });

    }
}
