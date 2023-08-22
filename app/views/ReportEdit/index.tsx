import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Button } from '@the-deep/deep-ui';

import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';

import ReportBuilder from './ReportBuilder';
import styles from './styles.css';

interface Props {
    className?: string;
}

function ReportEdit(props: Props) {
    const {
        className,
    } = props;

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
                />
            </div>
        </div>
    );
}

export default ReportEdit;
