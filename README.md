<header>
    <h1>Minimarket La Esquina</h1>
    <p>Este proyecto fue creado para la 4ta evaluación de proyecto de integración, es un proyecto creado con django (BackEnd) y React (FrontEnd) con las funcionalidades para el funcionamiento del minimarket la esquina</p>
  </header>
    <h2>2. Instalación BackEnd</h2>
    <p>Pasos para instalar el proyecto localmente:</p>
    <pre><code># Se clona el repositorio y se ingresa a la carpeta
    git clone https://github.com/Benjarod/Proyecto_LaEsquina.git
    cd Proyecto_LaEsquina
  </code></pre>
  <hr/>
    <pre><code># Se crea el entorno virtual (hay que tener python instalado en el equipo)
    python -m venv env
  </code></pre>
  <hr/>
    <pre><code># Se inicia el entorno virtual
    .\env\Scripts\activate
  </code></pre>
  <hr/>
    <pre><code># Se instalan las librerias necesarias especificadas en el archivo "requeriments.txt"
    pip install -r requirements.txt
  </code></pre>
  <hr/>
    <pre><code># se sealizan las migraciones
    python manage.py migrate
  </code></pre>
    <hr/>
    <pre><code># Se Inicia el proyecto
    python manage.py runserver
  </code></pre>
  <hr/>
  <h2>3. Instalación FrontEnd</h2>
  <pre><code># Se ingresa a la carpeta "frontend" e instalamos lo de npm necesario
      cd frontend
      npm install
  </code></pre>
  <hr/>
  <pre><code># Iniciamos el frontend
      npm start
  </code></pre>
  <hr/>
</body>
</html>
