import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { AdminLevel } from '#types';
import {
    TextInput,
    Container,
} from '@the-deep/deep-ui';
import _ts from '#ts';

import styles from './styles.scss';

interface Props {
    className?: string;
    adminLevel: AdminLevel;
}

function AdminLevelCard(props: Props) {
    const {
        className,
        adminLevel,
    } = props;

    return (
        <Container
            className={_cs(className, styles.adminLevel)}
            sub
            headingClassName={styles.title}
            heading={adminLevel.title}
            contentClassName={styles.content}
        >
            <div className={styles.row}>
                <TextInput
                    label={_ts('geoAreas', 'adminLevel')}
                    name="level"
                    readOnly
                    value={adminLevel.level.toString()}
                />
                <TextInput
                    label={_ts('geoAreas', 'adminLevelName')}
                    name="name"
                    readOnly
                    value={adminLevel.title}
                />
            </div>
            <div className={styles.row}>
                <TextInput
                    label={_ts('geoAreas', 'idProperty')}
                    name="codeProp"
                    readOnly
                    value={adminLevel.codeProp}
                />
                <TextInput
                    label={_ts('geoAreas', 'propertyName')}
                    name="nameProp"
                    readOnly
                    value={adminLevel.nameProp}
                />
            </div>
            <div className={styles.row}>
                <TextInput
                    label={_ts('geoAreas', 'idParent')}
                    name="parentCodeProps"
                    readOnly
                    value={adminLevel.parentCodeProp}
                />
                <TextInput
                    label={_ts('geoAreas', 'parentName')}
                    name="parentNameProp"
                    readOnly
                    value={adminLevel.parentNameProp}
                />
            </div>
        </Container>
    );
}

export default AdminLevelCard;
