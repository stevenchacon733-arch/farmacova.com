# Activar la tarjeta Farmacova en Apple Wallet

La web y los sellos no requieren una cuenta Apple Developer. Para emitir una tarjeta firmada para Apple Wallet se necesita el Apple Developer Program: **US$99 por año**, según [Apple](https://developer.apple.com/support/compare-memberships/). La inscripción y el pago los realiza el titular de Farmacova.

## En Apple Developer

1. [Inscribir la cuenta](https://developer.apple.com/programs/enroll/). Para una organización Apple solicita información de la entidad legal y D‑U‑N‑S. Activa la verificación en dos pasos de tu cuenta Apple.
2. En **Certificates, Identifiers & Profiles → Identifiers → + → Pass Type IDs**, registra **Club Farmacova** y `pass.com.farmacova.fidelidad`.
3. Obtén el **Team ID** de la membresía.
4. En **Certificates → + → Services → Pass Type ID Certificate**, selecciona el identificador de Farmacova.
5. Cuando Apple solicite el CSR, genera la solicitud en tu equipo. No necesitas instalar una aplicación iOS ni usar Xcode para emitir pases desde esta web.
6. Sube solo el archivo `.certSigningRequest` a Apple y descarga el certificado `.cer`. Conserva la clave privada que generó el CSR: el certificado sin esa clave no puede firmar tarjetas.
7. Descarga el certificado intermedio **Apple WWDR** correspondiente al emisor de tu certificado desde [Apple PKI](https://www.apple.com/certificateauthority/). No uses un certificado intermedio de terceros.

[Instrucciones oficiales para identificadores y certificados](https://developer.apple.com/help/account/capabilities/create-wallet-identifiers-and-certificates).

## Generar el CSR en Windows o macOS

Con Node.js 24 y las dependencias instaladas, define localmente `WALLET_CSR_PASSPHRASE` con una contraseña privada de al menos 16 caracteres y ejecuta:

```bash
node scripts/wallet-csr.mjs
```

Se crean `wallet-secrets/Farmacova.certSigningRequest` y `wallet-secrets/signer-key.pem`. La clave se guarda cifrada con AES‑256 y no se imprime. No sobrescribe claves existentes. La carpeta está excluida de Git. Guarda una copia de seguridad privada de la clave y su contraseña; genera un certificado nuevo si pierdes alguna.

## Variables privadas en Vercel

Configura estas variables **en el servidor**, sin prefijo `NEXT_PUBLIC_`:

| Variable | Contenido |
|---|---|
| `SITE_URL` | URL HTTPS real de Farmacova, por ejemplo el dominio verificado de Vercel |
| `APPLE_WALLET_PASS_TYPE_ID` | `pass.com.farmacova.fidelidad` |
| `APPLE_WALLET_TEAM_ID` | Team ID de tu membresía |
| `APPLE_WALLET_CERT_BASE64` | Certificado Pass Type ID en formato PEM, convertido a base64 |
| `APPLE_WALLET_KEY_BASE64` | Clave privada PEM cifrada, convertida a base64 |
| `APPLE_WALLET_KEY_PASSPHRASE` | Contraseña usada al crear la clave |
| `APPLE_WALLET_WWDR_BASE64` | Certificado WWDR en formato PEM, convertido a base64 |

Si Apple entrega un `.cer` binario, conviértelo primero a PEM; base64 de DER no equivale al PEM esperado. Node permite leer DER con `new X509Certificate(bytes).toString()`. No pegar las claves en el chat, el código, GitHub, capturas ni el panel público. Base64 es una codificación, no un cifrado. Renueva los certificados antes de vencer y vuelve a desplegar después de cambiar las variables.

## Qué incluye esta versión

- Ruta `/api/wallet/farmacova`: exige sesión y correo confirmado; solo emite la tarjeta activa del titular autenticado. No acepta un ID de otra persona como parámetro.
- Tarjeta `storeCard`, seis espacios azules/verdes, nombre del socio, progreso, cupones disponibles y QR opaco de miembro.
- Manifiesto SHA‑1, firma CMS/PKCS #7 separada con atributo de fecha, certificado del firmante y WWDR; archivo ZIP `.pkpass`. SHA‑1 del manifiesto sigue el formato exigido por Apple; la firma utiliza SHA‑256.
- Respuesta privada sin caché y tipo `application/vnd.apple.pkpass`. Las claves nunca llegan al navegador.
- El mismo identificador y número de serie permiten reemplazar la tarjeta descargándola de nuevo.

**Los sellos en Wallet no se actualizan automáticamente en esta versión.** Después de una compra o un canje el cliente debe entrar a `/fidelidad` y volver a pulsar **Agregar a Apple Wallet**. La tarjeta web consulta el saldo al cargar; recárgala después de comprar. La actualización remota requeriría implementar el servicio de registro de dispositivos y notificaciones de Apple; no está simulado como si existiera.

Antes de anunciar compatibilidad, emitir una tarjeta con el certificado real y comprobar en un iPhone: añadirla, leer el QR en caja, registrar una compra y reemplazarla conservando una sola tarjeta en Wallet. Las pruebas automáticas verifican el ZIP, manifiesto y firma con certificados de prueba; no sustituyen la validación en iOS.

El enlace de descarga actual utiliza texto sencillo. Para usar el distintivo oficial, el titular debe descargar el SVG español y aceptar la licencia de marketing de Apple, siguiendo sus [guías](https://developer.apple.com/wallet/add-to-apple-wallet-guidelines/).
