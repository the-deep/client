import React from 'react';

import { BasicOrganization } from '#components/selections/NewOrganizationMultiSelectInput';
import { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { GeoArea } from '#components/GeoMultiSelectInput';

interface ContextProps {
    createdByOptions: ProjectMember[] | undefined | null;
    setCreatedByOptions: React.Dispatch<
        React.SetStateAction<ProjectMember[] | undefined | null>
    >;
    assigneeOptions: ProjectMember[] | undefined | null;
    setAssigneeOptions: React.Dispatch<
        React.SetStateAction<ProjectMember[] | undefined | null>
    >;
    authorOrganizationOptions: BasicOrganization[] | undefined | null;
    setAuthorOrganizationOptions: React.Dispatch<
        React.SetStateAction<BasicOrganization[] | undefined | null>
    >;
    sourceOrganizationOptions: BasicOrganization[] | undefined | null;
    setSourceOrganizationOptions: React.Dispatch<
        React.SetStateAction<BasicOrganization[] | undefined | null>
    >;
    entryCreatedByOptions: ProjectMember[] | undefined | null;
    setEntryCreatedByOptions: React.Dispatch<
        React.SetStateAction<ProjectMember[] | undefined | null>
    >;
    geoAreaOptions: GeoArea[] | undefined | null;
    setGeoAreaOptions: React.Dispatch<
        React.SetStateAction<GeoArea[] | undefined | null>
    >;
}

const SourcesFilterContext = React.createContext<ContextProps>({
    createdByOptions: [],
    setCreatedByOptions: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setCreatedByOptions called on SourcesFilterContext without a provider', value);
    },
    assigneeOptions: [],
    setAssigneeOptions: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setAssigneeOptions called on SourceFilterContext without a provider', value);
    },
    authorOrganizationOptions: [],
    setAuthorOrganizationOptions: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setAuthorOrganizationOptions called on SourceFilterContext without a provider', value);
    },
    sourceOrganizationOptions: [],
    setSourceOrganizationOptions: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setSourceOrganizationOptions called on SourceFilterContext without a provider', value);
    },
    entryCreatedByOptions: [],
    setEntryCreatedByOptions: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setEntryCreatedByOptions called on SourcesFilterContext without a provider', value);
    },
    geoAreaOptions: undefined,
    setGeoAreaOptions: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setGeoAreaOptions called on SourcesFilterContext without a provider', value);
    },
});

export default SourcesFilterContext;
