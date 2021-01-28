import React from 'react';
import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
} from 'react-router-dom';
import {
    useButtonFeatures,
} from '#components/ui/Button';

type PropsFromButton = Parameters<typeof useButtonFeatures>[0];
export interface ButtonLikeLinkProps extends PropsFromButton, RouterLinkProps {
    className?: string;
    title?: string;
}

function ButtonLikeLink(props: ButtonLikeLinkProps) {
    const {
        title,
        variant,
        className: classNameFromProps,
        actionsClassName,
        iconsClassName,
        childrenClassName,
        disabled,
        children: childrenFromProps,
        icons,
        actions,
        big,
        ...linkProps
    } = props;

    const {
        className,
        children,
    } = useButtonFeatures({
        variant,
        className: classNameFromProps,
        actionsClassName,
        iconsClassName,
        childrenClassName,
        disabled,
        children: childrenFromProps,
        icons,
        actions,
        big,
    });

    return (
        <RouterLink
            className={className}
            title={title}
            {...linkProps}
        >
            { children }
        </RouterLink>
    );
}

export default ButtonLikeLink;
