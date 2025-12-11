/**
 * Utilidades para generar imágenes específicas de inmuebles
 */

export interface ImageConfig {
  width: number;
  height: number;
  seed?: string | number;
}

/**
 * IDs específicos de Picsum curados manualmente para imágenes de inmuebles
 * Estos IDs han sido verificados y son apropiados para propiedades
 * Nota: Las hipotecas no usan imágenes, solo SVG específico
 */
const CURATED_PICSUM_IDS = {
  rental: [78, 299, 409, 625, 859], // Apartamentos en alquiler
  realEstate: [299, 445, 939, 1059, 437] // Propiedades en venta
};

/**
 * Función principal para obtener imágenes específicas de inmuebles usando Picsum curado
 */
export function getPropertyImageByType(
  propertyType: string,
  propertyId: string | number,
  config: ImageConfig = { width: 400, height: 300 }
): string {
  const { width, height } = config;
  
  // Para hipotecas, no mostrar imagen, usar SVG específico
  if (propertyType === 'mortgage') {
    return getTypedFallbackImage(propertyType, config);
  }
  
  // Obtener array de IDs curados para el tipo de propiedad
  const imageIds = CURATED_PICSUM_IDS[propertyType as keyof typeof CURATED_PICSUM_IDS] || 
                   CURATED_PICSUM_IDS.rental;
  
  // Usar el propertyId para seleccionar consistentemente la misma imagen
  const hash = Math.abs(propertyId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const selectedImageId = imageIds[hash % imageIds.length];
  
  return `https://picsum.photos/id/${selectedImageId}/${width}/${height}`;
}

/**
 * Función alternativa usando todos los IDs proporcionados
 */
export function getAllCuratedImages(
  propertyId: string | number,
  config: ImageConfig = { width: 400, height: 300 }
): string {
  const { width, height } = config;
  
  // Todos los IDs curados que proporcionaste
  const allCuratedIds = [78, 299, 409, 437, 445, 625, 859, 939, 1059];
  
  // Usar el propertyId para seleccionar consistentemente la misma imagen
  const hash = Math.abs(propertyId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const selectedImageId = allCuratedIds[hash % allCuratedIds.length];
  
  return `https://picsum.photos/id/${selectedImageId}/${width}/${height}`;
}

/**
 * Función mejorada con múltiples términos para mayor especificidad
 */
export function getEnhancedPropertyImage(
  propertyType: string,
  propertyId: string | number,
  config: ImageConfig = { width: 400, height: 300 }
): string {
  // Usar la función principal que ya tiene imágenes curadas
  return getPropertyImageByType(propertyType, propertyId, config);
}

/**
 * Función de respaldo usando los IDs curados como alternativa
 */
export function getArchitectureImage(
  _propertyType: string,
  propertyId: string | number,
  config: ImageConfig = { width: 400, height: 300 }
): string {
  // Usar la función con todos los IDs curados como respaldo
  return getAllCuratedImages(propertyId, config);
}

/**
 * Imagen SVG de respaldo específica por tipo con mejor diseño
 */
export function getTypedFallbackImage(
  propertyType: string,
  config: ImageConfig = { width: 400, height: 300 }
): string {
  const { width, height } = config;
  
  const configs = {
    rental: { 
      color: '#2196F3', 
      bgColor: '#E3F2FD',
      icon: '🏠', 
      label: 'Apartamento en Alquiler',
      pattern: 'M20,20 L380,20 L380,180 L20,180 Z M60,60 L160,60 L160,120 L60,120 Z M220,60 L340,60 L340,120 L220,120 Z'
    },
    mortgage: { 
      color: '#4CAF50', 
      bgColor: '#E8F5E8',
      icon: '🏦', 
      label: 'Casa Familiar',
      pattern: 'M200,40 L360,120 L360,160 L280,160 L280,120 L240,120 L240,160 L160,160 L160,120 L40,120 Z'
    },
    realEstate: { 
      color: '#FF9800', 
      bgColor: '#FFF3E0',
      icon: '🏢', 
      label: 'Propiedad Premium',
      pattern: 'M50,50 L150,30 L250,50 L350,30 L350,170 L280,170 L280,130 L240,130 L240,170 L160,170 L160,130 L120,130 L120,170 L50,170 Z'
    }
  };
  
  const { color, bgColor, icon, label, pattern } = configs[propertyType as keyof typeof configs] || 
    { color: '#757575', bgColor: '#F5F5F5', icon: '🏘️', label: 'Propiedad', pattern: 'M50,50 L350,50 L350,150 L50,150 Z' };
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color}20;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <path d="${pattern}" fill="${color}" opacity="0.3"/>
      <text x="50%" y="30%" text-anchor="middle" font-size="48">${icon}</text>
      <text x="50%" y="80%" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="500" fill="${color}">
        ${label}
      </text>
    </svg>
  `)}`;
}

/**
 * Imagen de respaldo genérica mejorada
 */
export function getDefaultPropertyImage(config: ImageConfig = { width: 400, height: 300 }): string {
  const { width, height } = config;
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#E3F2FD;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#BBDEFB;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#defaultGrad)"/>
      <circle cx="${width/2}" cy="${height/2-30}" r="40" fill="#1976D2" opacity="0.8"/>
      <path d="M${width/2-20} ${height/2-20}L${width/2} ${height/2-35}L${width/2+20} ${height/2-20}V${height/2}H${width/2-20}Z" 
            fill="white"/>
      <text x="50%" y="${height/2+50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="500" fill="#1976D2">
        Imagen no disponible
      </text>
    </svg>
  `)}`;
}

/**
 * Función principal recomendada con fallback robusto usando IDs curados
 */
export function getRealEstateImage(
  propertyType: string,
  propertyId: string | number,
  config: ImageConfig = { width: 400, height: 300 }
): string {
  try {
    // Prioridad: IDs curados por tipo -> Todos los IDs curados -> SVG fallback
    return getPropertyImageByType(propertyType, propertyId, config);
  } catch (error) {
    try {
      return getAllCuratedImages(propertyId, config);
    } catch (fallbackError) {
      return getTypedFallbackImage(propertyType, config);
    }
  }
}