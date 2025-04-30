class GeoImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeoImportError';
  }
}

class GdalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GdalError';
  }
}

export { GeoImportError, GdalError };
