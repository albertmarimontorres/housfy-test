import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealEstateService, getRealEstateProperties, getRealEstateProperty, formatPrice, formatAddress, getStatusLabel, getStatusColor } from '@/services/real-estate.service';
import { realEstateApi } from '@/api/modules/real-estate.api';
import { formatAddress as baseFormatAddress, formatPropertyPrice, getStatusConfig } from '@/services/property.service';
import type { RealEstateResponse, RealEstateFilters } from '@/types/Property';

// Mock de la API
vi.mock('@/api/modules/real-estate.api');
// Mock del servicio base de propiedades
vi.mock('@/services/property.service');

describe('Real Estate Service', () => {
  let mockRealEstateApi: any;
  let mockPropertyService: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock de realEstateApi
    mockRealEstateApi = vi.mocked(realEstateApi);

    // Mock del servicio de propiedades base - directamente las funciones mockeadas
    mockPropertyService = {
      formatAddress: vi.mocked(baseFormatAddress),
      formatPropertyPrice: vi.mocked(formatPropertyPrice),
      getStatusConfig: vi.mocked(getStatusConfig)
    };

    // Configuración por defecto para getStatusConfig
    mockPropertyService.getStatusConfig.mockImplementation((status: string, _type: string) => ({
      label: status === 'Publicado' ? 'Disponible' : status,
      color: status === 'Publicado' ? 'green' : 'blue'
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProperties', () => {
    describe('casos de éxito', () => {
      it('debería obtener propiedades exitosamente sin filtros', async () => {
        // Arrange
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'Propiedades obtenidas correctamente',
          properties: [
            {
              uuid: '123e4567-e89b-12d3-a456-426614174000',
              propertyStreet: 'Calle Mayor',
              propertyStreetNumber: 123,
              propertyFloor: 2,
              status: 'Publicado',
              propertyPriceMinUnit: 250000,
              last_status_changed_at: '2023-01-15T10:30:00Z',
              created_at: '2023-01-01T00:00:00Z'
            }
          ]
        };

        mockRealEstateApi.getProperties.mockResolvedValue(mockResponse);

        // Act
        const result = await RealEstateService.getProperties();

        // Assert
        expect(result).toEqual(mockResponse);
        expect(mockRealEstateApi.getProperties).toHaveBeenCalledWith(undefined);
        expect(mockRealEstateApi.getProperties).toHaveBeenCalledTimes(1);
      });

      it('debería obtener propiedades con filtros', async () => {
        // Arrange
        const filters: RealEstateFilters = {
          status: 'Publicado',
          minPrice: 200000,
          maxPrice: 500000
        };

        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'Propiedades filtradas',
          properties: []
        };

        mockRealEstateApi.getProperties.mockResolvedValue(mockResponse);

        // Act
        const result = await RealEstateService.getProperties(filters);

        // Assert
        expect(result).toEqual(mockResponse);
        expect(mockRealEstateApi.getProperties).toHaveBeenCalledWith(filters);
      });

      it('debería manejar respuesta exitosa vacía', async () => {
        // Arrange
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'No hay propiedades disponibles',
          properties: []
        };

        mockRealEstateApi.getProperties.mockResolvedValue(mockResponse);

        // Act
        const result = await RealEstateService.getProperties();

        // Assert
        expect(result).toEqual(mockResponse);
        expect(result.properties).toHaveLength(0);
      });
    });

    describe('casos de error', () => {
      it('debería re-lanzar errores conocidos de API', async () => {
        // Arrange
        const apiError = new Error('Error de conexión');
        mockRealEstateApi.getProperties.mockRejectedValue(apiError);

        // Act & Assert
        await expect(RealEstateService.getProperties()).rejects.toThrow('Error de conexión');
        expect(mockRealEstateApi.getProperties).toHaveBeenCalled();
      });

      it('debería transformar errores desconocidos', async () => {
        // Arrange
        const unknownError = 'string error';
        mockRealEstateApi.getProperties.mockRejectedValue(unknownError);

        // Act & Assert
        await expect(RealEstateService.getProperties()).rejects.toThrow('Error desconocido al obtener las propiedades inmobiliarias');
      });

      it('debería manejar error null/undefined', async () => {
        // Arrange
        mockRealEstateApi.getProperties.mockRejectedValue(null);

        // Act & Assert
        await expect(RealEstateService.getProperties()).rejects.toThrow('Error desconocido al obtener las propiedades inmobiliarias');
      });
    });

    describe('casos edge', () => {
      it('debería manejar múltiples llamadas concurrentes', async () => {
        // Arrange
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'OK',
          properties: []
        };

        mockRealEstateApi.getProperties.mockResolvedValue(mockResponse);

        // Act
        const promises = [
          RealEstateService.getProperties(),
          RealEstateService.getProperties({ status: 'Publicado' }),
          RealEstateService.getProperties({ minPrice: 100000 })
        ];

        const results = await Promise.all(promises);

        // Assert
        expect(results).toHaveLength(3);
        results.forEach(result => {
          expect(result).toEqual(mockResponse);
        });
        expect(mockRealEstateApi.getProperties).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('getPropertyById', () => {
    describe('casos de validación', () => {
      it('debería validar UUID requerido', async () => {
        // Act & Assert
        await expect(RealEstateService.getPropertyById('')).rejects.toThrow('UUID de la propiedad es requerido');
      });

      it('debería validar UUID no es solo espacios', async () => {
        // Act & Assert
        await expect(RealEstateService.getPropertyById('   ')).rejects.toThrow('UUID de la propiedad es requerido');
      });

      it('debería validar formato de UUID', async () => {
        // Act & Assert
        await expect(RealEstateService.getPropertyById('invalid-uuid')).rejects.toThrow('UUID de la propiedad no tiene un formato válido');
      });

      it('debería validar UUID con formato correcto pero inválido', async () => {
        // Act & Assert
        await expect(RealEstateService.getPropertyById('12345678-1234-1234-1234-123456789012')).rejects.toThrow('UUID de la propiedad no tiene un formato válido');
      });

      it('debería aceptar UUID válido pero lanzar error de no implementado', async () => {
        // Arrange
        const validUUID = '123e4567-e89b-12d3-a456-426614174000';

        // Act & Assert
        await expect(RealEstateService.getPropertyById(validUUID)).rejects.toThrow('Endpoint para obtener propiedad por ID no está implementado');
      });

      it('debería aceptar diferentes variantes de UUID válidos', async () => {
        // Arrange
        const validUUIDs = [
          '123e4567-e89b-12d3-a456-426614174000',
          'A1B2C3D4-E5F6-1234-8901-ABCDEF123456',
          '00000000-0000-1000-8000-000000000000'
        ];

        // Act & Assert
        for (const uuid of validUUIDs) {
          await expect(RealEstateService.getPropertyById(uuid)).rejects.toThrow('Endpoint para obtener propiedad por ID no está implementado');
        }
      });
    });

    describe('edge cases', () => {
      it('debería manejar UUID con espacios al inicio y final', async () => {
        // Arrange
        const uuidWithSpaces = '  123e4567-e89b-12d3-a456-426614174000  ';

        // Act & Assert
        await expect(RealEstateService.getPropertyById(uuidWithSpaces)).rejects.toThrow('Endpoint para obtener propiedad por ID no está implementado');
      });

      it('debería rechazar UUID con caracteres especiales', async () => {
        // Act & Assert
        await expect(RealEstateService.getPropertyById('123e4567-e89b-12d3-a456-426614174000!')).rejects.toThrow('UUID de la propiedad no tiene un formato válido');
      });
    });
  });

  describe('formatPrice', () => {
    beforeEach(() => {
      mockPropertyService.formatPropertyPrice.mockReturnValue('€250.000');
    });

    describe('casos de éxito', () => {
      it('debería formatear precio positivo', () => {
        // Act
        const result = formatPrice(250000);

        // Assert
        expect(result).toBe('€250.000');
        expect(mockPropertyService.formatPropertyPrice).toHaveBeenCalledWith(250000, 'sale');
      });

      it('debería formatear precio cero', () => {
        // Arrange
        mockPropertyService.formatPropertyPrice.mockReturnValue('€0');

        // Act
        const result = formatPrice(0);

        // Assert
        expect(result).toBe('€0');
        expect(mockPropertyService.formatPropertyPrice).toHaveBeenCalledWith(0, 'sale');
      });

      it('debería formatear precios grandes', () => {
        // Arrange
        mockPropertyService.formatPropertyPrice.mockReturnValue('€1.250.000');

        // Act
        const result = formatPrice(1250000);

        // Assert
        expect(result).toBe('€1.250.000');
        expect(mockPropertyService.formatPropertyPrice).toHaveBeenCalledWith(1250000, 'sale');
      });
    });

    describe('casos de error', () => {
      it('debería fallar con precio negativo', () => {
        // Act & Assert
        expect(() => formatPrice(-1000)).toThrow('El precio debe ser un número positivo');
      });

      it('debería fallar con valor no numérico', () => {
        // Act & Assert
        expect(() => formatPrice('250000' as any)).toThrow('El precio debe ser un número positivo');
      });

      it('debería fallar con NaN', () => {
        // Act & Assert
        expect(() => formatPrice(NaN)).toThrow('El precio debe ser un número positivo');
      });

      it('debería fallar con Infinity', () => {
        // Act & Assert
        expect(() => formatPrice(Infinity)).toThrow('El precio debe ser un número positivo');
      });
    });
  });

  describe('formatAddress', () => {
    beforeEach(() => {
      mockPropertyService.formatAddress.mockReturnValue('Calle Mayor, 123, 2º');
    });

    it('debería usar formatAddress del servicio base', () => {
      // Arrange
      const street = 'Calle Mayor';
      const number = 123;

      // Act
      const result = formatAddress(street, number);

      // Assert
      expect(result).toBe('Calle Mayor, 123, 2º');
      expect(mockPropertyService.formatAddress).toHaveBeenCalledWith(street, number);
    });
  });

  describe('getStatusLabel', () => {
    beforeEach(() => {
      mockPropertyService.getStatusConfig.mockReturnValue({
        label: 'Disponible',
        color: 'green'
      });
    });

    describe('casos de éxito', () => {
      it('debería obtener label de estado válido', () => {
        // Act
        const result = getStatusLabel('Publicado');

        // Assert
        expect(result).toBe('Disponible');
        expect(mockPropertyService.getStatusConfig).toHaveBeenCalledWith('Publicado', 'realEstate');
      });

      it('debería manejar estados con espacios', () => {
        // Arrange
        mockPropertyService.getStatusConfig.mockReturnValue({
          label: 'Oferta Recibida',
          color: 'orange'
        });

        // Act
        const result = getStatusLabel('Oferta recibida');

        // Assert
        expect(result).toBe('Oferta Recibida');
        expect(mockPropertyService.getStatusConfig).toHaveBeenCalledWith('Oferta recibida', 'realEstate');
      });
    });

    describe('casos de error', () => {
      it('debería manejar estado vacío', () => {
        // Act
        const result = getStatusLabel('');

        // Assert
        expect(result).toBe('Estado desconocido');
        expect(mockPropertyService.getStatusConfig).not.toHaveBeenCalled();
      });

      it('debería manejar estado con solo espacios', () => {
        // Act
        const result = getStatusLabel('   ');

        // Assert
        expect(result).toBe('Estado desconocido');
        expect(mockPropertyService.getStatusConfig).not.toHaveBeenCalled();
      });

      it('debería manejar valor no string', () => {
        // Act
        const result = getStatusLabel(null as any);

        // Assert
        expect(result).toBe('Estado desconocido');
        expect(mockPropertyService.getStatusConfig).not.toHaveBeenCalled();
      });
    });
  });

  describe('getStatusColor', () => {
    beforeEach(() => {
      mockPropertyService.getStatusConfig.mockReturnValue({
        label: 'Disponible',
        color: 'green'
      });
    });

    describe('casos de éxito', () => {
      it('debería obtener color de estado válido', () => {
        // Act
        const result = getStatusColor('Publicado');

        // Assert
        expect(result).toBe('green');
        expect(mockPropertyService.getStatusConfig).toHaveBeenCalledWith('Publicado', 'realEstate');
      });

      it('debería obtener colores diferentes para estados diferentes', () => {
        // Arrange
        mockPropertyService.getStatusConfig
          .mockReturnValueOnce({ label: 'Disponible', color: 'green' })
          .mockReturnValueOnce({ label: 'Reservado', color: 'red' });

        // Act
        const greenResult = getStatusColor('Publicado');
        const redResult = getStatusColor('Reservado');

        // Assert
        expect(greenResult).toBe('green');
        expect(redResult).toBe('red');
      });
    });

    describe('casos de error', () => {
      it('debería retornar grey para estado vacío', () => {
        // Act
        const result = getStatusColor('');

        // Assert
        expect(result).toBe('grey');
        expect(mockPropertyService.getStatusConfig).not.toHaveBeenCalled();
      });

      it('debería retornar grey para estado con solo espacios', () => {
        // Act
        const result = getStatusColor('   ');

        // Assert
        expect(result).toBe('grey');
        expect(mockPropertyService.getStatusConfig).not.toHaveBeenCalled();
      });

      it('debería retornar grey para valor no string', () => {
        // Act
        const result = getStatusColor(undefined as any);

        // Assert
        expect(result).toBe('grey');
        expect(mockPropertyService.getStatusConfig).not.toHaveBeenCalled();
      });
    });
  });

  describe('exportaciones de compatibilidad', () => {
    it('debería exportar getRealEstateProperties como alias', () => {
      // Assert
      expect(getRealEstateProperties).toBe(RealEstateService.getProperties);
      expect(typeof getRealEstateProperties).toBe('function');
    });

    it('debería exportar getRealEstateProperty como alias', () => {
      // Assert
      expect(getRealEstateProperty).toBe(RealEstateService.getPropertyById);
      expect(typeof getRealEstateProperty).toBe('function');
    });
  });

  describe('estructura del servicio', () => {
    it('debería tener todos los métodos definidos', () => {
      // Assert
      expect(RealEstateService.getProperties).toBeDefined();
      expect(RealEstateService.getPropertyById).toBeDefined();
      expect(typeof RealEstateService.getProperties).toBe('function');
      expect(typeof RealEstateService.getPropertyById).toBe('function');
    });

    it('debería exportar todas las funciones helper', () => {
      // Assert
      expect(formatPrice).toBeDefined();
      expect(formatAddress).toBeDefined();
      expect(getStatusLabel).toBeDefined();
      expect(getStatusColor).toBeDefined();
      
      expect(typeof formatPrice).toBe('function');
      expect(typeof formatAddress).toBe('function');
      expect(typeof getStatusLabel).toBe('function');
      expect(typeof getStatusColor).toBe('function');
    });
  });
});