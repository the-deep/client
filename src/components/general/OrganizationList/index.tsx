import React from 'react';
import {
    _cs,
} from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import Icon from '#rscg/Icon';
import { ContainerCard } from '@the-deep/deep-ui';

import { ProjectOrganization } from '#typings';
import { organizationTitleSelector } from '#entities/organization';

import styles from './styles.scss';

interface Props {
    className?: string;
    data: ProjectOrganization[];
    title: string;
}
const organizationDetailsKeySelector = (d: ProjectOrganization) => d.organization;
const organizationDetailsRendererParams = (_: number, d: ProjectOrganization) => ({
    logo: d.organizationDetails.logo,
    title: organizationTitleSelector(d.organizationDetails),
});

interface OrganizationDetailProps {
    logo?: string;
    title: string;
}
function OrganizationDetail(props: OrganizationDetailProps) {
    const { logo, title } = props;
    return (
        <div className={styles.organizationDetails}>
            <div className={styles.logoContainer}>
                { logo ? (
                    <img
                        className={styles.img}
                        alt={title}
                        src={logo}
                    />
                ) : (
                    <Icon
                        className={styles.icon}
                        name="userGroup"
                    />
                )}
            </div>
            <div className={styles.title}>
                { title }
            </div>
        </div>
    );
}

function OrganizationList(props: Props) {
    const { data, title, className } = props;

    if (data.length === 0) {
        return null;
    }

    return (
        <ContainerCard
            className={_cs(styles.organizationList, className)}
            headingClassName={styles.heading}
            heading={title}
        >
            <ListView
                className={styles.content}
                data={data}
                renderer={OrganizationDetail}
                keySelector={organizationDetailsKeySelector}
                rendererParams={organizationDetailsRendererParams}
            />
        </ContainerCard>
    );
}

export default OrganizationList;
