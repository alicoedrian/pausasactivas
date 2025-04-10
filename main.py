import os
from plistlib import InvalidFileException
from flask import Flask, flash, jsonify, redirect, render_template, request, url_for
import openpyxl
import requests
import pandas as pd
from flask import session
from flask import Flask, send_file
from PIL import Image
import io

app = Flask(__name__)
app.secret_key = 'Contraseñ4'


API_URL = "https://centralusdtapp73.epicorsaas.com/SaaS5333/api/v1/BaqSvc/HMP_PausasActivas(ALICO)"
TOKEN = "aW50ZWdyYXRpb246cjUwJEsyOHZhSUZpWXhhWQ==" 



def get_headers(token):
    headers = {
        'Authorization': f'Basic {token}',
        'Content-Type': 'application/json'
    }
    return headers


def get_employee_by_id(id_carnet):
    url = f"{API_URL}?Carnet={id_carnet}"
    headers = get_headers(TOKEN)
    
    try:
        respuesta = requests.get(url, headers=headers)
        if respuesta.status_code == 200:
            data = respuesta.json()
            if 'value' in data and len(data['value']) > 0:
                return data['value'][0]  
            else:
                return None 
        else:
            print(f"Error en la consulta. Código de estado: {respuesta.status_code}")
            return None
    except Exception as e:
        print(f"Error al realizar la petición: {e}")
        return None

def get_employee_by_id_empleado(employee_id):
    API_URL_EMPLOYEE_ID = "https://centralusdtapp73.epicorsaas.com/SaaS5333/api/v1/BaqSvc/HMP_PausasActivasID(ALICO)/"
    url = f"{API_URL_EMPLOYEE_ID}?ID={employee_id}"  # Usamos la nueva API
    headers = get_headers(TOKEN)

    try:
        respuesta = requests.get(url, headers=headers)
        if respuesta.status_code == 200:
            data = respuesta.json()
            if 'value' in data and len(data['value']) > 0:
                return data['value'][0]  # Retorna los datos del primer empleado encontrado
            else:
                return None  # No se encontró el empleado
        else:
            print(f"Error en la consulta por ID de empleado. Código de estado: {respuesta.status_code}")
            return None
    except Exception as e:
        print(f"Error al realizar la petición: {e}")
        return None



@app.route('/', methods=['GET', 'POST'])
def index():
    empleado = None
    fecha_pausa = None
    consulta_realizada = False

    if request.method == 'POST':
        if 'guardar' in request.form:  # Si se hizo clic en "Guardar Datos"
            empleado_id = request.form.get('empleado_id')
            nombre = request.form.get('nombre')
            fecha_pausa = request.form.get('fecha_pausa')
            departamento = request.form.get('departamento', 'Desconocido')
            pausas_realizadas = request.form.get('pausas_realizadas', 'No')
            tiempo_sesion = int(request.form.get('tiempo_sesion_segundos', 0) or 0)

            guardar_en_excel(empleado_id, nombre, fecha_pausa, departamento, pausas_realizadas,int(tiempo_sesion))
            flash("Datos guardados exitosamente en el archivo Excel.", "success")
            return redirect(url_for('exito'))

        elif 'id_carnet' in request.form or 'id_empleado' in request.form:  # Si se hizo clic en "Consultar"
            id_carnet = request.form.get('id_carnet')
            id_empleado = request.form.get('id_empleado')
            fecha_pausa = request.form.get('fecha_pausa')

            # Determinar qué tipo de búsqueda realizar
            if id_carnet:
                empleado = get_employee_by_id(id_carnet)  # Usa la API de Carnet
            elif id_empleado:
                empleado = get_employee_by_id_empleado(id_empleado)  # Usa la nueva API de ID

            if empleado:  # Si se encuentra un empleado
                session['empleado'] = {
                    'id': empleado['EmpBasic_EmpID'],
                    'nombre': empleado['EmpBasic_Name'],
                    'departamento': empleado['EmpBasic_JCDept']
                }
                session['fecha_pausa'] = fecha_pausa
                consulta_realizada = True
                flash("INGRESA A UNA DE LAS PAUSAS ACTIVAS", "info")
            else:
                flash("No se encontraron datos del empleado. Consultar en gestión humana.", "warning")

    return render_template(
        'index.html',
        empleado=empleado,
        consulta_realizada=consulta_realizada,
        fecha_pausa=fecha_pausa
    )


