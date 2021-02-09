import React, { useCallback } from 'react';
import ListView from '#rsu/../v2/View/ListView';
import Icon from '#rscg/Icon';
import Button, { ButtonVariant } from '#components/ui/Button';
import useSimplePagination from '../useSimplePagination';

import styles from './styles.scss';

interface Props {
    handleClick?: (page?: number) => void;
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
    const { handleClick, ...others } = props;

    const pages = useSimplePagination(others);

    const getPaginationButtonValue = useCallback((id) => {
        switch (id) {
            case 'previous':
                return (
                    <div>
                        <Icon name="prev" className={styles.iconLeft} />
                        Previous
                    </div>
                );
            case 'next':
                return (
                    <div>
                        Next
                        <Icon name="next" className={styles.iconRight} />
                    </div>
                );
            default:
                return '';
        }
    }, []);

    const pageRendererParams = (_: string, value: Page) => {
        const { selected, page, disabled, id } = value;
        const variant: ButtonVariant = selected ? 'primary' : 'secondary';
        const children = getPaginationButtonValue(id);

        return ({
            variant,
            name: page,
            disabled,
            children,
            onClick: handleClick,
            className: props.showPages ? styles.dots : '',
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
