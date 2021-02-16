import React, { useCallback } from 'react';
import ListView from '#rsu/../v2/View/ListView';
import Icon from '#rscg/Icon';
import Button, { ButtonVariant } from '#components/ui/Button';
import ElementFragments from '#components/ui/ElementFragments';
import useSimplePagination from '../useSimplePagination';

import styles from './styles.scss';

interface Props {
    onChange?: (page?: number) => void;
    activePage: number;
    itemsCount: number;
    maxItemsPerPage: number;
    disabled?: boolean;
    showPages?: boolean;
}

interface Page {
    page?: number;
    id: string;
    selected: boolean;
    disabled: boolean;
}

const pageKeySelector = (d: Page) => d.id;

function Pagination(props: Props) {
    const { onChange, ...others } = props;

    const pages = useSimplePagination(others);

    const getPaginationButtonElement = useCallback((id) => {
        switch (id) {
            case 'previous':
                return (
                    <ElementFragments icons={<Icon name="prev" />}>
                        Previous
                    </ElementFragments>
                );
            case 'next':
                return (
                    <ElementFragments actions={<Icon name="next" />}>
                        Next
                    </ElementFragments>
                );
            default:
                return '';
        }
    }, []);

    const pageRendererParams = (_: string, value: Page) => {
        const { selected, page, disabled, id } = value;
        const variant: ButtonVariant = selected ? 'primary' : 'secondary';
        const children = getPaginationButtonElement(id);

        return ({
            variant,
            name: page,
            disabled,
            children,
            onChange,
            className: props.showPages ? styles.dots : styles.pageButton,
        });
    };

    return (
        <ListView
            className={styles.pagination}
            data={pages}
            renderer={Button}
            keySelector={pageKeySelector}
            rendererParams={pageRendererParams}
        />
    );
}

export default Pagination;
