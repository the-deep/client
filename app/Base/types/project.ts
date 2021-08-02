import {
    CurrentProjectQuery,
} from '#generated/types';

export type Project = NonNullable<CurrentProjectQuery['project']>;
