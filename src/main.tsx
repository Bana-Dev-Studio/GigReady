import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getAppRoute } from './router'
import { PublicLanding } from './PublicLanding'

// Captura el hack del 404 y lo vuelve a poner en la ruta normal del navegador
(function () {
  var redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect != location.href) {
    history.replaceState(null as any, '', redirect);
  } else {
    var q = window.location.search;
    if (q && q.indexOf('?p=') === 0) {
      var route = q.slice(3).split('&')[0];
      window.history.replaceState(
        null as any, 
        '',
        window.location.pathname.slice(0, -1) + route + window.location.hash
      );
    }
  }
})();

const pathname = window.location.pathname
const route = getAppRoute(pathname, import.meta.env.BASE_URL)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {route === 'app' ? <App /> : <PublicLanding />}
  </StrictMode>,
)