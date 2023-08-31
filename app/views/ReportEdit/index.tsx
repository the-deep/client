import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    useForm,
} from '@togglecorp/toggle-form';
import { Button } from '@the-deep/deep-ui';

import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';

import ReportBuilder from './ReportBuilder';
import schema, { PartialFormType } from './schema';
import styles from './styles.css';

const defaultValue: PartialFormType = {
    containers: [
        {
            clientId: '1',
            row: 1,
            column: 1,
            width: 3,
        },
        {
            clientId: '2',
            row: 1,
            column: 2,
            width: 6,
        },
        {
            clientId: '3',
            row: 2,
            column: 1,
            width: 3,
        },
    ],
};

interface Props {
    className?: string;
}

function ReportEdit(props: Props) {
    const {
        className,
    } = props;

    const {
        value,
        setFieldValue,
    } = useForm(schema, defaultValue);

    return (
        <div className={_cs(className, styles.reportEdit)}>
            <SubNavbar
                className={styles.header}
                heading="New Report"
                homeLinkShown
                defaultActions={(
                    <>
                        <BackLink
                            defaultLink="/"
                        >
                            Back
                        </BackLink>
                        <Button
                            name={undefined}
                            variant="primary"
                        >
                            Save
                        </Button>
                    </>
                )}
            />
            <div className={styles.content}>
                <div className={styles.leftContent}>
                    Table of contents
                </div>
                <ReportBuilder
                    className={styles.rightContent}
                    value={value}
                    setFieldValue={setFieldValue}
                    disabled={false}
                    readOnly={false}
                />
            </div>
        </div>
    );
}

export default ReportEdit;
