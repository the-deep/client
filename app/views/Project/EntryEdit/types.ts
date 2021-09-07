import {
    ProjectFrameworkQuery,
} from '#generated/types';

export type Entry = NonNullable<NonNullable<NonNullable<NonNullable<ProjectFrameworkQuery['project']>['lead']>['entries']>[number]>;
