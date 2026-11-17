-- CONTENIDO PROVISIONAL generado. Se sustituirá por el temario definitivo.

INSERT INTO curso (slug, titulo, descripcion, horas, precio_centimos, nota_minima, num_preguntas, activo) VALUES ('manipulador-alimentos', 'Curso de Manipulador de Alimentos', 'Formación en higiene alimentaria para personas que trabajan con alimentos en cualquier fase: preparación, elaboración, servicio, transporte o venta. Aprende las buenas prácticas de higiene y obtén tu diploma al aprobar el examen. (CONTENIDO PROVISIONAL)', 10, 1990, 75, 20, TRUE);

INSERT INTO tema (curso_id, orden, titulo, contenido) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 1, 'Higiene personal del manipulador', '> **Contenido provisional.** Este texto se sustituirá por el temario definitivo.

## ¿Quién es un manipulador de alimentos?

Es toda persona que, por su actividad laboral, tiene contacto directo con los alimentos durante su preparación, fabricación, transformación, envasado, almacenamiento, transporte, distribución, venta, suministro o servicio.

## Normas básicas de higiene personal

- **Lavado de manos** con agua caliente y jabón, frotando al menos 20 segundos, secando con papel de un solo uso.
- Lavarse las manos **siempre**: al empezar el trabajo, después de ir al aseo, tras tocar alimentos crudos, basura, dinero o productos de limpieza, y después de toser, estornudar o sonarse.
- **Uñas cortas y limpias**, sin esmalte ni uñas postizas.
- **Ropa de trabajo limpia** y exclusiva, de color claro, y cubrir el cabello con gorro o redecilla.
- **Sin joyas** (anillos, pulseras, relojes, pendientes) durante la manipulación.

## Estado de salud

El manipulador que padezca diarrea, vómitos, fiebre, infecciones de piel o heridas infectadas debe **comunicarlo a su responsable** y no manipular alimentos. Las heridas leves se cubren con un apósito impermeable de color llamativo.

## Hábitos prohibidos

Fumar, comer, mascar chicle, toser o estornudar sobre los alimentos y probar la comida con los dedos.');

INSERT INTO tema (curso_id, orden, titulo, contenido) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 2, 'Contaminación de los alimentos', '> **Contenido provisional.**

## Tipos de contaminación

- **Biológica:** bacterias, virus, parásitos y hongos. Es la causa más frecuente de intoxicaciones alimentarias.
- **Química:** restos de productos de limpieza, plaguicidas, metales pesados o aditivos mal utilizados.
- **Física:** cuerpos extraños como cristales, pelos, astillas, plásticos o piezas metálicas.

## Contaminación cruzada

Es el paso de microorganismos de un alimento contaminado (normalmente crudo) a otro que no lo está (normalmente cocinado o listo para consumir). Se produce:

- **Directamente**, cuando los alimentos entran en contacto.
- **Indirectamente**, a través de manos, utensilios, tablas de cortar o superficies.

Para evitarla: separar crudos y cocinados, usar utensilios distintos (o lavarlos entre usos) y guardar los cocinados en la parte superior de la cámara.

## Factores que favorecen el crecimiento de bacterias

Temperatura entre **5 °C y 65 °C** (zona de peligro), humedad, alimentos ricos en nutrientes y **tiempo**.');

INSERT INTO tema (curso_id, orden, titulo, contenido) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 3, 'Conservación y control de temperaturas', '> **Contenido provisional.**

## Métodos de conservación

- **Refrigeración:** entre 0 °C y 5 °C. Frena el crecimiento de microorganismos, pero no los elimina.
- **Congelación:** a −18 °C o menos. Los microorganismos quedan inactivos.
- **Calor:** pasteurización y esterilización destruyen microorganismos.
- Otros: deshidratación, salazón, ahumado, envasado al vacío.

## Reglas clave

- No romper la **cadena de frío**.
- **Descongelar en refrigeración**, nunca a temperatura ambiente, y no volver a congelar un alimento descongelado.
- Cocinar de modo que el **centro del alimento alcance al menos 70 °C**.
- Mantener las comidas calientes por encima de **65 °C** y las frías por debajo de **8 °C** (preferiblemente 4 °C).
- Enfriar rápidamente los alimentos cocinados que no se van a consumir enseguida.

## Almacenamiento

Rotación de existencias **FIFO** (lo primero que entra es lo primero que sale), alimentos separados del suelo y de las paredes, y respetar la fecha de caducidad.');

