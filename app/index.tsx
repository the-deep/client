import React, { StrictMode } from 'react';
import ReactDom from 'react-dom';
import Base from './Base';

ReactDom.render(
    <StrictMode>
        <Base />
    </StrictMode>,
    document.getElementById('app-container'),
);
