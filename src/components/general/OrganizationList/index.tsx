import React from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import Icon from '#rscg/Icon';
import ContainerCard from '#dui/ContainerCard';

import { ProjectOrganization } from '#typings';
import { stakeholderTypes } from '#components/general/AddStakeholdersButton';
import { organizationTitleSelector } from '#entities/organization';

import styles from './styles.scss';

interface Props {
    className?: string;
    data: ProjectOrganization[];
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
    const { data, className } = props;

    if (data.length === 0) {
        return null;
    }

    const fieldsMap = listToMap(stakeholderTypes, d => d.id, d => d.label);
    return (
        <ContainerCard
            className={_cs(styles.organizationList, className)}
            headingClassName={styles.heading}
            heading={fieldsMap[data[0].organizationType]}
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
