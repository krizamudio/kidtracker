export const CONDUCTAS_POR_CATEGORIA = {
  tdah: {
    label: 'TDAH y Neurodesarrollo',
    emoji: '🧠',
    color: '#6366F1',
    subcategorias: [
      {
        id: 'motriz',
        label: 'Actividad Motriz',
        conductas: [
          { id: 'tdah_m1', label: 'Se mueve constantemente, no puede quedarse quieto' },
          { id: 'tdah_m2', label: 'Se levanta del asiento cuando debe permanecer sentado' },
          { id: 'tdah_m3', label: 'Corre o trepa en situaciones inapropiadas' },
          { id: 'tdah_m4', label: 'Habla excesivamente' },
          { id: 'tdah_m5', label: 'Hace ruidos molestos o inapropiados' },
        ],
      },
      {
        id: 'atencion',
        label: 'Organización y Atención',
        conductas: [
          { id: 'tdah_a1', label: 'No termina las tareas que empieza' },
          { id: 'tdah_a2', label: 'Se distrae fácilmente con estímulos externos' },
          { id: 'tdah_a3', label: 'Pierde objetos necesarios (útiles, juguetes)' },
          { id: 'tdah_a4', label: 'Olvida actividades cotidianas' },
          { id: 'tdah_a5', label: 'Le cuesta organizar tareas y actividades' },
          { id: 'tdah_a6', label: 'Evita tareas que requieren esfuerzo mental sostenido' },
          { id: 'tdah_a7', label: 'No sigue instrucciones aunque las entiende' },
        ],
      },
      {
        id: 'impulsividad',
        label: 'Impulsividad',
        conductas: [
          { id: 'tdah_i1', label: 'Responde antes de que terminen la pregunta' },
          { id: 'tdah_i2', label: 'Le cuesta esperar su turno' },
          { id: 'tdah_i3', label: 'Interrumpe conversaciones o juegos de otros' },
          { id: 'tdah_i4', label: 'Actúa sin pensar en las consecuencias' },
          { id: 'tdah_i5', label: 'Cambia bruscamente de actividad' },
        ],
      },
      {
        id: 'asociados',
        label: 'Factores Asociados',
        conductas: [
          { id: 'tdah_f1', label: 'Dificultad para regular emociones (llanto, enojo)' },
          { id: 'tdah_f2', label: 'Baja tolerancia a la frustración' },
          { id: 'tdah_f3', label: 'Dificultades en relaciones con pares' },
          { id: 'tdah_f4', label: 'Bajo rendimiento académico' },
          { id: 'tdah_f5', label: 'Problemas de sueño' },
        ],
      },
    ],
  },

  tea: {
    label: 'TEA (Autismo)',
    emoji: '🌈',
    color: '#EC4899',
    subcategorias: [
      {
        id: 'social',
        label: 'Interacción Social',
        conductas: [
          { id: 'tea_s1', label: 'Poco contacto visual' },
          { id: 'tea_s2', label: 'No responde a su nombre' },
          { id: 'tea_s3', label: 'Prefiere jugar solo' },
          { id: 'tea_s4', label: 'Dificultad para compartir intereses' },
          { id: 'tea_s5', label: 'No señala para mostrar o pedir cosas' },
        ],
      },
      {
        id: 'lenguaje_tea',
        label: 'Lenguaje y Comunicación',
        conductas: [
          { id: 'tea_l1', label: 'Retraso o ausencia del lenguaje oral' },
          { id: 'tea_l2', label: 'Repite palabras o frases fuera de contexto (ecolalia)' },
          { id: 'tea_l3', label: 'Lenguaje muy literal, no entiende metáforas' },
          { id: 'tea_l4', label: 'Invierte pronombres (dice "tú" por "yo")' },
          { id: 'tea_l5', label: 'Usa objetos para comunicarse en vez de palabras' },
        ],
      },
      {
        id: 'sensorial',
        label: 'Procesamiento Sensorial',
        conductas: [
          { id: 'tea_ps1', label: 'Reacción exagerada a sonidos, luces o texturas' },
          { id: 'tea_ps2', label: 'Busca estímulos sensoriales (gira, salta, se balancea)' },
          { id: 'tea_ps3', label: 'Problemas con texturas de alimentos' },
          { id: 'tea_ps4', label: 'No siente dolor de forma típica' },
          { id: 'tea_ps5', label: 'Huele o lame objetos' },
        ],
      },
      {
        id: 'rutinas',
        label: 'Rutinas y Flexibilidad',
        conductas: [
          { id: 'tea_r1', label: 'Se aferra a rutinas rígidas' },
          { id: 'tea_r2', label: 'Reacción intensa ante cambios pequeños' },
          { id: 'tea_r3', label: 'Intereses muy intensos y restringidos' },
          { id: 'tea_r4', label: 'Movimientos repetitivos (aleteo, balanceo)' },
          { id: 'tea_r5', label: 'Alineación u ordenamiento compulsivo de objetos' },
        ],
      },
    ],
  },

  conducta: {
    label: 'Conductuales',
    emoji: '⚡',
    color: '#F59E0B',
    subcategorias: [
      {
        id: 'oposicion',
        label: 'Oposición y Desafío',
        conductas: [
          { id: 'con_o1', label: 'Se niega a seguir reglas o instrucciones adultas' },
          { id: 'con_o2', label: 'Discute constantemente con adultos' },
          { id: 'con_o3', label: 'Desafía activamente las normas' },
          { id: 'con_o4', label: 'Molesta deliberadamente a otros' },
          { id: 'con_o5', label: 'Culpa a otros de sus errores' },
        ],
      },
      {
        id: 'agresion',
        label: 'Agresión',
        conductas: [
          { id: 'con_a1', label: 'Agresión física hacia personas o animales' },
          { id: 'con_a2', label: 'Destruye objetos intencionalmente' },
          { id: 'con_a3', label: 'Amenaza o intimida a otros' },
          { id: 'con_a4', label: 'Berrinches intensos o frecuentes' },
          { id: 'con_a5', label: 'Agresión verbal (insultos, groserías)' },
        ],
      },
    ],
  },

  emocional: {
    label: 'Emocionales',
    emoji: '💭',
    color: '#14B8A6',
    subcategorias: [
      {
        id: 'ansiedad',
        label: 'Ansiedad',
        conductas: [
          { id: 'emo_a1', label: 'Miedos excesivos o irracionales' },
          { id: 'emo_a2', label: 'Preocupación constante o excesiva' },
          { id: 'emo_a3', label: 'Quejas físicas sin causa médica (dolor de estómago, cabeza)' },
          { id: 'emo_a4', label: 'Dificultad para separarse de cuidadores' },
          { id: 'emo_a5', label: 'Pesadillas o miedo a dormir solo' },
          { id: 'emo_a6', label: 'Evita situaciones sociales o nuevas' },
        ],
      },
      {
        id: 'estado_animo',
        label: 'Estado de Ánimo',
        conductas: [
          { id: 'emo_e1', label: 'Tristeza persistente o llanto frecuente' },
          { id: 'emo_e2', label: 'Irritabilidad o mal humor la mayor parte del tiempo' },
          { id: 'emo_e3', label: 'Pérdida de interés en actividades que antes disfrutaba' },
          { id: 'emo_e4', label: 'Fatiga o falta de energía frecuente' },
          { id: 'emo_e5', label: 'Cambios bruscos de humor' },
        ],
      },
    ],
  },

  aprendizaje: {
    label: 'Trastornos del Aprendizaje',
    emoji: '📚',
    color: '#0EA5E9',
    subcategorias: [
      {
        id: 'lectura',
        label: 'Lectura (Dislexia)',
        conductas: [
          { id: 'apr_l1', label: 'Dificultad para reconocer letras o sonidos' },
          { id: 'apr_l2', label: 'Lee muy lento o con muchos errores' },
          { id: 'apr_l3', label: 'Invierte letras o sílabas al leer' },
          { id: 'apr_l4', label: 'No comprende lo que lee' },
        ],
      },
      {
        id: 'escritura',
        label: 'Escritura (Disgrafia)',
        conductas: [
          { id: 'apr_e1', label: 'Letra muy ilegible o inconsistente' },
          { id: 'apr_e2', label: 'Omite o agrega letras al escribir' },
          { id: 'apr_e3', label: 'Dificultad para copiar del pizarrón' },
          { id: 'apr_e4', label: 'Agarre incorrecto del lápiz' },
        ],
      },
      {
        id: 'matematicas',
        label: 'Matemáticas (Discalculia)',
        conductas: [
          { id: 'apr_m1', label: 'Dificultad para contar o reconocer números' },
          { id: 'apr_m2', label: 'No entiende conceptos de suma/resta básica' },
          { id: 'apr_m3', label: 'Se confunde con símbolos matemáticos' },
          { id: 'apr_m4', label: 'Dificultad para manejar el dinero o el tiempo' },
        ],
      },
    ],
  },

  motor: {
    label: 'Trastornos Motores',
    emoji: '🤸',
    color: '#84CC16',
    subcategorias: [
      {
        id: 'coordinacion',
        label: 'Coordinación',
        conductas: [
          { id: 'mot_c1', label: 'Torpeza frecuente, se cae o choca con objetos' },
          { id: 'mot_c2', label: 'Dificultad para abrochar botones o amarrar agujetas' },
          { id: 'mot_c3', label: 'Problemas para atrapar o lanzar pelotas' },
          { id: 'mot_c4', label: 'Escritura muy lenta o con mucho esfuerzo' },
        ],
      },
      {
        id: 'tics',
        label: 'Tics',
        conductas: [
          { id: 'mot_t1', label: 'Movimientos repetitivos involuntarios (parpadeo, muecas)' },
          { id: 'mot_t2', label: 'Sonidos vocales repetitivos (carraspeo, sniff)' },
          { id: 'mot_t3', label: 'Los tics aumentan con el estrés' },
          { id: 'mot_t4', label: 'Puede suprimir el tic temporalmente' },
        ],
      },
    ],
  },

  alimentacion: {
    label: 'Alimentación',
    emoji: '🍽️',
    color: '#F97316',
    subcategorias: [
      {
        id: 'selectividad',
        label: 'Selectividad Alimentaria',
        conductas: [
          { id: 'ali_s1', label: 'Solo acepta ciertos alimentos o texturas' },
          { id: 'ali_s2', label: 'Reacciones intensas ante comidas nuevas' },
          { id: 'ali_s3', label: 'Come muy poco o muy lento' },
          { id: 'ali_s4', label: 'Náuseas o arcadas con ciertos alimentos' },
        ],
      },
    ],
  },

  eliminacion: {
    label: 'Eliminación',
    emoji: '💧',
    color: '#64748B',
    subcategorias: [
      {
        id: 'enuresis',
        label: 'Enuresis / Encopresis',
        conductas: [
          { id: 'eli_e1', label: 'Mojar la cama de noche (después de los 5 años)' },
          { id: 'eli_e2', label: 'Accidentes diurnos frecuentes' },
          { id: 'eli_e3', label: 'Retención voluntaria de heces' },
          { id: 'eli_e4', label: 'Ensucia la ropa interior con heces' },
        ],
      },
    ],
  },
};