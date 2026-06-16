import {createRoot} from 'react-dom/client';

const element = document.getElementById('#root');
const root = createRoot(element);

root.render(
  <h1>New, world!</h1>
);