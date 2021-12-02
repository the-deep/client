import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ContainerCard,
    ListView,
    Kraken,
} from '@the-deep/deep-ui';

import { IoIosContacts } from 'react-icons/io';
import Avatar from '#components/Avatar';

import { BasicOrganization } from '#types';

import styles from './styles.css';

// FIXME: use form organization multiselect input compooent
export function organizationTitleSelector(org: BasicOrganization) {
    if (org.mergedAs) {
        return org.mergedAs.title;
    }
    return org.title;
}

interface StakeholderDetailProps {
    logo?: string;
    title: string;
}

function StakeholderDetail(props: StakeholderDetailProps) {
    const { logo, title } = props;
    return (
        <div className={styles.stakeholderDetails}>
            <div className={styles.logoContainer}>
                { logo ? (
                    <Avatar
                        className={styles.icon}
                        alt={title}
                        src={logo}
                    />
                ) : (
                    <IoIosContacts size="1.5rem" />
                )}
            </div>
            <div className={styles.title}>
                { title }
            </div>
        </div>
    );
}

const stakeholderDetailsKeySelector = (d: BasicOrganization) => d.id;
const stakeholderDetailsRendererParams = (_: number, d: BasicOrganization) => ({
    logo: d.logoUrl,
    title: organizationTitleSelector(d),
});

interface Props {
    className?: string;
    data?: BasicOrganization[];
    title: string;
}
function StakeholderList(props: Props) {
    const {
        data,
        title,
        className,
    } = props;

    return (
        <ContainerCard
            className={_cs(styles.stakeholderList, className)}
            heading={title}
            headingSize="extraSmall"
            spacing="compact"
        >
            <ListView
                className={styles.content}
                data={data}
                renderer={StakeholderDetail}
                keySelector={stakeholderDetailsKeySelector}
                rendererParams={stakeholderDetailsRendererParams}
                compactAndVerticalEmptyMessage
                emptyMessage="No organizations were added"
                messageShown
            />
        </ContainerCard>
    );
}

export default StakeholderList;
