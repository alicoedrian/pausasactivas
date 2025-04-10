from PIL import Image

# Cargar la imagen original
ruta_original = "static/images/orgulloso.png"
imagen = Image.open(ruta_original)

# Escalar a una mayor resolución manteniendo la proporción
nueva_resolucion = (1920, 1080)  # Ajusta según necesidad
imagen = imagen.resize(nueva_resolucion, Image.LANCZOS)

# Guardar la nueva imagen con mejor calidad
ruta_nueva = "static/images/orgulloso.png"
imagen.save(ruta_nueva, quality=95)  # Ajusta el quality a 95 para menos compresión
