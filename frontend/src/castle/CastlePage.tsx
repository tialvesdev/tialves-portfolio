import { useEffect } from 'react';
import { wakeApi } from '../api/client';
import './castle-page.css';
import CastleDesktop from './CastleDesktop';

/** Página do portfólio: o castelo jogável (troca sozinho para a versão de celular em telas estreitas). */
export default function CastlePage() {
  useEffect(() => {
    wakeApi();
  }, []);
  return <CastleDesktop />;
}