def guardar_en_excel(empleado_id, nombre, fecha_pausa, departamento, pausas_realizadas, tiempo_sesion_segundos=0, hora_inicio="", hora_fin=""):
    ruta_archivo = 'pausas_activas.xlsx'

    try:
        if not os.path.exists(ruta_archivo):
            workbook = openpyxl.Workbook()
            hoja = workbook.active
            hoja.title = "Pausas Activas"
            hoja.append([
                "Empleado ID", "Nombre", "Fecha Pausa", 
                "Departamento", "Realizó Pausas", 
                "Hora Inicio", "Hora Fin", "Duración (segundos)"
            ])
            workbook.save(ruta_archivo)

        workbook = openpyxl.load_workbook(ruta_archivo)
        hoja = workbook.active
        hoja.append([
            empleado_id, nombre, fecha_pausa,
            departamento, pausas_realizadas,
            hora_inicio, hora_fin, tiempo_sesion_segundos
        ])
        workbook.save(ruta_archivo)

    except Exception as e:
        print(f"Error al guardar en Excel: {e}")
        raise

    finally:
        if 'workbook' in locals():
            workbook.close()



@app.route('/pausa-mentales', methods=['GET', 'POST'])
def pausa_mentales():
    empleado = session.get('empleado')
    fecha_pausa = session.get('fecha_pausa')
    hora_inicio = request.form.get('hora_inicio', '')
    hora_fin = request.form.get('hora_fin', '')

    if request.method == 'POST':
        empleado_id = empleado['id']
        nombre = empleado['nombre']
        departamento = empleado['departamento']
        pausas_realizadas = request.form.get('pausas_realizadas', 'No')
        tiempo_sesion = int(request.form.get('tiempo_sesion_segundos', 0) or 0)

        guardar_en_excel(
            empleado_id, nombre, fecha_pausa, departamento,
            pausas_realizadas, tiempo_sesion, hora_inicio, hora_fin)

        flash("Datos guardados exitosamente en el archivo Excel.", "success")
        return redirect(url_for('exito'))
    
    return render_template('pausa-mentales.html', empleado=empleado)


@app.route('/pausa-mental-sopa-letras', methods=['GET', 'POST'])
def pausa_mental_sopaletras():
    empleado = session.get('empleado')
    fecha_pausa = session.get('fecha_pausa')
    hora_inicio = request.form.get('hora_inicio', '')
    hora_fin = request.form.get('hora_fin', '')
    #departamento = session.get('departamento')
    if request.method == 'POST':
        empleado_id = empleado['id']
        nombre = empleado['nombre']
        departamento = empleado['departamento']
        pausas_realizadas = request.form.get('pausas_realizadas', 'No')
        tiempo_sesion = int(request.form.get('tiempo_sesion_segundos', 0) or 0)

        print("Empleado ID:", empleado_id)
        print("Nombre:", nombre)
        print("Departamento:", departamento)
        print("Fecha de pausa:", fecha_pausa)
        print("Pausas realizadas:", pausas_realizadas)
        
        guardar_en_excel(
        empleado_id, nombre, fecha_pausa, departamento,
        pausas_realizadas, tiempo_sesion, hora_inicio, hora_fin)
        flash("Datos guardados exitosamente en el archivo Excel.", "success")
        return redirect(url_for('exito'))
    
    return render_template('pausa-mental-sopa-letras.html', empleado=empleado)

@app.route('/pausa-mental-rompecabezas' , methods=['GET', 'POST'])
def rompecabezas():
    empleado = session.get('empleado')
    fecha_pausa = session.get('fecha_pausa')
    hora_inicio = request.form.get('hora_inicio', '')
    hora_fin = request.form.get('hora_fin', '')
    #departamento = session.get('departamento')
    if request.method == 'POST':
        empleado_id = empleado['id']
        nombre = empleado['nombre']
        departamento = empleado['departamento']
        pausas_realizadas = request.form.get('pausas_realizadas', 'No')
        tiempo_sesion = int(request.form.get('tiempo_sesion_segundos', 0) or 0)

        guardar_en_excel(
        empleado_id, nombre, fecha_pausa, departamento,
        pausas_realizadas, tiempo_sesion, hora_inicio, hora_fin)
        flash("Datos guardados exitosamente en el archivo Excel.", "success")
        return redirect(url_for('exito'))
    
    return render_template('pausa-mental-rompecabezas.html', empleado=empleado)



