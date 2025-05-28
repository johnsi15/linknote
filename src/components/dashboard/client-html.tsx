import dynamic from 'next/dynamic'

// Importar HtmlContent dinámicamente con SSR deshabilitado
const ClientHtml = dynamic(() => import('./html-content').then(mod => mod.HtmlContent), {
  ssr: false,
})

export default ClientHtml
