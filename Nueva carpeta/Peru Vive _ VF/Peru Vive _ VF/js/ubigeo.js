/**
 * Ubigeo del Perú: departamentos, provincias y distritos (fuente: INEI, versión 2016).
 * Es una lista fija dentro de la app: no se conecta a ningún servicio ni necesita internet.
 * Estructura: UBIGEO[departamento][provincia] = [distritos].
 * UBIGEO_PUNTOS tiene la misma forma, con el punto aproximado [latitud, longitud] de cada distrito
 * (fuente: jmcastagnetto/ubigeo-peru-aumentado); sirve para sugerir tu distrito a partir del GPS.
 * Nota: los distritos creados después de 2016 todavía no aparecen en esta lista.
 */
const UBIGEO = {
    'Amazonas': {
        'Bagua': ['Aramango', 'Bagua', 'Copallin', 'El Parco', 'Imaza', 'La Peca'],
        'Bongará': ['Chisquilla', 'Churuja', 'Corosha', 'Cuispes', 'Florida', 'Jazan', 'Jumbilla', 'Recta', 'San Carlos', 'Shipasbamba', 'Valera', 'Yambrasbamba'],
        'Chachapoyas': ['Asunción', 'Balsas', 'Chachapoyas', 'Cheto', 'Chiliquin', 'Chuquibamba', 'Granada', 'Huancas', 'La Jalca', 'Leimebamba', 'Levanto', 'Magdalena', 'Mariscal Castilla', 'Molinopampa', 'Montevideo', 'Olleros', 'Quinjalca', 'San Francisco de Daguas', 'San Isidro de Maino', 'Soloco', 'Sonche'],
        'Condorcanqui': ['El Cenepa', 'Nieva', 'Río Santiago'],
        'Luya': ['Camporredondo', 'Cocabamba', 'Colcamar', 'Conila', 'Inguilpata', 'Lamud', 'Longuita', 'Lonya Chico', 'Luya', 'Luya Viejo', 'María', 'Ocalli', 'Ocumal', 'Pisuquia', 'Providencia', 'San Cristóbal', 'San Francisco de Yeso', 'San Jerónimo', 'San Juan de Lopecancha', 'Santa Catalina', 'Santo Tomas', 'Tingo', 'Trita'],
        'Rodríguez de Mendoza': ['Chirimoto', 'Cochamal', 'Huambo', 'Limabamba', 'Longar', 'Mariscal Benavides', 'Milpuc', 'Omia', 'San Nicolás', 'Santa Rosa', 'Totora', 'Vista Alegre'],
        'Utcubamba': ['Bagua Grande', 'Cajaruro', 'Cumba', 'El Milagro', 'Jamalca', 'Lonya Grande', 'Yamon']
    },
    'Áncash': {
        'Aija': ['Aija', 'Coris', 'Huacllan', 'La Merced', 'Succha'],
        'Antonio Raymondi': ['Aczo', 'Chaccho', 'Chingas', 'Llamellin', 'Mirgas', 'San Juan de Rontoy'],
        'Asunción': ['Acochaca', 'Chacas'],
        'Bolognesi': ['Abelardo Pardo Lezameta', 'Antonio Raymondi', 'Aquia', 'Cajacay', 'Canis', 'Chiquian', 'Colquioc', 'Huallanca', 'Huasta', 'Huayllacayan', 'La Primavera', 'Mangas', 'Pacllon', 'San Miguel de Corpanqui', 'Ticllos'],
        'Carhuaz': ['Acopampa', 'Amashca', 'Anta', 'Ataquero', 'Carhuaz', 'Marcara', 'Pariahuanca', 'San Miguel de Aco', 'Shilla', 'Tinco', 'Yungar'],
        'Carlos Fermín Fitzcarrald': ['San Luis', 'San Nicolás', 'Yauya'],
        'Casma': ['Buena Vista Alta', 'Casma', 'Comandante Noel', 'Yautan'],
        'Corongo': ['Aco', 'Bambas', 'Corongo', 'Cusca', 'La Pampa', 'Yanac', 'Yupan'],
        'Huaraz': ['Cochabamba', 'Colcabamba', 'Huanchay', 'Huaraz', 'Independencia', 'Jangas', 'La Libertad', 'Olleros', 'Pampas Grande', 'Pariacoto', 'Pira', 'Tarica'],
        'Huari': ['Anra', 'Cajay', 'Chavin de Huantar', 'Huacachi', 'Huacchis', 'Huachis', 'Huantar', 'Huari', 'Masin', 'Paucas', 'Ponto', 'Rahuapampa', 'Rapayan', 'San Marcos', 'San Pedro de Chana', 'Uco'],
        'Huarmey': ['Cochapeti', 'Culebras', 'Huarmey', 'Huayan', 'Malvas'],
        'Huaylas': ['Caraz', 'Huallanca', 'Huata', 'Huaylas', 'Mato', 'Pamparomas', 'Pueblo Libre', 'Santa Cruz', 'Santo Toribio', 'Yuracmarca'],
        'Mariscal Luzuriaga': ['Casca', 'Eleazar Guzmán Barron', 'Fidel Olivas Escudero', 'Llama', 'Llumpa', 'Lucma', 'Musga', 'Piscobamba'],
        'Ocros': ['Acas', 'Cajamarquilla', 'Carhuapampa', 'Cochas', 'Congas', 'Llipa', 'Ocros', 'San Cristóbal de Rajan', 'San Pedro', 'Santiago de Chilcas'],
        'Pallasca': ['Bolognesi', 'Cabana', 'Conchucos', 'Huacaschuque', 'Huandoval', 'Lacabamba', 'Llapo', 'Pallasca', 'Pampas', 'Santa Rosa', 'Tauca'],
        'Pomabamba': ['Huayllan', 'Parobamba', 'Pomabamba', 'Quinuabamba'],
        'Recuay': ['Catac', 'Cotaparaco', 'Huayllapampa', 'Llacllin', 'Marca', 'Pampas Chico', 'Pararin', 'Recuay', 'Tapacocha', 'Ticapampa'],
        'Santa': ['Cáceres del Perú', 'Chimbote', 'Coishco', 'Macate', 'Moro', 'Nepeña', 'Nuevo Chimbote', 'Samanco', 'Santa'],
        'Sihuas': ['Acobamba', 'Alfonso Ugarte', 'Cashapampa', 'Chingalpo', 'Huayllabamba', 'Quiches', 'Ragash', 'San Juan', 'Sicsibamba', 'Sihuas'],
        'Yungay': ['Cascapara', 'Mancos', 'Matacoto', 'Quillo', 'Ranrahirca', 'Shupluy', 'Yanama', 'Yungay']
    },
    'Apurímac': {
        'Abancay': ['Abancay', 'Chacoche', 'Circa', 'Curahuasi', 'Huanipaca', 'Lambrama', 'Pichirhua', 'San Pedro de Cachora', 'Tamburco'],
        'Andahuaylas': ['Andahuaylas', 'Andarapa', 'Chiara', 'Huancarama', 'Huancaray', 'Huayana', 'José María Arguedas', 'Kaquiabamba', 'Kishuara', 'Pacobamba', 'Pacucha', 'Pampachiri', 'Pomacocha', 'San Antonio de Cachi', 'San Jerónimo', 'San Miguel de Chaccrampa', 'Santa María de Chicmo', 'Talavera', 'Tumay Huaraca', 'Turpo'],
        'Antabamba': ['Antabamba', 'El Oro', 'Huaquirca', 'Juan Espinoza Medrano', 'Oropesa', 'Pachaconas', 'Sabaino'],
        'Aymaraes': ['Capaya', 'Caraybamba', 'Chalhuanca', 'Chapimarca', 'Colcabamba', 'Cotaruse', 'Ihuayllo', 'Justo Apu Sahuaraura', 'Lucre', 'Pocohuanca', 'San Juan de Chacña', 'Sañayca', 'Soraya', 'Tapairihua', 'Tintay', 'Toraya', 'Yanaca'],
        'Chincheros': ['Anco_Huallo', 'Chincheros', 'Cocharcas', 'El Porvenir', 'Huaccana', 'Los Chankas', 'Ocobamba', 'Ongoy', 'Ranracancha', 'Rocchacc', 'Uranmarca'],
        'Cotabambas': ['Challhuahuacho', 'Cotabambas', 'Coyllurqui', 'Haquira', 'Mara', 'Tambobamba'],
        'Grau': ['Chuquibambilla', 'Curasco', 'Curpahuasi', 'Gamarra', 'Huayllati', 'Mamara', 'Micaela Bastidas', 'Pataypampa', 'Progreso', 'San Antonio', 'Santa Rosa', 'Turpay', 'Vilcabamba', 'Virundo']
    },
    'Arequipa': {
        'Arequipa': ['Alto Selva Alegre', 'Arequipa', 'Cayma', 'Cerro Colorado', 'Characato', 'Chiguata', 'Jacobo Hunter', 'José Luis Bustamante Y Rivero', 'La Joya', 'Mariano Melgar', 'Miraflores', 'Mollebaya', 'Paucarpata', 'Pocsi', 'Polobaya', 'Quequeña', 'Sabandia', 'Sachaca', 'San Juan de Siguas', 'San Juan de Tarucani', 'Santa Isabel de Siguas', 'Santa Rita de Siguas', 'Socabaya', 'Tiabaya', 'Uchumayo', 'Vitor', 'Yanahuara', 'Yarabamba', 'Yura'],
        'Camaná': ['Camaná', 'José María Quimper', 'Mariano Nicolás Valcárcel', 'Mariscal Cáceres', 'Nicolás de Pierola', 'Ocoña', 'Quilca', 'Samuel Pastor'],
        'Caravelí': ['Acarí', 'Atico', 'Atiquipa', 'Bella Unión', 'Cahuacho', 'Caravelí', 'Chala', 'Chaparra', 'Huanuhuanu', 'Jaqui', 'Lomas', 'Quicacha', 'Yauca'],
        'Castilla': ['Andagua', 'Aplao', 'Ayo', 'Chachas', 'Chilcaymarca', 'Choco', 'Huancarqui', 'Machaguay', 'Orcopampa', 'Pampacolca', 'Tipan', 'Uñon', 'Uraca', 'Viraco'],
        'Caylloma': ['Achoma', 'Cabanaconde', 'Callalli', 'Caylloma', 'Chivay', 'Coporaque', 'Huambo', 'Huanca', 'Ichupampa', 'Lari', 'Lluta', 'Maca', 'Madrigal', 'Majes', 'San Antonio de Chuca', 'Sibayo', 'Tapay', 'Tisco', 'Tuti', 'Yanque'],
        'Condesuyos': ['Andaray', 'Cayarani', 'Chichas', 'Chuquibamba', 'Iray', 'Río Grande', 'Salamanca', 'Yanaquihua'],
        'Islay': ['Cocachacra', 'Dean Valdivia', 'Islay', 'Mejia', 'Mollendo', 'Punta de Bombón'],
        'La Uniòn': ['Alca', 'Charcana', 'Cotahuasi', 'Huaynacotas', 'Pampamarca', 'Puyca', 'Quechualla', 'Sayla', 'Tauria', 'Tomepampa', 'Toro']
    },
    'Ayacucho': {
        'Cangallo': ['Cangallo', 'Chuschi', 'Los Morochucos', 'María Parado de Bellido', 'Paras', 'Totos'],
        'Huamanga': ['Acocro', 'Acos Vinchos', 'Andrés Avelino Cáceres Dorregaray', 'Ayacucho', 'Carmen Alto', 'Chiara', 'Jesús Nazareno', 'Ocros', 'Pacaycasa', 'Quinua', 'San José de Ticllas', 'San Juan Bautista', 'Santiago de Pischa', 'Socos', 'Tambillo', 'Vinchos'],
        'Huanca Sancos': ['Carapo', 'Sacsamarca', 'Sancos', 'Santiago de Lucanamarca'],
        'Huanta': ['Ayahuanco', 'Canayre', 'Chaca', 'Huamanguilla', 'Huanta', 'Iguain', 'Llochegua', 'Luricocha', 'Pucacolpa', 'Santillana', 'Sivia', 'Uchuraccay'],
        'La Mar': ['Anchihuay', 'Anco', 'Ayna', 'Chilcas', 'Chungui', 'Luis Carranza', 'Oronccoy', 'Samugari', 'San Miguel', 'Santa Rosa', 'Tambo'],
        'Lucanas': ['Aucara', 'Cabana', 'Carmen Salcedo', 'Chaviña', 'Chipao', 'Huac-Huas', 'Laramate', 'Leoncio Prado', 'Llauta', 'Lucanas', 'Ocaña', 'Otoca', 'Puquio', 'Saisa', 'San Cristóbal', 'San Juan', 'San Pedro', 'San Pedro de Palco', 'Sancos', 'Santa Ana de Huaycahuacho', 'Santa Lucia'],
        'Parinacochas': ['Chumpi', 'Coracora', 'Coronel Castañeda', 'Pacapausa', 'Pullo', 'Puyusca', 'San Francisco de Ravacayco', 'Upahuacho'],
        'Pàucar del Sara Sara': ['Colta', 'Corculla', 'Lampa', 'Marcabamba', 'Oyolo', 'Pararca', 'Pausa', 'San Javier de Alpabamba', 'San José de Ushua', 'Sara Sara'],
        'Sucre': ['Belén', 'Chalcos', 'Chilcayoc', 'Huacaña', 'Morcolla', 'Paico', 'Querobamba', 'San Pedro de Larcay', 'San Salvador de Quije', 'Santiago de Paucaray', 'Soras'],
        'Víctor Fajardo': ['Alcamenca', 'Apongo', 'Asquipata', 'Canaria', 'Cayara', 'Colca', 'Hualla', 'Huamanquiquia', 'Huancapi', 'Huancaraylla', 'Sarhua', 'Vilcanchos'],
        'Vilcas Huamán': ['Accomarca', 'Carhuanca', 'Concepción', 'Huambalpa', 'Independencia', 'Saurama', 'Vilcas Huaman', 'Vischongo']
    },
    'Cajamarca': {
        'Cajabamba': ['Cachachi', 'Cajabamba', 'Condebamba', 'Sitacocha'],
        'Cajamarca': ['Asunción', 'Cajamarca', 'Chetilla', 'Cospan', 'Encañada', 'Jesús', 'Llacanora', 'Los Baños del Inca', 'Magdalena', 'Matara', 'Namora', 'San Juan'],
        'Celendín': ['Celendín', 'Chumuch', 'Cortegana', 'Huasmin', 'Jorge Chávez', 'José Gálvez', 'La Libertad de Pallan', 'Miguel Iglesias', 'Oxamarca', 'Sorochuco', 'Sucre', 'Utco'],
        'Chota': ['Anguia', 'Chadin', 'Chalamarca', 'Chiguirip', 'Chimban', 'Choropampa', 'Chota', 'Cochabamba', 'Conchan', 'Huambos', 'Lajas', 'Llama', 'Miracosta', 'Paccha', 'Pion', 'Querocoto', 'San Juan de Licupis', 'Tacabamba', 'Tocmoche'],
        'Contumazá': ['Chilete', 'Contumaza', 'Cupisnique', 'Guzmango', 'San Benito', 'Santa Cruz de Toledo', 'Tantarica', 'Yonan'],
        'Cutervo': ['Callayuc', 'Choros', 'Cujillo', 'Cutervo', 'La Ramada', 'Pimpingos', 'Querocotillo', 'San Andrés de Cutervo', 'San Juan de Cutervo', 'San Luis de Lucma', 'Santa Cruz', 'Santo Domingo de la Capilla', 'Santo Tomas', 'Socota', 'Toribio Casanova'],
        'Hualgayoc': ['Bambamarca', 'Chugur', 'Hualgayoc'],
        'Jaén': ['Bellavista', 'Chontali', 'Colasay', 'Huabal', 'Jaén', 'Las Pirias', 'Pomahuaca', 'Pucara', 'Sallique', 'San Felipe', 'San José del Alto', 'Santa Rosa'],
        'San Ignacio': ['Chirinos', 'Huarango', 'La Coipa', 'Namballe', 'San Ignacio', 'San José de Lourdes', 'Tabaconas'],
        'San Marcos': ['Chancay', 'Eduardo Villanueva', 'Gregorio Pita', 'Ichocan', 'José Manuel Quiroz', 'José Sabogal', 'Pedro Gálvez'],
        'San Miguel': ['Bolívar', 'Calquis', 'Catilluc', 'El Prado', 'La Florida', 'Llapa', 'Nanchoc', 'Niepos', 'San Gregorio', 'San Miguel', 'San Silvestre de Cochan', 'Tongod', 'Unión Agua Blanca'],
        'San Pablo': ['San Bernardino', 'San Luis', 'San Pablo', 'Tumbaden'],
        'Santa Cruz': ['Andabamba', 'Catache', 'Chancaybaños', 'La Esperanza', 'Ninabamba', 'Pulan', 'Santa Cruz', 'Saucepampa', 'Sexi', 'Uticyacu', 'Yauyucan']
    },
    'Callao': {
        'Prov. Const. del Callao': ['Bellavista', 'Callao', 'Carmen de la Legua Reynoso', 'La Perla', 'La Punta', 'Mi Perú', 'Ventanilla']
    },
    'Cusco': {
        'Acomayo': ['Acomayo', 'Acopia', 'Acos', 'Mosoc Llacta', 'Pomacanchi', 'Rondocan', 'Sangarara'],
        'Anta': ['Ancahuasi', 'Anta', 'Cachimayo', 'Chinchaypujio', 'Huarocondo', 'Limatambo', 'Mollepata', 'Pucyura', 'Zurite'],
        'Calca': ['Calca', 'Coya', 'Lamay', 'Lares', 'Pisac', 'San Salvador', 'Taray', 'Yanatile'],
        'Canas': ['Checca', 'Kunturkanki', 'Langui', 'Layo', 'Pampamarca', 'Quehue', 'Tupac Amaru', 'Yanaoca'],
        'Canchis': ['Checacupe', 'Combapata', 'Marangani', 'Pitumarca', 'San Pablo', 'San Pedro', 'Sicuani', 'Tinta'],
        'Chumbivilcas': ['Capacmarca', 'Chamaca', 'Colquemarca', 'Livitaca', 'Llusco', 'Quiñota', 'Santo Tomas', 'Velille'],
        'Cusco': ['Ccorca', 'Cusco', 'Poroy', 'San Jerónimo', 'San Sebastian', 'Santiago', 'Saylla', 'Wanchaq'],
        'Espinar': ['Alto Pichigua', 'Condoroma', 'Coporaque', 'Espinar', 'Ocoruro', 'Pallpata', 'Pichigua', 'Suyckutambo'],
        'La Convención': ['Echarate', 'Huayopata', 'Inkawasi', 'Kimbiri', 'Maranura', 'Megantoni', 'Ocobamba', 'Pichari', 'Quellouno', 'Santa Ana', 'Santa Teresa', 'Vilcabamba', 'Villa Kintiarina', 'Villa Virgen'],
        'Paruro': ['Accha', 'Ccapi', 'Colcha', 'Huanoquite', 'Omachaç', 'Paccaritambo', 'Paruro', 'Pillpinto', 'Yaurisque'],
        'Paucartambo': ['Caicay', 'Challabamba', 'Colquepata', 'Huancarani', 'Kosñipata', 'Paucartambo'],
        'Quispicanchi': ['Andahuaylillas', 'Camanti', 'Ccarhuayo', 'Ccatca', 'Cusipata', 'Huaro', 'Lucre', 'Marcapata', 'Ocongate', 'Oropesa', 'Quiquijana', 'Urcos'],
        'Urubamba': ['Chinchero', 'Huayllabamba', 'Machupicchu', 'Maras', 'Ollantaytambo', 'Urubamba', 'Yucay']
    },
    'Huancavelica': {
        'Acobamba': ['Acobamba', 'Andabamba', 'Anta', 'Caja', 'Marcas', 'Paucara', 'Pomacocha', 'Rosario'],
        'Angaraes': ['Anchonga', 'Callanmarca', 'Ccochaccasa', 'Chincho', 'Congalla', 'Huanca-Huanca', 'Huayllay Grande', 'Julcamarca', 'Lircay', 'San Antonio de Antaparco', 'Santo Tomas de Pata', 'Secclla'],
        'Castrovirreyna': ['Arma', 'Aurahua', 'Capillas', 'Castrovirreyna', 'Chupamarca', 'Cocas', 'Huachos', 'Huamatambo', 'Mollepampa', 'San Juan', 'Santa Ana', 'Tantara', 'Ticrapo'],
        'Churcampa': ['Anco', 'Chinchihuasi', 'Churcampa', 'Cosme', 'El Carmen', 'La Merced', 'Locroja', 'Pachamarca', 'Paucarbamba', 'San Miguel de Mayocc', 'San Pedro de Coris'],
        'Huancavelica': ['Acobambilla', 'Acoria', 'Ascensión', 'Conayca', 'Cuenca', 'Huachocolpa', 'Huancavelica', 'Huando', 'Huayllahuara', 'Izcuchaca', 'Laria', 'Manta', 'Mariscal Cáceres', 'Moya', 'Nuevo Occoro', 'Palca', 'Pilchaca', 'Vilca', 'Yauli'],
        'Huaytará': ['Ayavi', 'Córdova', 'Huayacundo Arma', 'Huaytara', 'Laramarca', 'Ocoyo', 'Pilpichaca', 'Querco', 'Quito-Arma', 'San Antonio de Cusicancha', 'San Francisco de Sangayaico', 'San Isidro', 'Santiago de Chocorvos', 'Santiago de Quirahuara', 'Santo Domingo de Capillas', 'Tambo'],
        'Tayacaja': ['Acostambo', 'Acraquia', 'Ahuaycha', 'Andaymarca', 'Colcabamba', 'Daniel Hernández', 'Huachocolpa', 'Huaribamba', 'Ñahuimpuquio', 'Pampas', 'Pazos', 'Pichos', 'Quichuas', 'Quishuar', 'Roble', 'Salcabamba', 'Salcahuasi', 'San Marcos de Rocchac', 'Santiago de Tucuma', 'Surcubamba', 'Tintay Puncu']
    },
    'Huánuco': {
        'Ambo': ['Ambo', 'Cayna', 'Colpas', 'Conchamarca', 'Huacar', 'San Francisco', 'San Rafael', 'Tomay Kichwa'],
        'Dos de Mayo': ['Chuquis', 'La Unión', 'Marías', 'Pachas', 'Quivilla', 'Ripan', 'Shunqui', 'Sillapata', 'Yanas'],
        'Huacaybamba': ['Canchabamba', 'Cochabamba', 'Huacaybamba', 'Pinra'],
        'Huamalíes': ['Arancay', 'Chavín de Pariarca', 'Jacas Grande', 'Jircan', 'Llata', 'Miraflores', 'Monzón', 'Punchao', 'Puños', 'Singa', 'Tantamayo'],
        'Huánuco': ['Amarilis', 'Chinchao', 'Churubamba', 'Huanuco', 'Margos', 'Pillco Marca', 'Quisqui (Kichki)', 'San Francisco de Cayran', 'San Pablo de Pillao', 'San Pedro de Chaulan', 'Santa María del Valle', 'Yacus', 'Yarumayo'],
        'Lauricocha': ['Baños', 'Jesús', 'Jivia', 'Queropalca', 'Rondos', 'San Francisco de Asís', 'San Miguel de Cauri'],
        'Leoncio Prado': ['Castillo Grande', 'Daniel Alomía Robles', 'Hermílio Valdizan', 'José Crespo y Castillo', 'Luyando', 'Mariano Damaso Beraun', 'Pucayacu', 'Pueblo Nuevo', 'Rupa-Rupa', 'Santo Domingo de Anda'],
        'Marañón': ['Cholon', 'Huacrachuco', 'La Morada', 'San Buenaventura', 'Santa Rosa de Alto Yanajanca'],
        'Pachitea': ['Chaglla', 'Molino', 'Panao', 'Umari'],
        'Puerto Inca': ['Codo del Pozuzo', 'Honoria', 'Puerto Inca', 'Tournavista', 'Yuyapichis'],
        'Yarowilca': ['Aparicio Pomares', 'Cahuac', 'Chacabamba', 'Chavinillo', 'Choras', 'Jacas Chico', 'Obas', 'Pampamarca']
    },
    'Ica': {
        'Chincha': ['Alto Laran', 'Chavin', 'Chincha Alta', 'Chincha Baja', 'El Carmen', 'Grocio Prado', 'Pueblo Nuevo', 'San Juan de Yanac', 'San Pedro de Huacarpana', 'Sunampe', 'Tambo de Mora'],
        'Ica': ['Ica', 'La Tinguiña', 'Los Aquijes', 'Ocucaje', 'Pachacutec', 'Parcona', 'Pueblo Nuevo', 'Salas', 'San José de Los Molinos', 'San Juan Bautista', 'Santiago', 'Subtanjalla', 'Tate', 'Yauca del Rosario'],
        'Nasca': ['Changuillo', 'El Ingenio', 'Marcona', 'Nasca', 'Vista Alegre'],
        'Palpa': ['Llipata', 'Palpa', 'Río Grande', 'Santa Cruz', 'Tibillo'],
        'Pisco': ['Huancano', 'Humay', 'Independencia', 'Paracas', 'Pisco', 'San Andrés', 'San Clemente', 'Tupac Amaru Inca']
    },
    'Junín': {
        'Chanchamayo': ['Chanchamayo', 'Perene', 'Pichanaqui', 'San Luis de Shuaro', 'San Ramón', 'Vitoc'],
        'Chupaca': ['Ahuac', 'Chongos Bajo', 'Chupaca', 'Huachac', 'Huamancaca Chico', 'San Juan de Iscos', 'San Juan de Jarpa', 'Tres de Diciembre', 'Yanacancha'],
        'Concepción': ['Aco', 'Andamarca', 'Chambara', 'Cochas', 'Comas', 'Concepción', 'Heroínas Toledo', 'Manzanares', 'Mariscal Castilla', 'Matahuasi', 'Mito', 'Nueve de Julio', 'Orcotuna', 'San José de Quero', 'Santa Rosa de Ocopa'],
        'Huancayo': ['Carhuacallanga', 'Chacapampa', 'Chicche', 'Chilca', 'Chongos Alto', 'Chupuro', 'Colca', 'Cullhuas', 'El Tambo', 'Huacrapuquio', 'Hualhuas', 'Huancan', 'Huancayo', 'Huasicancha', 'Huayucachi', 'Ingenio', 'Pariahuanca', 'Pilcomayo', 'Pucara', 'Quichuay', 'Quilcas', 'San Agustín', 'San Jerónimo de Tunan', 'Santo Domingo de Acobamba', 'Saño', 'Sapallanga', 'Sicaya', 'Viques'],
        'Jauja': ['Acolla', 'Apata', 'Ataura', 'Canchayllo', 'Curicaca', 'El Mantaro', 'Huamali', 'Huaripampa', 'Huertas', 'Janjaillo', 'Jauja', 'Julcán', 'Leonor Ordóñez', 'Llocllapampa', 'Marco', 'Masma', 'Masma Chicche', 'Molinos', 'Monobamba', 'Muqui', 'Muquiyauyo', 'Paca', 'Paccha', 'Pancan', 'Parco', 'Pomacancha', 'Ricran', 'San Lorenzo', 'San Pedro de Chunan', 'Sausa', 'Sincos', 'Tunan Marca', 'Yauli', 'Yauyos'],
        'Junín': ['Carhuamayo', 'Junin', 'Ondores', 'Ulcumayo'],
        'Satipo': ['Coviriali', 'Llaylla', 'Mazamari', 'Pampa Hermosa', 'Pangoa', 'Río Negro', 'Río Tambo', 'Satipo', 'Vizcatan del Ene'],
        'Tarma': ['Acobamba', 'Huaricolca', 'Huasahuasi', 'La Unión', 'Palca', 'Palcamayo', 'San Pedro de Cajas', 'Tapo', 'Tarma'],
        'Yauli': ['Chacapalpa', 'Huay-Huay', 'La Oroya', 'Marcapomacocha', 'Morococha', 'Paccha', 'Santa Bárbara de Carhuacayan', 'Santa Rosa de Sacco', 'Suitucancha', 'Yauli']
    },
    'La Libertad': {
        'Ascope': ['Ascope', 'Casa Grande', 'Chicama', 'Chocope', 'Magdalena de Cao', 'Paijan', 'Rázuri', 'Santiago de Cao'],
        'Bolívar': ['Bambamarca', 'Bolívar', 'Condormarca', 'Longotea', 'Uchumarca', 'Ucuncha'],
        'Chepén': ['Chepen', 'Pacanga', 'Pueblo Nuevo'],
        'Gran Chimú': ['Cascas', 'Lucma', 'Marmot', 'Sayapullo'],
        'Julcán': ['Calamarca', 'Carabamba', 'Huaso', 'Julcan'],
        'Otuzco': ['Agallpampa', 'Charat', 'Huaranchal', 'La Cuesta', 'Mache', 'Otuzco', 'Paranday', 'Salpo', 'Sinsicap', 'Usquil'],
        'Pacasmayo': ['Guadalupe', 'Jequetepeque', 'Pacasmayo', 'San José', 'San Pedro de Lloc'],
        'Pataz': ['Buldibuyo', 'Chillia', 'Huancaspata', 'Huaylillas', 'Huayo', 'Ongon', 'Parcoy', 'Pataz', 'Pias', 'Santiago de Challas', 'Taurija', 'Tayabamba', 'Urpay'],
        'Sánchez Carrión': ['Chugay', 'Cochorco', 'Curgos', 'Huamachuco', 'Marcabal', 'Sanagoran', 'Sarin', 'Sartimbamba'],
        'Santiago de Chuco': ['Angasmarca', 'Cachicadan', 'Mollebamba', 'Mollepata', 'Quiruvilca', 'Santa Cruz de Chuca', 'Santiago de Chuco', 'Sitabamba'],
        'Trujillo': ['El Porvenir', 'Florencia de Mora', 'Huanchaco', 'La Esperanza', 'Laredo', 'Moche', 'Poroto', 'Salaverry', 'Simbal', 'Trujillo', 'Victor Larco Herrera'],
        'Virú': ['Chao', 'Guadalupito', 'Viru']
    },
    'Lambayeque': {
        'Chiclayo': ['Cayalti', 'Chiclayo', 'Chongoyape', 'Eten', 'Eten Puerto', 'José Leonardo Ortiz', 'La Victoria', 'Lagunas', 'Monsefu', 'Nueva Arica', 'Oyotun', 'Patapo', 'Picsi', 'Pimentel', 'Pomalca', 'Pucala', 'Reque', 'Santa Rosa', 'Saña', 'Tuman'],
        'Ferreñafe': ['Cañaris', 'Ferreñafe', 'Incahuasi', 'Manuel Antonio Mesones Muro', 'Pitipo', 'Pueblo Nuevo'],
        'Lambayeque': ['Chochope', 'Illimo', 'Jayanca', 'Lambayeque', 'Mochumi', 'Morrope', 'Motupe', 'Olmos', 'Pacora', 'Salas', 'San José', 'Tucume']
    },
    'Lima': {
        'Barranca': ['Barranca', 'Paramonga', 'Pativilca', 'Supe', 'Supe Puerto'],
        'Cajatambo': ['Cajatambo', 'Copa', 'Gorgor', 'Huancapon', 'Manas'],
        'Canta': ['Arahuay', 'Canta', 'Huamantanga', 'Huaros', 'Lachaqui', 'San Buenaventura', 'Santa Rosa de Quives'],
        'Cañete': ['Asia', 'Calango', 'Cerro Azul', 'Chilca', 'Coayllo', 'Imperial', 'Lunahuana', 'Mala', 'Nuevo Imperial', 'Pacaran', 'Quilmana', 'San Antonio', 'San Luis', 'San Vicente de Cañete', 'Santa Cruz de Flores', 'Zúñiga'],
        'Huaral': ['Atavillos Alto', 'Atavillos Bajo', 'Aucallama', 'Chancay', 'Huaral', 'Ihuari', 'Lampian', 'Pacaraos', 'San Miguel de Acos', 'Santa Cruz de Andamarca', 'Sumbilca', 'Veintisiete de Noviembre'],
        'Huarochirí': ['Antioquia', 'Callahuanca', 'Carampoma', 'Chicla', 'Cuenca', 'Huachupampa', 'Huanza', 'Huarochiri', 'Lahuaytambo', 'Langa', 'Laraos', 'Mariatana', 'Matucana', 'Ricardo Palma', 'San Andrés de Tupicocha', 'San Antonio', 'San Bartolomé', 'San Damian', 'San Juan de Iris', 'San Juan de Tantaranche', 'San Lorenzo de Quinti', 'San Mateo', 'San Mateo de Otao', 'San Pedro de Casta', 'San Pedro de Huancayre', 'Sangallaya', 'Santa Cruz de Cocachacra', 'Santa Eulalia', 'Santiago de Anchucaya', 'Santiago de Tuna', 'Santo Domingo de Los Olleros', 'Surco'],
        'Huaura': ['Ambar', 'Caleta de Carquin', 'Checras', 'Huacho', 'Hualmay', 'Huaura', 'Leoncio Prado', 'Paccho', 'Santa Leonor', 'Santa María', 'Sayan', 'Vegueta'],
        'Lima': ['Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla', 'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lima', 'Lince', 'Los Olivos', 'Lurigancho', 'Lurin', 'Magdalena del Mar', 'Miraflores', 'Pachacamac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa', 'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'],
        'Oyón': ['Andajes', 'Caujul', 'Cochamarca', 'Navan', 'Oyon', 'Pachangara'],
        'Yauyos': ['Alis', 'Allauca', 'Ayaviri', 'Azángaro', 'Cacra', 'Carania', 'Catahuasi', 'Chocos', 'Cochas', 'Colonia', 'Hongos', 'Huampara', 'Huancaya', 'Huangascar', 'Huantan', 'Huañec', 'Laraos', 'Lincha', 'Madean', 'Miraflores', 'Omas', 'Putinza', 'Quinches', 'Quinocay', 'San Joaquín', 'San Pedro de Pilas', 'Tanta', 'Tauripampa', 'Tomas', 'Tupe', 'Viñac', 'Vitis', 'Yauyos']
    },
    'Loreto': {
        'Alto Amazonas': ['Balsapuerto', 'Jeberos', 'Lagunas', 'Santa Cruz', 'Teniente Cesar López Rojas', 'Yurimaguas'],
        'Datem del Marañón': ['Andoas', 'Barranca', 'Cahuapanas', 'Manseriche', 'Morona', 'Pastaza'],
        'Loreto': ['Nauta', 'Parinari', 'Tigre', 'Trompeteros', 'Urarinas'],
        'Mariscal Ramón Castilla': ['Pebas', 'Ramón Castilla', 'San Pablo', 'Yavari'],
        'Maynas': ['Alto Nanay', 'Belén', 'Fernando Lores', 'Indiana', 'Iquitos', 'Las Amazonas', 'Mazan', 'Napo', 'Punchana', 'San Juan Bautista', 'Torres Causana'],
        'Putumayo': ['Putumayo', 'Rosa Panduro', 'Teniente Manuel Clavero', 'Yaguas'],
        'Requena': ['Alto Tapiche', 'Capelo', 'Emilio San Martín', 'Jenaro Herrera', 'Maquia', 'Puinahua', 'Requena', 'Saquena', 'Soplin', 'Tapiche', 'Yaquerana'],
        'Ucayali': ['Contamana', 'Inahuaya', 'Padre Márquez', 'Pampa Hermosa', 'Sarayacu', 'Vargas Guerra']
    },
    'Madre de Dios': {
        'Manu': ['Fitzcarrald', 'Huepetuhe', 'Madre de Dios', 'Manu'],
        'Tahuamanu': ['Iberia', 'Iñapari', 'Tahuamanu'],
        'Tambopata': ['Inambari', 'Laberinto', 'Las Piedras', 'Tambopata']
    },
    'Moquegua': {
        'General Sánchez Cerro': ['Chojata', 'Coalaque', 'Ichuña', 'La Capilla', 'Lloque', 'Matalaque', 'Omate', 'Puquina', 'Quinistaquillas', 'Ubinas', 'Yunga'],
        'Ilo': ['El Algarrobal', 'Ilo', 'Pacocha'],
        'Mariscal Nieto': ['Carumas', 'Cuchumbaya', 'Moquegua', 'Samegua', 'San Cristóbal', 'Torata']
    },
    'Pasco': {
        'Daniel Alcides Carrión': ['Chacayan', 'Goyllarisquizga', 'Paucar', 'San Pedro de Pillao', 'Santa Ana de Tusi', 'Tapuc', 'Vilcabamba', 'Yanahuanca'],
        'Oxapampa': ['Chontabamba', 'Constitución', 'Huancabamba', 'Oxapampa', 'Palcazu', 'Pozuzo', 'Puerto Bermúdez', 'Villa Rica'],
        'Pasco': ['Chaupimarca', 'Huachon', 'Huariaca', 'Huayllay', 'Ninacaca', 'Pallanchacra', 'Paucartambo', 'San Francisco de Asís de Yarusyacan', 'Simon Bolívar', 'Ticlacayan', 'Tinyahuarco', 'Vicco', 'Yanacancha']
    },
    'Piura': {
        'Ayabaca': ['Ayabaca', 'Frias', 'Jilili', 'Lagunas', 'Montero', 'Pacaipampa', 'Paimas', 'Sapillica', 'Sicchez', 'Suyo'],
        'Huancabamba': ['Canchaque', 'El Carmen de la Frontera', 'Huancabamba', 'Huarmaca', 'Lalaquiz', 'San Miguel de El Faique', 'Sondor', 'Sondorillo'],
        'Morropón': ['Buenos Aires', 'Chalaco', 'Chulucanas', 'La Matanza', 'Morropon', 'Salitral', 'San Juan de Bigote', 'Santa Catalina de Mossa', 'Santo Domingo', 'Yamango'],
        'Paita': ['Amotape', 'Arenal', 'Colan', 'La Huaca', 'Paita', 'Tamarindo', 'Vichayal'],
        'Piura': ['Castilla', 'Catacaos', 'Cura Mori', 'El Tallan', 'La Arena', 'La Unión', 'Las Lomas', 'Piura', 'Tambo Grande', 'Veintiseis de Octubre'],
        'Sechura': ['Bellavista de la Unión', 'Bernal', 'Cristo Nos Valga', 'Rinconada Llicuar', 'Sechura', 'Vice'],
        'Sullana': ['Bellavista', 'Ignacio Escudero', 'Lancones', 'Marcavelica', 'Miguel Checa', 'Querecotillo', 'Salitral', 'Sullana'],
        'Talara': ['El Alto', 'La Brea', 'Lobitos', 'Los Organos', 'Mancora', 'Pariñas']
    },
    'Puno': {
        'Azángaro': ['Achaya', 'Arapa', 'Asillo', 'Azángaro', 'Caminaca', 'Chupa', 'José Domingo Choquehuanca', 'Muñani', 'Potoni', 'Saman', 'San Anton', 'San José', 'San Juan de Salinas', 'Santiago de Pupuja', 'Tirapata'],
        'Carabaya': ['Ajoyani', 'Ayapata', 'Coasa', 'Corani', 'Crucero', 'Ituata', 'Macusani', 'Ollachea', 'San Gaban', 'Usicayos'],
        'Chucuito': ['Desaguadero', 'Huacullani', 'Juli', 'Kelluyo', 'Pisacoma', 'Pomata', 'Zepita'],
        'El Collao': ['Capazo', 'Conduriri', 'Ilave', 'Pilcuyo', 'Santa Rosa'],
        'Huancané': ['Cojata', 'Huancane', 'Huatasani', 'Inchupalla', 'Pusi', 'Rosaspata', 'Taraco', 'Vilque Chico'],
        'Lampa': ['Cabanilla', 'Calapuja', 'Lampa', 'Nicasio', 'Ocuviri', 'Palca', 'Paratia', 'Pucara', 'Santa Lucia', 'Vilavila'],
        'Melgar': ['Antauta', 'Ayaviri', 'Cupi', 'Llalli', 'Macari', 'Nuñoa', 'Orurillo', 'Santa Rosa', 'Umachiri'],
        'Moho': ['Conima', 'Huayrapata', 'Moho', 'Tilali'],
        'Puno': ['Acora', 'Amantani', 'Atuncolla', 'Capachica', 'Chucuito', 'Coata', 'Huata', 'Mañazo', 'Paucarcolla', 'Pichacani', 'Plateria', 'Puno', 'San Antonio', 'Tiquillaca', 'Vilque'],
        'San Antonio de Putina': ['Ananea', 'Pedro Vilca Apaza', 'Putina', 'Quilcapuncu', 'Sina'],
        'San Román': ['Cabana', 'Cabanillas', 'Caracoto', 'Juliaca', 'San Miguel'],
        'Sandia': ['Alto Inambari', 'Cuyocuyo', 'Limbani', 'Patambuco', 'Phara', 'Quiaca', 'San Juan del Oro', 'San Pedro de Putina Punco', 'Sandia', 'Yanahuaya'],
        'Yunguyo': ['Anapia', 'Copani', 'Cuturapi', 'Ollaraya', 'Tinicachi', 'Unicachi', 'Yunguyo']
    },
    'San Martín': {
        'Bellavista': ['Alto Biavo', 'Bajo Biavo', 'Bellavista', 'Huallaga', 'San Pablo', 'San Rafael'],
        'El Dorado': ['Agua Blanca', 'San José de Sisa', 'San Martín', 'Santa Rosa', 'Shatoja'],
        'Huallaga': ['Alto Saposoa', 'El Eslabón', 'Piscoyacu', 'Sacanche', 'Saposoa', 'Tingo de Saposoa'],
        'Lamas': ['Alonso de Alvarado', 'Barranquita', 'Caynarachi', 'Cuñumbuqui', 'Lamas', 'Pinto Recodo', 'Rumisapa', 'San Roque de Cumbaza', 'Shanao', 'Tabalosos', 'Zapatero'],
        'Mariscal Cáceres': ['Campanilla', 'Huicungo', 'Juanjuí', 'Pachiza', 'Pajarillo'],
        'Moyobamba': ['Calzada', 'Habana', 'Jepelacio', 'Moyobamba', 'Soritor', 'Yantalo'],
        'Picota': ['Buenos Aires', 'Caspisapa', 'Picota', 'Pilluana', 'Pucacaca', 'San Cristóbal', 'San Hilarión', 'Shamboyacu', 'Tingo de Ponasa', 'Tres Unidos'],
        'Rioja': ['Awajun', 'Elías Soplin Vargas', 'Nueva Cajamarca', 'Pardo Miguel', 'Posic', 'Rioja', 'San Fernando', 'Yorongos', 'Yuracyacu'],
        'San Martín': ['Alberto Leveau', 'Cacatachi', 'Chazuta', 'Chipurana', 'El Porvenir', 'Huimbayoc', 'Juan Guerra', 'La Banda de Shilcayo', 'Morales', 'Papaplaya', 'San Antonio', 'Sauce', 'Shapaja', 'Tarapoto'],
        'Tocache': ['Nuevo Progreso', 'Polvora', 'Shunte', 'Tocache', 'Uchiza']
    },
    'Tacna': {
        'Candarave': ['Cairani', 'Camilaca', 'Candarave', 'Curibaya', 'Huanuara', 'Quilahuani'],
        'Jorge Basadre': ['Ilabaya', 'Ite', 'Locumba'],
        'Tacna': ['Alto de la Alianza', 'Calana', 'Ciudad Nueva', 'Coronel Gregorio Albarracín Lanchipa', 'Inclan', 'La Yarada los Palos', 'Pachia', 'Palca', 'Pocollay', 'Sama', 'Tacna'],
        'Tarata': ['Estique', 'Estique-Pampa', 'Héroes Albarracín', 'Sitajara', 'Susapaya', 'Tarata', 'Tarucachi', 'Ticaco']
    },
    'Tumbes': {
        'Contralmirante Villar': ['Canoas de Punta Sal', 'Casitas', 'Zorritos'],
        'Tumbes': ['Corrales', 'La Cruz', 'Pampas de Hospital', 'San Jacinto', 'San Juan de la Virgen', 'Tumbes'],
        'Zarumilla': ['Aguas Verdes', 'Matapalo', 'Papayal', 'Zarumilla']
    },
    'Ucayali': {
        'Atalaya': ['Raymondi', 'Sepahua', 'Tahuania', 'Yurua'],
        'Coronel Portillo': ['Calleria', 'Campoverde', 'Iparia', 'Manantay', 'Masisea', 'Nueva Requena', 'Yarinacocha'],
        'Padre Abad': ['Alexander Von Humboldt', 'Curimana', 'Irazola', 'Neshuya', 'Padre Abad'],
        'Purús': ['Purus']
    }
};

