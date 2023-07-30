import React from 'react';
import { ExpandableContainer, NumberInput } from '@the-deep/deep-ui';
import { noOp } from '@togglecorp/fujs';
import { useForm } from '@togglecorp/toggle-form';

import { schema } from '../../formSchema';
import IssuesInput from './IssuesInput';

import styles from './styles.css';

interface Props {
    name: string;
    description?: string | null;
}

function PillarItem(props: Props) {
    const {
        name,
        description,
    } = props;

    const {
        value,
        setFieldValue,
        error,
    } = useForm(schema, {});

    return (
        <div className={styles.pillar}>
            <ExpandableContainer
                className={styles.expandableContainer}
                heading={description}
                withoutBorder
            >
                <IssuesInput />
            </ExpandableContainer>

            <NumberInput
                className={styles.input}
                inputSectionClassName={styles.inputSection}
                name="totalDeath"
                placeholder="Total people assessed"
                value={undefined}
                onChange={noOp}
            />
        </div>
    );
}

export default PillarItem;
