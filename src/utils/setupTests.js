import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import raf from './tempPolyfills';

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

jest.mock(
    'mapbox-gl',
    () => ({ supported: () => false }),
);

/*
// Make Enzyme functions available in all test files without importing
global.shallow = shallow;
global.render = render;
global.mount = mount;
*/
