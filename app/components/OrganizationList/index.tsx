import React from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { IoIosContacts } from 'react-icons/io';
import { ContainerCard, ListView } from '@the-deep/deep-ui';

import {
    ProjectOrganization,
    OrganizationDetails,
} from '#types';

import styles from './styles.css';

export const organizationTitleSelector = (org: OrganizationDetails) => {
    if (org.mergedAs) {
        return org.mergedAs.title;
    }
    return org.title;
};

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
                    <IoIosContacts />
                )}
            </div>
            <div className={styles.title}>
                { title }
            </div>
        </div>
    );
}

const organizationDetailsKeySelector = (d: ProjectOrganization) => d.organization;
const organizationDetailsRendererParams = (_: number, d: ProjectOrganization) => ({
    logo: d.organizationDetails.logo,
    title: organizationTitleSelector(d.organizationDetails),
});

interface Props {
    className?: string;
    data?: ProjectOrganization[];
    title: string;
}
function OrganizationList(props: Props) {
    const {
        data,
        title,
        className,
    } = props;

    if (!data || data.length === 0) {
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