const UBIGEO_PUNTOS = {
    'Amazonas': {
        'Bagua': [[-5.416, -78.438],[-5.639, -78.531],[-5.675, -78.423],[-5.625, -78.475],[-5.164, -78.289],[-5.612, -78.437]],
        'Bongará': [[-5.897, -77.786],[-6.019, -77.952],[-5.843, -77.823],[-5.928, -77.946],[-5.826, -77.969],[-5.941, -77.977],[-5.904, -77.798],[-5.918, -77.789],[-5.966, -77.945],[-5.911, -77.981],[-6.043, -77.919],[-5.735, -77.925]],
        'Chachapoyas': [[-6.032, -77.711],[-6.836, -78.020],[-6.229, -77.873],[-6.256, -77.701],[-6.078, -77.737],[-6.935, -77.854],[-6.106, -77.629],[-6.174, -77.864],[-6.485, -77.815],[-6.707, -77.804],[-6.308, -77.899],[-6.373, -77.902],[-6.594, -77.809],[-6.209, -77.669],[-6.618, -77.802],[-6.024, -77.676],[-6.091, -77.679],[-6.229, -77.740],[-6.337, -77.881],[-6.261, -77.744],[-6.219, -77.775]],
        'Condorcanqui': [[-4.456, -78.159],[-4.592, -77.864],[-4.016, -77.761]],
        'Luya': [[-6.213, -78.320],[-6.614, -78.005],[-6.299, -77.973],[-6.159, -78.142],[-6.239, -77.954],[-6.139, -77.952],[-6.414, -77.968],[-6.230, -77.955],[-6.164, -77.944],[-6.128, -78.085],[-6.429, -77.961],[-6.235, -78.266],[-6.282, -78.211],[-6.453, -78.092],[-6.297, -78.241],[-6.102, -77.960],[-6.647, -77.812],[-6.060, -77.974],[-6.496, -77.862],[-6.114, -78.061],[-6.572, -77.866],[-6.380, -77.906],[-6.152, -77.981]],
        'Rodríguez de Mendoza': [[-6.523, -77.442],[-6.407, -77.585],[-6.431, -77.537],[-6.498, -77.499],[-6.386, -77.547],[-6.386, -77.504],[-6.500, -77.436],[-6.468, -77.396],[-6.395, -77.482],[-6.454, -77.455],[-6.493, -77.472],[-6.151, -77.304]],
        'Utcubamba': [[-5.755, -78.443],[-5.736, -78.427],[-5.936, -78.664],[-5.638, -78.558],[-5.894, -78.238],[-6.096, -78.422],[-6.051, -78.529]]
    },
    'Áncash': {
        'Aija': [[-9.780, -77.611],[-9.821, -77.719],[-9.798, -77.675],[-9.736, -77.616],[-9.823, -77.650]],
        'Antonio Raymondi': [[-9.152, -76.989],[-9.060, -77.058],[-9.119, -76.992],[-9.101, -77.017],[-9.079, -77.093],[-9.175, -77.003]],
        'Asunción': [[-9.115, -77.368],[-9.162, -77.366]],
        'Bolognesi': [[-10.299, -77.146],[-10.157, -77.471],[-10.074, -77.145],[-10.155, -77.440],[-10.339, -77.169],[-10.152, -77.156],[-10.312, -77.615],[-9.899, -76.942],[-10.123, -77.147],[-10.245, -77.435],[-10.336, -77.125],[-10.369, -77.103],[-10.234, -77.072],[-10.285, -77.199],[-10.253, -77.191]],
        'Carhuaz': [[-9.295, -77.625],[-9.239, -77.647],[-9.358, -77.599],[-9.262, -77.692],[-9.281, -77.647],[-9.323, -77.604],[-9.365, -77.581],[-9.368, -77.564],[-9.232, -77.625],[-9.271, -77.677],[-9.377, -77.592]],
        'Carlos Fermín Fitzcarrald': [[-9.094, -77.329],[-8.976, -77.189],[-8.991, -77.291]],
        'Casma': [[-9.432, -78.207],[-9.476, -78.306],[-9.463, -78.385],[-9.511, -77.996]],
        'Corongo': [[-8.523, -77.878],[-8.602, -77.997],[-8.571, -77.899],[-8.513, -77.865],[-8.661, -77.901],[-8.619, -77.865],[-8.614, -77.969]],
        'Huaraz': [[-9.495, -77.859],[-9.595, -77.809],[-9.724, -77.819],[-9.530, -77.529],[-9.514, -77.532],[-9.401, -77.578],[-9.633, -77.741],[-9.667, -77.466],[-9.655, -77.826],[-9.559, -77.891],[-9.581, -77.707],[-9.394, -77.575]],
        'Huari': [[-9.235, -76.926],[-9.326, -77.157],[-9.589, -77.178],[-9.316, -76.939],[-9.201, -76.787],[-9.410, -77.100],[-9.452, -77.177],[-9.347, -77.171],[-9.366, -77.096],[-9.152, -76.899],[-9.326, -77.004],[-9.359, -77.079],[-9.203, -76.759],[-9.524, -77.157],[-9.403, -77.011],[-9.188, -76.928]],
        'Huarmey': [[-9.987, -77.646],[-9.950, -78.222],[-10.069, -78.152],[-9.875, -77.708],[-9.930, -77.658]],
        'Huaylas': [[-9.049, -77.805],[-8.819, -77.863],[-9.016, -77.861],[-8.873, -77.893],[-8.961, -77.843],[-9.073, -77.982],[-9.110, -77.802],[-8.952, -77.815],[-8.864, -77.915],[-8.738, -77.904]],
        'Mariscal Luzuriaga': [[-8.856, -77.399],[-8.902, -77.244],[-8.806, -77.280],[-8.915, -77.301],[-8.961, -77.368],[-8.919, -77.411],[-8.906, -77.339],[-8.865, -77.358]],
        'Ocros': [[-10.457, -77.328],[-10.354, -77.199],[-10.498, -77.243],[-10.537, -77.423],[-10.338, -77.443],[-10.393, -77.191],[-10.403, -77.397],[-10.387, -77.219],[-10.372, -77.487],[-10.439, -77.366]],
        'Pallasca': [[-8.351, -78.051],[-8.393, -78.009],[-8.269, -77.853],[-8.306, -78.005],[-8.331, -77.975],[-8.260, -77.898],[-8.514, -78.042],[-8.253, -77.999],[-8.195, -77.896],[-8.528, -78.067],[-8.470, -78.038]],
        'Pomabamba': [[-8.858, -77.436],[-8.696, -77.430],[-8.821, -77.460],[-8.697, -77.398]],
        'Recuay': [[-9.802, -77.431],[-9.993, -77.588],[-10.056, -77.537],[-10.069, -77.622],[-10.089, -77.474],[-10.115, -77.398],[-10.050, -77.654],[-9.722, -77.456],[-10.010, -77.569],[-9.761, -77.443]],
        'Santa': [[-9.013, -78.138],[-9.042, -78.608],[-9.023, -78.616],[-8.760, -78.061],[-9.139, -78.183],[-9.173, -78.361],[-9.129, -78.531],[-9.262, -78.496],[-8.988, -78.613]],
        'Sihuas': [[-8.326, -77.582],[-8.456, -77.427],[-8.561, -77.653],[-8.339, -77.597],[-8.535, -77.567],[-8.395, -77.491],[-8.532, -77.666],[-8.646, -77.582],[-8.623, -77.536],[-8.554, -77.631]],
        'Yungay': [[-9.226, -77.717],[-9.190, -77.712],[-9.177, -77.747],[-9.329, -78.042],[-9.173, -77.722],[-9.217, -77.694],[-9.021, -77.471],[-9.140, -77.745]]
    },
    'Apurímac': {
        'Abancay': [[-13.629, -72.886],[-13.941, -72.991],[-13.878, -72.876],[-13.541, -72.696],[-13.492, -72.933],[-13.871, -72.770],[-13.861, -73.073],[-13.514, -72.814],[-13.622, -72.873]],
        'Andahuaylas': [[-13.656, -73.390],[-13.528, -73.366],[-13.867, -73.669],[-13.645, -73.086],[-13.757, -73.528],[-14.051, -73.609],[-13.734, -73.351],[-13.533, -73.288],[-13.691, -73.119],[-13.615, -73.084],[-13.609, -73.344],[-14.187, -73.545],[-14.084, -73.591],[-13.773, -73.603],[-13.652, -73.366],[-13.961, -73.608],[-13.658, -73.494],[-13.654, -73.429],[-14.053, -73.566],[-13.786, -73.474]],
        'Antabamba': [[-14.365, -72.877],[-14.209, -73.058],[-14.339, -72.895],[-14.428, -72.915],[-14.261, -72.564],[-14.223, -73.016],[-14.313, -72.945]],
        'Aymaraes': [[-14.118, -73.321],[-14.378, -73.161],[-14.294, -73.245],[-13.975, -73.065],[-14.006, -73.254],[-14.416, -73.205],[-14.133, -73.268],[-14.148, -73.174],[-13.950, -73.226],[-14.218, -73.087],[-13.924, -73.182],[-14.204, -73.347],[-14.165, -73.315],[-14.141, -73.140],[-13.959, -73.185],[-14.053, -73.294],[-14.225, -73.160]],
        'Chincheros': [[-13.530, -73.674],[-13.518, -73.723],[-13.611, -73.741],[-13.397, -73.593],[-13.388, -73.689],[-13.435, -73.822],[-13.482, -73.560],[-13.403, -73.668],[-13.533, -73.606],[-13.441, -73.600],[-13.672, -73.669]],
        'Cotabambas': [[-14.119, -72.247],[-13.746, -72.355],[-13.837, -72.432],[-14.214, -72.189],[-14.087, -72.102],[-13.946, -72.175]],
        'Grau': [[-14.105, -72.708],[-14.062, -72.568],[-14.063, -72.671],[-13.872, -72.508],[-13.928, -72.484],[-14.229, -72.591],[-14.115, -72.614],[-14.178, -72.672],[-14.072, -72.477],[-14.169, -72.623],[-14.140, -72.657],[-14.228, -72.623],[-14.078, -72.625],[-14.250, -72.681]]
    },
    'Arequipa': {
        'Arequipa': [[-16.380, -71.521],[-16.393, -71.529],[-16.363, -71.544],[-16.376, -71.561],[-16.469, -71.484],[-16.404, -71.392],[-16.441, -71.559],[-16.427, -71.524],[-16.423, -71.818],[-16.407, -71.506],[-16.395, -71.522],[-16.487, -71.467],[-16.433, -71.505],[-16.518, -71.390],[-16.566, -71.368],[-16.557, -71.451],[-16.457, -71.495],[-16.424, -71.566],[-16.346, -72.128],[-16.184, -71.062],[-16.321, -72.099],[-16.494, -72.095],[-16.468, -71.529],[-16.449, -71.592],[-16.425, -71.672],[-16.466, -71.936],[-16.382, -71.536],[-16.547, -71.476],[-16.247, -71.706]],
        'Camaná': [[-16.625, -72.711],[-16.602, -72.727],[-16.031, -73.174],[-16.620, -72.736],[-16.573, -72.716],[-16.432, -73.105],[-16.717, -72.426],[-16.614, -72.699]],
        'Caravelí': [[-15.436, -74.616],[-16.208, -73.624],[-15.796, -74.364],[-15.451, -74.658],[-15.503, -73.480],[-15.773, -73.366],[-15.866, -74.248],[-15.805, -73.967],[-15.659, -74.091],[-15.479, -74.444],[-15.570, -74.851],[-15.625, -73.798],[-15.662, -74.527]],
        'Castilla': [[-15.499, -72.356],[-16.076, -72.492],[-15.683, -72.272],[-15.501, -72.271],[-15.286, -72.377],[-15.577, -72.129],[-16.096, -72.472],[-15.650, -72.506],[-15.262, -72.342],[-15.713, -72.574],[-15.723, -72.502],[-15.729, -72.432],[-16.224, -72.470],[-15.658, -72.525]],
        'Caylloma': [[-15.660, -71.704],[-15.620, -71.982],[-15.506, -71.445],[-15.189, -71.773],[-15.640, -71.604],[-15.627, -71.646],[-15.729, -72.110],[-16.034, -71.878],[-15.650, -71.687],[-15.618, -71.772],[-16.016, -72.014],[-15.641, -71.768],[-15.608, -71.808],[-16.353, -72.247],[-15.839, -71.091],[-15.486, -71.457],[-15.578, -71.940],[-15.347, -71.446],[-15.533, -71.553],[-15.648, -71.661]],
        'Condesuyos': [[-15.797, -72.861],[-14.672, -72.022],[-15.548, -72.919],[-15.839, -72.652],[-15.854, -72.630],[-15.940, -73.131],[-15.504, -72.834],[-15.776, -72.876]],
        'Islay': [[-17.091, -71.774],[-17.145, -71.827],[-17.001, -72.097],[-17.101, -71.907],[-17.029, -72.016],[-17.156, -71.785]],
        'La Uniòn': [[-15.134, -72.765],[-15.241, -73.071],[-15.213, -72.889],[-15.175, -72.850],[-15.182, -72.905],[-15.059, -72.692],[-15.274, -73.022],[-15.320, -73.222],[-15.354, -73.233],[-15.173, -72.830],[-15.264, -72.928]]
    },
    'Ayacucho': {
        'Cangallo': [[-13.629, -74.144],[-13.585, -74.352],[-13.557, -74.195],[-13.605, -74.236],[-13.553, -74.628],[-13.568, -74.523]],
        'Huamanga': [[-13.219, -74.042],[-13.113, -74.100],[-13.163, -74.214],[-13.160, -74.225],[-13.179, -74.221],[-13.273, -74.206],[-13.154, -74.213],[-13.391, -73.916],[-13.057, -74.216],[-13.049, -74.139],[-13.132, -74.333],[-13.167, -74.224],[-13.086, -74.393],[-13.215, -74.289],[-13.195, -74.111],[-13.242, -74.354]],
        'Huanca Sancos': [[-13.838, -74.316],[-13.943, -74.313],[-13.920, -74.334],[-13.844, -74.372]],
        'Huanta': [[-12.594, -74.331],[-12.282, -74.023],[-12.784, -74.206],[-13.011, -74.173],[-12.939, -74.248],[-12.992, -74.209],[-12.410, -73.906],[-12.900, -74.274],[-12.421, -74.489],[-12.766, -74.253],[-12.512, -73.859],[-12.761, -74.146]],
        'La Mar': [[-12.864, -73.582],[-13.060, -73.707],[-12.624, -73.789],[-13.171, -73.906],[-13.222, -73.622],[-13.229, -73.894],[-13.381, -73.436],[-12.768, -73.656],[-13.013, -73.981],[-12.688, -73.736],[-12.948, -74.021]],
        'Lucanas': [[-14.281, -73.975],[-14.288, -73.967],[-14.388, -73.962],[-14.979, -73.838],[-14.366, -73.876],[-14.132, -74.942],[-14.286, -74.843],[-14.729, -74.670],[-14.244, -74.920],[-14.623, -74.233],[-14.399, -74.823],[-14.490, -74.687],[-14.694, -74.124],[-14.940, -74.417],[-14.743, -74.222],[-14.652, -74.199],[-14.767, -74.098],[-14.412, -74.651],[-15.063, -73.952],[-14.226, -73.957],[-14.978, -74.524]],
        'Parinacochas': [[-15.094, -73.748],[-15.017, -73.781],[-14.807, -73.282],[-14.950, -73.368],[-15.210, -73.827],[-15.247, -73.569],[-14.997, -73.351],[-14.907, -73.397]],
        'Pàucar del Sara Sara': [[-15.163, -73.294],[-15.263, -73.200],[-15.185, -73.349],[-15.150, -73.342],[-15.180, -73.185],[-15.217, -73.465],[-15.279, -73.344],[-15.057, -73.322],[-15.225, -73.227],[-15.245, -73.453]],
        'Sucre': [[-13.809, -73.757],[-13.848, -73.754],[-13.883, -73.727],[-14.172, -73.886],[-14.109, -73.872],[-14.038, -73.642],[-14.012, -73.839],[-14.169, -73.573],[-13.968, -73.735],[-14.044, -73.638],[-14.114, -73.604]],
        'Víctor Fajardo': [[-13.657, -74.147],[-14.013, -73.932],[-14.055, -73.909],[-13.923, -73.905],[-13.795, -73.989],[-13.713, -74.034],[-13.850, -73.951],[-13.729, -74.272],[-13.752, -74.067],[-13.719, -74.103],[-13.673, -74.320],[-13.611, -74.532]],
        'Vilcas Huamán': [[-13.801, -73.904],[-13.742, -73.787],[-13.533, -73.875],[-13.750, -73.932],[-13.853, -73.877],[-13.696, -73.759],[-13.652, -73.954],[-13.589, -73.995]]
    },
    'Cajamarca': {
        'Cajabamba': [[-7.449, -78.269],[-7.623, -78.046],[-7.574, -78.070],[-7.519, -77.969]],
        'Cajamarca': [[-7.325, -78.519],[-7.155, -78.511],[-7.147, -78.673],[-7.427, -78.542],[-7.087, -78.344],[-7.249, -78.379],[-7.194, -78.427],[-7.164, -78.464],[-7.251, -78.660],[-7.255, -78.260],[-7.203, -78.325],[-7.292, -78.498]],
        'Celendín': [[-6.867, -78.143],[-6.603, -78.200],[-6.513, -78.329],[-6.838, -78.245],[-6.941, -78.092],[-6.926, -78.133],[-6.724, -78.282],[-6.650, -78.233],[-7.042, -78.068],[-6.912, -78.255],[-6.943, -78.135],[-6.896, -78.063]],
        'Chota': [[-6.342, -78.605],[-6.471, -78.419],[-6.503, -78.480],[-6.428, -78.721],[-6.252, -78.479],[-6.371, -78.412],[-6.560, -78.647],[-6.474, -78.886],[-6.445, -78.656],[-6.453, -78.961],[-6.561, -78.735],[-6.514, -79.120],[-6.404, -79.284],[-6.497, -78.424],[-6.178, -78.483],[-6.360, -79.034],[-6.424, -79.242],[-6.393, -78.611],[-6.413, -79.361]],
        'Contumazá': [[-7.221, -78.840],[-7.367, -78.805],[-7.349, -79.030],[-7.384, -78.896],[-7.425, -78.927],[-7.344, -78.837],[-7.301, -78.933],[-7.253, -79.131]],
        'Cutervo': [[-6.181, -78.911],[-5.900, -78.694],[-6.107, -78.574],[-6.377, -78.818],[-6.253, -78.576],[-6.062, -78.759],[-6.274, -79.038],[-6.239, -78.713],[-6.163, -78.598],[-6.294, -78.604],[-6.095, -78.853],[-6.245, -78.855],[-6.151, -78.682],[-6.315, -78.699],[-6.004, -78.698]],
        'Hualgayoc': [[-6.680, -78.519],[-6.671, -78.738],[-6.765, -78.608]],
        'Jaén': [[-5.668, -78.677],[-5.646, -79.088],[-5.979, -79.069],[-5.612, -78.900],[-5.709, -78.809],[-5.627, -78.853],[-5.931, -79.229],[-6.041, -79.128],[-5.658, -79.315],[-5.770, -79.314],[-5.465, -79.018],[-5.434, -78.567]],
        'San Ignacio': [[-5.306, -78.898],[-5.272, -78.776],[-5.393, -78.906],[-5.004, -79.087],[-5.146, -79.005],[-5.103, -78.914],[-5.316, -79.283]],
        'San Marcos': [[-7.388, -78.123],[-7.464, -78.130],[-7.274, -78.160],[-7.369, -78.130],[-7.349, -78.048],[-7.251, -78.037],[-7.336, -78.170]],
        'San Miguel': [[-6.977, -79.178],[-6.980, -78.850],[-6.802, -78.779],[-7.034, -79.011],[-6.869, -79.126],[-6.981, -78.808],[-6.959, -79.243],[-6.927, -79.130],[-7.057, -79.095],[-7.000, -78.850],[-6.978, -78.774],[-6.758, -78.825],[-7.047, -79.061]],
        'San Pablo': [[-7.168, -78.829],[-7.157, -78.868],[-7.119, -78.823],[-7.025, -78.740]],
        'Santa Cruz': [[-6.663, -78.817],[-6.674, -79.033],[-6.576, -78.868],[-6.593, -78.896],[-6.650, -78.787],[-6.739, -78.920],[-6.626, -78.944],[-6.691, -78.916],[-6.564, -79.051],[-6.607, -78.794],[-6.677, -78.819]]
    },
    'Callao': {
        'Prov. Const. del Callao': [[-12.063, -77.129],[-12.063, -77.147],[-12.039, -77.090],[-12.066, -77.108],[-12.073, -77.163],[-11.855, -77.125],[-11.877, -77.128]]
    },
    'Cusco': {
        'Acomayo': [[-13.919, -71.684],[-14.057, -71.493],[-13.951, -71.738],[-14.120, -71.473],[-14.034, -71.574],[-13.779, -71.782],[-13.947, -71.603]],
        'Anta': [[-13.457, -72.301],[-13.458, -72.147],[-13.478, -72.069],[-13.630, -72.233],[-13.416, -72.207],[-13.480, -72.443],[-13.509, -72.528],[-13.479, -72.111],[-13.456, -72.256]],
        'Calca': [[-13.321, -71.956],[-13.386, -71.898],[-13.364, -71.921],[-13.104, -72.045],[-13.421, -71.851],[-13.492, -71.779],[-13.428, -71.867],[-12.682, -72.277]],
        'Canas': [[-14.473, -71.395],[-14.535, -71.307],[-14.432, -71.273],[-14.494, -71.156],[-14.148, -71.460],[-14.380, -71.456],[-14.164, -71.476],[-14.217, -71.432]],
        'Canchis': [[-14.025, -71.454],[-14.102, -71.430],[-14.357, -71.169],[-13.980, -71.418],[-14.202, -71.315],[-14.186, -71.343],[-14.238, -71.231],[-14.145, -71.407]],
        'Chumbivilcas': [[-14.007, -72.002],[-14.303, -71.852],[-14.285, -72.040],[-14.313, -71.690],[-14.338, -72.114],[-14.311, -72.139],[-14.453, -72.082],[-14.509, -71.881]],
        'Cusco': [[-13.585, -72.059],[-13.519, -71.977],[-13.494, -72.045],[-13.544, -71.884],[-13.530, -71.937],[-13.526, -71.983],[-13.570, -71.828],[-13.521, -71.967]],
        'Espinar': [[-14.777, -71.251],[-15.301, -71.138],[-14.800, -71.532],[-14.793, -71.413],[-15.052, -71.129],[-14.890, -71.210],[-14.678, -71.406],[-15.009, -71.643]],
        'La Convención': [[-12.768, -72.576],[-13.005, -72.554],[-13.290, -73.266],[-12.620, -73.789],[-12.963, -72.665],[-11.720, -72.946],[-12.872, -72.447],[-12.519, -73.829],[-12.637, -72.557],[-12.863, -72.693],[-13.131, -72.594],[-13.063, -72.934],[-12.919, -73.528],[-13.003, -73.513]],
        'Paruro': [[-13.971, -71.831],[-13.853, -72.082],[-13.852, -71.803],[-13.682, -72.018],[-14.069, -71.738],[-13.756, -71.957],[-13.762, -71.848],[-13.954, -71.761],[-13.665, -71.921]],
        'Paucartambo': [[-13.597, -71.697],[-13.215, -71.649],[-13.360, -71.674],[-13.503, -71.654],[-12.909, -71.403],[-13.318, -71.597]],
        'Quispicanchi': [[-13.673, -71.678],[-13.231, -70.754],[-13.595, -71.400],[-13.605, -71.564],[-13.907, -71.502],[-13.690, -71.640],[-13.634, -71.737],[-13.592, -70.975],[-13.627, -71.388],[-13.594, -71.763],[-13.822, -71.543],[-13.688, -71.625]],
        'Urubamba': [[-13.392, -72.049],[-13.338, -72.065],[-13.154, -72.526],[-13.332, -72.156],[-13.259, -72.263],[-13.306, -72.116],[-13.322, -72.084]]
    },
    'Huancavelica': {
        'Acobamba': [[-12.843, -74.569],[-12.694, -74.623],[-12.812, -74.638],[-12.917, -74.466],[-12.890, -74.398],[-12.730, -74.666],[-12.874, -74.532],[-12.721, -74.582]],
        'Angaraes': [[-12.913, -74.691],[-12.867, -74.623],[-12.925, -74.770],[-12.973, -74.367],[-12.956, -74.492],[-12.919, -74.610],[-12.943, -74.702],[-13.015, -74.444],[-12.983, -74.718],[-13.076, -74.412],[-13.113, -74.419],[-13.051, -74.484]],
        'Castrovirreyna': [[-13.126, -75.542],[-13.035, -75.570],[-13.293, -75.543],[-13.283, -75.318],[-13.037, -75.608],[-13.276, -75.373],[-13.220, -75.534],[-13.094, -75.677],[-13.311, -75.410],[-13.204, -75.634],[-13.072, -75.140],[-13.074, -75.645],[-13.383, -75.433]],
        'Churcampa': [[-12.682, -74.587],[-12.517, -74.546],[-12.739, -74.387],[-12.573, -74.658],[-12.727, -74.481],[-12.788, -74.359],[-12.740, -74.442],[-12.516, -74.527],[-12.554, -74.532],[-12.806, -74.390],[-12.578, -74.412]],
        'Huancavelica': [[-12.664, -75.324],[-12.643, -74.862],[-12.785, -74.977],[-12.520, -75.007],[-12.433, -75.039],[-13.032, -74.947],[-12.787, -74.971],[-12.564, -74.948],[-12.409, -75.178],[-12.500, -74.998],[-12.561, -75.037],[-12.621, -75.211],[-12.534, -74.933],[-12.423, -75.154],[-12.595, -75.020],[-12.657, -74.980],[-12.401, -75.084],[-12.477, -75.183],[-12.769, -74.851]],
        'Huaytará': [[-13.703, -75.351],[-14.041, -75.185],[-13.534, -75.314],[-13.605, -75.353],[-13.949, -75.036],[-14.008, -75.022],[-13.330, -74.977],[-13.979, -74.977],[-13.529, -75.328],[-13.502, -75.293],[-13.795, -75.249],[-13.956, -75.238],[-13.825, -75.257],[-14.056, -74.976],[-13.737, -75.244],[-13.689, -75.275]],
        'Tayacaja': [[-12.366, -75.055],[-12.406, -74.901],[-12.408, -74.891],[-12.315, -74.635],[-12.409, -74.679],[-12.389, -74.859],[-12.048, -74.595],[-12.280, -74.938],[-12.329, -75.069],[-12.399, -74.868],[-12.259, -75.071],[-12.236, -74.939],[-12.473, -74.767],[-12.244, -74.777],[-12.217, -74.490],[-12.202, -74.781],[-12.104, -74.752],[-12.094, -74.864],[-12.314, -74.890],[-12.116, -74.631],[-12.152, -74.544]]
    },
    'Huánuco': {
        'Ambo': [[-10.129, -76.204],[-10.273, -76.388],[-10.268, -76.415],[-10.036, -76.217],[-10.159, -76.237],[-10.343, -76.292],[-10.338, -76.182],[-10.078, -76.213]],
        'Dos de Mayo': [[-9.676, -76.705],[-9.838, -76.804],[-9.607, -76.707],[-9.707, -76.771],[-9.600, -76.726],[-9.829, -76.803],[-9.731, -76.783],[-9.757, -76.775],[-9.714, -76.750]],
        'Huacaybamba': [[-8.885, -77.123],[-9.095, -76.836],[-9.038, -76.953],[-8.925, -77.015]],
        'Huamalíes': [[-9.171, -76.751],[-9.423, -76.771],[-9.540, -76.737],[-9.247, -76.719],[-9.550, -76.819],[-9.494, -76.819],[-9.280, -76.397],[-9.462, -76.820],[-9.501, -76.884],[-9.389, -76.813],[-9.393, -76.720]],
        'Huánuco': [[-9.940, -76.241],[-9.802, -76.071],[-9.826, -76.134],[-9.930, -76.240],[-10.005, -76.523],[-9.961, -76.249],[-9.905, -76.392],[-9.981, -76.284],[-9.786, -75.999],[-10.056, -76.486],[-9.863, -76.170],[-9.986, -76.506],[-10.004, -76.469]],
        'Lauricocha': [[-10.076, -76.736],[-10.078, -76.631],[-10.023, -76.680],[-10.181, -76.803],[-9.984, -76.688],[-9.976, -76.677],[-10.143, -76.626]],
        'Leoncio Prado': [[-9.280, -76.009],[-9.188, -75.955],[-9.206, -75.836],[-8.932, -76.116],[-9.248, -75.994],[-9.443, -75.971],[-8.750, -76.121],[-9.079, -76.061],[-9.298, -76.001],[-9.024, -76.067]],
        'Marañón': [[-8.656, -76.875],[-8.605, -77.149],[-8.794, -76.250],[-8.768, -77.186],[-8.653, -76.315]],
        'Pachitea': [[-9.845, -75.903],[-9.911, -76.017],[-9.898, -75.994],[-9.864, -76.044]],
        'Puerto Inca': [[-9.670, -75.463],[-8.769, -74.709],[-9.379, -74.966],[-8.934, -74.701],[-9.628, -74.975]],
        'Yarowilca': [[-9.748, -76.648],[-9.853, -76.631],[-9.900, -76.611],[-9.859, -76.609],[-9.910, -76.606],[-9.886, -76.503],[-9.795, -76.666],[-9.705, -76.703]]
    },
    'Ica': {
        'Chincha': [[-13.443, -76.083],[-13.076, -75.913],[-13.418, -76.132],[-13.459, -76.166],[-13.499, -76.058],[-13.398, -76.156],[-13.404, -76.127],[-13.211, -75.787],[-13.049, -75.648],[-13.428, -76.164],[-13.461, -76.177]],
        'Ica': [[-14.064, -75.729],[-14.033, -75.711],[-14.096, -75.691],[-14.347, -75.672],[-14.152, -75.692],[-14.054, -75.686],[-14.127, -75.706],[-13.986, -75.772],[-13.933, -75.671],[-14.011, -75.735],[-14.186, -75.714],[-14.019, -75.758],[-14.156, -75.708],[-14.099, -75.477]],
        'Nasca': [[-14.665, -75.222],[-14.645, -75.058],[-15.362, -75.166],[-14.827, -74.937],[-14.846, -74.944]],
        'Palpa': [[-14.563, -75.207],[-14.534, -75.185],[-14.520, -75.201],[-14.483, -75.246],[-14.094, -75.172]],
        'Pisco': [[-13.601, -75.619],[-13.723, -75.887],[-13.694, -76.025],[-13.839, -76.252],[-13.710, -76.202],[-13.731, -76.223],[-13.680, -76.157],[-13.713, -76.148]]
    },
    'Junín': {
        'Chanchamayo': [[-11.057, -75.328],[-10.947, -75.225],[-10.926, -74.873],[-10.888, -75.287],[-11.121, -75.353],[-11.210, -75.335]],
        'Chupaca': [[-12.086, -75.321],[-12.134, -75.268],[-12.058, -75.289],[-12.021, -75.341],[-12.081, -75.242],[-12.098, -75.293],[-12.126, -75.436],[-12.110, -75.246],[-12.201, -75.387]],
        'Concepción': [[-11.958, -75.368],[-11.728, -74.802],[-12.027, -75.375],[-11.660, -75.102],[-11.718, -75.082],[-11.919, -75.313],[-11.836, -75.291],[-12.016, -75.346],[-11.619, -75.090],[-11.894, -75.344],[-11.937, -75.339],[-11.898, -75.318],[-11.967, -75.308],[-12.086, -75.536],[-11.877, -75.295]],
        'Huancayo': [[-12.355, -75.201],[-12.345, -75.248],[-12.296, -75.299],[-12.087, -75.208],[-12.312, -75.289],[-12.156, -75.246],[-12.318, -75.222],[-12.221, -75.167],[-12.050, -75.221],[-12.171, -75.221],[-11.971, -75.251],[-12.107, -75.217],[-12.071, -75.209],[-12.332, -75.282],[-12.139, -75.224],[-11.891, -75.266],[-11.980, -74.897],[-12.049, -75.251],[-12.172, -75.146],[-11.890, -75.286],[-11.938, -75.260],[-11.990, -75.244],[-11.949, -75.282],[-11.769, -74.795],[-11.959, -75.259],[-12.141, -75.158],[-12.015, -75.280],[-12.160, -75.232]],
        'Jauja': [[-11.731, -75.547],[-11.855, -75.354],[-11.803, -75.439],[-11.802, -75.718],[-11.785, -75.675],[-11.822, -75.392],[-11.807, -75.424],[-11.808, -75.471],[-11.760, -75.470],[-11.764, -75.610],[-11.776, -75.501],[-11.759, -75.435],[-11.859, -75.418],[-11.818, -75.624],[-11.741, -75.561],[-11.785, -75.426],[-11.786, -75.382],[-11.738, -75.446],[-11.361, -75.327],[-11.833, -75.435],[-11.814, -75.454],[-11.709, -75.518],[-11.854, -75.506],[-11.749, -75.486],[-11.801, -75.543],[-11.739, -75.623],[-11.539, -75.527],[-11.846, -75.382],[-11.726, -75.486],[-11.794, -75.485],[-11.891, -75.387],[-11.730, -75.571],[-11.715, -75.472],[-11.781, -75.500]],
        'Junín': [[-10.923, -76.058],[-11.161, -75.998],[-11.084, -76.147],[-10.967, -75.878]],
        'Satipo': [[-11.291, -74.627],[-11.381, -74.590],[-11.325, -74.530],[-11.404, -74.752],[-11.428, -74.489],[-11.209, -74.659],[-11.148, -74.306],[-11.254, -74.636],[-12.186, -74.027]],
        'Tarma': [[-11.353, -75.659],[-11.512, -75.653],[-11.265, -75.650],[-11.377, -75.752],[-11.346, -75.569],[-11.296, -75.773],[-11.249, -75.863],[-11.390, -75.564],[-11.420, -75.688]],
        'Yauli': [[-11.733, -75.756],[-11.723, -75.905],[-11.522, -75.908],[-11.407, -76.336],[-11.587, -76.063],[-11.473, -75.961],[-11.204, -76.286],[-11.549, -75.940],[-11.787, -75.936],[-11.666, -76.086]]
    },
    'La Libertad': {
        'Ascope': [[-7.714, -79.107],[-7.745, -79.188],[-7.843, -79.144],[-7.791, -79.223],[-7.876, -79.296],[-7.735, -79.303],[-7.702, -79.438],[-7.958, -79.244]],
        'Bolívar': [[-7.440, -77.693],[-7.154, -77.702],[-7.547, -77.600],[-7.044, -77.872],[-7.047, -77.806],[-7.165, -77.859]],
        'Chepén': [[-7.228, -79.429],[-7.171, -79.486],[-7.183, -79.520]],
        'Gran Chimú': [[-7.479, -78.820],[-7.641, -78.552],[-7.698, -78.626],[-7.596, -78.465]],
        'Julcán': [[-8.170, -78.412],[-8.113, -78.608],[-8.225, -78.414],[-8.043, -78.486]],
        'Otuzco': [[-7.982, -78.547],[-7.824, -78.448],[-7.690, -78.442],[-7.919, -78.705],[-8.029, -78.535],[-7.902, -78.566],[-7.885, -78.709],[-8.003, -78.604],[-7.852, -78.754],[-7.815, -78.417]],
        'Pacasmayo': [[-7.244, -79.470],[-7.338, -79.563],[-7.401, -79.572],[-7.350, -79.455],[-7.418, -79.515]],
        'Pataz': [[-8.127, -77.395],[-8.124, -77.515],[-8.457, -77.298],[-8.187, -77.344],[-8.004, -77.592],[-8.208, -76.983],[-8.033, -77.480],[-7.785, -77.594],[-7.872, -77.547],[-8.438, -77.321],[-8.308, -77.424],[-8.275, -77.296],[-8.348, -77.389]],
        'Sánchez Carrión': [[-7.782, -77.868],[-7.806, -77.718],[-7.860, -77.944],[-7.811, -78.047],[-7.706, -78.034],[-7.786, -78.142],[-7.911, -77.906],[-7.699, -77.744]],
        'Santiago de Chuco': [[-8.133, -78.056],[-8.094, -78.149],[-8.171, -77.974],[-8.193, -77.957],[-8.002, -78.310],[-8.120, -78.142],[-8.145, -78.174],[-8.022, -77.730]],
        'Trujillo': [[-8.088, -78.998],[-8.083, -79.023],[-8.080, -79.122],[-8.056, -79.052],[-8.090, -78.960],[-8.171, -79.009],[-8.011, -78.768],[-8.224, -78.976],[-7.977, -78.813],[-8.100, -79.031],[-8.136, -79.043]],
        'Virú': [[-8.541, -78.679],[-8.952, -78.625],[-8.414, -78.753]]
    },
    'Lambayeque': {
        'Chiclayo': [[-6.892, -79.562],[-6.767, -79.851],[-6.643, -79.385],[-6.907, -79.862],[-6.926, -79.866],[-6.763, -79.834],[-6.794, -79.844],[-6.991, -79.623],[-6.878, -79.873],[-6.874, -79.344],[-6.854, -79.306],[-6.736, -79.635],[-6.718, -79.771],[-6.835, -79.936],[-6.770, -79.775],[-6.782, -79.612],[-6.865, -79.819],[-6.882, -79.921],[-6.918, -79.583],[-6.751, -79.701]],
        'Ferreñafe': [[-6.046, -79.265],[-6.639, -79.788],[-6.235, -79.317],[-6.645, -79.739],[-6.566, -79.781],[-6.640, -79.796]],
        'Lambayeque': [[-6.158, -79.648],[-6.474, -79.855],[-6.393, -79.823],[-6.707, -79.895],[-6.548, -79.865],[-6.540, -80.016],[-6.151, -79.714],[-5.988, -79.748],[-6.429, -79.839],[-6.275, -79.607],[-6.769, -79.968],[-6.510, -79.859]]
    },
    'Lima': {
        'Barranca': [[-10.753, -77.765],[-10.675, -77.818],[-10.696, -77.780],[-10.796, -77.716],[-10.802, -77.745]],
        'Cajatambo': [[-10.473, -76.993],[-10.386, -77.079],[-10.621, -77.041],[-10.549, -77.112],[-10.596, -77.167]],
        'Canta': [[-11.621, -76.670],[-11.467, -76.624],[-11.499, -76.749],[-11.407, -76.576],[-11.553, -76.626],[-11.489, -76.662],[-11.695, -76.846]],
        'Cañete': [[-12.779, -76.557],[-12.526, -76.544],[-13.025, -76.479],[-12.518, -76.738],[-12.727, -76.460],[-13.061, -76.353],[-12.971, -76.151],[-12.658, -76.632],[-13.076, -76.317],[-12.866, -76.054],[-12.949, -76.383],[-12.642, -76.649],[-13.051, -76.431],[-13.078, -76.388],[-12.620, -76.640],[-12.860, -76.022]],
        'Huaral': [[-11.234, -76.656],[-11.352, -76.826],[-11.559, -77.180],[-11.563, -77.271],[-11.495, -77.207],[-11.189, -76.952],[-11.238, -76.839],[-11.186, -76.648],[-11.274, -76.822],[-11.195, -76.634],[-11.407, -76.820],[-11.192, -76.780]],
        'Huarochirí': [[-12.081, -76.511],[-11.826, -76.619],[-11.656, -76.516],[-11.706, -76.268],[-12.132, -76.435],[-11.721, -76.589],[-11.656, -76.504],[-12.136, -76.232],[-12.096, -76.389],[-12.126, -76.421],[-11.664, -76.539],[-12.237, -76.326],[-11.845, -76.386],[-11.924, -76.665],[-12.002, -76.475],[-11.744, -76.650],[-11.912, -76.529],[-12.018, -76.392],[-11.683, -76.525],[-12.114, -76.183],[-12.145, -76.213],[-11.759, -76.301],[-11.870, -76.544],[-11.759, -76.596],[-12.131, -76.216],[-12.161, -76.229],[-11.912, -76.539],[-11.902, -76.664],[-12.096, -76.231],[-11.984, -76.525],[-12.219, -76.514],[-11.883, -76.436]],
        'Huaura': [[-10.756, -77.272],[-11.092, -77.628],[-10.918, -76.826],[-11.108, -77.610],[-11.097, -77.613],[-11.070, -77.599],[-11.061, -76.930],[-10.957, -76.933],[-10.949, -76.745],[-11.097, -77.595],[-11.135, -77.194],[-11.023, -77.644]],
        'Lima': [[-11.774, -77.176],[-12.026, -76.921],[-12.149, -77.022],[-12.059, -77.046],[-11.890, -77.027],[-11.975, -76.769],[-12.177, -77.016],[-12.120, -76.814],[-11.957, -77.049],[-12.048, -77.001],[-11.997, -77.055],[-12.076, -77.043],[-12.078, -76.917],[-12.065, -77.031],[-12.045, -77.031],[-12.084, -77.030],[-11.991, -77.071],[-11.936, -76.697],[-12.275, -76.870],[-12.092, -77.067],[-12.122, -77.029],[-12.187, -76.867],[-12.482, -76.797],[-12.078, -77.063],[-11.867, -77.077],[-12.334, -76.824],[-12.365, -76.796],[-12.042, -77.027],[-12.389, -76.781],[-12.107, -76.999],[-12.098, -77.027],[-12.030, -77.010],[-12.164, -76.964],[-12.076, -76.994],[-12.030, -77.058],[-12.092, -77.079],[-12.044, -76.971],[-12.402, -76.773],[-11.787, -77.157],[-12.145, -77.005],[-12.119, -77.022],[-12.213, -76.937],[-12.162, -76.944]],
        'Oyón': [[-10.793, -76.909],[-10.806, -76.979],[-10.863, -77.129],[-10.838, -77.014],[-10.668, -76.773],[-10.811, -76.875]],
        'Yauyos': [[-12.281, -75.786],[-12.591, -76.037],[-12.383, -76.137],[-13.000, -75.837],[-12.813, -75.783],[-12.346, -75.869],[-12.799, -75.891],[-12.914, -75.863],[-12.294, -76.157],[-12.634, -75.890],[-12.811, -75.765],[-12.360, -76.167],[-12.203, -75.799],[-12.899, -75.832],[-12.456, -75.812],[-12.294, -76.139],[-12.347, -75.786],[-12.800, -75.667],[-12.944, -75.777],[-12.274, -75.850],[-12.515, -76.289],[-12.668, -75.949],[-12.308, -76.143],[-12.362, -76.226],[-12.284, -76.147],[-12.454, -76.227],[-12.122, -76.013],[-12.617, -76.162],[-12.238, -75.745],[-12.741, -75.809],[-12.931, -75.780],[-12.224, -75.808],[-12.460, -75.918]]
    },
    'Loreto': {
        'Alto Amazonas': [[-5.833, -76.560],[-5.291, -76.283],[-5.224, -75.675],[-5.513, -75.859],[-6.026, -75.874],[-5.884, -76.128]],
        'Datem del Marañón': [[-3.476, -76.434],[-4.831, -76.555],[-5.249, -77.041],[-4.564, -77.417],[-4.326, -77.216],[-4.651, -76.588]],
        'Loreto': [[-4.501, -73.569],[-4.632, -74.463],[-3.490, -74.782],[-3.805, -75.061],[-4.588, -74.767]],
        'Mariscal Ramón Castilla': [[-3.320, -71.862],[-3.906, -70.517],[-4.020, -71.103],[-4.354, -70.042]],
        'Maynas': [[-3.888, -73.698],[-3.769, -73.260],[-4.002, -73.157],[-3.500, -73.041],[-3.748, -73.244],[-3.423, -72.764],[-3.489, -73.082],[-2.489, -73.676],[-3.729, -73.242],[-3.770, -73.280],[-0.971, -75.174]],
        'Putumayo': [[-2.447, -72.668],[-1.789, -73.413],[-0.373, -74.676],[-2.408, -71.177]],
        'Requena': [[-6.026, -74.094],[-5.405, -74.158],[-5.794, -74.284],[-4.904, -73.671],[-5.750, -74.538],[-5.256, -74.346],[-5.064, -73.857],[-4.725, -73.533],[-6.008, -73.692],[-5.694, -74.138],[-5.149, -72.875]],
        'Ucayali': [[-7.351, -75.010],[-7.117, -75.263],[-7.947, -74.841],[-7.196, -75.294],[-6.393, -75.117],[-6.911, -75.159]]
    },
    'Madre de Dios': {
        'Manu': [[-12.265, -70.910],[-12.994, -70.527],[-12.619, -70.394],[-12.837, -71.365]],
        'Tahuamanu': [[-11.411, -69.487],[-10.945, -69.577],[-11.455, -69.321]],
        'Tambopata': [[-13.101, -70.372],[-12.717, -69.587],[-12.279, -69.150],[-12.594, -69.177]]
    },
    'Moquegua': {
        'General Sánchez Cerro': [[-16.388, -70.730],[-16.649, -71.022],[-16.141, -70.536],[-16.757, -71.179],[-16.324, -70.739],[-16.481, -70.827],[-16.674, -70.971],[-16.625, -71.184],[-16.749, -70.880],[-16.387, -70.856],[-16.195, -70.678]],
        'Ilo': [[-17.623, -71.268],[-17.625, -71.343],[-17.611, -71.340]],
        'Mariscal Nieto': [[-16.809, -70.695],[-16.751, -70.686],[-17.194, -70.933],[-17.182, -70.900],[-16.739, -70.683],[-17.077, -70.844]]
    },
    'Pasco': {
        'Daniel Alcides Carrión': [[-10.434, -76.437],[-10.473, -76.408],[-10.371, -76.443],[-10.439, -76.495],[-10.473, -76.354],[-10.455, -76.463],[-10.479, -76.447],[-10.491, -76.516]],
        'Oxapampa': [[-10.602, -75.439],[-9.856, -75.017],[-10.426, -75.524],[-10.575, -75.405],[-10.184, -75.148],[-10.071, -75.550],[-10.299, -74.937],[-10.739, -75.276]],
        'Pasco': [[-10.682, -76.257],[-10.636, -75.951],[-10.439, -76.192],[-11.002, -76.365],[-10.856, -76.113],[-10.415, -76.236],[-10.774, -75.813],[-10.490, -76.196],[-10.689, -76.316],[-10.535, -76.164],[-10.770, -76.277],[-10.838, -76.238],[-10.663, -76.253]]
    },
    'Piura': {
        'Ayabaca': [[-4.641, -79.715],[-4.932, -79.948],[-4.585, -79.797],[-4.789, -79.845],[-4.632, -79.829],[-4.996, -79.668],[-4.628, -79.946],[-4.779, -79.982],[-4.570, -79.764],[-4.513, -80.002]],
        'Huancabamba': [[-5.376, -79.606],[-5.148, -79.428],[-5.239, -79.450],[-5.568, -79.524],[-5.216, -79.680],[-5.402, -79.606],[-5.316, -79.410],[-5.339, -79.429]],
        'Morropón': [[-5.267, -79.967],[-5.041, -79.796],[-5.097, -80.160],[-5.214, -80.091],[-5.186, -79.969],[-5.342, -79.834],[-5.319, -79.786],[-5.103, -79.885],[-5.029, -79.876],[-5.181, -79.751]],
        'Paita': [[-4.882, -81.015],[-4.884, -81.026],[-4.901, -81.056],[-4.910, -80.961],[-5.093, -81.099],[-4.878, -80.976],[-4.864, -81.073]],
        'Piura': [[-5.201, -80.623],[-5.267, -80.672],[-5.324, -80.666],[-5.409, -80.681],[-5.343, -80.704],[-5.388, -80.737],[-4.650, -80.239],[-5.152, -80.658],[-4.928, -80.337],[-5.179, -80.678]],
        'Sechura': [[-5.440, -80.755],[-5.459, -80.742],[-5.493, -80.741],[-5.464, -80.765],[-5.557, -80.822],[-5.422, -80.776]],
        'Sullana': [[-4.890, -80.680],[-4.846, -80.873],[-4.633, -80.546],[-4.882, -80.704],[-4.900, -80.815],[-4.839, -80.648],[-4.857, -80.681],[-4.891, -80.688]],
        'Talara': [[-4.269, -81.221],[-4.655, -81.306],[-4.457, -81.285],[-4.179, -81.129],[-4.107, -81.054],[-4.579, -81.269]]
    },
    'Puno': {
        'Azángaro': [[-15.285, -70.161],[-15.139, -70.110],[-14.786, -70.354],[-14.908, -70.196],[-15.325, -70.073],[-15.106, -69.987],[-15.034, -70.338],[-14.771, -69.956],[-14.390, -70.105],[-15.292, -70.017],[-14.584, -70.317],[-14.680, -70.160],[-14.991, -70.106],[-15.053, -70.278],[-14.955, -70.403]],
        'Carabaya': [[-14.229, -70.224],[-13.777, -70.323],[-13.989, -70.016],[-13.869, -70.604],[-14.362, -70.024],[-13.876, -70.214],[-14.069, -70.431],[-13.794, -70.472],[-13.438, -70.403],[-14.125, -69.968]],
        'Chucuito': [[-16.564, -69.039],[-16.631, -69.322],[-16.213, -69.459],[-16.727, -69.250],[-16.909, -69.371],[-16.274, -69.293],[-16.497, -69.103]],
        'El Collao': [[-17.184, -69.744],[-16.622, -69.709],[-16.087, -69.638],[-16.111, -69.554],[-16.742, -69.717]],
        'Huancané': [[-15.015, -69.366],[-15.201, -69.768],[-15.059, -69.802],[-15.010, -69.683],[-15.442, -69.930],[-15.235, -69.528],[-15.297, -69.978],[-15.214, -69.689]],
        'Lampa': [[-15.620, -70.346],[-15.311, -70.222],[-15.365, -70.368],[-15.236, -70.261],[-15.114, -70.909],[-15.237, -70.598],[-15.454, -70.600],[-15.042, -70.368],[-15.699, -70.606],[-15.188, -70.660]],
        'Melgar': [[-14.300, -70.292],[-14.882, -70.589],[-14.905, -70.867],[-14.948, -70.881],[-14.772, -70.903],[-14.476, -70.636],[-14.728, -70.512],[-14.607, -70.788],[-14.854, -70.754]],
        'Moho': [[-15.458, -69.438],[-15.321, -69.341],[-15.360, -69.500],[-15.515, -69.348]],
        'Puno': [[-15.974, -69.798],[-15.657, -69.718],[-15.688, -70.144],[-15.642, -69.831],[-15.895, -69.889],[-15.571, -69.951],[-15.615, -69.971],[-15.801, -70.343],[-15.746, -70.056],[-16.150, -70.063],[-15.948, -69.833],[-15.840, -70.028],[-16.141, -70.344],[-15.797, -70.187],[-15.767, -70.259]],
        'San Antonio de Putina': [[-14.679, -69.535],[-15.064, -69.882],[-14.914, -69.869],[-14.894, -69.730],[-14.497, -69.280]],
        'San Román': [[-15.649, -70.322],[-15.644, -70.354],[-15.568, -70.103],[-15.484, -70.133],[-15.460, -70.127]],
        'Sandia': [[-14.090, -69.243],[-14.470, -69.537],[-14.150, -69.691],[-14.362, -69.619],[-14.152, -69.665],[-14.422, -69.345],[-14.221, -69.154],[-14.113, -69.048],[-14.322, -69.466],[-14.259, -69.169]],
        'Yunguyo': [[-16.314, -68.853],[-16.400, -69.040],[-16.271, -69.177],[-16.220, -68.991],[-16.199, -68.962],[-16.224, -68.981],[-16.227, -69.096]]
    },
    'San Martín': {
        'Bellavista': [[-7.256, -76.477],[-7.102, -76.472],[-7.052, -76.590],[-7.131, -76.649],[-6.810, -76.575],[-7.023, -76.466]],
        'El Dorado': [[-6.725, -76.695],[-6.614, -76.695],[-6.514, -76.741],[-6.746, -76.624],[-6.528, -76.720]],
        'Huallaga': [[-6.765, -76.814],[-7.022, -76.723],[-6.981, -76.769],[-7.070, -76.714],[-6.937, -76.772],[-7.092, -76.641]],
        'Lamas': [[-6.356, -76.775],[-6.252, -76.033],[-6.331, -76.284],[-6.511, -76.482],[-6.424, -76.523],[-6.379, -76.604],[-6.449, -76.472],[-6.386, -76.439],[-6.412, -76.594],[-6.389, -76.634],[-6.530, -76.494]],
        'Mariscal Cáceres': [[-7.483, -76.650],[-7.317, -76.777],[-7.177, -76.724],[-7.298, -76.773],[-7.177, -76.689]],
        'Moyobamba': [[-6.030, -77.067],[-6.080, -77.091],[-6.108, -76.915],[-6.035, -76.974],[-6.139, -77.103],[-5.974, -77.021]],
        'Picota': [[-6.792, -76.328],[-6.956, -76.419],[-6.920, -76.330],[-6.777, -76.292],[-6.849, -76.341],[-6.992, -76.418],[-7.004, -76.439],[-7.024, -76.133],[-6.936, -76.254],[-6.806, -76.232]],
        'Rioja': [[-5.816, -77.383],[-5.987, -77.278],[-5.936, -77.307],[-5.739, -77.504],[-6.013, -77.162],[-6.063, -77.168],[-5.902, -77.269],[-6.139, -77.144],[-5.931, -77.226]],
        'San Martín': [[-6.663, -76.287],[-6.462, -76.451],[-6.574, -76.138],[-6.354, -75.741],[-6.212, -75.801],[-6.418, -75.768],[-6.584, -76.331],[-6.490, -76.341],[-6.479, -76.383],[-6.245, -75.791],[-6.409, -76.407],[-6.691, -76.217],[-6.580, -76.262],[-6.489, -76.360]],
        'Tocache': [[-8.451, -76.326],[-7.908, -76.668],[-8.352, -76.730],[-8.188, -76.509],[-8.458, -76.462]]
    },
    'Tacna': {
        'Candarave': [[-17.285, -70.364],[-17.242, -70.388],[-17.268, -70.250],[-17.381, -70.335],[-17.314, -70.323],[-17.318, -70.259]],
        'Jorge Basadre': [[-17.418, -70.513],[-17.862, -70.966],[-17.614, -70.763]],
        'Tacna': [[-17.993, -70.248],[-17.943, -70.188],[-17.982, -70.238],[-18.043, -70.252],[-17.794, -70.495],[-18.286, -70.439],[-17.896, -70.154],[-17.778, -69.960],[-17.997, -70.226],[-17.863, -70.560],[-18.002, -70.252]],
        'Tarata': [[-17.542, -70.018],[-17.539, -70.031],[-17.481, -70.123],[-17.375, -70.134],[-17.348, -70.134],[-17.475, -70.032],[-17.526, -70.032],[-17.447, -70.047]]
    },
    'Tumbes': {
        'Contralmirante Villar': [[-3.951, -80.940],[-3.942, -80.651],[-3.678, -80.668]],
        'Tumbes': [[-3.601, -80.481],[-3.637, -80.590],[-3.693, -80.439],[-3.641, -80.445],[-3.628, -80.434],[-3.571, -80.459]],
        'Zarumilla': [[-3.482, -80.245],[-3.682, -80.200],[-3.571, -80.235],[-3.501, -80.276]]
    },
    'Ucayali': {
        'Atalaya': [[-10.730, -73.755],[-11.137, -73.046],[-10.031, -73.956],[-9.531, -72.760]],
        'Coronel Portillo': [[-8.368, -74.543],[-8.472, -74.805],[-9.306, -74.436],[-8.400, -74.541],[-8.605, -74.306],[-8.321, -74.851],[-8.356, -74.576]],
        'Padre Abad': [[-8.828, -75.051],[-8.433, -75.148],[-8.829, -75.213],[-8.640, -74.964],[-9.034, -75.507]],
        'Purús': [[-9.772, -70.710]]
    }
};
