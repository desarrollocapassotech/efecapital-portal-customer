# Listado de mejoras para requisitos no funcionales

Este documento reúne propuestas de mejora orientadas a reforzar los requisitos no funcionales del portal de clientes, de modo que la aplicación ofrezca una experiencia más robusta, segura y escalable.

## Rendimiento y escalabilidad
- Implementar *lazy loading* y división de código para reducir el tiempo de carga inicial y mejorar la percepción de velocidad en dispositivos móviles.
- Añadir monitoreo de métricas clave (LCP, TTFB, uso de CPU y memoria) mediante herramientas como Google Lighthouse o Web Vitals para detectar regresiones tempranas.
- Configurar *caching* efectivo en la capa CDN y en el navegador (con *cache busting* apropiado) para contenidos estáticos y respuestas API.
- Analizar y optimizar consultas a servicios externos, incluyendo políticas de *retry* y *backoff* para manejar picos de tráfico.

## Seguridad y cumplimiento
- Revisar y endurecer encabezados HTTP de seguridad (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) para mitigar ataques comunes.
- Incorporar escáneres automáticos de vulnerabilidades en el *pipeline* de CI/CD y resolver hallazgos de severidad alta de forma prioritaria.
- Documentar y aplicar políticas de manejo de datos sensibles cumpliendo con normativas aplicables (por ejemplo, GDPR o equivalentes regionales).
- Establecer revisiones periódicas de dependencias para mantener versiones actualizadas y con parches de seguridad.

## Observabilidad y operaciones
- Centralizar logs de cliente y servidor en una plataforma de observabilidad con alertas configuradas sobre errores críticos.
- Definir indicadores SLO/SLI (por ejemplo, disponibilidad, tiempo de respuesta, tasa de errores) y tableros de seguimiento para los equipos.
- Preparar *playbooks* de respuesta a incidentes con roles definidos y procedimientos de escalamiento claros.

## Experiencia de usuario y accesibilidad
- Ejecutar auditorías de accesibilidad (WCAG 2.1 AA) y corregir desviaciones detectadas en componentes clave.
- Proporcionar modos de alto contraste y soporte completo para navegación mediante teclado y lectores de pantalla.
- Garantizar tiempos de respuesta inferiores a 200 ms para interacciones críticas en redes 4G promedio.

## Mantenibilidad y calidad de código
- Definir métricas de calidad (cobertura de pruebas, complejidad ciclomática, *linting*) con objetivos mínimos obligatorios en el *pipeline*.
- Promover arquitectura modular y documentación técnica actualizada para facilitar el trabajo de nuevos integrantes del equipo.
- Establecer revisiones de código cruzadas obligatorias y guías de estilo que aseguren consistencia en todo el repositorio.

## Continuidad del negocio
- Implementar respaldos automáticos y pruebas de restauración periódicas para datos críticos.
- Diseñar estrategias de *feature flags* y despliegues controlados (*canary releases*, *blue-green*) que permitan revertir cambios rápidamente.
- Elaborar un plan de continuidad operativa documentado que contemple escenarios de fallas mayores y tiempos de recuperación aceptables.
