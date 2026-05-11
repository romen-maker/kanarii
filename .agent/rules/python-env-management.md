---
trigger: always_on
---

# Gestión de Entorno Python y Dependencias

> Asegurar que el entorno de ejecución Python sea consistente (siempre `.venv`) y que las dependencias sean reproducibles (`requirements.txt` actualizado).

## Reglas

1.  **Mandato de Entorno Virtual (`.venv`)**:
    - **SIEMPRE** activar o referenciar explícitamente el binario del entorno virtual al ejecutar comandos Python.
    - Preferir: `source .venv/bin/activate && python script.py` o `.venv/bin/python script.py`.
    - **NUNCA** ejecutar `python` o `pip` directamente contra el entorno global del sistema (a menos que sea explícitamente requerido por una herramienta del sistema, lo cual es raro).

2.  **Persistencia de Dependencias (Context-Aware)**:
    - **Identificar Alcance**: Antes de guardar, verifica si estás en la raíz o en un sub-servicio (ej: `services/rag-haystack`).
    - **Actualizar el Archivo Correcto**:
        - Si es core/agentes: `requirements.txt` (raíz).
        - Si es servicio aislado: `services/[nombre]/requirements.txt`.
    - **Regla**: Si instalas un paquete, el siguiente paso OBLIGATORIO es verificar y actualizar el `requirements.txt` **correspondiente al directorio activo**.

## Ejemplos

- ✅ **Correcto**:
  ```bash
  # Instalación
  .venv/bin/pip install pandas
  .venv/bin/pip freeze | grep pandas >> requirements.txt
  
  # Ejecución
  .venv/bin/python scripts/analytics.py
  ```

- ❌ **Incorrecto**:
  ```bash
  pip install pandas  # Error: Instala en global o user space
  python app.py       # Error: Puede usar python del sistema
  # (Se olvida actualizar requirements.txt)
  ```

## Excepciones
- Scripts de inicialización de entorno (que crean el venv).
- Herramientas globales explícitamente solicitadas por el usuario (ej: `pipx`).
