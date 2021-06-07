declare module 'enketo-core' {
    // import * as React from 'react';

    // eslint-disable-next-line import/prefer-default-export
    export declare class Form {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(value: string, options: any);

        init(): void;
        validate(): Promise<boolean>;
    }
}