@app.route('/exito', methods=['GET', 'POST'])
def exito():
    empleado = session.get('empleado')
    return render_template('exito.html', empleado=empleado)


@app.route('/pausa-corporales', methods=['GET', 'POST'])
def pausa_corporales():
    empleado = session.get('empleado')
    fecha_pausa = session.get('fecha_pausa')
    hora_inicio = request.form.get('hora_inicio', '')
    hora_fin = request.form.get('hora_fin', '')

    #departamento = session.get('departamento')
    if request.method == 'POST':
        empleado_id = empleado['id']
        nombre = empleado['nombre']
        departamento = empleado['departamento']
        pausas_realizadas = request.form.get('pausas_realizadas', 'No')
        tiempo_sesion = int(request.form.get('tiempo_sesion_segundos', 0) or 0)

        print("Empleado ID:", empleado_id)
        print("Nombre:", nombre)
        print("Departamento:", departamento)
        print("Fecha de pausa:", fecha_pausa)
        print("Pausas realizadas:", pausas_realizadas)

        guardar_en_excel(
        empleado_id, nombre, fecha_pausa, departamento,
        pausas_realizadas, tiempo_sesion, hora_inicio, hora_fin)
        flash("Datos guardados exitosamente en el archivo Excel.", "success")
        return redirect(url_for('exito'))

    return render_template('pausa-corporales.html', empleado=empleado)


@app.route('/static/images/optimized-image.jpg')
def get_optimized_image():
    image_path = "static/images/LOGOS-WEB-02.jpg"  # Ruta de la imagen original

    # Redimensionar la imagen antes de enviarla
    with Image.open(image_path) as img:
        img = img.convert("RGB")  # Asegurar formato compatible
        img.thumbnail((800, 800))  # Redimensionar manteniendo la proporción

        img_io = io.BytesIO()
        img.save(img_io, "JPEG", quality=80)  # Guardar en un buffer con calidad optimizada
        img_io.seek(0)
        
        return send_file(img_io, mimetype="image/jpeg")
    

@app.route('/memorama', methods=['GET', 'POST'])
def pausa_mental_memorama():
    empleado = session.get('empleado')
    fecha_pausa = session.get('fecha_pausa')
    hora_inicio = request.form.get('hora_inicio', '')
    hora_fin = request.form.get('hora_fin', '')

    if request.method == 'POST':
        empleado_id = empleado['id']
        nombre = empleado['nombre']
        departamento = empleado['departamento']
        pausas_realizadas = request.form.get('pausas_realizadas', 'No')
        tiempo_sesion = int(request.form.get('tiempo_sesion_segundos', 0) or 0)

        guardar_en_excel(
        empleado_id, nombre, fecha_pausa, departamento,
        pausas_realizadas, tiempo_sesion, hora_inicio, hora_fin)
        flash("Datos guardados exitosamente en el archivo Excel.", "success")
        return redirect(url_for('exito'))
    return render_template('memorama.html', empleado=empleado)


@app.route('/pausa-videos', methods=['GET', 'POST'])
def pausa_videos():
    empleado = session.get('empleado')
    fecha_pausa = session.get('fecha_pausa')
    hora_inicio = request.form.get('hora_inicio', '')
    hora_fin = request.form.get('hora_fin', '')

    if request.method == 'POST':
        empleado_id = empleado['id']
        nombre = empleado['nombre']
        departamento = empleado['departamento']
        pausas_realizadas = request.form.get('pausas_realizadas', 'No')
        tiempo_sesion = int(request.form.get('tiempo_sesion_segundos', 0) or 0)

        guardar_en_excel(
        empleado_id, nombre, fecha_pausa, departamento,
        pausas_realizadas, tiempo_sesion, hora_inicio, hora_fin)
        flash("Datos guardados exitosamente en el archivo Excel.", "success")
        return redirect(url_for('exito'))
    return render_template('pausa-videos.html', empleado=empleado)


if __name__ == "__main__":
    app.run(debug=True)
