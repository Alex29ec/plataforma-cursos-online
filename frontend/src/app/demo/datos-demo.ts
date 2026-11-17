// Datos de ejemplo para la demo sin servidor (GitHub Pages). Generado a partir del curso de prueba.
import { CursoCatalogo, Curso, Tema } from "../core/modelos";

export interface PreguntaDemo { id: number; enunciado: string; opciones: string[]; correcta: number; }
export interface CursoDemo { curso: Curso; temas: Tema[]; preguntas: PreguntaDemo[]; }

export const CATALOGO_DEMO: CursoCatalogo[] = [
  {
    "slug": "manipulador-alimentos",
    "titulo": "Curso de Manipulador de Alimentos",
    "resumen": "Obtén tu certificado de manipulador de alimentos 100 % online, a tu ritmo.",
    "horas": 10,
    "precioCentimos": 1990,
    "estado": "PUBLICADO",
    "imagenUrl": "img/cursos/manipulador-alimentos.jpg"
  },
  {
    "slug": "carretilla-elevadora",
    "titulo": "Carretilla elevadora",
    "resumen": "Manejo seguro de carretillas elevadoras.",
    "horas": 10,
    "precioCentimos": 1990,
    "estado": "PROXIMAMENTE",
    "imagenUrl": null
  },
  {
    "slug": "trabajo-en-alturas",
    "titulo": "Trabajo en alturas",
    "resumen": "Prevención de riesgos en trabajos en altura.",
    "horas": 10,
    "precioCentimos": 1990,
    "estado": "PROXIMAMENTE",
    "imagenUrl": null
  },
  {
    "slug": "alergias-e-intolerancias",
    "titulo": "Alergias e intolerancias alimentarias",
    "resumen": "Gestión de alérgenos en hostelería y comercio.",
    "horas": 10,
    "precioCentimos": 1990,
    "estado": "PROXIMAMENTE",
    "imagenUrl": null
  },
  {
    "slug": "acoso-laboral",
    "titulo": "Prevención del acoso laboral",
    "resumen": "Cómo prevenir y actuar ante el acoso en el trabajo.",
    "horas": 10,
    "precioCentimos": 1990,
    "estado": "PROXIMAMENTE",
    "imagenUrl": null
  },
  {
    "slug": "legionella",
    "titulo": "Legionella",
    "resumen": "Prevención y control de la legionelosis.",
    "horas": 10,
    "precioCentimos": 1990,
    "estado": "PROXIMAMENTE",
    "imagenUrl": null
  }
];

