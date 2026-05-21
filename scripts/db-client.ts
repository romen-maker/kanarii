import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'gen-lang-client-0601258149';
const DATABASE_ID = 'ai-studio-fb5ef2e1-c472-43e5-bb6a-51f1141b0793';
const CONFIG_PATH = path.join(process.env.HOME || '', '.config/configstore/firebase-tools.json');

let cachedToken: string | null = null;

/**
 * Lee el token de autenticación de Firebase CLI desde el archivo de configuración de firebase-tools.
 */
export function getAccessToken(): string {
    if (cachedToken) return cachedToken;
    if (!fs.existsSync(CONFIG_PATH)) {
        throw new Error(`No se encontró el archivo de configuración de Firebase en: ${CONFIG_PATH}. Ejecuta 'firebase login' para autenticarte.`);
    }
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    cachedToken = config.tokens?.access_token;
    if (!cachedToken) {
        throw new Error(`El archivo de configuración de Firebase existe pero no contiene un token de acceso válido. Por favor, vuelve a autenticarte con 'firebase login'.`);
    }
    return cachedToken;
}

/**
 * Ejecuta una llamada curl GET autenticada a la API REST de Firestore.
 */
export function runCurl(url: string): any {
    const token = getAccessToken();
    const cmd = `curl -s -X GET "${url}" -H "Authorization: Bearer ${token}"`;
    const output = execSync(cmd).toString();
    return JSON.parse(output);
}

/**
 * Resuelve recursivamente un campo de Firestore REST en su valor Javascript plano.
 */
export function parseField(field: any): any {
    if (!field || typeof field !== 'object') return field;
    
    if ('stringValue' in field) return field.stringValue;
    if ('booleanValue' in field) return field.booleanValue;
    if ('integerValue' in field) return parseInt(field.integerValue, 10);
    if ('doubleValue' in field) return parseFloat(field.doubleValue);
    if ('timestampValue' in field) return field.timestampValue;
    if ('nullValue' in field) return null;
    if ('referenceValue' in field) return field.referenceValue;
    if ('geoPointValue' in field) return field.geoPointValue;
    
    if ('arrayValue' in field) {
        const values = field.arrayValue?.values || [];
        return values.map((v: any) => parseField(v));
    }
    
    if ('mapValue' in field) {
        const fields = field.mapValue?.fields || {};
        const result: any = {};
        for (const key of Object.keys(fields)) {
            result[key] = parseField(fields[key]);
        }
        return result;
    }
    
    return field;
}

/**
 * Convierte un documento retornado por la API REST de Firestore en un objeto plano JS.
 * El ID del documento se expone en la propiedad '_id' y la ruta completa en '_path'.
 */
export function parseDocument(doc: any): any {
    if (!doc || !doc.name) return null;
    const fields = doc.fields || {};
    const result: any = {
        _id: doc.name.split('/').pop(),
        _path: doc.name
    };
    for (const key of Object.keys(fields)) {
        result[key] = parseField(fields[key]);
    }
    return result;
}

/**
 * Obtiene todos los documentos de una colección de forma recursiva/paginada.
 * Maneja automáticamente el token de paginación si hay más de 100 documentos.
 */
export function getDocuments(collection: string): any[] {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;
    const url = `${baseUrl}/${collection}?pageSize=100`;
    let allDocs: any[] = [];
    let nextPageToken: string | null = null;

    do {
        const fetchUrl = nextPageToken ? `${url}&pageToken=${nextPageToken}` : url;
        const response = runCurl(fetchUrl);
        
        if (response.error) {
            // Si la colección no existe o está vacía, a veces retorna NOT_FOUND o similar.
            if (response.error.status === 'NOT_FOUND') {
                return [];
            }
            throw new Error(`Error en API Firestore (${collection}): ${JSON.stringify(response.error)}`);
        }
        
        const docs = response.documents || [];
        allDocs = allDocs.concat(docs.map(parseDocument).filter(Boolean));
        nextPageToken = response.nextPageToken || null;
    } while (nextPageToken);

    return allDocs;
}

/**
 * Obtiene un único documento por su colección e ID.
 * Retorna null si no existe.
 */
export function getDocument(collection: string, docId: string): any | null {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;
    const url = `${baseUrl}/${collection}/${docId}`;
    const response = runCurl(url);
    
    if (response.error) {
        if (response.error.status === 'NOT_FOUND') {
            return null;
        }
        throw new Error(`Error en API Firestore (${collection}/${docId}): ${JSON.stringify(response.error)}`);
    }
    
    return parseDocument(response);
}

/**
 * Actualiza parcialmente un documento de Firestore utilizando la API REST PATCH.
 * Aplica una máscara de actualización (updateMask) para modificar solo los campos especificados.
 */
export function patchDocument(collection: string, docId: string, fields: any, fieldPaths: string[]): any {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;
    const maskParams = fieldPaths.map(p => `updateMask.fieldPaths=${p}`).join('&');
    const url = `${baseUrl}/${collection}/${docId}?${maskParams}`;
    
    const body = { fields };
    const token = getAccessToken();
    
    // Escapar comillas simples en el JSON body para evitar problemas en el comando curl
    const bodyStr = JSON.stringify(body).replace(/'/g, "'\\''");
    const cmd = `curl -s -X PATCH "${url}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${bodyStr}'`;
    
    const output = execSync(cmd).toString();
    const response = JSON.parse(output);
    
    if (response.error) {
        throw new Error(response.error.message || JSON.stringify(response.error));
    }
    
    return parseDocument(response);
}
