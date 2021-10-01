import {
    ProjectSourcesQuery,
} from '#generated/types';

type Project = NonNullable<ProjectSourcesQuery['project']>;

export type Lead = NonNullable<NonNullable<NonNullable<Project['leads']>['results']>[number]>;
