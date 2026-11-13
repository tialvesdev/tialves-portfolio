import { useEffect } from 'react';
import './ui/theme.css';
import './showcase/showcase.css';
import App from './App';

/** Catálogo do UI kit (antiga página inicial), agora em /kit. */
export default function KitPage() {
  useEffect(() => {
    document.body.classList.add('gx-root');
    document.title = 'Ateliê Gótico · UI Kit';
    return () => document.body.classList.remove('gx-root');
  }, []);
  return <App />;
}
