// Sistema de validación de palabras reales para el juego STOP
export type Category = "lugar" | "animal" | "nombre" | "comida" | "color" | "objeto" | "marca" | "frutaoverdura";

// Diccionario completo A-Z con palabras válidas por categoría
const VALID_WORDS: Record<string, Record<Category, string[]>> = {
  "A": {
    "lugar": ["Argentina", "Australia", "Alemania", "Austria", "Angola", "Albania", "Argelia", "Armenia", "Afganistán", "Arabia"],
    "animal": ["Araña", "Avestruz", "Águila", "Ardilla", "Alacrán", "Abeja", "Antílope", "Anaconda", "Albatros", "Alpaca"],
    "nombre": ["Ana", "Alberto", "Antonio", "Adriana", "Alejandro", "Andrea", "Andrés", "Alicia", "Alfonso", "Amanda"],
    "comida": ["Arroz", "Aguacate", "Avena", "Ajo", "Aceitunas", "Apio", "Atún", "Azúcar", "Almendras", "Anchoas"],
    "color": ["Azul", "Ámbar", "Amarillo", "Anaranjado", "Aguamarina", "Añil", "Azulejo", "Almendra", "Avellana", "Azul marino"],
    "objeto": ["Armario", "Avión", "Anillo", "Alfombra", "Abanico", "Agenda", "Antena", "Automóvil", "Ancla", "Acuario"],
    "marca": ["Adidas", "Audi", "Apple", "Amazon", "Acer", "Asus", "Armani", "Avon", "Ariel", "American Express"],
    "frutaoverdura": ["Aguacate", "Ajo", "Albaricoque", "Almendra", "Anacardo", "Apio", "Arándano", "Acelga"]
  },
  "B": {
    "lugar": ["Bolivia", "Brasil", "Bélgica", "Bahamas", "Bulgaria", "Bangladés", "Birmania", "Bielorrusia", "Botswana", "Barcelona"],
    "animal": ["Ballena", "Buey", "Búfalo", "Burro", "Bisonte", "Babosa", "Boa", "Besugo", "Babuino", "Buitre"],
    "nombre": ["Beatriz", "Bruno", "Benjamín", "Belén", "Borja", "Bárbara", "Bernardo", "Blanca", "Bautista", "Berenice"],
    "comida": ["Berenjenas", "Bananas", "Batatas", "Boniato", "Bacalao", "Brócoli", "Betabel", "Bizcocho", "Bulgur", "Berros"],
    "color": ["Blanco", "Beige", "Burdeos", "Bronce", "Bermellón", "Blanco hueso", "Blanco perla", "Bizantino", "Bosque", "Borgoña"],
    "objeto": ["Bolígrafo", "Bombilla", "Balón", "Botella", "Banco", "Bicicleta", "Botón", "Brocha", "Báscula", "Balde"],
    "marca": ["BMW", "Bic", "Bose", "Burberry", "Benetton", "Bridgestone", "Bugatti", "Barbie", "Bosch", "Bimba y Lola"],
    "frutaoverdura": ["Banana", "Brócoli", "Berenjena", "Boniato", "Betabel", "Berro"]
  },
  "C": {
    "lugar": ["Colombia", "Chile", "China", "Canadá", "Cuba", "Corea", "Croacia", "Chipre", "Camerún", "Costa Rica"],
    "animal": ["Caballo", "Conejo", "Cabra", "Ciervo", "Cocodrilo", "Cangrejo", "Caracol", "Cebra", "Cobra", "Cóndor"],
    "nombre": ["Carlos", "Carmen", "Cristina", "César", "Clara", "Camilo", "Carla", "Claudia", "Cristian", "Catalina"],
    "comida": ["Carne", "Cebollas", "Calabaza", "Café", "Chocolate", "Cerezas", "Canela", "Calabacín", "Camarones", "Coco"],
    "color": ["Café", "Celeste", "Coral", "Cobre", "Crema", "Carmesí", "Cian", "Caoba", "Canela", "Cereza"],
    "objeto": ["Casa", "Coche", "Computadora", "Cama", "Cámara", "Celular", "Cocina", "Cuaderno", "Cuchillo", "Copa"],
    "marca": ["Coca-Cola", "Chanel", "Cartier", "Canon", "Chevrolet", "Casio", "Calvin Klein", "Converse", "Champion", "Chrysler"],
    "frutaoverdura": ["Calabaza", "Cebolla", "Cereza", "Ciruela", "Coco", "Coliflor", "Castaña"]
  },
  "D": {
    "lugar": ["Dinamarca", "Detroit", "Dubai", "Dublín", "Dallas", "Delhi", "Dresden", "Damasco", "Durango", "Doha"],
    "animal": ["Delfín", "Dinosaurio", "Dragón", "Dálmata", "Dromedario", "Dingo", "Doberman", "Dorado", "Dugongo", "Danta"],
    "nombre": ["Daniel", "Diana", "Diego", "Daniela", "David", "Dolores", "Domingo", "Delia", "Darío", "Débora"],
    "comida": ["Durazno", "Dulce", "Dátil", "Donut", "Dumpling", "Dorada", "Damasco", "Dip", "Dona", "Daiquiri"],
    "color": ["Dorado", "Durazno", "Damasco", "Dulce", "Denim", "Doradillo", "Duraznal", "Diamante", "Dulcero", "Dulzón"],
    "objeto": ["Dado", "Disco", "Diamante", "Dinero", "Diente", "Diccionario", "Detector", "Drone", "Dulcero", "Ducha"],
    "marca": ["Dior", "Disney", "Dell", "Dove", "Durex", "Dunlop", "Ducati", "Diesel", "Dr. Martens", "Dolce & Gabbana"],
    "frutaoverdura": ["Dátil", "Durián", "Damasco"]
  },
  "E": {
    "lugar": ["España", "Ecuador", "Egipto", "Estonia", "Etiopía", "Europa", "Estocolmo", "Edimburgo", "Everest", "Escocia"],
    "animal": ["Elefante", "Escorpión", "Erizo", "Estrella", "Escarabajo", "Emu", "Equidna", "Estornino", "Esturión", "Emú"],
    "nombre": ["Eduardo", "Elena", "Enrique", "Esperanza", "Esteban", "Estela", "Emilio", "Emma", "Edgar", "Elvira"],
    "comida": ["Empanada", "Espinaca", "Espárragos", "Ensalada", "Escabeche", "Estofado", "Elote", "Enchilada", "Esquite", "Edamame"],
    "color": ["Esmeralda", "Escarlata", "Ébano", "Espuma", "Encarnado", "Escarcha", "Eléctrico", "Espectral", "Esmalte", "Eucalipto"],
    "objeto": ["Espejo", "Escritorio", "Escalera", "Espada", "Envelope", "Estuche", "Estufa", "Escoba", "Estante", "Engrapadora"],
    "marca": ["Epson", "Emporio Armani", "EA Sports", "Everlast", "EasyJet", "Electrolux", "Etihad Airways", "ExxonMobil", "Estée Lauder", "Esso"],
    "frutaoverdura": ["Espinaca", "Espárrago", "Elote", "Endivia", "Escarola"]
  },
  "F": {
    "lugar": ["Francia", "Finlandia", "Filipinas", "Florida", "Florencia", "Frankfurt", "Fiji", "Fez", "Fukuoka", "Fortaleza"],
    "animal": ["Foca", "Flamenco", "Faisán", "Felino", "Focena", "Falcón", "Fúlica", "Furnárido", "Fragata", "Fregatidae"],
    "nombre": ["Fernando", "Fernanda", "Francisco", "Fabiola", "Federico", "Francisca", "Felipe", "Fátima", "Fabián", "Flora"],
    "comida": ["Frijoles", "Fresas", "Fideos", "Flan", "Filete", "Falafel", "Frambuesas", "Fondue", "Focaccia", "Fajitas"],
    "color": ["Fucsia", "Fresa", "Frambuesa", "Fuego", "Fúlgido", "Fulvo", "Ferruginoso", "Fluorescente", "Fúnebre", "Fosforescente"],
    "objeto": ["Foco", "Fotografía", "Flauta", "Florero", "Frasco", "Frigorífico", "Falda", "Fuente", "Filtro", "Fósforo"],
    "marca": ["Ford", "Ferrari", "Facebook", "Fila", "Fanta", "Fujifilm", "Firestone", "Fendi", "Fossil", "Fortnite"],
    "frutaoverdura": ["Fresa", "Frambuesa", "Fríjol", "Faba"]
  }
};

