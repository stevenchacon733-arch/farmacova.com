import Script from "next/script";

// Solo se cargan si el ID está configurado en Vercel y tiene el formato
// esperado, así no se inyecta nada desde una variable mal escrita.
export function analyticsIds() {
  const ga = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  return {
    ga: /^G-[A-Z0-9]{4,20}$/.test(ga) ? ga : null,
    pixel: /^\d{5,20}$/.test(pixel) ? pixel : null,
  };
}

export function Analytics() {
  const { ga, pixel } = analyticsIds();
  return (
    <>
      {ga && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