INSERT INTO tema (curso_id, orden, titulo, contenido) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 4, 'Limpieza, desinfección y control de plagas', '> **Contenido provisional.**

## Limpieza y desinfección

- **Limpiar** es eliminar la suciedad visible.
- **Desinfectar** es reducir los microorganismos a niveles seguros.
- Primero se limpia y después se desinfecta; una superficie sucia no se puede desinfectar bien.

Orden habitual: retirar restos, aplicar detergente, aclarar, aplicar desinfectante el tiempo indicado y aclarar si lo exige el fabricante.

## Productos de limpieza

Guardarlos en un lugar separado de los alimentos, en sus envases originales y bien etiquetados. Nunca mezclar productos (por ejemplo, lejía con amoniaco).

## Control de plagas

Insectos y roedores transmiten enfermedades. Medidas preventivas: mallas mosquiteras, cerrar huecos, gestionar bien los residuos en cubos con tapa y pedal, y no dejar restos de comida. Los tratamientos los aplican empresas autorizadas.');

INSERT INTO tema (curso_id, orden, titulo, contenido) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 5, 'Alérgenos e información al consumidor', '> **Contenido provisional.**

## Los 14 alérgenos de declaración obligatoria

Cereales con gluten, crustáceos, huevos, pescado, cacahuetes, soja, leche, frutos de cáscara, apio, mostaza, sésamo, dióxido de azufre y sulfitos, altramuces y moluscos.

## Obligaciones

- Los establecimientos deben **informar** de los alérgenos presentes en cada plato, por escrito o de forma verbal con la información disponible por escrito.
- Evitar el **contacto cruzado**: utensilios, superficies y aceite de fritura separados para elaboraciones sin alérgenos.
- Ante la duda, **no afirmar** que un plato no contiene un alérgeno.

## Etiquetado

Las etiquetas deben destacar los alérgenos en la lista de ingredientes (negrita, subrayado o color). Distinguir **fecha de caducidad** (seguridad: no consumir después) y **consumo preferente** (calidad).');

INSERT INTO tema (curso_id, orden, titulo, contenido) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 6, 'Autocontrol y sistema APPCC', '> **Contenido provisional.**

## ¿Qué es el APPCC?

El **Análisis de Peligros y Puntos de Control Crítico** es un sistema preventivo que identifica, evalúa y controla los peligros significativos para la seguridad alimentaria.

## Principios básicos

1. Analizar los peligros.
2. Determinar los puntos de control crítico (PCC).
3. Establecer límites críticos.
4. Establecer sistemas de vigilancia.
5. Establecer medidas correctoras.
6. Verificar que el sistema funciona.
7. Documentar y registrar.

## Planes generales de higiene

Son la base del autocontrol: limpieza y desinfección, control de plagas, agua, formación de manipuladores, mantenimiento, proveedores y trazabilidad.

## Responsabilidad del manipulador