export const CURSOS_DEMO: Record<string, CursoDemo> = {
  "manipulador-alimentos": {
    "curso": {
      "slug": "manipulador-alimentos",
      "titulo": "Curso de Manipulador de Alimentos",
      "descripcion": "Formación en higiene alimentaria para personas que trabajan con alimentos en cualquier fase: preparación, elaboración, servicio, transporte o venta. Aprende las buenas prácticas de higiene y obtén tu diploma al aprobar el examen. (CONTENIDO PROVISIONAL)",
      "resumen": "Obtén tu certificado de manipulador de alimentos 100 % online, a tu ritmo.",
      "imagenUrl": "img/cursos/manipulador-alimentos.jpg",
      "horas": 10,
      "precioCentimos": 1990,
      "notaMinima": 75,
      "numPreguntas": 20,
      "temas": [
        {
          "orden": 1,
          "titulo": "Higiene personal del manipulador"
        },
        {
          "orden": 2,
          "titulo": "Contaminación de los alimentos"
        },
        {
          "orden": 3,
          "titulo": "Conservación y control de temperaturas"
        },
        {
          "orden": 4,
          "titulo": "Limpieza, desinfección y control de plagas"
        },
        {
          "orden": 5,
          "titulo": "Alérgenos e información al consumidor"
        },
        {
          "orden": 6,
          "titulo": "Autocontrol y sistema APPCC"
        }
      ]
    },
    "temas": [
      {
        "orden": 1,
        "titulo": "Higiene personal del manipulador",
        "contenido": "> **Contenido provisional.** Este texto se sustituirá por el temario definitivo.\n\n## ¿Quién es un manipulador de alimentos?\n\nEs toda persona que, por su actividad laboral, tiene contacto directo con los alimentos durante su preparación, fabricación, transformación, envasado, almacenamiento, transporte, distribución, venta, suministro o servicio.\n\n## Normas básicas de higiene personal\n\n- **Lavado de manos** con agua caliente y jabón, frotando al menos 20 segundos, secando con papel de un solo uso.\n- Lavarse las manos **siempre**: al empezar el trabajo, después de ir al aseo, tras tocar alimentos crudos, basura, dinero o productos de limpieza, y después de toser, estornudar o sonarse.\n- **Uñas cortas y limpias**, sin esmalte ni uñas postizas.\n- **Ropa de trabajo limpia** y exclusiva, de color claro, y cubrir el cabello con gorro o redecilla.\n- **Sin joyas** (anillos, pulseras, relojes, pendientes) durante la manipulación.\n\n## Estado de salud\n\nEl manipulador que padezca diarrea, vómitos, fiebre, infecciones de piel o heridas infectadas debe **comunicarlo a su responsable** y no manipular alimentos. Las heridas leves se cubren con un apósito impermeable de color llamativo.\n\n## Hábitos prohibidos\n\nFumar, comer, mascar chicle, toser o estornudar sobre los alimentos y probar la comida con los dedos."
      },
      {
        "orden": 2,
        "titulo": "Contaminación de los alimentos",
        "contenido": "> **Contenido provisional.**\n\n## Tipos de contaminación\n\n- **Biológica:** bacterias, virus, parásitos y hongos. Es la causa más frecuente de intoxicaciones alimentarias.\n- **Química:** restos de productos de limpieza, plaguicidas, metales pesados o aditivos mal utilizados.\n- **Física:** cuerpos extraños como cristales, pelos, astillas, plásticos o piezas metálicas.\n\n## Contaminación cruzada\n\nEs el paso de microorganismos de un alimento contaminado (normalmente crudo) a otro que no lo está (normalmente cocinado o listo para consumir). Se produce:\n\n- **Directamente**, cuando los alimentos entran en contacto.\n- **Indirectamente**, a través de manos, utensilios, tablas de cortar o superficies.\n\nPara evitarla: separar crudos y cocinados, usar utensilios distintos (o lavarlos entre usos) y guardar los cocinados en la parte superior de la cámara.\n\n## Factores que favorecen el crecimiento de bacterias\n\nTemperatura entre **5 °C y 65 °C** (zona de peligro), humedad, alimentos ricos en nutrientes y **tiempo**."
      },
      {
        "orden": 3,
        "titulo": "Conservación y control de temperaturas",
        "contenido": "> **Contenido provisional.**\n\n## Métodos de conservación\n\n- **Refrigeración:** entre 0 °C y 5 °C. Frena el crecimiento de microorganismos, pero no los elimina.\n- **Congelación:** a −18 °C o menos. Los microorganismos quedan inactivos.\n- **Calor:** pasteurización y esterilización destruyen microorganismos.\n- Otros: deshidratación, salazón, ahumado, envasado al vacío.\n\n## Reglas clave\n\n- No romper la **cadena de frío**.\n- **Descongelar en refrigeración**, nunca a temperatura ambiente, y no volver a congelar un alimento descongelado.\n- Cocinar de modo que el **centro del alimento alcance al menos 70 °C**.\n- Mantener las comidas calientes por encima de **65 °C** y las frías por debajo de **8 °C** (preferiblemente 4 °C).\n- Enfriar rápidamente los alimentos cocinados que no se van a consumir enseguida.\n\n## Almacenamiento\n\nRotación de existencias **FIFO** (lo primero que entra es lo primero que sale), alimentos separados del suelo y de las paredes, y respetar la fecha de caducidad."
      },
      {
        "orden": 4,
        "titulo": "Limpieza, desinfección y control de plagas",
        "contenido": "> **Contenido provisional.**\n\n## Limpieza y desinfección\n\n- **Limpiar** es eliminar la suciedad visible.\n- **Desinfectar** es reducir los microorganismos a niveles seguros.\n- Primero se limpia y después se desinfecta; una superficie sucia no se puede desinfectar bien.\n\nOrden habitual: retirar restos, aplicar detergente, aclarar, aplicar desinfectante el tiempo indicado y aclarar si lo exige el fabricante.\n\n## Productos de limpieza\n\nGuardarlos en un lugar separado de los alimentos, en sus envases originales y bien etiquetados. Nunca mezclar productos (por ejemplo, lejía con amoniaco).\n\n## Control de plagas\n\nInsectos y roedores transmiten enfermedades. Medidas preventivas: mallas mosquiteras, cerrar huecos, gestionar bien los residuos en cubos con tapa y pedal, y no dejar restos de comida. Los tratamientos los aplican empresas autorizadas."
      },
      {
        "orden": 5,
        "titulo": "Alérgenos e información al consumidor",
        "contenido": "> **Contenido provisional.**\n\n## Los 14 alérgenos de declaración obligatoria\n\nCereales con gluten, crustáceos, huevos, pescado, cacahuetes, soja, leche, frutos de cáscara, apio, mostaza, sésamo, dióxido de azufre y sulfitos, altramuces y moluscos.\n\n## Obligaciones\n\n- Los establecimientos deben **informar** de los alérgenos presentes en cada plato, por escrito o de forma verbal con la información disponible por escrito.\n- Evitar el **contacto cruzado**: utensilios, superficies y aceite de fritura separados para elaboraciones sin alérgenos.\n- Ante la duda, **no afirmar** que un plato no contiene un alérgeno.\n\n## Etiquetado\n\nLas etiquetas deben destacar los alérgenos en la lista de ingredientes (negrita, subrayado o color). Distinguir **fecha de caducidad** (seguridad: no consumir después) y **consumo preferente** (calidad)."
      },
      {
        "orden": 6,
        "titulo": "Autocontrol y sistema APPCC",
        "contenido": "> **Contenido provisional.**\n\n## ¿Qué es el APPCC?\n\nEl **Análisis de Peligros y Puntos de Control Crítico** es un sistema preventivo que identifica, evalúa y controla los peligros significativos para la seguridad alimentaria.\n\n## Principios básicos\n\n1. Analizar los peligros.\n2. Determinar los puntos de control crítico (PCC).\n3. Establecer límites críticos.\n4. Establecer sistemas de vigilancia.\n5. Establecer medidas correctoras.\n6. Verificar que el sistema funciona.\n7. Documentar y registrar.\n\n## Planes generales de higiene\n\nSon la base del autocontrol: limpieza y desinfección, control de plagas, agua, formación de manipuladores, mantenimiento, proveedores y trazabilidad.\n\n## Responsabilidad del manipulador\n\nCumplir las instrucciones, **anotar los registros** (temperaturas, limpiezas) y avisar de cualquier incidencia."
      }
    ],
    "preguntas": [
      {
        "id": 1,
        "enunciado": "¿Cuánto tiempo, como mínimo, se recomienda frotar las manos al lavarlas?",
        "opciones": [
          "5 segundos",
          "20 segundos",
          "1 minuto",
          "No importa el tiempo"
        ],
        "correcta": 1
      },
      {
        "id": 2,
        "enunciado": "¿Qué debe hacer un manipulador que tiene diarrea?",
        "opciones": [
          "Seguir trabajando con guantes",
          "Comunicarlo a su responsable y no manipular alimentos",
          "Tomar un medicamento y seguir trabajando",
          "Lavarse las manos más a menudo"
        ],
        "correcta": 1
      },
      {
        "id": 3,
        "enunciado": "¿Cómo deben cubrirse las heridas leves en las manos?",
        "opciones": [
          "Con un apósito impermeable de color llamativo",
          "No hace falta cubrirlas",
          "Con una tirita de tela",
          "Con esparadrapo blanco"
        ],
        "correcta": 0
      },
      {
        "id": 4,
        "enunciado": "¿Qué se puede llevar puesto durante la manipulación de alimentos?",
        "opciones": [
          "Anillos",
          "Reloj",
          "Gorro o redecilla",
          "Pulseras"
        ],
        "correcta": 2
      },
      {
        "id": 5,
        "enunciado": "¿Con qué es más recomendable secarse las manos?",
        "opciones": [
          "Con el delantal",
          "Con un paño de cocina",
          "Con papel de un solo uso",
          "Al aire, sacudiéndolas"
        ],
        "correcta": 2
      },
      {
        "id": 6,
        "enunciado": "¿Cuál es el tipo de contaminación que causa más intoxicaciones alimentarias?",
        "opciones": [
          "Física",
          "Química",
          "Biológica",
          "Radiactiva"
        ],
        "correcta": 2
      },
      {
        "id": 7,
        "enunciado": "Un trozo de cristal en un alimento es un ejemplo de contaminación…",
        "opciones": [
          "Biológica",
          "Física",
          "Química",
          "Cruzada"
        ],
        "correcta": 1
      },
      {
        "id": 8,
        "enunciado": "¿Qué es la contaminación cruzada?",
        "opciones": [
          "Cocinar dos alimentos a la vez",
          "El paso de microorganismos de un alimento contaminado a otro que no lo está",
          "Mezclar productos de limpieza",
          "Congelar dos veces un alimento"
        ],
        "correcta": 1
      },
      {
        "id": 9,
        "enunciado": "¿Entre qué temperaturas está la «zona de peligro» para el crecimiento de bacterias?",
        "opciones": [
          "Entre −18 °C y 0 °C",
          "Entre 0 °C y 5 °C",
          "Entre 5 °C y 65 °C",
          "Por encima de 100 °C"
        ],
        "correcta": 2
      },
      {
        "id": 10,
        "enunciado": "En la cámara frigorífica, ¿dónde deben colocarse los alimentos cocinados respecto a los crudos?",
        "opciones": [
          "Debajo",
          "Encima",
          "Mezclados",
          "Da igual"
        ],
        "correcta": 1
      },
      {
        "id": 11,
        "enunciado": "¿A qué temperatura se mantiene un alimento congelado?",
        "opciones": [
          "A 0 °C",
          "A −5 °C",
          "A −18 °C o menos",
          "A 4 °C"
        ],
        "correcta": 2
      },
      {
        "id": 12,
        "enunciado": "¿Cuál es la forma correcta de descongelar un alimento?",
        "opciones": [
          "A temperatura ambiente",
          "En el frigorífico",
          "Bajo el grifo de agua caliente",
          "Al sol"
        ],
        "correcta": 1
      },
      {
        "id": 13,
        "enunciado": "¿Qué temperatura debe alcanzar el centro de un alimento al cocinarlo?",
        "opciones": [
          "Al menos 40 °C",
          "Al menos 55 °C",
          "Al menos 70 °C",
          "No hay temperatura mínima"
        ],
        "correcta": 2
      },
      {
        "id": 14,
        "enunciado": "¿Qué significa el sistema FIFO en el almacén?",
        "opciones": [
          "Lo último que entra es lo primero que sale",
          "Lo primero que entra es lo primero que sale",
          "Primero se usan los productos más caros",
          "Se almacena por orden alfabético"
        ],
        "correcta": 1
      },
      {
        "id": 15,
        "enunciado": "¿Se puede volver a congelar un alimento que ya se ha descongelado sin cocinarlo?",
        "opciones": [
          "Sí, siempre",
          "Sí, si se hace en menos de 24 horas",
          "No",
          "Solo si es carne"
        ],
        "correcta": 2
      },
      {
        "id": 16,
        "enunciado": "¿Cuál es el orden correcto?",
        "opciones": [
          "Desinfectar y luego limpiar",
          "Limpiar y luego desinfectar",
          "Solo desinfectar",
          "Solo aclarar"
        ],
        "correcta": 1
      },
      {
        "id": 17,
        "enunciado": "¿Dónde deben guardarse los productos de limpieza?",
        "opciones": [
          "Junto a los alimentos",
          "En un lugar separado y en sus envases originales",
          "En botellas de agua reutilizadas",
          "En la cámara frigorífica"
        ],
        "correcta": 1
      },
      {
        "id": 18,
        "enunciado": "¿Qué ocurre si se mezcla lejía con amoniaco?",
        "opciones": [
          "Limpia mejor",
          "Se desprenden gases tóxicos",
          "No pasa nada",
          "Se neutralizan"
        ],
        "correcta": 1
      },
      {
        "id": 19,
        "enunciado": "¿Qué tipo de cubo de basura es el adecuado en una cocina?",
        "opciones": [
          "Abierto",
          "Con tapa y accionado por pedal",
          "Cualquier caja de cartón",
          "Con tapa que se abre con la mano"
        ],
        "correcta": 1
      },
      {
        "id": 20,
        "enunciado": "¿Quién debe aplicar los tratamientos contra plagas?",
        "opciones": [
          "Cualquier trabajador",
          "El cocinero",
          "Una empresa autorizada",
          "El cliente"
        ],
        "correcta": 2
      },
      {
        "id": 21,
        "enunciado": "¿Cuántos alérgenos son de declaración obligatoria en la Unión Europea?",
        "opciones": [
          "8",
          "10",
          "14",
          "20"
        ],
        "correcta": 2
      },
      {
        "id": 22,
        "enunciado": "¿Cuál de estos NO es un alérgeno de declaración obligatoria?",
        "opciones": [
          "Sésamo",
          "Mostaza",
          "Tomate",
          "Apio"
        ],
        "correcta": 2
      },
      {
        "id": 23,
        "enunciado": "Si un cliente pregunta si un plato contiene frutos secos y no estás seguro, debes…",
        "opciones": [
          "Decir que no",
          "Decir que sí por si acaso sin comprobar",
          "Consultar la información de alérgenos y no afirmar nada sin comprobarlo",
          "Recomendarle otro restaurante"
        ],
        "correcta": 2
      },
      {
        "id": 24,
        "enunciado": "¿Qué diferencia hay entre fecha de caducidad y de consumo preferente?",
        "opciones": [
          "Ninguna",
          "La caducidad indica seguridad; el consumo preferente, calidad",
          "El consumo preferente es más estricto",
          "La caducidad solo se aplica a bebidas"
        ],
        "correcta": 1
      },
      {
        "id": 25,
        "enunciado": "Para evitar el contacto cruzado con alérgenos se debe…",
        "opciones": [
          "Usar el mismo aceite para todo",
          "Usar utensilios y superficies separados",
          "Lavar solo al final del día",
          "No hace falta hacer nada"
        ],
        "correcta": 1
      },
      {
        "id": 26,
        "enunciado": "¿Qué significan las siglas APPCC?",
        "opciones": [
          "Análisis de Peligros y Puntos de Control Crítico",
          "Asociación de Productores y Cocineros",
          "Análisis de Productos y Precios de Consumo",
          "Autocontrol de Platos Preparados y Cocinados"
        ],
        "correcta": 0
      },
      {
        "id": 27,
        "enunciado": "El sistema APPCC es un sistema…",
        "opciones": [
          "Correctivo",
          "Preventivo",
          "Sancionador",
          "Opcional para todos"
        ],
        "correcta": 1
      },
      {
        "id": 28,
        "enunciado": "¿Qué es un límite crítico?",
        "opciones": [
          "El precio máximo de un plato",
          "El valor que separa lo aceptable de lo inaceptable en un punto de control crítico",
          "El número máximo de trabajadores",
          "La fecha de caducidad"
        ],
        "correcta": 1
      },
      {
        "id": 29,
        "enunciado": "¿Cuál es una responsabilidad del manipulador dentro del autocontrol?",
        "opciones": [
          "Diseñar el plan APPCC",
          "Anotar los registros y avisar de las incidencias",
          "Inspeccionar otros establecimientos",
          "Fijar los límites críticos"
        ],
        "correcta": 1
      },
      {
        "id": 30,
        "enunciado": "¿Cuál de estos es un plan general de higiene?",
        "opciones": [
          "Plan de marketing",
          "Plan de limpieza y desinfección",
          "Plan de vacaciones",
          "Plan de ventas"
        ],
        "correcta": 1
      }
    ]
  }
};
