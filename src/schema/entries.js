import { RavlError } from '@togglecorp/ravl';

import { isFalsy } from '#rsu/common';

const entrySchema = [];

{
    const name = 'entryExport';
    const schema = {
        doc: {
            name: 'entryExport',
            description: 'Export data for entry',
        },
        fields: {
            id: { type: 'uint', required: true },
            data: { type: 'object' },
            exportable: { type: 'uint', required: true },
        },
    };
    entrySchema.push({ name, schema });
}
{
    const name = 'entryFilter';
    const schema = {
        doc: {
            name: 'entryFilter',
            description: 'Filter data for entry',
        },
        fields: {
            number: { type: 'uint' },
            id: { type: 'uint', required: true },
            values: { type: 'array.string' },
            filter: { type: 'uint', required: true },
        },
    };
    entrySchema.push({ name, schema });
}
{
    const name = 'entryAttributes';
    const schema = {
        doc: {
            name: 'entryAttributes',
            description: 'Attributes data for entry',
        },
        fields: {
            // FIXME: id should be required, but not present in some cases in server
            id: { type: 'uint' },
            data: { type: 'object' },
        },
    };
    entrySchema.push({ name, schema });
}
{
    const name = 'entryAttributesMap';
    const schema = {
        doc: {
            name: 'entryAttributesMap',
            description: 'Map of attributes data for entry',
        },
        fields: {
            '*': { type: 'entryAttributes', required: true },
        },
    };
    entrySchema.push({ name, schema });
}
{
    const name = 'entry';
    const schema = {
        doc: {
            name: 'entry',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            analysisFramework: { type: 'uint', required: true },

            image: { type: 'string' },
            excerpt: { type: 'string' },
            dataSeries: { type: 'object' },
            project: { type: 'uint' },
            clientId: { type: 'string' },
            lead: { type: 'uint', required: true },
            entryType: { type: 'string', required: true },
            informationDate: { type: 'string' },
            // exportData: { type: 'array.entryExport', required: true },
            // filterData: { type: 'array.entryFilter', required: true },
            attributes: { type: 'entryAttributesMap', required: true },
            order: { type: 'uint', required: true },
        },
        validator: (self, context) => {
            if (isFalsy(self.excerpt) && isFalsy(self.image) && isFalsy(self.dataSeries)) {
                throw new RavlError('image or excerpt or dataSeries is required', context);
            }
        },
    };
    entrySchema.push({ name, schema });
}

{
    const name = 'miniLead';
    const schema = {
        doc: {
            name: 'miniLead',
            description: 'Object of subset of lead',
        },
        fields: {
            createdAt: { type: 'string', required: true }, // date
            createdBy: { type: 'uint' },
            id: { type: 'uint', required: true },
            source: { type: 'string' },
            title: { type: 'string' },
        },
    };
    entrySchema.push({ name, schema });
}

{
    const name = 'leadsEntriesObject';
    const schema = {
        doc: {
            name: 'LeadsEntriesObject',
            description: 'Object of array of leads and entries',
        },
        fields: {
            leads: { type: 'array.miniLead', required: true },
            entries: { type: 'array.entry', required: true },
        },
    };
    entrySchema.push({ name, schema });
}

{
    const name = 'entriesGetResponse';
    const schema = {
        doc: {
            name: 'Entries',
            description: 'List of entry',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'leadsEntriesObject', required: true },
        },
    };
    entrySchema.push({ name, schema });
}


{
    const name = 'entriesForEditEntriesGetResponse';
    const schema = {
        doc: {
            name: 'Entries',
            description: 'List of entry',
        },
        fields: {
            analysisFramework: { type: 'analysisFramework', required: true },
            entries: { type: 'array.entry', required: true },
            geoOptions: { type: 'object', required: true }, // FIXME: better schema
            lead: { type: 'lead', required: true },
            regions: { type: 'array', required: true }, // FIXME: better schema
        },
    };
    entrySchema.push({ name, schema });
}
export default entrySchema;
