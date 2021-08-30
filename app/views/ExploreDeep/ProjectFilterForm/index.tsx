import React, { useCallback, useState } from 'react';

import {
    TextInput,
    DateRangeInput,
    Button,
} from '@the-deep/deep-ui';

// import OrganizationMultiSelectInput from '#components/OrganizationMultiSelectInput';

interface Props {
    filters: {
        search: string;
        organizations: string[];
        createdAt: {
            startDate: string;
            endDate: string;
        };
    };
}

function ProjectFilterForm(props: Props) {
    const {
        filters,
    } = props;

    console.warn('filters', filters);

    const [searchText, setSearchText] = useState<string>(search);

    const handleSubmit = useCallback(() => {
        console.warn('this is handle submit');
    }, []);

    return (
        <div>
            <TextInput
                name="search"
                value={searchText}
                onChange={setSearchText}
            />
            <DateRangeInput
                name="createdAt"
                label="Added On"
                value={{
                    startDate,
                    endDate,
                }}
            />
            <Button
                name="submit"
                type="submit"
                onClick={handleSubmit}
            >
                Submit
            </Button>
        </div>
    );
}

export default ProjectFilterForm;
