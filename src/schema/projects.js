const projectSchema = [];

{
    const name = 'project';
    const schema = {
        doc: {
            name: 'Project',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            data: { type: 'object' },
            memberships: { type: 'array.projectMembership', required: false },
            regions: { type: 'array.object' },
            organizations: { type: 'array.object' },
            title: { type: 'string', required: true },
            description: { type: 'string', required: false },
            analysisFramework: { type: 'uint', required: false },
            analysisFrameworkTitle: { type: 'string' },
            assessmentTemplate: { type: 'uint', required: false },
            assessmentTemplateTitle: { type: 'string' },
            categoryEditor: { type: 'uint', required: false },
            isVisualizationEnabled: { type: 'object' },
            categoryEditorTitle: { type: 'string' },
            userGroups: { type: 'array.userGroupBase' },
            startDate: { type: 'string' }, // date
            endDate: { type: 'string' }, // date
            role: { type: 'uint' },
            memberStatus: { type: 'string' },
            isDefault: { type: 'boolean' },
            isPrivate: { type: 'boolean', required: true },
            numberOfUsers: { type: 'uint' },
            numberOfLeads: { type: 'uint' },
            numberOfEntries: { type: 'uint' },
            entriesActivity: { type: 'array.timevalue' },
            leadsActivity: { type: 'array.timevalue' },
            status: { type: 'string' },
            statusDisplay: { type: 'string' },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectStat';
    const schema = {
        doc: {
            name: 'Project Statistics',
            description: 'Porject information with more details',
        },
        extends: 'dbentity',
        fields: {
            activityLog: { type: 'array.object' },
            analysisFramework: { type: 'uint', required: false },
            analysisFrameworkTitle: { type: 'string' },
            assessmentTemplate: { type: 'uint', required: false },
            assessmentTemplateTitle: { type: 'string' },
            categoryEditor: { type: 'uint', required: false },
            categoryEditorTitle: { type: 'string' },
            createdAt: { type: 'string', required: true }, // date
            createdByDetails: { type: 'object' },
            description: { type: 'string', required: false },
            endDate: { type: 'string' }, // date
            entriesActivity: { type: 'array.timevalue' },
            isDefault: { type: 'boolean' },
            isPrivate: { type: 'boolean', required: true },
            isVisualizationEnabled: { type: 'object' },
            leadsActivity: { type: 'array.timevalue' },
            memberStatus: { type: 'string' },
            numberOfEntries: { type: 'uint' },
            numberOfLeads: { type: 'uint' },
            numberOfLeadsTagged: { type: 'uint' },
            numberOfLeadsTaggedAndControlled: { type: 'uint' },
            numberOfUsers: { type: 'uint' },
            organizations: { type: 'array.object' },
            regions: { type: 'array.object' },
            role: { type: 'uint' },
            startDate: { type: 'string' }, // date
            status: { type: 'string' },
            statusDisplay: { type: 'string' },
            title: { type: 'string', required: true },
            topSourcers: { type: 'array.sourcers' },
            topTaggers: { type: 'array.sourcers' },
            userGroups: { type: 'array.userGroupBase' },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectMembership';
    const schema = {
        doc: {
            name: 'Project Membership',
            description: 'Defines all mapping between Project and User',
        },
        fields: {
            addedBy: { type: 'uint' },
            addedByName: { type: 'string' },
            id: { type: 'uint', required: true },
            joinedAt: { type: 'string' }, // date
            member: { type: 'uint', required: true },
            memberEmail: { type: 'email' },
            memberName: { type: 'string' },
            memberStatus: { type: 'string' },
            memberOrganization: { type: 'string' },
            linkedGroup: { type: 'uint' },
            userGroupOptions: { type: 'array.unknown' },
            project: { type: 'uint', required: true },
            role: { type: 'uint', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectRoleSimple';
    const schema = {
        doc: {
            name: 'Simplified Project Role',
            descriptioin: 'Project Role just containing id and title',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectRole';
    const schema = {
        doc: {
            name: 'Project Role',
            descriptioin: 'Project Role',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            description: { type: 'string', required: true },
            isCreatorRole: { type: 'boolean', required: true },
            isDefaultRole: { type: 'boolean', required: true },
            leadPermissions: { type: 'array.string', required: true },
            entryPermissions: { type: 'array.string', required: true },
            setupPermissions: { type: 'array.string', required: true },
            exportPermissions: { type: 'array.string', required: true },
            assessmentPermissions: { type: 'array.string', required: true },
            level: { type: 'number', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectMini';
    const schema = {
        doc: {
            name: 'Project',
            description: 'One of the main entities, used only for title and id',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            memberStatus: { type: 'string', required: true },
            role: { type: 'uint' },
            analysisFramework: { type: 'uint', required: false },
            assessmentTemplate: { type: 'uint', required: false },
            isVisualizationEnabled: { type: 'object' },
            categoryEditor: { type: 'uint', required: false },
            versionId: { type: 'uint', required: true },
            regions: { type: 'array' },
            isPrivate: { type: 'boolean', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectOptionsGetResponse';
    const schema = {
        doc: {
            name: 'Project Options',
            description: 'Defines response of project options: regions and usergroups',
        },
        fields: {
            regions: { type: 'array.keyValuePair', required: true },
            userGroups: { type: 'array.keyValuePair' },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectGetResponse';
    const schema = {
        doc: {
            name: 'Project Get Response',
            description: 'Response for GET /projects/{id}',
        },
        extends: 'project',
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'sourcers';
    const schema = {
        doc: {
            name: 'sourcers',
            description: 'Top sourcers',
        },
        fields: {
            id: { type: 'uint', required: true },
            userId: { type: 'uint', required: true },
            count: { type: 'uint', required: true },
            name: { type: 'string', required: true },
        },
    };
    projectSchema.push({ name, schema });
}

{
    const name = 'projectPutResponse';
    const schema = {
        doc: {
            name: 'Project Put Response',
            description: 'Response for PUT /projects/{id}',
        },
        extends: 'project',
    };
    projectSchema.push({ name, schema });
}

{
    const name = 'projectsMiniGetResponse';
    const schema = {
        doc: {
            name: 'Projects Get Response',
            description: 'Response for GET /projects/ for title and Id only',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.projectMini', required: true },
            // extra: { type: 'projectsExtra', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectRolesGetResponse';
    const schema = {
        doc: {
            name: 'Project Roles Get Response',
            description: 'Response for GET /projects-roles/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.projectRole', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectStatsGetResponse';
    const schema = {
        doc: {
            name: 'Projects Get Response',
            description: 'Response for GET /projects/stat/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.projectStat', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectMember';
    const schema = {
        doc: {
            name: 'Project Member for Project Members Get Response',
            description: 'Response item for GET /projects/<id>/members/',
        },
        fields: {
            id: { type: 'uint', required: true },
            displayName: { type: 'string', required: true },
            email: { type: 'string', required: false },
            displayPicture: { type: 'uint', required: false },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectMembers';
    const schema = {
        doc: {
            name: 'Project Members Get Response',
            description: 'Response for GET /projects/<id>/members/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.projectMember', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectCreateResponse';
    const schema = {
        doc: {
            name: 'Projects Create Response',
            description: 'Response for POST /projects/',
        },
        extends: 'project',
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectMembershipCreateResponse';
    const schema = {
        doc: {
            name: 'Project Membership POST Response',
            description: 'Response for POST /project-memberships/',
        },
        fields: {
            results: { type: 'array.projectMembership', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectVizGetResponse';
    const schema = {
        doc: {
            name: 'Project VIZ',
            description: 'Viz Data Object URL',
        },
        fields: {
            message: { type: 'string', required: false },
            data: { type: 'string', required: false },
            status: { type: 'string', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
export default projectSchema;
