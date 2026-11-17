# Fase 3 · Pago protegido simulado (Stripe en modo de prueba)

Copia y pega esto en Claude Code:

---

Lee `CLAUDE.md` y las reglas de pago de `docs/spec.md` (sección 5).

Objetivo: el flujo completo de pago protegido sin dinero real.

1. Explícame cómo crear una cuenta de Stripe y obtener las claves de **modo de prueba**. Espérame. La clave secreta solo puede usarse en el servidor (función de Supabase o de Vercel), nunca en el navegador.
2. Al aceptar la quedada: crear el pago con la protección del 5 % y retener el importe (captura manual).
3. Generar un código de entrega de 4 cifras para quien compra.
4. Pantalla para que quien vende introduzca el código: al validarlo, capturar el pago y marcar el anuncio como vendido.
5. Cancelación por ausencia: liberar la retención y notificar.
6. Muestra en la interfaz qué tarjeta de prueba usar (4242 4242 4242 4242) para que los testers puedan completar el flujo.

Haz commit al terminar y dime cómo probarlo de principio a fin.