// Función para validar si una palabra es real
export function validateWord(word: string, category: Category, letter: string): boolean {
  if (!word || !word.trim()) return false;
  
  const normalizedWord = word.trim();
  const normalizedLetter = letter.toUpperCase();
  
  // Verificar que empiece con la letra correcta
  if (!normalizedWord.toUpperCase().startsWith(normalizedLetter)) {
    return false;
  }
  
  // Verificar si la palabra está en nuestro diccionario
  const letterDict = VALID_WORDS[normalizedLetter];
  if (!letterDict) return false;
  
  const categoryWords = letterDict[category];
  if (!categoryWords) return false;
  
  // Buscar coincidencia exacta (sin importar mayúsculas/minúsculas)
  return categoryWords.some(validWord => 
    validWord.toLowerCase() === normalizedWord.toLowerCase()
  );
}

// Función para obtener sugerencias de palabras válidas
export function getWordSuggestions(category: Category, letter: string, limit: number = 5): string[] {
  const normalizedLetter = letter.toUpperCase();
  const letterDict = VALID_WORDS[normalizedLetter];
  
  if (!letterDict || !letterDict[category]) return [];
  
  return letterDict[category].slice(0, limit);
}

// Función para verificar si una letra tiene palabras disponibles
export function hasWordsForLetter(letter: string): boolean {
  return VALID_WORDS[letter.toUpperCase()] !== undefined;
}