Cumplir las instrucciones, **anotar los registros** (temperaturas, limpiezas) y avisar de cualquier incidencia.');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Cuánto tiempo, como mínimo, se recomienda frotar las manos al lavarlas?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuánto tiempo, como mínimo, se recomienda frotar las manos al lavarlas?'), 0, '5 segundos');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuánto tiempo, como mínimo, se recomienda frotar las manos al lavarlas?'), 1, '20 segundos');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuánto tiempo, como mínimo, se recomienda frotar las manos al lavarlas?'), 2, '1 minuto');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuánto tiempo, como mínimo, se recomienda frotar las manos al lavarlas?'), 3, 'No importa el tiempo');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Qué debe hacer un manipulador que tiene diarrea?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué debe hacer un manipulador que tiene diarrea?'), 0, 'Seguir trabajando con guantes');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué debe hacer un manipulador que tiene diarrea?'), 1, 'Comunicarlo a su responsable y no manipular alimentos');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué debe hacer un manipulador que tiene diarrea?'), 2, 'Tomar un medicamento y seguir trabajando');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué debe hacer un manipulador que tiene diarrea?'), 3, 'Lavarse las manos más a menudo');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Cómo deben cubrirse las heridas leves en las manos?', 0);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cómo deben cubrirse las heridas leves en las manos?'), 0, 'Con un apósito impermeable de color llamativo');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cómo deben cubrirse las heridas leves en las manos?'), 1, 'No hace falta cubrirlas');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cómo deben cubrirse las heridas leves en las manos?'), 2, 'Con una tirita de tela');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cómo deben cubrirse las heridas leves en las manos?'), 3, 'Con esparadrapo blanco');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Qué se puede llevar puesto durante la manipulación de alimentos?', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué se puede llevar puesto durante la manipulación de alimentos?'), 0, 'Anillos');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué se puede llevar puesto durante la manipulación de alimentos?'), 1, 'Reloj');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué se puede llevar puesto durante la manipulación de alimentos?'), 2, 'Gorro o redecilla');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué se puede llevar puesto durante la manipulación de alimentos?'), 3, 'Pulseras');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Con qué es más recomendable secarse las manos?', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Con qué es más recomendable secarse las manos?'), 0, 'Con el delantal');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Con qué es más recomendable secarse las manos?'), 1, 'Con un paño de cocina');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Con qué es más recomendable secarse las manos?'), 2, 'Con papel de un solo uso');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Con qué es más recomendable secarse las manos?'), 3, 'Al aire, sacudiéndolas');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Cuál es el tipo de contaminación que causa más intoxicaciones alimentarias?', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es el tipo de contaminación que causa más intoxicaciones alimentarias?'), 0, 'Física');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es el tipo de contaminación que causa más intoxicaciones alimentarias?'), 1, 'Química');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es el tipo de contaminación que causa más intoxicaciones alimentarias?'), 2, 'Biológica');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es el tipo de contaminación que causa más intoxicaciones alimentarias?'), 3, 'Radiactiva');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 'Un trozo de cristal en un alimento es un ejemplo de contaminación…', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Un trozo de cristal en un alimento es un ejemplo de contaminación…'), 0, 'Biológica');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Un trozo de cristal en un alimento es un ejemplo de contaminación…'), 1, 'Física');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Un trozo de cristal en un alimento es un ejemplo de contaminación…'), 2, 'Química');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Un trozo de cristal en un alimento es un ejemplo de contaminación…'), 3, 'Cruzada');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Qué es la contaminación cruzada?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué es la contaminación cruzada?'), 0, 'Cocinar dos alimentos a la vez');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué es la contaminación cruzada?'), 1, 'El paso de microorganismos de un alimento contaminado a otro que no lo está');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué es la contaminación cruzada?'), 2, 'Mezclar productos de limpieza');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué es la contaminación cruzada?'), 3, 'Congelar dos veces un alimento');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Entre qué temperaturas está la «zona de peligro» para el crecimiento de bacterias?', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Entre qué temperaturas está la «zona de peligro» para el crecimiento de bacterias?'), 0, 'Entre −18 °C y 0 °C');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Entre qué temperaturas está la «zona de peligro» para el crecimiento de bacterias?'), 1, 'Entre 0 °C y 5 °C');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Entre qué temperaturas está la «zona de peligro» para el crecimiento de bacterias?'), 2, 'Entre 5 °C y 65 °C');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Entre qué temperaturas está la «zona de peligro» para el crecimiento de bacterias?'), 3, 'Por encima de 100 °C');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 'En la cámara frigorífica, ¿dónde deben colocarse los alimentos cocinados respecto a los crudos?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'En la cámara frigorífica, ¿dónde deben colocarse los alimentos cocinados respecto a los crudos?'), 0, 'Debajo');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'En la cámara frigorífica, ¿dónde deben colocarse los alimentos cocinados respecto a los crudos?'), 1, 'Encima');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'En la cámara frigorífica, ¿dónde deben colocarse los alimentos cocinados respecto a los crudos?'), 2, 'Mezclados');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'En la cámara frigorífica, ¿dónde deben colocarse los alimentos cocinados respecto a los crudos?'), 3, 'Da igual');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿A qué temperatura se mantiene un alimento congelado?', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿A qué temperatura se mantiene un alimento congelado?'), 0, 'A 0 °C');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿A qué temperatura se mantiene un alimento congelado?'), 1, 'A −5 °C');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿A qué temperatura se mantiene un alimento congelado?'), 2, 'A −18 °C o menos');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿A qué temperatura se mantiene un alimento congelado?'), 3, 'A 4 °C');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Cuál es la forma correcta de descongelar un alimento?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es la forma correcta de descongelar un alimento?'), 0, 'A temperatura ambiente');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es la forma correcta de descongelar un alimento?'), 1, 'En el frigorífico');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es la forma correcta de descongelar un alimento?'), 2, 'Bajo el grifo de agua caliente');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es la forma correcta de descongelar un alimento?'), 3, 'Al sol');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Qué temperatura debe alcanzar el centro de un alimento al cocinarlo?', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué temperatura debe alcanzar el centro de un alimento al cocinarlo?'), 0, 'Al menos 40 °C');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué temperatura debe alcanzar el centro de un alimento al cocinarlo?'), 1, 'Al menos 55 °C');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué temperatura debe alcanzar el centro de un alimento al cocinarlo?'), 2, 'Al menos 70 °C');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué temperatura debe alcanzar el centro de un alimento al cocinarlo?'), 3, 'No hay temperatura mínima');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Qué significa el sistema FIFO en el almacén?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué significa el sistema FIFO en el almacén?'), 0, 'Lo último que entra es lo primero que sale');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué significa el sistema FIFO en el almacén?'), 1, 'Lo primero que entra es lo primero que sale');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué significa el sistema FIFO en el almacén?'), 2, 'Primero se usan los productos más caros');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué significa el sistema FIFO en el almacén?'), 3, 'Se almacena por orden alfabético');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Se puede volver a congelar un alimento que ya se ha descongelado sin cocinarlo?', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Se puede volver a congelar un alimento que ya se ha descongelado sin cocinarlo?'), 0, 'Sí, siempre');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Se puede volver a congelar un alimento que ya se ha descongelado sin cocinarlo?'), 1, 'Sí, si se hace en menos de 24 horas');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Se puede volver a congelar un alimento que ya se ha descongelado sin cocinarlo?'), 2, 'No');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Se puede volver a congelar un alimento que ya se ha descongelado sin cocinarlo?'), 3, 'Solo si es carne');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Cuál es el orden correcto?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es el orden correcto?'), 0, 'Desinfectar y luego limpiar');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es el orden correcto?'), 1, 'Limpiar y luego desinfectar');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es el orden correcto?'), 2, 'Solo desinfectar');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es el orden correcto?'), 3, 'Solo aclarar');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Dónde deben guardarse los productos de limpieza?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Dónde deben guardarse los productos de limpieza?'), 0, 'Junto a los alimentos');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Dónde deben guardarse los productos de limpieza?'), 1, 'En un lugar separado y en sus envases originales');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Dónde deben guardarse los productos de limpieza?'), 2, 'En botellas de agua reutilizadas');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Dónde deben guardarse los productos de limpieza?'), 3, 'En la cámara frigorífica');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Qué ocurre si se mezcla lejía con amoniaco?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué ocurre si se mezcla lejía con amoniaco?'), 0, 'Limpia mejor');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué ocurre si se mezcla lejía con amoniaco?'), 1, 'Se desprenden gases tóxicos');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué ocurre si se mezcla lejía con amoniaco?'), 2, 'No pasa nada');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué ocurre si se mezcla lejía con amoniaco?'), 3, 'Se neutralizan');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Qué tipo de cubo de basura es el adecuado en una cocina?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué tipo de cubo de basura es el adecuado en una cocina?'), 0, 'Abierto');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué tipo de cubo de basura es el adecuado en una cocina?'), 1, 'Con tapa y accionado por pedal');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué tipo de cubo de basura es el adecuado en una cocina?'), 2, 'Cualquier caja de cartón');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué tipo de cubo de basura es el adecuado en una cocina?'), 3, 'Con tapa que se abre con la mano');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Quién debe aplicar los tratamientos contra plagas?', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Quién debe aplicar los tratamientos contra plagas?'), 0, 'Cualquier trabajador');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Quién debe aplicar los tratamientos contra plagas?'), 1, 'El cocinero');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Quién debe aplicar los tratamientos contra plagas?'), 2, 'Una empresa autorizada');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Quién debe aplicar los tratamientos contra plagas?'), 3, 'El cliente');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Cuántos alérgenos son de declaración obligatoria en la Unión Europea?', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuántos alérgenos son de declaración obligatoria en la Unión Europea?'), 0, '8');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuántos alérgenos son de declaración obligatoria en la Unión Europea?'), 1, '10');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuántos alérgenos son de declaración obligatoria en la Unión Europea?'), 2, '14');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuántos alérgenos son de declaración obligatoria en la Unión Europea?'), 3, '20');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Cuál de estos NO es un alérgeno de declaración obligatoria?', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál de estos NO es un alérgeno de declaración obligatoria?'), 0, 'Sésamo');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál de estos NO es un alérgeno de declaración obligatoria?'), 1, 'Mostaza');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál de estos NO es un alérgeno de declaración obligatoria?'), 2, 'Tomate');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál de estos NO es un alérgeno de declaración obligatoria?'), 3, 'Apio');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 'Si un cliente pregunta si un plato contiene frutos secos y no estás seguro, debes…', 2);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Si un cliente pregunta si un plato contiene frutos secos y no estás seguro, debes…'), 0, 'Decir que no');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Si un cliente pregunta si un plato contiene frutos secos y no estás seguro, debes…'), 1, 'Decir que sí por si acaso sin comprobar');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Si un cliente pregunta si un plato contiene frutos secos y no estás seguro, debes…'), 2, 'Consultar la información de alérgenos y no afirmar nada sin comprobarlo');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Si un cliente pregunta si un plato contiene frutos secos y no estás seguro, debes…'), 3, 'Recomendarle otro restaurante');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Qué diferencia hay entre fecha de caducidad y de consumo preferente?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué diferencia hay entre fecha de caducidad y de consumo preferente?'), 0, 'Ninguna');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué diferencia hay entre fecha de caducidad y de consumo preferente?'), 1, 'La caducidad indica seguridad; el consumo preferente, calidad');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué diferencia hay entre fecha de caducidad y de consumo preferente?'), 2, 'El consumo preferente es más estricto');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué diferencia hay entre fecha de caducidad y de consumo preferente?'), 3, 'La caducidad solo se aplica a bebidas');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 'Para evitar el contacto cruzado con alérgenos se debe…', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Para evitar el contacto cruzado con alérgenos se debe…'), 0, 'Usar el mismo aceite para todo');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Para evitar el contacto cruzado con alérgenos se debe…'), 1, 'Usar utensilios y superficies separados');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Para evitar el contacto cruzado con alérgenos se debe…'), 2, 'Lavar solo al final del día');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'Para evitar el contacto cruzado con alérgenos se debe…'), 3, 'No hace falta hacer nada');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Qué significan las siglas APPCC?', 0);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué significan las siglas APPCC?'), 0, 'Análisis de Peligros y Puntos de Control Crítico');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué significan las siglas APPCC?'), 1, 'Asociación de Productores y Cocineros');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué significan las siglas APPCC?'), 2, 'Análisis de Productos y Precios de Consumo');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué significan las siglas APPCC?'), 3, 'Autocontrol de Platos Preparados y Cocinados');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), 'El sistema APPCC es un sistema…', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'El sistema APPCC es un sistema…'), 0, 'Correctivo');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'El sistema APPCC es un sistema…'), 1, 'Preventivo');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'El sistema APPCC es un sistema…'), 2, 'Sancionador');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = 'El sistema APPCC es un sistema…'), 3, 'Opcional para todos');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Qué es un límite crítico?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué es un límite crítico?'), 0, 'El precio máximo de un plato');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué es un límite crítico?'), 1, 'El valor que separa lo aceptable de lo inaceptable en un punto de control crítico');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué es un límite crítico?'), 2, 'El número máximo de trabajadores');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Qué es un límite crítico?'), 3, 'La fecha de caducidad');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Cuál es una responsabilidad del manipulador dentro del autocontrol?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es una responsabilidad del manipulador dentro del autocontrol?'), 0, 'Diseñar el plan APPCC');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es una responsabilidad del manipulador dentro del autocontrol?'), 1, 'Anotar los registros y avisar de las incidencias');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es una responsabilidad del manipulador dentro del autocontrol?'), 2, 'Inspeccionar otros establecimientos');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál es una responsabilidad del manipulador dentro del autocontrol?'), 3, 'Fijar los límites críticos');

INSERT INTO pregunta (curso_id, enunciado, correcta) VALUES ((SELECT id FROM curso WHERE slug = 'manipulador-alimentos'), '¿Cuál de estos es un plan general de higiene?', 1);
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál de estos es un plan general de higiene?'), 0, 'Plan de marketing');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál de estos es un plan general de higiene?'), 1, 'Plan de limpieza y desinfección');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál de estos es un plan general de higiene?'), 2, 'Plan de vacaciones');
INSERT INTO pregunta_opcion (pregunta_id, posicion, texto) VALUES ((SELECT id FROM pregunta WHERE enunciado = '¿Cuál de estos es un plan general de higiene?'), 3, 'Plan de ventas');

