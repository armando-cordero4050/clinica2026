Especificación Técnica e Implementación Exhaustiva de Odontogramas Interactivos SVG para Software de Gestión Dental1. Introducción a la Visualización de Datos Clínicos DentalesLa transición de los registros médicos en papel a los sistemas de Historia Clínica Electrónica (HCE) ha presentado desafíos únicos en el ámbito de la odontología. A diferencia de la medicina general, donde gran parte de la información es textual o numérica (presión arterial, resultados de laboratorio), la odontología es fundamentalmente espacial y visual. El estado de salud oral de un paciente se representa mediante un mapa topográfico de la cavidad bucal: el odontograma.El odontograma no es simplemente una imagen estática; es una interfaz crítica de entrada y salida de datos que debe reflejar la realidad clínica con precisión legal y anatómica. En el contexto del desarrollo de software moderno, la implementación de un odontograma interactivo exige una arquitectura robusta que combine la precisión de la ingeniería de software con los estándares de la informática dental.Este informe técnico detalla la metodología, arquitectura y código necesario para generar un odontograma basado en Gráficos Vectoriales Escalables (SVG), diseñado para ser "listo para usar" en aplicaciones web modernas (React, Vue, Angular). A diferencia de las soluciones basadas en imágenes de mapa de bits (JPG/PNG) o Canvas HTML5, el enfoque SVG permite una manipulación semántica del Document Object Model (DOM), accesibilidad nativa y una escalabilidad infinita sin pérdida de resolución, factores críticos para la visualización en dispositivos móviles y pantallas de alta densidad.11.1 El Imperativo del SVG en la Informática DentalLa elección de SVG sobre otras tecnologías gráficas no es arbitraria. Un odontograma debe soportar interacciones granulares: el usuario (dentista) debe poder hacer clic en una superficie específica de un diente (por ejemplo, la cara mesial del primer molar superior derecho) para registrar una caries o una restauración.Las tecnologías de rasterizado (imágenes planas) requieren mapas de imágenes complejos (<map> y <area>) que no escalan bien y son difíciles de mantener dinámicamente. El Canvas de HTML5, aunque performante, funciona en "modo inmediato", lo que significa que una vez dibujado un píxel, el sistema pierde la referencia al objeto que lo creó, complicando la gestión de eventos (clics, hovers).SVG, por el contrario, opera en "modo retenido". Cada diente y cada superficie dental es un nodo independiente en el DOM. Esto permite:Estilado CSS Dinámico: Cambiar el color de una amalgama de gris a azul simplemente alternando una clase CSS, sin redibujar el lienzo.Accesibilidad (a11y): Etiquetar cada diente con atributos ARIA (aria-label="Diente 18, superficie oclusal") para lectores de pantalla, cumpliendo con normativas de accesibilidad en software médico.Resolución Independiente: El gráfico se ve nítido tanto en un monitor 4K de escritorio como en una tablet iPad Pro utilizada en el sillón dental.Peso Ligero: Un odontograma geométrico completo en SVG puede pesar menos de 10KB, comparado con megabytes de imágenes de alta resolución.El objetivo de este documento es proporcionar una guía definitiva para construir este activo digital, abordando desde la teoría de la notación dental hasta la implementación matemática de las curvas de Bézier y la lógica de negocio frontend.2. Fundamentos Teóricos y Estandarización de la NotaciónAntes de escribir una sola línea de código, es imperativo comprender las reglas de negocio que rigen la representación dental. Un error en la numeración o en la orientación de las superficies puede derivar en errores de tratamiento y responsabilidades legales para el profesional y el desarrollador del software.42.1 Sistemas de Numeración Dental: ISO 3950 vs. Sistema UniversalEl software dental global debe ser agnóstico respecto al sistema de numeración, pero la capa de presentación (el SVG) debe ser capaz de renderizar cualquiera de los estándares principales. La arquitectura interna del SVG debe utilizar identificadores inmutables que luego se mapeen a la etiqueta visual preferida por el usuario.52.1.1 Sistema FDI / ISO 3950 (Estándar Internacional)Utilizado en la mayoría de los países de habla hispana, Europa y Canadá. Se basa en un código de dos dígitos:Primer Dígito (Cuadrante):1: Superior Derecho (Permanente)2: Superior Izquierdo (Permanente)3: Inferior Izquierdo (Permanente)4: Inferior Derecho (Permanente)5-8: Correspondientes para la dentición temporal (dientes de leche).Segundo Dígito (Posición):1 (Incisivo Central) a 8 (Tercer Molar).En este sistema, el "11" es el incisivo central superior derecho. La lógica programática es sencilla: (cuadrante * 10) + posición.72.1.2 Sistema Universal (ADA - American Dental Association)Predominante en Estados Unidos. Numera los dientes permanentes del 1 al 32 secuencialmente, comenzando por el tercer molar superior derecho (1), cruzando al superior izquierdo (16), bajando al inferior izquierdo (17) y terminando en el inferior derecho (32).El Conflicto de Datos: El diente "11" en el sistema FDI es el incisivo central. En el sistema Universal, el diente "11" es el canino superior izquierdo.Implicación para el SVG: Nunca se debe usar el número de visualización como id del elemento SVG. Se debe usar un ID semántico interno, por ejemplo: id="tooth-UR-1" (Upper Right 1, refiriéndose a la posición anatómica) o id="iso-11", y dejar que una capa de lógica decida qué número mostrar al usuario.92.2 Nomenclatura de Superficies y Orientación EspacialLa unidad atómica de interacción en un odontograma no es el diente, sino la superficie. Cada diente tiene cinco superficies clínicamente relevantes que deben ser dibujadas como polígonos independientes dentro del grupo (<g>) del diente.SuperficieCódigoDescripción AnatómicaRepresentación Geométrica SVGOclusal / IncisalO / ILa superficie de mordida (superior en molares, borde en anteriores).El polígono central (cuadrado o círculo).MesialMLa cara del diente más cercana a la línea media de la cara.Crítico: Depende del cuadrante. En el lado derecho del paciente (Cuadrantes 1 y 4), Mesial es la izquierda visual. En el lado izquierdo (2 y 3), Mesial es la derecha visual.DistalDLa cara más alejada de la línea media.Opuesto a Mesial.VestibularV / BLa cara externa, hacia el vestíbulo (labios/mejillas). También llamada Bucal o Labial.Generalmente el polígono superior en el arco maxilar y el inferior en el mandibular (o viceversa según la convención de despliegue).Lingual / PalatinoL / PLa cara interna, hacia la lengua o paladar.Opuesto a Vestibular.11Desafío de Implementación: La orientación "Izquierda/Derecha" se invierte al cruzar la línea media. Un SVG estático no sirve; se requiere un componente que invierta la geometría o use transformaciones (transform="scale(-1, 1)") para los cuadrantes 2 y 3, asegurando que la superficie "Mesial" siempre esté orientada hacia la línea media del gráfico.143. Arquitectura del Odontograma Geométrico SVGPara una aplicación de software, se recomienda encarecidamente el uso de un Odontograma Geométrico en lugar de uno Anatómico.Anatómico: Dibujos realistas. Problema: Las superficies son irregulares, difíciles de clicar y visualmente confusas cuando se superponen múltiples tratamientos.Geométrico: Abstracción del diente en formas básicas (círculos o cuadrados divididos). Ventaja: Áreas de clic claras, fácil estandarización visual y correspondencia directa con bases de datos relacionales.163.1 El Modelo de Caja ("Box Model") vs. Modelo CircularPara esta especificación, utilizaremos el Modelo de Caja Modificado, que es el estándar de facto en sistemas modernos como Dentrix o Open Dental. Este modelo representa cada diente como un cuadrado con bordes redondeados, dividido en 5 sectores: un centro (oclusal) y cuatro trapecios periféricos.Este diseño maximiza el área de clic (Fitts's Law) y permite una fácil visualización de tratamientos complejos como puentes y coronas.3.2 Definición del Sistema de Coordenadas (ViewBox)Definiremos un lienzo SVG (Canvas) que alojará los 32 dientes permanentes y, opcionalmente, los 20 temporales.XML<svg viewBox="0 0 1000 650" xmlns="http://www.w3.org/2000/svg" class="odontogram-container">
  <defs>... </defs>
  
  <g id="permanent-dentition">
     <g id="quadrant-1" transform="translate(0,0)">... </g>
     <g id="quadrant-2" transform="translate(510,0)">... </g>
     </g>
</svg>
Calcularemos el tamaño base de cada "Icono de Diente" en 60x60 unidades.Separación (Gap): 10 unidades entre dientes.Separación de Cuadrantes: 40 unidades (para la línea media).Ancho total: (8 dientes * 60) + (7 espacios * 10) = 550 unidades por arco.Ajuste: Para acomodar todo en una vista web, usaremos dos filas: Maxilar (Superior) y Mandibular (Inferior).3.3 Construcción Matemática del Diente GeométricoAquí es donde resolvemos el "cómo se hace" detallado. En lugar de dibujar 32 dientes manualmente, diseñaremos un Prototipo de Diente y lo instanciaremos.Definiremos un sistema de coordenadas local de 100x100 para facilitar los cálculos porcentuales, que luego escalaremos al tamaño final de 60x60.Coordenadas de los Vértices para un Diente Geométrico Cuadrado:Centro (Oclusal): Un cuadrado central rotado o recto. Para maximizar espacio, usaremos un cuadrado recto en el centro.P_occlusal_top_left: (33, 33)P_occlusal_top_right: (66, 33)P_occlusal_bottom_right: (66, 66)P_occlusal_bottom_left: (33, 66)Perímetro Exterior: El borde del diente (con esquinas redondeadas simuladas o rectas).P_outer_top_left: (0, 0)P_outer_top_right: (100, 0)P_outer_bottom_right: (100, 100)P_outer_bottom_left: (0, 100)Datos de Ruta (Path Data - d attribute) para cada Superficie:Para generar la imagen "lista para usar", proporcionamos los comandos SVG exactos. Estos caminos (<path>) son los que recibirán los eventos de clic.Superficie Vestibular (Superior en el gráfico):Trapecio formado por el borde superior y el borde superior del cuadro oclusal.Comando: M 0,0 L 100,0 L 66,33 L 33,33 ZExplicación: Mueve a (0,0), Línea a (100,0), Línea a la esquina interna derecha (66,33), Línea a la esquina interna izquierda (33,33), Cerrar (Z).19Superficie Lingual (Inferior en el gráfico):Trapecio inferior.Comando: M 33,66 L 66,66 L 100,100 L 0,100 ZSuperficie Mesial (Izquierda en el gráfico base):Trapecio izquierdo.Comando: M 0,0 L 33,33 L 33,66 L 0,100 ZSuperficie Distal (Derecha en el gráfico base):Trapecio derecho.Comando: M 100,0 L 100,100 L 66,66 L 66,33 ZSuperficie Oclusal (Centro):Cuadrado central.Comando: M 33,33 L 66,33 L 66,66 L 33,66 ZNota Técnica: Estas coordenadas asumen un diente genérico. Para los molares es perfecto. Para incisivos y caninos, que tienen un "borde incisal" en lugar de una cara oclusal ancha, algunos sistemas simplemente aplanan el cuadrado central en una línea o rectángulo delgado (ej. altura 10 en lugar de 33). Sin embargo, para mantener la consistencia de datos (poder marcar una "fractura incisal" o una "fosa palatina"), se recomienda mantener la geometría de 5 sectores incluso para los anteriores, quizás reduciendo visualmente el ancho del centro.224. Implementación del Código "Ready to Use"A continuación, se presenta la implementación completa simulada. No es un simple snippet, es la estructura de ingeniería necesaria para renderizar el odontograma completo.4.1 Definición de Estilos CSS (La Capa Visual)El poder del SVG radica en CSS. Definiremos clases para los estados patológicos.CSS/* Estilos Base */
.odontogram {
  width: 100%;
  height: auto;
  user-select: none; /* Evita selección de texto al hacer clic rápido */
}

.tooth-group {
  cursor: pointer;
  transition: opacity 0.2s;
}

.surface {
  fill: #ffffff;      /* Diente sano por defecto: Blanco */
  stroke: #333333;    /* Borde: Gris oscuro */
  stroke-width: 1px;
  transition: fill 0.3s ease;
}

.surface:hover {
  fill: #e0e0e0;      /* Feedback visual al pasar el mouse */
}

/* Estados Patológicos (Caries/Tratamientos Necesarios) - Rojo */
.state-caries { fill: #ff4d4d!important; }
.state-fracture { fill: #ff4d4d; stroke: #ff0000; stroke-dasharray: 2,2; }

/* Tratamientos Existentes/Realizados - Azul */
.state-amalgam { fill: #6699cc!important; }
.state-composite { fill: #b3d9ff!important; }
.state-sealant { fill: #ccffcc!important; stroke: #00cc00; }

/* Materiales Específicos usando Patrones SVG */
.state-gold { fill: url(#pattern-gold)!important; }
.state-missing { opacity: 0.3; } /* Diente extraído */
4.2 Generación Programática del SVGEn lugar de escribir 32 bloques de código SVG a mano (lo cual es propenso a errores), utilizaremos un enfoque basado en datos (Data-Driven Document). Aquí describo la lógica que debe seguir tu script (JS/React/Vue) para generar el SVG final.Paso 1: Definir el Array de Datos MaestroDebemos crear una estructura de datos que represente la boca ideal.JavaScriptconst DENTAL_ARCH =;
Paso 2: El Componente "Diente" ReutilizableDebes crear un componente (o función generadora de string) que acepte las coordenadas x, y y el id del diente.Lógica Crítica de Espejo (Mirroring):Para los cuadrantes 1 y 4 (lado derecho del paciente), la superficie Mesial está a la Izquierda del diente.Para los cuadrantes 2 y 3 (lado izquierdo del paciente), la superficie Mesial está a la Derecha del diente.Si usamos el mismo dibujo geométrico base, para los cuadrantes 2 y 3 debemos aplicar una transformación de espejo o intercambiar las clases/IDs de las superficies laterales.Recomendación: Mantener la geometría fija y cambiar la lógica de asignación de eventos. Es decir, el polígono "izquierdo" siempre se dibuja igual, pero si el diente es del cuadrante 2, ese polígono representa la cara "Distal".Código SVG Generado (Ejemplo para un Molar):XML<symbol id="tooth-def-molar" viewBox="0 0 100 100">
  <g>
    <path d="M 0,0 L 100,0 L 75,25 L 25,25 Z" class="surface vestibular" data-pos="top" />
    
    <path d="M 0,100 L 100,100 L 75,75 L 25,75 Z" class="surface lingual" data-pos="bottom" />
    
    <path d="M 0,0 L 0,100 L 25,75 L 25,25 Z" class="surface left" data-pos="left" />
    
    <path d="M 100,0 L 100,100 L 75,75 L 75,25 Z" class="surface right" data-pos="right" />
    
    <path d="M 25,25 L 75,25 L 75,75 L 25,75 Z" class="surface occlusal" data-pos="center" />
  </g>
</symbol>
4.3 Manejo de Raíces y EndodonciaEl usuario preguntó cómo crear el odontograma completo. Un odontograma no es solo la corona; a menudo necesita mostrar las raíces para tratamientos de conducto (endodoncia) o lesiones periapicales.Solución Geométrica:Añadir un rectángulo o triángulo encima (para dientes superiores) o debajo (para inferiores) del bloque de la corona.Dimensiones: Si la corona es 100x100, la raíz puede ser un bloque de 100x120 adyacente.SVG:XML<path d="M 30,0 L 70,0 L 50,-80 Z" class="root" /> 
Esto permite colorear la raíz independientemente para indicar "Tratamiento de Conducto Realizado" (línea azul en la raíz) o "Lesión" (círculo negro en el ápice).5. Lógica de Negocio y Serialización de DatosUna imagen SVG por sí sola no sirve para una "aplicación". Necesitas gestionar el estado. El reporte de investigación indica que se debe serializar el estado para guardarlo en base de datos (SQL/NoSQL).165.1 Estructura JSON del Estado DentalEsta es la estructura que tu aplicación debe leer y escribir para pintar el SVG.JSON{
  "patient_id": "P-998877",
  "timestamp": "2025-12-19T10:00:00Z",
  "odontogram_state": {
    "18": {
      "surfaces": {
        "occlusal": "caries",
        "mesial": "sound",
        "distal": "amalgam",
        "vestibular": "sound",
        "lingual": "sound"
      },
      "conditions": ["root_canal_needed"],
      "notes": "Caries profunda"
    },
    "17": { "status": "missing" } 
    //... resto de dientes
  }
}
5.2 Algoritmo de Mapeo (Render Loop)Cuando la aplicación carga:Recupera el JSON.Itera sobre las claves (números de dientes).Selecciona el elemento del DOM correspondiente: document.getElementById('tooth-18-occlusal').Aplica la clase CSS basada en el valor: element.classList.add('state-caries').6. Visualización Avanzada: Puentes, Prótesis y OrtodonciaUna limitación común de los odontogramas básicos es la incapacidad de dibujar elementos que conectan múltiples dientes, como puentes fijos o aparatos de ortodoncia.6.1 Puentes Fijos (Fixed Bridges)Un puente consta de pilares (dientes de soporte) y pónticos (dientes falsos).Implementación SVG:Se requiere una capa SVG superior (z-index mayor) dedicada a "Conectores".Para dibujar un puente del 14 al 16:Calcular el centro geométrico del diente 14 (x1, y1) y del 16 (x2, y2).Dibujar una línea o rectángulo que conecte estos puntos.Añadir marcadores de inicio y fin (círculos o corchetes) en los pilares.Código SVG Dinámico:<line x1="200" y1="50" x2="320" y2="50" stroke="blue" stroke-width="4" marker-start="url(#bracket)" marker-end="url(#bracket)" />6.2 Prótesis RemoviblesSe suelen representar con líneas curvas que conectan varios dientes por el lado lingual o palatino.Implementación:Uso de curvas de Bézier cúbicas (C). Como las coordenadas de los dientes son conocidas, se puede generar una ruta (<path d="M... C...">) que pase suavemente por las coordenadas linguales de los dientes afectados.6.3 ImplantesUn implante se suele representar como un tornillo o una espiral dentro de la raíz.Implementación:Definir un <g id="icon-implant"> en las <defs> que contenga el dibujo de un tornillo. Al marcar un diente con implante, usar <use href="#icon-implant" x="..." y="..." /> para instanciarlo sobre la posición de la raíz del diente correspondiente.7. Consideraciones de Accesibilidad (A11y) y UX MóvilPara que la aplicación sea profesional y cumpla estándares, debe ser accesible.7.1 Etiquetas ARIACada grupo de diente debe tener role="group" y aria-label="Diente 18". Cada superficie clickable debe tener role="button" y una etiqueta descriptiva. Esto permite que un médico con discapacidad visual pueda navegar el historial clínico usando un lector de pantalla o teclado.7.2 Interacción Táctil (Touch Targets)En pantallas móviles, un polígono de 20x20 píxeles es difícil de tocar.Solución: Usar pointer-events. El SVG visual puede ser pequeño, pero podemos superponer polígonos transparentes (opacity: 0) ligeramente más grandes para capturar los clics con mayor tolerancia, o simplemente asegurar que el escalado del SVG en móviles ocupe el 100% del ancho (width: 100vw).8. Guía Paso a Paso para la IntegraciónPara responder finalmente a "cómo lo harás", este es el plan de ejecución para tu equipo de desarrollo:Fase 1: Creación de Assets Base (Día 1-2)Crear el archivo defs.svg con los patrones de relleno (rayado diagonal, cuadriculado) y los iconos de marcadores (X para extracción, línea para endodoncia).Definir el componente <ToothGeometry /> en React/Vue con las rutas SVG normalizadas (0-100).Fase 2: Motor de Grid (Día 3)Implementar el bucle que renderiza los 4 cuadrantes.Implementar la lógica de espejo (CSS transform: scaleX(-1)) para los cuadrantes izquierdos. Nota: Al invertir el diente con CSS, el texto del número también se invertirá. Debes aplicar una contra-transformación al elemento <text> o sacarlo fuera del grupo invertido.Fase 3: Binding de Datos (Día 4-5)Conectar el estado global (Redux/Context) al color de relleno (fill) de los paths.Crear la función handleSurfaceClick(toothId, surface) que actualice el estado.Fase 4: Capa de Procedimientos Complejos (Día 6)Implementar la capa SVG superpuesta para dibujar líneas de puentes y prótesis calculando coordenadas dinámicamente.Fase 5: Pruebas y Validación (Día 7)Verificar contra diagrama FDI y Universal.Validar en iPad/Tablet (eventos touch).Validar impresión (los colores de fondo deben forzarse con -webkit-print-color-adjust: exact).9. ConclusiónLa creación de un odontograma "listo para usar" no es solo un ejercicio de diseño gráfico, sino un desafío de arquitectura de información. Al optar por un enfoque geométrico SVG, garantizamos la precisión en la entrada de datos. Al separar la geometría (XML) del estado (JSON) y la presentación (CSS), creamos un sistema mantenible que puede evolucionar desde una simple herramienta de registro de caries hasta un complejo planificador de tratamientos protésicos.Esta especificación proporciona todos los componentes necesarios: las coordenadas matemáticas, la estructura de datos, la estrategia de accesibilidad y la lógica de renderizado, asegurando que el resultado final sea una herramienta clínica de nivel profesional.Fuentes y Referencias Técnicas Integradas:1 React Odontogram Libraries.5 Estándares de numeración FDI vs Universal.19 Especificaciones W3C para SVG Paths y comandos d.14 Orientación mesial/distal y reglas de chart.17 Modelos geométricos de representación dental.4 Requisitos legales y de software de gestión clínica.


Aquí tienes la guía de implementación y el código necesario para transformar tu componente.

1. Actualizar la Estructura de Datos (Types)
Tu interfaz actual ToothRecord trata el diente como una unidad indivisible. Necesitamos desglosarla para manejar el estado de cada superficie (Oclusal, Mesial, Distal, Vestibular, Lingual).

TypeScript

// types/odontogram.types.ts

// Definimos las 5 superficies posibles
export type SurfacePosition = 'occlusal' | 'mesial' | 'distal' | 'vestibular' | 'lingual';

// Estado de cada superficie individual
export interface ToothState {
  toothNumber: number;
  surfaces: {
   : string; // ej: 'healthy', 'caries', 'amalgam'
  };
  hasEndodontics: boolean; // Para dibujar la línea de raíz si es necesario
  status: string; // Estado general opcional
}

export const INITIAL_SURFACE_STATE = {
  occlusal: 'healthy',
  mesial: 'healthy',
  distal: 'healthy',
  vestibular: 'healthy',
  lingual: 'healthy'
};
2. Crear el Componente GeometricTooth
Este es el cambio más importante. Reemplazaremos tu <rect> simple con un componente que dibuja 5 polígonos interactivos.

El siguiente código resuelve el problema de la geometría SVG y la lógica de "Espejo" (Mesial siempre debe estar hacia la línea media).

TypeScript

import React from 'react';

interface GeometricToothProps {
  number: number;
  x: number;
  y: number;
  data?: any; // Tu objeto de estado del diente
  onSurfaceClick: (number: number, surface: string) => void;
}

const GeometricTooth = ({ number, x, y, data, onSurfaceClick }: GeometricToothProps) => {
  // 1. Determinar Cuadrante para orientación Mesial/Distal
  // Universal System: 
  // 1-8 (Superior Der), 9-16 (Superior Izq)
  // 32-25 (Inferior Der), 24-17 (Inferior Izq)
  const isRightSide = (number >= 1 && number <= 8) |

| (number >= 25 && number <= 32);
  const isUpper = (number >= 1 && number <= 16);

  // 2. Definir Colores (Helper simple)
  const getFill = (surface: string) => {
    // Aquí conectarías con tu config de colores (TOOTH_STATUS_CONFIG)
    const status = data?.surfaces?.[surface] |

| 'healthy';
    return status === 'caries'? '#EF4444' : 
           status === 'amalgam'? '#3B82F6' : '#FFFFFF';
  };

  // 3. Geometría SVG (Base 40x40 para el diente)
  // Definimos los paths relativos a 0,0. Luego trasladamos con el grupo <g>
  // Centro: 10,10 ancho 20
  const centerPath = "M 12,12 L 28,12 L 28,28 L 12,28 Z"; // Oclusal
  const topPath = "M 0,0 L 40,0 L 28,12 L 12,12 Z";       // Vestibular (Superior) o Lingual
  const bottomPath = "M 0,40 L 40,40 L 28,28 L 12,28 Z"; // Lingual (Superior) o Vestibular
  const leftPath = "M 0,0 L 12,12 L 12,28 L 0,40 Z";     // Distal o Mesial (según lado)
  const rightPath = "M 40,0 L 28,12 L 28,28 L 40,40 Z";  // Mesial o Distal (según lado)

  // 4. Mapeo Lógico de Superficies
  // Si estamos a la derecha del paciente (Izq de la pantalla), Mesial es la derecha del diente (hacia el centro 400px)
  // NOTA: Ajusta esto según tu lógica de visualización exacta.
  // Estándar visual: 
  // Lado Izquierdo Pantalla (Dientes 1-8): Mesial está a la DERECHA del diente individual.
  // Lado Derecho Pantalla (Dientes 9-16): Mesial está a la IZQUIERDA del diente individual.
  
  const surfaces = {
    top: isUpper? 'vestibular' : 'lingual',
    bottom: isUpper? 'lingual' : 'vestibular',
    left: isRightSide? 'distal' : 'mesial',   // Lado alejado del centro o cercano
    right: isRightSide? 'mesial' : 'distal',  // Lado cercano al centro o alejado
    center: 'occlusal'
  };

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Grupo del Diente */}
      <g className="cursor-pointer hover:opacity-90 transition-opacity">
        
        {/* Top Trapezoid */}
        <path d={topPath} fill={getFill(surfaces.top)} stroke="#374151" strokeWidth="1"
          onClick={() => onSurfaceClick(number, surfaces.top)} />
        
        {/* Bottom Trapezoid */}
        <path d={bottomPath} fill={getFill(surfaces.bottom)} stroke="#374151" strokeWidth="1"
          onClick={() => onSurfaceClick(number, surfaces.bottom)} />

        {/* Left Trapezoid */}
        <path d={leftPath} fill={getFill(surfaces.left)} stroke="#374151" strokeWidth="1"
          onClick={() => onSurfaceClick(number, surfaces.left)} />

        {/* Right Trapezoid */}
        <path d={rightPath} fill={getFill(surfaces.right)} stroke="#374151" strokeWidth="1"
          onClick={() => onSurfaceClick(number, surfaces.right)} />

        {/* Center Box (Occlusal) */}
        <path d={centerPath} fill={getFill(surfaces.center)} stroke="#374151" strokeWidth="1"
          onClick={() => onSurfaceClick(number, surfaces.center)} />
          
        {/* Número del diente (reubicado) */}
        <text x="20" y={isUpper? -5 : 55} textAnchor="middle" fontSize="10" fill="#6B7280">
          {number}
        </text>
      </g>
    </g>
  );
};

export default GeometricTooth;
3. Integrar y Ajustar el Layout en OdontogramChart
En tu código original, el bucle de renderizado de dientes tenía un problema común: colocaba el diente #1 (muela del juicio derecha) cerca del centro (x=355) y el #8 (incisivo central) lejos (x=40). Esto es anatómicamente incorrecto. Los incisivos (#8 y #9) deben estar en el centro (cerca de x=400).

He corregido el bucle de renderizado para que los dientes centrales estén pegados a la línea media.

TypeScript

// OdontogramChart.tsx actualizado
import React from 'react';
import GeometricTooth from './GeometricTooth'; // El componente de arriba

//... (tus imports y tipos)

const OdontogramChart = ({ toothRecords, onToothClick }: any) => {
  const centerX = 400;
  const startY_Upper = 50;
  const startY_Lower = 250;
  const toothWidth = 40; // Diente cuadrado
  const gap = 5; // Espacio entre dientes
  const spacing = toothWidth + gap;

  // Handler para el clic en superficie
  const handleSurfaceClick = (toothNum: number, surface: string) => {
    console.log(`Diente: ${toothNum}, Superficie: ${surface}`);
    // Aquí llamas a tu lógica para actualizar el estado "toothRecords"
    onToothClick(toothNum); // Manteniendo tu prop original por compatibilidad
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
       <svg viewBox="0 0 800 400" className="w-full h-auto">
          {/* Líneas Guía */}
          <line x1={centerX} y1="20" x2={centerX} y2="380" stroke="#E5E7EB" strokeDasharray="4"/>
          <text x="30" y="30" className="text-xs text-gray-400">DERECHA (Q1/Q4)</text>
          <text x="700" y="30" className="text-xs text-gray-400">IZQUIERDA (Q2/Q3)</text>

          {/* --- ARCADA SUPERIOR --- */}
          
          {/* Q1: Dientes 8 a 1 (Del centro a la derecha del paciente/izq pantalla) */}
          {.[1, 2, 3, 4, 5, 6, 7, 8]map((num, i) => (
            <GeometricTooth 
              key={num} number={num}
              // i=0 es el diente 8 (Central), debe estar cerca de 400.
              // x = 400 - (ancho + gap) * (i + 1)
              x={centerX - (spacing * (i + 1))} 
              y={startY_Upper}
              data={toothRecords.find((r:any) => r.tooth_number === num)}
              onSurfaceClick={handleSurfaceClick}
            />
          ))}

          {/* Q2: Dientes 9 a 16 (Del centro a la izquierda del paciente/der pantalla) */}
          {.[9, 10, 11, 12, 13, 14, 15, 16]map((num, i) => (
            <GeometricTooth 
              key={num} number={num}
              // i=0 es el diente 9 (Central), debe estar a la derecha de 400.
              // x = 400 + gap + (ancho + gap) * i
              x={centerX + gap + (spacing * i)} 
              y={startY_Upper}
              data={toothRecords.find((r:any) => r.tooth_number === num)}
              onSurfaceClick={handleSurfaceClick}
            />
          ))}

          {/* --- ARCADA INFERIOR --- */}

          {/* Q4: Dientes 25 a 32 (Del centro a la derecha) */}
           {.map((num, i) => (
            <GeometricTooth 
              key={num} number={num}
              x={centerX - (spacing * (i + 1))} 
              y={startY_Lower}
              data={toothRecords.find((r:any) => r.tooth_number === num)}
              onSurfaceClick={handleSurfaceClick}
            />
          ))}

          {/* Q3: Dientes 24 a 17 (Del centro a la izquierda) */}
          {.[17, 18, 19, 20, 21, 22, 23, 24]map((num, i) => (
            <GeometricTooth 
              key={num} number={num}
              x={centerX + gap + (spacing * i)} 
              y={startY_Lower}
              data={toothRecords.find((r:any) => r.tooth_number === num)}
              onSurfaceClick={handleSurfaceClick}
            />
          ))}

       </svg>
    </div>
  );
};

export default OdontogramChart;
Resumen de Cambios Clave
Geometría SVG: Se reemplazó <rect> por 5 <path> definidos matemáticamente para formar el cuadrado geométrico.

Lógica de Renderizado: Se corrigió el orden de los bucles .map. Ahora los dientes centrales (8, 9, 24, 25) se renderizan adyacentes a la línea media (centerX), que es la representación clínica estándar.

Mapeo de Superficies: El componente GeometricTooth calcula dinámicamente cuál path es "Mesial" y cuál es "Distal" basándose en si el diente está en el lado izquierdo o derecho de la boca, resolviendo el problema de la orientación invertida.


Actualizar la Estructura de Datos (types.ts)Tu versión anterior manejaba un solo color/estado por diente. La nueva propuesta requiere que cada diente tenga un objeto de superficies.El cambio principal:Antes: status: 'healthy' (un string).Ahora: surfaces: { occlusal: 'healthy', mesial: 'caries', ... } (un objeto).2. Implementar la Lógica de "Espejo" (Línea Media)En odontología, la numeración y las caras se orientan respecto a la línea media de la cara.Mesial: Siempre es la cara que "mira" hacia el centro.Distal: Siempre es la cara que "mira" hacia atrás (las muelas del juicio).En el archivo GeometricTooth.tsx, fíjate en esta lógica que incluí:TypeScriptconst isRightSide = (number >= 1 && number <= 8) || (number >= 25 && number <= 32);
const surfaces = {
    left: isRightSide ? 'distal' : 'mesial',
    right: isRightSide ? 'mesial' : 'distal',
    // ...
};
Esto es vital para que, cuando el dentista haga clic en el lado "izquierdo" de un diente del cuadrante 1, el sistema sepa que técnicamente es la cara Distal.3. Reemplazar el Renderizado SVGTu componente anterior usaba un <rect /> simple. Ahora usaremos un grupo <g> con 5 <path />. Aquí tienes el resumen de cómo "dibujamos" el diente en un lienzo de 40x40 píxeles:SuperficieForma GeométricaPath SVGOclusalCuadrado CentralM 12,12 L 28,12 L 28,28 L 12,28 ZVestibularTrapecio SuperiorM 0,0 L 40,0 L 28,12 L 12,12 ZLingualTrapecio InferiorM 0,40 L 40,40 L 28,28 L 12,28 ZMesial/DistalTrapecios Laterales(Depende de la orientación del diente)4. Pasos para la Migración TécnicaSustituye los Tipos: Copia el contenido de mi types.ts a tu carpeta de tipos. Asegúrate de que ToothState sea la interfaz que usas en toda la app.Importa el nuevo GeometricTooth: Este componente es el "cerebro" visual. No necesitas modificarlo, solo pasarle las coordenadas x y y correctas.Ajusta el OdontogramChart:Cambia el viewBox del SVG a 0 0 800 400 para tener espacio suficiente.Usa el valor centerX = 400 como punto de partida para que los dientes 8-9 (arriba) y 24-25 (abajo) queden pegados al centro.Manejo de Estados: El handleSurfaceClick ahora debe recibir dos parámetros: (toothNumber, surfaceName). Esto te permitirá actualizar solo esa cara en tu base de datos o estado local.💡 Recomendación Pro (Como ingeniero)Dado que estás trabajando con Huawei y ves temas de gestión, te sugiero que para la persistencia de datos (base de datos), guardes el objeto surfaces como un JSON en una sola columna. Esto te dará flexibilidad si en el futuro decides agregar más detalles (como profundidad de la caries o material específico).Ejemplo de cómo se vería un registro en tu DB:JSON{
  "tooth_number": 14,
  "surfaces": {
    "occlusal": "amalgam",
    "mesial": "healthy",
    "distal": "healthy",
    "vestibular": "composite",
    "lingual": "healthy"
  },
  "has_endodontics": true
}