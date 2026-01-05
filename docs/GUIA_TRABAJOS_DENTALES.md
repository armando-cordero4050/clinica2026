# Clasificación de Tratamientos Dentales: Laboratorio vs. Clínica

Esta tabla define qué procedimientos son puramente clínicos y cuáles requieren una orden de producción externa a un laboratorio dental.

| Categoría | Tratamiento | ¿Requiere Lab? | Descripción | Ejemplo de Orden |
| :--- | :--- | :---: | :--- | :--- |
| **Preventivo** | Limpieza / Profilaxis | ❌ NO | Realizado por higienista/dentista en el sillón. | N/A |
| **Preventivo** | Sellantes | ❌ NO | Aplicación de resina líquida en surcos. | N/A |
| **Preventivo** | Flúor | ❌ NO | Aplicación tópica. | N/A |
| **Operativa** | Resina (Relleno) | ❌ NO | Se modela y endurece (cura) directamente en boca. | N/A |
| **Operativa** | Amalgama | ❌ NO | Mezcla de metales colocada directamente. | N/A |
| **Endodoncia** | Tratamiento Conductos | ❌ NO | Limpieza de raíces. (Salvo si requiere poste colado). | N/A |
| **Periodoncia** | Curetaje / Alisado | ❌ NO | Limpieza profunda de encías. | N/A |
| **Cirugía** | Extracción (Exodoncia) | ❌ NO | Retiro de pieza dental. | N/A |
| **Cirugía** | Implante (Colocación) | ❌ NO | Instalación del tornillo de titanio en hueso. | N/A |
| | | | | |
| **Prótesis Fija** | **Corona** | ✅ **SÍ** | Diente completo artificial sobre muñón o implante. | Corona Zirconio A2 |
| **Prótesis Fija** | **Carilla (Veneer)** | ✅ **SÍ** | Lámina estética frontal. | Carilla E-Max BL1 |
| **Prótesis Fija** | **Puente** | ✅ **SÍ** | Estructura de varios dientes unidos. | Puente 3 Unidades |
| **Prótesis Fija** | **Inlay / Onlay** | ✅ **SÍ** | Incrustación rígida cementada (más fuerte que resina). | Onlay Disilicato |
| **Prótesis Fija** | **Perno / Poste Colado** | ✅ **SÍ** | Estructura metálica interna para dientes rotos. | Perno Colado |
| **Prótesis Remov.** | **Prótesis Total** | ✅ **SÍ** | "Placa" completa para desdentados. | Total Acrílico |
| **Prótesis Remov.** | **Parcial (Removible)** | ✅ **SÍ** | Estructura metálica con dientes y ganchos. | Esquelético Cromo |
| **Prótesis Remov.** | **Flexible** | ✅ **SÍ** | Prótesis sin metal (Valplast). | Flexible |
| **Guarda** | **Guarda Oclusal** | ✅ **SÍ** | Protector para bruxismo (dormir). | Guarda Rígida |
| **Ortodoncia** | **Alineadores** | ✅ **SÍ** | Fundas transparentes para mover dientes (Invisalign). | Set Alineadores |
| **Ortodoncia** | **Retenedor** | ✅ **SÍ** | Aparato para mantener posición post-brackets (Hawley). | Placa Hawley |
| **Ortodoncia** | Botón de Nance / Hyrax | ✅ **SÍ** | Aparatos de expansión o anclaje. | Hyrax |

## Catálogo de Servicios de Laboratorio (Referencia IMFOHSALAB)

Esta lista detalla los servicios que se sincronizarán con Odoo para el Wizard de Laboratorio.

### 1. Zirconio (La Nueva Estándar)
| Variante (Marca/Tipo) | Producto | Subtipos | Precio Base (GTQ) |
| :--- | :--- | :--- | :--- |
| **Alemán Estratificado (LD 004)** | Corona | Individual, Puente | **Q 890.00** |
| **Alemán Monolayer (LD 081)** | Corona | Individual, Puente | **Q 890.00** |
| **Alemán CERCON Monolítico (LD 094)** | Corona | Individual, Puente | **Q 890.00** |
| **EconoZir Monolítico (LD 113)** | Corona | Individual, Puente | **Q 650.00*** |

> *Nota: Precios estimados basados en catálogo.*

### 2. Disilicato de Litio (Alta Estética)
| Variante (Marca/Tipo) | Producto | Subtipos | Precio Base (GTQ) |
| :--- | :--- | :--- | :--- |
| **Litio E-MAX (Inyectado)** | Corona | Individual | **Q 725.00** |
| **Litio E-MAX (Inyectado)** | Carilla | Individual | **Q 690.00** |
| **Disilicato Alemán SUPRINITY** | Corona | Individual | **Q 750.00** |

### 3. Metal Porcelana (Clásico)
> **⚠️ Restricción:** Imfohsalab indica que Metal Porcelana se realiza **SOLO SOBRE IMPLANTE**. Para dientes naturales, se prefiere Zirconio.

| Variante (Marca/Tipo) | Producto | Precio Base (GTQ) |
| :--- | :--- | :--- |
| **Sobre Implante** | Corona | **Q 450.00** |

### 4. PMMA (Provisionales)
| Variante (Marca/Tipo) | Producto | Precio Base (GTQ) |
| :--- | :--- | :--- |
| **PMMA (LD 054)** | Corona / Provisional | **Q 275.00** |
| **PMMA Multilayer (LD 104)** | Corona Estética | **Q 350.00** |

---

## Lógica de Tiempos y "Orden Express" (Wizard)

El sistema calcula la fecha de entrega automáticamente basándose en el SLA de cada material.

1.  **Cálculo Estándar (Automático)**:
    *   `Fecha Entrega` = `Hoy` + `SLA Material` (saltando fines de semana).
    *   **Estado UI**: Campo de fecha **BLOQUEADO** (Read-only).

2.  **Orden Express (Excepción)**:
    *   **Acción**: Usuario marca checkbox `[x] Orden Express`.
    *   **Resultado**:
        *   Campo de fecha se desbloquea.
        *   Aparece mensaje de advertencia:
        > **⚠️ "Consulte a su asesor para validar el costo del servicio express."**
    *   **Impacto**: Se marca la orden como `priority: 'urgent'` en base de datos.
