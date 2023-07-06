import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ContainerCard,
    Tag,
    ListView,
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
    verified?: boolean;
}

function StakeholderDetail(props: StakeholderDetailProps) {
    const {
        logo,
        title,
        verified,
    } = props;

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
                {verified && (
                    <Tag
                        className={styles.tag}
                        spacing="none"
                        variant="gradient1"
                    >
                        Verified
                    </Tag>
                )}
            </div>
        </div>
    );
}

const stakeholderDetailsKeySelector = (d: BasicOrganization) => d.id;
const stakeholderDetailsRendererParams = (_: string, d: BasicOrganization) => ({
    logo: d.logoUrl,
    title: organizationTitleSelector(d),
    verified: d.verified,
});

interface Props {
    className?: string;
    data?: BasicOrganization[];
    dataPending: boolean;
    title: string;
    error?: string;
}
function StakeholderList(props: Props) {
    const {
        data,
        title,
        dataPending,
        className,
        error,
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
                errored={false}
                data={data}
                renderer={StakeholderDetail}
                keySelector={stakeholderDetailsKeySelector}
                rendererParams={stakeholderDetailsRendererParams}
                compactAndVerticalEmptyMessage
                pending={dataPending}
                filtered={false}
                emptyMessage="No organizations were added"
                messageShown
            />
            <div>{error}</div>
        </ContainerCard>
    );
}

export default StakeholderList;
