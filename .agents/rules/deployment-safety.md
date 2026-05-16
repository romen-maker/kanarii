# Deployment Safety & Stability

> Reglas para evitar regresiones y crashes en despliegues a producción (Docker/Coolify).

## 1. Zero-Conn Import Policy (Lazy Init)
**Regla**: NUNCA inicializar conexiones a Bases de Datos, APIs externas o cargas de Modelos Pesados en el nivel superior (`module level`) de un archivo Python.

- ❌ **Mal**:
  ```python
  # main.py
  db = PostgresClient.connect()  # Crashea si DB no está lista en 5s
  llm = Model.load("gpt-4")      # Crashea por timeout en VPS pequeño
  ```

- ✅ **Bien**:
  ```python
  # main.py
  db = None

  @app.on_event("startup")
  async def startup():
      global db
      db = await PostgresClient.connect()
  ```

## 2. Config File Safety (Robust Loading)
**Regla**: NUNCA asumir que un archivo de configuración existe o es un archivo. Siempre validar antes de abrir.

- ❌ **Mal**: `with open("config.yaml") as f:` (Crashea si es directorio o no existe)
- ✅ **Bien**: `if os.path.isfile(path): ...`

## 3. Immutable Production Volumes
**Regla**: En `docker-compose.yml`, NUNCA montar código fuente (`./app:/app`) en el servicio de producción.
- Esto provoca "Shadowing": el código del host (posiblemente roto/antiguo) oculta el código de la imagen (testeado).
- Solo montar `/app/config` o `/app/data`.

## 4. SSH & Debugging
- Si hay un Crash Loop, no adivinar. Usar la habilidad `remote-admin` para ver logs reales: `docker logs <container>`.
- Si `docker logs` no muestra nada (porque reinicia muy rápido), usar: `docker run --rm -it <imagen> python -c "import app.main"` para replicar el error.
